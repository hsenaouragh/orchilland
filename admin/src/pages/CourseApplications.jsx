import { useState } from 'react'
import { Eye, Check, Ban, Pencil } from '@gravity-ui/icons'
import { useAdminData } from '../hooks/AdminDataContext'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import ReceiptReviewModal from '../components/ReceiptReviewModal'
import AdminModal from '../components/AdminModal'
import { PageHeader, IconButton, Button, Select, Textarea, Field } from '../components/ui'
import { formatDate, money } from '../lib/format'

const FILTERS = ['all', 'pending_payment', 'pending_approval', 'approved', 'denied']

const CourseApplications = () => {
  const data = useAdminData()
  const [filter, setFilter] = useState('all')
  const [review, setReview] = useState(null)   // application under receipt review
  const [noteFor, setNoteFor] = useState(null) // application whose note is edited
  const [noteText, setNoteText] = useState('')
  const [saving, setSaving] = useState(false)
  const [flash, setFlash] = useState('')

  const withMeta = (app) => {
    const student = data.userById(app.student_id)
    const course = data.courseById(app.course_id)
    const receipt = data.receiptForApplication(app.id)
    return {
      ...app,
      _student: student,
      _studentName: student?.name || 'Student',
      _email: student?.email || '',
      _courseTitle: course?.title || 'Course',
      _receipt: receipt,
    }
  }

  const rows = data.course_applications
    .map(withMeta)
    .filter((a) => (filter === 'all' ? true : a.status === filter))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  const approve = async (note) => {
    setSaving(true)
    try {
      await data.approveApplication(review, note)
      setFlash(`Approved — an enrollment was created for ${review._studentName}.`)
      setReview(null)
    } finally { setSaving(false) }
  }

  const deny = async (note) => {
    setSaving(true)
    try {
      await data.denyApplication(review, note)
      setReview(null)
    } finally { setSaving(false) }
  }

  const saveNote = async () => {
    setSaving(true)
    try {
      await data.setApplicationNote(noteFor.id, noteText)
      setNoteFor(null)
    } finally { setSaving(false) }
  }

  const columns = [
    { key: 'student', header: 'Student', render: (r) => (
      <div>
        <p className="font-semibold text-[var(--color-text)]">{r._studentName}</p>
        <p className="text-xs text-[var(--color-text-muted)]">{r._email}</p>
      </div>
    ) },
    { key: 'course', header: 'Course', render: (r) => <span className="text-[var(--color-text-body)]">{r._courseTitle}</span> },
    { key: 'amount', header: 'Amount', render: (r) => (r._receipt ? money(r._receipt.amount) : '—') },
    { key: 'receipt', header: 'Receipt', render: (r) => (
      r._receipt?.receipt_image
        ? <a href={r._receipt.receipt_image} target="_blank" rel="noreferrer" className="text-sm font-semibold text-[var(--color-accent)] underline">View image</a>
        : <span className="text-xs text-[var(--color-text-faint)]">No receipt</span>
    ) },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'submitted', header: 'Submitted', render: (r) => <span className="text-xs text-[var(--color-text-muted)]">{formatDate(r.created_at)}</span> },
    { key: 'actions', header: 'Actions', align: 'right', render: (r) => (
      <div className="flex items-center justify-end gap-1.5">
        <IconButton icon={Eye} label="Review receipt" onClick={() => setReview(r)} />
        {(r.status === 'pending_approval' || r.status === 'pending_payment') && (
          <>
            <IconButton icon={Check} tone="green" label="Approve" onClick={() => setReview(r)} />
            <IconButton icon={Ban} tone="danger" label="Deny" onClick={() => setReview(r)} />
          </>
        )}
        <IconButton icon={Pencil} label="Admin note" onClick={() => { setNoteFor(r); setNoteText(r.admin_note || '') }} />
      </div>
    ) },
  ]

  return (
    <div>
      <PageHeader
        title="Course Applications"
        subtitle="Review payment receipts, then approve to auto-create an enrollment."
      />

      {flash && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-[var(--color-green)] bg-[var(--color-green-faint)] px-4 py-3 text-sm text-[var(--color-green-dark)]">
          <Check style={{ width: 16, height: 16 }} /> {flash}
        </div>
      )}

      <DataTable
        columns={columns}
        rows={rows}
        searchKeys={['_studentName', '_email', '_courseTitle']}
        searchPlaceholder="Search students or courses…"
        empty="No applications match this filter."
        toolbar={
          <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="!w-auto !py-2 text-sm">
            {FILTERS.map((f) => <option key={f} value={f}>{f === 'all' ? 'All statuses' : f.replaceAll('_', ' ')}</option>)}
          </Select>
        }
      />

      <ReceiptReviewModal
        open={!!review}
        onClose={() => setReview(null)}
        record={review}
        receipt={review?._receipt}
        kind="application"
        meta={{ studentName: review?._studentName, email: review?._email, title: review?._courseTitle }}
        onApprove={approve}
        onDeny={deny}
        saving={saving}
      />

      <AdminModal
        open={!!noteFor}
        onClose={() => setNoteFor(null)}
        title="Admin note"
        subtitle={noteFor?._studentName}
        footer={
          <>
            <Button variant="outline" onClick={() => setNoteFor(null)}>Cancel</Button>
            <Button onClick={saveNote} disabled={saving}>{saving ? 'Saving…' : 'Save note'}</Button>
          </>
        }
      >
        <Field label="Note" hint="Visible to the student alongside your decision.">
          <Textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Add context for this application…" />
        </Field>
      </AdminModal>
    </div>
  )
}

export default CourseApplications
