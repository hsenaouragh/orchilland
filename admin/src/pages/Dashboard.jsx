import { useNavigate } from 'react-router-dom'
import {
  Receipt, FileDollar, Persons, GraduationCap, BookOpen, ListCheck, Bell,
} from '@gravity-ui/icons'
import { useAdminData } from '../hooks/AdminDataContext'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import { PageHeader, Panel, EmptyNote } from '../components/ui'
import { formatDate, timeAgo, money } from '../lib/format'

const Dashboard = () => {
  const data = useAdminData()
  const navigate = useNavigate()

  if (data.loading) return <p className="text-sm text-[var(--color-text-muted)]">Loading dashboard…</p>

  const pendingApplications = data.course_applications.filter((a) => a.status === 'pending_approval').length
  const pendingReceipts = data.payment_receipts.filter((r) => r.status === 'pending').length
    + data.book_payment_receipts.filter((r) => r.status === 'pending').length
  const activeStudents = data.enrollments.filter((e) => e.status === 'active')
    .reduce((set, e) => set.add(e.student_id), new Set()).size
  const activeCourses = data.courses.filter((c) => c.status === 'available').length
  const publishedLessons = data.lessons.filter((l) => l.is_published).length
  const pendingTestSubs = data.course_test_attempts.filter((a) => a.grade_percent == null).length
  const unreadNotifications = data.notifications.filter((n) => !n.read_at && (!data.adminId || n.user_id === data.adminId)).length

  const cards = [
    { label: 'Pending applications', value: pendingApplications, icon: Receipt, tone: 'maroon', to: '/applications' },
    { label: 'Pending receipts', value: pendingReceipts, icon: FileDollar, tone: 'orange', to: '/applications' },
    { label: 'Active students', value: activeStudents, icon: Persons, tone: 'green', to: '/students' },
    { label: 'Active courses', value: activeCourses, icon: GraduationCap, tone: 'orange', to: '/courses' },
    { label: 'Published lessons', value: publishedLessons, icon: BookOpen, tone: 'green', to: '/lessons' },
    { label: 'Pending test submissions', value: pendingTestSubs, icon: ListCheck, tone: 'maroon', to: '/tests' },
    { label: 'Unread notifications', value: unreadNotifications, icon: Bell, tone: 'orange', to: '/notifications' },
  ]

  const recentApplications = [...data.course_applications]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5)
  const recentNotifications = [...data.notifications]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6)

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Operational overview of OrchillaLand." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <StatCard key={c.label} {...c} onClick={() => navigate(c.to)} />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel title="Recent applications" className="lg:col-span-2">
          {recentApplications.length === 0 ? (
            <EmptyNote>No applications yet.</EmptyNote>
          ) : (
            <div className="space-y-2">
              {recentApplications.map((app) => {
                const student = data.userById(app.student_id)
                const course = data.courseById(app.course_id)
                return (
                  <button
                    key={app.id}
                    onClick={() => navigate('/applications')}
                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3 text-left transition hover:border-[var(--color-accent)]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--color-text)]">{student?.name || 'Student'}</p>
                      <p className="truncate text-xs text-[var(--color-text-muted)]">{course?.title} · {money(app.amount)} · {formatDate(app.created_at)}</p>
                    </div>
                    <StatusBadge status={app.status} />
                  </button>
                )
              })}
            </div>
          )}
        </Panel>

        <Panel title="Latest activity">
          {recentNotifications.length === 0 ? (
            <EmptyNote>Nothing new.</EmptyNote>
          ) : (
            <ul className="space-y-3">
              {recentNotifications.map((n) => (
                <li key={n.id} className="flex gap-3">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read_at ? 'bg-[var(--color-text-faint)]' : 'bg-[var(--color-accent)]'}`} />
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text)]">{n.title}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{n.message}</p>
                    <p className="mt-0.5 text-xs text-[var(--color-text-faint)]">{timeAgo(n.created_at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  )
}

export default Dashboard
