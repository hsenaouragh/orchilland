import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  Person, Lock, Eye, EyeSlash, Xmark,
  EnvelopeOpen, Check, CircleExclamation,
} from '@gravity-ui/icons'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

const initialsFor = (name = '', email = '') => {
  const source = name.trim() || email.split('@')[0] || 'Student'
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase()
}

const toPublicUser = (authUser) => {
  if (!authUser) return null
  const meta = authUser.user_metadata || {}
  const name = meta.name || meta.full_name || authUser.email?.split('@')[0] || 'Student'

  return {
    id: authUser.id,
    name,
    email: authUser.email || '',
    phone: meta.phone || '',
    // avatar = initials used as a fallback; avatarUrl = uploaded profile picture
    avatar: initialsFor(name, authUser.email),
    avatarUrl: meta.avatar_url || null,
    role: meta.role || 'student',
    current_level: meta.current_level || meta.level || 'A1',
    level: meta.current_level || meta.level || 'A1',
    plan: meta.plan || 'Free',
  }
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

export const useProtectedAction = () => {
  const { user, openAuth } = useAuth()
  return useCallback(
    (fn) => (...args) => {
      if (user) fn(...args)
      else openAuth()
    },
    [user, openAuth]
  )
}

const Input = ({ icon: Icon, type = 'text', placeholder, value, onChange, rightSlot, error }) => (
  <div className='space-y-1'>
    <div className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-3 transition ${
      error
        ? 'border-[var(--color-danger)] bg-[var(--color-danger-faint)]'
        : value
          ? 'border-[var(--color-accent)] bg-[var(--color-surface)]'
          : 'border-[var(--color-border)] bg-[var(--color-surface)]'
    }`}>
      {Icon && <Icon className='h-4 w-4 shrink-0 text-[var(--color-text-muted)]' />}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className='min-w-0 flex-1 bg-transparent text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-faint)]'
      />
      {rightSlot}
    </div>
    {error && <p className='pl-1 text-xs text-[var(--color-danger)]'>{error}</p>}
  </div>
)

const AuthModal = ({ onClose, onSuccess }) => {
  const [tab, setTab] = useState('login')
  const [showPass, setShowPass] = useState(false)
  const [showConf, setShowConf] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})

  const set = (field) => (event) => {
    setForm(prev => ({ ...prev, [field]: event.target.value }))
    setErrors(prev => ({ ...prev, [field]: '', submit: '' }))
  }

  const validate = () => {
    const next = {}
    if (tab === 'signup' && !form.name.trim()) next.name = 'Name is required'
    if (!form.email.includes('@')) next.email = 'Enter a valid email'
    if (form.password.length < 6) next.password = 'At least 6 characters'
    if (tab === 'signup' && form.password !== form.confirm) next.confirm = 'Passwords do not match'
    return next
  }

  const submit = async () => {
    const nextErrors = validate()
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    setLoading(true)
    setErrors({})
    setNotice('')

    const email = form.email.trim().toLowerCase()
    const password = form.password
    const result = tab === 'signup'
      ? await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: form.name.trim(),
              role: 'student',
              current_level: 'A1',
              plan: 'Free',
            },
          },
        })
      : await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)

    if (result.error) {
      const message = result.error.message || 'Authentication failed'
      setErrors({ submit: message })
      return
    }

    if (tab === 'signup' && !result.data.session) {
      setSuccess(true)
      setNotice('Account created. Confirm your email, then log in.')
      return
    }

    setSuccess(true)
    setNotice(tab === 'signup' ? 'Account created.' : 'Logged in.')
    setTimeout(() => onSuccess(result.data.user), 450)
  }

  useEffect(() => {
    const handler = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      onClick={onClose}
      className='fixed inset-0 z-[1000] flex items-center justify-center bg-black/55 px-4 backdrop-blur-md'
    >
      <div
        onClick={event => event.stopPropagation()}
        className='w-full max-w-[420px] overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl'
      >
        <div className='relative bg-[var(--color-accent)] px-7 py-7'>
          <button
            onClick={onClose}
            className='absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/40 bg-white/15 text-white transition hover:bg-white/25'
            aria-label='Close auth modal'
          >
            <Xmark className='h-4 w-4' />
          </button>

          <h1 className='text-2xl font-black text-white'>
            {success ? 'Welcome' : tab === 'login' ? 'Welcome back' : 'Join OrchillaLand'}
          </h1>
          <p className='mt-1 text-sm text-white/85'>
            {success
              ? notice
              : tab === 'login'
                ? 'Log in to access your courses and progress.'
                : 'Create a free student account.'}
          </p>
        </div>

        {success ? (
          <div className='px-7 py-10 text-center'>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[var(--color-green)] bg-[var(--color-green-faint)]'>
              <Check className='h-7 w-7 text-[var(--color-green)]' />
            </div>
            <p className='text-sm font-semibold text-[var(--color-text)]'>{notice}</p>
            {!notice.includes('Confirm') && (
              <p className='mt-1 text-xs text-[var(--color-text-muted)]'>Redirecting now...</p>
            )}
            {notice.includes('Confirm') && (
              <button
                onClick={() => {
                  setSuccess(false)
                  setTab('login')
                  setForm(prev => ({ ...prev, password: '', confirm: '' }))
                }}
                className='mt-5 rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-sm font-bold text-white'
              >
                Go to login
              </button>
            )}
          </div>
        ) : (
          <div className='px-7 py-6'>
            <div className='mb-6 flex gap-1.5 rounded-xl bg-[var(--color-accent-faint)] p-1'>
              {['login', 'signup'].map(item => (
                <button
                  key={item}
                  onClick={() => {
                    setTab(item)
                    setErrors({})
                  }}
                  className={`flex-1 rounded-lg py-2 text-sm font-bold transition ${
                    tab === item
                      ? 'bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm'
                      : 'text-[var(--color-text-muted)]'
                  }`}
                >
                  {item === 'login' ? 'Log in' : 'Sign up'}
                </button>
              ))}
            </div>

            <div className='space-y-3'>
              {tab === 'signup' && (
                <Input
                  icon={Person}
                  placeholder='Full name'
                  value={form.name}
                  onChange={set('name')}
                  error={errors.name}
                />
              )}
              <Input
                icon={EnvelopeOpen}
                type='email'
                placeholder='Email address'
                value={form.email}
                onChange={set('email')}
                error={errors.email}
              />
              <Input
                icon={Lock}
                type={showPass ? 'text' : 'password'}
                placeholder='Password'
                value={form.password}
                onChange={set('password')}
                error={errors.password}
                rightSlot={
                  <button type='button' onClick={() => setShowPass(prev => !prev)} className='text-[var(--color-text-muted)]'>
                    {showPass ? <EyeSlash className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                  </button>
                }
              />
              {tab === 'signup' && (
                <Input
                  icon={Lock}
                  type={showConf ? 'text' : 'password'}
                  placeholder='Confirm password'
                  value={form.confirm}
                  onChange={set('confirm')}
                  error={errors.confirm}
                  rightSlot={
                    <button type='button' onClick={() => setShowConf(prev => !prev)} className='text-[var(--color-text-muted)]'>
                      {showConf ? <EyeSlash className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                    </button>
                  }
                />
              )}
            </div>

            {errors.submit && (
              <div className='mt-4 flex items-start gap-2 rounded-xl border border-[var(--color-danger)] bg-[var(--color-danger-faint)] px-3 py-2 text-xs text-[var(--color-danger)]'>
                <CircleExclamation className='mt-0.5 h-4 w-4 shrink-0' />
                <span>{errors.submit}</span>
              </div>
            )}

            <button
              onClick={submit}
              disabled={loading}
              className='mt-5 flex w-full items-center justify-center rounded-full bg-[var(--color-primary)] py-3 text-sm font-extrabold text-white transition hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60'
            >
              {loading ? 'Please wait...' : tab === 'login' ? 'Log in' : 'Create account'}
            </button>

            <p className='mt-4 text-center text-xs text-[var(--color-text-muted)]'>
              {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => {
                  setTab(tab === 'login' ? 'signup' : 'login')
                  setErrors({})
                }}
                className='font-bold text-[var(--color-primary)]'
              >
                {tab === 'login' ? 'Sign up free' : 'Log in'}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const pendingRef = useRef(null)

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setUser(toPublicUser(data.session?.user))
      setAuthLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(toPublicUser(session?.user))
      setAuthLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const runPending = useCallback(() => {
    if (!pendingRef.current) return
    setTimeout(() => {
      pendingRef.current?.()
      pendingRef.current = null
    }, 250)
  }, [])

  const openAuth = useCallback((onSuccessCb) => {
    if (onSuccessCb) pendingRef.current = onSuccessCb
    setModalOpen(true)
  }, [])

  const closeAuth = useCallback(() => setModalOpen(false), [])

  const login = useCallback((authUser) => {
    setUser(toPublicUser(authUser))
    setModalOpen(false)
    runPending()
  }, [runPending])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  // Keep a queryable profile mirror in public.users so the admin side can list
  // students without touching the protected auth.users table. Passwords are NOT
  // stored here — Supabase Auth hashes and keeps them in auth.users.
  const syncProfileRow = useCallback(async (authUser) => {
    if (!authUser) return
    const meta = authUser.user_metadata || {}
    try {
      await supabase.from('users').upsert({
        id: authUser.id,
        name: meta.name || meta.full_name || authUser.email?.split('@')[0] || 'Student',
        email: authUser.email || null,
        phone: meta.phone || null,
        avatar_url: meta.avatar_url || null,
        role: meta.role || 'student',
        current_level: meta.current_level || meta.level || 'A1',
      }, { onConflict: 'id' })
    } catch (err) {
      // The profile mirror is best-effort; auth metadata remains the source of truth.
      console.error('[Supabase] users profile sync:', err.message)
    }
  }, [])

  // Upload a profile picture to the `avatars` storage bucket and return its URL.
  const uploadAvatar = useCallback(async (file) => {
    if (!file || !user?.id) return null
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
    const path = `${user.id}/avatar-${Date.now()}.${ext}`

    const { error } = await supabase.storage.from('pdp').upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    })
    if (error) throw error

    const { data } = supabase.storage.from('pdp').getPublicUrl(path)
    return data?.publicUrl || null
  }, [user])

  // Update name / phone / avatar_url. Writes to auth metadata + profile mirror.
  const updateProfile = useCallback(async ({ name, phone, avatarUrl }) => {
    const data = {
      ...(name !== undefined ? { name } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(avatarUrl !== undefined ? { avatar_url: avatarUrl } : {}),
    }

    const { data: result, error } = await supabase.auth.updateUser({ data })
    if (error) throw error

    const publicUser = toPublicUser(result.user)
    setUser(publicUser)
    await syncProfileRow(result.user)
    return publicUser
  }, [syncProfileRow])

  // Change password. Supabase re-hashes and stores it in auth.users. When a
  // current password is supplied we re-verify it first to prevent session hijack.
  const updatePassword = useCallback(async ({ currentPassword, newPassword }) => {
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters')
    }
    if (currentPassword && user?.email) {
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      })
      if (verifyError) throw new Error('Current password is incorrect')
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
    return true
  }, [user])

  const value = useMemo(() => ({
    user,
    authLoading,
    openAuth,
    closeAuth,
    login,
    logout,
    isLoggedIn: !!user,
    uploadAvatar,
    updateProfile,
    updatePassword,
  }), [authLoading, closeAuth, login, logout, openAuth, user, uploadAvatar, updateProfile, updatePassword])

  return (
    <AuthContext.Provider value={value}>
      {children}
      {modalOpen && <AuthModal onClose={closeAuth} onSuccess={login} />}
    </AuthContext.Provider>
  )
}

export default AuthContext
