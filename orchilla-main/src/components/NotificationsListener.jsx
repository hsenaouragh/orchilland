import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/AuthContext'
import { useToast } from '../hooks/ToastContext'

// Subscribes to the logged-in user's notifications and pops a toast on each new
// one (realtime). No UI of its own.
const NotificationsListener = () => {
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (!user?.id) return undefined
    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          const n = payload.new || {}
          toast({ title: n.title || 'Notification', message: n.message || '', type: n.type })
        },
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user?.id, toast])

  return null
}

export default NotificationsListener
