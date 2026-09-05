import { Link } from 'react-router-dom'
import { BookOpen, CreditCard, Paperclip, CircleCheck, ArrowRight } from '@gravity-ui/icons'
import { useQuery } from '../hooks/useQuery'
import { fetchBooks } from '../services/db'
import { formatDinars } from '../data/siteData'

const STEPS = [
  { n: '1', icon: CreditCard, label: 'Pay for your book', desc: 'Choose a title and complete payment through your preferred method.' },
  { n: '2', icon: Paperclip, label: 'Upload your receipt', desc: 'Attach proof of payment on the book page so we can verify it.' },
  { n: '3', icon: CircleCheck, label: 'Get instant access', desc: 'Once an admin approves it, the download unlocks automatically.', accent: true },
]

const Books = () => {
  const { data: books, isLoading } = useQuery(fetchBooks, [], [])

  return (
    <main className='max-w-6xl mx-auto px-4 py-12'>
      {/* ── HEADER ───────────────── */}
      <div className='text-center md:text-left mb-10'>
        <p style={{ color: 'var(--color-accent)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
          Books
        </p>
        <h1 style={{ color: 'var(--color-primary)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, lineHeight: 1.2, marginTop: '0.5rem', marginBottom: '0.75rem' }}>
          Learning material worth keeping on the shelf
        </h1>
        <p style={{ color: 'var(--color-text-body)', fontWeight: 500, maxWidth: '36rem' }}>
          Every book is paired to a course track. Buy, upload your receipt, and read as soon as it's approved.
        </p>
      </div>

      {/* ___ DIVIDER ____ */}
      <div className='w-1/3 h-1 mx-auto md:mx-0 my-6 rounded-full' style={{ backgroundColor: 'var(--color-primary)' }} />

      {/* ── HOW IT WORKS ───────────────── */}
      <div className='mb-14'>
        <p style={{ textAlign: 'center', color: 'var(--color-primary)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '2rem' }}>
          How it works
        </p>

        <div className='grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto'>
          {STEPS.map(step => {
            const Icon = step.icon
            const tint = step.accent ? 'var(--color-green)' : 'var(--color-primary)'
            return (
              <div
                key={step.n}
                className='relative flex flex-col items-center text-center gap-3 px-6 py-6 rounded-3xl border transition-all duration-300'
                style={{
                  borderColor: 'var(--color-border)',
                  background: 'var(--color-surface)',
                  boxShadow: '0 4px 12px rgba(0,0,0,.04)',
                }}
              >
                <span
                  className='absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold'
                  style={{ background: tint, color: 'var(--color-surface)' }}
                >
                  {step.n}
                </span>

                <Icon style={{ width: 24, height: 24, color: tint }} />

                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                  {step.label}
                </span>
                <p style={{ color: 'var(--color-text-body)', fontWeight: 500, fontSize: '0.8125rem', lineHeight: 1.6 }}>
                  {step.desc}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── LOADING STATE ───────────────── */}
      {isLoading && books.length === 0 && (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className='rounded-3xl border overflow-hidden'
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
            >
              <div className='h-44 motion-safe:animate-pulse' style={{ background: 'var(--color-bg)' }} />
              <div className='p-6 space-y-3'>
                <div className='h-3 w-1/3 rounded motion-safe:animate-pulse' style={{ background: 'var(--color-bg)' }} />
                <div className='h-4 w-2/3 rounded motion-safe:animate-pulse' style={{ background: 'var(--color-bg)' }} />
                <div className='h-3 w-full rounded motion-safe:animate-pulse' style={{ background: 'var(--color-bg)' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── EMPTY STATE ───────────────── */}
      {!isLoading && books.length === 0 && (
        <div
          className='rounded-3xl border border-dashed px-6 py-16 text-center'
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
        >
          <BookOpen style={{ width: 40, height: 40, color: 'var(--color-accent)' }} className='mx-auto mb-4' />
          <p style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.875rem' }}>No books available yet</p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
            Check back soon — new titles are added regularly.
          </p>
        </div>
      )}

      {/* ── BOOK GRID ───────────────── */}
      {books.length > 0 && (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {books.map(book => (
            <Link
              key={book.id}
              to={`/books/${book.id}`}
              className='group relative flex flex-col rounded-3xl border overflow-hidden transition-all duration-300'
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)', boxShadow: '0 4px 12px rgba(0,0,0,.04)' }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 10px 28px var(--color-border)'
                e.currentTarget.style.transform = 'translateY(-4px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,.04)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              {/* spine — dynamic per book cover color */}
              <span className='absolute left-0 top-0 bottom-0 w-[5px] z-10' style={{ background: book.coverColor }} aria-hidden='true' />

              {/* cover */}
              <div className='relative h-44 flex items-center justify-center pl-[5px]' style={{ background: `${book.coverColor}18` }}>
                {book.coverUrl ? (
                  <img src={book.coverUrl} alt={book.title} className='h-full w-full object-cover' />
                ) : (
                  <BookOpen style={{ width: 48, height: 48, color: book.coverColor }} />
                )}

                {/* bookmark ribbon — language tag */}
                <div
                  className='absolute top-0 right-6 px-3 pt-2 pb-3 text-xs font-semibold uppercase'
                  style={{
                    background: book.coverColor,
                    color: 'var(--color-surface)',
                    letterSpacing: '0.05em',
                    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 78%, 0 100%)',
                  }}
                >
                  {book.language}
                </div>
              </div>

              {/* content */}
              <div className='flex-1 flex flex-col pl-[5px] p-6'>
                <h2 style={{ color: 'var(--color-primary)', fontSize: '1.125rem', fontWeight: 700, lineHeight: 1.4 }}>
                  {book.title}
                </h2>
                <p className='line-clamp-3' style={{ color: 'var(--color-text-body)', fontWeight: 500, fontSize: '0.875rem', marginTop: '0.5rem', lineHeight: 1.7 }}>
                  {book.description}
                </p>

                <div className='flex items-center justify-between mt-5 pt-4 border-t' style={{ borderColor: 'var(--color-border)' }}>
                  <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{formatDinars(book.price)}</span>
                  <span
                    className='inline-flex items-center gap-1.5 rounded-full px-4 py-2 transition-colors'
                    style={{ background: 'var(--color-primary)', color: 'var(--color-surface)', fontSize: '0.8125rem', fontWeight: 600 }}
                  >
                    View
                    <ArrowRight style={{ width: 12, height: 12 }} className='transition-transform duration-300 group-hover:translate-x-0.5' />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}

export default Books