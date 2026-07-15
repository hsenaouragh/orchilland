import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Form from './form'
import Button from './button'
import { useProtectedAction } from '../../hooks/AuthContext'

const CourseCard = ({ c, index = 0, enrolled = false, pending = false }) => {
  const ref = useRef(null)
  const navigate                = useNavigate()
  const [visible, setVisible]   = useState(false)
  const [form, setShowForm]     = useState(false)
  const protect                 = useProtectedAction()
  const isAvailable             = c.status === 'available'

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <>
      <div
        ref={ref}
        className='group bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer'
        style={{
          opacity:   visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(28px)',
          transition: `opacity .6s ease ${index * 80}ms, transform .6s ease ${index * 80}ms`,
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.10)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'}
      >
        {/* Header */}
        <div className='relative h-28 flex items-end px-5 pb-4 overflow-hidden' style={{ background: `${c.color}12` }}>
          <div className='absolute inset-0 flex items-center justify-center'>
            <img
              src={c.flag}
              alt={c.lang}
              className='object-contain select-none pointer-events-none'
              style={{ opacity: 0.18 }}
            />
          </div>

          <div className='absolute top-3 right-3 flex flex-col gap-1 items-end'>
            {c.students > 500 && (
              <span className='text-[9px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[var(--color-accent-faint)] text-[var(--color-accent-hover)]'>
                Popular
              </span>
            )}
            {c.type === 'VIP courses' && (
              <span className='text-[9px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-purple-50 text-purple-400'>
                VIP
              </span>
            )}
            {!isAvailable && (
              <span className='text-[9px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-gray-100 text-gray-500'>
                Not available
              </span>
            )}
          </div>

          <div className='relative z-10'>
            <p className='text-[10px] uppercase tracking-widest font-semibold mb-1' style={{ color: c.color }}>
              {c.lang}
            </p>
            <h3 className='text-[15px] font-semibold text-gray-900 leading-snug group-hover:text-gray-600 transition-colors duration-300'>
              {c.title}
            </h3>
          </div>
        </div>

        {/* Body */}
        <div className='px-5 pt-4 pb-5 space-y-4'>
          <p className='text-[11px] uppercase tracking-widest text-gray-300'>{c.type}</p>

          {c.description && (
            <p className='text-xs text-gray-500 leading-relaxed line-clamp-2'>{c.description}</p>
          )}

          <div className='grid grid-cols-2 text-center text-xs text-gray-400 bg-gray-50 rounded-xl py-3'>
            <div>
              <p className='font-medium text-gray-600 text-sm'>{c.duration}</p>
              <p className='text-[10px] mt-0.5'>Duration</p>
            </div>
            <div className='border-l border-gray-100'>
              <p className='font-medium text-gray-600 text-sm'>{c.level}</p>
              <p className='text-[10px] mt-0.5'>Level</p>
            </div>
          </div>

          <div className='flex items-center justify-between pt-1'>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${c.price === 'Free' ? 'bg-emerald-50 text-emerald-600' : 'text-gray-700 text-sm font-bold'}`}>
              {c.price === 'Free' ? 'Free' : c.price_amount}
            </span>

            {/* Enrolled → open; pending application → show status; else apply. */}
            {enrolled ? (
              <Button
                onClick={() => navigate(`/courses/${c.id}/learn`)}
                className='text-xs font-medium px-4 py-1.5 rounded-full text-white transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0'
                style={{ background: c.color }}
              >
                Open
              </Button>
            ) : pending ? (
              <span className='text-xs font-semibold px-4 py-1.5 rounded-full' style={{ background: 'var(--color-accent-faint)', color: 'var(--color-accent-hover)' }}>
                Pending review
              </span>
            ) : (
              <Button
                onClick={isAvailable ? protect(() => setShowForm(true)) : undefined}
                disabled={!isAvailable}
                className='text-xs font-medium px-4 py-1.5 rounded-full text-white transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0'
                style={{ background: isAvailable ? c.color : 'var(--color-text-faint)' }}
              >
                {isAvailable ? 'Apply ->' : 'Closed'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Enrollment form portal — only opens when logged in */}
      {form && <Form course={c} onClose={() => setShowForm(false)} />}
    </>
  )
}

export default CourseCard
