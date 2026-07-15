import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Lock, Check, Clock, Star, StarFill } from '@gravity-ui/icons'
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

// Real star rating: gold filled stars for the score, muted outlines for the rest.
const Stars = ({ rating = 0, size = 15 }) => {
  const rounded = Math.max(0, Math.min(5, Math.round(rating)))
  return (
    <span className='inline-flex items-center gap-0.5' aria-label={`${rounded} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map(n => (
        n <= rounded
          ? <StarFill key={n} style={{ width: size, height: size, color: '#F5B301' }} />
          : <Star key={n} style={{ width: size, height: size, color: 'var(--color-border)' }} />
      ))}
    </span>
  )
}

const EmptyLine = ({ text }) => (
  <p className='text-sm text-[var(--color-text-muted)]'>{text}</p>
)

const CourseLearn = () => {
  const { courseId } = useParams()
  const { user, openAuth } = useAuth()
  const { data, loading, setData } = useQuery(async () => {
    if (!user?.id) return { enrollments: [], courseReviews: [], courses: [] }
    const [enrollments, courseReviews, courses] = await Promise.all([
      fetchEnrollments(user), fetchCourseReviews(user), fetchCourses(),
    ])
    return { enrollments, courseReviews, courses }
  }, [user?.id], { enrollments: [], courseReviews: [], courses: [] })
  const { enrollments, courseReviews, courses } = data
  const [assignmentText, setAssignmentText] = useState({})
  const [assignmentFile, setAssignmentFile] = useState({})
  const [assignmentError, setAssignmentError] = useState('')
  const [review, setReview] = useState({ rating: 5, comment: '' })
  const [reviewError, setReviewError] = useState('')
  const [editingReview, setEditingReview] = useState(false)

  const enrollment = useMemo(() => enrollments.find(item =>
    item.studentId === user?.id && String(item.courseId) === String(courseId) && item.status === 'active'
  ), [courseId, enrollments, user?.id])
  const course = enrollment?.course || courses.find(item => String(item.id) === String(courseId))
  const existingReview = courseReviews.find(item => item.enrollmentId === enrollment?.id && item.studentId === user?.id)
  // Published reviews from every student on this course.
  const courseReviewList = courseReviews.filter(item =>
    String(item.courseId) === String(courseId) && item.isPublished && item.comment
  )

  if (!user) {
    return (
      <main className='max-w-3xl mx-auto px-4 py-20 text-center'>
        <h1 className='text-2xl font-bold text-[var(--color-text)]'>Log in required</h1>
        <p className='text-[var(--color-text-muted)] mt-2 mb-6'>Only approved students can access course materials.</p>
        <button onClick={() => openAuth()} className='rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-white'>Log in</button>
      </main>
    )
  }

  if (loading) {
    return (
      <main className='max-w-3xl mx-auto px-4 py-20 text-center'>
        <p className='text-sm font-semibold text-[var(--color-text)]'>Loading course access...</p>
      </main>
    )
  }

  if (!enrollment || !course) {
    return (
      <main className='max-w-3xl mx-auto px-4 py-20 text-center'>
        <Lock style={{ width: 42, height: 42, color: 'var(--color-text-faint)', margin: '0 auto 16px' }} />
        <h1 className='text-2xl font-bold text-[var(--color-text)]'>Course access locked</h1>
        <p className='text-[var(--color-text-muted)] mt-2 mb-6'>This course opens only after your payment receipt is approved.</p>
        <Link to='/student/dashboard' className='rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-white'>Back to dashboard</Link>
      </main>
    )
  }

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
                feedback: 'Waiting for admin grading.',
              }
            : next),
        }),
      }))
      setAssignmentFile(prev => ({ ...prev, [assignment.id]: null }))
    } catch (error) {
      setAssignmentError(error.message || 'Could not submit assignment')
    }
  }

  return (
    <main className='max-w-6xl mx-auto px-4 py-12'>
      <div className='rounded-3xl p-8 mb-8' style={{ background: `${course.color}14`, border: `1px solid ${course.color}35` }}>
        <p className='text-xs uppercase tracking-widest font-semibold' style={{ color: course.color }}>{course.lang} · {course.level}</p>
        <h1 className='text-3xl font-bold text-[var(--color-text)] mt-2'>{course.title}</h1>
        <p className='text-[var(--color-text-muted)] mt-2 max-w-2xl'>{course.description}</p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <section className='lg:col-span-2 space-y-6'>
          <div className='rounded-3xl border border-[var(--color-border)] bg-white dark:bg-slate-900 p-6'>
            <h2 className='text-xl font-bold text-[var(--color-text)] mb-5'>Lessons</h2>
            <div className='space-y-3'>
              {enrollment.lessons.length === 0 && <EmptyLine text='No lessons yet.' />}
              {enrollment.lessons.map(lesson => (
                <div key={lesson.id} className='rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4 flex items-start gap-3'>
                  {lesson.status === 'completed'
                    ? <Check style={{ color: 'var(--color-green)', width: 20, height: 20, flexShrink: 0 }} />
                    : lesson.status === 'available'
                      ? <Clock style={{ color: course.color, width: 20, height: 20, flexShrink: 0 }} />
                      : <Lock style={{ color: 'var(--color-text-faint)', width: 20, height: 20, flexShrink: 0 }} />
                  }
                  <div className='min-w-0 flex-1'>
                    <p className='font-semibold text-[var(--color-text)]'>{lesson.title}</p>
                    <p className='text-sm text-[var(--color-text-muted)]'>
                      {lesson.status} · released {new Date(lesson.releasedAt).toLocaleDateString()}
                    </p>
                    {lesson.status !== 'locked' && (
                      <div className='flex flex-col gap-2 mt-3'>
                        {lesson.videoUrl && (
                          <a
                            href={lesson.videoUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='inline-flex items-center gap-2 rounded-full bg-[var(--color-green-faint)] px-3 py-1.5 text-xs font-semibold text-[var(--color-green-dark)] break-all'
                          >
                            Join meeting: {lesson.videoUrl}
                          </a>
                        )}
                        {lesson.fileUrl && (
                          <a
                            href={lesson.fileUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='inline-flex items-center gap-2 rounded-full bg-[var(--color-accent-faint)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text-body)] break-all'
                          >
                            {lesson.fileName || 'Lesson material'}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className='rounded-3xl border border-[var(--color-border)] bg-white dark:bg-slate-900 p-6'>
            <h2 className='text-xl font-bold text-[var(--color-text)] mb-5'>Assignments</h2>
            <div className='space-y-4'>
              {enrollment.assignments.length === 0 && <EmptyLine text='No assignments yet.' />}
              {enrollment.assignments.map(assignment => (
                <div key={assignment.id} className='rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4'>
                  <div className='flex justify-between gap-4'>
                    <div>
                      <p className='font-semibold text-[var(--color-text)]'>{assignment.title}</p>
                      <p className='text-sm text-[var(--color-text-muted)] mt-1'>{assignment.description}</p>
                      <p className='text-xs text-[var(--color-text-faint)] mt-2'>Due {new Date(assignment.dueAt).toLocaleDateString()}</p>
                      {assignment.fileUrl && (
                        <a
                          href={assignment.fileUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='inline-flex items-center gap-2 mt-3 rounded-full bg-[var(--color-accent-faint)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text-body)] break-all'
                        >
                          {assignment.fileName || 'Assignment file'}
                        </a>
                      )}
                    </div>
                    <span className='text-sm font-bold text-[var(--color-text)]'>{assignment.grade ? `${assignment.grade}%` : assignment.status}</span>
                  </div>
                  {assignment.feedback && <p className='text-sm text-[var(--color-text-muted)] mt-3'>Feedback: {assignment.feedback}</p>}

                  {/* Show what the student already submitted */}
                  {assignment.status === 'submitted' && (assignment.submissionText || assignment.submissionFileUrl) && (
                    <div className='mt-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3'>
                      <p className='text-xs uppercase tracking-widest font-semibold text-[var(--color-text-body)] mb-2'>Your submission</p>
                      {assignment.submissionText && <p className='text-sm text-[var(--color-text-muted)] whitespace-pre-wrap'>{assignment.submissionText}</p>}
                      {assignment.submissionFileUrl && (
                        <a href={assignment.submissionFileUrl} target='_blank' rel='noopener noreferrer' className='inline-flex items-center gap-2 mt-2 rounded-full bg-[var(--color-green-faint)] px-3 py-1.5 text-xs font-semibold text-[var(--color-green-dark)] break-all'>
                          {assignment.submissionFileName || 'Submitted file'}
                        </a>
                      )}
                    </div>
                  )}

                  {assignment.status === 'available' && (
                    <div className='mt-4 space-y-3'>
                      <textarea
                        rows={3}
                        value={assignmentText[assignment.id] || ''}
                        onChange={e => setAssignmentText(prev => ({ ...prev, [assignment.id]: e.target.value }))}
                        placeholder='Write your answer here (or attach a file below)...'
                        className='w-full rounded-xl border bg-[var(--color-surface)] p-3 text-sm text-[var(--color-text)] outline-none resize-none'
                      />
                      <div className='relative rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-panel)] p-4 text-center'>
                        <p className='text-sm font-semibold text-[var(--color-text)]'>
                          {assignmentFile[assignment.id] ? assignmentFile[assignment.id].name : 'Or upload a file (PDF, image, doc...)'}
                        </p>
                        <input
                          type='file'
                          onChange={e => setAssignmentFile(prev => ({ ...prev, [assignment.id]: e.target.files?.[0] || null }))}
                          className='absolute inset-0 opacity-0 cursor-pointer'
                        />
                      </div>
                      <button
                        onClick={() => handleSubmitAssignment(assignment)}
                        className='rounded-full bg-[var(--color-primary)] px-4 py-2 text-xs font-bold text-white'
                      >
                        Submit assignment
                      </button>
                      {assignmentError && (
                        <p className='text-sm text-[var(--color-danger)]'>{assignmentError}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className='space-y-6'>
          <div className='rounded-3xl border border-[var(--color-border)] bg-white dark:bg-slate-900 p-6'>
            <div className='flex items-center justify-between mb-5'>
              <h2 className='text-xl font-bold text-[var(--color-text)]'>Tests</h2>
              {enrollment.courseAverage != null && (
                <span className='text-sm font-bold text-[var(--color-text)]'>Avg {enrollment.courseAverage}%</span>
              )}
            </div>
            <div className='space-y-3'>
              {enrollment.tests.length === 0 && <EmptyLine text='No tests yet.' />}
              {enrollment.tests.map(test => (
                <div key={test.id} className='rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4'>
                  <p className='font-semibold text-[var(--color-text)]'>{test.title}</p>
                  <p className='text-sm text-[var(--color-text-muted)] mt-1'>
                    {test.status === 'graded' ? `${test.gradePercent}% · ${test.score}/${test.totalPoints}` : 'Available to take'}
                  </p>
                  <Link to={`/student/courses/${course.id}/tests/${test.id}`} className='inline-flex mt-3 rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text)]'>
                    {test.status === 'graded' ? 'View results' : 'Take test'}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className='rounded-3xl border border-[var(--color-border)] bg-white dark:bg-slate-900 p-6'>
            <h2 className='text-xl font-bold text-[var(--color-text)] mb-4'>Reviews</h2>

            {/* Published reviews from all students; the student's own row can be edited or deleted. */}
            <div className='space-y-3 mb-5'>
              {courseReviewList.length === 0 ? (
                <EmptyLine text='No reviews yet.' />
              ) : (
                courseReviewList.map(item => {
                  const mine = item.studentId === user.id
                  return (
                    <div key={item.id} className='rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4'>
                      <div className='flex items-center justify-between gap-2'>
                        <p className='text-sm font-semibold text-[var(--color-text)]'>{item.studentName}{mine && ' (you)'}</p>
                        <Stars rating={item.rating} />
                      </div>
                      <p className='text-sm text-[var(--color-text-muted)] mt-2'>{item.comment}</p>
                      {mine && !editingReview && (
                        <div className='flex gap-2 mt-3'>
                          <button onClick={startEditReview} className='rounded-full border border-[var(--color-border)] px-3 py-1 text-xs font-semibold text-[var(--color-text)]'>Edit</button>
                          <button onClick={deleteReview} className='rounded-full border border-[var(--color-danger)] px-3 py-1 text-xs font-semibold text-[var(--color-danger)]'>Delete</button>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>

            {/* Add a review when the student has none, or edit their existing one. */}
            {(!existingReview || editingReview) && (
              <div className='space-y-3'>
                <h3 className='text-sm font-bold text-[var(--color-text)]'>{editingReview ? 'Edit your review' : 'Add a review'}</h3>
                <select value={review.rating} onChange={e => setReview(prev => ({ ...prev, rating: e.target.value }))} className='w-full rounded-xl border bg-[var(--color-surface)] p-3 text-sm'>
                  {[5, 4, 3, 2, 1].map(value => <option key={value} value={value}>{value} stars</option>)}
                </select>
                <textarea value={review.comment} onChange={e => setReview(prev => ({ ...prev, comment: e.target.value }))} rows={3} className='w-full rounded-xl border bg-[var(--color-surface)] p-3 text-sm resize-none' placeholder='Share your experience...' />
                <div className='flex gap-2'>
                  <button onClick={submitReview} className='rounded-full bg-[var(--color-primary)] px-4 py-2 text-xs font-bold text-white'>
                    <Star style={{ width: 13, height: 13, display: 'inline', marginRight: 4 }} />
                    {editingReview ? 'Save changes' : 'Submit review'}
                  </button>
                  {editingReview && (
                    <button onClick={cancelEditReview} className='rounded-full border border-[var(--color-border)] px-4 py-2 text-xs font-semibold text-[var(--color-text)]'>Cancel</button>
                  )}
                </div>
                {reviewError && <p className='text-sm text-[var(--color-danger)]'>{reviewError}</p>}
              </div>
            )}
            {reviewError && existingReview && !editingReview && <p className='text-sm text-[var(--color-danger)]'>{reviewError}</p>}
          </div>
        </aside>
      </div>
    </main>
  )
}

export default CourseLearn
