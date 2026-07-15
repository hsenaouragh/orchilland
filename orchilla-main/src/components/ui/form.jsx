import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, FileArrowUp, Xmark } from '@gravity-ui/icons'
import { useAuth } from '../../hooks/AuthContext'
import { useQuery } from '../../hooks/useQuery'
import { fetchApplications, createCourseApplication } from '../../services/db'
import { formatDinars } from '../../data/siteData'

const Field = ({ label, children, required }) => (
  <label className='block'>
    <span className='block text-xs font-medium text-[var(--color-text-muted)] mb-1.5'>
      {label}{required && <span className='text-red-400 ml-0.5'>*</span>}
    </span>
    {children}
  </label>
)

const Form = ({ course, onClose }) => {
  const { user } = useAuth()
  const { data: applications } = useQuery(() => fetchApplications(user), [user?.id], [])
  const [note, setNote] = useState('')
  const [receiptFile, setReceiptFile] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const existing = useMemo(() => applications.find(app =>
    app.studentId === user?.id &&
    app.courseId === course.id &&
    ['pending_payment', 'pending_approval', 'approved'].includes(app.status)
  ), [applications, course.id, user?.id])

  // The price is the course price set by the admin — the student cannot change it.
  const requiresReceipt = course.amount > 0
  const canSubmit = !existing && (!requiresReceipt || receiptFile)

  const submit = async () => {
    if (!canSubmit || !user) return
    setError('')
    setSaving(true)
    try {
      await createCourseApplication({
        course,
        student: user,
        receiptFile,
        receiptFileName: receiptFile?.name || null,
        amount: course.amount,
        note,
      })
      setSubmitted(true)
    } catch (err) {
      setError(err.message || 'Could not submit application')
    } finally {
      setSaving(false)
    }
  }

  const modal = (
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
            <div
              className='w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4'
              style={{ background: `${course.color}18` }}
            >
              <Check style={{ width: 30, height: 30, color: course.color }} />
            </div>
            <h3 className='text-xl font-bold text-[var(--color-text)] mb-2'>Application submitted</h3>
            <p className='text-sm text-[var(--color-text-muted)] leading-relaxed mb-6'>
              Your receipt for <strong>{course.title}</strong> was sent for admin review. You will see the course in your dashboard as pending approval.
            </p>
            <button
              onClick={onClose}
              className='w-full py-3 rounded-2xl text-white font-semibold text-sm'
              style={{ background: course.color }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className='relative px-6 sm:px-8 pt-7 pb-6 border-b border-[var(--color-border)]' style={{ background: `${course.color}10` }}>
              <button
                onClick={onClose}
                className='absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-text-muted)] hover:bg-black/5 dark:hover:bg-white/10 transition-all'
              >
                <Xmark style={{ width: 14, height: 14 }} />
              </button>
              <img src={course.flag} alt={course.lang} className='w-14 h-14 object-contain mb-3' />
              <p className='text-xs uppercase tracking-widest font-semibold mb-1' style={{ color: course.color }}>
                Course application
              </p>
              <h2 className='text-xl font-bold text-[var(--color-text)]'>{course.title}</h2>
              <p className='text-sm text-[var(--color-text-muted)] mt-2'>{course.description}</p>
            </div>

            <div className='px-6 sm:px-8 py-6 space-y-5'>
              {existing ? (
                <div className='rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5'>
                  <p className='text-sm font-semibold text-[var(--color-text)] mb-1'>Application already exists</p>
                  <p className='text-sm text-[var(--color-text-muted)]'>
                    Current status: <strong>{existing.status.replaceAll('_', ' ')}</strong>
                  </p>
                </div>
              ) : (
                <>
                  <div className='rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5'>
                    <p className='text-xs uppercase tracking-widest font-semibold text-[var(--color-text-body)] mb-3'>
                      Payment instructions
                    </p>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm'>
                      <div>
                        <p className='text-[var(--color-text-muted)]'>Amount</p>
                        <p className='font-bold text-[var(--color-text)]'>{course.amount ? formatDinars(course.amount) : 'Free application'}</p>
                      </div>
                      <div>
                        <p className='text-[var(--color-text-muted)]'>Reference</p>
                        <p className='font-bold text-[var(--color-text)]'>COURSE-{course.id}</p>
                      </div>
                      <div className='sm:col-span-2'>
                        <p className='text-[var(--color-text-muted)]'>Payment method</p>
                        <p className='font-bold text-[var(--color-text)]'>Bank transfer / CCP / cash receipt upload</p>
                      </div>
                    </div>
                  </div>


                  <Field label='Payment receipt' required={requiresReceipt}>
                    <div className='relative rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-panel)] p-5 text-center'>
                      <FileArrowUp style={{ width: 24, height: 24, color: course.color, margin: '0 auto 8px' }} />
                      <p className='text-sm font-semibold text-[var(--color-text)]'>
                        {receiptFile ? receiptFile.name : requiresReceipt ? 'Upload receipt image or PDF' : 'No receipt required for free courses'}
                      </p>
                      <p className='text-xs text-[var(--color-text-muted)] mt-1'>The admin will approve or deny after checking it.</p>
                      <input
                        type='file'
                        accept='image/*,.pdf'
                        disabled={!requiresReceipt}
                        onChange={e => setReceiptFile(e.target.files?.[0] || null)}
                        className='absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed'
                      />
                    </div>
                  </Field>

                  <Field label='Optional note'>
                    <textarea
                      rows={3}
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      placeholder='Add payment reference or anything the admin should know.'
                      className='w-full px-4 py-2.5 rounded-xl border bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] outline-none resize-none'
                    />
                  </Field>

                  {error && (
                    <p className='rounded-xl border border-[var(--color-danger)] bg-[var(--color-danger-faint)] px-4 py-3 text-sm text-[var(--color-danger)]'>
                      {error}
                    </p>
                  )}
                </>
              )}
            </div>

            <div className='px-6 sm:px-8 pb-7 flex flex-col sm:flex-row gap-3'>
              <button
                onClick={onClose}
                className='flex-1 py-3 rounded-2xl border border-[var(--color-border)] text-[var(--color-text-muted)] text-sm font-semibold'
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={!canSubmit || saving}
                className='flex-1 py-3 rounded-2xl text-white text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed'
                style={{ background: course.color }}
              >
                {saving ? 'Submitting...' : 'Submit for approval'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

export default Form
