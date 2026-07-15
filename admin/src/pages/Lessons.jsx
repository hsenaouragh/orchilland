import { useState } from 'react'
import { Plus, Pencil, TrashBin, ToggleOn, ToggleOff, Video, Link as LinkIcon } from '@gravity-ui/icons'
import { useAdminData } from '../hooks/AdminDataContext'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import AdminModal from '../components/AdminModal'
import FileUpload from '../components/FileUpload'
import { PageHeader, Button, IconButton, Field, Input, Textarea, Select } from '../components/ui'
import { formatDate } from '../lib/format'

const toInput = (iso) => (iso ? new Date(iso).toISOString().slice(0, 10) : '')

const LessonForm = ({ initial, onCancel, onSubmit, saving }) => {
  const data = useAdminData()
  const [form, setForm] = useState({
    course_id: initial?.course_id || data.courses[0]?.id || '',
    title: initial?.title || '',
    description: initial?.description || '',
    video_url: initial?.video_url || '',
    file_url: initial?.file_url || '',
    release_at: toInput(initial?.release_at),
    is_published: initial?.is_published ?? false,
    assign: 'all',
    enrollment_ids: [],
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  // Students who could receive this lesson = those enrolled in the chosen course.
  const eligible = data.enrollmentsForCourse(form.course_id)
    .map((e) => ({ enrollment: e, student: data.userById(e.student_id) }))

  const toggleEnrollment = (id) => setForm((f) => ({
    ...f,
    enrollment_ids: f.enrollment_ids.includes(id) ? f.enrollment_ids.filter((s) => s !== id) : [...f.enrollment_ids, id],
  }))

  const submit = (e) => {
    e.preventDefault()
    onSubmit({ ...form, release_at: form.release_at ? new Date(form.release_at).toISOString() : null })
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Course">
          <Select value={form.course_id} onChange={set('course_id')} required>
            {data.courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </Select>
        </Field>
        <Field label="Release date">
          <Input type="date" value={form.release_at} onChange={set('release_at')} />
        </Field>
      </div>

      <Field label="Title">
        <Input value={form.title} onChange={set('title')} placeholder="Lesson title" required />
      </Field>
      <Field label="Description">
        <Textarea value={form.description} onChange={set('description')} placeholder="What this lesson covers…" />
      </Field>

      <Field label="Video URL" hint="YouTube/Vimeo or a hosted video link.">
        <Input value={form.video_url} onChange={set('video_url')} placeholder="https://…" />
      </Field>
      <FileUpload
        label="Lesson file"
        folder="lessons"
        value={form.file_url}
        onChange={(url) => setForm((f) => ({ ...f, file_url: url || '' }))}
        hint="Upload slides / PDF / audio from your computer."
      />

      <label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-body)]">
        <input type="checkbox" checked={form.is_published} onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))} />
        Published (visible to students)
      </label>

      <Field label="Assign to">
        <Select value={form.assign} onChange={set('assign')}>
          <option value="all">All enrollments in this course</option>
          <option value="selected">Selected students</option>
        </Select>
      </Field>

      {form.assign === 'selected' && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-3">
          {eligible.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">No students enrolled in this course yet.</p>
          ) : (
            <div className="space-y-1.5">
              {eligible.map(({ enrollment, student }) => (
                <label key={enrollment.id} className="flex items-center gap-2.5 text-sm text-[var(--color-text-body)]">
                  <input
                    type="checkbox"
                    checked={form.enrollment_ids.includes(enrollment.id)}
                    onChange={() => toggleEnrollment(enrollment.id)}
                  />
                  {student?.name || 'Student'} <span className="text-[var(--color-text-faint)]">· {student?.email}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : initial ? 'Save lesson' : 'Create lesson'}</Button>
      </div>
    </form>
  )
}

const Lessons = () => {
  const data = useAdminData()
  const [editing, setEditing] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [courseFilter, setCourseFilter] = useState('all')
  const [saving, setSaving] = useState(false)

  const save = async (payload) => {
    setSaving(true)
    try {
      const { assign, enrollment_ids, ...lesson } = payload
      const position = data.lessons.filter((l) => l.course_id === lesson.course_id).length + 1
      if (editing === 'new') {
        const created = await data.createRow('lessons', { ...lesson, position })
        // lesson_access rows control who can see the lesson (all vs. selected).
        const targets = assign === 'selected'
          ? enrollment_ids
          : data.enrollmentsForCourse(lesson.course_id).map((e) => e.id)
        for (const enrollment_id of targets) {
          await data.createRow('lesson_access', {
            lesson_id: created.id, enrollment_id, status: 'available', released_at: lesson.release_at,
          })
        }
      } else {
        await data.updateRow('lessons', editing.id, lesson)
      }
      setEditing(null)
    } finally { setSaving(false) }
  }

  const togglePublish = (l) => data.updateRow('lessons', l.id, { is_published: !l.is_published })

  const remove = async () => {
    setSaving(true)
    try { await data.removeRow('lessons', confirm.id); setConfirm(null) } finally { setSaving(false) }
  }

  const rows = data.lessons
    .filter((l) => (courseFilter === 'all' ? true : l.course_id === courseFilter))
    .sort((a, b) => (a.position || 0) - (b.position || 0))
    .map((l) => ({ ...l, _course: data.courseById(l.course_id)?.title || 'Course' }))

  const columns = [
    { key: 'title', header: 'Lesson', render: (l) => (
      <div>
        <p className="font-semibold text-[var(--color-text)]">{l.title}</p>
        <p className="text-xs text-[var(--color-text-muted)]">{l._course}</p>
      </div>
    ) },
    { key: 'media', header: 'Media', render: (l) => (
      <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
        {l.video_url && <Video style={{ width: 15, height: 15 }} title="Has video" />}
        {l.file_url && <LinkIcon style={{ width: 15, height: 15 }} title="Has file" />}
        {!l.video_url && !l.file_url && <span className="text-xs text-[var(--color-text-faint)]">—</span>}
      </div>
    ) },
    { key: 'released', header: 'Release', render: (l) => <span className="text-xs text-[var(--color-text-muted)]">{formatDate(l.release_at)}</span> },
    { key: 'status', header: 'Status', render: (l) => <StatusBadge status={l.is_published ? 'published' : 'unpublished'} /> },
    { key: 'actions', header: 'Actions', align: 'right', render: (l) => (
      <div className="flex items-center justify-end gap-1.5">
        <IconButton
          icon={l.is_published ? ToggleOn : ToggleOff}
          tone={l.is_published ? 'green' : 'muted'}
          label={l.is_published ? 'Unpublish' : 'Publish'}
          onClick={() => togglePublish(l)}
        />
        <IconButton icon={Pencil} label="Edit" onClick={() => setEditing(l)} />
        <IconButton icon={TrashBin} tone="danger" label="Delete" onClick={() => setConfirm(l)} />
      </div>
    ) },
  ]

  return (
    <div>
      <PageHeader
        title="Lessons"
        subtitle="Publish lessons and control who can access them."
        actions={<Button icon={Plus} onClick={() => setEditing('new')}>New lesson</Button>}
      />

      <DataTable
        columns={columns}
        rows={rows}
        searchKeys={['title', '_course']}
        searchPlaceholder="Search lessons…"
        empty="No lessons yet."
        toolbar={
          <Select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} className="!w-auto !py-2 text-sm">
            <option value="all">All courses</option>
            {data.courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </Select>
        }
      />

      <AdminModal
        open={!!editing}
        onClose={() => setEditing(null)}
        size="lg"
        title={editing === 'new' ? 'New lesson' : 'Edit lesson'}
      >
        <LessonForm
          initial={editing === 'new' ? null : editing}
          onCancel={() => setEditing(null)}
          onSubmit={save}
          saving={saving}
        />
      </AdminModal>

      <AdminModal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        size="sm"
        title="Delete lesson?"
        subtitle={confirm?.title}
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirm(null)}>Cancel</Button>
            <Button variant="danger" onClick={remove} disabled={saving}>{saving ? 'Deleting…' : 'Delete'}</Button>
          </>
        }
      >
        <p className="text-sm text-[var(--color-text-muted)]">Students will no longer see this lesson.</p>
      </AdminModal>
    </div>
  )
}

export default Lessons
