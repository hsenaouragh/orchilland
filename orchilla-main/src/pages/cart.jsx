import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShoppingCart, TrashBin, Check, ArrowRight, Gift, Star,
  BookOpen, Clock, Person, Globe, ChevronDown,
} from '@gravity-ui/icons'

// ─── Brand palette ────────────────────────────────────────────────────────────
const C = {
  orange:     'var(--color-accent)',
  orangeDark: 'var(--color-accent-hover)',
  maroon:     'var(--color-primary)',
  maroonHov:  'var(--color-primary-hover)',
  green:      'var(--color-green)',
  greenDark:  'var(--color-green-dark)',
  greenFaint: 'var(--color-green-faint)',
  brown:      'var(--color-text-body)',
  white:      'var(--color-surface)',
  offWhite:   'var(--color-panel)',
  border:     'var(--color-border)',
  text:       'var(--color-text)',
  textBody:   'var(--color-text-body)',
  textMuted:  'var(--color-text-muted)',
  textFaint:  'var(--color-text-faint)',
  orangeFaint:'var(--color-accent-faint)',
  wrong:      'var(--color-danger)',
  wrongBg:    'var(--color-danger-faint)',
}

const tint = (color, amount) => `color-mix(in srgb, ${color} ${amount}%, transparent)`

// ─── Mock Data ────────────────────────────────────────────────────────────────
const ENROLLED_COURSES = [
  {
    id: 1, lang: 'French', flag: '🇫🇷', level: 'B1 → B2',
    title: 'French Intermediate Mastery',
    type: 'Live + Recorded', duration: '12 weeks',
    progress: 68, nextLesson: 'Le Subjonctif Présent',
    color: '#E85D26', price: 89,
    enrolledDate: 'March 12, 2026',
    instructor: 'Marie Dupont',
  },
  {
    id: 2, lang: 'Korean', flag: '🇰🇷', level: 'A2 → B1',
    title: 'Korean Foundations',
    type: 'Self-paced', duration: '8 weeks',
    progress: 34, nextLesson: 'Honorifics & Politeness',
    color: '#1D9E75', price: 69,
    enrolledDate: 'April 3, 2026',
    instructor: 'Ji-Ho Park',
  },
]

const SUBSCRIPTIONS = [
  {
    id: 's1', name: 'Pro Member', badge: 'Active',
    price: 19, cycle: 'month',
    renewsOn: 'June 6, 2026',
    features: ['All 4 languages', 'Live sessions', 'AI tutor access', 'Certificate'],
    color: C.green,
  },
]

const SAVED_ITEMS = [
  {
    id: 3, lang: 'Italian', flag: '🇮🇹', level: 'A1 → A2',
    title: 'Italian for Beginners',
    type: 'Self-paced', duration: '6 weeks',
    color: '#D4537E', price: 49,
  },
  {
    id: 4, lang: 'English', flag: '🇬🇧', level: 'C1 → C2',
    title: 'Advanced English Writing',
    type: 'Live sessions', duration: '10 weeks',
    color: '#378ADD', price: 99,
  },
]

// ─── Progress Ring ─────────────────────────────────────────────────────────────
const ProgressRing = ({ pct, color, size = 52 }) => {
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.orangeFaint} strokeWidth="5" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="5"
          strokeLinecap="round" strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct / 100)}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 800, color,
      }}>
        {pct}%
      </div>
    </div>
  )
}

// ─── Enrolled Course Card ─────────────────────────────────────────────────────
const EnrolledCard = ({ course }) => {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: C.white, borderRadius: 20,
        border: `1.5px solid ${hovered ? course.color + '60' : C.border}`,
        padding: '22px 24px', display: 'flex', gap: 18, alignItems: 'flex-start',
        boxShadow: hovered ? `0 8px 28px ${course.color}18` : '0 2px 10px rgba(0,0,0,0.06)',
        transition: 'all 0.25s ease',
      }}
    >
      {/* Flag + ring */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `${course.color}12`, border: `1.5px solid ${course.color}30`,
          fontSize: 22,
        }}>
          {course.flag}
        </div>
        <ProgressRing pct={course.progress} color={course.color} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.brown, margin: '0 0 3px' }}>
              {course.lang} · {course.level}
            </p>
            <h3 style={{ fontSize: 15.5, fontWeight: 800, color: C.text, margin: 0, lineHeight: 1.3 }}>
              {course.title}
            </h3>
          </div>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
            background: `${course.color}14`, color: course.color, flexShrink: 0,
            border: `1px solid ${course.color}30`,
          }}>
            Active
          </span>
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
          {[
            { Icon: Globe, text: course.type },
            { Icon: Clock, text: course.duration },
            { Icon: Person, text: course.instructor },
          ].map(({ Icon, text }, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon style={{ width: 12, height: 12, color: C.textMuted }} />
              <span style={{ fontSize: 11.5, color: C.textMuted }}>{text}</span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: C.textMuted }}>Progress</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: course.color }}>{course.progress}% complete</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: C.orangeFaint, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${course.progress}%`,
              background: `linear-gradient(90deg, ${course.color}80, ${course.color})`,
              borderRadius: 3, transition: 'width 0.8s ease',
            }} />
          </div>
        </div>

        {/* Next lesson + CTA */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 10, color: C.textFaint, margin: '0 0 2px' }}>Next lesson</p>
            <p style={{ fontSize: 12.5, fontWeight: 600, color: C.textBody, margin: 0 }}>{course.nextLesson}</p>
          </div>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 18px', borderRadius: 50, border: 'none', cursor: 'pointer',
            background: course.color, color: C.white, fontSize: 12.5, fontWeight: 700,
            boxShadow: `0 3px 12px ${course.color}40`,
            transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Continue <ArrowRight style={{ width: 13, height: 13 }} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Subscription Card ────────────────────────────────────────────────────────
const SubscriptionCard = ({ sub }) => (
  <div style={{
    background: `linear-gradient(135deg, ${sub.color} 0%, ${sub.color}CC 100%)`,
    borderRadius: 20, padding: '24px 26px',
    boxShadow: `0 8px 30px ${sub.color}40`,
    color: C.white, position: 'relative', overflow: 'hidden',
  }}>
    {/* decorative circle */}
    <div style={{
      position: 'absolute', top: -30, right: -30, width: 120, height: 120,
      borderRadius: '50%', background: 'rgba(255,255,255,0.1)',
    }} />
    <div style={{
      position: 'absolute', bottom: -20, right: 40, width: 80, height: 80,
      borderRadius: '50%', background: 'rgba(255,255,255,0.07)',
    }} />

    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, position: 'relative' }}>
      <div>
        <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.75, margin: '0 0 4px' }}>
          Subscription
        </p>
        <h3 style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>{sub.name}</h3>
      </div>
      <span style={{
        fontSize: 10, fontWeight: 700, padding: '4px 12px', borderRadius: 20,
        background: 'rgba(255,255,255,0.22)', border: '1px solid rgba(255,255,255,0.35)',
      }}>
        {sub.badge}
      </span>
    </div>

    <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap', position: 'relative' }}>
      {sub.features.map((f, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Check style={{ width: 10, height: 10, color: C.white }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 500 }}>{f}</span>
        </div>
      ))}
    </div>

    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
      <div>
        <span style={{ fontSize: 28, fontWeight: 900 }}>${sub.price}</span>
        <span style={{ fontSize: 12, opacity: 0.75 }}>/{sub.cycle}</span>
        <p style={{ fontSize: 11, opacity: 0.65, margin: '3px 0 0' }}>Renews {sub.renewsOn}</p>
      </div>
      <button style={{
        padding: '9px 20px', borderRadius: 50,
        border: '2px solid rgba(255,255,255,0.6)', background: 'transparent',
        color: C.white, fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        Manage
      </button>
    </div>
  </div>
)

// ─── Saved Item Card ──────────────────────────────────────────────────────────
const SavedCard = ({ item, onMoveToCart }) => {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: C.white, borderRadius: 16,
        border: `1.5px solid ${hovered ? item.color + '50' : C.border}`,
        padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14,
        boxShadow: hovered ? `0 4px 18px ${item.color}14` : '0 1px 6px rgba(0,0,0,0.05)',
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `${item.color}10`, fontSize: 20,
      }}>
        {item.flag}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.brown, margin: '0 0 2px' }}>
          {item.lang} · {item.level}
        </p>
        <p style={{ fontSize: 13.5, fontWeight: 700, color: C.text, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {item.title}
        </p>
        <p style={{ fontSize: 11.5, color: C.textMuted, margin: '2px 0 0' }}>{item.type} · {item.duration}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: C.text }}>${item.price}</span>
        <button
          onClick={() => onMoveToCart(item.id)}
          style={{
            padding: '7px 14px', borderRadius: 50, border: 'none',
            background: C.maroon, color: C.white, fontSize: 11.5, fontWeight: 700,
            cursor: 'pointer', transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.background = C.maroonHov}
          onMouseLeave={e => e.currentTarget.style.background = C.maroon}
        >
          Enroll
        </button>
        <button style={{
          width: 32, height: 32, borderRadius: '50%', border: `1.5px solid ${C.border}`,
          background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s ease',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.wrong; e.currentTarget.style.background = C.wrongBg }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = 'transparent' }}
        >
          <TrashBin style={{ width: 13, height: 13, color: C.wrong }} />
        </button>
      </div>
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = ({ message, cta, to }) => (
  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
    <div style={{ fontSize: 40, marginBottom: 12 }}>
      <ShoppingCart style={{ width: 40, height: 40, color: C.textFaint, margin: '0 auto' }} />
    </div>
    <p style={{ fontSize: 14, color: C.textMuted, marginBottom: 16 }}>{message}</p>
    <Link to={to} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '10px 22px', borderRadius: 50, background: C.maroon,
      color: C.white, fontSize: 13, fontWeight: 700, textDecoration: 'none',
    }}>
      {cta} <ArrowRight style={{ width: 13, height: 13 }} />
    </Link>
  </div>
)

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionTitle = ({ label, count }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
    <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: C.brown, margin: 0 }}>
      {label}
    </p>
    {count !== undefined && (
      <span style={{
        fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 20,
        background: C.orangeFaint, color: C.brown, border: `1px solid ${C.border}`,
      }}>
        {count}
      </span>
    )}
    <div style={{ flex: 1, height: 1, background: C.border }} />
  </div>
)

// ─── Cart Page ────────────────────────────────────────────────────────────────
const Cart = () => {
  const navigate = useNavigate()
  const [saved, setSaved] = useState(SAVED_ITEMS)
  const [tab, setTab] = useState('enrolled') // enrolled | subscriptions | saved

  const removeSaved = (id) => setSaved(s => s.filter(x => x.id !== id))

  const totalEnrolled = ENROLLED_COURSES.length
  const avgProgress = Math.round(ENROLLED_COURSES.reduce((a, c) => a + c.progress, 0) / totalEnrolled)

  const TABS = [
    { id: 'enrolled',      label: 'My Courses',     count: ENROLLED_COURSES.length },
    { id: 'subscriptions', label: 'Subscriptions',   count: SUBSCRIPTIONS.length },
    { id: 'saved',         label: 'Saved for Later', count: saved.length },
  ]

  return (
    <div style={{ minHeight: '100vh', background: C.orange }}>

      {/* ── Hero strip ── */}
      <div style={{ padding: '40px 24px 32px', maxWidth: 800, margin: '0 auto' }}>
        <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.75)', margin: '0 0 8px' }}>
          Your Learning Hub
        </p>
        <h1 style={{ fontSize: 34, fontWeight: 900, color: C.white, margin: '0 0 6px', lineHeight: 1.2 }}>
          My Enrollments
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', margin: '0 0 28px' }}>
          Track your progress, manage subscriptions, and continue learning.
        </p>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'Active Courses', value: totalEnrolled },
            { label: 'Avg. Progress', value: `${avgProgress}%` },
            { label: 'Subscription', value: 'Pro' },
            { label: 'Saved Items', value: saved.length },
          ].map((s, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)',
              borderRadius: 14, padding: '12px 18px',
              border: '1px solid rgba(255,255,255,0.25)',
            }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: C.white }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── White content panel ── */}
      <div style={{
        background: C.offWhite, borderRadius: '28px 28px 0 0',
        minHeight: 'calc(100vh - 260px)',
        padding: '28px 24px 60px',
        maxWidth: 800, margin: '0 auto',
        boxShadow: '0 -4px 30px rgba(0,0,0,0.10)',
      }}>

        {/* Tab pills */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '9px 18px', borderRadius: 50, flexShrink: 0,
                border: tab === t.id ? `1.5px solid ${C.maroon}` : `1.5px solid ${C.border}`,
                background: tab === t.id ? C.maroon : C.white,
                color: tab === t.id ? C.white : C.textBody,
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                boxShadow: tab === t.id ? `0 4px 14px ${tint(C.maroon, 20)}` : '0 1px 4px rgba(0,0,0,0.06)',
                transition: 'all 0.2s ease',
              }}
            >
              {t.label}
              <span style={{
                fontSize: 10, fontWeight: 800, padding: '1px 7px', borderRadius: 20,
                background: tab === t.id ? 'rgba(255,255,255,0.22)' : C.orangeFaint,
                color: tab === t.id ? C.white : C.brown,
              }}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* ── Enrolled Courses ── */}
        {tab === 'enrolled' && (
          <div>
            <SectionTitle label="Active Enrollments" count={ENROLLED_COURSES.length} />
            {ENROLLED_COURSES.length === 0
              ? <EmptyState message="You haven't enrolled in any courses yet." cta="Browse Courses" to="/courses" />
              : <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {ENROLLED_COURSES.map(c => <EnrolledCard key={c.id} course={c} />)}
                </div>
            }

            {/* Upsell banner */}
            <div style={{
              marginTop: 24, borderRadius: 18, padding: '20px 24px',
              background: `linear-gradient(135deg, ${C.maroon}, ${tint(C.maroon, 80)})`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
              boxShadow: `0 6px 24px ${tint(C.maroon, 20)}`,
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Gift style={{ width: 14, height: 14, color: C.orange }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Special offer
                  </span>
                </div>
                <p style={{ fontSize: 15, fontWeight: 800, color: C.white, margin: '0 0 3px' }}>
                  Add Italian for just $29
                </p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                  Bundle discount — expires in 48h
                </p>
              </div>
              <button style={{
                padding: '10px 20px', borderRadius: 50, border: '2px solid rgba(255,255,255,0.5)',
                background: 'transparent', color: C.white, fontSize: 12.5, fontWeight: 700,
                cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s ease',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                Claim offer
              </button>
            </div>
          </div>
        )}

        {/* ── Subscriptions ── */}
        {tab === 'subscriptions' && (
          <div>
            <SectionTitle label="Active Plans" count={SUBSCRIPTIONS.length} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {SUBSCRIPTIONS.map(s => <SubscriptionCard key={s.id} sub={s} />)}
            </div>

            {/* Upgrade nudge */}
            <div style={{
              marginTop: 20, borderRadius: 18, padding: '20px 24px',
              background: C.white, border: `1.5px solid ${C.border}`,
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            }}>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.brown, margin: '0 0 8px' }}>
                Upgrade available
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 800, color: C.text, margin: '0 0 3px' }}>Annual Plan — Save 40%</p>
                  <p style={{ fontSize: 12.5, color: C.textMuted, margin: 0 }}>$9.99/month billed yearly · Everything in Pro</p>
                </div>
                <button style={{
                  padding: '9px 20px', borderRadius: 50, border: 'none',
                  background: C.orange, color: C.white, fontSize: 12.5, fontWeight: 700,
                  cursor: 'pointer', transition: 'all 0.2s ease', flexShrink: 0,
                  boxShadow: `0 3px 12px ${tint(C.orange, 32)}`,
                }}
                  onMouseEnter={e => e.currentTarget.style.background = C.orangeDark}
                  onMouseLeave={e => e.currentTarget.style.background = C.orange}
                >
                  Upgrade
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Saved for Later ── */}
        {tab === 'saved' && (
          <div>
            <SectionTitle label="Saved for Later" count={saved.length} />
            {saved.length === 0
              ? <EmptyState message="Nothing saved yet. Browse courses and save ones you like." cta="Browse Courses" to="/courses" />
              : <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {saved.map(item => (
                    <SavedCard key={item.id} item={item} onMoveToCart={removeSaved} />
                  ))}
                </div>
            }
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart
