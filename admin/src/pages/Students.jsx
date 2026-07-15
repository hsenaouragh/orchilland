import { useState } from 'react'
import { PersonXmark, ArrowRotateLeft } from '@gravity-ui/icons'
import { useAdminData } from '../hooks/AdminDataContext'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import AdminModal from '../components/AdminModal'
import { PageHeader, Button } from '../components/ui'
import { initials, formatDate } from '../lib/format'

// Build a rich view of one student from the normalized tables.
const buildProfile = (data, student) => {
  const enrollments = data.enrollments.filter((e) => e.student_id === student.id)
  const applications = data.course_applications.filter((a) => a.student_id === student.id)

  const courses = enrollments.map((e) => {
    const course = data.courseById(e.course_id)
    // Overall grade = average of graded test attempts for this enrollment,
    // falling back to the stored final_grade.
    const attempts = data.course_test_attempts.filter((t) => t.enrollment_id === e.id && t.grade_percent != null)
    const grade = attempts.length
      ? Math.round(attempts.reduce((s, t) => s + t.grade_percent, 0) / attempts.length)
      : e.final_grade
    return { enrollment: e, course, grade }
  })

  return { enrollments, applications, courses }
}

const Students = () => {
  const data = useAdminData()
  const [selected, setSelected] = useState(null)
  const [confirmId, setConfirmId] = useState(null) // enrollment id pending "remove access"
  const [saving, setSaving] = useState(false)

  const students = data.users.filter((u) => u.role === 'student')

  const rows = students.map((s) => {
    const enrollments = data.enrollments.filter((e) => e.student_id === s.id)
    const apps = data.course_applications.filter((a) => a.student_id === s.id)
    return { ...s, _courses: enrollments.filter((e) => e.status === 'active').length, _apps: apps.length }
  })

  const revoke = async (enrollment) => {
    setSaving(true)
    try { await data.revokeAccess(enrollment); setConfirmId(null) } finally { setSaving(false) }
  }
  const restore = async (enrollment) => {
    setSaving(true)
    try { await data.restoreAccess(enrollment) } finally { setSaving(false) }
  }

  const columns = [
    { key: 'name', header: 'Student', render: (s) => (
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-bold text-white">{initials(s.name, s.email)}</span>
        <div>
          <p className="font-semibold text-[var(--color-text)]">{s.name}</p>
          <p className="text-xs text-[var(--color-text-muted)]">{s.email}</p>
        </div>
      </div>
    ) },
    { key: 'level', header: 'Level', align: 'center', render: (s) => <span className="rounded-md bg-[var(--color-panel)] px-2 py-1 text-xs font-semibold">{s.current_level || '—'}</span> },
    { key: 'courses', header: 'Enrolled', align: 'center', render: (s) => s._courses },
    { key: 'apps', header: 'Applications', align: 'center', render: (s) => s._apps },
    { key: 'joined', header: 'Joined', render: (s) => <span className="text-xs text-[var(--color-text-muted)]">{formatDate(s.created_at)}</span> },
  ]

  const profile = selected ? buildProfile(data, selected) : null

  return (
    <div>
      <PageHeader title="Students" subtitle="All learners, their courses, and progress." />

      <DataTable
        columns={columns}
        rows={rows}
        searchKeys={['name', 'email', 'current_level']}
        searchPlaceholder="Search students…"
        onRowClick={setSelected}
        empty="No students yet."
      />

      <AdminModal
        open={!!selected}
        onClose={() => setSelected(null)}
        size="lg"
        title={selected?.name}
        subtitle={selected?.email}
      >
        {profile && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Current level" value={selected.current_level || '—'} />
              <Stat label="Active courses" value={profile.enrollments.filter((e) => e.status === 'active').length} />
              <Stat label="Applications" value={profile.applications.length} />
              <Stat label="Phone" value={selected.phone || '—'} />
            </div>

            <div>
              <h4 className="mb-2 text-sm font-bold text-[var(--color-text)]">Courses & grades</h4>
              {profile.courses.length === 0 ? (
                <p className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-5 text-center text-sm text-[var(--color-text-muted)]">Not enrolled in any course.</p>
              ) : (
                <div className="space-y-2">
                  {profile.courses.map(({ enrollment, course, grade }) => {
                    const revoked = enrollment.status === 'suspended' || enrollment.status === 'denied'
                    return (
                      <div key={enrollment.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-[var(--color-text)]">{course?.title || 'Course'}</p>
                            <p className="text-xs text-[var(--color-text-muted)]">Progress {enrollment.progress_percent ?? 0}% · {course?.level}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-[var(--color-accent)]">{grade != null ? `${grade}%` : '—'}</span>
                            <StatusBadge status={enrollment.status} />
                            {revoked ? (
                              <Button size="sm" variant="green" icon={ArrowRotateLeft} disabled={saving} onClick={() => restore(enrollment)}>
                                Restore
                              </Button>
                            ) : confirmId === enrollment.id ? null : (
                              <Button size="sm" variant="outline" icon={PersonXmark} onClick={() => setConfirmId(enrollment.id)}>
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Inline confirmation — clearer than a nested modal */}
                        {confirmId === enrollment.id && !revoked && (
                          <div className="mt-3 flex flex-col gap-2 rounded-lg border border-[var(--color-danger)] bg-[var(--color-danger-faint)] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs text-[var(--color-danger)]">
                              Remove this student from <span className="font-semibold">{course?.title}</span>? They lose access immediately. You can restore it later.
                            </p>
                            <div className="flex shrink-0 gap-2">
                              <Button size="sm" variant="outline" onClick={() => setConfirmId(null)}>Cancel</Button>
                              <Button size="sm" variant="danger" disabled={saving} onClick={() => revoke(enrollment)}>
                                {saving ? 'Removing…' : 'Remove access'}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div>
              <h4 className="mb-2 text-sm font-bold text-[var(--color-text)]">Application statuses</h4>
              {profile.applications.length === 0 ? (
                <p className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-5 text-center text-sm text-[var(--color-text-muted)]">No applications.</p>
              ) : (
                <div className="space-y-2">
                  {profile.applications.map((app) => (
                    <div key={app.id} className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3">
                      <p className="text-sm font-semibold text-[var(--color-text)]">{data.courseById(app.course_id)?.title || 'Course'}</p>
                      <StatusBadge status={app.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  )
}

const Stat = ({ label, value }) => (
  <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2.5">
    <p className="text-lg font-bold text-[var(--color-text)]">{value}</p>
    <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
  </div>
)

export default Students
