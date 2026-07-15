import { useState, useMemo } from 'react'
import CourseCard from '../ui/courseCard'
import Filter from '../ui/filter'
import { useAuth } from '../../hooks/AuthContext'
import { useQuery } from '../../hooks/useQuery'
import { fetchCourses, fetchEnrollmentSummaries, fetchApplications } from '../../services/db'

const PER_PAGE = 8

const SkeletonCard = () => (
  <div className='bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse'>
    <div className='h-28 bg-gray-100' />
    <div className='px-5 pt-4 pb-5 space-y-3'>
      <div className='h-3 bg-gray-100 rounded w-1/3' />
      <div className='h-12 bg-gray-50 rounded-xl' />
      <div className='flex justify-between'>
        <div className='h-6 bg-gray-100 rounded-full w-16' />
        <div className='h-6 bg-gray-100 rounded-full w-20' />
      </div>
    </div>
  </div>
)

const CourseList = () => {
  const [filters, setFilters] = useState({})
  const [page, setPage] = useState(1)
  const [paging, setPaging] = useState(false)
  const { user } = useAuth()

  const { data, loading } = useQuery(async () => {
    const [courses, enrollments, applications] = await Promise.all([
      fetchCourses(),
      user?.id ? fetchEnrollmentSummaries(user) : [],
      user?.id ? fetchApplications(user) : [],
    ])
    return { courses, enrollments, applications }
  }, [user?.id], { courses: [], enrollments: [], applications: [] })
  const { courses, enrollments, applications } = data

  // Active enrollment = the student has access ("My Courses").
  const enrolledIds = useMemo(
    () => new Set(enrollments.filter(e => e.status === 'active').map(e => String(e.courseId))),
    [enrollments],
  )
  // Applications still awaiting approval → show a "Pending" state, not "Apply".
  const pendingIds = useMemo(
    () => new Set(applications.filter(a => ['pending_approval', 'pending_payment'].includes(a.status)).map(a => String(a.courseId))),
    [applications],
  )

  const myCourses = useMemo(
    () => courses.filter(c => enrolledIds.has(String(c.id)) && c.status !== 'archived'),
    [courses, enrolledIds],
  )

  // Everything the student hasn't paid for yet (incl. pending), with filters.
  const newCourses = useMemo(
    () => courses.filter(c =>
      !enrolledIds.has(String(c.id)) &&
      c.status !== 'archived' &&
      (!filters.price || c.price === filters.price) &&
      (!filters.language || c.lang === filters.language) &&
      (!filters.type || c.type === filters.type)
    ),
    [courses, enrolledIds, filters],
  )

  const totalPages = Math.ceil(newCourses.length / PER_PAGE)
  const paginated = newCourses.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const onFilter = (next) => { setFilters(next); setPage(1) }
  const handlePage = (p) => {
    setPaging(true)
    setTimeout(() => { setPage(p); setPaging(false) }, 400)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className='space-y-12'>
      {/* ── My Courses ── */}
      {myCourses.length > 0 && (
        <section>
          <h2 className='text-2xl font-bold text-[var(--color-text)]'>My Courses</h2>
          <p className='text-sm text-gray-400 mt-1 mb-5'>Courses you have access to — pick up where you left off.</p>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
            {myCourses.map((c, i) => <CourseCard key={c.id} c={c} index={i} enrolled />)}
          </div>
        </section>
      )}

      {/* ── New courses for you ── */}
      <section>
        <h2 className='text-2xl font-bold text-[var(--color-text)]'>New courses for you</h2>
        <p className='text-sm text-gray-400 mt-1 mb-5'>Courses you haven’t enrolled in yet. Apply and upload your receipt to get access.</p>

        <Filter onChange={onFilter} />

        <div className='flex items-center justify-between mt-6 mb-4'>
          <p className='text-sm text-gray-400'>
            Showing <span className='font-medium text-gray-600'>{newCourses.length}</span> course{newCourses.length !== 1 ? 's' : ''}
          </p>
        </div>

        {loading || paging ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
            {Array(PER_PAGE).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : newCourses.length ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
            {paginated.map((c, i) => <CourseCard key={c.id} c={c} index={i} pending={pendingIds.has(String(c.id))} />)}
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center py-24 text-center'>
            <p className='text-5xl mb-4'>🔍</p>
            <p className='text-gray-700 font-medium mb-1'>No courses found</p>
            <p className='text-gray-400 text-sm'>Try adjusting or clearing your filters</p>
          </div>
        )}

        {totalPages > 1 && !loading && !paging && (
          <div className='flex items-center justify-center gap-2 mt-10'>
            <button
              onClick={() => handlePage(page - 1)}
              disabled={page === 1}
              className='px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-400 hover:border-[#1D9E75] hover:text-[#1D9E75] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200'
            >
              ←
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => handlePage(p)}
                className={`w-9 h-9 text-sm rounded-xl border transition-all duration-200 ${
                  page === p
                    ? 'bg-[#1D9E75] text-white border-[#1D9E75]'
                    : 'border-gray-200 text-gray-400 hover:border-[#1D9E75] hover:text-[#1D9E75]'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => handlePage(page + 1)}
              disabled={page === totalPages}
              className='px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-400 hover:border-[#1D9E75] hover:text-[#1D9E75] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200'
            >
              →
            </button>
          </div>
        )}
      </section>
    </div>
  )
}

export default CourseList
