import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Form from './form'
import Button from './button'
import { useProtectedAction } from '../../hooks/AuthContext'
import { LANDMARK_IMAGES } from '../../data/siteData'

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

            {/* Course Metadata & Status */}
            <div className='flex items-center justify-between pt-1 pb-1 text-xs border-t border-[var(--color-border)]/50'>
              <span className='text-[11.5px] font-semibold text-[var(--color-text-muted)]'>
                {c.type || 'Course Track'}
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  isAvailable
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                }`}
              >
                {enrolled ? 'Enrolled' : pending ? 'Pending' : isAvailable ? 'Available' : 'Closed'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Card Footer CTA ── */}
        <div className='px-5 pb-5 pt-0'>
          {enrolled ? (
            <Button
              fullWidth
              size='sm'
              onClick={handleActionClick}
            >
              Continue Learning →
            </Button>
          ) : pending ? (
            <div className='w-full py-2 rounded-full text-xs font-bold text-center bg-[var(--color-accent-faint)] text-[var(--color-accent-hover)] border border-[var(--color-accent-light)]'>
              Pending Review
            </div>
          ) : (
            <Button
              fullWidth
              size='sm'
              disabled={!isAvailable}
              onClick={handleActionClick}
            >
              {isAvailable ? 'View Course' : 'Closed'}
            </Button>
          )}
        </div>
      </div>

      {/* Enrollment form modal */}
      {form && <Form course={c} onClose={() => setShowForm(false)} />}
    </>
  )
}

export default CourseCard
