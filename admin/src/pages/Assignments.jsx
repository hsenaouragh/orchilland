import { useState } from 'react'
import { Plus, Pencil, TrashBin, FileText, Check } from '@gravity-ui/icons'
import { useAdminData } from '../hooks/AdminDataContext'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import AdminModal from '../components/AdminModal'
import FileUpload from '../components/FileUpload'
import { PageHeader, Button, IconButton, Field, Input, Textarea, Select, EmptyNote } from '../components/ui'
import { formatDate, formatDateTime } from '../lib/format'

const toInput = (iso) => (iso ? new Date(iso).toISOString().slice(0, 10) : '')
const subStatus = (s) => (s.graded_at || s.grade != null ? 'graded' : 'submitted')

const AssignmentForm = ({ initial, onCancel, onSubmit, saving }) => {
  const data = useAdminData()
  const [form, setForm] = useState({
    course_id: initial?.course_id || data.courses[0]?.id || '',
    title: initial?.title || '',
    description: initial?.description || '',
    file_url: initial?.file_url || '',
    due_at: toInput(initial?.due_at),
    is_published: initial?.is_published ?? true,
    target: 'course',
    enrollment_id: '',
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const enrollments = data.enrollmentsForCourse(form.course_id)

  const submit = (e) => {
    e.preventDefault()
    onSubmit({ ...form, due_at: form.due_at ? new Date(form.due_at).toISOString() : null })
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Course">
          <Select value={form.course_id} onChange={set('course_id')} required>
            {data.courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </Select>
        </Field>
        <Field label="Due date">
          <Input type="date" value={form.due_at} onChange={set('due_at')} />
        </Field>
      </div>
      <Field label="Title">
        <Input value={form.title} onChange={set('title')} placeholder="Assignment title" required />
      </Field>
      <Field label="Instructions">
        <Textarea value={form.description} onChange={set('description')} placeholder="What should students do?" />
      </Field>
      <FileUpload
        label="Attached file"
        folder="assignments"
        value={form.file_url}
        onChange={(url) => setForm((f) => ({ ...f, file_url: url || '' }))}
        hint="Upload a brief / worksheet from your computer."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex items-center gap-2 self-end pb-2.5 text-sm font-semibold text-[var(--color-text-body)]">
          <input type="checkbox" checked={form.is_published} onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))} />
          Published
        </label>
        <Field label="Assign to">
          <Select value={form.target} onChange={set('target')}>
            <option value="course">Whole course</option>
            <option value="enrollment">Specific enrollment</option>
          </Select>
        </Field>
      </div>
      {form.target === 'enrollment' && (
        <Field label="Enrollment">
          <Select value={form.enrollment_id} onChange={set('enrollment_id')}>
            <option value="">Select a student…</option>
            {enrollments.map((e) => (
              <option key={e.id} value={e.id}>{data.userById(e.student_id)?.name || 'Student'}</option>
            ))}
          </Select>
        </Field>
      )}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : initial ? 'Save' : 'Create assignment'}</Button>
      </div>
    </form>
  )
}

const Assignments = () => {
  const data = useAdminData()
  const [editing, setEditing] = useState(null)
  const [viewing, setViewing] = useState(null)   // assignment whose submissions we grade
  const [confirm, setConfirm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [grades, setGrades] = useState({})       // submissionId -> { grade, feedback }

  const save = async (payload) => {
    setSaving(true)
    try {
      const { target, enrollment_id, ...assignment } = payload
      if (editing === 'new') {
        const created = await data.createRow('assignments', { ...assignment, created_by: data.adminId })
        const targets = target === 'course'
          ? data.enrollmentsForCourse(assignment.course_id)
          : data.enrollments.filter((e) => e.id === enrollment_id)
        for (const enr of targets) {
          await data.createRow('assignment_releases', {
            assignment_id: created.id, enrollment_id: enr.id,
            released_at: new Date().toISOString(), due_at: assignment.due_at,
          })
        }
      } else {
        await data.updateRow('assignments', editing.id, assignment)
      }
      setEditing(null)
    } finally { setSaving(false) }
  }

  const remove = async () => {
    setSaving(true)
    try { await data.removeRow('assignments', confirm.id); setConfirm(null) } finally { setSaving(false) }
  }

  const grade = async (submission) => {
    const patch = grades[submission.id] || {}
    setSaving(true)
    try {
      await data.updateRow('assignment_submissions', submission.id, {
        grade: patch.grade != null ? Number(patch.grade) : submission.grade,
        feedback: patch.feedback ?? submission.feedback,
        graded_at: new Date().toISOString(),
      })
    } finally { setSaving(false) }
  }

  const rows = data.assignments.map((a) => {
    const subs = data.assignment_submissions.filter((s) => s.assignment_id === a.id)
    return {
      ...a,
      _course: data.courseById(a.course_id)?.title || 'Course',
      _subs: subs.length,
      _ungraded: subs.filter((s) => subStatus(s) !== 'graded').length,
    }
  })

  const columns = [
    { key: 'title', header: 'Assignment', render: (a) => (
      <div>
        <p className="font-semibold text-[var(--color-text)]">{a.title}</p>
        <p className="text-xs text-[var(--color-text-muted)]">{a._course}</p>
      </div>
    ) },
    { key: 'due', header: 'Due', render: (a) => <span className="text-xs text-[var(--color-text-muted)]">{formatDate(a.due_at)}</span> },
    { key: 'subs', header: 'Submissions', align: 'center', render: (a) => (
      <span className="inline-flex items-center gap-1.5">
        {a._subs}
        {a._ungraded > 0 && <span className="rounded-full bg-[var(--color-accent)] px-1.5 py-0.5 text-xs font-bold text-white">{a._ungraded} new</span>}
      </span>
    ) },
    { key: 'status', header: 'Status', render: (a) => <StatusBadge status={a.is_published ? 'published' : 'unpublished'} /> },
    { key: 'actions', header: 'Actions', align: 'right', render: (a) => (
      <div className="flex items-center justify-end gap-1.5">
        <IconButton icon={FileText} label="Submissions" onClick={() => setViewing(a)} />
        <IconButton icon={Pencil} label="Edit" onClick={() => setEditing(a)} />
        <IconButton icon={TrashBin} tone="danger" label="Delete" onClick={() => setConfirm(a)} />
      </div>
    ) },
  ]

  const submissions = viewing ? data.assignment_submissions.filter((s) => s.assignment_id === viewing.id) : []

  return (
    <div>
      <PageHeader
        title="Assignments"
        subtitle="Create assignments, then review and grade submissions."
        actions={<Button icon={Plus} onClick={() => setEditing('new')}>New assignment</Button>}
      />

      <DataTable
        columns={columns}
        rows={rows}
        searchKeys={['title', '_course']}
        searchPlaceholder="Search assignments…"
        empty="No assignments yet."
      />

      {/* Create / edit */}
      <AdminModal open={!!editing} onClose={() => setEditing(null)} size="lg" title={editing === 'new' ? 'New assignment' : 'Edit assignment'}>
        <AssignmentForm initial={editing === 'new' ? null : editing} onCancel={() => setEditing(null)} onSubmit={save} saving={saving} />
      </AdminModal>

      {/* Submissions + grading */}
      <AdminModal open={!!viewing} onClose={() => setViewing(null)} size="lg" title="Submissions" subtitle={viewing?.title}>
        {submissions.length === 0 ? (
          <EmptyNote>No submissions yet.</EmptyNote>
        ) : (
          <div className="space-y-4">
            {submissions.map((s) => {
              const student = data.userById(s.student_id)
              return (
                <div key={s.id} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[var(--color-text)]">{student?.name || 'Student'}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">Submitted {formatDateTime(s.submitted_at)}</p>
                    </div>
                    <StatusBadge status={subStatus(s)} />
                  </div>
                  {s.answer_text && <p className="mb-2 rounded-lg bg-[var(--color-surface)] p-3 text-sm text-[var(--color-text-body)]">{s.answer_text}</p>}
                  {s.file_url && <a href={s.file_url} target="_blank" rel="noreferrer" className="mb-2 inline-block text-sm font-semibold text-[var(--color-accent)] underline">Attachment</a>}

                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[120px_1fr_auto] sm:items-end">
                    <Field label="Grade (%)">
                      <Input
                        type="number" min="0" max="100"
                        defaultValue={s.grade ?? ''}
                        onChange={(e) => setGrades((g) => ({ ...g, [s.id]: { ...g[s.id], grade: e.target.value } }))}
                        placeholder="0–100"
                      />
                    </Field>
                    <Field label="Feedback">
                      <Input
                        defaultValue={s.feedback || ''}
                        onChange={(e) => setGrades((g) => ({ ...g, [s.id]: { ...g[s.id], feedback: e.target.value } }))}
                        placeholder="Leave feedback…"
                      />
                    </Field>
                    <Button icon={Check} variant="green" onClick={() => grade(s)} disabled={saving}>Save grade</Button>
                  </div>
                  {subStatus(s) === 'graded' && (
                    <p className="mt-2 text-xs text-[var(--color-green-dark)]">Graded {s.grade}% — {s.feedback}</p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </AdminModal>

      {/* Delete */}
      <AdminModal open={!!confirm} onClose={() => setConfirm(null)} size="sm" title="Delete assignment?" subtitle={confirm?.title}
        footer={<>
          <Button variant="outline" onClick={() => setConfirm(null)}>Cancel</Button>
          <Button variant="danger" onClick={remove} disabled={saving}>{saving ? 'Deleting…' : 'Delete'}</Button>
        </>}>
        <p className="text-sm text-[var(--color-text-muted)]">Submissions for this assignment stay on the student records.</p>
      </AdminModal>
    </div>
  )
}

export default Assignments
