import CourseList from '../components/layout/courseList'

const Courses = () => {
  return (
    <div className='max-w-6xl mx-auto px-4 py-16'>
      {/* Page header */}
      <div className='mb-10'>
        <p className='text-xs uppercase tracking-widest text-[#1D9E75] font-semibold mb-2'>All courses</p>
        <h1 className='text-3xl font-bold text-[var(--color-text)]'>Your courses & new picks</h1>
        <p className='text-gray-400 text-sm mt-2'>Open the courses you have access to, or browse and apply for new ones.</p>
      </div>

      <CourseList />
    </div>
  )
}

export default Courses
