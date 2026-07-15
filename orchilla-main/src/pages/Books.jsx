import { Link } from 'react-router-dom'
import { BookOpen } from '@gravity-ui/icons'
import { useQuery } from '../hooks/useQuery'
import { fetchBooks } from '../services/db'
import { formatDinars } from '../data/siteData'

const Books = () => {
  const { data: books } = useQuery(fetchBooks, [], [])

  return (
    <main className='max-w-6xl mx-auto px-4 py-12'>
      <div className='mb-10'>
        <p className='text-xs uppercase tracking-widest font-semibold text-[var(--color-text-body)]'>Books</p>
        <h1 className='text-3xl font-bold text-[var(--color-text)] mt-2'>Buy learning books</h1>
        <p className='text-sm text-[var(--color-text-muted)] mt-2'>Upload a receipt after payment. The admin approves access before download.</p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {books.map(book => (
          <Link key={book.id} to={`/books/${book.id}`} className='group rounded-3xl border border-[var(--color-border)] bg-white dark:bg-slate-900 p-6 transition hover:-translate-y-1'>
            <div className='h-44 rounded-2xl overflow-hidden flex items-center justify-center mb-5' style={{ background: `${book.coverColor}18` }}>
              {book.coverUrl ? (
                <img src={book.coverUrl} alt={book.title} className='h-full w-full object-cover' />
              ) : (
                <BookOpen style={{ width: 54, height: 54, color: book.coverColor }} />
              )}
            </div>
            <p className='text-xs uppercase tracking-widest font-semibold' style={{ color: book.coverColor }}>{book.language}</p>
            <h2 className='text-lg font-bold text-[var(--color-text)] mt-2'>{book.title}</h2>
            <p className='text-sm text-[var(--color-text-muted)] mt-2 leading-relaxed'>{book.description}</p>
            <div className='flex items-center justify-between mt-5'>
              <span className='font-bold text-[var(--color-text)]'>{formatDinars(book.price)}</span>
              <span className='rounded-full bg-[var(--color-primary)] px-4 py-2 text-xs font-bold text-white'>View</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}

export default Books

