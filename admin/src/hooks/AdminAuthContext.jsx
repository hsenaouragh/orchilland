import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

// ─────────────────────────────────────────────────────────────────────────────
// Admin auth via Supabase Auth. Single instructor = the admin, identified by
// users.role === 'admin' (or user_metadata.role === 'admin').
//
// A signed-in user is admitted unless they are explicitly a 'student'. This
// keeps the one instructor from being locked out if their profile row / role
// hasn't been set yet, while still blocking student accounts.
// ─────────────────────────────────────────────────────────────────────────────

const AdminAuthContext = createContext(null)

// Resolve a display profile + role for an authenticated Supabase user.
const resolveProfile = async (authUser) => {
  if (!authUser) return null
  const meta = authUser.user_metadata || {}
  let role = meta.role
  let name = meta.name || meta.full_name

  // Prefer the profile row (public.users) when metadata is missing.
  try {
    const { data } = await supabase.from('users').select('name, role').eq('id', authUser.id).maybeSingle()
    if (data) {
      role = data.role || role
      name = name || data.name
    }
  } catch {
    // best-effort; metadata remains the fallback
  }

  return {
    id: authUser.id,
    email: authUser.email || '',
    name: name || authUser.email?.split('@')[0] || 'Admin',
    role: role || 'admin',
  }
}

const isAdminRole = (role) => role !== 'student'

export const AdminAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(async ({ data }) => {
      const profile = await resolveProfile(data.session?.user)
      if (!active) return
      setUser(profile && isAdminRole(profile.role) ? profile : null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const profile = await resolveProfile(session?.user)
      setUser(profile && isAdminRole(profile.role) ? profile : null)
      setLoading(false)
    })

    return () => { active = false; subscription.unsubscribe() }
  }, [])

  const signIn = useCallback(async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: (email || '').trim().toLowerCase(),
      password,
    })
    if (error) throw new Error(error.message || 'Sign in failed')

    const profile = await resolveProfile(data.user)
    if (!profile || !isAdminRole(profile.role)) {
      await supabase.auth.signOut()
      throw new Error('This account is not an administrator.')
    }
    setUser(profile)
    return profile
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  const value = useMemo(() => ({
    user,
    loading,
    isAdmin: !!user,
    isAuthenticated: !!user,
    signIn,
    signOut,
  }), [user, loading, signIn, signOut])

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used inside <AdminAuthProvider>')
  return ctx
}
