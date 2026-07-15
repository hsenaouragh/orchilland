import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAdminAuth } from '../hooks/AdminAuthContext'
import { useToast } from '../hooks/ToastContext'
import { useAdminData } from '../hooks/AdminDataContext'

// Pops a toast when the admin gets a new notification (receipts, submissions,
// new users…) and refreshes the dashboard data so badges/lists stay current.
const NotificationsListener = () => {
  const { user } = useAdminAuth()
  const { toast } = useToast()
  const { refresh } = useAdminData()

  useEffect(() => {
    const adminId = user?.id
    if (!adminId) return undefined
    const channel = supabase
      .channel(`admin-notifications-${adminId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${adminId}` },
        (payload) => {
          const n = payload.new || {}
          toast({ title: n.title || 'Notification', message: n.message || '', type: n.type })
          refresh?.()
        },
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user?.id, toast, refresh])

  return null
}

export default NotificationsListener
