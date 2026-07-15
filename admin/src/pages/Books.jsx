import { useState } from 'react'
import { Plus, Pencil, TrashBin, ToggleOn, ToggleOff, Eye } from '@gravity-ui/icons'
import { useAdminData } from '../hooks/AdminDataContext'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import AdminModal from '../components/AdminModal'
import ReceiptReviewModal from '../components/ReceiptReviewModal'
import FileUpload from '../components/FileUpload'
import { PageHeader, Button, IconButton, Field, Input, Textarea, Select } from '../components/ui'
import { money } from '../lib/format'

const BookForm = ({ initial, onCancel, onSubmit, saving }) => {
  const [form, setForm] = useState({
    title: initial?.title || '',
    price: initial?.price ?? '',
    description: initial?.description || '',
    cover_url: initial?.cover_url || '',
    file_url: initial?.file_url || '',
    status: initial?.status || 'available',
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const submit = (e) => { e.preventDefault(); onSubmit({ ...form, price: Number(form.price) || 0 }) }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Title"><Input value={form.title} onChange={set('title')} placeholder="Book title" required /></Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Price (DA)"><Input type="number" min="0" value={form.price} onChange={set('price')} placeholder="0" /></Field>
        <Field label="Availability">
          <Select value={form.status} onChange={set('status')}>
            <option value="available">Available</option>
            <option value="not_available">Not available</option>
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FileUpload label="Cover image" image folder="books" bucket="COVER" value={form.cover_url} onChange={(url) => setForm((f) => ({ ...f, cover_url: url || '' }))} />
        <FileUpload label="Book file (PDF)" folder="books" bucket="PDF" accept="application/pdf" value={form.file_url} onChange={(url) => setForm((f) => ({ ...f, file_url: url || '' }))} hint="PDF uploaded from your computer." />
      </div>
      <Field label="Description"><Textarea value={form.description} onChange={set('description')} placeholder="Short description…" /></Field>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : initial ? 'Save book' : 'Create book'}</Button>
      </div>
    </form>
  )
}

const Books = () => {
  const data = useAdminData()
  const [tab, setTab] = useState('catalog')
  const [editing, setEditing] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [review, setReview] = useState(null)
  const [saving, setSaving] = useState(false)

  const saveBook = async (payload) => {
    setSaving(true)
    try {
      if (editing === 'new') await data.createRow('books', { ...payload, created_by: data.adminId })
      else await data.updateRow('books', editing.id, payload)
      setEditing(null)
    } finally { setSaving(false) }
  }

  const toggleAvailability = (b) =>
    data.updateRow('books', b.id, { status: b.status === 'available' ? 'not_available' : 'available' })

  const remove = async () => {
    setSaving(true)
    try { await data.removeRow('books', confirm.id); setConfirm(null) } finally { setSaving(false) }
  }

  const decide = async (status, note) => {
    setSaving(true)
    try { await data.decideBookOrder(review, status, note); setReview(null) } finally { setSaving(false) }
  }

  // ── Catalog table ──
  const bookColumns = [
    { key: 'title', header: 'Book', render: (b) => (
      <div className="flex items-center gap-3">
        <span className="h-10 w-8 shrink-0 rounded bg-cover bg-center" style={{ backgroundImage: b.cover_url ? `url(${b.cover_url})` : undefined, background: b.cover_url ? undefined : 'var(--color-accent)' }} />
        <p className="font-semibold text-[var(--color-text)]">{b.title}</p>
      </div>
    ) },
    { key: 'price', header: 'Price', render: (b) => money(b.price) },
    { key: 'status', header: 'Availability', render: (b) => <StatusBadge status={b.status} /> },
    { key: 'actions', header: 'Actions', align: 'right', render: (b) => (
      <div className="flex items-center justify-end gap-1.5">
        <IconButton icon={b.status === 'available' ? ToggleOn : ToggleOff} tone={b.status === 'available' ? 'green' : 'muted'} label="Availability" onClick={() => toggleAvailability(b)} />
        <IconButton icon={Pencil} label="Edit" onClick={() => setEditing(b)} />
        <IconButton icon={TrashBin} tone="danger" label="Delete" onClick={() => setConfirm(b)} />
      </div>
    ) },
  ]

  // ── Orders table ──
  const orderRows = data.book_orders.map((o) => {
    const book = data.bookById(o.book_id)
    const receipt = data.receiptForBookOrder(o.id)
    return {
      ...o,
      _student: data.userById(o.student_id)?.name || 'Student',
      _email: data.userById(o.student_id)?.email || '',
      _book: book?.title || 'Book',
      _amount: book?.price ?? 0,
      _receipt: receipt,
    }
  })

  const orderColumns = [
    { key: 'student', header: 'Student', render: (o) => (
      <div><p className="font-semibold text-[var(--color-text)]">{o._student}</p><p className="text-xs text-[var(--color-text-muted)]">{o._email}</p></div>
    ) },
    { key: 'book', header: 'Book', render: (o) => o._book },
    { key: 'amount', header: 'Amount', render: (o) => money(o._amount) },
    { key: 'receipt', header: 'Receipt', render: (o) => (
      o._receipt?.receipt_file_url ? <a href={o._receipt.receipt_file_url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-[var(--color-accent)] underline">View</a> : <span className="text-xs text-[var(--color-text-faint)]">None</span>
    ) },
    { key: 'status', header: 'Status', render: (o) => <StatusBadge status={o.status} /> },
    { key: 'actions', header: 'Actions', align: 'right', render: (o) => (
      <IconButton icon={Eye} label="Review" onClick={() => setReview(o)} />
    ) },
  ]

  return (
    <div>
      <PageHeader
        title="Books"
        subtitle="Manage book products and approve purchase receipts."
        actions={<Button icon={Plus} onClick={() => setEditing('new')}>New book</Button>}
      />

      <div className="mb-4 inline-flex gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-1">
        {[['catalog', 'Catalog'], ['orders', `Orders & receipts (${data.book_orders.filter((o) => o.status === 'pending_approval').length})`]].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${tab === id ? 'bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm' : 'text-[var(--color-text-muted)]'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'catalog' ? (
        <DataTable columns={bookColumns} rows={data.books} searchKeys={['title']} searchPlaceholder="Search books…" empty="No books yet." />
      ) : (
        <DataTable columns={orderColumns} rows={orderRows} searchKeys={['_student', '_email', '_book']} searchPlaceholder="Search orders…" empty="No book orders yet." />
      )}

      {/* Book create / edit */}
      <AdminModal open={!!editing} onClose={() => setEditing(null)} size="lg" title={editing === 'new' ? 'New book' : 'Edit book'}>
        <BookForm initial={editing === 'new' ? null : editing} onCancel={() => setEditing(null)} onSubmit={saveBook} saving={saving} />
      </AdminModal>

      {/* Order receipt review */}
      <ReceiptReviewModal
        open={!!review}
        onClose={() => setReview(null)}
        record={review}
        receipt={review?._receipt}
        kind="book"
        meta={{ studentName: review?._student, email: review?._email, title: review?._book }}
        onApprove={(note) => decide('approved', note)}
        onDeny={(note) => decide('denied', note)}
        saving={saving}
      />

      {/* Delete */}
      <AdminModal open={!!confirm} onClose={() => setConfirm(null)} size="sm" title="Delete book?" subtitle={confirm?.title}
        footer={<>
          <Button variant="outline" onClick={() => setConfirm(null)}>Cancel</Button>
          <Button variant="danger" onClick={remove} disabled={saving}>{saving ? 'Deleting…' : 'Delete'}</Button>
        </>}>
        <p className="text-sm text-[var(--color-text-muted)]">Existing orders keep their records.</p>
      </AdminModal>
    </div>
  )
}

export default Books
