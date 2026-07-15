import { createClient } from '@supabase/supabase-js'

// Single Supabase client for the admin app. Reads credentials from .env
// (VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY).
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const isSupabaseConfigured = Boolean(url && key)

if (!isSupabaseConfigured) {
  // Surface a clear message during development instead of a cryptic crash.
  console.error('[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in .env')
}

export const supabase = createClient(url || 'http://localhost', key || 'public-anon-key', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'orchilla_admin_auth',
  },
})

export default supabase
