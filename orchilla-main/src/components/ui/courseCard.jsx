import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Form from './form'
import { useProtectedAction } from '../../hooks/AuthContext'
import { LANDMARK_IMAGES } from '../../data/siteData'

// Dummy learner avatar faces for social proof stack
const LEARNER_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=face',
]

const CourseCard = ({ c, index = 0, enrolled = false, pending = false }) => {
  const ref = useRef(null)
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)
  const [form, setShowForm] = useState(false)
  const protect = useProtectedAction()
  const isAvailable = c.status === 'available'

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const landmark = c.landmark || LANDMARK_IMAGES[c.lang] || LANDMARK_IMAGES.English
  const learners = c.learners || (c.students > 0 ? `${c.students}+ learners` : '10.2K+ learners')
  const rating = c.rating || '4.8 (1.2K reviews)'
  const tagline = c.tagline || c.description || 'Master conversation, grammar and real-world fluency.'

  const handleActionClick = (e) => {
    e.stopPropagation()
    if (enrolled) {
      navigate(`/courses/${c.id}/learn`)
    } else if (pending) {
      // already pending
    } else if (isAvailable) {
      protect(() => setShowForm(true))()
    }
  }

  return (
    <>
      <div
        ref={ref}
        onClick={handleActionClick}
        className='group flex flex-col justify-between bg-white dark:bg-[#3D2020] rounded-3xl border border-[var(--color-border)] overflow-hidden transition-all duration-300 cursor-pointer'
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(24px)',
          transition: `opacity .5s ease ${index * 60}ms, transform .5s ease ${index * 60}ms, box-shadow .3s ease, border-color .3s ease`,
          boxShadow: '0 2px 12px rgba(78, 0, 0, 0.04)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = '0 12px 32px rgba(78, 0, 0, 0.12)'
          e.currentTarget.style.borderColor = 'var(--color-accent)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = '0 2px 12px rgba(78, 0, 0, 0.04)'
          e.currentTarget.style.borderColor = 'var(--color-border)'
        }}
      >
        <div>
          {/* ── Landmark Top Banner ── */}
          <div className='relative h-44 overflow-hidden bg-[var(--color-panel)]'>
            <img
              src={landmark}
              alt={c.title}
              className='w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105'
            />
            <div className='absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity' />

            {/* Badges Overlay */}
            <div className='absolute top-3 left-3 right-3 flex items-center justify-between'>
              {/* Flag + Level Pill */}
              <div className='flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 dark:bg-[#2A1515]/90 backdrop-blur-md border border-white/20 shadow-sm'>
                {c.flag && (
                  <img src={c.flag} alt={c.lang} className='w-4 h-4 object-contain rounded-full' />
                )}
                <span className='text-[11px] font-bold text-[var(--color-text)]'>
                  {c.level || 'Beginner – Advanced'}
                </span>
              </div>

              {/* Status pill (VIP / Popular / Enrolled) */}
              {enrolled ? (
                <span className='text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500 text-white shadow'>
                  Enrolled
                </span>
              ) : pending ? (
                <span className='text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500 text-white shadow'>
                  Pending
                </span>
              ) : c.type === 'VIP courses' ? (
                <span className='text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-600 text-white shadow'>
                  VIP
                </span>
              ) : (
                <span className='text-[11px] font-bold px-2.5 py-1 rounded-full bg-black/60 text-white backdrop-blur-sm'>
                  {c.price === 'Free' ? 'Free' : (c.price_amount || 'Paid')}
                </span>
              )}
            </div>
          </div>

          {/* ── Card Content ── */}
          <div className='p-5'>
            <div className='flex items-baseline justify-between gap-2 mb-1.5'>
              <h3 className='text-lg font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] dark:group-hover:text-[var(--color-accent)] transition-colors'>
                {c.lang || c.title}
              </h3>
              <span className='text-xs font-semibold text-[var(--color-text-muted)]'>
                {c.duration || '8 weeks'}
              </span>
            </div>

            <p className='text-xs text-[var(--color-text-body)] leading-relaxed line-clamp-2 mb-4'>
              {tagline}
            </p>

            {/* Social Proof + Rating */}
            <div className='flex items-center justify-between pt-1 pb-2 text-xs'>
              {/* Avatars + Learner Count */}
              <div className='flex items-center gap-2'>
                <div className='flex -space-x-2 overflow-hidden'>
                  {LEARNER_AVATARS.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt='Learner'
                      className='inline-block w-5 h-5 rounded-full ring-2 ring-white dark:ring-[#3D2020] object-cover'
                    />
                  ))}
                </div>
                <span className='text-[11.5px] font-semibold text-[var(--color-text-muted)]'>
                  {learners}
                </span>
              </div>

              {/* Star Rating */}
              <div className='flex items-center gap-1 font-bold text-[11.5px] text-amber-500'>
                <span>★</span>
                <span className='text-[var(--color-text)] dark:text-amber-400'>{rating}</span>
              </div>
            </div>

            {/* Enrolled Progress Bar */}
            {enrolled && (
              <div className='mt-2 pt-2 border-t border-[var(--color-border)]'>
                <div className='flex items-center justify-between text-[11px] font-semibold text-[var(--color-text-muted)] mb-1'>
                  <span>Course progress</span>
                  <span className='text-emerald-600 font-bold'>Active</span>
                </div>
                <div className='w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden'>
                  <div className='bg-emerald-500 h-full rounded-full' style={{ width: '45%' }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Card Footer CTA ── */}
        <div className='px-5 pb-5 pt-0'>
          {enrolled ? (
            <button
              onClick={handleActionClick}
              className='w-full py-2.5 rounded-full text-xs font-bold text-white transition-all duration-200'
              style={{
                backgroundColor: 'var(--color-primary)',
                boxShadow: '0 2px 10px rgba(78, 0, 0, 0.2)',
              }}
            >
              Continue Learning →
            </button>
          ) : pending ? (
            <div className='w-full py-2.5 rounded-full text-xs font-bold text-center bg-[var(--color-accent-faint)] text-[var(--color-accent-hover)] border border-[var(--color-accent-light)]'>
              Pending Review
            </div>
          ) : (
            <button
              onClick={handleActionClick}
              disabled={!isAvailable}
              className='w-full py-2.5 rounded-full text-xs font-bold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed'
              style={{
                backgroundColor: isAvailable ? 'var(--color-primary)' : 'gray',
                boxShadow: isAvailable ? '0 2px 10px rgba(78, 0, 0, 0.2)' : 'none',
              }}
              onMouseEnter={e => {
                if (isAvailable) e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'
              }}
              onMouseLeave={e => {
                if (isAvailable) e.currentTarget.style.backgroundColor = 'var(--color-primary)'
              }}
            >
              {isAvailable ? 'View Course' : 'Closed'}
            </button>
          )}
        </div>
      </div>

      {/* Enrollment form modal */}
      {form && <Form course={c} onClose={() => setShowForm(false)} />}
    </>
  )
}

export default CourseCard
