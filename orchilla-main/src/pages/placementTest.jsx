import { useState, useRef } from 'react'
import { useNavigate , Link} from 'react-router-dom'

import {ThunderboltFill ,TargetDart , ChartColumn , SparklesFill , Puzzle , Clock , Book} from '@gravity-ui/icons';

import CourseCard from '../components/ui/courseCard'
import Button from '../components/ui/button'
import { useQuery } from '../hooks/useQuery'
import { fetchCourses } from '../services/db'

import FemaleStudent from '../assets/online-test.png'
import MaleStudent   from '../assets/online-test-male.png'
import French from '../assets/french.png'
import English from '../assets/english.png'
import Italian from '../assets/italy.png'
import Korean from '../assets/korea.png'

// ── language metadata ────────────────────────────────────────────────────────
const LANGUAGES = [
  { id: 'english',  label: 'English',  flag: English, color: '#2563EB', accent: '#DBEAFE' },
  { id: 'french',   label: 'French',   flag: French, color: '#DC2626', accent: '#FEE2E2' },
  { id: 'italian',  label: 'Italian',  flag: Italian, color: '#16A34A', accent: '#DCFCE7' },
  { id: 'korean',   label: 'Korean',   flag: Korean, color: '#9333EA', accent: '#F3E8FF' },
]


// ── tiny animated stat pill ──────────────────────────────────────────────────
const StatPill = ({ icon, label }) => (
  <div className='flex items-center gap-2 bg-white dark:bg-slate-900 border border-[var(--color-border)] rounded-full px-4 py-2 text-[var(--color-text-body)] text-xs font-semibold shadow-sm'>
    <span>{icon}</span>
    <span>{label}</span>
  </div>
)

// ── language selector card ───────────────────────────────────────────────────
const LangCard = ({ lang, selected, onSelect }) => (
  <button
    onClick={() => onSelect(lang.id)}
    className='relative flex flex-col items-center gap-2 px-6 py-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer focus:outline-none'
    style={{
      borderColor: selected ? lang.color : 'var(--color-border)',
      background:  selected ? lang.accent : 'var(--color-surface)',
      boxShadow:   selected ? `0 4px 20px ${lang.color}30` : '0 1px 4px rgba(0,0,0,0.04)',
      transform:   selected ? 'scale(1.04)' : 'scale(1)',
    }}
  >
    {selected && (
      <span
        className='absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold'
        style={{ background: lang.color }}
      >✓</span>
    )}
    <img src={lang.flag} alt={lang.label} className='w-10 h-10 object-contain mb-1'/>
    <span className='text-sm font-semibold text-gray-700 dark:text-slate-100'>{lang.label}</span>
  </button>
)

// ── main page ────────────────────────────────────────────────────────────────
const PlacementTest = () => {
  const [selectedLang, setSelectedLang] = useState(null)
  const coursesRef = useRef(null)
  const { data: dbCourses } = useQuery(fetchCourses, [], [])

  const activeLang = LANGUAGES.find(l => l.id === selectedLang)
  const courses = selectedLang
  ? dbCourses
      .filter(c => c.lang.toLowerCase() === selectedLang && c.status === 'available')
      .sort((a, b) => b.students - a.students) // show most popular
      .slice(0, 3)
  : []

  const navigate = useNavigate()

  return (
    <>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        className='relative overflow-hidden'
        style={{
          background: 'linear-gradient(135deg, var(--color-bg) 0%, var(--color-accent-faint) 100%)',
          minHeight: 520,
        }}
      >

        {/* wavy bottom divider */}
        <svg className='absolute bottom-0 left-0 w-full' viewBox='0 0 1440 80' preserveAspectRatio='none' style={{ height: 60 }}>
          <path d='M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z' fill='#F9FAFB' />
        </svg>

        <div className='relative max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-center pt-16 pb-16 gap-10'>

          {/* ── left copy ── */}
          <div className='flex-1 max-w-lg pb-4 md:pb-0'>
            {/* pill badge */}
            <span className='inline-flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-[var(--color-border)] text-[var(--color-text-body)] text-xs font-semibold px-4 py-1.5 rounded-full mb-5 shadow-sm'>
              <ThunderboltFill /> Free · Takes only 10 minutes
            </span>

            <h1 className='text-[var(--color-text)] text-4xl md:text-5xl font-extrabold leading-tight mb-4'>
              Test Your<br />
              <span style={{ color: 'var(--color-green-dark)' }}>Language Level</span>
            </h1>
            <p className='text-[var(--color-text-body)] text-sm leading-relaxed mb-8 max-w-sm'>
              Our adaptive placement test pinpoints your exact level — A1 to C2 — so you enroll in the course that's actually right for you.
            </p>

            <div className='flex flex-wrap gap-3 mb-8'>
              <StatPill icon={<TargetDart />} label='Adaptive questions' />
              <StatPill icon={<ChartColumn />} label='Instant results' />
              <StatPill icon={<SparklesFill />} label='A1 – C2 coverage' />
            </div>

            {/* CTA */}
            <div className='flex flex-wrap gap-3'>
              <Button size='lg' color='var(--color-primary)'
                onClick={() => document.getElementById('lang-picker')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Start the test →
              </Button>
              
              <Link to='/courses'>
                <Button variant='outline' size='lg' color='var(--color-primary)'>
                  Browse courses
                </Button>
              </Link>
            
            </div>
          </div>

          {/* ── hero images (the two students, in colour) ── */}
          <div className='flex gap-4'> 

  {/* Left image */}
  <div className='w-80 h-60 bg-gray-400 rounded-r-full border-4 border-[var(--color-accent)] overflow-hidden'>
    <img 
      src={MaleStudent} 
      alt="male-reading"
      className='w-full h-full object-cover object-bottom'
    />
  </div>

  {/* Right image */}
  <div className='w-80 h-60 bg-gray-400 rounded-l-full overflow-hidden'>
    <img 
      src={FemaleStudent} 
      alt="female-reading"
      className='w-full h-full object-cover object-bottom'
    />
  </div>

</div>

        </div>
      </section>

      {/* ── LANGUAGE PICKER ──────────────────────────────────────────────── */}
      <section id='lang-picker' className='max-w-6xl mx-auto px-4 pt-16 pb-10'>
        <p className='text-center text-[var(--color-text-body)] uppercase font-semibold text-xs tracking-widest mb-3'>Step 1</p>
        <h2 className='text-center text-2xl font-bold text-gray-900 mb-2'>Choose your language</h2>
        <p className='text-center text-gray-400 text-sm mb-10'>Select the language you want to be tested in</p>

        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto'>
          {LANGUAGES.map(lang => (
            <LangCard
              key={lang.id}
              lang={lang}
              selected={selectedLang === lang.id}
              onSelect={setSelectedLang}
            />
          ))}
        </div>

        {/* start button — appears after picking */}
        {selectedLang && (
          <div className='flex justify-center mt-8'>
            <Button size='lg' color={activeLang?.color} onClick={() => navigate(`/test?lang=${selectedLang}`)}>
                Start {activeLang?.label} test →
            </Button>
          </div>
        )}
      </section>

      {/* ── RECOMMENDED COURSES ──────────────────────────────────────────── */}
      {selectedLang && (
        <section ref={coursesRef} className='max-w-6xl mx-auto px-4 py-12'>
          <div className='flex items-center gap-3 mb-2'>
            <p className='text-[var(--color-text-body)] uppercase font-semibold text-xs tracking-widest'>Step 2</p>
          </div>
          <h2 className='text-2xl font-bold text-gray-900 mb-1'>
            {activeLang?.label} courses you might like
          </h2>
          <p className='text-gray-400 text-sm mb-8'>
            After your test, we'll recommend the perfect one — browse ahead to see what's available.
          </p>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {courses.map((c, i) => (
              <CourseCard key={c.title} c={c} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS (static info strip) ────────────────────────────── */}
      <section className='max-w-6xl mx-auto px-4 py-12'>
        <div className='rounded-3xl p-10 bg-[var(--color-green-faint)] border border-[var(--color-border)]'>
          <p className='text-center text-[var(--color-text-body)] uppercase font-semibold text-xs tracking-widest mb-8'>How the test works</p>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 text-center'>
            {[
              { icon: <Puzzle />, title: 'Adaptive questions', desc: 'The test adjusts to your answers, getting harder or easier in real time.' },
              { icon: <Clock />, title: '~10 minutes',        desc: 'Short, focused, and designed so you can take it anytime, anywhere.' },
              { icon: <Book />, title: 'Instant results',    desc: 'Get your CEFR level (A1–C2) the moment you finish.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className='flex flex-col items-center'>
                <div className='text-4xl mb-3 text-blue-700'>{icon}</div>
                <h3 className='font-semibold text-gray-900 mb-2'>{title}</h3>
                <p className='text-gray-500 text-sm leading-relaxed'>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </>
  )
}

export default PlacementTest
