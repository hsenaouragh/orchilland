import { useState } from 'react'
import { Field, Input, Textarea, Select, Button } from './ui'
import FileUpload from './FileUpload'
import { useAdminData } from '../hooks/AdminDataContext'
import { money } from '../lib/format'

// Create / edit an offer (a bundle of courses at a discounted price).
const CATEGORIES = ['best', 'hot', 'vip']

const OfferForm = ({ initial, onCancel, onSubmit, saving }) => {
  const { courses } = useAdminData()
  const [form, setForm] = useState({
    title: initial?.title || '',
    category: initial?.category || 'best',
    course_ids: initial?.course_ids || [],
    original_price: initial?.original_price ?? '',
    price: initial?.price ?? '',
    description: initial?.description || '',
    status: initial?.status || 'active',
    image_url: initial?.image_url || '',
  })
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const toggleCourse = (id) =>
    setForm((f) => ({
      ...f,
      course_ids: f.course_ids.includes(id) ? f.course_ids.filter((c) => c !== id) : [...f.course_ids, id],
    }))

  const selectedTotal = courses
    .filter((c) => form.course_ids.includes(c.id))
    .reduce((sum, c) => sum + Number(c.price || 0), 0)

  const submit = (e) => {
    e.preventDefault()
    onSubmit({
      ...form,
      course_ids: form.course_ids,
      original_price: Number(form.original_price) || selectedTotal || 0,
      price: Number(form.price) || 0,
    })
  }

  const available = courses.filter((c) => c.status !== 'archived')

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Title">
        <Input value={form.title} onChange={set('title')} placeholder="e.g. Two Languages Bundle" required />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Category">
          <Select value={form.category} onChange={set('category')}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
        </Field>
        <Field label="Status">
          <Select value={form.status} onChange={set('status')}>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
            <option value="expired">Expired</option>
          </Select>
        </Field>
        <Field label="Original price (DA)" hint={selectedTotal ? `Courses total: ${money(selectedTotal)}` : 'Leave blank to use the courses total.'}>
          <Input type="number" min="0" value={form.original_price} onChange={set('original_price')} placeholder={String(selectedTotal || 0)} />
        </Field>
        <Field label="Discounted price (DA)">
          <Input type="number" min="0" value={form.price} onChange={set('price')} placeholder="What the student pays" required />
        </Field>
      </div>

      <Field label="Courses in this offer">
        <div className="max-h-52 space-y-1.5 overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-2">
          {available.length === 0 && <p className="px-2 py-1 text-sm text-[var(--color-text-muted)]">No courses yet.</p>}
          {available.map((c) => (
            <label key={c.id} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-[var(--color-surface)]">
              <input type="checkbox" checked={form.course_ids.includes(c.id)} onChange={() => toggleCourse(c.id)} />
              <span className="flex-1 text-sm text-[var(--color-text)]">{c.title}</span>
              <span className="text-xs text-[var(--color-text-muted)]">{Number(c.price) ? money(c.price) : 'Free'}</span>
            </label>
          ))}
        </div>
      </Field>

      <FileUpload
        label="Offer image"
        image
        folder="offers"
        value={form.image_url}
        onChange={(url) => setForm((f) => ({ ...f, image_url: url || '' }))}
        hint="Optional banner for the offer."
      />

      <Field label="Description">
        <Textarea value={form.description} onChange={set('description')} placeholder="What makes this bundle worth it?" />
      </Field>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : initial ? 'Save changes' : 'Create offer'}</Button>
      </div>
    </form>
  )
}

export default OfferForm
