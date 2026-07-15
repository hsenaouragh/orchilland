import { useState } from 'react'
import { Plus, Pencil, TrashBin, Receipt } from '@gravity-ui/icons'
import { useAdminData } from '../hooks/AdminDataContext'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import AdminModal from '../components/AdminModal'
import ReceiptReviewModal from '../components/ReceiptReviewModal'
import OfferForm from '../components/OfferForm'
import { PageHeader, Button, IconButton, Panel, EmptyNote } from '../components/ui'
import { money } from '../lib/format'

const Offers = () => {
  const data = useAdminData()
  const [editing, setEditing] = useState(null)   // offer row or 'new'
  const [confirm, setConfirm] = useState(null)    // offer pending delete
  const [review, setReview] = useState(null)      // claim being reviewed
  const [saving, setSaving] = useState(false)

  const save = async (payload) => {
    setSaving(true)
    try {
      if (editing === 'new') {
        await data.createRow('offers', { ...payload, created_by: data.adminId, updated_at: new Date().toISOString() })
      } else {
        await data.updateRow('offers', editing.id, { ...payload, updated_at: new Date().toISOString() })
      }
      setEditing(null)
    } finally { setSaving(false) }
  }

  const remove = async () => {
    setSaving(true)
    try { await data.removeRow('offers', confirm.id); setConfirm(null) }
    finally { setSaving(false) }
  }

  const decide = async (status) => {
    setSaving(true)
    try { await data.decideOfferClaim(review, status); setReview(null) }
    finally { setSaving(false) }
  }

  const columns = [
    { key: 'title', header: 'Offer', render: (o) => (
      <div>
        <p className="font-semibold text-[var(--color-text)]">{o.title}</p>
        <p className="text-xs text-[var(--color-text-muted)]">{(o.course_ids || []).length} course{(o.course_ids || []).length !== 1 ? 's' : ''}</p>
      </div>
    ) },
    { key: 'category', header: 'Category', render: (o) => <span className="rounded-md bg-[var(--color-panel)] px-2 py-1 text-xs font-semibold uppercase">{o.category}</span> },
    { key: 'original_price', header: 'Original', render: (o) => (Number(o.original_price) ? <span className="text-[var(--color-text-muted)] line-through">{money(o.original_price)}</span> : '—') },
    { key: 'price', header: 'Price', render: (o) => <span className="font-semibold">{money(o.price)}</span> },
    { key: 'status', header: 'Status', render: (o) => <StatusBadge status={o.status} /> },
    { key: 'actions', header: 'Actions', align: 'right', render: (o) => (
      <div className="flex items-center justify-end gap-1.5">
        <IconButton icon={Pencil} label="Edit" onClick={() => setEditing(o)} />
        <IconButton icon={TrashBin} tone="danger" label="Delete" onClick={() => setConfirm(o)} />
      </div>
    ) },
  ]

  const pending = data.offerClaims.filter((c) => c.status === 'pending')

  return (
    <div>
      <PageHeader
        title="Offers"
        subtitle="Bundle courses at a discount and review student claims."
        actions={<Button icon={Plus} onClick={() => setEditing('new')}>New offer</Button>}
      />

      <DataTable
        columns={columns}
        rows={data.offers}
        searchKeys={['title', 'category']}
        searchPlaceholder="Search offers…"
        empty="No offers yet. Create your first bundle."
      />

      <div className="mt-8">
        <Panel title={`Pending claims${pending.length ? ` (${pending.length})` : ''}`}>
          {pending.length === 0 ? (
            <EmptyNote>No pending offer claims.</EmptyNote>
          ) : (
            <div className="space-y-2">
              {pending.map((claim) => {
                const offer = data.offerById(claim.offer_id)
                const student = data.userById(claim.student_id)
                return (
                  <div key={claim.id} className="flex flex-col gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-[var(--color-text)]">{offer?.title || 'Offer'}</p>
                      <p className="text-sm text-[var(--color-text-muted)]">
                        {student?.name || student?.email || 'Student'} · {money(claim.amount)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={claim.status} />
                      <Button size="sm" variant="outline" icon={Receipt} onClick={() => setReview(claim)}>Review</Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Panel>
      </div>

      {/* Create / edit offer */}
      <AdminModal
        open={!!editing}
        onClose={() => setEditing(null)}
        size="lg"
        title={editing === 'new' ? 'New offer' : 'Edit offer'}
        subtitle={editing && editing !== 'new' ? editing.title : 'Bundle courses at a discount.'}
      >
        <OfferForm
          initial={editing === 'new' ? null : editing}
          onCancel={() => setEditing(null)}
          onSubmit={save}
          saving={saving}
        />
      </AdminModal>

      {/* Delete confirm */}
      <AdminModal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        size="sm"
        title="Delete offer?"
        subtitle={confirm?.title}
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirm(null)}>Cancel</Button>
            <Button variant="danger" onClick={remove} disabled={saving}>{saving ? 'Deleting…' : 'Delete'}</Button>
          </>
        }
      >
        <p className="text-sm text-[var(--color-text-muted)]">This removes the offer. Existing claims are kept.</p>
      </AdminModal>

      {/* Review a claim's receipt */}
      {review && (
        <ReceiptReviewModal
          open={!!review}
          onClose={() => setReview(null)}
          record={review}
          receipt={review}
          kind="offer"
          meta={{
            studentName: data.userById(review.student_id)?.name,
            email: data.userById(review.student_id)?.email,
            title: data.offerById(review.offer_id)?.title,
          }}
          onApprove={() => decide('approved')}
          onDeny={() => decide('denied')}
          saving={saving}
        />
      )}
    </div>
  )
}

export default Offers
