import { Routes, Route, Navigate, useLocation } from 'react-router-dom'

import { ThemeProvider } from './hooks/ThemeContext'
import { AdminAuthProvider, useAdminAuth } from './hooks/AdminAuthContext'
import { AdminDataProvider } from './hooks/AdminDataContext'
import { ToastProvider } from './hooks/ToastContext'

import AdminLayout from './components/AdminLayout'
import NotificationsListener from './components/NotificationsListener'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CourseApplications from './pages/CourseApplications'
import Courses from './pages/Courses'
import Offers from './pages/Offers'
import Students from './pages/Students'
import Lessons from './pages/Lessons'
import Assignments from './pages/Assignments'
import Tests from './pages/Tests'
import Books from './pages/Books'
import Posts from './pages/Posts'
import Reviews from './pages/Reviews'
import Notifications from './pages/Notifications'

// Gate: only an authenticated admin reaches the dashboard. Everyone else is
// redirected to /login. The whole app lives behind role === 'admin'.
const RequireAdmin = ({ children }) => {
  const { isAdmin, loading } = useAdminAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-[var(--color-text-muted)]">
        Loading…
      </div>
    )
  }
  if (!isAdmin) return <Navigate to="/login" replace state={{ from: location }} />
  return children
}

// Everything under "/" is the protected admin area, wrapped in data + layout.
const AdminArea = () => (
  <AdminDataProvider>
    <ToastProvider>
      <NotificationsListener />
      <AdminLayout>
        <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/applications" element={<CourseApplications />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/students" element={<Students />} />
        <Route path="/lessons" element={<Lessons />} />
        <Route path="/assignments" element={<Assignments />} />
        <Route path="/tests" element={<Tests />} />
        <Route path="/books" element={<Books />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AdminLayout>
    </ToastProvider>
  </AdminDataProvider>
)

function App() {
  return (
    <ThemeProvider>
      <AdminAuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<RequireAdmin><AdminArea /></RequireAdmin>} />
        </Routes>
      </AdminAuthProvider>
    </ThemeProvider>
  )
}

export default App
