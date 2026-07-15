import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Check, Xmark } from '@gravity-ui/icons'
import { useAuth } from '../hooks/AuthContext'
import { useQuery } from '../hooks/useQuery'
import { fetchEnrollments, fetchCourses, submitCourseTest } from '../services/db'

const CourseTest = () => {
  const { courseId, testId } = useParams()
  const { user, openAuth } = useAuth()
  const { data, loading, setData } = useQuery(async () => {
    if (!user?.id) return { enrollments: [], courses: [] }
    const [enrollments, courses] = await Promise.all([fetchEnrollments(user), fetchCourses()])
    return { enrollments, courses }
  }, [user?.id], { enrollments: [], courses: [] })
  const { enrollments, courses } = data
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const enrollment = useMemo(() => enrollments.find(item =>
    item.studentId === user?.id && String(item.courseId) === String(courseId)
  ), [courseId, enrollments, user?.id])
  const course = enrollment?.course || courses.find(item => String(item.id) === String(courseId))
  const test = enrollment?.tests.find(item => item.id === testId)

  if (!user) {
    return (
      <main className='max-w-3xl mx-auto px-4 py-20 text-center'>
        <h1 className='text-2xl font-bold text-[var(--color-text)]'>Log in required</h1>
        <button onClick={() => openAuth()} className='rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-white mt-6'>Log in</button>
      </main>
    )
  }

  if (loading) {
    return (
      <main className='max-w-3xl mx-auto px-4 py-20 text-center'>
        <p className='text-sm font-semibold text-[var(--color-text)]'>Loading test...</p>
      </main>
    )
  }

  if (!enrollment || !test || !course) {
    return (
      <main className='max-w-3xl mx-auto px-4 py-20 text-center'>
        <h1 className='text-2xl font-bold text-[var(--color-text)]'>Test unavailable</h1>
        <Link to='/student/dashboard' className='inline-flex mt-6 rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-white'>Back to dashboard</Link>
      </main>
    )
  }

  const submit = async () => {
    setError('')
    setSubmitting(true)
    try {
      const result = await submitCourseTest({ enrollmentId: enrollment.id, test, answers, user })
      if (result) {
        setData(prev => ({
          ...prev,
          enrollments: prev.enrollments.map(item => item.id !== enrollment.id ? item : {
            ...item,
            tests: item.tests.map(next => next.id === test.id
              ? { ...next, status: 'graded', questions: result.gradedQuestions, score: result.score, totalPoints: result.totalPoints, gradePercent: result.gradePercent }
              : next),
          }),
        }))
      }
    } catch (err) {
      setError(err.message || 'Could not submit test')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className='max-w-3xl mx-auto px-4 py-12'>
      <p className='text-xs uppercase tracking-widest font-semibold' style={{ color: course.color }}>{course.title}</p>
      <h1 className='text-3xl font-bold text-[var(--color-text)] mt-2'>{test.title}</h1>

      <div className='rounded-3xl border border-[var(--color-border)] bg-white dark:bg-slate-900 p-6 mt-8 space-y-5'>
        {test.status === 'graded' && (
          <div className='rounded-2xl bg-[var(--color-panel)] border border-[var(--color-border)] p-4'>
            <p className='text-sm text-[var(--color-text-muted)]'>Score</p>
            <p className='text-3xl font-bold text-[var(--color-text)]'>{test.gradePercent}%</p>
          </div>
        )}

        {test.questions.map(question => (
          <div key={question.id} className='rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4'>
            <p className='font-semibold text-[var(--color-text)] mb-3'>{question.question}</p>
            {test.status === 'graded' ? (
              <div className='space-y-2'>
                <p className='text-sm text-[var(--color-text-muted)]'>Your answer: {question.studentAnswer}</p>
                <p className='text-sm text-[var(--color-text-muted)]'>Correct answer: {question.correctAnswer}</p>
                <div className='flex items-center gap-2 text-sm font-semibold' style={{ color: question.isCorrect ? 'var(--color-green)' : 'var(--color-danger)' }}>
                  {question.isCorrect ? <Check style={{ width: 16, height: 16 }} /> : <Xmark style={{ width: 16, height: 16 }} />}
                  {question.isCorrect ? 'Correct' : 'Wrong'}
                </div>
              </div>
            ) : (
              <div className='space-y-2'>
                {question.options.map(option => (
                  <button
                    key={option}
                    onClick={() => setAnswers(prev => ({ ...prev, [question.id]: option }))}
                    className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                      answers[question.id] === option
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-text)]'
                        : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)]'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {test.status !== 'graded' && (
          <>
          {error && (
            <p className='rounded-xl border border-[var(--color-danger)] bg-[var(--color-danger-faint)] px-4 py-3 text-sm text-[var(--color-danger)]'>
              {error}
            </p>
          )}
          <button
            onClick={submit}
            disabled={submitting || test.questions.some(question => !answers[question.id])}
            className='w-full rounded-2xl bg-[var(--color-primary)] py-3 text-sm font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed'
          >
            {submitting ? 'Submitting...' : 'Submit test'}
          </button>
          </>
        )}
      </div>
    </main>
  )
}

export default CourseTest
