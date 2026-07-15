import { useState } from 'react'
import { Navigate, useNavigate, useLocation } from 'react-router-dom'
import { Lock, EnvelopeOpen, Eye, EyeSlash, CircleExclamation } from '@gravity-ui/icons'
import { useAdminAuth } from '../hooks/AdminAuthContext'
import { Button } from '../components/ui'

// Admin sign-in. Only role === 'admin' can pass (enforced in AdminAuthContext).
const Login = () => {
  const { signIn, isAdmin } = useAdminAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Where to land after signing in — honor the page the user was sent from.
  const redirectTo = location.state?.from?.pathname || '/'

  // Already signed in? Don't show the form, go straight in.
  if (isAdmin) return <Navigate to={redirectTo} replace />

  const set = (key) => (e) => { setForm((f) => ({ ...f, [key]: e.target.value })); setError('') }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signIn(form)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.message || 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="w-full max-w-[420px] overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl">
        <div className="bg-[var(--color-primary)] px-7 py-8 text-white">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-lg font-black">O</div>
          <h1 className="text-2xl font-black">OrchillaLand Admin</h1>
          <p className="mt-1 text-sm text-white/85">Sign in to manage courses, students, and content.</p>
        </div>

        <form onSubmit={submit} className="space-y-3 px-7 py-7">
          <div className="flex items-center gap-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] px-3.5 py-3">
            <EnvelopeOpen className="h-4 w-4 text-[var(--color-text-muted)]" />
            <input
              type="email" value={form.email} onChange={set('email')} placeholder="Email"
              className="min-w-0 flex-1 bg-transparent text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-faint)]"
            />
          </div>
          <div className="flex items-center gap-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] px-3.5 py-3">
            <Lock className="h-4 w-4 text-[var(--color-text-muted)]" />
            <input
              type={show ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="Password"
              className="min-w-0 flex-1 bg-transparent text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-faint)]"
            />
            <button type="button" onClick={() => setShow((v) => !v)} className="text-[var(--color-text-muted)]">
              {show ? <EyeSlash className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-[var(--color-danger)] bg-[var(--color-danger-faint)] px-3 py-2 text-xs text-[var(--color-danger)]">
              <CircleExclamation className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" size="lg" disabled={loading} className="w-full">
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>

          <p className="pt-1 text-center text-xs text-[var(--color-text-muted)]">
            Sign in with your Supabase admin account.
          </p>
        </form>
      </div>
    </div>
  )
}

export default Login
