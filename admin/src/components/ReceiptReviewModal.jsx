import { useState } from 'react'
import { Receipt, Check, Ban, TriangleExclamation } from '@gravity-ui/icons'
import AdminModal from './AdminModal'
import StatusBadge from './StatusBadge'
import { Button, Textarea, Field } from './ui'
import { money, formatDateTime } from '../lib/format'

// ─────────────────────────────────────────────────────────────────────────────
// Reviews a payment receipt for a course application or a book order.
//
//   record: { status, admin_note, ... } — the application / order row
//   receipt: the related payment_receipts / book_payment_receipts row
//   kind:   'application' | 'book'
//   meta:   { studentName, email, title }
// ─────────────────────────────────────────────────────────────────────────────
const ReceiptReviewModal = ({ open, onClose, record, receipt, kind = 'application', meta = {}, onApprove, onDeny, saving }) => {
  const [note, setNote] = useState(record?.admin_note || '')

  if (!record) return null
  const decided = record.status === 'approved' || record.status === 'denied'
  // Course receipts store the public URL in `receipt_image`; book receipts use
  // `receipt_file_url`. Support both.
  const fileUrl = receipt?.receipt_image || receipt?.receipt_file_url || null
  const uploadedAt = receipt?.uploaded_at || record.created_at

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      size="lg"
      title="Review payment receipt"
      subtitle={kind === 'book' ? 'Book order' : 'Course application'}
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Receipt preview */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
          <div className="flex aspect-[4/5] items-center justify-center overflow-hidden rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]">
            {fileUrl ? (
              /\.(png|jpe?g|webp|gif|heic)(\?|$)/i.test(fileUrl) || kind === 'application' ? (
                <a href={fileUrl} target="_blank" rel="noreferrer" className="block h-full w-full">
                  <img src={fileUrl} alt="Receipt" className="h-full w-full object-contain" />
                </a>
              ) : (
                <a href={fileUrl} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-2 text-[var(--color-accent)]">
                  <Receipt style={{ width: 40, height: 40 }} />
                  <span className="text-sm font-semibold">Open receipt file</span>
                </a>
              )
            ) : (
              <div className="flex flex-col items-center gap-2 text-[var(--color-text-muted)]">
                <TriangleExclamation style={{ width: 32, height: 32 }} />
                <span className="text-sm font-semibold">No receipt uploaded</span>
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3">
          <Row label="Student" value={meta.studentName} />
          <Row label="Email" value={meta.email} />
          <Row label={kind === 'book' ? 'Book' : 'Course'} value={meta.title} />
          <Row label="Amount" value={receipt ? money(receipt.amount) : '—'} />
          <Row label="Uploaded" value={formatDateTime(uploadedAt)} />
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--color-text-muted)]">Status</span>
            <StatusBadge status={record.status} />
          </div>

          {receipt?.user_note && (
            <div className="rounded-xl bg-[var(--color-panel)] p-3 text-sm text-[var(--color-text-body)]">
              <span className="font-semibold">Student note: </span>{receipt.user_note}
            </div>
          )}

          {record.status === 'approved' && (
            <p className="flex items-start gap-2 rounded-xl border border-[var(--color-green)] bg-[var(--color-green-faint)] px-3 py-2 text-sm text-[var(--color-green-dark)]">
              <Check style={{ width: 16, height: 16, marginTop: 2 }} />
              {kind === 'book' ? 'Purchase approved — book access granted.' : 'Approved — an enrollment was created for this student.'}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5">
        <Field label="Admin note" hint="Saved with your decision and shown to the student.">
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note…" />
        </Field>
      </div>

      {!decided && (
        <div className="mt-5 flex flex-col gap-3 border-t border-[var(--color-border)] pt-5 sm:flex-row sm:justify-end">
          <Button variant="danger" icon={Ban} disabled={saving} onClick={() => onDeny(note)}>Deny</Button>
          <Button variant="green" icon={Check} disabled={saving} onClick={() => onApprove(note)}>
            {kind === 'book' ? 'Approve purchase' : 'Approve & enroll'}
          </Button>
        </div>
      )}
    </AdminModal>
  )
}

const Row = ({ label, value }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-sm text-[var(--color-text-muted)]">{label}</span>
    <span className="text-sm font-semibold text-[var(--color-text)]">{value || '—'}</span>
  </div>
)

export default ReceiptReviewModal
