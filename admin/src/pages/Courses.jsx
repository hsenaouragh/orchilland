import { useState } from 'react'
import { Plus, Pencil, TrashBin, ToggleOn, ToggleOff } from '@gravity-ui/icons'
import { useAdminData } from '../hooks/AdminDataContext'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import AdminModal from '../components/AdminModal'
import CourseForm from '../components/CourseForm'
import { PageHeader, Button, IconButton } from '../components/ui'
import { money } from '../lib/format'

const Courses = () => {
  const data = useAdminData()
  const [editing, setEditing] = useState(null)  // course row or 'new'
  const [confirm, setConfirm] = useState(null)   // course pending delete
  const [saving, setSaving] = useState(false)

  const save = async (payload) => {
    setSaving(true)
    try {
      if (editing === 'new') {
        await data.createRow('courses', { ...payload, created_by: data.adminId, updated_at: new Date().toISOString() })
      } else {
        await data.updateRow('courses', editing.id, { ...payload, updated_at: new Date().toISOString() })
      }
      setEditing(null)
    } finally { setSaving(false) }
  }

  const toggleAvailability = (course) =>
    data.updateRow('courses', course.id, {
      status: course.status === 'available' ? 'not_available' : 'available',
    })

  const remove = async () => {
    setSaving(true)
    try {
      await data.removeRow('courses', confirm.id)
      setConfirm(null)
    } finally { setSaving(false) }
  }

  const rows = data.courses.map((c) => ({
    ...c,
    _language: data.languageById(c.language_id)?.name || '—',
    _students: data.enrollmentsForCourse(c.id).length,
  }))

  const columns = [
    { key: 'title', header: 'Course', render: (c) => (
      <div className="flex items-center gap-3">
        <span className="h-9 w-9 shrink-0 rounded-lg bg-cover bg-center" style={{ backgroundImage: c.image_url ? `url(${c.image_url})` : undefined, background: c.image_url ? undefined : 'var(--color-accent-faint)' }} />
        <div>
          <p className="font-semibold text-[var(--color-text)]">{c.title}</p>
          <p className="text-xs text-[var(--color-text-muted)]">{c._language} · {c.type}</p>
        </div>
      </div>
    ) },
    { key: 'level', header: 'Level', render: (c) => <span className="rounded-md bg-[var(--color-panel)] px-2 py-1 text-xs font-semibold">{c.level}</span> },
    { key: 'duration', header: 'Duration', render: (c) => <span className="text-sm text-[var(--color-text-muted)]">{c.duration_weeks ? `${c.duration_weeks} weeks` : '—'}</span> },
    { key: 'price', header: 'Price', render: (c) => (Number(c.price) ? money(c.price) : <span className="text-[var(--color-green)]">Free</span>) },
    { key: 'students', header: 'Students', align: 'center', render: (c) => c._students },
    { key: 'status', header: 'Availability', render: (c) => <StatusBadge status={c.status} /> },
    { key: 'actions', header: 'Actions', align: 'right', render: (c) => (
      <div className="flex items-center justify-end gap-1.5">
        <IconButton
          icon={c.status === 'available' ? ToggleOn : ToggleOff}
          tone={c.status === 'available' ? 'green' : 'muted'}
          label={c.status === 'available' ? 'Set not available' : 'Set available'}
          onClick={() => toggleAvailability(c)}
        />
        <IconButton icon={Pencil} label="Edit" onClick={() => setEditing(c)} />
        <IconButton icon={TrashBin} tone="danger" label="Delete / archive" onClick={() => setConfirm(c)} />
      </div>
    ) },
  ]

  return (
    <div>
      <PageHeader
        title="Courses"
        subtitle="Create and manage the course catalog."
        actions={<Button icon={Plus} onClick={() => setEditing('new')}>New course</Button>}
      />

      <DataTable
        columns={columns}
        rows={rows}
        searchKeys={['title', '_language', 'type', 'level']}
        searchPlaceholder="Search courses…"
        empty="No courses yet. Create your first one."
      />

      <AdminModal
        open={!!editing}
        onClose={() => setEditing(null)}
        size="lg"
        title={editing === 'new' ? 'New course' : 'Edit course'}
        subtitle={editing && editing !== 'new' ? editing.title : 'Fill in the course details.'}
      >
        <CourseForm
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
        title="Delete course?"
        subtitle={confirm?.title}
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirm(null)}>Cancel</Button>
            <Button variant="danger" onClick={remove} disabled={saving}>{saving ? 'Deleting…' : 'Delete'}</Button>
          </>
        }
      >
        <p className="text-sm text-[var(--color-text-muted)]">
          This removes the course from the catalog. Consider setting it to <span className="font-semibold">Archived</span> instead to keep enrollments and history intact.
        </p>
      </AdminModal>
    </div>
  )
}

export default Courses
