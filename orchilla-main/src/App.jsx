import Home from './pages/home'
import Courses from './pages/courses'
import Offers from './pages/Offers'
import PlacementTest from './pages/placementTest'
import StudentDashboard from './pages/StudentDashboard'
import CourseLearn from './pages/CourseLearn'
import CourseTest from './pages/CourseTest'
import Books from './pages/Books'
import BookDetail from './pages/BookDetail'
import Posts from './pages/Posts'
import PostDetail from './pages/PostDetail'
import Notifications from './pages/Notifications'
import ProfileSettings from './pages/ProfileSettings'

import Header from './components/layout/header'
import Footer from './components/layout/footer'
import NotificationsListener from './components/NotificationsListener'

import { Routes, Route } from 'react-router-dom'
import TestPage from './pages/testPage'

import { AuthProvider } from './hooks/AuthContext'
import { ThemeProvider } from './hooks/ThemeContext'
import { ToastProvider } from './hooks/ToastContext'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <NotificationsListener />
          <div className='min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-300'>
            <Header />
          <Routes>
              <Route path='/'               element={<Home />} />
              <Route path='/courses'        element={<Courses />} />
              <Route path='/offers'         element={<Offers />} />
              <Route path='/courses/:courseId/learn' element={<CourseLearn />} />
              <Route path='/placement-test' element={<PlacementTest />} />
              <Route path='/test'           element={<TestPage />} />
              <Route path='/student/dashboard' element={<StudentDashboard />} />
              <Route path='/cart'           element={<StudentDashboard />} />
              <Route path='/student/courses/:courseId/tests/:testId' element={<CourseTest />} />
              <Route path='/books'          element={<Books />} />
              <Route path='/books/:bookId'  element={<BookDetail />} />
              <Route path='/posts'          element={<Posts />} />
              <Route path='/posts/:postId'  element={<PostDetail />} />
              <Route path='/notifications'  element={<Notifications />} />
              <Route path='/profile/edit'     element={<ProfileSettings />} />
              <Route path='/profile/password' element={<ProfileSettings />} />
            </Routes>
            <Footer />
          </div>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
