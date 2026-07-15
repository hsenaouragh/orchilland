import { useState } from 'react'
import { Plus, Pencil, TrashBin, ListCheck, ToggleOn, ToggleOff, Check, Xmark } from '@gravity-ui/icons'
import { useAdminData } from '../hooks/AdminDataContext'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import AdminModal from '../components/AdminModal'
import TestBuilder from '../components/TestBuilder'
import { PageHeader, Button, IconButton, EmptyNote } from '../components/ui'
import { formatDate, formatDateTime } from '../lib/format'

// Attach questions + options to a test row for editing / display.
const hydrateTest = (data, test) => {
  const release = data.course_test_releases.find((r) => r.test_id === test.id)
  return {
    ...test,
    released_at: release?.released_at || null,
    due_at: release?.due_at || null,
    questions: data.course_test_questions
      .filter((q) => q.test_id === test.id)
      .sort((a, b) => (a.position || 0) - (b.position || 0))
      .map((q) => ({ ...q, options: data.course_test_options.filter((o) => o.question_id === q.id) })),
  }
}

const Tests = () => {
  const data = useAdminData()
  const [editing, setEditing] = useState(null)
  const [attempts, setAttempts] = useState(null)  // test whose attempts we view
  const [confirm, setConfirm] = useState(null)
  const [saving, setSaving] = useState(false)

  const save = async (payload) => {
    setSaving(true)
    try {
      const { questions, released_at, due_at, ...testMeta } = payload
      if (editing === 'new') {
        const created = await data.createRow('course_tests', { ...testMeta, created_by: data.adminId })
        for (const q of questions) {
          const question = await data.createRow('course_test_questions', {
            test_id: created.id, question: q.question, question_type: q.question_type,
            points: q.points, position: q.position,
          })
          for (let i = 0; i < (q.options || []).length; i += 1) {
            const o = q.options[i]
            await data.createRow('course_test_options', {
              question_id: question.id, option_text: o.option_text, is_correct: o.is_correct, position: i + 1,
            })
          }
        }
        // Release to every enrollment in the course (release + due dates).
        for (const enr of data.enrollmentsForCourse(testMeta.course_id)) {
          await data.createRow('course_test_releases', {
            test_id: created.id, enrollment_id: enr.id, released_at, due_at,
          })
        }
      } else {
        await data.updateRow('course_tests', editing.id, testMeta)
      }
      setEditing(null)
    } finally { setSaving(false) }
  }

  const togglePublish = (t) => data.updateRow('course_tests', t.id, { is_published: !t.is_published })

  const remove = async () => {
    setSaving(true)
    try { await data.removeRow('course_tests', confirm.id); setConfirm(null) } finally { setSaving(false) }
  }

  const rows = data.course_tests.map((t) => {
    const release = data.course_test_releases.find((r) => r.test_id === t.id)
    return {
      ...t,
      _course: data.courseById(t.course_id)?.title || 'Course',
      _q: data.course_test_questions.filter((q) => q.test_id === t.id).length,
      _a: data.course_test_attempts.filter((a) => a.test_id === t.id).length,
      _release: release?.released_at, _due: release?.due_at,
    }
  })

  const columns = [
    { key: 'title', header: 'Test', render: (t) => (
      <div>
        <p className="font-semibold text-[var(--color-text)]">{t.title}</p>
        <p className="text-xs text-[var(--color-text-muted)]">{t._course}</p>
      </div>
    ) },
    { key: 'q', header: 'Questions', align: 'center', render: (t) => t._q },
    { key: 'points', header: 'Points', align: 'center', render: (t) => t.total_points ?? '—' },
    { key: 'dates', header: 'Release → Due', render: (t) => <span className="text-xs text-[var(--color-text-muted)]">{formatDate(t._release)} → {formatDate(t._due)}</span> },
    { key: 'attempts', header: 'Attempts', align: 'center', render: (t) => t._a },
    { key: 'status', header: 'Status', render: (t) => <StatusBadge status={t.is_published ? 'published' : 'unpublished'} /> },
    { key: 'actions', header: 'Actions', align: 'right', render: (t) => (
      <div className="flex items-center justify-end gap-1.5">
        <IconButton icon={ListCheck} label="View attempts" onClick={() => setAttempts(t)} />
        <IconButton icon={t.is_published ? ToggleOn : ToggleOff} tone={t.is_published ? 'green' : 'muted'} label="Publish" onClick={() => togglePublish(t)} />
        <IconButton icon={Pencil} label="Edit" onClick={() => setEditing(hydrateTest(data, t))} />
        <IconButton icon={TrashBin} tone="danger" label="Delete" onClick={() => setConfirm(t)} />
      </div>
    ) },
  ]

  const testAttempts = attempts ? data.course_test_attempts.filter((a) => a.test_id === attempts.id) : []

  // Resolve an answer's display text + the correct option text for a question.
  const answerView = (ans) => {
    const selected = data.course_test_options.find((o) => o.id === ans.selected_option_id)
    const correct = data.course_test_options.find((o) => o.question_id === ans.question_id && o.is_correct)
    return {
      student: selected?.option_text || ans.text_answer || '—',
      correct: correct?.option_text || null,
    }
  }

  return (
    <div>
      <PageHeader
        title="Tests"
        subtitle="Build MCQ / text tests and review student attempts."
        actions={<Button icon={Plus} onClick={() => setEditing('new')}>New test</Button>}
      />

      <DataTable
        columns={columns}
        rows={rows}
        searchKeys={['title', '_course']}
        searchPlaceholder="Search tests…"
        empty="No tests yet."
      />

      {/* Build / edit test */}
      <AdminModal open={!!editing} onClose={() => setEditing(null)} size="xl" title={editing === 'new' ? 'Build a test' : 'Edit test'}>
        <TestBuilder initial={editing === 'new' ? null : editing} onCancel={() => setEditing(null)} onSubmit={save} saving={saving} />
      </AdminModal>

      {/* View attempts */}
      <AdminModal open={!!attempts} onClose={() => setAttempts(null)} size="xl" title="Student attempts" subtitle={attempts?.title}>
        {testAttempts.length === 0 ? (
          <EmptyNote>No attempts yet.</EmptyNote>
        ) : (
          <div className="space-y-5">
            {testAttempts.map((att) => {
              const student = data.userById(att.student_id)
              const answers = data.course_test_answers.filter((a) => a.attempt_id === att.id)
              return (
                <div key={att.id} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[var(--color-text)]">{student?.name || 'Student'}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">Submitted {formatDateTime(att.submitted_at)}</p>
                    </div>
                    <span className="text-sm font-bold text-[var(--color-accent)]">{att.score}/{att.total_points} · {att.grade_percent}%</span>
                  </div>
                  <div className="space-y-2">
                    {answers.map((ans) => {
                      const q = data.course_test_questions.find((x) => x.id === ans.question_id)
                      const view = answerView(ans)
                      return (
                        <div key={ans.id} className="rounded-xl bg-[var(--color-surface)] p-3">
                          <p className="text-sm font-semibold text-[var(--color-text)]">{q?.question || 'Question'}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                            <span className={`inline-flex items-center gap-1 ${ans.is_correct ? 'text-[var(--color-green)]' : 'text-[var(--color-danger)]'}`}>
                              {ans.is_correct ? <Check style={{ width: 14, height: 14 }} /> : <Xmark style={{ width: 14, height: 14 }} />}
                              {view.student}
                            </span>
                            {!ans.is_correct && view.correct && (
                              <span className="text-xs text-[var(--color-text-muted)]">Correct: {view.correct}</span>
                            )}
                            <span className="ml-auto text-xs text-[var(--color-text-faint)]">{ans.points_awarded ?? 0} pts</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </AdminModal>

      {/* Delete */}
      <AdminModal open={!!confirm} onClose={() => setConfirm(null)} size="sm" title="Delete test?" subtitle={confirm?.title}
        footer={<>
          <Button variant="outline" onClick={() => setConfirm(null)}>Cancel</Button>
          <Button variant="danger" onClick={remove} disabled={saving}>{saving ? 'Deleting…' : 'Delete'}</Button>
        </>}>
        <p className="text-sm text-[var(--color-text-muted)]">Questions, options, and attempts are removed with the test.</p>
      </AdminModal>
    </div>
  )
}

export default Tests
