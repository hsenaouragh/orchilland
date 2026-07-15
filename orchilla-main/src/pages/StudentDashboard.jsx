import { Link } from 'react-router-dom'
import { Check, Clock, BookOpen, ChartMixed } from '@gravity-ui/icons'
import { useAuth } from '../hooks/AuthContext'
import { useQuery } from '../hooks/useQuery'
import { formatDinars } from '../data/siteData'
import {
  fetchApplications,
  fetchEnrollments,
  fetchNotifications,
  fetchPlacementAttempts,
  fetchCourses,
} from '../services/db'

const statusStyles = {
  pending_payment: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-200',
  pending_approval: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200',
  approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200',
  denied: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200',
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200',
  completed: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  suspended: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200',
}

const StatusBadge = ({ status }) => (
  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[status] || statusStyles.completed}`}>
    {status.replaceAll('_', ' ')}
  </span>
)

const Empty = ({ title, body, to, cta }) => (
  <div className='rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-8 text-center'>
    <p className='font-semibold text-[var(--color-text)]'>{title}</p>
    <p className='text-sm text-[var(--color-text-muted)] mt-2 mb-5'>{body}</p>
    {to && <Link to={to} className='inline-flex rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white'>{cta}</Link>}
  </div>
)

const StudentDashboard = () => {
  const { user, openAuth } = useAuth()
  const { data, loading } = useQuery(async () => {
    if (!user?.id) return { applications: [], enrollments: [], notifications: [], placementAttempts: [], courses: [] }
    const [applications, enrollments, notifications, placementAttempts, courses] = await Promise.all([
      fetchApplications(user),
      fetchEnrollments(user),
      fetchNotifications(user),
      fetchPlacementAttempts(user),
      fetchCourses(),
    ])
    return { applications, enrollments, notifications, placementAttempts, courses }
  }, [user?.id], { applications: [], enrollments: [], notifications: [], placementAttempts: [], courses: [] })
  const { applications, enrollments, notifications, placementAttempts, courses } = data

  if (!user) {
    return (
      <main className='max-w-3xl mx-auto px-4 py-20'>
        <Empty title='Log in to view your dashboard' body='Your applications, courses, lessons, and grades are stored under your student account.' />
        <div className='flex justify-center mt-6'>
          <button onClick={() => openAuth()} className='rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-white'>Log in</button>
        </div>
      </main>
    )
  }

  if (loading) {
    return (
      <main className='max-w-3xl mx-auto px-4 py-20 text-center'>
        <p className='text-sm font-semibold text-[var(--color-text)]'>Loading your dashboard...</p>
      </main>
    )
  }

  const userApplications = applications.filter(app => app.studentId === user.id)
  const userEnrollments = enrollments.filter(enrollment => enrollment.studentId === user.id)
  // Courses the student can actually open right now (revoked/suspended are hidden).
  const accessibleEnrollments = userEnrollments.filter(enrollment => enrollment.status === 'active')
  const unread = notifications.filter(n => n.userId === user.id && !n.readAt).length
  const attempts = placementAttempts.filter(attempt => attempt.userId === user.id)
  const availableLessons = userEnrollments.flatMap(e => e.lessons || []).filter(l => l.status === 'available').length
  // Per-course grade = average of that course's tests. Overall = average of the
  // courses that actually have a grade.
  const gradedEnrollments = userEnrollments.filter(e => e.courseAverage != null)
  const avgGrade = gradedEnrollments.length
    ? Math.round(gradedEnrollments.reduce((sum, e) => sum + e.courseAverage, 0) / gradedEnrollments.length)
    : 0

  // Overall average per language = mean of that language's graded courses.
  const languageAverages = Object.entries(
    gradedEnrollments.reduce((acc, e) => {
      const lang = e.course?.language || e.course?.lang || 'Other'
      ;(acc[lang] = acc[lang] || []).push(e.courseAverage)
      return acc
    }, {}),
  ).map(([lang, grades]) => ({
    lang,
    avg: Math.round(grades.reduce((a, b) => a + b, 0) / grades.length),
    count: grades.length,
  }))

  return (
    <main className='max-w-6xl mx-auto px-4 py-12'>
      <div className='mb-10'>
        <p className='text-xs uppercase tracking-widest font-semibold text-[var(--color-text-body)]'>Student dashboard</p>
        <h1 className='text-3xl font-bold text-[var(--color-text)] mt-2'>Welcome back, {user.name}</h1>
        <p className='text-sm text-[var(--color-text-muted)] mt-2'>Track applications, approved courses, lessons, tests, and grades.</p>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10'>
        {[
          ['Applications', userApplications.length, <Clock key='applications' style={{ width: 20, height: 20, color: 'var(--color-accent)' }} />],
          ['Active courses', userEnrollments.filter(e => e.status === 'active').length, <BookOpen key='courses' style={{ width: 20, height: 20, color: 'var(--color-accent)' }} />],
          ['Available lessons', availableLessons, <Check key='lessons' style={{ width: 20, height: 20, color: 'var(--color-accent)' }} />],
          ['Average grade', gradedEnrollments.length ? `${avgGrade}%` : '-', <ChartMixed key='grades' style={{ width: 20, height: 20, color: 'var(--color-accent)' }} />],
        ].map(([label, value, icon]) => (
          <div key={label} className='rounded-2xl border border-[var(--color-border)] bg-white dark:bg-slate-900 p-5'>
            {icon}
            <p className='text-2xl font-bold text-[var(--color-text)] mt-3'>{value}</p>
            <p className='text-sm text-[var(--color-text-muted)]'>{label}</p>
          </div>
        ))}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <section className='lg:col-span-2 space-y-6'>
          <div className='rounded-3xl border border-[var(--color-border)] bg-white dark:bg-slate-900 p-6'>
            <div className='flex items-center justify-between mb-5'>
              <h2 className='text-xl font-bold text-[var(--color-text)]'>My applications</h2>
              <Link to='/courses' className='text-sm font-semibold text-[var(--color-primary)]'>Apply for course</Link>
            </div>
            {userApplications.length ? (
              <div className='space-y-3'>
                {userApplications.map(app => (
                  <div key={app.id} className='rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between'>
                    <div>
                      <p className='font-semibold text-[var(--color-text)]'>{app.courseTitle}</p>
                      <p className='text-sm text-[var(--color-text-muted)]'>
                        {app.receiptFileName ? `Receipt: ${app.receiptFileName}` : 'No receipt required'} · {formatDinars(app.amount)}
                      </p>
                      {app.adminNote && <p className='text-xs text-[var(--color-text-muted)] mt-1'>Admin note: {app.adminNote}</p>}
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                ))}
              </div>
            ) : (
              <Empty title='No applications yet' body='Choose a course and upload your receipt to start approval.' to='/courses' cta='Browse courses' />
            )}
          </div>

          <div className='rounded-3xl border border-[var(--color-border)] bg-white dark:bg-slate-900 p-6'>
            <h2 className='text-xl font-bold text-[var(--color-text)] mb-5'>My courses</h2>
            {accessibleEnrollments.length ? (
              <div className='space-y-3'>
                {accessibleEnrollments.map(enrollment => {
                  const course = enrollment.course || courses.find(item => String(item.id) === String(enrollment.courseId))
                  return (
                    <div key={enrollment.id} className='rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4'>
                      <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3'>
                        <div>
                          <p className='text-xs uppercase tracking-widest font-semibold' style={{ color: course?.color }}>{course?.lang}</p>
                          <h3 className='font-bold text-[var(--color-text)]'>{course?.title}</h3>
                          <p className='text-sm text-[var(--color-text-muted)] mt-1'>{enrollment.progressPercent}% complete · grade {enrollment.courseAverage != null ? `${enrollment.courseAverage}%` : '—'}</p>
                        </div>
                        <div className='flex items-center gap-2'>
                          <StatusBadge status={enrollment.status} />
                          <Link to={`/courses/${enrollment.courseId}/learn`} className='rounded-full bg-[var(--color-primary)] px-4 py-2 text-xs font-bold text-white'>Open</Link>
                        </div>
                      </div>
                      <div className='h-2 bg-[var(--color-accent-faint)] rounded-full overflow-hidden mt-4'>
                        <div className='h-full rounded-full' style={{ width: `${enrollment.progressPercent}%`, background: course?.color }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <Empty title='No approved courses yet' body='Approved applications become course enrollments here.' />
            )}
          </div>
        </section>

        <aside className='space-y-6'>
          <div className='rounded-3xl border border-[var(--color-border)] bg-white dark:bg-slate-900 p-6'>
            <h2 className='text-lg font-bold text-[var(--color-text)] mb-4'>Notifications</h2>
            <p className='text-3xl font-bold text-[var(--color-text)]'>{unread}</p>
            <p className='text-sm text-[var(--color-text-muted)] mb-5'>unread updates</p>
            <Link to='/notifications' className='inline-flex rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-text)]'>View all</Link>
          </div>

          <div className='rounded-3xl border border-[var(--color-border)] bg-white dark:bg-slate-900 p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-lg font-bold text-[var(--color-text)]'>Grades</h2>
              {gradedEnrollments.length > 0 && (
                <span className='text-sm font-bold text-[var(--color-text)]'>Overall {avgGrade}%</span>
              )}
            </div>
            {userEnrollments.length ? (
              <div className='space-y-3'>
                {userEnrollments.map(enrollment => {
                  const course = enrollment.course || courses.find(item => String(item.id) === String(enrollment.courseId))
                  return (
                    <div key={enrollment.id} className='flex items-center justify-between'>
                      <span className='text-sm text-[var(--color-text-muted)]'>
                        {course?.title}
                        {enrollment.courseAverage != null && (
                          <span className='text-[var(--color-text-faint)]'> · {enrollment.gradedTestCount} test{enrollment.gradedTestCount !== 1 ? 's' : ''}</span>
                        )}
                      </span>
                      <span className='font-bold text-[var(--color-text)]'>{enrollment.courseAverage != null ? `${enrollment.courseAverage}%` : '—'}</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className='text-sm text-[var(--color-text-muted)]'>No grades yet.</p>
            )}

            {languageAverages.length > 0 && (
              <div className='mt-5 pt-4 border-t border-[var(--color-border)]'>
                <p className='text-xs uppercase tracking-widest font-semibold text-[var(--color-text-body)] mb-3'>Average per language</p>
                <div className='space-y-2'>
                  {languageAverages.map(({ lang, avg, count }) => (
                    <div key={lang} className='flex items-center justify-between'>
                      <span className='text-sm text-[var(--color-text-muted)]'>
                        {lang}
                        <span className='text-[var(--color-text-faint)]'> · {count} course{count !== 1 ? 's' : ''}</span>
                      </span>
                      <span className='font-bold text-[var(--color-text)]'>{avg}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className='rounded-3xl border border-[var(--color-border)] bg-white dark:bg-slate-900 p-6'>
            <h2 className='text-lg font-bold text-[var(--color-text)] mb-4'>Placement tests</h2>
            {attempts.length ? (
              <div className='space-y-3'>
                {attempts.slice(0, 3).map(attempt => (
                  <div key={attempt.id} className='rounded-2xl bg-[var(--color-panel)] border border-[var(--color-border)] p-4'>
                    <p className='font-semibold text-[var(--color-text)]'>{attempt.language}</p>
                    <p className='text-sm text-[var(--color-text-muted)]'>{attempt.cefr_level} · {attempt.percentage}%</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-sm text-[var(--color-text-muted)]'>No saved placement attempts yet.</p>
            )}
          </div>
        </aside>
      </div>
    </main>
  )
}

export default StudentDashboard
