import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, FileArrowUp, Xmark } from '@gravity-ui/icons'
import { useAuth } from '../../hooks/AuthContext'
import { claimOffer } from '../../services/db'
import { formatDinars } from '../../data/siteData'

// Claim an offer by uploading a payment receipt (price is fixed by the admin).
const OfferClaimModal = ({ offer, onClose, onClaimed }) => {
  const { user } = useAuth()
  const [receiptFile, setReceiptFile] = useState(null)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    if (!user || !receiptFile) return
    setError('')
    setSaving(true)
    try {
      await claimOffer({ offer, student: user, receiptFile, note })
      setSubmitted(true)
      onClaimed?.()
    } catch (err) {
      setError(err.message || 'Could not submit your claim')
    } finally {
      setSaving(false)
    }
  }

  return createPortal(
    <div
      className='fixed inset-0 z-50 flex items-center justify-center px-3 sm:px-4'
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className='bg-white dark:bg-slate-900 border border-[var(--color-border)] rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto'
        style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.20)' }}
        onClick={e => e.stopPropagation()}
      >
        {submitted ? (
          <div className='p-8 sm:p-10 text-center'>
            <div className='w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4' style={{ background: `${offer.color}18` }}>
              <Check style={{ width: 30, height: 30, color: offer.color }} />
            </div>
            <h3 className='text-xl font-bold text-[var(--color-text)] mb-2'>Claim submitted</h3>
            <p className='text-sm text-[var(--color-text-muted)] leading-relaxed mb-6'>
              Your receipt for <strong>{offer.title}</strong> was sent for admin review. You’ll get access to the bundled courses once it’s approved.
            </p>
            <button onClick={onClose} className='w-full py-3 rounded-2xl text-white font-semibold text-sm' style={{ background: offer.color }}>Done</button>
          </div>
        ) : (
          <>
            <div className='relative px-6 sm:px-8 pt-7 pb-6 border-b border-[var(--color-border)]' style={{ background: `${offer.color}10` }}>
              <button onClick={onClose} className='absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-text-muted)] hover:bg-black/5 dark:hover:bg-white/10 transition-all'>
                <Xmark style={{ width: 14, height: 14 }} />
              </button>
              <p className='text-xs uppercase tracking-widest font-semibold mb-1' style={{ color: offer.color }}>{offer.categoryLabel} · Offer</p>
              <h2 className='text-xl font-bold text-[var(--color-text)]'>{offer.title}</h2>
              <p className='text-sm text-[var(--color-text-muted)] mt-2'>{offer.description}</p>
            </div>

            <div className='px-6 sm:px-8 py-6 space-y-5'>
              <div className='rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5'>
                <p className='text-xs uppercase tracking-widest font-semibold text-[var(--color-text-body)] mb-3'>Payment instructions</p>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm'>
                  <div>
                    <p className='text-[var(--color-text-muted)]'>Amount to pay</p>
                    <p className='font-bold text-[var(--color-text)]'>{formatDinars(offer.price)}</p>
                  </div>
                  <div>
                    <p className='text-[var(--color-text-muted)]'>Reference</p>
                    <p className='font-bold text-[var(--color-text)]'>OFFER-{offer.id.slice(0, 8)}</p>
                  </div>
                  <div className='sm:col-span-2'>
                    <p className='text-[var(--color-text-muted)]'>Includes</p>
                    <p className='font-bold text-[var(--color-text)]'>{offer.courses.map(c => c.title).join(' + ') || 'Bundle courses'}</p>
                  </div>
                </div>
              </div>

              <div>
                <span className='block text-xs font-medium text-[var(--color-text-muted)] mb-1.5'>Payment receipt <span className='text-red-400'>*</span></span>
                <div className='relative rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-panel)] p-5 text-center'>
                  <FileArrowUp style={{ width: 24, height: 24, color: offer.color, margin: '0 auto 8px' }} />
                  <p className='text-sm font-semibold text-[var(--color-text)]'>{receiptFile ? receiptFile.name : 'Upload receipt image or PDF'}</p>
                  <p className='text-xs text-[var(--color-text-muted)] mt-1'>The admin approves it before your access opens.</p>
                  <input type='file' accept='image/*,.pdf' onChange={e => setReceiptFile(e.target.files?.[0] || null)} className='absolute inset-0 opacity-0 cursor-pointer' />
                </div>
              </div>

              <div>
                <span className='block text-xs font-medium text-[var(--color-text-muted)] mb-1.5'>Optional note</span>
                <textarea rows={3} value={note} onChange={e => setNote(e.target.value)} placeholder='Payment reference or anything the admin should know.' className='w-full px-4 py-2.5 rounded-xl border bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] outline-none resize-none' />
              </div>

              {error && <p className='rounded-xl border border-[var(--color-danger)] bg-[var(--color-danger-faint)] px-4 py-3 text-sm text-[var(--color-danger)]'>{error}</p>}
            </div>

            <div className='px-6 sm:px-8 pb-7 flex flex-col sm:flex-row gap-3'>
              <button onClick={onClose} className='flex-1 py-3 rounded-2xl border border-[var(--color-border)] text-[var(--color-text-muted)] text-sm font-semibold'>Cancel</button>
              <button onClick={submit} disabled={!receiptFile || saving} className='flex-1 py-3 rounded-2xl text-white text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed' style={{ background: offer.color }}>
                {saving ? 'Submitting…' : 'Submit claim'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  )
}

export default OfferClaimModal
