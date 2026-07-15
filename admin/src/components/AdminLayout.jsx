import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  Speedometer, Receipt, GraduationCap, Persons, BookOpen, FileText,
  ListCheck, Book, PencilToLine, Star, Bell, Moon, Sun, ArrowRightFromSquare,
  Bars, Xmark, Tag,
} from '@gravity-ui/icons'
import { useTheme } from '../hooks/ThemeContext'
import { useAdminAuth } from '../hooks/AdminAuthContext'
import { useAdminData } from '../hooks/AdminDataContext'
import { initials } from '../lib/format'

// Sidebar structure — order matches the brief.
const NAV = [
  { to: '/', label: 'Dashboard', icon: Speedometer, end: true },
  { to: '/applications', label: 'Course Applications', icon: Receipt, badge: 'applications' },
  { to: '/courses', label: 'Courses', icon: GraduationCap },
  { to: '/offers', label: 'Offers', icon: Tag, badge: 'offers' },
  { to: '/students', label: 'Students', icon: Persons },
  { to: '/lessons', label: 'Lessons', icon: BookOpen },
  { to: '/assignments', label: 'Assignments', icon: FileText },
  { to: '/tests', label: 'Tests', icon: ListCheck },
  { to: '/books', label: 'Books', icon: Book, badge: 'books' },
  { to: '/posts', label: 'Posts', icon: PencilToLine },
  { to: '/reviews', label: 'Reviews', icon: Star },
  { to: '/notifications', label: 'Notifications', icon: Bell, badge: 'notifications' },
]

const AdminLayout = ({ children }) => {
  const { theme, toggleTheme } = useTheme()
  const { user, signOut } = useAdminAuth()
  const data = useAdminData()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  // Live counts feed the small sidebar badges.
  const badges = {
    applications: data.course_applications.filter((a) => a.status === 'pending_approval' || a.status === 'pending_payment').length,
    books: data.book_orders.filter((o) => o.status === 'pending_approval').length,
    offers: (data.offerClaims || []).filter((c) => c.status === 'pending').length,
    notifications: data.notifications.filter((n) => !n.read_at && (!data.adminId || n.user_id === data.adminId)).length,
  }

  const Sidebar = (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-primary)] text-sm font-black text-white">O</span>
        <div className="leading-tight">
          <p className="text-sm font-black text-[var(--color-text)]">OrchillaLand</p>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent)]">Admin</p>
        </div>
      </div>

      <nav className="admin-scroll flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {NAV.map(({ to, label, icon: Icon, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                isActive
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-[var(--color-text-body)] hover:bg-[var(--color-accent-faint)] hover:text-[var(--color-accent)]'
              }`
            }
          >
            <Icon style={{ width: 18, height: 18 }} />
            <span className="flex-1">{label}</span>
            {badge && badges[badge] > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-accent)] px-1.5 text-xs font-bold text-white">
                {badges[badge]}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-[var(--color-border)] p-3">
        <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-bold text-white">
            {initials(user?.name, user?.email)}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-semibold text-[var(--color-text)]">{user?.name}</p>
            <p className="truncate text-xs text-[var(--color-text-muted)]">{user?.email}</p>
          </div>
          <button
            onClick={signOut}
            title="Sign out"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition hover:bg-[var(--color-danger-faint)] hover:text-[var(--color-danger)]"
          >
            <ArrowRightFromSquare style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </div>
    </aside>
  )

  const pageTitle = NAV.find((n) => (n.end ? location.pathname === n.to : location.pathname.startsWith(n.to) && n.to !== '/'))?.label
    || (location.pathname === '/' ? 'Dashboard' : 'Admin')

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg)] text-[var(--color-text)]">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">{Sidebar}</div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0">{Sidebar}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] lg:hidden"
              aria-label="Toggle menu"
            >
              {open ? <Xmark style={{ width: 18, height: 18 }} /> : <Bars style={{ width: 18, height: 18 }} />}
            </button>
            <h1 className="text-lg font-bold text-[var(--color-text)]">{pageTitle}</h1>
          </div>

          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            {theme === 'dark' ? <Sun style={{ width: 16, height: 16 }} /> : <Moon style={{ width: 16, height: 16 }} />}
          </button>
        </header>

        <main className="admin-scroll flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
