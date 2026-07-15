import { useState, useEffect, useRef, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/AuthContext'
import { savePlacementAttempt } from '../services/db'
import { buildPlacementTest, scorePlacement, LEVELS, LEVEL_COLORS } from '../data/placementBank'

// ─── Gravity-UI SVG Icons (inline, no dependencies) ───────────────────────────
const IconGrammar = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 6h16M4 10h12M4 14h8M4 18h10" />
  </svg>
)
const IconVocabulary = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    <path d="M9 7h6M9 11h4" />
  </svg>
)
const IconReading = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.35-4.35M8 11h6M11 8v6" />
  </svg>
)
const IconWriting = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
  </svg>
)
const IconCheck = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const IconX = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)
const IconArrowLeft = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
)
const IconArrowRight = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
)
const IconRefresh = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
)
const IconCourses = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
)
const IconClock = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
)
const IconStar = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

// ─── Site palette (from screenshots) ─────────────────────────────────────────
const C = {
  orange:      'var(--color-accent)',
  orangeDark:  'var(--color-accent-hover)',
  orangeLight: 'var(--color-accent-light)',
  orangeFaint: 'var(--color-accent-faint)',

  maroon:      'var(--color-primary)',
  maroonHover: 'var(--color-primary-hover)',
  maroonLight: 'var(--color-primary-soft)',

  green:       'var(--color-green)',
  greenDark:   'var(--color-green-dark)',
  greenFaint:  'var(--color-green-faint)',

  brown:       'var(--color-text-body)',
  white:       'var(--color-surface)',
  offWhite:    'var(--color-panel)',
  border:      'var(--color-border)',

  text:        'var(--color-text)',
  textBody:    'var(--color-text-body)',
  textMuted:   'var(--color-text-muted)',
  textFaint:   'var(--color-text-faint)',

  correct:     'var(--color-green)',
  correctBg:   'var(--color-green-faint)',
  wrong:       'var(--color-danger)',
  wrongBg:     'var(--color-danger-faint)',
}

const tint = (color, amount) => `color-mix(in srgb, ${color} ${amount}%, transparent)`


// ─── Sections = CEFR levels (A1…C2). Icons cycle through the 4 gravity-ui glyphs.
const LEVEL_ICONS = [IconGrammar, IconVocabulary, IconReading, IconWriting]
const SECTIONS = LEVELS.map((level, i) => ({
  id: level,
  label: level,
  sublabel: 'Level',
  Icon: LEVEL_ICONS[i % LEVEL_ICONS.length],
  color: LEVEL_COLORS[level],
  seconds: 100,
}))

const LANG_META = {
  english: { label: 'English', flag: '🇬🇧', color: '#378ADD' },
  french:  { label: 'French',  flag: '🇫🇷', color: '#E85D26' },
  italian: { label: 'Italian', flag: '🇮🇹', color: '#D4537E' },
  korean:  { label: 'Korean',  flag: '🇰🇷', color: C.green   },
}

const TOTAL_SECONDS = 600
const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

// ─── Circle Timer — warm palette ──────────────────────────────────────────────
const CircleTimer = ({ seconds, total }) => {
  const r = 30, circ = 2 * Math.PI * r
  const pct = seconds / total
  const danger = seconds < 60
  const warn   = seconds < 120
  const stroke = danger ? C.wrong : warn ? C.orange : C.maroon
  const track  = danger ? '#FEE2E2' : warn ? C.orangeFaint : C.maroonLight

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 74, height: 74, flexShrink: 0 }}>
      <svg width="74" height="74" viewBox="0 0 74 74" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
        <circle cx="37" cy="37" r={r} fill="none" stroke={track} strokeWidth="5" />
        <circle cx="37" cy="37" r={r} fill="none" stroke={stroke} strokeWidth="5" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}
        />
      </svg>
      <div style={{ position: 'relative', textAlign: 'center' }}>
        <div style={{ fontSize: 11.5, fontWeight: 800, color: stroke, fontFamily: 'monospace', letterSpacing: '-0.5px' }}>
          {fmt(seconds)}
        </div>
      </div>
    </div>
  )
}

// ─── Progress bar — orange-on-white track ─────────────────────────────────────
const ProgressTrack = ({ current, total, color }) => (
  <div style={{ width: '100%', height: 4, background: C.orangeFaint }}>
    <div style={{
      height: '100%', width: `${(current / total) * 100}%`,
      background: color, transition: 'width 0.5s cubic-bezier(.22,1,.36,1)',
    }} />
  </div>
)

// ─── Decorated Section Scroll Indicator ──────────────────────────────────────
const SectionScrollIndicator = ({ sections, allQuestions, answers, currentSection, onSectionClick }) => (
  <div style={{ position: 'relative' }}>
    {/* connector line */}
    <div style={{
      position: 'absolute', top: '50%', left: 10, right: 10, height: 1.5,
      background: `linear-gradient(90deg, ${C.border} 0%, ${C.orangeLight} 50%, ${C.border} 100%)`,
      transform: 'translateY(-50%)', zIndex: 0, borderRadius: 2,
    }} />
    <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none', position: 'relative', zIndex: 1 }}>
      {sections.map(s => {
        const sQs = allQuestions.filter(q => q.section === s.id)
        const answered = sQs.filter(q => answers[q.id] !== undefined).length
        const complete = answered === sQs.length
        const active = s.id === currentSection
        const Icon = s.Icon

        return (
          <button
            key={s.id}
            onClick={() => onSectionClick(s.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: active ? '8px 13px' : '6px 11px',
              borderRadius: 12, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
              border: active
                ? `1.5px solid ${s.color}`
                : complete ? `1.5px solid ${s.color}55` : `1.5px solid ${C.border}`,
              background: active
                ? C.white
                : complete ? `${s.color}08` : 'rgba(255,255,255,0.55)',
              boxShadow: active
                ? `0 2px 14px ${s.color}28, 0 0 0 3px ${s.color}10`
                : '0 1px 3px rgba(0,0,0,0.06)',
              transition: 'all 0.25s cubic-bezier(.22,1,.36,1)',
              position: 'relative',
            }}
          >
            {/* active pulse beacon */}
            {active && (
              <span style={{
                position: 'absolute', top: -4, right: -4, width: 8, height: 8,
                borderRadius: '50%', background: s.color,
                boxShadow: `0 0 0 2px ${C.white}, 0 0 6px ${s.color}`,
                animation: 'pulseDot 1.8s ease-in-out infinite', display: 'block',
              }} />
            )}
            {/* icon */}
            <span style={{
              width: 26, height: 26, borderRadius: 7, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: active ? `${s.color}18` : complete ? `${s.color}10` : C.orangeFaint,
            }}>
              <Icon size={14} color={active ? s.color : complete ? s.color : C.textMuted} />
            </span>
            {/* label */}
            <span>
              <span style={{ display: 'block', fontSize: 11, fontWeight: 700, color: active ? s.color : complete ? s.color : C.textMuted }}>
                {s.label}
              </span>
              <span style={{ display: 'block', fontSize: 9.5, color: active ? `${s.color}99` : C.textFaint, marginTop: 1 }}>
                {s.sublabel}
              </span>
            </span>
            {/* progress pips */}
            <span style={{ display: 'flex', gap: 3, alignItems: 'center', marginLeft: 2 }}>
              {sQs.map((_, i) => (
                <span key={i} style={{
                  display: 'block',
                  width: i < answered ? 6 : 4, height: i < answered ? 6 : 4, borderRadius: '50%',
                  background: i < answered ? s.color : C.border,
                  boxShadow: (i < answered && active) ? `0 0 4px ${s.color}80` : 'none',
                  transition: 'all 0.3s ease',
                }} />
              ))}
            </span>
            {/* complete badge */}
            {complete && !active && (
              <span style={{
                width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                background: `${s.color}12`, border: `1px solid ${s.color}45`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <IconCheck size={9} color={s.color} />
              </span>
            )}
          </button>
        )
      })}
    </div>
  </div>
)

// ─── MCQ Option ───────────────────────────────────────────────────────────────
const MCQOption = ({ text, index, selected, onClick, revealed, correct }) => {
  const letters = ['A', 'B', 'C', 'D']
  const isCorrect = revealed && index === correct
  const isWrong   = revealed && selected && index !== correct

  return (
    <button
      onClick={onClick}
      disabled={revealed}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px', borderRadius: 12, textAlign: 'left',
        cursor: revealed ? 'default' : 'pointer',
        background: isCorrect ? C.correctBg : isWrong ? C.wrongBg : selected ? C.maroonLight : C.white,
        border: `1.5px solid ${isCorrect ? C.correct : isWrong ? C.wrong : selected ? C.maroon : C.border}`,
        boxShadow: isCorrect ? `0 0 0 3px ${tint(C.correct, 8)}` : isWrong ? `0 0 0 3px ${tint(C.wrong, 7)}` : selected ? `0 0 0 3px ${tint(C.maroon, 7)}` : '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'all 0.2s ease',
      }}
    >
      <span style={{
        flexShrink: 0, width: 28, height: 28, borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 700,
        background: isCorrect ? C.correct : isWrong ? C.wrong : selected ? C.maroon : C.orangeFaint,
        color: (isCorrect || isWrong || selected) ? C.white : C.textMuted,
        transition: 'all 0.2s ease',
      }}>
        {isCorrect ? <IconCheck size={12} color={C.white} /> : isWrong ? <IconX size={12} color={C.white} /> : letters[index]}
      </span>
      <span style={{ fontSize: 13.5, color: isCorrect ? C.greenDark : isWrong ? '#B91C1C' : C.textBody, flex: 1, fontWeight: selected && !revealed ? 600 : 400 }}>
        {text}
      </span>
    </button>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
const TestPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const params = new URLSearchParams(location.search)
  const lang   = (params.get('lang') || 'english').toLowerCase()
  const meta   = LANG_META[lang] || LANG_META.english

  // A fresh randomized set per language (sampled from the bank, options shuffled).
  // useMemo keeps it stable across renders so it doesn't reshuffle on every keypress.
  const allQuestions = useMemo(() => buildPlacementTest(lang), [lang])

  const [phase, setPhase]       = useState('intro')
  const [qIndex, setQIndex]     = useState(0)
  const [answers, setAnswers]   = useState({})
  const [revealed, setRevealed] = useState({})
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS)
  const [animated, setAnimated] = useState(false)
  const [secAnim, setSecAnim]   = useState(false)
  const timerRef    = useRef(null)
  const prevSection = useRef(null)
  const savedAttemptRef = useRef(false)

  const currentQ   = allQuestions[qIndex]
  const currentSec = SECTIONS.find(s => s.id === currentQ?.section)
  const sectionQs  = allQuestions.filter(q => q.section === currentQ?.section)
  const sectionIdx = sectionQs.indexOf(currentQ)

  useEffect(() => {
    setAnimated(false)
    const t = setTimeout(() => setAnimated(true), 30)
    return () => clearTimeout(t)
  }, [qIndex, phase])

  useEffect(() => {
    if (phase !== 'test') return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); setPhase('results'); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [phase])

  useEffect(() => {
    if (currentQ && prevSection.current !== currentQ.section) {
      setSecAnim(false)
      const t = setTimeout(() => setSecAnim(true), 60)
      prevSection.current = currentQ.section
      return () => clearTimeout(t)
    } else { setSecAnim(true) }
  }, [currentQ])

  useEffect(() => {
    const s = document.createElement('style')
    s.textContent = `@keyframes pulseDot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(.6)}}`
    document.head.appendChild(s)
    return () => document.head.removeChild(s)
  }, [])

  const startTest    = () => { savedAttemptRef.current = false; setPhase('test'); setTimeLeft(TOTAL_SECONDS) }
  const handleAnswer = (id, val) => { if (!revealed[id]) setAnswers(a => ({ ...a, [id]: val })) }
  const handleReveal = () => { if (answers[currentQ.id] !== undefined) setRevealed(r => ({ ...r, [currentQ.id]: true })) }
  const handleNext   = () => { if (qIndex < allQuestions.length - 1) setQIndex(i => i + 1); else { clearInterval(timerRef.current); setPhase('results') } }
  const handlePrev   = () => { if (qIndex > 0) setQIndex(i => i - 1) }

  // Ceiling scoring across the CEFR levels → final level.
  const result = useMemo(() => scorePlacement(allQuestions, answers), [allQuestions, answers])
  const { score, total, percentage: pct, cefr } = result
  const cefrColor = LEVEL_COLORS[cefr] || C.maroon

  const isAnswered = answers[currentQ?.id] !== undefined
  const isRevealed = revealed[currentQ?.id]
  const canNext    = isRevealed

  // shared page background — soft, theme-aware (no heavy colour wash)
  const pageBg = 'var(--color-bg)'

  useEffect(() => {
    if (phase !== 'results' || savedAttemptRef.current) return
    savedAttemptRef.current = true
    savePlacementAttempt({
      language: lang,
      score,
      total,
      percentage: pct,
      cefr_level: cefr,
      finishedAt: new Date().toISOString(),
      questions: allQuestions.map(question => ({
        id: question.id,
        section: question.section,
        type: question.type,
        question: question.question,
        passage: question.passage || null,
      })),
      answers,
    }, user).catch(error => console.error('[Supabase] placement_attempts:', error.message))
  }, [answers, allQuestions, cefr, lang, pct, phase, user, score, total])

  // ─── INTRO ────────────────────────────────────────────────────────────────────
  if (phase === 'intro') return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '48px 16px', background: pageBg,
    }}>
      {/* White floating card — same style as site's membership/offer cards */}
      <div style={{
        width: '100%', maxWidth: 500, background: C.white,
        borderRadius: 28, padding: '44px 40px',
        boxShadow: '0 16px 60px rgba(0,0,0,0.18)',
        opacity: animated ? 1 : 0, transform: animated ? 'translateY(0)' : 'translateY(24px)',
        transition: 'all 0.55s cubic-bezier(.22,1,.36,1)',
      }}>
        {/* Badge row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <span style={{ fontSize: 34 }}>{meta.flag}</span>
          <div>
            {/* brand brown label */}
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: C.brown, margin: '0 0 3px' }}>
              Placement Test
            </p>
            <p style={{ fontSize: 19, fontWeight: 800, color: meta.color, margin: 0 }}>{meta.label}</p>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 2, color: C.orange }}>
            {[...Array(5)].map((_, i) => <IconStar key={i} size={13} />)}
          </div>
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 900, color: C.text, lineHeight: 1.25, margin: '0 0 12px' }}>
          Ready to find your level?
        </h1>
        <p style={{ fontSize: 14, color: C.textBody, lineHeight: 1.75, margin: '0 0 28px' }}>
          This test covers <strong style={{ color: C.text }}>{total} questions</strong> across <strong style={{ color: C.text }}>{LEVELS.length} levels</strong> (A1–C2).
          You have <strong style={{ color: C.text }}>10 minutes</strong> — answer honestly to find your level.
        </p>

        {/* Section preview grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 32 }}>
          {SECTIONS.map(s => {
            const Icon = s.Icon
            return (
              <div key={s.id} style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '10px 13px', borderRadius: 12,
                background: `${s.color}0C`, border: `1px solid ${s.color}28`,
              }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${s.color}18` }}>
                  <Icon size={15} color={s.color} />
                </div>
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: s.color }}>{s.label}</div>
                  <div style={{ fontSize: 10, color: C.textMuted }}>{s.sublabel}</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Quick stats row */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 28, padding: '12px 0', borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
          {[
            { label: '10 min', sub: 'Quick & focused', icon: <IconClock size={13} color={C.maroon} /> },
            { label: 'A1 – C2', sub: 'Full coverage', icon: <IconStar size={13} /> },
            { label: 'Instant', sub: 'Results right away', icon: <IconCheck size={13} color={C.green} /> },
          ].map((item, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 2 }}>
                <span style={{ color: C.orange }}>{item.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: C.text }}>{item.label}</span>
              </div>
              <div style={{ fontSize: 10, color: C.textMuted }}>{item.sub}</div>
            </div>
          ))}
        </div>

        {/* Maroon primary button — from site screenshots */}
        <button
          onClick={startTest}
          style={{
            width: '100%', padding: '16px 0', borderRadius: 50,
            border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 15, color: C.white,
            background: C.maroon,
            boxShadow: `0 4px 20px ${tint(C.maroon, 27)}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = C.maroonHover; e.currentTarget.style.transform = 'translateY(-2px)' }}
          onMouseLeave={e => { e.currentTarget.style.background = C.maroon; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          Start the test <IconArrowRight size={16} />
        </button>
      </div>
    </div>
  )

  // ─── RESULTS ──────────────────────────────────────────────────────────────────
  if (phase === 'results') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 16px', background: pageBg }}>
      <div style={{
        width: '100%', maxWidth: 500, background: C.white,
        borderRadius: 28, padding: '44px 40px',
        boxShadow: '0 16px 60px rgba(0,0,0,0.18)', textAlign: 'center',
        opacity: animated ? 1 : 0, transform: animated ? 'translateY(0)' : 'translateY(24px)',
        transition: 'all 0.55s cubic-bezier(.22,1,.36,1)',
      }}>
        {/* Brown label */}
        <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: C.brown, margin: '0 0 16px' }}>
          Your Result
        </p>

        {/* CEFR ring */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 100, height: 100, borderRadius: '50%',
          background: `${cefrColor}0F`, border: `3px solid ${cefrColor}`,
          boxShadow: `0 0 0 8px ${cefrColor}08`, marginBottom: 16,
        }}>
          <span style={{ fontSize: 36, fontWeight: 900, color: cefrColor }}>{cefr}</span>
        </div>

        <p style={{ fontSize: 14, color: C.textBody, margin: '0 0 28px' }}>
          You answered <strong style={{ color: C.text }}>{score}</strong> of{' '}
          <strong style={{ color: C.text }}>{total}</strong> correctly{' '}
          <span style={{ color: cefrColor, fontWeight: 700 }}>({pct}%)</span>
        </p>

        {/* Section bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32, textAlign: 'left' }}>
          {SECTIONS.map(s => {
            const qs = allQuestions.filter(q => q.section === s.id)
            const correct = qs.filter(q => q.type === 'writing' ? answers[q.id]?.trim().length > 10 : answers[q.id] === q.answer).length
            const Icon = s.Icon
            return (
              <div key={s.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${s.color}14`, flexShrink: 0 }}>
                    <Icon size={12} color={s.color} />
                  </div>
                  <span style={{ fontSize: 12.5, color: C.textBody, flex: 1 }}>{s.label}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: s.color }}>{correct}/{qs.length}</span>
                </div>
                <div style={{ height: 7, borderRadius: 4, background: C.orangeFaint, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${(correct / qs.length) * 100}%`,
                    background: `linear-gradient(90deg, ${s.color}80, ${s.color})`,
                    borderRadius: 4, transition: 'width 0.8s cubic-bezier(.22,1,.36,1)',
                  }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          {/* maroon primary */}
          <button
            onClick={() => navigate('/courses')}
            style={{
              flex: 1, padding: '13px 0', borderRadius: 50, border: 'none',
              cursor: 'pointer', fontWeight: 700, fontSize: 13, color: C.white,
              background: C.maroon, boxShadow: `0 4px 14px ${tint(C.maroon, 22)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = C.maroonHover; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = C.maroon; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <IconCourses size={15} /> Browse Courses
          </button>
          {/* white outline — from screenshots */}
          <button
            onClick={() => { setPhase('intro'); setQIndex(0); setAnswers({}); setRevealed({}); setTimeLeft(TOTAL_SECONDS) }}
            style={{
              flex: 1, padding: '13px 0', borderRadius: 50,
              border: `2px solid ${C.border}`, cursor: 'pointer',
              fontWeight: 700, fontSize: 13, color: C.textBody, background: C.white,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.maroon; e.currentTarget.style.color = C.maroon }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textBody }}
          >
            <IconRefresh size={15} /> Retake
          </button>
        </div>
      </div>
    </div>
  )

  // ─── TEST SCREEN ──────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: pageBg }}>

      {/* ── Sticky white top bar ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${C.border}`,
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <SectionScrollIndicator
              sections={SECTIONS} allQuestions={allQuestions} answers={answers}
              currentSection={currentQ.section}
              onSectionClick={sid => setQIndex(allQuestions.findIndex(q => q.section === sid))}
            />
          </div>
          <CircleTimer seconds={timeLeft} total={TOTAL_SECONDS} />
        </div>
        <ProgressTrack current={qIndex + 1} total={allQuestions.length} color={currentSec?.color || C.maroon} />
      </div>

      {/* ── Question area — floats on orange ── */}
      <div style={{ flex: 1, maxWidth: 680, margin: '0 auto', width: '100%', padding: '32px 16px 56px' }}>

        {/* Section header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20,
          opacity: secAnim ? 1 : 0, transform: secAnim ? 'translateX(0)' : 'translateX(-14px)',
          transition: 'all 0.4s ease',
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: C.white, border: `1.5px solid ${currentSec?.color}30`,
            boxShadow: `0 2px 10px ${currentSec?.color}20`,
          }}>
            {currentSec && <currentSec.Icon size={18} color={currentSec.color} />}
          </div>
          <div style={{ flex: 1 }}>
            {/* brown label pattern */}
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: C.white, margin: '0 0 2px', opacity: 0.85 }}>
              {currentSec?.label} · {currentSec?.sublabel}
            </p>
            <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.7)', margin: 0 }}>
              Question {sectionIdx + 1} of {sectionQs.length}
            </p>
          </div>
          {/* pip progress strip */}
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            {sectionQs.map((_, i) => (
              <div key={i} style={{
                width: i === sectionIdx ? 22 : 7, height: 7, borderRadius: 4,
                background: i < sectionIdx ? C.white : i === sectionIdx ? C.white : 'rgba(255,255,255,0.3)',
                opacity: i < sectionIdx ? 0.7 : 1,
                boxShadow: i === sectionIdx ? '0 0 8px rgba(255,255,255,0.6)' : 'none',
                transition: 'all 0.35s cubic-bezier(.22,1,.36,1)',
              }} />
            ))}
          </div>
        </div>

        {/* White question card floating on orange */}
        <div style={{
          background: C.white, borderRadius: 22, padding: '28px 28px 24px',
          marginBottom: 20,
          boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
          borderLeft: `4px solid ${currentSec?.color}`,
          opacity: animated ? 1 : 0, transform: animated ? 'translateY(0)' : 'translateY(16px)',
          transition: 'all 0.45s cubic-bezier(.22,1,.36,1)',
        }}>
          {/* Passage */}
          {currentQ.passage && (
            <div style={{
              marginBottom: 20, padding: '14px 16px', borderRadius: 10,
              background: C.orangeFaint, borderLeft: `3px solid ${currentSec?.color}`,
              fontSize: 13.5, lineHeight: 1.8, color: C.textBody, fontStyle: 'italic',
            }}>
              {currentQ.passage}
            </div>
          )}
          {/* Question */}
          <h2 style={{ fontSize: 16.5, fontWeight: 700, color: C.text, lineHeight: 1.55, margin: '0 0 20px' }}>
            {currentQ.question}
          </h2>
          {/* MCQ */}
          {currentQ.type !== 'writing' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {currentQ.options.map((opt, i) => (
                <MCQOption key={i} text={opt} index={i}
                  selected={answers[currentQ.id] === i}
                  onClick={() => handleAnswer(currentQ.id, i)}
                  revealed={isRevealed} correct={currentQ.answer}
                />
              ))}
            </div>
          )}
          {/* Writing */}
          {currentQ.type === 'writing' && (
            <textarea
              rows={5} placeholder={currentQ.placeholder}
              value={answers[currentQ.id] || ''}
              onChange={e => handleAnswer(currentQ.id, e.target.value)}
              style={{
                width: '100%', borderRadius: 12, padding: '13px 16px',
                fontSize: 13.5, color: C.text, resize: 'none',
                background: C.orangeFaint,
                border: `1.5px solid ${answers[currentQ.id] ? `${currentSec?.color}70` : C.border}`,
                caretColor: currentSec?.color, outline: 'none',
                fontFamily: 'inherit', lineHeight: 1.7, boxSizing: 'border-box',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={e => e.target.style.borderColor = `${currentSec?.color}90`}
              onBlur={e => e.target.style.borderColor = answers[currentQ.id] ? `${currentSec?.color}70` : C.border}
            />
          )}
        </div>

        {/* ── Action buttons — on orange background ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* White outline back — matches site's outline button style */}
          <button
            onClick={handlePrev} disabled={qIndex === 0}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 18px', borderRadius: 50,
              border: `2px solid rgba(255,255,255,0.6)`,
              background: 'transparent',
              cursor: qIndex === 0 ? 'not-allowed' : 'pointer',
              fontSize: 13, fontWeight: 600, color: C.white,
              opacity: qIndex === 0 ? 0.35 : 1,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { if (qIndex > 0) e.currentTarget.style.background = 'rgba(255,255,255,0.15)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            <IconArrowLeft size={14} /> Back
          </button>

          <div style={{ flex: 1 }} />

          {/* Check answer */}
          {currentQ.type !== 'writing' && !isRevealed && (
            <button
              onClick={handleReveal} disabled={!isAnswered}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 18px', borderRadius: 50,
                border: `2px solid ${isAnswered ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)'}`,
                background: isAnswered ? 'rgba(255,255,255,0.18)' : 'transparent',
                cursor: isAnswered ? 'pointer' : 'not-allowed',
                fontSize: 13, fontWeight: 600, color: C.white,
                opacity: isAnswered ? 1 : 0.4,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { if (isAnswered) e.currentTarget.style.background = 'rgba(255,255,255,0.28)' }}
              onMouseLeave={e => { e.currentTarget.style.background = isAnswered ? 'rgba(255,255,255,0.18)' : 'transparent' }}
            >
              <IconCheck size={14} color={C.white} /> Check
            </button>
          )}

          {/* Maroon primary Next/Finish */}
          <button
            onClick={handleNext} disabled={!canNext}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '11px 24px', borderRadius: 50, border: 'none',
              cursor: canNext ? 'pointer' : 'not-allowed',
              fontSize: 13, fontWeight: 800, color: C.white,
              background: canNext ? C.maroon : 'rgba(255,255,255,0.25)',
              boxShadow: canNext ? `0 4px 18px ${tint(C.maroon, 32)}` : 'none',
              opacity: canNext ? 1 : 0.5,
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={e => { if (canNext) { e.currentTarget.style.background = C.maroonHover; e.currentTarget.style.transform = 'translateY(-1px)' } }}
            onMouseLeave={e => { e.currentTarget.style.background = canNext ? C.maroon : 'rgba(255,255,255,0.25)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            {qIndex === allQuestions.length - 1 ? 'Finish' : 'Next'} <IconArrowRight size={14} />
          </button>
        </div>

        {/* Dot navigation */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginTop: 28, flexWrap: 'wrap' }}>
          {allQuestions.map((q, i) => {
            const sec = SECTIONS.find(s => s.id === q.section)
            const isActive = i === qIndex
            const isDone   = answers[q.id] !== undefined
            return (
              <button key={q.id} onClick={() => setQIndex(i)} style={{
                width: isActive ? 22 : 8, height: 8, borderRadius: 4,
                border: 'none', cursor: 'pointer', padding: 0,
                background: isActive ? C.white : isDone ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.25)',
                boxShadow: isActive ? '0 0 8px rgba(255,255,255,0.7)' : 'none',
                transition: 'all 0.3s cubic-bezier(.22,1,.36,1)',
              }} />
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default TestPage
