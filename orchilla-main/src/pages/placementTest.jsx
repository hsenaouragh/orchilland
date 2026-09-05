import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ThunderboltFill, TargetDart, ChartColumn, SparklesFill, Puzzle, Clock, Book, Check } from '@gravity-ui/icons'

import CourseCard from '../components/ui/courseCard'
import { useQuery } from '../hooks/useQuery'
import { fetchCourses } from '../services/db'

import FemaleStudent from '../assets/online-test.png'
import MaleStudent from '../assets/online-test-male.png'
import French from '../assets/french.png'
import English from '../assets/english.png'
import Italian from '../assets/italy.png'
import Korean from '../assets/korea.png'

const LANGUAGES = [
  { id: 'english', label: 'English', flag: English, level: 'A1 – C2', desc: 'Listening, reading & grammar' },
  { id: 'french', label: 'French', flag: French, level: 'A1 – C1', desc: 'Vocabulary & oral comprehension' },
  { id: 'italian', label: 'Italian', flag: Italian, level: 'A1 – B2', desc: 'Real conversation & syntax' },
  { id: 'korean', label: 'Korean', flag: Korean, level: 'A1 – B1', desc: 'Hangul alphabet & daily dialogue' },
]

const PlacementTest = () => {
  const [selectedLang, setSelectedLang] = useState(null)
  const coursesRef = useRef(null)
  const { data: dbCourses } = useQuery(fetchCourses, [], [])
  const navigate = useNavigate()

  const activeLang = LANGUAGES.find(l => l.id === selectedLang)
  const courses = selectedLang
    ? dbCourses
        .filter(c => c.lang?.toLowerCase() === selectedLang && c.status === 'available')
        .sort((a, b) => b.students - a.students)
        .slice(0, 3)
    : []

  return (
    <div className='py-8 px-4 max-w-7xl mx-auto space-y-16'>
      {/* ── HERO BANNER ────────────────────────────────────────────── */}
      <section className='relative rounded-3xl overflow-hidden bg-[var(--color-lavender-tint)] border border-[var(--color-border)] p-8 md:p-14'>
        <div className='flex flex-col lg:flex-row items-center justify-between gap-10'>
          {/* Left Text */}
          <div className='flex-1 max-w-xl'>
            <div className='inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#3D2020] border border-[var(--color-border)] text-xs font-bold text-[var(--color-primary)] dark:text-[var(--color-accent)] shadow-sm mb-4'>
              <ThunderboltFill /> Free · Adaptive · Takes 10 Minutes
            </div>

            <h1 className='text-3xl sm:text-5xl font-extrabold text-[var(--color-text)] leading-tight mb-4'>
              Find Your Level.<br />
              <span className='text-[var(--color-accent)]'>Learn With Confidence.</span>
            </h1>

            <p className='text-sm text-[var(--color-text-body)] leading-relaxed mb-6'>
              Our adaptive placement test assesses your listening, reading, grammar, and vocabulary in real time. Skip what you already know and jump straight into lessons that challenge you.
            </p>

            <div className='grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8'>
              <div className='flex items-center gap-2 p-2.5 rounded-2xl bg-white/80 dark:bg-[#3D2020]/80 border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-body)]'>
                <TargetDart style={{ color: 'var(--color-primary)' }} />
                <span>Adaptive engine</span>
              </div>
              <div className='flex items-center gap-2 p-2.5 rounded-2xl bg-white/80 dark:bg-[#3D2020]/80 border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-body)]'>
                <ChartColumn style={{ color: 'var(--color-primary)' }} />
                <span>Instant CEFR score</span>
              </div>
              <div className='flex items-center gap-2 p-2.5 rounded-2xl bg-white/80 dark:bg-[#3D2020]/80 border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-body)]'>
                <SparklesFill style={{ color: 'var(--color-primary)' }} />
                <span>A1 – C2 coverage</span>
              </div>
            </div>

            <div className='flex items-center gap-4 flex-wrap'>
              <button
                onClick={() => document.getElementById('lang-picker')?.scrollIntoView({ behavior: 'smooth' })}
                className='px-8 py-3 rounded-full text-sm font-bold text-white transition-all shadow-md'
                style={{ background: 'var(--color-primary)' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
              >
                Choose Language & Start →
              </button>

              <Link
                to='/courses'
                className='px-6 py-3 rounded-full text-sm font-bold border border-[var(--color-border)] text-[var(--color-text-body)] hover:bg-white dark:hover:bg-[#3D2020] transition-colors'
              >
                Browse all courses
              </Link>
            </div>
          </div>

          {/* Right Visual Card */}
          <div className='shrink-0 w-full max-w-sm'>
            <div className='bg-white dark:bg-[#3D2020] rounded-3xl p-6 border border-[var(--color-border)] shadow-xl'>
              <div className='flex items-center justify-between pb-4 border-b border-[var(--color-border)] mb-4'>
                <div>
                  <span className='text-[10.5px] font-bold uppercase tracking-wider text-[var(--color-accent)]'>
                    PLACEMENT TEST CHECKLIST
                  </span>
                  <h3 className='text-base font-bold text-[var(--color-text)]'>Skills Assessed</h3>
                </div>
                <div className='flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-lavender-tint)] text-xs font-bold text-[var(--color-primary)] dark:text-[var(--color-accent)]'>
                  <Clock style={{ width: 13, height: 13 }} />
                  <span>10 min</span>
                </div>
              </div>

              <div className='space-y-3 mb-6'>
                {[
                  { skill: 'Listening Comprehension', desc: 'Audio clips and dialogues' },
                  { skill: 'Reading & Context', desc: 'Passages and inferences' },
                  { skill: 'Grammar & Syntax', desc: 'Sentence structures and tenses' },
                  { skill: 'Speaking & Vocabulary', desc: 'Pronunciation and idioms' },
                ].map(({ skill, desc }, i) => (
                  <div key={i} className='flex items-start gap-2.5 p-2 rounded-2xl bg-[var(--color-panel)] border border-[var(--color-border)]'>
                    <div className='w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5'>
                      <Check style={{ width: 11, height: 11 }} />
                    </div>
                    <div>
                      <h4 className='text-xs font-bold text-[var(--color-text)]'>{skill}</h4>
                      <p className='text-[11px] text-[var(--color-text-muted)]'>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className='flex items-center gap-3 pt-3 border-t border-[var(--color-border)]'>
                <div className='flex -space-x-2 overflow-hidden'>
                  <img src={FemaleStudent} alt='Student' className='w-8 h-8 rounded-full object-cover border-2 border-white' />
                  <img src={MaleStudent} alt='Student' className='w-8 h-8 rounded-full object-cover border-2 border-white' />
                </div>
                <p className='text-xs font-medium text-[var(--color-text-muted)]'>
                  <strong className='text-[var(--color-text)]'>50,000+</strong> tests completed
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STEP 1: LANGUAGE PICKER ────────────────────────────────────── */}
      <section id='lang-picker' className='space-y-8'>
        <div className='text-center max-w-xl mx-auto'>
          <span className='text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]'>
            Step 1
          </span>
          <h2 className='text-3xl font-extrabold text-[var(--color-text)] mt-1 mb-2'>
            Choose Your Language
          </h2>
          <p className='text-sm text-[var(--color-text-muted)]'>
            Select the language you want to test. The assessment will automatically adapt to your skill level.
          </p>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-4xl mx-auto'>
          {LANGUAGES.map(lang => {
            const isSelected = selectedLang === lang.id
            return (
              <button
                key={lang.id}
                onClick={() => setSelectedLang(lang.id)}
                className={`flex flex-col items-center text-center p-6 rounded-3xl border-2 transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--color-panel)] border-[var(--color-primary)] dark:border-[var(--color-accent)] shadow-lg -translate-y-1'
                    : 'bg-white dark:bg-[#3D2020] border-[var(--color-border)] hover:border-[var(--color-accent)]'
                }`}
              >
                <div className='w-14 h-14 rounded-2xl bg-[var(--color-bg)] flex items-center justify-center mb-3 shadow-inner'>
                  <img src={lang.flag} alt={lang.label} className='w-8 h-8 object-contain' />
                </div>
                <h3 className='text-base font-bold text-[var(--color-text)] mb-1'>
                  {lang.label}
                </h3>
                <span className='text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[var(--color-accent-faint)] text-[var(--color-accent-hover)] mb-2'>
                  {lang.level}
                </span>
                <p className='text-[11.5px] text-[var(--color-text-muted)] leading-relaxed'>
                  {lang.desc}
                </p>
              </button>
            )
          })}
        </div>

        {selectedLang && (
          <div className='flex justify-center pt-4 animate-fade-up'>
            <button
              onClick={() => navigate(`/test?lang=${selectedLang}`)}
              className='px-10 py-3.5 rounded-full text-sm font-bold text-white transition-all shadow-xl'
              style={{ background: 'var(--color-primary)' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
            >
              Start {activeLang?.label} Test Now →
            </button>
          </div>
        )}
      </section>

      {/* ── STEP 2: RECOMMENDED COURSES PREVIEW ────────────────────────── */}
      {selectedLang && (
        <section ref={coursesRef} className='space-y-6 pt-6 border-t border-[var(--color-border)] animate-fade-in'>
          <div>
            <span className='text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]'>
              Step 2
            </span>
            <h2 className='text-2xl font-extrabold text-[var(--color-text)] mt-1'>
              Popular {activeLang?.label} Courses
            </h2>
            <p className='text-sm text-[var(--color-text-muted)] mt-1'>
              Once your test is finished, our engine will recommend the exact course that matches your score.
            </p>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {courses.map((c, i) => (
              <CourseCard key={c.id || c.title} c={c} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className='rounded-3xl p-8 md:p-12 bg-white dark:bg-[#3D2020] border border-[var(--color-border)]'>
        <div className='text-center max-w-lg mx-auto mb-10'>
          <span className='text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]'>
            Transparent & Simple
          </span>
          <h2 className='text-2xl font-extrabold text-[var(--color-text)] mt-1'>
            How the Placement Test Works
          </h2>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 text-center'>
          <div className='flex flex-col items-center p-4'>
            <div className='w-12 h-12 rounded-2xl bg-[var(--color-lavender-tint)] text-[var(--color-primary)] dark:text-[var(--color-accent)] flex items-center justify-center text-xl mb-4'>
              <Puzzle />
            </div>
            <h3 className='text-base font-bold text-[var(--color-text)] mb-2'>
              Adaptive Questions
            </h3>
            <p className='text-xs text-[var(--color-text-body)] leading-relaxed'>
              The assessment dynamically adjusts based on your answers, saving you time by bypassing material you have already mastered.
            </p>
          </div>

          <div className='flex flex-col items-center p-4'>
            <div className='w-12 h-12 rounded-2xl bg-[var(--color-lavender-tint)] text-[var(--color-primary)] dark:text-[var(--color-accent)] flex items-center justify-center text-xl mb-4'>
              <Clock />
            </div>
            <h3 className='text-base font-bold text-[var(--color-text)] mb-2'>
              Quick & Focused (10 min)
            </h3>
            <p className='text-xs text-[var(--color-text-body)] leading-relaxed'>
              Designed to fit into your busy schedule. Complete it on desktop or mobile in approximately 10 minutes.
            </p>
          </div>

          <div className='flex flex-col items-center p-4'>
            <div className='w-12 h-12 rounded-2xl bg-[var(--color-lavender-tint)] text-[var(--color-primary)] dark:text-[var(--color-accent)] flex items-center justify-center text-xl mb-4'>
              <Book />
            </div>
            <h3 className='text-base font-bold text-[var(--color-text)] mb-2'>
              Instant Score & Roadmap
            </h3>
            <p className='text-xs text-[var(--color-text-body)] leading-relaxed'>
              Get your standardized CEFR level (A1 to C2) immediately and receive personalized course recommendations.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default PlacementTest
