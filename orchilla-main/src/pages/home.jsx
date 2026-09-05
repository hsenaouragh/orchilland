import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import Membership from '../components/ui/membership'
import Reviews from '../components/ui/reviews'
import OfferList from '../components/layout/offerList'
import Button from '../components/ui/button'
import Modal from '../components/ui/modal'

import French from '../assets/french.png'
import English from '../assets/english.png'
import Italian from '../assets/italy.png'
import Korean from '../assets/korea.png'
import HeroImage from '../assets/hero-image.png'

const LANGUAGES = [
  { id: 'english', label: 'English', flag: English },
  { id: 'french',  label: 'French',  flag: French  },
  { id: 'italian', label: 'Italian', flag: Italian  },
  { id: 'korean',  label: 'Korean',  flag: Korean   },
]

const Home = () => {
  const [selectedLang, setSelectedLang] = useState(null)
  const [showModal, setShowModal]       = useState(false)
  const navigate = useNavigate()

  return (
    <>
      {/* ── HERO ───────────────── */}
      <div
        className='relative mx-auto px-8 flex flex-col md:flex-row items-center justify-center pt-16 pb-16 gap-10'
      >
        <div className='flex flex-col justify-center py-14 md:pr-16 xl:pr-40'>
          <div className='text-center md:text-left space-y-6'>

            <p style={{ color: 'var(--color-accent)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
              Your favorite learning destination
            </p>

            <h1 style={{ color: 'var(--color-primary)', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem' }}>
              Learn languages. Speak with confidence.
            </h1>

            <p style={{ color: 'var(--color-text-body)', fontWeight: 500, textTransform: 'uppercase', maxWidth: '36rem' }}>
              Interactive online courses, real conversation practice, and
              personalized support to help you improve faster.
            </p>

            <div className='flex justify-center items-center gap-5 md:justify-start mt-8 flex-wrap'>
              <Link to='/courses'>
                <Button color='var(--color-primary)' size='lg'>
                  Browse Courses
                </Button>
              </Link>

              <Link to='/placement-test'>
                <Button variant='outline' color='var(--color-primary)' size='lg'>
                  Test your level
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className='flex items-center justify-center'>
          <img src={HeroImage} alt='Hero' className='w-80 md:w-[34rem] drop-shadow-xl' />
        </div>
      </div>

      {/* ___ DIVIDER ____ */}
      <div
        className='w-1/3 h-1 mx-auto my-6 rounded-full'
        style={{ backgroundColor: 'var(--color-primary)' }}
      />

      {/* ── LANGUAGE PICKER ───────────────── */}
      <div className='max-w-6xl mx-auto px-4 py-14'>
        <p style={{ textAlign: 'center', color: 'var(--color-primary)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '2rem' }}>
          Available Languages
        </p>

        <div className='grid grid-cols-2 md:grid-cols-4 gap-5 max-w-3xl mx-auto'>
          {LANGUAGES.map(lang => (
            <button
              key={lang.id}
              onClick={() => { setSelectedLang(lang.id); setShowModal(true) }}
              className='relative flex flex-col items-center gap-3 px-6 py-6 rounded-3xl border transition-all duration-300'
              style={{
                borderColor: selectedLang === lang.id ? 'var(--color-accent)'   : 'var(--color-border)',
                background:  selectedLang === lang.id ? 'var(--color-bg)'       : 'var(--color-surface)',
                boxShadow:   selectedLang === lang.id
                  ? '0 10px 28px var(--color-border)'
                  : '0 4px 12px rgba(0,0,0,.04)',
                transform: selectedLang === lang.id ? 'translateY(-2px)' : 'translateY(0)',
              }}
            >
              {selectedLang === lang.id && (
                <span
                  className='absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold'
                  style={{ background: 'var(--color-primary)', color: 'var(--color-surface)' }}
                >
                  ✓
                </span>
              )}

              <img src={lang.flag} alt={lang.label} className='w-12 h-12 object-contain' />

              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)' }}>
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
            navigate(`/courses?lang=${selectedLang.charAt(0).toUpperCase() + selectedLang.slice(1)}`)
            setShowModal(false)
          }}
        />
      )}

      {/* ── MEMBERSHIP ───────────────── */}
      <div
        className='max-w-6xl mx-auto px-4 py-10 rounded-3xl'
        style={{ background: 'var(--color-bg)' }}
      >
        <Membership />
      </div>

      {/* ── PLACEMENT TEST CTA ───────────────── */}
      <div className='max-w-6xl mx-auto px-4 my-14'>
        <div
          className='rounded-3xl px-10 py-12 flex flex-wrap gap-10 items-center justify-between'
          style={{
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%)',
          }}
        >
          <div className='max-w-sm'>
            <span style={{ fontSize: '0.75rem', padding: '4px 12px', borderRadius: 9999, background: 'rgba(255,245,238,0.12)', color: 'var(--color-bg)' }}>
              Free · 10 minutes
            </span>

            <h2 style={{ color: 'var(--color-surface)', fontSize: '1.875rem', fontWeight: 600, marginTop: '1rem', marginBottom: '0.75rem', lineHeight: 1.3 }}>
              Not sure where to start?
            </h2>

            <p style={{ color: 'var(--color-accent-light)', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              Our placement test figures out your exact level in minutes —
              skip what you already know and jump into lessons that truly
              challenge you.
            </p>

            <Link to='/placement-test'>
              <Button color='var(--color-accent)'>Test your level →</Button>
            </Link>
          </div>

          <div className='flex flex-col gap-5'>
            {[
              ['10 min',  'Quick & focused'],
              ['A1 – C2', 'Full range coverage'],
              ['Instant', 'Results right away'],
            ].map(([stat, label]) => (
              <div key={stat} className='flex items-center gap-5'>
                <span style={{ color: 'var(--color-surface)', fontSize: '1.25rem', fontWeight: 600, width: '6rem' }}>
                  {stat}
                </span>
                <span style={{ color: 'var(--color-accent-light)', fontSize: '0.875rem' }}>
                  {label}
                </span>
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
      <div
        className='max-w-6xl mx-auto px-4 py-10 rounded-3xl mb-16'
        style={{ background: 'var(--color-bg)' }}
      >
        <Reviews />
      </div>
    </>
  )
}

export default Home