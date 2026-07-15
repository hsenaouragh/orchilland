import { useState } from 'react'
import { Star, StarFill, Eye, EyeSlash } from '@gravity-ui/icons'
import { useAdminData } from '../hooks/AdminDataContext'
import StatusBadge from '../components/StatusBadge'
import { PageHeader, Button, EmptyNote, Select } from '../components/ui'
import { formatDate } from '../lib/format'

const Stars = ({ rating }) => (
  <span className="inline-flex items-center gap-0.5 text-[var(--color-accent)]">
    {[1, 2, 3, 4, 5].map((n) => (n <= rating
      ? <StarFill key={n} style={{ width: 15, height: 15 }} />
      : <Star key={n} style={{ width: 15, height: 15, opacity: 0.35 }} />))}
  </span>
)

const Reviews = () => {
  const data = useAdminData()
  const [filter, setFilter] = useState('all')

  const setVisibility = (review, isPublished) =>
    data.updateRow('course_reviews', review.id, { is_published: isPublished })

  const rows = data.course_reviews
    .filter((r) => filter === 'all' ? true : filter === 'published' ? r.is_published : !r.is_published)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  return (
    <div>
      <PageHeader
        title="Reviews"
        subtitle="Approve or hide course reviews before they appear publicly."
        actions={
          <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="!w-auto !py-2 text-sm">
            <option value="all">All reviews</option>
            <option value="published">Published</option>
            <option value="hidden">Hidden</option>
          </Select>
        }
      />

      {rows.length === 0 ? (
        <EmptyNote>No reviews match this filter.</EmptyNote>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {rows.map((r) => {
            const course = data.courseById(r.course_id)
            const studentName = data.userById(r.student_id)?.name || 'Student'
            return (
              <div key={r.id} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[var(--color-text)]">{studentName}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{course?.title || 'Course'} · {formatDate(r.created_at)}</p>
                  </div>
                  <StatusBadge status={r.is_published ? 'published' : 'unpublished'}>
                    {r.is_published ? 'Visible' : 'Hidden'}
                  </StatusBadge>
                </div>
                <Stars rating={r.rating} />
                <p className="my-3 text-sm text-[var(--color-text-body)]">{r.comment}</p>
                <div className="flex justify-end gap-2 border-t border-[var(--color-border)] pt-3">
                  {r.is_published ? (
                    <Button size="sm" variant="outline" icon={EyeSlash} onClick={() => setVisibility(r, false)}>Hide</Button>
                  ) : (
                    <Button size="sm" variant="green" icon={Eye} onClick={() => setVisibility(r, true)}>Approve</Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Reviews
