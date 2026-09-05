import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Persons,
  ChartColumn,
  Clock,
  Check,
  Pencil,
  ArrowRight,
} from '@gravity-ui/icons'
import { FaAward } from 'react-icons/fa'

import Reviews from '../components/ui/reviews'
import OfferList from '../components/layout/offerList'
import Modal from '../components/ui/modal'
import Membership from '../components/ui/membership'

import French from '../assets/french.png'
import English from '../assets/english.png'
import Italian from '../assets/italy.png'
import Korean from '../assets/korea.png'
import HeroStudent from '../assets/hero_student.jpg'
import LondonLandmark from '../assets/london_landmark.jpg'
import ParisLandmark from '../assets/paris_landmark.jpg'
import RomeLandmark from '../assets/rome_landmark.jpg'
import SeoulLandmark from '../assets/seoul_landmark.jpg'
import CtaGlobeBooks from '../assets/cta_globe_books.jpg'

const POPULAR_LANGUAGES = [
  {
    id: 'english',
    label: 'English',
    flag: English,
    landmark: LondonLandmark,
    level: 'Beginner – Advanced',
    desc: 'Build fluency and confidence in real-life situations.',
    learners: '12.4K+ learners',
    rating: '4.8 (1.2K reviews)',
  },
  {
    id: 'french',
    label: 'French',
    flag: French,
    landmark: ParisLandmark,
    level: 'Beginner – Advanced',
    desc: 'Master the language of culture, travel and opportunity.',
    learners: '10.2K+ learners',
    rating: '4.7 (1.1K reviews)',
  },
  {
    id: 'italian',
    label: 'Italian',
    flag: Italian,
    landmark: RomeLandmark,
    level: 'Beginner – Advanced',
    desc: "Speak like a local and discover Italy's rich culture.",
    learners: '8.6K+ learners',
    rating: '4.6 (980 reviews)',
  },
  {
    id: 'korean',
    label: 'Korean',
    flag: Korean,
    landmark: SeoulLandmark,
    level: 'Beginner – Advanced',
    desc: 'Learn the language of K-pop, tech and innovation.',
    learners: '7.4K+ learners',
    rating: '4.7 (1,034 reviews)',
  },
]

const Home = () => {
  const [selectedLang, setSelectedLang] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showMembership, setShowMembership] = useState(false)
  const navigate = useNavigate()

  const handleChooseLanguage = (langId) => {
    setSelectedLang(langId)
    setShowModal(true)
  }

  return (
    <main className='px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16 py-6'>
      {/* ── 1. HERO SECTION ────────────────────────────────────────── */}
      <section className='relative pt-4 pb-8 md:py-12'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-12 items-center'>
          {/* Left Text Column */}
          <div className='lg:col-span-6 space-y-6 text-center lg:text-left'>
            <div className='inline-block'>
              <span className='text-xs sm:text-[13px] font-extrabold uppercase tracking-[0.14em] text-[var(--color-accent)]'>
                Your Skills. A Global Future.
              </span>
            </div>

            <h1 className='text-4xl sm:text-6xl font-black text-[var(--color-text)] tracking-tight leading-[1.1]'>
              Learn Languages.<br />
              Open <span className='text-[var(--color-accent)]'>New Doors.</span>
            </h1>

            <p className='text-sm sm:text-base text-[var(--color-text-body)] max-w-xl leading-relaxed mx-auto lg:mx-0'>
              Interactive courses, placement tests and special offers to help you speak with confidence and achieve more.
            </p>

            {/* CTAs */}
            <div className='flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2'>
              <Link
                to='/courses'
                className='inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold text-white transition-all duration-200 cursor-pointer'
                style={{
                  backgroundColor: 'var(--color-primary)',
                  boxShadow: '0 4px 16px rgba(78, 0, 0, 0.28)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'var(--color-primary)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <span>Browse Courses</span>
                <ArrowRight style={{ width: 15, height: 15 }} />
              </Link>

              <Link
                to='/placement-test'
                className='inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold border-2 border-[var(--color-primary)] dark:border-[var(--color-accent)] text-[var(--color-text-body)] hover:bg-[var(--color-panel)] transition-all duration-200 cursor-pointer'
              >
                Take a Placement Test
              </Link>
            </div>
          </div>

          {/* Right Visual Composition with Floating Language Bubbles */}
          <div className='lg:col-span-6 relative flex justify-center'>
            <div className='relative w-full max-w-lg'>
              {/* Main Student Artwork Card */}
              <div className='relative rounded-3xl overflow-hidden shadow-2xl border border-[var(--color-border)] aspect-[4/3] bg-gradient-to-tr from-amber-50/50 to-orange-100/30 dark:from-transparent dark:to-transparent'>
                <img
                  src={HeroStudent}
                  alt='Student learning languages'
                  className='w-full h-full object-cover object-top'
                />
              </div>

              {/* Floating Speech Bubbles around student */}
              {/* 1. Bonjour! (Top-Left) */}
              <div
                className='absolute -top-3 left-4 sm:left-6 px-4 py-1.5 rounded-full bg-[#FBE8E8] dark:bg-[#451E1E] text-[var(--color-primary)] dark:text-[#F8C8C8] text-xs font-bold shadow-lg border border-white/60 animate-bounce'
                style={{ animationDuration: '4s' }}
              >
                Bonjour!
              </div>

              {/* 2. ¡Hola! (Mid-Left) */}
              <div
                className='absolute top-28 -left-3 sm:-left-6 px-4 py-1.5 rounded-full bg-[#FFF0EE] dark:bg-[#3D2020] text-[var(--color-accent-hover)] dark:text-[#F0B0B0] text-xs font-bold shadow-lg border border-white/60 animate-bounce'
                style={{ animationDuration: '4.5s', animationDelay: '0.8s' }}
              >
                ¡Hola!
              </div>

              {/* 3. Hello! (Top-Right) */}
              <div
                className='absolute top-6 -right-2 sm:-right-4 px-4 py-1.5 rounded-full bg-[#FBE8E8] dark:bg-[#451E1E] text-[var(--color-primary)] dark:text-[#F8C8C8] text-xs font-bold shadow-lg border border-white/60 animate-bounce'
                style={{ animationDuration: '3.8s', animationDelay: '1.2s' }}
              >
                Hello!
              </div>

              {/* 4. こんにちは！ (Bottom-Right) */}
              <div
                className='absolute bottom-6 -right-2 sm:right-2 px-4 py-1.5 rounded-full bg-[#FFF0EE] dark:bg-[#3D2020] text-[var(--color-accent-hover)] dark:text-[#F0B0B0] text-xs font-bold shadow-lg border border-white/60 animate-bounce'
                style={{ animationDuration: '4.2s', animationDelay: '1.6s' }}
              >
                こんにちは！
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. FEATURE BADGES BAR (VALUE PROPS) ─────────────────────── */}
      <section className='bg-white dark:bg-[#3D2020] rounded-3xl border border-[var(--color-border)] p-6 shadow-sm'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
          {[
            {
              icon: BookOpen,
              title: 'Interactive Learning',
              desc: 'Engaging lessons & real-life practice',
            },
            {
              icon: Persons,
              title: 'Native Speaker Support',
              desc: 'Speak with confidence',
            },
            {
              icon: ChartColumn,
              title: 'Track Your Progress',
              desc: "See how far you've come",
            },
            {
              icon: FaAward,
              title: 'Recognized Certificates',
              desc: 'Showcase your skills',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className='flex items-center gap-3.5'>
              <div className='w-11 h-11 rounded-2xl bg-[var(--color-panel)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-primary)] dark:text-[var(--color-accent)] shrink-0'>
                <Icon style={{ width: 20, height: 20 }} />
              </div>
              <div>
                <h3 className='text-xs sm:text-sm font-bold text-[var(--color-text)] leading-tight'>
                  {title}
                </h3>
                <p className='text-[11px] sm:text-xs text-[var(--color-text-muted)] mt-0.5 leading-snug'>
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. ASYMMETRIC MAIN GRID (POPULAR COURSES + FEATURES) ───── */}
      <section className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'>
        {/* ── Left Column: POPULAR COURSES (approx 68% width) ── */}
        <div className='lg:col-span-8 space-y-6'>
          {/* Section Header */}
          <div className='flex flex-wrap items-end justify-between gap-4'>
            <div>
              <span className='text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]'>
                Popular Courses
              </span>
              <h2 className='text-2xl sm:text-3xl font-extrabold text-[var(--color-text)] mt-1'>
                Choose Your Language
              </h2>
              <p className='text-xs sm:text-sm text-[var(--color-text-muted)] mt-1'>
                Start your journey with our most popular language courses.
              </p>
            </div>

            <Link
              to='/courses'
              className='inline-flex items-center gap-1.5 px-5 py-2 rounded-full border border-[var(--color-primary)] text-xs font-bold text-[var(--color-primary)] dark:text-[var(--color-accent)] hover:bg-[var(--color-panel)] transition-colors'
            >
              <span>View All Courses</span>
              <ArrowRight style={{ width: 13, height: 13 }} />
            </Link>
          </div>

          {/* Courses 4-Card Grid */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
            {POPULAR_LANGUAGES.map((lang, idx) => (
              <div
                key={lang.id}
                className='group flex flex-col justify-between bg-white dark:bg-[#3D2020] rounded-3xl border border-[var(--color-border)] overflow-hidden transition-all duration-300'
                style={{ boxShadow: '0 2px 10px rgba(78, 0, 0, 0.04)' }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(78, 0, 0, 0.12)'
                  e.currentTarget.style.borderColor = 'var(--color-accent)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(78, 0, 0, 0.04)'
                  e.currentTarget.style.borderColor = 'var(--color-border)'
                }}
              >
                <div>
                  {/* Landmark Header */}
                  <div className='relative h-40 overflow-hidden bg-[var(--color-panel)]'>
                    <img
                      src={lang.landmark}
                      alt={lang.label}
                      className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent' />

                    {/* Flag + Level Badge Pill */}
                    <div className='absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 dark:bg-[#2A1515]/90 backdrop-blur-md shadow-sm border border-white/20'>
                      <img src={lang.flag} alt={lang.label} className='w-4 h-4 object-contain rounded-full' />
                      <span className='text-[10.5px] font-bold text-[var(--color-text)]'>
                        {lang.level}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className='p-5 space-y-2'>
                    <h3 className='text-base font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] dark:group-hover:text-[var(--color-accent)] transition-colors'>
                      {lang.label}
                    </h3>
                    <p className='text-xs text-[var(--color-text-body)] line-clamp-2 leading-relaxed'>
                      {lang.desc}
                    </p>

                    {/* Social Proof + Rating */}
                    <div className='flex items-center justify-between pt-2 text-xs'>
                      <div className='flex items-center gap-2'>
                        <span className='text-[11px] font-semibold text-[var(--color-text-muted)]'>
                          👥 {lang.learners}
                        </span>
                      </div>
                      <div className='flex items-center gap-1 font-bold text-[11px] text-amber-500'>
                        <span>★</span>
                        <span className='text-[var(--color-text)]'>{lang.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Button CTA */}
                <div className='px-5 pb-5 pt-0'>
                  <button
                    onClick={() => handleChooseLanguage(lang.id)}
                    className='w-full py-2.5 rounded-full text-xs font-bold text-white transition-all duration-200 cursor-pointer'
                    style={{
                      backgroundColor: 'var(--color-primary)',
                      boxShadow: '0 2px 10px rgba(78, 0, 0, 0.2)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
                  >
                    View Course
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right Column: STACKED FEATURE CARDS (approx 32% width) ── */}
        <div className='lg:col-span-4 space-y-6'>
          {/* 1. Placement Tests Feature Card (Lavender Tint) */}
          <div className='bg-[var(--color-lavender-tint)] rounded-3xl p-6 border border-[var(--color-border)] space-y-5'>
            <div>
              <span className='text-[10.5px] font-extrabold uppercase tracking-wider text-[var(--color-primary)] dark:text-[var(--color-accent)]'>
                Placement Tests
              </span>
              <h3 className='text-xl font-extrabold text-[var(--color-text)] mt-1'>
                Find Your Level
              </h3>
              <p className='text-xs text-[var(--color-text-body)] leading-relaxed mt-1'>
                Take a quick test and get a personalized recommendation for the right course.
              </p>
            </div>

            <div className='flex items-center justify-between gap-4'>
              <Link
                to='/placement-test'
                className='inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full text-xs font-bold text-white transition-all'
                style={{
                  backgroundColor: 'var(--color-primary)',
                  boxShadow: '0 3px 12px rgba(78, 0, 0, 0.25)',
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
              >
                <span>Start Test</span>
                <ArrowRight style={{ width: 13, height: 13 }} />
              </Link>

              {/* Checklist Mini Card */}
              <div className='relative bg-white dark:bg-[#3D2020] rounded-2xl p-3.5 border border-[var(--color-border)] shadow-sm shrink-0 w-36'>
                <div className='flex items-center gap-1 text-[11px] font-bold text-[var(--color-text)] mb-2'>
                  <Clock style={{ width: 12, height: 12, color: 'var(--color-accent)' }} />
                  <span>10 min</span>
                </div>
                <div className='space-y-1 text-[10.5px] text-[var(--color-text-muted)]'>
                  <div className='flex items-center gap-1'>
                    <Check style={{ width: 11, height: 11, color: '#1D9E75' }} />
                    <span>Listening</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Check style={{ width: 11, height: 11, color: '#1D9E75' }} />
                    <span>Reading</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Check style={{ width: 11, height: 11, color: '#1D9E75' }} />
                    <span>Grammar</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Check style={{ width: 11, height: 11, color: '#1D9E75' }} />
                    <span>Speaking</span>
                  </div>
                </div>
                <div className='absolute -bottom-2 -right-1 text-purple-400 rotate-12'>
                  <Pencil style={{ width: 16, height: 16 }} />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Special Offers Feature Card (Warm Panel) */}
          <div className='bg-white dark:bg-[#3D2020] rounded-3xl p-6 border border-[var(--color-border)] shadow-sm space-y-5'>
            <div className='flex items-start justify-between gap-2'>
              <div>
                <span className='text-[10.5px] font-extrabold uppercase tracking-wider text-[var(--color-accent)]'>
                  Special Offers
                </span>
                <h3 className='text-lg font-extrabold text-[var(--color-text)] mt-0.5'>
                  Learn More for Less
                </h3>
                <p className='text-xs text-[var(--color-text-muted)] mt-0.5 leading-snug'>
                  Take advantage of our limited-time deals and special bundles.
                </p>
              </div>

              <Link
                to='/offers'
                className='text-[11px] font-bold text-[var(--color-primary)] dark:text-[var(--color-accent)] hover:underline shrink-0'
              >
                View All →
              </Link>
            </div>

            {/* Compact Offers List */}
            <OfferList limit={3} showHeading={false} compact={true} />
          </div>
        </div>
      </section>

      {/* ── 4. LOWER SECTION: WHY CHOOSE + REVIEWS ─────────────────── */}
      <section className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch'>
        {/* ── Left Box: WHY CHOOSE ORCHILLALAND ── */}
        <div
          id='why-choose'
          className='lg:col-span-6 bg-[var(--color-lavender-tint)] rounded-3xl p-8 md:p-10 border border-[var(--color-border)] flex flex-col justify-between'
        >
          <div>
            <span className='text-xs font-bold uppercase tracking-widest text-[var(--color-primary)] dark:text-[var(--color-accent)]'>
              Why Choose OrchillaLand
            </span>
            <h3 className='text-2xl font-extrabold text-[var(--color-text)] mt-1 mb-2'>
              A Better Way to Learn
            </h3>
            <p className='text-xs sm:text-sm text-[var(--color-text-body)] leading-relaxed mb-8'>
              Our platform is designed to make language learning simple, effective and enjoyable with certified tutors, AI conversation practice, and adaptive curriculum.
            </p>
          </div>

          {/* 4 Stat Columns */}
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 text-center pt-4 border-t border-[var(--color-border)]/60'>
            <div>
              <p className='text-xl sm:text-2xl font-black text-[var(--color-primary)] dark:text-[var(--color-accent)]'>
                50,000+
              </p>
              <p className='text-[11px] font-semibold text-[var(--color-text-muted)] mt-0.5'>
                Active Learners
              </p>
            </div>

            <div>
              <p className='text-xl sm:text-2xl font-black text-[var(--color-primary)] dark:text-[var(--color-accent)]'>
                200+
              </p>
              <p className='text-[11px] font-semibold text-[var(--color-text-muted)] mt-0.5'>
                Courses
              </p>
            </div>

            <div>
              <p className='text-xl sm:text-2xl font-black text-[var(--color-primary)] dark:text-[var(--color-accent)]'>
                95%
              </p>
              <p className='text-[11px] font-semibold text-[var(--color-text-muted)] mt-0.5'>
                Satisfaction Rate
              </p>
            </div>

            <div>
              <p className='text-xl sm:text-2xl font-black text-[var(--color-primary)] dark:text-[var(--color-accent)]'>
                4.8/5
              </p>
              <p className='text-[11px] font-semibold text-[var(--color-text-muted)] mt-0.5'>
                Average Rating
              </p>
            </div>
          </div>
        </div>

        {/* ── Right Box: WHAT OUR STUDENTS SAY (Reviews) ── */}
        <div className='lg:col-span-6 bg-white dark:bg-[#3D2020] rounded-3xl p-8 md:p-10 border border-[var(--color-border)] shadow-sm'>
          <Reviews />
        </div>
      </section>

      {/* ── MEMBERSHIP ACCORDION / TOGGLE (PRESERVED) ───────────────── */}
      <section className='rounded-3xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h4 className='text-sm font-bold text-[var(--color-text)]'>
              Looking for unlimited access?
            </h4>
            <p className='text-xs text-[var(--color-text-muted)]'>
              Enroll in multiple courses to unlock our exclusive VIP Club membership benefits.
            </p>
          </div>
          <button
            onClick={() => setShowMembership(o => !o)}
            className='px-4 py-2 rounded-full text-xs font-bold border border-[var(--color-border)] text-[var(--color-primary)] dark:text-[var(--color-accent)] hover:bg-white dark:hover:bg-[#3D2020] transition-colors'
          >
            {showMembership ? 'Hide Details' : 'View Membership Plans'}
          </button>
        </div>
        {showMembership && (
          <div className='mt-6 pt-6 border-t border-[var(--color-border)] animate-fade-in'>
            <Membership />
          </div>
        )}
      </section>

      {/* ── 5. PRE-FOOTER CTA BANNER ─────────────────────────────────── */}
      <section
        className='relative rounded-3xl overflow-hidden p-8 sm:p-12 text-white shadow-2xl'
        style={{
          background: 'linear-gradient(135deg, #4E0000 0%, #2A0404 100%)',
        }}
      >
        <div className='grid grid-cols-1 md:grid-cols-12 gap-8 items-center'>
          {/* Left 3D Illustration */}
          <div className='md:col-span-4 flex justify-center md:justify-start'>
            <div className='w-44 sm:w-52 h-44 sm:h-52 rounded-2xl overflow-hidden shadow-2xl border border-white/10'>
              <img
                src={CtaGlobeBooks}
                alt='Globe with graduation cap and books'
                className='w-full h-full object-cover'
              />
            </div>
          </div>

          {/* Center Text */}
          <div className='md:col-span-5 space-y-3 text-center md:text-left'>
            <span className='text-[11px] font-extrabold uppercase tracking-widest text-[#E8A8A8]'>
              Start Today
            </span>
            <h2 className='text-2xl sm:text-3xl font-black leading-tight'>
              Your Language Journey Begins Here
            </h2>
            <p className='text-xs sm:text-sm text-white/80 leading-relaxed max-w-md'>
              Join thousands of learners worldwide and unlock your full potential.
            </p>
          </div>

          {/* Right Button */}
          <div className='md:col-span-3 flex justify-center md:justify-end'>
            <Link
              to='/courses'
              className='inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 shadow-xl'
              style={{
                backgroundColor: '#FFF5EE',
                color: '#4E0000',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#FFFFFF'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#FFF5EE'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <span>Browse Courses</span>
              <ArrowRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── LANGUAGE PICKER MODAL (PRESERVED) ────────────────────────── */}
      {showModal && selectedLang && (
        <Modal
          onClose={() => setShowModal(false)}
          onConfirm={() => {
            navigate(`/courses?lang=${selectedLang.charAt(0).toUpperCase() + selectedLang.slice(1)}`)
            setShowModal(false)
          }}
        />
      )}
    </main>
  )
}

export default Home