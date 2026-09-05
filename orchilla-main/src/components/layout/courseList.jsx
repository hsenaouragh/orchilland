import { useState, useMemo } from 'react'
import CourseCard from '../ui/courseCard'
import Filter from '../ui/filter'
import { useAuth } from '../../hooks/AuthContext'
import { useQuery } from '../../hooks/useQuery'
import { fetchCourses, fetchEnrollmentSummaries, fetchApplications } from '../../services/db'

const PER_PAGE = 8

const SkeletonCard = () => (
  <div className='bg-white dark:bg-[#3D2020] rounded-3xl border border-[var(--color-border)] overflow-hidden animate-pulse'>
    <div className='h-44 bg-gray-100 dark:bg-gray-800' />
    <div className='p-5 space-y-3'>
      <div className='h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/3' />
      <div className='h-10 bg-gray-50 dark:bg-gray-700/50 rounded-xl' />
      <div className='flex justify-between pt-2'>
        <div className='h-5 bg-gray-100 dark:bg-gray-800 rounded-full w-20' />
        <div className='h-5 bg-gray-100 dark:bg-gray-800 rounded-full w-16' />
      </div>
      <div className='h-9 bg-gray-100 dark:bg-gray-800 rounded-full w-full mt-4' />
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
    setTimeout(() => { setPage(p); setPaging(false) }, 300)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className='space-y-14'>
      {/* ── My Courses ── */}
      {myCourses.length > 0 && (
        <section>
          <div className='mb-6'>
            <span className='text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]'>
              Enrolled Courses
            </span>
            <h2 className='text-2xl font-extrabold text-[var(--color-text)] mt-1'>My Courses</h2>
            <p className='text-sm text-[var(--color-text-muted)] mt-1'>
              Continue your lessons and track your progress where you left off.
            </p>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
            {myCourses.map((c, i) => <CourseCard key={c.id} c={c} index={i} enrolled />)}
          </div>
        </section>
      )}

      {/* ── New courses for you ── */}
      <section>
        <div className='mb-6'>
          <span className='text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]'>
            Discover More
          </span>
          <h2 className='text-2xl font-extrabold text-[var(--color-text)] mt-1'>Available Courses</h2>
          <p className='text-sm text-[var(--color-text-muted)] mt-1'>
            Choose your language and level. Apply and upload your payment receipt to gain instant access.
          </p>
        </div>

        <Filter onChange={onFilter} />

        <div className='flex items-center justify-between mt-6 mb-4 px-1'>
          <p className='text-xs font-semibold text-[var(--color-text-muted)]'>
            Showing <span className='font-bold text-[var(--color-text)]'>{newCourses.length}</span> courses
          </p>
        </div>

        {loading || paging ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
            {Array(PER_PAGE).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : newCourses.length ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
            {paginated.map((c, i) => (
              <CourseCard
                key={c.id}
                c={c}
                index={i}
                pending={pendingIds.has(String(c.id))}
              />
            ))}
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-[#3D2020] rounded-3xl border border-[var(--color-border)] p-8'>
            <span className='text-4xl mb-3'>🔍</span>
            <h3 className='text-base font-bold text-[var(--color-text)] mb-1'>No courses found</h3>
            <p className='text-xs text-[var(--color-text-muted)]'>Try clearing or adjusting your filter selections</p>
          </div>
        )}

        {totalPages > 1 && !loading && !paging && (
          <div className='flex items-center justify-center gap-2 mt-12'>
            <button
              onClick={() => handlePage(page - 1)}
              disabled={page === 1}
              className='px-4 py-2 text-xs font-bold rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all'
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => handlePage(p)}
                className={`w-9 h-9 text-xs font-bold rounded-full transition-all ${
                  page === p
                    ? 'bg-[var(--color-primary)] text-white shadow-md'
                    : 'border border-[var(--color-border)] text-[var(--color-text-body)] hover:border-[var(--color-accent)]'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => handlePage(page + 1)}
              disabled={page === totalPages}
              className='px-4 py-2 text-xs font-bold rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all'
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  )
}

export default CourseList
