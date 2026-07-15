import { useState } from 'react'
import { useAuth } from '../hooks/AuthContext'
import { useQuery } from '../hooks/useQuery'
import { fetchNotifications, markNotificationRead } from '../services/db'

const Notifications = () => {
  const { user, openAuth } = useAuth()
  const { data: notifications, setData } = useQuery(() => fetchNotifications(user), [user?.id], [])
  const [error, setError] = useState('')

  if (!user) {
    return (
      <main className='max-w-3xl mx-auto px-4 py-20 text-center'>
        <h1 className='text-2xl font-bold text-[var(--color-text)]'>Log in to view notifications</h1>
        <button onClick={() => openAuth()} className='mt-6 rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-white'>Log in</button>
      </main>
    )
  }

  const userNotifications = notifications.filter(item => item.userId === user.id)

  return (
    <main className='max-w-4xl mx-auto px-4 py-12'>
      <div className='mb-10'>
        <p className='text-xs uppercase tracking-widest font-semibold text-[var(--color-text-body)]'>Notifications</p>
        <h1 className='text-3xl font-bold text-[var(--color-text)] mt-2'>Student updates</h1>
      </div>

      <div className='rounded-3xl border border-[var(--color-border)] bg-white dark:bg-slate-900 p-6'>
        {error && <p className='mb-4 text-sm text-[var(--color-danger)]'>{error}</p>}
        {userNotifications.length ? (
          <div className='space-y-3'>
            {userNotifications.map(notification => (
              <button
                key={notification.id}
                onClick={() => {
                  setError('')
                  markNotificationRead(notification.id)
                    .then(readAt => setData(prev => prev.map(item => item.id === notification.id ? { ...item, readAt } : item)))
                    .catch(err => setError(err.message || 'Could not update notification'))
                }}
                className={`w-full text-left rounded-2xl border p-4 transition ${
                  notification.readAt
                    ? 'border-[var(--color-border)] bg-[var(--color-panel)]'
                    : 'border-[var(--color-primary)] bg-[var(--color-primary-soft)]'
                }`}
              >
                <div className='flex items-start justify-between gap-4'>
                  <div>
                    <p className='font-semibold text-[var(--color-text)]'>{notification.title}</p>
                    <p className='text-sm text-[var(--color-text-muted)] mt-1'>{notification.message}</p>
                  </div>
                  <span className='text-xs text-[var(--color-text-faint)]'>{notification.readAt ? 'read' : 'new'}</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className='text-sm text-[var(--color-text-muted)]'>No notifications yet.</p>
        )}
      </div>
    </main>
  )
}

export default Notifications
