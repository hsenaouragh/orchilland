import { useState } from 'react'
import { Field, Input, Textarea, Select, Button } from './ui'
import FileUpload from './FileUpload'
import { useAdminData } from '../hooks/AdminDataContext'

// Create / edit a course. Maps 1:1 to the `courses` table.
const COURSE_TYPES = ['group', 'vip', 'conversation', 'practice']
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

const CourseForm = ({ initial, onCancel, onSubmit, saving }) => {
  const { languages } = useAdminData()
  const [form, setForm] = useState({
    title: initial?.title || '',
    language_id: initial?.language_id || languages[0]?.id || '',
    type: initial?.type || 'group',
    level: initial?.level || 'A1',
    duration_weeks: initial?.duration_weeks ?? '',
    price: initial?.price ?? '',
    description: initial?.description || '',
    status: initial?.status || 'available',
    image_url: initial?.image_url || '',
  })
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    onSubmit({
      ...form,
      price: Number(form.price) || 0,
      duration_weeks: Number(form.duration_weeks) || null,
    })
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Title">
        <Input value={form.title} onChange={set('title')} placeholder="e.g. French Intensive B1" required />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Language">
          <Select value={form.language_id} onChange={set('language_id')} required>
            {languages.length === 0 && <option value="">No languages yet</option>}
            {languages.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </Select>
        </Field>
        <Field label="Type">
          <Select value={form.type} onChange={set('type')}>
            {COURSE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
        </Field>
        <Field label="Level">
          <Select value={form.level} onChange={set('level')}>
            {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </Select>
        </Field>
        <Field label="Duration (weeks)">
          <Input type="number" min="0" value={form.duration_weeks} onChange={set('duration_weeks')} placeholder="e.g. 8" />
        </Field>
        <Field label="Price (DA)">
          <Input type="number" min="0" value={form.price} onChange={set('price')} placeholder="0 for free" />
        </Field>
        <Field label="Availability">
          <Select value={form.status} onChange={set('status')}>
            <option value="available">Available</option>
            <option value="not_available">Not available</option>
            <option value="archived">Archived</option>
          </Select>
        </Field>
      </div>

      <FileUpload
        label="Cover image"
        image
        folder="courses"
        value={form.image_url}
        onChange={(url) => setForm((f) => ({ ...f, image_url: url || '' }))}
        hint="Upload straight from your computer."
      />

      <Field label="Description">
        <Textarea value={form.description} onChange={set('description')} placeholder="What will students learn?" />
      </Field>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : initial ? 'Save changes' : 'Create course'}</Button>
      </div>
    </form>
  )
}

export default CourseForm
