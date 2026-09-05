import { useState, useMemo } from 'react'
import { useQuery } from '../../hooks/useQuery'
import { fetchCourseReviews, fetchCourses, getCourseByIdFrom } from '../../services/db'

const FEATURED_TESTIMONIALS = [
  {
    id: 'test-1',
    name: 'Sarah',
    country: 'Algeria',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&fit=crop&crop=face',
    rating: 5,
    text: 'OrchillaLand made learning English so easy and enjoyable. I can now speak with confidence!',
  },
  {
    id: 'test-2',
    name: 'Karim',
    country: 'France',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=face',
    rating: 5,
    text: 'The placement test helped me find the right level. The courses are well structured and fun!',
  },
  {
    id: 'test-3',
    name: 'Lina',
    country: 'Italy',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop&crop=face',
    rating: 5,
    text: 'Great platform with amazing teachers. I love the interactive lessons and real-time practice.',
  },
]

const Reviews = () => {
  const { data: fetched } = useQuery(async () => {
    const [courseReviews, courses] = await Promise.all([fetchCourseReviews(), fetchCourses()])
    return { courseReviews, courses }
  }, [], { courseReviews: [], courses: [] })

  const testimonials = useMemo(() => {
    const published = fetched.courseReviews.filter(r => r.isPublished && r.comment)
    if (published.length >= 3) {
      return published.slice(0, 3).map((r, idx) => {
        const course = getCourseByIdFrom(fetched.courses, r.courseId)
        return {
          id: r.id || `live-${idx}`,
          name: r.studentName || 'Student',
          country: course?.language || 'Learner',
          avatar: FEATURED_TESTIMONIALS[idx % 3].avatar,
          rating: Math.max(1, Math.min(5, Math.round(r.rating || 5))),
          text: r.comment,
        }
      })
    }
    return FEATURED_TESTIMONIALS
  }, [fetched])

  return (
    <div id='reviews' className='h-full flex flex-col justify-between'>
      <div>
        <div className='flex items-center justify-between gap-3 mb-1'>
          <span className='text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]'>
            What Our Students Say
          </span>
        </div>
        <h3 className='text-2xl font-extrabold text-[var(--color-text)] mb-6'>
          Real Results, Real People
        </h3>

        {/* Testimonials 3-Card Grid */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {testimonials.map(t => (
            <div
              key={t.id}
              className='flex flex-col justify-between bg-[var(--color-panel)] rounded-2xl border border-[var(--color-border)] p-4 hover:border-[var(--color-accent)] transition-all duration-300'
            >
              <div>
                {/* 5 Stars */}
                <div className='flex items-center gap-0.5 text-amber-400 text-xs mb-3'>
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>

                {/* Quote */}
                <p className='text-xs text-[var(--color-text-body)] leading-relaxed italic mb-4'>
                  "{t.text}"
                </p>
              </div>

              {/* Student Info */}
              <div className='flex items-center gap-2.5 pt-2 border-t border-[var(--color-border)]/60'>
                <img
                  src={t.avatar}
                  alt={t.name}
                  className='w-7 h-7 rounded-full object-cover ring-2 ring-white dark:ring-[#3D2020]'
                />
                <div>
                  <h4 className='text-xs font-bold text-[var(--color-text)] leading-none'>
                    {t.name}
                  </h4>
                  <p className='text-[10.5px] text-[var(--color-text-muted)] mt-0.5'>
                    {t.country}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Reviews
