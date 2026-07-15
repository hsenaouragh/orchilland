// ─────────────────────────────────────────────────────────────────────────────
// Data-access layer. Every page fetches its own data through these functions
// instead of a shared React context — call them from a useEffect on mount.
//
// Read helpers swallow "missing column" errors (older Supabase schemas) the
// same way the old AppDataContext did, so a partial schema still renders.
// ─────────────────────────────────────────────────────────────────────────────
import { supabase } from '../lib/supabase'
import {
  getCourseByIdFrom,
  normalizeBook,
  normalizeCourse,
} from '../data/siteData'

export { getCourseByIdFrom, normalizeBook, normalizeCourse }

const now = () => new Date().toISOString()

const makeClientId = (prefix) => {
  if (crypto?.randomUUID) return `${prefix}-${crypto.randomUUID()}`
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

const cleanPayload = (payload) =>
  Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined))

const missingColumnFrom = (error) => {
  const message = error?.message || ''
  // Handles PostgREST's several phrasings for an unknown column, e.g.
  //   column courses.language does not exist
  //   column "language" does not exist
  //   'language' column ...
  const patterns = [
    /column\s+(?:[\w]+\.)?"?([a-zA-Z0-9_]+)"?\s+does not exist/i,
    /'([^']+)' column/i,
    /column "([^"]+)"/i,
  ]
  for (const re of patterns) {
    const match = message.match(re)
    if (match?.[1]) return match[1]
  }
  return null
}

const insertRow = async (table, payload, select = '*') => {
  let nextPayload = cleanPayload(payload)

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const { data, error } = await supabase
      .from(table)
      .insert(nextPayload)
      .select(select)
      .single()

    if (!error) return data

    const missingColumn = missingColumnFrom(error)
    if (missingColumn && Object.prototype.hasOwnProperty.call(nextPayload, missingColumn)) {
      const { [missingColumn]: _removed, ...rest } = nextPayload
      nextPayload = rest
      continue
    }

    throw error
  }

  throw new Error(`Could not insert ${table}`)
}

const updateRow = async (table, id, payload, select = '*') => {
  let nextPayload = cleanPayload(payload)

  for (let attempt = 0; attempt < 12; attempt += 1) {
    // maybeSingle() so a 0-row update returns null instead of throwing the opaque
    // "Cannot coerce the result to a single JSON object" PostgREST error.
    const { data, error } = await supabase
      .from(table)
      .update(nextPayload)
      .eq('id', id)
      .select(select)
      .maybeSingle()

    if (!error) {
      if (!data) {
        throw new Error(`No ${table} row was updated — the row is missing or you don't have permission (row-level security).`)
      }
      return data
    }

    const missingColumn = missingColumnFrom(error)
    if (missingColumn && Object.prototype.hasOwnProperty.call(nextPayload, missingColumn)) {
      const { [missingColumn]: _removed, ...rest } = nextPayload
      nextPayload = rest
      continue
    }

    throw error
  }

  throw new Error(`Could not update ${table}`)
}

const removeRow = async (table, id) => {
  // select() returns the deleted rows so we can tell a real delete from one that
  // RLS silently filtered to 0 rows.
  const { data, error } = await supabase.from(table).delete().eq('id', id).select()
  if (error) throw error
  if (!data || data.length === 0) {
    throw new Error(`No ${table} row was deleted — the row is missing or you don't have permission (row-level security).`)
  }
}

const selectRows = async (label, table, columns, configure = query => query) => {
  let nextColumns = [...columns]

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const query = configure(supabase.from(table).select(nextColumns.join(',')))
    const { data, error } = await query

    if (!error) return data || []

    const missingColumn = missingColumnFrom(error)
    if (missingColumn && nextColumns.includes(missingColumn)) {
      nextColumns = nextColumns.filter(column => column !== missingColumn)
      continue
    }

    console.error(`[Supabase] ${label}:`, error.message)
    return []
  }

  return []
}

const groupBy = (rows, key) => rows.reduce((groups, row) => {
  const value = String(row[key])
  if (!groups.has(value)) groups.set(value, [])
  groups.get(value).push(row)
  return groups
}, new Map())

const latestBy = (rows, key, dateKey = 'submitted_at') => {
  const map = new Map()
  rows.forEach(row => {
    const value = String(row[key])
    const current = map.get(value)
    if (!current || new Date(row[dateKey] || 0) > new Date(current[dateKey] || 0)) {
      map.set(value, row)
    }
  })
  return map
}

const getGuestToken = () => {
  const key = 'orchilla_guest_token'
  const existing = localStorage.getItem(key)
  if (existing) return existing

  const token = makeClientId('guest')
  localStorage.setItem(key, token)
  return token
}

const sanitizeFileName = (name = 'receipt') =>
  name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'receipt'

// Uploads a file to the first working bucket in `buckets` and returns its public URL.
const uploadToBucket = async (file, userId, scope, buckets, label = 'File') => {
  if (!file) return { fileName: null, fileUrl: null }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw sessionError

  const authUserId = sessionData.session?.user?.id
  if (!authUserId) throw new Error('You must be logged in to upload a file.')

  const ownerId = authUserId || userId
  const path = `${ownerId}/${scope}-${Date.now()}-${sanitizeFileName(file.name)}`
  const errors = []

  for (const bucket of buckets) {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

    if (!error) {
      const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(data.path)
      return {
        fileName: file.name,
        fileUrl: publicUrl?.publicUrl || null,
        storageBucket: bucket,
        storagePath: data.path,
      }
    }

    errors.push(`${bucket}: ${error.message}`)
  }

  throw new Error(`${label} upload failed. Check the storage bucket and policies. ${errors.join(' | ')}`)
}

// Receipt files live in the "receipts" bucket.
const uploadReceiptFile = (file, userId, scope) =>
  uploadToBucket(file, userId, scope, ['receipts'], 'Receipt')

// Assignment submission files live in the "assignments" bucket.
const uploadSubmissionFile = (file, userId, scope) =>
  uploadToBucket(file, userId, scope, ['assignments', 'submissions', 'assignment-submissions'], 'Submission')

const cleanupReceiptFile = async (uploaded) => {
  if (!uploaded?.storageBucket || !uploaded?.storagePath) return
  const { error } = await supabase.storage.from(uploaded.storageBucket).remove([uploaded.storagePath])
  if (error) console.error('[Supabase] receipt cleanup:', error.message)
}

// ─── Normalizers ─────────────────────────────────────────────────────────────
const normalizePost = (row) => {
  // Posts can hold several images in the `images` array; fall back to the single
  // legacy `image_url`. `images` is always an array for the gallery/carousel.
  const gallery = Array.isArray(row.images) ? row.images.filter(Boolean) : []
  const images = gallery.length ? gallery : (row.image_url ? [row.image_url] : [])
  return {
    id: row.id,
    authorId: row.author_id,
    authorName: row.author_name || 'Orchilland Admin',
    title: row.title || 'Untitled post',
    content: row.content || '',
    images,
    imageUrl: images[0] || null,
    isPublished: row.is_published !== false,
    createdAt: row.created_at || null,
  }
}

const normalizeNotification = (row) => ({
  id: row.id,
  userId: row.user_id,
  title: row.title || 'Notification',
  message: row.message || '',
  type: row.type || 'general',
  relatedType: row.related_type || null,
  relatedId: row.related_id || null,
  readAt: row.read_at || null,
  createdAt: row.created_at || null,
})

const normalizePlacementAttempt = (row) => ({
  id: row.id,
  userId: row.user_id || null,
  guestToken: row.guest_token || null,
  language: row.language || 'Placement test',
  score: row.score || 0,
  total: row.total || null,
  percentage: row.percentage || 0,
  cefr_level: row.cefr_level || 'A1',
  questions: row.questions || [],
  answers: row.answers || {},
  createdAt: row.created_at || null,
})

const buildApplication = (row, courses, receipts) => {
  const course = getCourseByIdFrom(courses, row.course_id)
  const receipt = receipts.find(item =>
    String(item.application_id || '') === String(row.id) ||
    (String(item.course_id || '') === String(row.course_id) && String(item.student_id || '') === String(row.student_id))
  )

  return {
    id: row.id,
    studentId: row.student_id,
    courseId: row.course_id,
    courseTitle: course?.title || 'Course',
    courseColor: course?.color || 'var(--color-accent)',
    amount: receipt?.amount ?? course?.amount ?? 0,
    status: row.status || receipt?.status || 'pending_approval',
    receiptFileName: row.receipt_file_name || (receipt?.receipt_image ? 'receipt image' : (receipt ? 'receipt saved' : null)),
    receiptUrl: row.receipt_url || receipt?.receipt_image || null,
    adminNote: row.admin_note || '',
    studentNote: row.student_note || receipt?.user_note || '',
    createdAt: row.created_at || null,
    reviewedAt: row.reviewed_at || null,
  }
}

const buildBookOrder = (row, books) => {
  const book = books.find(item => String(item.id) === String(row.book_id))
  return {
    id: row.id,
    studentId: row.student_id,
    bookId: row.book_id,
    bookTitle: book?.title || 'Book',
    amount: row.amount ?? book?.price ?? 0,
    receiptFileName: row.receipt_file_name || null,
    receiptUrl: row.receipt_url || null,
    status: row.status || 'pending_approval',
    adminNote: row.admin_note || '',
    createdAt: row.created_at || null,
    reviewedAt: row.reviewed_at || null,
  }
}

const buildEnrollments = ({
  enrollmentRows,
  courses,
  lessons,
  assignments,
  tests,
  questions,
  options,
  submissions,
  attempts,
  answers,
}) => {
  const lessonsByCourse = groupBy(lessons, 'course_id')
  const assignmentsByCourse = groupBy(assignments, 'course_id')
  const testsByCourse = groupBy(tests, 'course_id')
  const questionsByTest = groupBy(questions, 'test_id')
  const optionsByQuestion = groupBy(options, 'question_id')
  const submissionByAssignment = latestBy(submissions, 'assignment_id')
  const attemptByTest = latestBy(attempts, 'test_id')
  const answersByAttempt = groupBy(answers, 'attempt_id')

  return enrollmentRows.map(enrollment => {
    const course = getCourseByIdFrom(courses, enrollment.course_id)
    const courseLessons = (lessonsByCourse.get(String(enrollment.course_id)) || [])
      .map(lesson => ({
        id: lesson.id,
        title: lesson.title || 'Untitled lesson',
        description: lesson.description || '',
        status: lesson.status || 'available',
        releasedAt: lesson.released_at || lesson.created_at || null,
        fileName: lesson.file_name || (lesson.file_url ? lesson.file_url.split('/').pop() : null),
        fileUrl: lesson.file_url || null,
        videoUrl: lesson.video_url || null,
      }))

    const courseAssignments = (assignmentsByCourse.get(String(enrollment.course_id)) || [])
      .map(assignment => {
        const submission = submissionByAssignment.get(String(assignment.id))
        return {
          id: assignment.id,
          title: assignment.title || 'Assignment',
          description: assignment.description || '',
          dueAt: assignment.due_at || assignment.created_at || null,
          status: submission ? 'submitted' : 'available',
          // The assignment file attached by the admin (what the student downloads).
          fileUrl: assignment.file_url || null,
          fileName: assignment.file_name
            || (assignment.file_url ? decodeURIComponent(assignment.file_url.split('/').pop()) : null),
          submissionId: submission?.id || null,
          submissionText: submission?.answer_text || submission?.submission_text || '',
          submissionFileUrl: submission?.file_url || null,
          submissionFileName: submission?.file_url ? decodeURIComponent(String(submission.file_url).split('/').pop()) : null,
          grade: submission?.grade ?? null,
          feedback: submission?.feedback || (submission ? 'Waiting for admin grading.' : ''),
        }
      })

    const courseTests = (testsByCourse.get(String(enrollment.course_id)) || [])
      .map(test => {
        const attempt = attemptByTest.get(String(test.id))
        const attemptAnswers = attempt ? answersByAttempt.get(String(attempt.id)) || [] : []
        const attemptAnswerByQuestion = new Map(attemptAnswers.map(answer => [String(answer.question_id), answer]))
        const testQuestions = (questionsByTest.get(String(test.id)) || []).map(question => {
          const questionOptions = (optionsByQuestion.get(String(question.id)) || [])
          const correctOption = questionOptions.find(option => option.is_correct)
          const answer = attemptAnswerByQuestion.get(String(question.id))
          // MCQ questions get their answer from the flagged option; text/writing
          // questions fall back to the question's own correct_answer column.
          const correctAnswer = correctOption?.option_text || correctOption?.text || question.correct_answer || ''

          return {
            id: question.id,
            question: question.question || question.prompt || '',
            options: questionOptions.map(option => option.option_text || option.text || ''),
            correctAnswer,
            studentAnswer: answer ? (answer.student_answer || answer.answer || (answer.is_correct ? correctAnswer : 'Submitted answer')) : '',
            isCorrect: !!answer?.is_correct,
            points: question.points || 10,
          }
        })

        const totalPoints = attempt?.total_points || test.total_points || testQuestions.reduce((sum, question) => sum + (question.points || 10), 0)

        return {
          id: test.id,
          title: test.title || 'Course test',
          description: test.description || '',
          status: attempt ? 'graded' : 'available',
          score: attempt?.score ?? null,
          totalPoints,
          gradePercent: attempt?.grade_percent ?? null,
          questions: testQuestions,
        }
      })

    // Course grade = average of the graded tests' percentages for this course.
    const gradedTests = courseTests.filter(test => test.status === 'graded' && test.gradePercent != null)
    const courseAverage = gradedTests.length
      ? Math.round(gradedTests.reduce((sum, test) => sum + (test.gradePercent || 0), 0) / gradedTests.length)
      : null

    return {
      id: enrollment.id,
      studentId: enrollment.student_id,
      courseId: enrollment.course_id,
      status: enrollment.status || 'active',
      progressPercent: enrollment.progress_percent ?? 0,
      finalGrade: enrollment.final_grade ?? 0,
      // Live average of this course's graded tests (null when nothing is graded yet).
      courseAverage,
      gradedTestCount: gradedTests.length,
      enrolledAt: enrollment.enrolled_at || null,
      course,
      lessons: courseLessons,
      assignments: courseAssignments,
      tests: courseTests,
    }
  })
}

// ─── Queries (each page calls what it needs) ─────────────────────────────────
export const fetchCourses = async () => {
  const rows = await selectRows('courses', 'courses',
    ['id', 'title', 'language', 'type', 'price', 'level', 'duration', 'duration_weeks', 'students', 'color', 'status', 'description', 'image_url', 'created_at', 'updated_at'],
    query => query.order('created_at', { ascending: false }))
  return rows.map(normalizeCourse)
}

export const fetchBooks = async () => {
  const rows = await selectRows('books', 'books',
    ['id', 'title', 'language', 'price', 'cover_color', 'cover_url', 'status', 'description', 'file_name', 'file_url', 'created_at'],
    query => query.order('created_at', { ascending: false }))
  return rows.map(normalizeBook)
}

export const fetchPosts = async () => {
  const rows = await selectRows('posts', 'posts',
    ['id', 'author_id', 'author_name', 'title', 'content', 'image_url', 'images', 'is_published', 'created_at'],
    query => query.order('created_at', { ascending: false }))
  return rows.map(normalizePost)
}

export const fetchPostLikes = async () => {
  const rows = await selectRows('post_likes', 'post_likes', ['id', 'post_id', 'user_id', 'created_at'])
  return rows.map(row => ({
    id: row.id,
    postId: row.post_id,
    userId: row.user_id,
    createdAt: row.created_at || null,
  }))
}

export const fetchPostComments = async (user) => {
  const rows = await selectRows('post_comments', 'post_comments',
    ['id', 'post_id', 'user_id', 'user_name', 'content', 'parent_id', 'created_at'],
    query => query.order('created_at', { ascending: true }))
  return rows.map(row => ({
    id: row.id,
    postId: row.post_id,
    userId: row.user_id,
    userName: row.user_id === user?.id ? user?.name : (row.user_name || 'Student'),
    content: row.content || '',
    createdAt: row.created_at || null,
  }))
}

export const fetchCourseReviews = async (user) => {
  const rows = await selectRows('course_reviews', 'course_reviews',
    ['id', 'enrollment_id', 'course_id', 'student_id', 'student_name', 'rating', 'comment', 'is_published', 'created_at'],
    query => query.order('created_at', { ascending: false }))
  return rows.map(row => ({
    id: row.id,
    enrollmentId: row.enrollment_id,
    courseId: row.course_id,
    studentId: row.student_id,
    studentName: (row.student_id === user?.id ? user?.name : row.student_name) || row.student_name || 'Student',
    rating: row.rating || 0,
    comment: row.comment || '',
    isPublished: row.is_published !== false,
    createdAt: row.created_at || null,
  }))
}

export const fetchApplications = async (user) => {
  if (!user?.id) return []
  const [applicationRows, receiptRows, courses] = await Promise.all([
    selectRows('course_applications', 'course_applications',
      ['id', 'student_id', 'course_id', 'amount', 'status', 'receipt_file_name', 'receipt_url', 'admin_note', 'student_note', 'created_at', 'reviewed_at'],
      query => query.eq('student_id', user.id).order('created_at', { ascending: false })),
    selectRows('payment_receipts', 'payment_receipts',
      ['id', 'application_id', 'student_id', 'course_id', 'receipt_image', 'amount', 'status', 'user_note', 'uploaded_at', 'reviewed_at', 'reviewed_by'],
      query => query.eq('student_id', user.id)),
    fetchCourses(),
  ])
  return applicationRows.map(row => buildApplication(row, courses, receiptRows))
}

export const fetchBookOrders = async (user) => {
  if (!user?.id) return []
  const [orderRows, books] = await Promise.all([
    selectRows('book_orders', 'book_orders',
      ['id', 'student_id', 'book_id', 'amount', 'receipt_file_name', 'receipt_url', 'status', 'admin_note', 'created_at', 'reviewed_at'],
      query => query.eq('student_id', user.id).order('created_at', { ascending: false })),
    fetchBooks(),
  ])
  return orderRows.map(row => buildBookOrder(row, books))
}

// Lightweight enrollment list (no lessons/assignments/tests) — used by the
// course catalog to know which courses the student is already enrolled in.
export const fetchEnrollmentSummaries = async (user) => {
  if (!user?.id) return []
  const rows = await selectRows('enrollments', 'enrollments',
    ['id', 'student_id', 'course_id', 'status'],
    query => query.eq('student_id', user.id))
  return rows.map(row => ({
    id: row.id,
    studentId: row.student_id,
    courseId: row.course_id,
    status: row.status || 'active',
  }))
}

const CATEGORY_META = {
  best: { label: 'Best value', color: '#6366F1' },
  hot: { label: 'Hot deal', color: '#EF4444' },
  vip: { label: 'VIP', color: '#9333EA' },
}

const normalizeOffer = (row, courses) => {
  const courseIds = Array.isArray(row.course_ids) ? row.course_ids.map(String) : []
  const offerCourses = courseIds.map(id => getCourseByIdFrom(courses, id)).filter(Boolean)
  const category = row.category || 'best'
  const original = Number(row.original_price || 0) || offerCourses.reduce((sum, c) => sum + (c.amount || 0), 0)
  const price = Number(row.price || 0)
  const discountPercent = original > 0 && price > 0 && price < original
    ? Math.round((1 - price / original) * 100)
    : 0
  return {
    id: row.id,
    title: row.title || 'Offer',
    description: row.description || '',
    category,
    categoryLabel: CATEGORY_META[category]?.label || category,
    courseIds,
    courses: offerCourses,
    originalPrice: original,
    price,
    discountPercent,
    imageUrl: row.image_url || null,
    color: row.color || CATEGORY_META[category]?.color || 'var(--color-accent)',
    status: row.status || 'active',
    createdAt: row.created_at || null,
  }
}

export const fetchOffers = async () => {
  const [rows, courses] = await Promise.all([
    selectRows('offers', 'offers',
      ['id', 'title', 'description', 'category', 'course_ids', 'original_price', 'price', 'image_url', 'color', 'status', 'created_at'],
      query => query.order('created_at', { ascending: false })),
    fetchCourses(),
  ])
  return rows.map(row => normalizeOffer(row, courses))
}

// A student's offer claims (payment_receipts rows that carry an offer_id).
export const fetchOfferClaims = async (user) => {
  if (!user?.id) return []
  const rows = await selectRows('payment_receipts', 'payment_receipts',
    ['id', 'offer_id', 'student_id', 'receipt_image', 'amount', 'status', 'uploaded_at'],
    query => query.eq('student_id', user.id))
  return rows.filter(row => row.offer_id).map(row => ({
    id: row.id,
    offerId: row.offer_id,
    status: row.status || 'pending',
    amount: row.amount ?? 0,
    createdAt: row.uploaded_at || null,
  }))
}

// Claim an offer: upload the receipt to the "receipts" bucket and record it in
// payment_receipts with the offer_id (status pending, awaiting admin approval).
export const claimOffer = async ({ offer, student, receiptFile, note }) => {
  const uploaded = await uploadReceiptFile(receiptFile, student.id, `offer-${offer.id}`)
  const row = await insertRow('payment_receipts', {
    offer_id: offer.id,
    student_id: student.id,
    receipt_image: uploaded.fileUrl || null,
    amount: offer.price,
    status: 'pending',
    user_note: note || null,
    uploaded_at: now(),
  })
  try {
    await addNotification({
      userId: student.id,
      title: 'Offer claim submitted',
      message: `${offer.title} is waiting for admin approval.`,
      type: 'payment',
      relatedType: 'offer',
      relatedId: offer.id,
    })
  } catch (err) {
    console.error('[Supabase] notifications:', err.message)
  }
  return { id: row.id, offerId: offer.id, status: row.status || 'pending', amount: offer.price }
}

export const fetchNotifications = async (user) => {
  if (!user?.id) return []
  const rows = await selectRows('notifications', 'notifications',
    ['id', 'user_id', 'title', 'message', 'type', 'related_type', 'related_id', 'read_at', 'created_at'],
    query => query.eq('user_id', user.id).order('created_at', { ascending: false }))
  return rows.map(normalizeNotification)
}

export const fetchPlacementAttempts = async (user) => {
  if (!user?.id) return []
  const rows = await selectRows('placement_attempts', 'placement_attempts',
    ['id', 'user_id', 'guest_token', 'language', 'score', 'total', 'percentage', 'cefr_level', 'questions', 'answers', 'created_at'],
    query => query.eq('user_id', user.id))
  return rows.map(normalizePlacementAttempt)
}

// Full enrollment tree (lessons, assignments, tests + this student's progress).
export const fetchEnrollments = async (user) => {
  if (!user?.id) return []

  const [
    courses,
    lessonRows,
    assignmentRows,
    testRows,
    questionRows,
    optionRows,
  ] = await Promise.all([
    fetchCourses(),
    selectRows('lessons', 'lessons', ['id', 'course_id', 'title', 'description', 'status', 'released_at', 'file_name', 'file_url', 'video_url', 'sort_order', 'created_at'], query => query.order('created_at', { ascending: true })),
    selectRows('assignments', 'assignments', ['id', 'course_id', 'title', 'description', 'due_at', 'status', 'file_name', 'file_url', 'released_at', 'sort_order', 'created_at'], query => query.order('created_at', { ascending: true })),
    selectRows('course_tests', 'course_tests', ['id', 'course_id', 'title', 'description', 'status', 'released_at', 'total_points', 'sort_order', 'created_at'], query => query.order('created_at', { ascending: true })),
    selectRows('course_test_questions', 'course_test_questions', ['id', 'test_id', 'question', 'type', 'correct_answer', 'points', 'sort_order', 'created_at']),
    selectRows('course_test_options', 'course_test_options', ['id', 'question_id', 'option_text', 'is_correct', 'sort_order', 'created_at']),
  ])

  const [enrollmentRows, submissionRows, attemptRows, answerRows] = await Promise.all([
    selectRows('enrollments', 'enrollments', ['id', 'student_id', 'course_id', 'status', 'progress_percent', 'final_grade', 'enrolled_at'], query => query.eq('student_id', user.id).order('enrolled_at', { ascending: false })),
    selectRows('assignment_submissions', 'assignment_submissions', ['id', 'assignment_id', 'enrollment_id', 'student_id', 'answer_text', 'submission_text', 'file_name', 'file_url', 'status', 'grade', 'feedback', 'submitted_at', 'updated_at'], query => query.eq('student_id', user.id)),
    selectRows('course_test_attempts', 'course_test_attempts', ['id', 'test_id', 'enrollment_id', 'student_id', 'status', 'score', 'total_points', 'grade_percent', 'submitted_at', 'created_at'], query => query.eq('student_id', user.id)),
    selectRows('course_test_answers', 'course_test_answers', ['id', 'attempt_id', 'question_id', 'student_answer', 'correct_answer', 'is_correct', 'points_awarded', 'created_at']),
  ])

  const userAttemptIds = new Set(attemptRows.map(row => String(row.id)))
  const userAnswers = answerRows.filter(row => userAttemptIds.has(String(row.attempt_id)))

  return buildEnrollments({
    enrollmentRows,
    courses,
    lessons: lessonRows,
    assignments: assignmentRows,
    tests: testRows,
    questions: questionRows,
    options: optionRows,
    submissions: submissionRows,
    attempts: attemptRows,
    answers: userAnswers,
  })
}

// ─── Mutations ───────────────────────────────────────────────────────────────
export const addNotification = async (notification) => {
  if (!notification.userId) return null
  const row = await insertRow('notifications', {
    user_id: notification.userId,
    title: notification.title,
    message: notification.message,
    type: notification.type || 'general',
    related_type: notification.relatedType || null,
    related_id: notification.relatedId || null,
    read_at: null,
    created_at: now(),
  })
  return normalizeNotification(row)
}

export const createCourseApplication = async ({ course, student, receiptFile, receiptFileName, amount, note }) => {
  // Verify the course still exists before uploading, so a stale course id fails
  // fast with a clear message (and doesn't orphan a file in the receipts bucket)
  // instead of throwing a raw "course_id_fkey" foreign-key violation.
  const { data: liveCourse, error: courseError } = await supabase
    .from('courses').select('id').eq('id', course.id).maybeSingle()
  if (courseError) throw courseError
  if (!liveCourse) {
    throw new Error('This course is no longer available. Please refresh the page and try again.')
  }

  const uploaded = await uploadReceiptFile(receiptFile, student.id, `course-${course.id}`)
  const applicationRow = await insertRow('course_applications', {
    student_id: student.id,
    course_id: course.id,
    status: 'pending_approval',
    amount,
    receipt_file_name: uploaded.fileName || receiptFileName || null,
    receipt_url: uploaded.fileUrl || null,
    student_note: note || '',
    admin_note: '',
    created_at: now(),
    reviewed_at: null,
  })

  let receiptRows = []
  if (amount > 0 || uploaded.fileName || receiptFileName) {
    try {
      const receiptRow = await insertRow('payment_receipts', {
        application_id: applicationRow.id,
        student_id: student.id,
        course_id: course.id,
        // Final Supabase Storage public URL from the "receipts" bucket.
        receipt_image: uploaded.fileUrl || null,
        amount,
        // status is the receipt_status enum: pending | approved | denied
        status: 'pending',
        user_note: note || null,
        uploaded_at: now(),
      })
      receiptRows = [receiptRow]
    } catch (error) {
      await cleanupReceiptFile(uploaded)
      throw error
    }
  }

  const application = buildApplication(applicationRow, [course], receiptRows)
  try {
    await addNotification({
      userId: student.id,
      title: 'Application submitted',
      message: `${course.title} is waiting for admin approval.`,
      type: 'payment',
      relatedType: 'course_application',
      relatedId: applicationRow.id,
    })
  } catch (err) {
    console.error('[Supabase] notifications:', err.message)
  }
  return application
}

export const createBookOrder = async ({ book, student, receiptFile, receiptFileName, amount }) => {
  const uploaded = await uploadReceiptFile(receiptFile, student.id, `book-${book.id}`)
  const row = await insertRow('book_orders', {
    student_id: student.id,
    book_id: book.id,
    status: 'pending_approval',
    amount,
    receipt_file_name: uploaded.fileName || receiptFileName || null,
    receipt_url: uploaded.fileUrl || null,
    created_at: now(),
    reviewed_at: null,
  })

  // Book receipts live in their own table (book_payment_receipts), linked by
  // book_order_id. Store the URL from the "receipts" bucket.
  if (amount > 0 || uploaded.fileName || receiptFileName) {
    try {
      await insertRow('book_payment_receipts', {
        book_order_id: row.id,
        // status is the receipt_status enum: pending | approved | denied
        status: 'pending',
        receipt_file_url: uploaded.fileUrl || null,
        uploaded_at: now(),
      })
    } catch (error) {
      await cleanupReceiptFile(uploaded)
      throw error
    }
  }

  const order = buildBookOrder(row, [book])
  try {
    await addNotification({
      userId: student.id,
      title: 'Book receipt submitted',
      message: `${book.title} is waiting for approval.`,
      type: 'payment',
      relatedType: 'book_order',
      relatedId: row.id,
    })
  } catch (err) {
    console.error('[Supabase] notifications:', err.message)
  }
  return order
}

export const savePlacementAttempt = async (attempt, user) => {
  const finishedAt = attempt.finishedAt || now()
  const row = await insertRow('placement_attempts', {
    user_id: user?.id || null,
    guest_token: user?.id ? null : getGuestToken(),
    language: attempt.language,
    score: attempt.score,
    total: attempt.total,
    percentage: attempt.percentage,
    cefr_level: attempt.cefr_level,
    questions: attempt.questions,
    answers: attempt.answers,
    started_at: attempt.startedAt || finishedAt,
    finished_at: finishedAt,
    created_at: now(),
  })
  return normalizePlacementAttempt(row)
}

export const addComment = async ({ postId, content, user }) => {
  if (!user?.id || !content.trim()) return null
  const row = await insertRow('post_comments', {
    post_id: postId,
    user_id: user.id,
    content: content.trim(),
    created_at: now(),
  })
  return {
    id: row.id,
    postId: row.post_id,
    userId: row.user_id,
    userName: user.name,
    content: row.content,
    createdAt: row.created_at || now(),
  }
}

// Pass the caller's existing like row (if any) so we can toggle without a store.
export const togglePostLike = async ({ postId, user, existingLike }) => {
  if (!user?.id) return { removed: false, like: null }

  if (existingLike) {
    await removeRow('post_likes', existingLike.id)
    return { removed: true, like: null }
  }

  const row = await insertRow('post_likes', {
    post_id: postId,
    user_id: user.id,
    created_at: now(),
  })
  return {
    removed: false,
    like: {
      id: row.id,
      postId: row.post_id,
      userId: row.user_id,
      createdAt: row.created_at || now(),
    },
  }
}

export const addCourseReview = async ({ enrollmentId, courseId, rating, comment, user, existingId }) => {
  if (!user?.id) return null

  const payload = {
    enrollment_id: enrollmentId,
    course_id: courseId,
    student_id: user.id,
    rating,
    comment,
    is_published: true,
    created_at: now(),
  }
  const row = existingId
    ? await updateRow('course_reviews', existingId, payload)
    : await insertRow('course_reviews', payload)

  return {
    id: row.id,
    enrollmentId: row.enrollment_id,
    courseId: row.course_id,
    studentId: row.student_id,
    studentName: user.name,
    rating: row.rating,
    comment: row.comment,
    isPublished: row.is_published !== false,
    createdAt: row.created_at || now(),
  }
}

export const deleteCourseReview = async (id) => {
  await removeRow('course_reviews', id)
}

// A student submits an assignment by writing an answer, uploading a file, or both.
export const submitAssignment = async ({ enrollmentId, assignmentId, answerText, file, submissionId, user }) => {
  if (!user?.id) return null

  const uploaded = file
    ? await uploadSubmissionFile(file, user.id, `assignment-${assignmentId}`)
    : { fileName: null, fileUrl: null }

  const payload = {
    assignment_id: assignmentId,
    enrollment_id: enrollmentId,
    student_id: user.id,
    // Written answer column is `answer_text`.
    answer_text: answerText || null,
    file_url: uploaded.fileUrl || undefined, // keep an existing file if none uploaded
    submitted_at: now(),
  }

  const row = submissionId
    ? await updateRow('assignment_submissions', submissionId, payload)
    : await insertRow('assignment_submissions', payload)

  return {
    id: row.id,
    answerText: row.answer_text || answerText || '',
    fileUrl: row.file_url || uploaded.fileUrl || null,
    fileName: uploaded.fileName || (row.file_url ? decodeURIComponent(String(row.file_url).split('/').pop()) : null),
  }
}

export const submitCourseTest = async ({ enrollmentId, test, answers, user }) => {
  if (!user?.id) return null

  const gradedQuestions = test.questions.map(question => {
    const studentAnswer = answers[question.id] || ''
    const isCorrect = studentAnswer === question.correctAnswer
    return { ...question, studentAnswer, isCorrect }
  })
  const score = gradedQuestions.reduce((sum, question) => sum + (question.isCorrect ? question.points || 10 : 0), 0)
  const totalPoints = gradedQuestions.reduce((sum, question) => sum + (question.points || 10), 0)
  const gradePercent = totalPoints ? Math.round((score / totalPoints) * 100) : 0

  const attempt = await insertRow('course_test_attempts', {
    test_id: test.id,
    enrollment_id: enrollmentId,
    student_id: user.id,
    score,
    total_points: totalPoints,
    grade_percent: gradePercent,
    status: 'graded',
    submitted_at: now(),
  })

  await Promise.all(gradedQuestions.map(question => insertRow('course_test_answers', {
    attempt_id: attempt.id,
    question_id: question.id,
    student_answer: question.studentAnswer,
    correct_answer: question.correctAnswer,
    is_correct: question.isCorrect,
    points_awarded: question.isCorrect ? question.points || 10 : 0,
    created_at: now(),
  })))

  return { gradedQuestions, score, totalPoints, gradePercent }
}

export const markNotificationRead = async (id) => {
  const readAt = now()
  await updateRow('notifications', id, { read_at: readAt })
  return readAt
}
