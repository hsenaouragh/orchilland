import { useMemo, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Headphones,
  Comment,
  FileText,
  TargetDart,
  Clock,
  Check,
  Star,
  StarFill,
  Camera,
  Lock,
  Persons,
  ChartColumn,
  Globe,
  Paperclip,
} from '@gravity-ui/icons'
import { useAuth } from '../hooks/AuthContext'
import { useQuery } from '../hooks/useQuery'
import {
  fetchEnrollments,
  fetchCourseReviews,
  fetchCourses,
  submitAssignment,
  addCourseReview,
  deleteCourseReview,
} from '../services/db'
import { LANDMARK_IMAGES } from '../data/siteData'

// Lesson row icons based on sequence or type
const LESSON_ICONS = [BookOpen, Headphones, Comment, FileText]

const CourseLearn = () => {
  const { courseId } = useParams()
  const { user, openAuth } = useAuth()
  const navigate = useNavigate()

  const { data, loading, setData } = useQuery(async () => {
    if (!user?.id) return { enrollments: [], courseReviews: [], courses: [] }
    const [enrollments, courseReviews, courses] = await Promise.all([
      fetchEnrollments(user), fetchCourseReviews(user), fetchCourses(),
    ])
    return { enrollments, courseReviews, courses }
  }, [user?.id], { enrollments: [], courseReviews: [], courses: [] })

  const { enrollments, courseReviews, courses } = data

  // State management
  const [lessonFilter, setLessonFilter] = useState('all') // 'all' | 'completed' | 'in_progress' | 'not_started'
  const [openAssignmentId, setOpenAssignmentId] = useState(null)
  const [assignmentText, setAssignmentText] = useState({})
  const [assignmentFile, setAssignmentFile] = useState({})
  const [assignmentError, setAssignmentError] = useState('')
  const [review, setReview] = useState({ rating: 5, comment: '' })
  const [hoverRating, setHoverRating] = useState(0)
  const [reviewError, setReviewError] = useState('')
  const [editingReview, setEditingReview] = useState(false)

  const enrollment = useMemo(() => enrollments.find(item =>
    item.studentId === user?.id && String(item.courseId) === String(courseId) && item.status === 'active'
  ), [courseId, enrollments, user?.id])

  const course = enrollment?.course || courses.find(item => String(item.id) === String(courseId))
  const existingReview = courseReviews.find(item => item.enrollmentId === enrollment?.id && item.studentId === user?.id)

  // Calculate course progress percentage from completed lessons
  const progressPercent = useMemo(() => {
    if (!enrollment?.lessons || enrollment.lessons.length === 0) return 0
    const completed = enrollment.lessons.filter(l => l.status === 'completed').length
    const total = enrollment.lessons.length
    return total > 0 ? Math.round((completed / total) * 100) : 0
  }, [enrollment?.lessons])

  // Filter lessons based on active tab
  const filteredLessons = useMemo(() => {
    if (!enrollment?.lessons) return []
    if (lessonFilter === 'all') return enrollment.lessons
    if (lessonFilter === 'completed') return enrollment.lessons.filter(l => l.status === 'completed')
    if (lessonFilter === 'in_progress') return enrollment.lessons.filter(l => l.status === 'available' || l.status === 'in_progress')
    if (lessonFilter === 'not_started') return enrollment.lessons.filter(l => l.status === 'locked' || l.status === 'not_started')
    return enrollment.lessons
  }, [enrollment?.lessons, lessonFilter])

  // Landmark visual for hero
  const landmark = course?.landmark || (course?.lang && LANDMARK_IMAGES[course.lang]) || LANDMARK_IMAGES.French

  // ── Authentication & Loading Guards ──────────────────────────────────────────
  if (!user) {
    return (
      <main className='max-w-xl mx-auto px-4 py-24 text-center'>
        <div className='bg-white dark:bg-[#3D2020] rounded-3xl p-10 border border-[var(--color-border)] shadow-xl'>
          <div className='w-16 h-16 rounded-full bg-[var(--color-accent-faint)] flex items-center justify-center mx-auto mb-4 text-[var(--color-primary)]'>
            <Lock style={{ width: 28, height: 28 }} />
          </div>
          <h1 className='text-2xl font-extrabold text-[var(--color-text)] mb-2'>Log In Required</h1>
          <p className='text-sm text-[var(--color-text-muted)] mb-6'>
            Only registered and enrolled students can access course materials and lessons.
          </p>
          <button
            onClick={() => openAuth()}
            className='px-8 py-3 rounded-full bg-[var(--color-primary)] text-white text-sm font-bold shadow-lg hover:bg-[var(--color-primary-hover)] transition-all'
          >
            Log In to Continue
          </button>
        </div>
      </main>
    )
  }

  if (loading) {
    return (
      <main className='max-w-6xl mx-auto px-4 py-24 text-center'>
        <div className='animate-pulse space-y-6 max-w-xl mx-auto'>
          <div className='h-48 bg-white dark:bg-[#3D2020] rounded-3xl border border-[var(--color-border)]' />
          <div className='h-8 bg-gray-200 dark:bg-gray-800 rounded-full w-1/2 mx-auto' />
          <p className='text-sm font-semibold text-[var(--color-text-muted)]'>Loading course workspace...</p>
        </div>
      </main>
    )
  }

  if (!enrollment || !course) {
    return (
      <main className='max-w-xl mx-auto px-4 py-24 text-center'>
        <div className='bg-white dark:bg-[#3D2020] rounded-3xl p-10 border border-[var(--color-border)] shadow-xl'>
          <div className='w-16 h-16 rounded-full bg-[var(--color-accent-faint)] flex items-center justify-center mx-auto mb-4 text-[var(--color-primary)]'>
            <Lock style={{ width: 28, height: 28 }} />
          </div>
          <h1 className='text-2xl font-extrabold text-[var(--color-text)] mb-2'>Course Access Locked</h1>
          <p className='text-sm text-[var(--color-text-muted)] mb-6 leading-relaxed'>
            You do not currently have an active enrollment for this course. Access unlocks once your payment receipt is reviewed and approved.
          </p>
          <Link
            to='/student/dashboard'
            className='inline-flex px-8 py-3 rounded-full bg-[var(--color-primary)] text-white text-sm font-bold shadow-lg hover:bg-[var(--color-primary-hover)] transition-all'
          >
            Back to Dashboard
          </Link>
        </div>
      </main>
    )
  }

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const submitReview = async () => {
    if (!review.comment.trim()) return
    setReviewError('')
    try {
      const created = await addCourseReview({
        enrollmentId: enrollment.id,
        courseId: course.id,
        rating: Number(review.rating),
        comment: review.comment,
        user,
        existingId: existingReview?.id,
      })
      if (created) {
        setData(prev => ({
          ...prev,
          courseReviews: [created, ...prev.courseReviews.filter(item => item.id !== created.id)],
        }))
        setEditingReview(false)
        setReview({ rating: 5, comment: '' })
      }
    } catch (error) {
      setReviewError(error.message || 'Could not submit review')
    }
  }

  const startEditReview = () => {
    if (!existingReview) return
    setReview({ rating: existingReview.rating, comment: existingReview.comment })
    setReviewError('')
    setEditingReview(true)
  }

  const cancelEditReview = () => {
    setEditingReview(false)
    setReview({ rating: 5, comment: '' })
    setReviewError('')
  }

  const deleteReview = async () => {
    if (!existingReview) return
    setReviewError('')
    try {
      await deleteCourseReview(existingReview.id)
      setData(prev => ({
        ...prev,
        courseReviews: prev.courseReviews.filter(item => item.id !== existingReview.id),
      }))
      setEditingReview(false)
      setReview({ rating: 5, comment: '' })
    } catch (error) {
      setReviewError(error.message || 'Could not delete review')
    }
  }

  const handleSubmitAssignment = async (assignment) => {
    const answerText = (assignmentText[assignment.id] || '').trim()
    const file = assignmentFile[assignment.id] || null
    setAssignmentError('')
    if (!answerText && !file) {
      setAssignmentError('Write your answer or attach a file before submitting.')
      return
    }
    try {
      const result = await submitAssignment({
        enrollmentId: enrollment.id,
        assignmentId: assignment.id,
        answerText,
        file,
        submissionId: assignment.submissionId,
        user,
      })
      setData(prev => ({
        ...prev,
        enrollments: prev.enrollments.map(item => item.id !== enrollment.id ? item : {
          ...item,
          assignments: item.assignments.map(next => next.id === assignment.id
            ? {
                ...next,
                status: 'submitted',
                submissionId: result?.id || next.submissionId,
                submissionText: result?.answerText ?? answerText,
                submissionFileUrl: result?.fileUrl ?? next.submissionFileUrl,
                submissionFileName: result?.fileName ?? next.submissionFileName,
                feedback: 'Waiting for instructor review & grading.',
              }
            : next),
        }),
      }))
      setAssignmentFile(prev => ({ ...prev, [assignment.id]: null }))
      setAssignmentText(prev => ({ ...prev, [assignment.id]: '' }))
      setOpenAssignmentId(null)
    } catch (error) {
      setAssignmentError(error.message || 'Could not submit assignment')
    }
  }

  const scrollToLessons = () => {
    document.getElementById('lessons-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main className='px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 py-6'>
      {/* ── 1. COURSE HERO BANNER ────────────────────────────────────────── */}
      <section className='relative rounded-[32px] overflow-hidden border border-[var(--color-border)] shadow-sm bg-gradient-to-r from-[#FFF0EE] via-[#FFF9F5] to-[#FBE8E8] dark:from-[#3D2020] dark:via-[#341A1A] dark:to-[#2A1515] p-6 sm:p-10 lg:p-12 transition-colors'>
        {/* Back Link */}
        <div className='mb-4'>
          <Link
            to='/courses'
            className='inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-text-muted)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-accent)] transition-colors'
          >
            <ArrowLeft style={{ width: 14, height: 14 }} />
            <span>Back to courses</span>
          </Link>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-center'>
          {/* Left Hero Details */}
          <div className='lg:col-span-7 space-y-5'>
            {/* Flag + Language · Level Pill */}
            <div className='inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-[#2A1515]/90 backdrop-blur-sm border border-[var(--color-border)] shadow-sm'>
              {course.flag && (
                <img src={course.flag} alt={course.lang} className='w-4 h-4 object-contain rounded-full' />
              )}
              <span className='text-xs font-bold text-[var(--color-primary)] dark:text-[var(--color-accent)]'>
                {course.lang} · {course.level || 'A1'}
              </span>
            </div>

            {/* Course Title */}
            <h1 className='text-3xl sm:text-5xl font-black text-[var(--color-text)] tracking-tight leading-tight'>
              {course.title}
            </h1>

            {/* Description */}
            <p className='text-xs sm:text-sm text-[var(--color-text-body)] leading-relaxed max-w-xl'>
              {course.description || 'Start your language journey with the basics. Learn essential vocabulary, grammar and everyday conversational expressions.'}
            </p>

            {/* Info Metrics Row */}
            <div className='flex flex-wrap items-center gap-5 sm:gap-8 pt-1 text-xs text-[var(--color-text-muted)] font-semibold'>
              <div className='flex items-center gap-2'>
                <Clock style={{ width: 16, height: 16, color: 'var(--color-primary)' }} />
                <span>{course.duration || '12–48 weeks'}</span>
              </div>
              <div className='flex items-center gap-2'>
                <Persons style={{ width: 16, height: 16, color: 'var(--color-primary)' }} />
                <span>{course.students > 0 ? `${course.students} enrolled` : (course.type || 'Course Track')}</span>
              </div>
              <div className='flex items-center gap-2'>
                <ChartColumn style={{ width: 16, height: 16, color: 'var(--color-primary)' }} />
                <span>{course.level || 'Beginner – Advanced'}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className='pt-2 max-w-md space-y-1.5'>
              <div className='flex items-center justify-between text-xs font-bold'>
                <span className='text-[var(--color-text)]'>Your progress</span>
                <span className='text-[var(--color-primary)] dark:text-[var(--color-accent)]'>{progressPercent}%</span>
              </div>
              <div className='w-full h-2 rounded-full bg-white/80 dark:bg-gray-700 overflow-hidden p-0.5 border border-[var(--color-border)]'>
                <div
                  className='h-full rounded-full transition-all duration-700'
                  style={{
                    width: `${Math.max(5, progressPercent)}%`,
                    backgroundColor: 'var(--color-primary)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right Hero Visual & Skills Card */}
          <div className='lg:col-span-5 relative flex flex-col items-center lg:items-end justify-center'>
            <div className='relative w-full max-w-sm'>
              {/* Landmark background artwork */}
              <div className='relative h-44 rounded-3xl overflow-hidden shadow-md border border-white/40 mb-3'>
                <img
                  src={landmark}
                  alt={course.title}
                  className='w-full h-full object-cover'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent' />
                <div className='absolute top-3 left-4 px-3 py-1 rounded-full bg-white/90 dark:bg-[#2A1515]/90 text-[11px] font-bold text-[var(--color-primary)] dark:text-[var(--color-accent)] shadow-sm'>
                  Bonjour le monde !
                </div>
              </div>

              {/* Floating Skills Checklist Card */}
              <div className='bg-white/95 dark:bg-[#3D2020]/95 backdrop-blur-md rounded-2xl p-4 border border-[var(--color-border)] shadow-xl space-y-2 mb-4'>
                <div className='flex items-center justify-between border-b border-[var(--color-border)] pb-2'>
                  <div className='flex items-center gap-1.5'>
                    {course.flag && <img src={course.flag} alt='' className='w-3.5 h-3.5 rounded-full' />}
                    <span className='text-xs font-bold text-[var(--color-text)]'>{course.lang} {course.level || 'A1'}</span>
                  </div>
                  <span className='text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full'>
                    Curriculum
                  </span>
                </div>

                <div className='grid grid-cols-2 gap-2 text-[11px] text-[var(--color-text-body)] font-medium pt-1'>
                  <div className='flex items-center gap-1.5'>
                    <Check style={{ width: 12, height: 12, color: '#1D9E75' }} />
                    <span>Listening</span>
                  </div>
                  <div className='flex items-center gap-1.5'>
                    <Check style={{ width: 12, height: 12, color: '#1D9E75' }} />
                    <span>Reading</span>
                  </div>
                  <div className='flex items-center gap-1.5'>
                    <Check style={{ width: 12, height: 12, color: '#1D9E75' }} />
                    <span>Grammar</span>
                  </div>
                  <div className='flex items-center gap-1.5'>
                    <Check style={{ width: 12, height: 12, color: '#1D9E75' }} />
                    <span>Speaking</span>
                  </div>
                </div>
              </div>

              {/* Continue Learning CTA Button */}
              <button
                onClick={scrollToLessons}
                className='w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-xs sm:text-sm font-bold text-white transition-all shadow-lg cursor-pointer'
                style={{
                  backgroundColor: 'var(--color-primary)',
                  boxShadow: '0 4px 16px rgba(78, 0, 0, 0.25)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'var(--color-primary)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <span>Continue Learning</span>
                <ArrowRight style={{ width: 15, height: 15 }} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. TWO-COLUMN RESPONSIVE LAYOUT ──────────────────────────────── */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'>
        {/* ── LEFT COLUMN (65% width): Lessons & Assignments ── */}
        <div className='lg:col-span-8 space-y-8'>
          {/* ── LESSONS SECTION ────────────────────────────────────────── */}
          <section
            id='lessons-section'
            className='bg-white dark:bg-[#3D2020] rounded-[28px] border border-[var(--color-border)] p-6 sm:p-8 shadow-sm space-y-6'
          >
            {/* Header */}
            <div className='flex flex-wrap items-center justify-between gap-4'>
              <div className='flex items-center gap-3'>
                <div className='w-11 h-11 rounded-2xl bg-[var(--color-accent-faint)] flex items-center justify-center text-[var(--color-primary)] dark:text-[var(--color-accent)] shrink-0'>
                  <BookOpen style={{ width: 20, height: 20 }} />
                </div>
                <div>
                  <h2 className='text-xl sm:text-2xl font-extrabold text-[var(--color-text)]'>Lessons</h2>
                  <p className='text-xs text-[var(--color-text-muted)] mt-0.5'>
                    Access your lessons, practice your skills and track your progress.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setLessonFilter('all')}
                className='inline-flex items-center gap-1 text-xs font-bold text-[var(--color-primary)] dark:text-[var(--color-accent)] hover:underline'
              >
                <span>View all lessons</span>
                <ArrowRight style={{ width: 12, height: 12 }} />
              </button>
            </div>

            {/* Filter Pills */}
            <div className='flex flex-wrap items-center gap-2 pt-1 pb-2 border-b border-[var(--color-border)]'>
              {[
                { id: 'all', label: 'All' },
                { id: 'completed', label: 'Completed' },
                { id: 'in_progress', label: 'In Progress' },
                { id: 'not_started', label: 'Not Started' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setLessonFilter(tab.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    lessonFilter === tab.id
                      ? 'bg-[var(--color-primary)] text-white shadow-sm'
                      : 'border border-[var(--color-border)] text-[var(--color-text-body)] hover:bg-[var(--color-accent-faint)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Lessons List */}
            <div className='space-y-3.5'>
              {filteredLessons.length === 0 ? (
                <div className='py-12 text-center bg-[var(--color-panel)] rounded-2xl border border-[var(--color-border)] p-6'>
                  <BookOpen style={{ width: 28, height: 28, margin: '0 auto 8px', color: 'var(--color-text-muted)' }} />
                  <h4 className='text-sm font-bold text-[var(--color-text)]'>No lessons found</h4>
                  <p className='text-xs text-[var(--color-text-muted)] mt-1'>
                    {lessonFilter === 'all'
                      ? 'No lessons have been released yet by your instructor.'
                      : 'No lessons matching this filter.'}
                  </p>
                </div>
              ) : (
                filteredLessons.map((lesson, idx) => {
                  const Icon = LESSON_ICONS[idx % LESSON_ICONS.length]
                  const isCompleted = lesson.status === 'completed'
                  const isInProgress = lesson.status === 'available' || lesson.status === 'in_progress'

                  return (
                    <div
                      key={lesson.id}
                      className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] hover:border-[var(--color-accent)] transition-all duration-200'
                    >
                      {/* Left: Number + Icon + Title + Description */}
                      <div className='flex items-start sm:items-center gap-3.5 min-w-0 flex-1'>
                        {/* Number Badge */}
                        <div className='w-7 h-7 rounded-full bg-white dark:bg-[#3D2020] border border-[var(--color-border)] flex items-center justify-center text-xs font-bold text-[var(--color-text)] shrink-0'>
                          {idx + 1}
                        </div>

                        {/* Icon Badge */}
                        <div className='w-9 h-9 rounded-xl bg-white dark:bg-[#3D2020] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-primary)] dark:text-[var(--color-accent)] shrink-0'>
                          <Icon style={{ width: 17, height: 17 }} />
                        </div>

                        {/* Content */}
                        <div className='min-w-0 flex-1'>
                          <h4 className='text-sm font-bold text-[var(--color-text)] truncate'>
                            {lesson.title}
                          </h4>
                          <p className='text-xs text-[var(--color-text-muted)] truncate mt-0.5'>
                            {lesson.description || (lesson.releasedAt ? `Released on ${new Date(lesson.releasedAt).toLocaleDateString()}` : 'Interactive conversation and practice')}
                          </p>

                          {/* Meeting or Material Links if available */}
                          <div className='flex flex-wrap items-center gap-2 mt-2'>
                            {lesson.videoUrl && (
                              <a
                                href={lesson.videoUrl}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold hover:underline'
                              >
                                <span>Join live meeting</span>
                                <ArrowRight style={{ width: 10, height: 10 }} />
                              </a>
                            )}
                            {lesson.fileUrl && (
                              <a
                                href={lesson.fileUrl}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-[#3D2020] border border-[var(--color-border)] text-[var(--color-text-body)] text-[11px] font-semibold hover:border-[var(--color-accent)]'
                              >
                                <Paperclip style={{ width: 11, height: 11 }} />
                                <span>{lesson.fileName || 'Lesson file'}</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Status Pill & Action Button */}
                      <div className='flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--color-border)]'>
                        {/* Status Badge */}
                        {isCompleted ? (
                          <span className='inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 text-xs font-bold'>
                            <span>Completed</span>
                            <Check style={{ width: 12, height: 12 }} />
                          </span>
                        ) : isInProgress ? (
                          <div className='flex items-center gap-2'>
                            <span className='px-3 py-1 rounded-full bg-[#FEE2E2] dark:bg-[#451E1E] text-[#DC2626] dark:text-[#F87171] text-xs font-bold'>
                              In progress
                            </span>
                            <div className='w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden hidden md:block'>
                              <div className='h-full bg-[#DC2626] rounded-full' style={{ width: '60%' }} />
                            </div>
                            <span className='text-[10px] font-bold text-[var(--color-text-muted)] hidden md:inline'>60%</span>
                          </div>
                        ) : (
                          <span className='px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-semibold'>
                            Not started
                          </span>
                        )}

                        {/* Action Button */}
                        {isCompleted ? (
                          <button
                            onClick={() => lesson.fileUrl ? window.open(lesson.fileUrl, '_blank') : null}
                            className='px-4 py-1.5 rounded-full border border-[var(--color-border)] hover:border-[var(--color-primary)] text-xs font-bold text-[var(--color-text)] transition-colors'
                          >
                            Review →
                          </button>
                        ) : isInProgress ? (
                          <button
                            onClick={() => lesson.videoUrl ? window.open(lesson.videoUrl, '_blank') : null}
                            className='px-4 py-1.5 rounded-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-xs font-bold text-white transition-colors shadow-sm'
                          >
                            Continue →
                          </button>
                        ) : (
                          <button
                            disabled
                            className='px-4 py-1.5 rounded-full border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-faint)] opacity-60'
                          >
                            Start →
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </section>

          {/* ── ASSIGNMENTS SECTION ────────────────────────────────────── */}
          <section className='bg-white dark:bg-[#3D2020] rounded-[28px] border border-[var(--color-border)] p-6 sm:p-8 shadow-sm space-y-6'>
            {/* Header */}
            <div className='flex flex-wrap items-center justify-between gap-4'>
              <div className='flex items-center gap-3'>
                <div className='w-11 h-11 rounded-2xl bg-[var(--color-accent-faint)] flex items-center justify-center text-[var(--color-primary)] dark:text-[var(--color-accent)] shrink-0'>
                  <FileText style={{ width: 20, height: 20 }} />
                </div>
                <div>
                  <h2 className='text-xl sm:text-2xl font-extrabold text-[var(--color-text)]'>Assignments</h2>
                  <p className='text-xs text-[var(--color-text-muted)] mt-0.5'>
                    Submit your work, get feedback and track your progress.
                  </p>
                </div>
              </div>

              <span className='text-xs font-bold text-[var(--color-text-muted)]'>
                {enrollment.assignments.length} assigned
              </span>
            </div>

            {/* Assignments List */}
            <div className='space-y-4'>
              {enrollment.assignments.length === 0 ? (
                <div className='py-10 text-center bg-[var(--color-panel)] rounded-2xl border border-[var(--color-border)] p-6'>
                  <FileText style={{ width: 28, height: 28, margin: '0 auto 8px', color: 'var(--color-text-muted)' }} />
                  <h4 className='text-sm font-bold text-[var(--color-text)]'>No assignments yet</h4>
                  <p className='text-xs text-[var(--color-text-muted)] mt-1'>
                    Homework tasks will be listed here when assigned by your teacher.
                  </p>
                </div>
              ) : (
                enrollment.assignments.map(assignment => {
                  const isOpen = openAssignmentId === assignment.id
                  const isSubmitted = assignment.status === 'submitted'
                  const isAvailable = assignment.status === 'available'

                  return (
                    <div
                      key={assignment.id}
                      className='rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5 space-y-4 transition-all'
                    >
                      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                        <div className='flex items-start gap-3.5'>
                          <div className='w-10 h-10 rounded-xl bg-white dark:bg-[#3D2020] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-primary)] dark:text-[var(--color-accent)] shrink-0 mt-0.5'>
                            <FileText style={{ width: 18, height: 18 }} />
                          </div>
                          <div>
                            <h4 className='text-sm font-bold text-[var(--color-text)]'>{assignment.title}</h4>
                            <p className='text-xs text-[var(--color-text-muted)] mt-0.5'>
                              Due {assignment.dueAt ? new Date(assignment.dueAt).toLocaleDateString() : 'Upcoming'}
                              {assignment.fileName && ` · ${assignment.fileName}`}
                            </p>
                            {assignment.fileUrl && (
                              <a
                                href={assignment.fileUrl}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-[var(--color-primary)] dark:text-[var(--color-accent)] hover:underline'
                              >
                                <Paperclip style={{ width: 12, height: 12 }} />
                                <span>Download assignment prompt</span>
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Status Badge & Open Button */}
                        <div className='flex items-center justify-between sm:justify-end gap-3'>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              assignment.grade
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600'
                                : isSubmitted
                                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600'
                                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600'
                            }`}
                          >
                            {assignment.grade ? `Grade: ${assignment.grade}%` : (isSubmitted ? 'Submitted' : 'Available')}
                          </span>

                          <button
                            onClick={() => setOpenAssignmentId(isOpen ? null : assignment.id)}
                            className='px-5 py-2 rounded-full text-xs font-bold text-white transition-all shadow-sm'
                            style={{ backgroundColor: 'var(--color-primary)' }}
                          >
                            {isOpen ? 'Close' : 'Open →'}
                          </button>
                        </div>
                      </div>

                      {/* Instructor Feedback if available */}
                      {assignment.feedback && (
                        <div className='p-3 rounded-xl bg-white dark:bg-[#3D2020] border border-[var(--color-border)] text-xs text-[var(--color-text-body)]'>
                          <span className='font-bold text-[var(--color-primary)] dark:text-[var(--color-accent)]'>Instructor Feedback: </span>
                          {assignment.feedback}
                        </div>
                      )}

                      {/* Submitted History Preview */}
                      {isSubmitted && (assignment.submissionText || assignment.submissionFileUrl) && (
                        <div className='p-3.5 rounded-xl bg-white dark:bg-[#3D2020] border border-[var(--color-border)] text-xs space-y-1.5'>
                          <p className='font-bold uppercase tracking-wider text-[10.5px] text-[var(--color-text-muted)]'>Your submission:</p>
                          {assignment.submissionText && <p className='text-[var(--color-text-body)] whitespace-pre-wrap'>{assignment.submissionText}</p>}
                          {assignment.submissionFileUrl && (
                            <a
                              href={assignment.submissionFileUrl}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:underline pt-1'
                            >
                              <Paperclip style={{ width: 12, height: 12 }} />
                              <span>{assignment.submissionFileName || 'Submitted document'}</span>
                            </a>
                          )}
                        </div>
                      )}

                      {/* Collapsible Submission Form (Preserved) */}
                      {isOpen && (
                        <div className='pt-4 border-t border-[var(--color-border)] space-y-3.5 animate-fade-in'>
                          <label className='block text-xs font-bold text-[var(--color-text)]'>
                            Your Answer / Solution
                          </label>
                          <textarea
                            rows={4}
                            value={assignmentText[assignment.id] || ''}
                            onChange={e => setAssignmentText(prev => ({ ...prev, [assignment.id]: e.target.value }))}
                            placeholder='Write your response or answers here...'
                            className='w-full rounded-2xl border border-[var(--color-border)] bg-white dark:bg-[#3D2020] p-3.5 text-xs text-[var(--color-text)] outline-none resize-none focus:border-[var(--color-primary)] transition-colors'
                          />

                          {/* File Upload Dropzone */}
                          <div className='relative rounded-2xl border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-accent)] bg-white dark:bg-[#3D2020] p-5 text-center transition-colors'>
                            <Paperclip style={{ width: 22, height: 22, margin: '0 auto 6px', color: 'var(--color-accent)' }} />
                            <p className='text-xs font-bold text-[var(--color-text)]'>
                              {assignmentFile[assignment.id] ? assignmentFile[assignment.id].name : 'Attach your file (PDF, PPTX, Doc, Image...)'}
                            </p>
                            <p className='text-[11px] text-[var(--color-text-muted)] mt-0.5'>Click or drag and drop to select a file</p>
                            <input
                              type='file'
                              onChange={e => setAssignmentFile(prev => ({ ...prev, [assignment.id]: e.target.files?.[0] || null }))}
                              className='absolute inset-0 opacity-0 cursor-pointer'
                            />
                          </div>

                          {assignmentError && (
                            <p className='text-xs font-semibold text-[var(--color-danger)]'>{assignmentError}</p>
                          )}

                          <div className='flex items-center gap-3 pt-1'>
                            <button
                              onClick={() => handleSubmitAssignment(assignment)}
                              className='px-6 py-2.5 rounded-full text-xs font-bold text-white shadow-md transition-all'
                              style={{ backgroundColor: 'var(--color-primary)' }}
                            >
                              Submit Assignment →
                            </button>
                            <button
                              onClick={() => setOpenAssignmentId(null)}
                              className='px-4 py-2 text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </section>
        </div>

        {/* ── RIGHT COLUMN (35% width Sidebar): Tests, Review Form, Course Details ── */}
        <aside className='lg:col-span-4 space-y-8'>
          {/* ── PLACEMENT TESTS / TESTS CARD ───────────────────────────── */}
          <section className='bg-white dark:bg-[#3D2020] rounded-[28px] border border-[var(--color-border)] p-6 shadow-sm space-y-5'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2.5'>
                <div className='w-9 h-9 rounded-xl bg-[var(--color-accent-faint)] flex items-center justify-center text-[var(--color-primary)] dark:text-[var(--color-accent)]'>
                  <TargetDart style={{ width: 18, height: 18 }} />
                </div>
                <div>
                  <h3 className='text-base font-extrabold text-[var(--color-text)]'>Placement Tests</h3>
                  <p className='text-[11px] text-[var(--color-text-muted)]'>Find your level & recommendations</p>
                </div>
              </div>

              <Link
                to='/placement-test'
                className='text-[11px] font-bold text-[var(--color-primary)] dark:text-[var(--color-accent)] hover:underline'
              >
                View all tests →
              </Link>
            </div>

            {/* Test Content or Beautiful Empty State */}
            {enrollment.tests.length === 0 ? (
              <div className='bg-[var(--color-lavender-tint)] rounded-2xl p-5 border border-[var(--color-border)] space-y-4'>
                <div className='flex items-start justify-between gap-3'>
                  <div className='space-y-1.5'>
                    <h4 className='text-sm font-bold text-[var(--color-text)]'>Find Your Level</h4>
                    <p className='text-xs text-[var(--color-text-body)] leading-relaxed'>
                      No test yet. Take a placement test to find your current level and get personalized recommendations.
                    </p>
                  </div>
                  {/* Mini Clipboard Icon Badge */}
                  <div className='w-12 h-12 rounded-2xl bg-white dark:bg-[#3D2020] border border-[var(--color-border)] flex items-center justify-center text-purple-500 shrink-0 shadow-sm'>
                    <Clock style={{ width: 22, height: 22 }} />
                  </div>
                </div>

                <Link
                  to='/placement-test'
                  className='inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold text-white transition-all shadow-md'
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  <span>Start test</span>
                  <ArrowRight style={{ width: 13, height: 13 }} />
                </Link>
              </div>
            ) : (
              <div className='space-y-3'>
                {enrollment.tests.map(test => (
                  <div
                    key={test.id}
                    className='p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] space-y-2.5'
                  >
                    <div className='flex items-center justify-between'>
                      <h4 className='text-xs font-bold text-[var(--color-text)]'>{test.title}</h4>
                      <span className='text-xs font-bold text-emerald-600'>
                        {test.status === 'graded' ? `${test.gradePercent}%` : 'Available'}
                      </span>
                    </div>
                    <p className='text-[11px] text-[var(--color-text-muted)]'>
                      {test.status === 'graded' ? `Score: ${test.score}/${test.totalPoints} points` : 'Ready to begin assessment'}
                    </p>
                    <Link
                      to={`/student/courses/${course.id}/tests/${test.id}`}
                      className='inline-flex items-center gap-1 text-xs font-bold text-[var(--color-primary)] dark:text-[var(--color-accent)] hover:underline pt-1'
                    >
                      <span>{test.status === 'graded' ? 'View test results' : 'Take test now'}</span>
                      <ArrowRight style={{ width: 11, height: 11 }} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── YOUR REVIEW FORM CARD (PRIVATE TO CURRENT USER) ───────── */}
          <section className='bg-white dark:bg-[#3D2020] rounded-[28px] border border-[var(--color-border)] p-6 shadow-sm space-y-4'>
            <div className='flex items-center gap-2.5'>
              <div className='w-9 h-9 rounded-xl bg-[var(--color-accent-faint)] flex items-center justify-center text-[var(--color-primary)] dark:text-[var(--color-accent)]'>
                <Star style={{ width: 18, height: 18 }} />
              </div>
              <div>
                <h3 className='text-base font-extrabold text-[var(--color-text)]'>Your Review</h3>
                <p className='text-[11px] text-[var(--color-text-muted)]'>Share your experience and help other learners.</p>
              </div>
            </div>

            {/* If user already submitted a review and is not in edit mode */}
            {existingReview && !editingReview ? (
              <div className='p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] space-y-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-1 text-amber-400'>
                    {[1, 2, 3, 4, 5].map(n => (
                      <span key={n}>{n <= existingReview.rating ? '★' : '☆'}</span>
                    ))}
                  </div>
                  <span className='text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full'>
                    Submitted
                  </span>
                </div>
                <p className='text-xs text-[var(--color-text-body)] leading-relaxed italic'>
                  "{existingReview.comment}"
                </p>
                <div className='flex gap-2 pt-2 border-t border-[var(--color-border)]'>
                  <button
                    onClick={startEditReview}
                    className='px-4 py-1 rounded-full border border-[var(--color-border)] text-xs font-bold text-[var(--color-text)] hover:border-[var(--color-primary)] transition-colors'
                  >
                    Edit
                  </button>
                  <button
                    onClick={deleteReview}
                    className='px-4 py-1 rounded-full border border-red-200 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors'
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              /* Review Submission / Editing Form */
              <div className='space-y-4 pt-1'>
                {/* Interactive Star Rating */}
                <div>
                  <label className='block text-xs font-bold text-[var(--color-text)] mb-1.5'>
                    Your rating
                  </label>
                  <div className='flex items-center gap-1 text-2xl text-amber-400'>
                    {[1, 2, 3, 4, 5].map(starNum => {
                      const active = starNum <= (hoverRating || review.rating)
                      return (
                        <button
                          key={starNum}
                          type='button'
                          onClick={() => setReview(prev => ({ ...prev, rating: starNum }))}
                          onMouseEnter={() => setHoverRating(starNum)}
                          onMouseLeave={() => setHoverRating(0)}
                          className='p-0.5 focus:outline-none transition-transform hover:scale-110'
                        >
                          {active ? '★' : '☆'}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Comment Textarea */}
                <div>
                  <textarea
                    rows={3}
                    maxLength={500}
                    value={review.comment}
                    onChange={e => setReview(prev => ({ ...prev, comment: e.target.value }))}
                    placeholder='Your comment...'
                    className='w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-3 text-xs text-[var(--color-text)] outline-none resize-none focus:border-[var(--color-primary)] transition-colors'
                  />
                  <div className='flex justify-end text-[10px] text-[var(--color-text-muted)] mt-1'>
                    <span>{review.comment.length}/500</span>
                  </div>
                </div>

                {reviewError && (
                  <p className='text-xs font-semibold text-red-600'>{reviewError}</p>
                )}

                {/* Actions Footer */}
                <div className='flex items-center justify-between gap-3 pt-1'>
                  <div className='flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] cursor-pointer hover:text-[var(--color-text)]'>
                    <Camera style={{ width: 14, height: 14 }} />
                    <span className='text-[11px]'>Add a photo (optional)</span>
                  </div>

                  <div className='flex items-center gap-2'>
                    {editingReview && (
                      <button
                        onClick={cancelEditReview}
                        className='px-3 py-1.5 rounded-full border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-muted)]'
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={submitReview}
                      className='px-5 py-2 rounded-full text-xs font-bold text-white transition-all shadow-md'
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                      {editingReview ? 'Save changes' : 'Submit review →'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* ── COURSE DETAILS CARD ────────────────────────────────────── */}
          <section className='bg-white dark:bg-[#3D2020] rounded-[28px] border border-[var(--color-border)] p-6 shadow-sm space-y-4'>
            <div className='flex items-center gap-2.5'>
              <div className='w-9 h-9 rounded-xl bg-[var(--color-accent-faint)] flex items-center justify-center text-[var(--color-primary)] dark:text-[var(--color-accent)]'>
                <BookOpen style={{ width: 18, height: 18 }} />
              </div>
              <h3 className='text-base font-extrabold text-[var(--color-text)]'>Course details</h3>
            </div>

            <div className='grid grid-cols-2 gap-4 pt-1'>
              <div className='p-3.5 rounded-2xl bg-[var(--color-panel)] border border-[var(--color-border)]'>
                <div className='flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] font-medium mb-1'>
                  <Clock style={{ width: 13, height: 13, color: 'var(--color-primary)' }} />
                  <span>Duration</span>
                </div>
                <p className='text-xs font-bold text-[var(--color-text)]'>{course.duration || '12–48 weeks'}</p>
              </div>

              <div className='p-3.5 rounded-2xl bg-[var(--color-panel)] border border-[var(--color-border)]'>
                <div className='flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] font-medium mb-1'>
                  <Persons style={{ width: 13, height: 13, color: 'var(--color-primary)' }} />
                  <span>Track Type</span>
                </div>
                <p className='text-xs font-bold text-[var(--color-text)]'>{course.type || 'Standard Track'}</p>
              </div>

              <div className='p-3.5 rounded-2xl bg-[var(--color-panel)] border border-[var(--color-border)]'>
                <div className='flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] font-medium mb-1'>
                  <ChartColumn style={{ width: 13, height: 13, color: 'var(--color-primary)' }} />
                  <span>Level</span>
                </div>
                <p className='text-xs font-bold text-[var(--color-text)]'>{course.level || 'Beginner – Advanced'}</p>
              </div>

              <div className='p-3.5 rounded-2xl bg-[var(--color-panel)] border border-[var(--color-border)]'>
                <div className='flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] font-medium mb-1'>
                  <Globe style={{ width: 13, height: 13, color: 'var(--color-primary)' }} />
                  <span>Language</span>
                </div>
                <p className='text-xs font-bold text-[var(--color-text)]'>{course.lang || 'French'}</p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </main>
  )
}

export default CourseLearn
