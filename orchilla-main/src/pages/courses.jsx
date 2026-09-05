import CourseList from '../components/layout/courseList'

const Courses = () => {
  return (
    <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
      {/* Page header banner */}
      <div className='mb-12 p-8 md:p-10 rounded-3xl bg-[var(--color-panel)] border border-[var(--color-border)]'>
        <span className='text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]'>
          Course Catalog
        </span>
        <h1 className='text-3xl sm:text-4xl font-extrabold text-[var(--color-text)] mt-1.5'>
          Explore Language Courses
        </h1>
        <p className='text-sm text-[var(--color-text-muted)] mt-2 max-w-2xl leading-relaxed'>
          Find your next course, check enrollment status, and continue lessons with expert tutors and interactive exercises.
        </p>
      </div>

      <CourseList />
    </main>
  )
}

export default Courses
