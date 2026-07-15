import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Check, BookOpen, Xmark, Person, EnvelopeOpen, Handset, ArrowRight } from '@gravity-ui/icons'
import FaceId from '../../assets/face-id.png'
import { useAuth, useProtectedAction } from '../../hooks/AuthContext'

// ─── Brand palette ─────────────────────────────────────────────────────────────
const C = {
  orange:      'var(--color-accent)',
  orangeFaint: 'var(--color-accent-faint)',
  maroon:      'var(--color-primary)',
  maroonHov:   'var(--color-primary-hover)',
  green:       'var(--color-green)',
  greenFaint:  'var(--color-green-faint)',
  brown:       'var(--color-text-body)',
  white:       'var(--color-surface)',
  border:      'var(--color-border)',
  text:        'var(--color-text)',
  textMuted:   'var(--color-text-muted)',
  textFaint:   'var(--color-text-faint)',
  wrongBg:     'var(--color-danger-faint)',
  wrong:       'var(--color-danger)',
}

const tint = (color, amount) => `color-mix(in srgb, ${color} ${amount}%, transparent)`

// ─── How many courses a user must be enrolled in to claim membership ───────────
const REQUIRED_COURSES = 3

// ─── Membership cards data ────────────────────────────────────────────────────
const CARDS = [
  {
    bg: '#1D9E75', accent: '#0F6E56', label: 'Premium Member',
    name: 'Sarah Johnson', id: 'LG-2024-0391', level: 'Advanced · English',
    title: 'Learn at your own pace',
    body: 'Our adaptive curriculum adjusts to your level and schedule. Whether you have 10 minutes or 2 hours, every session is designed to move you forward efficiently.',
  },
  {
    bg: '#534AB7', accent: '#3C3489', label: 'Pro Member',
    name: 'Ahmed Benali', id: 'LG-2024-0512', level: 'Intermediate · French',
    title: 'Real conversation practice',
    body: 'Go beyond grammar drills. Practice with AI tutors and native speakers through live scenarios that build confidence for real-world situations.',
  },
]

// ─── Flip Card ────────────────────────────────────────────────────────────────
const Card = ({ c, style }) => (
  <div
    className='absolute inset-0 rounded-2xl p-4 flex flex-col justify-between'
    style={{ background: c.bg, ...style }}
  >
    <div className='flex justify-between'>
      <div>
        <p className='text-white/50 text-[9px] uppercase tracking-widest'>LinguaLearn</p>
        <p className='text-white text-[10px] font-medium mt-0.5'>{c.label}</p>
      </div>
      <img src={FaceId} className='w-10' alt="face-id" />
    </div>
    <div className='flex justify-center'>
      <div
        className='w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-medium'
        style={{ background: c.accent }}
      >
        {c.name.split(' ').map(n => n[0]).join('')}
      </div>
    </div>
    <div>
      <p className='text-white text-xs font-medium'>{c.name}</p>
      <p className='text-white/50 text-[9px] mt-0.5'>{c.level}</p>
      <p className='text-white/30 text-[8px] tracking-widest mt-1'>{c.id}</p>
    </div>
  </div>
)

// ─── Membership Form Modal ─────────────────────────────────────────────────────
// Shown when user IS logged in AND has enough courses enrolled
const MembershipFormModal = ({ onClose }) => {
  const { user } = useAuth()
  const [step, setStep]         = useState('form') // form | success
  const [loading, setLoading]   = useState(false)
  const [form, setForm]         = useState({
    name:  user?.name  || '',
    email: user?.email || '',
    phone: '',
    plan:  'Pro',
  })
  const [errors, setErrors] = useState({})

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    setErrors(er => ({ ...er, [field]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim())        e.name  = 'Name is required'
    if (!form.email.includes('@')) e.email = 'Valid email required'
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 900))
    setLoading(false)
    setStep('success')
  }

  const PLANS = [
    { id: 'Pro',     label: 'Pro',     price: '$19/mo', color: '#534AB7' },
    { id: 'Premium', label: 'Premium', price: '$29/mo', color: C.green   },
  ]

  const Field = ({ icon: Icon, label, required, type = 'text', field, placeholder }) => (
    <div>
      <label className='block text-xs font-medium text-gray-500 mb-1.5'>
        {label}{required && <span className='text-red-400 ml-0.5'>*</span>}
      </label>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px', borderRadius: 12,
        border: `1.5px solid ${errors[field] ? C.wrong : form[field] ? C.orange : C.border}`,
        background: errors[field] ? C.wrongBg : C.white,
        transition: 'border-color 0.2s ease',
      }}>
        <Icon style={{ width: 15, height: 15, color: errors[field] ? C.wrong : C.textMuted, flexShrink: 0 }} />
        <input
          type={type}
          value={form[field]}
          onChange={set(field)}
          placeholder={placeholder}
          style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent',
            fontSize: 13.5, color: C.text, fontFamily: 'inherit',
          }}
        />
      </div>
      {errors[field] && (
        <p style={{ fontSize: 11, color: C.wrong, margin: '4px 0 0 4px' }}>{errors[field]}</p>
      )}
    </div>
  )

  return createPortal(
    <div
      className='fixed inset-0 z-50 flex items-center justify-center px-4'
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className='bg-white rounded-3xl w-full max-w-md overflow-hidden'
        style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.20)' }}
        onClick={e => e.stopPropagation()}
      >
        {step === 'success' ? (
          /* ── Success ── */
          <div className='p-10 flex flex-col items-center text-center'>
            <div style={{
              width: 68, height: 68, borderRadius: '50%', marginBottom: 18,
              background: C.greenFaint, border: `2px solid ${C.green}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Check style={{ width: 30, height: 30, color: C.green }} />
            </div>
            <h3 className='text-xl font-bold text-gray-900 mb-1'>Welcome, {form.name.split(' ')[0]}!</h3>
            <p className='text-gray-400 text-sm mb-1'>Your <strong className='text-gray-700'>{form.plan}</strong> membership is active.</p>
            <p className='text-gray-400 text-sm mb-7'>Confirmation sent to <strong className='text-gray-700'>{form.email}</strong></p>
            <button
              onClick={onClose}
              className='w-full py-3 rounded-2xl text-white font-bold text-sm'
              style={{ background: C.green }}
            >
              Start Learning →
            </button>
          </div>
        ) : (
          <>
            {/* ── Orange header ── */}
            <div className='relative px-7 pt-7 pb-6' style={{ background: `linear-gradient(135deg, ${tint(C.orange, 14)}, ${C.orangeFaint})`, borderBottom: `1px solid ${C.border}` }}>
              <button
                onClick={onClose}
                style={{
                  position: 'absolute', top: 14, right: 14,
                  width: 30, height: 30, borderRadius: '50%',
                  border: `1.5px solid ${C.border}`, background: C.white,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: C.textMuted,
                }}
              >
                <Xmark style={{ width: 13, height: 13 }} />
              </button>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: C.brown, margin: '0 0 4px' }}>
                Membership Registration
              </p>
              <h2 className='text-xl font-bold text-gray-900 mb-1'>Claim your membership</h2>
              <p className='text-gray-500 text-sm'>Fill in your details to activate your plan.</p>
            </div>

            {/* ── Form body ── */}
            <div className='px-7 py-6 space-y-4'>

              {/* Plan selector */}
              <div>
                <label className='block text-xs font-medium text-gray-500 mb-2'>Choose plan</label>
                <div className='flex gap-3'>
                  {PLANS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setForm(f => ({ ...f, plan: p.id }))}
                      style={{
                        flex: 1, padding: '10px 0', borderRadius: 12, cursor: 'pointer',
                        border: `1.5px solid ${form.plan === p.id ? p.color : C.border}`,
                        background: form.plan === p.id ? `${p.color}10` : C.white,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <p style={{ fontSize: 13, fontWeight: 700, color: form.plan === p.id ? p.color : C.textMuted, margin: 0 }}>{p.label}</p>
                      <p style={{ fontSize: 11, color: form.plan === p.id ? `${p.color}99` : C.textFaint, margin: '2px 0 0' }}>{p.price}</p>
                    </button>
                  ))}
                </div>
              </div>

              <Field icon={Person}       label='Full name'      required field='name'  placeholder='e.g. Sarah Johnson' />
              <Field icon={EnvelopeOpen} label='Email address'  required field='email' placeholder='email@example.com' type='email' />
              <Field icon={Handset}        label='Phone number'   field='phone'          placeholder='055 000 0000'      type='tel' />
            </div>

            {/* ── Footer ── */}
            <div className='px-7 pb-7 flex gap-3'>
              <button
                onClick={onClose}
                className='flex-1 py-3 rounded-2xl border text-gray-400 text-sm font-semibold hover:text-gray-600 transition-colors'
                style={{ borderColor: C.border }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className='flex-1 py-3 rounded-2xl text-white text-sm font-bold flex items-center justify-center gap-2'
                style={{
                  background: loading ? tint(C.maroon, 67) : C.maroon,
                  boxShadow: loading ? 'none' : `0 4px 16px ${tint(C.maroon, 25)}`,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {loading
                  ? <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                  : <><span>Activate membership</span><ArrowRight style={{ width: 14, height: 14 }} /></>
                }
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  )
}

// ─── Gate Modal ───────────────────────────────────────────────────────────────
// Shown when user IS logged in BUT doesn't have enough courses yet
const GateModal = ({ enrolled, onClose, onBrowse }) => (
  createPortal(
    <div
      className='fixed inset-0 z-50 flex items-center justify-center px-4'
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className='bg-white rounded-3xl p-8 max-w-sm w-full text-center'
        style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.18)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Progress ring */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%', margin: '0 auto 18px',
          background: C.orangeFaint, border: `3px solid ${C.orange}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column',
        }}>
          <span style={{ fontSize: 18, fontWeight: 900, color: C.maroon, lineHeight: 1 }}>{enrolled}/{REQUIRED_COURSES}</span>
          <span style={{ fontSize: 9, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>courses</span>
        </div>

        <h3 className='text-xl font-bold text-gray-900 mb-2'>
          Almost there!
        </h3>
        <p className='text-gray-400 text-sm mb-2'>
          Membership is unlocked after enrolling in{' '}
          <strong className='text-gray-700'>{REQUIRED_COURSES} courses</strong>.
        </p>
        <p className='text-gray-400 text-sm mb-6'>
          You've enrolled in <strong style={{ color: C.maroon }}>{enrolled}</strong> so far.
          {enrolled < REQUIRED_COURSES && (
            <> Enroll in <strong style={{ color: C.green }}>{REQUIRED_COURSES - enrolled} more</strong> to unlock.</>
          )}
        </p>

        {/* Course progress pips */}
        <div className='flex justify-center gap-2 mb-6'>
          {Array.from({ length: REQUIRED_COURSES }).map((_, i) => (
            <div key={i} style={{
              width: i < enrolled ? 28 : 10, height: 10, borderRadius: 5,
              background: i < enrolled ? C.green : C.border,
              transition: 'all 0.4s ease',
            }} />
          ))}
        </div>

        {/* Benefits preview */}
        <div className='text-left mb-6 space-y-2'>
          {['Access to all 4 languages', 'Live sessions with tutors', 'AI conversation partner', 'Completion certificates'].map((b, i) => (
            <div key={i} className='flex items-center gap-2'>
              <div style={{
                width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                background: i < enrolled ? C.greenFaint : C.orangeFaint,
                border: `1px solid ${i < enrolled ? C.green : C.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {i < enrolled
                  ? <Check style={{ width: 10, height: 10, color: C.green }} />
                  : <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.textFaint, display: 'block' }} />
                }
              </div>
              <p style={{ fontSize: 12.5, color: i < enrolled ? C.text : C.textMuted }}>{b}</p>
            </div>
          ))}
        </div>

        <div className='flex gap-3'>
          <button
            onClick={onClose}
            className='flex-1 py-3 rounded-2xl border text-gray-400 text-sm font-semibold hover:text-gray-600 transition-colors'
            style={{ borderColor: C.border }}
          >
            Not now
          </button>
          <button
            onClick={onBrowse}
            className='flex-1 py-3 rounded-2xl text-white text-sm font-bold flex items-center justify-center gap-2'
            style={{ background: C.maroon, boxShadow: `0 4px 14px ${tint(C.maroon, 25)}` }}
          >
            <BookOpen style={{ width: 14, height: 14 }} />
            Browse Courses
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
)

// ─── Main Membership Component ────────────────────────────────────────────────
export default function Membership() {
  const [cardIdx, setCardIdx]       = useState(0)
  const [jumping, setJumping]       = useState(false)
  const [modal, setModal]           = useState(null) // null | 'gate' | 'form'

  const { user, isLoggedIn, openAuth } = useAuth()
  const protect = useProtectedAction()

  // Mock: in a real app read from user context/API
  // For now we simulate 1 enrolled course so you can see the gate
  const enrolledCount = user?.enrolledCount ?? 1

  const advance = () => {
    if (jumping) return
    setJumping(true)
    setTimeout(() => { setCardIdx(p => (p + 1) % CARDS.length); setJumping(false) }, 500)
  }

  useEffect(() => {
    const t = setInterval(advance, 3500)
    return () => clearInterval(t)
  }, [jumping])

  // Inject spin keyframe once
  useEffect(() => {
    if (document.getElementById('membership-anim')) return
    const s = document.createElement('style')
    s.id = 'membership-anim'
    s.textContent = `@keyframes spin{to{transform:rotate(360deg)}}`
    document.head.appendChild(s)
  }, [])

  const handleGetMembership = () => {
    // If not logged in → auth modal
    if (!isLoggedIn) { openAuth(); return }
    // If logged in but not enough courses → gate modal
    if (enrolledCount < REQUIRED_COURSES) { setModal('gate'); return }
    // All good → membership form
    setModal('form')
  }

  const curr = CARDS[cardIdx]
  const next = CARDS[(cardIdx + 1) % CARDS.length]

  return (
    <>
      <div className='flex items-center justify-center px-4 py-12'>
        <div className='w-full bg-white rounded-3xl border border-gray-100 p-8 flex flex-col md:flex-row gap-10 items-center'>

          {/* ── Flip cards ── */}
          <div className='relative shrink-0 w-36 h-52'>
            <Card
              c={curr}
              style={{
                transform: 'rotate(3deg) translateX(8px)', zIndex: 1,
                transition: jumping ? 'transform .5s ease-in, opacity .5s ease-in' : 'none',
                ...(jumping && { transform: 'rotate(-6deg) translateX(-8px)', opacity: 0.7 }),
              }}
            />
            <Card
              c={next}
              style={{
                transform: jumping ? 'rotate(3deg) translateX(8px)' : 'rotate(-6deg) translateX(-8px)',
                zIndex: jumping ? 2 : 0,
                opacity: jumping ? 1 : 0.7,
                transition: jumping ? 'transform .5s cubic-bezier(.34,1.56,.64,1)' : 'none',
              }}
            />
          </div>

          {/* ── Text + CTA ── */}
          <div className='flex-1 text-center md:text-left'>
            <div key={cardIdx} className='animate-fade-in'>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>{curr.title}</h3>
              <p className='text-sm text-gray-500 leading-relaxed mb-4'>{curr.body}</p>
            </div>

            {/* Requirements hint */}
            <p className='text-xs text-gray-400 mb-4'>
              Unlock membership after enrolling in{' '}
              <strong style={{ color: C.maroon }}>{REQUIRED_COURSES} courses</strong>
              {isLoggedIn && (
                <span style={{ color: C.green }}>
                  {' '}· {enrolledCount}/{REQUIRED_COURSES} enrolled
                </span>
              )}
            </p>

            {/* Dot nav */}
            <div className='flex gap-2 justify-center md:justify-start mb-5'>
              {CARDS.map((_, j) => (
                <button
                  key={j}
                  onClick={advance}
                  className={`h-1.5 rounded-full transition-all duration-300 ${cardIdx === j ? 'w-6 bg-[#1D9E75]' : 'w-1.5 bg-gray-200'}`}
                />
              ))}
            </div>

            {/* ── Get membership CTA button ── */}
            <button
              onClick={handleGetMembership}
              className='inline-flex items-center gap-2 px-6 py-3 rounded-full text-white text-sm font-bold transition-all duration-200'
              style={{
                background: C.maroon,
                boxShadow: `0 4px 16px ${tint(C.maroon, 25)}`,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = C.maroonHov; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = C.maroon; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              Get membership
              <ArrowRight style={{ width: 14, height: 14 }} />
            </button>
          </div>

        </div>
      </div>

      {/* ── Gate modal: logged in but not enough courses ── */}
      {modal === 'gate' && (
        <GateModal
          enrolled={enrolledCount}
          onClose={() => setModal(null)}
          onBrowse={() => { setModal(null); window.location.href = '/courses' }}
        />
      )}

      {/* ── Membership form: logged in + enough courses ── */}
      {modal === 'form' && (
        <MembershipFormModal onClose={() => setModal(null)} />
      )}
    </>
  )
}
