import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import Reviews from '../components/ui/reviews'
import OfferList from '../components/layout/offerList'
import Button from '../components/ui/button'
import Modal from '../components/ui/modal'

import French from '../assets/french.png'
import English from '../assets/english.png'
import Italian from '../assets/italy.png'
import Korean from '../assets/korea.png'
import HeroImage from '../assets/hero-image.png'

// ── languages config ─────────────────────────────
const LANGUAGES = [
  { id: 'english', label: 'English', flag: English, color: '#2563EB', accent: '#DBEAFE' },
  { id: 'french',  label: 'French',  flag: French,  color: '#DC2626', accent: '#FEE2E2' },
  { id: 'italian', label: 'Italian', flag: Italian, color: '#16A34A', accent: '#DCFCE7' },
  { id: 'korean',  label: 'Korean',  flag: Korean,  color: '#9333EA', accent: '#F3E8FF' },
]

const Home = () => {
  const [selectedLang, setSelectedLang] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()

  return (
    <>
      {/* ── HERO ───────────────────────────── */}
      <div className='max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-center min-h-[650px]'>
        <div className='flex flex-col justify-center py-14 md:pr-16 xl:pr-40'>
          <div className='text-center md:text-left space-y-6'>
            <p className='text-[var(--color-text-body)] uppercase font-semibold'>
              Your favorite Learning destination
            </p>

            <h1 className='text-2xl font-bold lg:text-4xl leading-tight'>
              Learn languages. Speak with confidence.
            </h1>

            <p>
              Interactive online courses, real conversation practice, and personalized support to help you improve faster.
            </p>

            <div className='flex justify-center items-center gap-8 md:justify-start mt-8'>
              <Link to='/courses'>
                <Button>Browse Courses</Button>
              </Link>

              <Link to='/placement-test'>
                <Button variant='outline' color='var(--color-primary)'>
                  Test your level
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className='flex items-center justify-center'>
          <img src={HeroImage} className='w-80 md:w-2xl' />
        </div>
      </div>

      {/* ── LANGUAGE PICKER ───────────────── */}
      <div className='max-w-6xl mx-auto px-4 py-10'>
        <p className='text-center text-[var(--color-text-body)] uppercase font-semibold mb-6'>
          Available Languages
        </p>

        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto'>
          {LANGUAGES.map(lang => (
            <button
              key={lang.id}
              onClick={() => {
                setSelectedLang(lang.id)
                setShowModal(true)
              }}
              className='relative flex flex-col items-center gap-2 px-6 py-5 rounded-2xl border-2 transition-all duration-300'
              style={{
                borderColor: selectedLang === lang.id ? lang.color : 'var(--color-border)',
                background: selectedLang === lang.id ? lang.accent : 'var(--color-surface)',
                boxShadow: selectedLang === lang.id
                  ? `0 4px 20px ${lang.color}30`
                  : '0 1px 4px rgba(0,0,0,0.04)',
                transform: selectedLang === lang.id ? 'scale(1.04)' : 'scale(1)',
              }}
            >
              {selectedLang === lang.id && (
                <span
                  className='absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px]'
                  style={{ background: lang.color }}
                >
                  ✓
                </span>
              )}

              <img
                src={lang.flag}
                alt={lang.label}
                className='w-10 h-10 object-contain'
              />

              <span className='text-sm font-semibold text-gray-700 dark:text-slate-100'>
                {lang.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── MODAL ───────────────── */}
      {showModal && selectedLang && (
        <Modal
          onClose={() => setShowModal(false)}
          onConfirm={() => {
            navigate(
              `/courses?lang=${
                selectedLang.charAt(0).toUpperCase() +
                selectedLang.slice(1)
              }`
            )
            setShowModal(false)
          }}
        />
      )}

      {/* Student workflow */}
      <div className='max-w-6xl mx-auto px-4 py-12'>
        <div className='bg-white dark:bg-slate-900 border border-[var(--color-border)] rounded-3xl p-8'>
          <p className='text-xs uppercase tracking-widest font-semibold text-[var(--color-text-body)] mb-3'>
            How enrollment works
          </p>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            {[
              ['1', 'Apply', 'Choose a course and submit your application.'],
              ['2', 'Pay', 'Follow the payment instructions and upload your receipt.'],
              ['3', 'Approval', 'Wait for admin approval before course access opens.'],
              ['4', 'Learn', 'Access released lessons, assignments, tests, and grades.'],
            ].map(([step, title, body]) => (
              <div key={step} className='rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5'>
                <div className='w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-sm font-bold mb-4'>
                  {step}
                </div>
                <h3 className='font-semibold text-[var(--color-text)] mb-2'>{title}</h3>
                <p className='text-sm text-[var(--color-text-muted)] leading-relaxed'>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PLACEMENT TEST CTA ───────────────── */}
      <div className='max-w-6xl mx-auto px-4 my-12'>
        <div className='bg-[#1D9E75] rounded-3xl px-10 py-12 flex flex-wrap gap-10 items-center justify-between'>
          <div className='max-w-sm'>
            <span className='text-[#9FE1CB] text-xs bg-white/10 px-3 py-1 rounded-full'>
              Free · 10 minutes
            </span>

            <h2 className='text-white text-3xl font-semibold mt-4 mb-3 leading-snug'>
              Not sure where to start?
            </h2>

            <p className='text-white/60 text-sm leading-relaxed mb-6'>
              Our placement test figures out your exact level in minutes — so you skip what you already know and jump straight into learning that actually challenges you.
            </p>

            <Link to='/placement-test'>
              <Button color='#0F6E56'>Test your level →</Button>
            </Link>
          </div>

          <div className='flex flex-col gap-4'>
            {[
              ['10 min', 'Quick & focused'],
              ['A1 – C2', 'Full range coverage'],
              ['Instant', 'Results right away'],
            ].map(([stat, label]) => (
              <div key={stat} className='flex items-center gap-4'>
                <span className='text-white text-xl font-semibold w-24'>
                  {stat}
                </span>
                <span className='text-white/50 text-sm'>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── OFFERS ───────────────── */}
      <div className='max-w-6xl mx-auto px-4 py-12'>
        <OfferList limit={3} showHeading={true} />
      </div>

      {/* ── REVIEWS ───────────────── */}
      <div className='max-w-6xl mx-auto px-4'>
        <Reviews />
      </div>
    </>
  )
}

export default Home
