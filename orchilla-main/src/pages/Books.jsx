import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  CreditCard,
  Paperclip,
  CircleCheck,
  ArrowRight,
  Globe,
  Headphones,
  FileText,
  Persons,
} from '@gravity-ui/icons'
import Button from '../components/ui/button'
import { useQuery } from '../hooks/useQuery'
import { fetchBooks } from '../services/db'
import { formatDinars, LANDMARK_IMAGES } from '../data/siteData'

import FrenchFlag from '../assets/french.png'
import EnglishFlag from '../assets/english.png'
import ItalianFlag from '../assets/italy.png'
import KoreanFlag from '../assets/korea.png'
import ParisLandmark from '../assets/paris_landmark.jpg'
import LondonLandmark from '../assets/london_landmark.jpg'
import RomeLandmark from '../assets/rome_landmark.jpg'
import SeoulLandmark from '../assets/seoul_landmark.jpg'
import CtaGlobeBooks from '../assets/cta_globe_books.jpg'

const STEPS = [
  {
    n: '1',
    icon: CreditCard,
    label: 'Pay for your book',
    desc: 'Choose a title and complete payment through your preferred method.',
  },
  {
    n: '2',
    icon: Paperclip,
    label: 'Upload your receipt',
    desc: 'Attach proof of payment on the book page so we can verify it.',
  },
  {
    n: '3',
    icon: CircleCheck,
    label: 'Get instant access',
    desc: 'Once an admin approves it, the download unlocks automatically.',
    accent: true,
  },
]

const FALLBACK_BOOKS = [
  {
    id: 'book-1',
    title: 'Le Petit Prince',
    language: 'French',
    level: 'Beginner – A1',
    pages: '120 pages',
    type: 'Classic literature',
    description: 'A timeless classic to improve your vocabulary and understanding of French culture.',
    price: 4999,
    coverColor: '#4E0000',
    flag: FrenchFlag,
    landmark: ParisLandmark,
  },
  {
    id: 'book-2',
    title: 'Italiano per tutti',
    language: 'Italian',
    level: 'Beginner – A1',
    pages: '150 pages',
    type: 'Dialogues & exercises',
    description: 'Build your Italian step by step with real-life dialogues and practical exercises.',
    price: 4499,
    coverColor: '#D4537E',
    flag: ItalianFlag,
    landmark: RomeLandmark,
  },
  {
    id: 'book-3',
    title: 'English in Context',
    language: 'English',
    level: 'Beginner – A1 · B1',
    pages: '110 pages',
    type: 'Real-life conversations',
    description: 'Learn practical English through real everyday situations and essential vocabulary.',
    price: 3499,
    coverColor: '#E85D26',
    flag: EnglishFlag,
    landmark: LondonLandmark,
  },
  {
    id: 'book-4',
    title: 'Korean Essentials',
    language: 'Korean',
    level: 'Beginner – A1 · B1',
    pages: '140 pages',
    type: 'Grammar & vocabulary',
    description: 'A practical approach to Korean Hangul, pronunciation, and everyday expressions.',
    price: 3799,
    coverColor: '#1D9E75',
    flag: KoreanFlag,
    landmark: SeoulLandmark,
  },
]

const LANGUAGE_FLAGS = {
  French: FrenchFlag,
  English: EnglishFlag,
  Italian: ItalianFlag,
  Korean: KoreanFlag,
}

const Books = () => {
  const { data: dbBooks, isLoading } = useQuery(fetchBooks, [], [])
  const [selectedLanguage, setSelectedLanguage] = useState('all')

  const booksList = useMemo(() => {
    if (dbBooks && dbBooks.length > 0) {
      return dbBooks.map((b, idx) => {
        const lang = b.language || 'French'
        const fallback = FALLBACK_BOOKS[idx % FALLBACK_BOOKS.length]
        return {
          ...fallback,
          ...b,
          flag: LANGUAGE_FLAGS[lang] || fallback.flag,
          landmark: b.coverUrl || fallback.landmark,
          level: b.level || fallback.level,
          pages: b.pages || fallback.pages,
          type: b.type || fallback.type,
        }
      })
    }
    return FALLBACK_BOOKS
  }, [dbBooks])

  const filteredBooks = useMemo(() => {
    if (selectedLanguage === 'all') return booksList
    return booksList.filter(
      b => (b.language || '').toLowerCase() === selectedLanguage.toLowerCase()
    )
  }, [booksList, selectedLanguage])

  return (
    <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10'>
      {/* ── 1. HERO BANNER ────────────────────────────────────────── */}
      <section className='relative rounded-[32px] overflow-hidden border border-[var(--color-border)] shadow-sm bg-gradient-to-r from-[#FFF0EE] via-[#FFF8F5] to-[#FBE8E8] dark:from-[#3D2020] dark:via-[#341A1A] dark:to-[#2A1515] p-6 sm:p-10 lg:p-12 transition-colors'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-center'>
          {/* Left Hero Text */}
          <div className='lg:col-span-7 space-y-4 text-left'>
            <span className='inline-block text-[11px] font-extrabold uppercase tracking-widest text-[var(--color-accent)]'>
              Books & Reading
            </span>

            <h1 className='font-heading text-3xl sm:text-5xl lg:text-6xl font-black text-[var(--color-text)] tracking-tight leading-tight'>
              Learn Beyond <br />
              the Classroom
            </h1>

            <p className='text-xs sm:text-sm text-[var(--color-text-body)] leading-relaxed max-w-lg'>
              Discover our curated collection of books, designed to complement your language journey. Read, learn, grow.
            </p>
          </div>

          {/* Right Hero Visual: Stack of Books Artwork */}
          <div className='lg:col-span-5 relative flex flex-col items-center lg:items-end justify-center'>
            {/* Handwritten note */}
            <div className='font-handwritten text-xl sm:text-2xl text-[var(--color-accent)] mb-2 rotate-[-4deg] select-none text-center lg:text-right w-full pr-4'>
              Small books <br />
              Big dreams ♡
            </div>

            <div className='relative w-full max-w-sm rounded-3xl overflow-hidden shadow-xl border border-white/50 dark:border-white/10 aspect-[16/10] bg-[var(--color-panel)]'>
              <img
                src={CtaGlobeBooks}
                alt='Books collection with globe'
                className='w-full h-full object-cover'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent' />
              <div className='absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs font-bold'>
                <span>Curated Editions</span>
                <span className='px-2.5 py-0.5 rounded-full bg-white/30 backdrop-blur-sm text-[10px] uppercase tracking-wider'>
                  Authentic
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. HOW IT WORKS STRIP ──────────────────────────────────── */}
      <section className='rounded-3xl border border-[var(--color-border)] bg-white dark:bg-[#3D2020] p-6 sm:p-8 shadow-sm transition-colors'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 items-center'>
          {/* Header on left */}
          <div className='lg:col-span-4 space-y-1 text-left'>
            <span className='text-[10.5px] font-extrabold uppercase tracking-widest text-[var(--color-accent)]'>
              How It Works
            </span>
            <h2 className='font-heading text-xl sm:text-2xl font-bold text-[var(--color-text)]'>
              Simple steps to get your book
            </h2>
          </div>

          {/* 3 Horizontal Steps on right */}
          <div className='lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-5 items-center'>
            {STEPS.map((step, idx) => {
              const Icon = step.icon
              return (
                <div key={step.n} className='relative flex items-start gap-3'>
                  {/* Step Number Circle */}
                  <div
                    className='w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm'
                    style={{
                      background: step.accent ? '#E8F8F2' : 'var(--color-primary-soft)',
                      color: step.accent ? '#1D9E75' : 'var(--color-primary)',
                      border: `1px solid ${step.accent ? 'rgba(29,158,117,0.3)' : 'rgba(78,0,0,0.1)'}`,
                    }}
                  >
                    {step.n}
                  </div>

                  {/* Step Content */}
                  <div className='space-y-0.5 flex-1'>
                    <div className='flex items-center gap-1.5'>
                      <Icon style={{ width: 14, height: 14, color: step.accent ? '#1D9E75' : 'var(--color-primary)' }} />
                      <h3 className='text-xs font-bold text-[var(--color-text)]'>
                        {step.label}
                      </h3>
                    </div>
                    <p className='text-[11px] text-[var(--color-text-muted)] leading-relaxed'>
                      {step.desc}
                    </p>
                  </div>

                  {/* Arrow separator (for steps 1 & 2) */}
                  {idx < 2 && (
                    <div className='hidden sm:block text-[var(--color-text-faint)] font-bold text-sm self-center ml-1'>
                      →
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── 3. MAIN SECTION: 2 COLUMNS (BOOKS GRID + SIDEBAR) ────── */}
      <section className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'>
        {/* ── Left Column: FEATURED BOOKS GRID (approx 68% width) ── */}
        <div className='lg:col-span-8 space-y-6'>
          {/* Header Row with Title & Filter */}
          <div className='flex flex-wrap items-end justify-between gap-4'>
            <div>
              <span className='text-[10.5px] font-extrabold uppercase tracking-widest text-[var(--color-accent)]'>
                Our Collection
              </span>
              <h2 className='font-heading text-2xl sm:text-3xl font-extrabold text-[var(--color-text)] mt-0.5'>
                Featured Books
              </h2>
              <p className='text-xs text-[var(--color-text-muted)] mt-0.5'>
                Choose from a selection of language books, carefully picked for your level.
              </p>
            </div>

            {/* Language Filter Dropdown */}
            <div className='relative inline-block'>
              <div className='flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#3D2020] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-body)] shadow-sm'>
                <Globe style={{ width: 14, height: 14, color: 'var(--color-text-muted)' }} />
                <select
                  value={selectedLanguage}
                  onChange={e => setSelectedLanguage(e.target.value)}
                  className='bg-transparent border-none outline-none text-xs font-bold text-[var(--color-text)] cursor-pointer pr-1'
                >
                  <option value='all'>All languages</option>
                  <option value='French'>French</option>
                  <option value='Italian'>Italian</option>
                  <option value='English'>English</option>
                  <option value='Korean'>Korean</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2x2 Grid of Featured Books */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
            {filteredBooks.map(book => {
              return (
                <div
                  key={book.id}
                  className='group flex flex-col justify-between bg-white dark:bg-[#3D2020] rounded-3xl border border-[var(--color-border)] p-5 transition-all duration-300 shadow-sm hover:shadow-md hover:border-[var(--color-accent)]'
                >
                  <div>
                    {/* Top Row: 3D Book Cover on Left + Details on Right */}
                    <div className='flex gap-4 items-start mb-4'>
                      {/* 3D Book Cover */}
                      <div className='relative w-28 h-36 sm:w-32 sm:h-40 rounded-2xl overflow-hidden shadow-md shrink-0 border border-black/10 bg-[var(--color-panel)] group-hover:scale-[1.02] transition-transform duration-300'>
                        <img
                          src={book.landmark || ParisLandmark}
                          alt={book.title}
                          className='w-full h-full object-cover'
                        />
                        <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent' />

                        {/* Spine highlight line */}
                        <div className='absolute left-0 top-0 bottom-0 w-1.5 bg-white/30 backdrop-blur-sm' />

                        {/* Country Flag Badge Pill (Bottom-Left) */}
                        <div className='absolute bottom-2 left-2 w-6 h-6 rounded-full overflow-hidden ring-2 ring-white shadow-md'>
                          <img src={book.flag || FrenchFlag} alt={book.language} className='w-full h-full object-cover' />
                        </div>
                      </div>

                      {/* Right Details */}
                      <div className='flex-1 min-w-0 space-y-1.5'>
                        {/* Language Badge */}
                        <span className='inline-block text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] dark:text-[var(--color-accent)]'>
                          {book.language || 'French'}
                        </span>

                        {/* Title */}
                        <h3 className='font-heading text-base font-bold text-[var(--color-text)] leading-snug group-hover:text-[var(--color-primary)] dark:group-hover:text-[var(--color-accent)] transition-colors line-clamp-2'>
                          {book.title}
                        </h3>

                        {/* Description */}
                        <p className='text-[11px] text-[var(--color-text-body)] line-clamp-2 leading-relaxed'>
                          {book.description}
                        </p>

                        {/* Info Pills */}
                        <div className='space-y-1 pt-1 text-[10.5px] text-[var(--color-text-muted)] font-medium'>
                          <div className='flex items-center gap-1.5'>
                            <Persons style={{ width: 12, height: 12, color: 'var(--color-primary)' }} />
                            <span>{book.level || 'Beginner – A1'}</span>
                          </div>
                          <div className='flex items-center gap-1.5'>
                            <FileText style={{ width: 12, height: 12, color: 'var(--color-primary)' }} />
                            <span>{book.pages || '120 pages'}</span>
                          </div>
                          <div className='flex items-center gap-1.5'>
                            <BookOpen style={{ width: 12, height: 12, color: 'var(--color-primary)' }} />
                            <span>{book.type || 'Curated Reading'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Price & CTA */}
                  <div className='flex items-center justify-between pt-3 border-t border-[var(--color-border)]/60 mt-1'>
                    <div className='font-bold text-base text-[var(--color-text)]'>
                      {formatDinars(book.price || 4999)}
                    </div>
                    <Button
                      as={Link}
                      to={`/books/${book.id}`}
                      size='sm'
                    >
                      View details →
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Right Column: SIDEBAR PROMOS (approx 32% width) ────── */}
        <div className='lg:col-span-4 space-y-6'>
          {/* Card 1: Your Next Chapter */}
          <div className='bg-[var(--color-lavender-tint)] rounded-3xl p-6 sm:p-7 border border-[var(--color-border)] space-y-5 shadow-sm'>
            <div className='space-y-1.5'>
              <span className='text-[10px] font-extrabold uppercase tracking-widest text-[var(--color-accent)]'>
                Your Next Chapter
              </span>
              <h3 className='font-heading text-xl font-bold text-[var(--color-text)] leading-snug'>
                More languages, <br />
                more opportunities
              </h3>
              <p className='text-xs text-[var(--color-text-body)] leading-relaxed'>
                Invest in your future with quality learning materials.
              </p>
            </div>

            {/* Visual Book Stack Graphic */}
            <div className='relative h-36 rounded-2xl overflow-hidden shadow-inner border border-white/40 bg-white dark:bg-[#3D2020] p-3 flex flex-col justify-center gap-1.5'>
              <div className='h-6 rounded-lg bg-[#4E0000] text-white text-[11px] font-bold flex items-center px-3 justify-between shadow-sm'>
                <span>Français</span>
                <span className='text-[9px] opacity-70'>Vol. 1</span>
              </div>
              <div className='h-6 rounded-lg bg-[#1D9E75] text-white text-[11px] font-bold flex items-center px-3 justify-between shadow-sm'>
                <span>Italiano</span>
                <span className='text-[9px] opacity-70'>Vol. 2</span>
              </div>
              <div className='h-6 rounded-lg bg-[#D4537E] text-white text-[11px] font-bold flex items-center px-3 justify-between shadow-sm'>
                <span>Español</span>
                <span className='text-[9px] opacity-70'>Vol. 3</span>
              </div>
              <div className='h-6 rounded-lg bg-[#378ADD] text-white text-[11px] font-bold flex items-center px-3 justify-between shadow-sm'>
                <span>English</span>
                <span className='text-[9px] opacity-70'>Vol. 4</span>
              </div>
            </div>

            <Button
              as={Link}
              to='/books'
              fullWidth
              size='md'
            >
              📖 Explore all books →
            </Button>
          </div>

          {/* Card 2: Need Help? */}
          <div className='bg-white dark:bg-[#3D2020] rounded-3xl p-6 border border-[var(--color-border)] shadow-sm space-y-4'>
            <div className='flex items-center gap-2'>
              <div className='w-8 h-8 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center shrink-0'>
                <Headphones style={{ width: 16, height: 16 }} />
              </div>
              <h4 className='text-sm font-bold text-[var(--color-text)]'>
                Need help?
              </h4>
            </div>

            <p className='text-xs text-[var(--color-text-muted)] leading-relaxed'>
              Have questions about our books or the payment process? Our team is here to assist.
            </p>

            <Button
              as='a'
              href='/#why-choose'
              variant='outline'
              fullWidth
              size='sm'
            >
              Contact support →
            </Button>

            {/* Handwritten decorative watermark */}
            <div className='font-handwritten text-xl text-[var(--color-accent)]/80 text-center pt-2 select-none'>
              Better Together ♡
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Books