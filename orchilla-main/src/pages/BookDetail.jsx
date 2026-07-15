import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BookOpen, FileArrowUp, Check } from '@gravity-ui/icons'
import { useAuth } from '../hooks/AuthContext'
import { useQuery } from '../hooks/useQuery'
import { fetchBooks, fetchBookOrders, createBookOrder } from '../services/db'
import { formatDinars } from '../data/siteData'

const BookDetail = () => {
  const { bookId } = useParams()
  const { user, openAuth } = useAuth()
  const { data, setData } = useQuery(async () => {
    const [books, bookOrders] = await Promise.all([fetchBooks(), fetchBookOrders(user)])
    return { books, bookOrders }
  }, [user?.id], { books: [], bookOrders: [] })
  const { books, bookOrders } = data
  const [receiptFile, setReceiptFile] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const book = books.find(item => item.id === bookId)
  // An order that is still pending or already approved blocks a second receipt.
  const existing = useMemo(() => bookOrders.find(order =>
    order.studentId === user?.id && order.bookId === bookId && ['pending_approval', 'pending_payment', 'approved'].includes(order.status)
  ), [bookId, bookOrders, user?.id])
  // Once approved, the student can download the book PDF.
  const approvedOrder = useMemo(() => bookOrders.find(order =>
    order.studentId === user?.id && order.bookId === bookId && order.status === 'approved'
  ), [bookId, bookOrders, user?.id])

  if (!book) {
    return (
      <main className='max-w-3xl mx-auto px-4 py-20 text-center'>
        <h1 className='text-2xl font-bold text-[var(--color-text)]'>Book not found</h1>
        <Link to='/books' className='inline-flex mt-6 rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-white'>Back to books</Link>
      </main>
    )
  }

  const submit = async () => {
    if (!user) { openAuth(); return }
    if (existing) return // already has a pending/approved order — no second receipt
    if (!receiptFile) return
    setError('')
    setSaving(true)
    try {
      // The amount is the book price set by the admin — the student cannot change it.
      const order = await createBookOrder({
        book,
        student: user,
        receiptFile,
        receiptFileName: receiptFile.name,
        amount: book.price,
      })
      // Reflect the new order locally so the form locks immediately.
      if (order) setData(prev => ({ ...prev, bookOrders: [order, ...prev.bookOrders] }))
      setSubmitted(true)
    } catch (err) {
      setError(err.message || 'Could not submit receipt')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className='max-w-4xl mx-auto px-4 py-12'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        <div className='rounded-3xl border border-[var(--color-border)] bg-white dark:bg-slate-900 p-8'>
          <div className='h-64 rounded-2xl overflow-hidden flex items-center justify-center' style={{ background: `${book.coverColor}18` }}>
            {book.coverUrl ? (
              <img src={book.coverUrl} alt={book.title} className='h-full w-full object-cover' />
            ) : (
              <BookOpen style={{ width: 72, height: 72, color: book.coverColor }} />
            )}
          </div>
        </div>
        <div>
          <p className='text-xs uppercase tracking-widest font-semibold' style={{ color: book.coverColor }}>{book.language}</p>
          <h1 className='text-3xl font-bold text-[var(--color-text)] mt-2'>{book.title}</h1>
          <p className='text-[var(--color-text-muted)] mt-4 leading-relaxed'>{book.description}</p>
          <p className='text-2xl font-bold text-[var(--color-text)] mt-6'>{formatDinars(book.price)}</p>

          <div className='rounded-3xl border border-[var(--color-border)] bg-white dark:bg-slate-900 p-6 mt-8'>
            {approvedOrder ? (
              <div className='text-center'>
                <Check style={{ width: 40, height: 40, color: 'var(--color-green)', margin: '0 auto 12px' }} />
                <p className='font-bold text-[var(--color-text)]'>Purchase approved</p>
                <p className='text-sm text-[var(--color-text-muted)] mt-2 mb-4'>Your payment was approved. You can download the book now.</p>
                {book.fileUrl ? (
                  <a
                    href={book.fileUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center justify-center gap-2 w-full rounded-2xl bg-[var(--color-primary)] py-3 text-sm font-bold text-white'
                  >
                    Download PDF
                  </a>
                ) : (
                  <p className='text-sm text-[var(--color-text-muted)]'>No file is attached to this book yet.</p>
                )}
              </div>
            ) : submitted || existing ? (
              <div className='text-center'>
                <Check style={{ width: 40, height: 40, color: 'var(--color-green)', margin: '0 auto 12px' }} />
                <p className='font-bold text-[var(--color-text)]'>Receipt submitted</p>
                <p className='text-sm text-[var(--color-text-muted)] mt-2'>
                  {existing ? `Status: ${existing.status.replaceAll('_', ' ')}.` : ''} Download will appear here after admin approval.
                </p>
              </div>
            ) : (
              <div className='space-y-4'>
                <div className='rounded-2xl bg-[var(--color-panel)] border border-[var(--color-border)] p-4 flex items-center justify-between'>
                  <div>
                    <p className='text-sm text-[var(--color-text-muted)]'>Payment reference</p>
                    <p className='font-bold text-[var(--color-text)]'>BOOK-{book.id}</p>
                  </div>
                  <div className='text-right'>
                    <p className='text-sm text-[var(--color-text-muted)]'>Amount to pay</p>
                    <p className='font-bold text-[var(--color-text)]'>{formatDinars(book.price)}</p>
                  </div>
                </div>
                <div className='relative rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-panel)] p-5 text-center'>
                  <FileArrowUp style={{ width: 24, height: 24, color: book.coverColor, margin: '0 auto 8px' }} />
                  <p className='text-sm font-semibold text-[var(--color-text)]'>{receiptFile ? receiptFile.name : 'Upload receipt image or PDF'}</p>
                  <input type='file' accept='image/*,.pdf' onChange={e => setReceiptFile(e.target.files?.[0] || null)} className='absolute inset-0 opacity-0 cursor-pointer' />
                </div>
                {error && (
                  <p className='rounded-xl border border-[var(--color-danger)] bg-[var(--color-danger-faint)] px-4 py-3 text-sm text-[var(--color-danger)]'>
                    {error}
                  </p>
                )}
                <button onClick={submit} disabled={saving} className='w-full rounded-2xl bg-[var(--color-primary)] py-3 text-sm font-bold text-white disabled:opacity-50'>
                  {saving ? 'Submitting...' : 'Submit receipt'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

export default BookDetail
