import { useState } from 'react'
import { Plus, TrashBin, Check, Circle, CircleCheckFill } from '@gravity-ui/icons'
import { Field, Input, Textarea, Select, Button } from './ui'
import { useAdminData } from '../hooks/AdminDataContext'

// ─────────────────────────────────────────────────────────────────────────────
// Builds a course test end-to-end:
//   • test meta (course, title, description, publish, release + due dates)
//   • questions of type 'mcq' or 'text'
//   • MCQ options with one marked correct
//
// Emits nested data mapping onto course_tests / course_test_questions /
// course_test_options. Release/due are applied per enrollment by the Tests page
// (course_test_releases).
// ─────────────────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 9)

const newOption = () => ({ id: uid(), option_text: '', is_correct: false })
const newQuestion = (question_type = 'mcq') => ({
  id: uid(),
  question: '',
  question_type,
  points: 10,
  options: question_type === 'mcq' ? [{ ...newOption(), is_correct: true }, newOption()] : [],
})

const toInput = (iso) => (iso ? new Date(iso).toISOString().slice(0, 16) : '')

const TestBuilder = ({ initial, onCancel, onSubmit, saving }) => {
  const { courses } = useAdminData()
  const [meta, setMeta] = useState({
    course_id: initial?.course_id || courses[0]?.id || '',
    title: initial?.title || '',
    description: initial?.description || '',
    released_at: toInput(initial?.released_at),
    due_at: toInput(initial?.due_at),
    is_published: initial?.is_published ?? false,
  })
  const [questions, setQuestions] = useState(initial?.questions?.length ? initial.questions : [newQuestion()])

  const setMetaField = (key) => (e) => setMeta((m) => ({ ...m, [key]: e.target.value }))

  const updateQuestion = (qid, patch) =>
    setQuestions((qs) => qs.map((q) => (q.id === qid ? { ...q, ...patch } : q)))

  const changeType = (qid, question_type) =>
    updateQuestion(qid, {
      question_type,
      options: question_type === 'mcq' ? [{ ...newOption(), is_correct: true }, newOption()] : [],
    })

  const addOption = (qid) =>
    setQuestions((qs) => qs.map((q) => (q.id === qid ? { ...q, options: [...q.options, newOption()] } : q)))

  const removeOption = (qid, oid) =>
    setQuestions((qs) => qs.map((q) => (q.id === qid ? { ...q, options: q.options.filter((o) => o.id !== oid) } : q)))

  const setOptionText = (qid, oid, value) =>
    setQuestions((qs) => qs.map((q) => (q.id === qid
      ? { ...q, options: q.options.map((o) => (o.id === oid ? { ...o, option_text: value } : o)) }
      : q)))

  const markCorrect = (qid, oid) =>
    setQuestions((qs) => qs.map((q) => (q.id === qid
      ? { ...q, options: q.options.map((o) => ({ ...o, is_correct: o.id === oid })) }
      : q)))

  const totalPoints = questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0)

  const submit = (e) => {
    e.preventDefault()
    onSubmit({
      ...meta,
      released_at: meta.released_at ? new Date(meta.released_at).toISOString() : null,
      due_at: meta.due_at ? new Date(meta.due_at).toISOString() : null,
      total_points: totalPoints,
      questions: questions.map((q, i) => ({ ...q, position: i + 1, points: Number(q.points) || 0 })),
    })
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Test meta */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Course">
          <Select value={meta.course_id} onChange={setMetaField('course_id')} required>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </Select>
        </Field>
        <Field label="Title">
          <Input value={meta.title} onChange={setMetaField('title')} placeholder="e.g. Unit 1 Quiz" required />
        </Field>
        <Field label="Release date">
          <Input type="datetime-local" value={meta.released_at} onChange={setMetaField('released_at')} />
        </Field>
        <Field label="Due date">
          <Input type="datetime-local" value={meta.due_at} onChange={setMetaField('due_at')} />
        </Field>
      </div>
      <Field label="Description">
        <Textarea value={meta.description} onChange={setMetaField('description')} placeholder="What does this test cover?" />
      </Field>
      <label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-body)]">
        <input type="checkbox" checked={meta.is_published} onChange={(e) => setMeta((m) => ({ ...m, is_published: e.target.checked }))} />
        Published
      </label>

      {/* Questions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[var(--color-text)]">Questions</h3>
          <span className="text-sm text-[var(--color-text-muted)]">{questions.length} · {totalPoints} pts total</span>
        </div>

        {questions.map((q, index) => (
          <div key={q.id} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-bold text-white">
                {index + 1}
              </span>
              <div className="flex items-center gap-2">
                <Select value={q.question_type} onChange={(e) => changeType(q.id, e.target.value)} className="!w-auto !py-1.5 text-xs">
                  <option value="mcq">Multiple choice</option>
                  <option value="text">Text answer</option>
                </Select>
                <Input
                  type="number" min="0" value={q.points}
                  onChange={(e) => updateQuestion(q.id, { points: e.target.value })}
                  className="!w-20 !py-1.5 text-xs" placeholder="pts"
                />
                <button
                  type="button"
                  onClick={() => setQuestions((qs) => qs.filter((x) => x.id !== q.id))}
                  disabled={questions.length === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-danger)] transition hover:bg-[var(--color-danger-faint)] disabled:opacity-40"
                  title="Remove question"
                >
                  <TrashBin style={{ width: 15, height: 15 }} />
                </button>
              </div>
            </div>

            <Input
              value={q.question}
              onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
              placeholder="Type the question…"
              required
            />

            {q.question_type === 'mcq' ? (
              <div className="mt-3 space-y-2">
                {q.options.map((o) => (
                  <div key={o.id} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => markCorrect(q.id, o.id)}
                      title="Mark as correct answer"
                      className={o.is_correct ? 'text-[var(--color-green)]' : 'text-[var(--color-text-faint)]'}
                    >
                      {o.is_correct
                        ? <CircleCheckFill style={{ width: 20, height: 20 }} />
                        : <Circle style={{ width: 20, height: 20 }} />}
                    </button>
                    <Input
                      value={o.option_text}
                      onChange={(e) => setOptionText(q.id, o.id, e.target.value)}
                      placeholder="Answer option"
                      className="flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeOption(q.id, o.id)}
                      disabled={q.options.length <= 2}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition hover:text-[var(--color-danger)] disabled:opacity-40"
                    >
                      <TrashBin style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addOption(q.id)}
                  className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-accent)]"
                >
                  <Plus style={{ width: 14, height: 14 }} /> Add option
                </button>
                <p className="text-xs text-[var(--color-text-faint)]">
                  <Check style={{ width: 12, height: 12, display: 'inline' }} /> Click the circle to mark the correct option.
                </p>
              </div>
            ) : (
              <p className="mt-2 text-xs text-[var(--color-text-faint)]">Text answers are graded manually from the attempts view.</p>
            )}
          </div>
        ))}

        <Button type="button" variant="outline" icon={Plus} onClick={() => setQuestions((qs) => [...qs, newQuestion()])}>
          Add question
        </Button>
      </div>

      <div className="flex justify-end gap-3 border-t border-[var(--color-border)] pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : initial ? 'Save test' : 'Create test'}</Button>
      </div>
    </form>
  )
}

export default TestBuilder
