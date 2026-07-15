import { useState } from 'react'
import { Receipt, FileText, ListCheck, Comment, Bell, Check, CheckDouble } from '@gravity-ui/icons'
import { useAdminData } from '../hooks/AdminDataContext'
import { PageHeader, Button, EmptyNote, Select } from '../components/ui'
import { timeAgo } from '../lib/format'

// Map notification.type → icon + tint. Matches the schema's type vocabulary:
// payment, enrollment, lesson, test, assignment, post, comment.
const TYPES = {
  payment: { icon: Receipt, fg: 'var(--color-accent)', bg: 'var(--color-accent-faint)' },
  enrollment: { icon: Receipt, fg: 'var(--color-primary)', bg: 'var(--color-primary-soft)' },
  assignment: { icon: FileText, fg: 'var(--color-green)', bg: 'var(--color-green-faint)' },
  test: { icon: ListCheck, fg: 'var(--color-primary)', bg: 'var(--color-primary-soft)' },
  lesson: { icon: FileText, fg: 'var(--color-accent)', bg: 'var(--color-accent-faint)' },
  post: { icon: Comment, fg: 'var(--color-accent)', bg: 'var(--color-accent-faint)' },
  comment: { icon: Comment, fg: 'var(--color-accent)', bg: 'var(--color-accent-faint)' },
  general: { icon: Bell, fg: 'var(--color-text-muted)', bg: 'var(--color-panel)' },
}

const Notifications = () => {
  const data = useAdminData()
  const [filter, setFilter] = useState('all')

  // Only the admin's own notifications.
  const mine = data.notifications.filter((n) => !data.adminId || n.user_id === data.adminId)
  const rows = mine
    .filter((n) => filter === 'all' ? true : filter === 'unread' ? !n.read_at : !!n.read_at)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  const unread = mine.filter((n) => !n.read_at).length

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={`${unread} unread · new receipts, applications, submissions, and comments.`}
        actions={
          <div className="flex items-center gap-2">
            <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="!w-auto !py-2 text-sm">
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </Select>
            <Button variant="outline" icon={CheckDouble} onClick={data.markAllNotificationsRead} disabled={unread === 0}>
              Mark all read
            </Button>
          </div>
        }
      />

      {rows.length === 0 ? (
        <EmptyNote>Nothing here.</EmptyNote>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          {rows.map((n) => {
            const t = TYPES[n.type] || TYPES.general
            const Icon = t.icon
            return (
              <div
                key={n.id}
                className={`flex items-start gap-3 border-b border-[var(--color-border)] px-5 py-4 last:border-0 ${n.read_at ? '' : 'bg-[var(--color-accent-faint)]/40'}`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: t.bg, color: t.fg }}>
                  <Icon style={{ width: 18, height: 18 }} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[var(--color-text)]">{n.title}</p>
                    {!n.read_at && <span className="h-2 w-2 rounded-full bg-[var(--color-accent)]" />}
                  </div>
                  <p className="text-sm text-[var(--color-text-muted)]">{n.message}</p>
                  <p className="mt-0.5 text-xs text-[var(--color-text-faint)]">{timeAgo(n.created_at)}</p>
                </div>
                {!n.read_at && (
                  <button
                    onClick={() => data.markNotificationRead(n.id)}
                    className="flex shrink-0 items-center gap-1 rounded-lg border border-[var(--color-border)] px-2.5 py-1.5 text-xs font-semibold text-[var(--color-text-muted)] transition hover:border-[var(--color-green)] hover:text-[var(--color-green)]"
                  >
                    <Check style={{ width: 14, height: 14 }} /> Mark read
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Notifications
