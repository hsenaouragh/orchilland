import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Person, Lock, Camera, Check, CircleExclamation } from '@gravity-ui/icons'
import { useAuth } from '../hooks/AuthContext'

const Field = ({ label, children, hint }) => (
  <label className='block space-y-1.5'>
    <span className='text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]'>{label}</span>
    {children}
    {hint && <span className='block text-xs text-[var(--color-text-faint)]'>{hint}</span>}
  </label>
)

const inputClass =
  'w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-accent)]'

const Banner = ({ tone, children }) => {
  if (!children) return null
  const ok = tone === 'success'
  return (
    <div
      className={`flex items-start gap-2 rounded-xl border px-3.5 py-2.5 text-xs ${
        ok
          ? 'border-[var(--color-green)] bg-[var(--color-green-faint)] text-[var(--color-green)]'
          : 'border-[var(--color-danger)] bg-[var(--color-danger-faint)] text-[var(--color-danger)]'
      }`}
    >
      {ok ? <Check className='mt-0.5 h-4 w-4 shrink-0' /> : <CircleExclamation className='mt-0.5 h-4 w-4 shrink-0' />}
      <span>{children}</span>
    </div>
  )
}

const ProfileSettings = () => {
  const navigate = useNavigate()
  const { user, openAuth, uploadAvatar, updateProfile, updatePassword } = useAuth()

  const fileRef = useRef(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)

  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMsg, setProfileMsg] = useState({ tone: '', text: '' })

  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' })
  const [savingPwd, setSavingPwd] = useState(false)
  const [pwdMsg, setPwdMsg] = useState({ tone: '', text: '' })

  useEffect(() => {
    if (!user) return
    setName(user.name || '')
    setPhone(user.phone || '')
    setAvatarPreview(user.avatarUrl || null)
  }, [user])

  if (!user) {
    return (
      <main className='mx-auto max-w-md px-4 py-24 text-center'>
        <h1 className='text-2xl font-bold text-[var(--color-text)]'>Log in required</h1>
        <p className='mb-6 mt-2 text-[var(--color-text-muted)]'>Log in to manage your profile and password.</p>
        <button onClick={() => openAuth()} className='rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-white'>
          Log in
        </button>
      </main>
    )
  }

  const pickAvatar = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setProfileMsg({ tone: 'error', text: 'Please choose an image file.' })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setProfileMsg({ tone: 'error', text: 'Image must be smaller than 5MB.' })
      return
    }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
    setProfileMsg({ tone: '', text: '' })
  }

  const saveProfile = async () => {
    setSavingProfile(true)
    setProfileMsg({ tone: '', text: '' })
    try {
      let avatarUrl
      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile)
      }
      await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        ...(avatarUrl ? { avatarUrl } : {}),
      })
      setAvatarFile(null)
      setProfileMsg({ tone: 'success', text: 'Profile updated.' })
    } catch (err) {
      setProfileMsg({ tone: 'error', text: err.message || 'Could not update profile.' })
    } finally {
      setSavingProfile(false)
    }
  }

  const savePassword = async () => {
    setPwdMsg({ tone: '', text: '' })
    if (pwd.next.length < 6) {
      setPwdMsg({ tone: 'error', text: 'New password must be at least 6 characters.' })
      return
    }
    if (pwd.next !== pwd.confirm) {
      setPwdMsg({ tone: 'error', text: 'Passwords do not match.' })
      return
    }
    setSavingPwd(true)
    try {
      await updatePassword({ currentPassword: pwd.current, newPassword: pwd.next })
      setPwd({ current: '', next: '', confirm: '' })
      setPwdMsg({ tone: 'success', text: 'Password changed.' })
    } catch (err) {
      setPwdMsg({ tone: 'error', text: err.message || 'Could not change password.' })
    } finally {
      setSavingPwd(false)
    }
  }

  return (
    <main className='mx-auto max-w-2xl px-4 py-10 sm:py-14'>
      <button onClick={() => navigate(-1)} className='mb-6 text-sm font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)]'>
        ← Back
      </button>
      <h1 className='text-2xl font-black text-[var(--color-text)]'>Profile settings</h1>
      <p className='mt-1 text-sm text-[var(--color-text-muted)]'>Update your details, profile picture, and password.</p>

      {/* ── Profile card ── */}
      <section className='mt-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6'>
        <div className='mb-5 flex items-center gap-2 text-sm font-bold text-[var(--color-text)]'>
          <Person className='h-4 w-4' /> Account details
        </div>

        <div className='mb-6 flex items-center gap-4'>
          <div className='relative'>
            {avatarPreview ? (
              <img src={avatarPreview} alt='Avatar' className='h-20 w-20 rounded-full object-cover' />
            ) : (
              <div className='flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-primary)] text-xl font-black text-white'>
                {user.avatar}
              </div>
            )}
            <button
              type='button'
              onClick={() => fileRef.current?.click()}
              className='absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--color-surface)] bg-[var(--color-accent)] text-white'
              aria-label='Change profile picture'
            >
              <Camera className='h-4 w-4' />
            </button>
            <input ref={fileRef} type='file' accept='image/*' className='hidden' onChange={pickAvatar} />
          </div>
          <div>
            <p className='text-sm font-semibold text-[var(--color-text)]'>Profile picture</p>
            <p className='text-xs text-[var(--color-text-muted)]'>JPG or PNG, up to 5MB.</p>
          </div>
        </div>

        <div className='space-y-4'>
          <Field label='Full name'>
            <input className={inputClass} value={name} onChange={e => setName(e.target.value)} placeholder='Your name' />
          </Field>
          <Field label='Email' hint='Email is managed through your login and cannot be changed here.'>
            <input className={`${inputClass} opacity-60`} value={user.email} disabled />
          </Field>
          <Field label='Phone number'>
            <input className={inputClass} value={phone} onChange={e => setPhone(e.target.value)} placeholder='e.g. +1 555 123 4567' />
          </Field>
        </div>

        <div className='mt-5'>
          <Banner tone={profileMsg.tone}>{profileMsg.text}</Banner>
        </div>

        <button
          onClick={saveProfile}
          disabled={savingProfile}
          className='mt-5 rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-white transition hover:bg-[var(--color-primary-hover)] disabled:opacity-60'
        >
          {savingProfile ? 'Saving...' : 'Save changes'}
        </button>
      </section>

      {/* ── Password card ── */}
      <section className='mt-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6'>
        <div className='mb-5 flex items-center gap-2 text-sm font-bold text-[var(--color-text)]'>
          <Lock className='h-4 w-4' /> Change password
        </div>

        <div className='space-y-4'>
          <Field label='Current password'>
            <input
              type='password'
              className={inputClass}
              value={pwd.current}
              onChange={e => setPwd(p => ({ ...p, current: e.target.value }))}
              placeholder='Enter current password'
            />
          </Field>
          <Field label='New password'>
            <input
              type='password'
              className={inputClass}
              value={pwd.next}
              onChange={e => setPwd(p => ({ ...p, next: e.target.value }))}
              placeholder='At least 6 characters'
            />
          </Field>
          <Field label='Confirm new password'>
            <input
              type='password'
              className={inputClass}
              value={pwd.confirm}
              onChange={e => setPwd(p => ({ ...p, confirm: e.target.value }))}
              placeholder='Re-enter new password'
            />
          </Field>
        </div>

        <div className='mt-5'>
          <Banner tone={pwdMsg.tone}>{pwdMsg.text}</Banner>
        </div>

        <button
          onClick={savePassword}
          disabled={savingPwd}
          className='mt-5 rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-white transition hover:bg-[var(--color-primary-hover)] disabled:opacity-60'
        >
          {savingPwd ? 'Updating...' : 'Update password'}
        </button>
      </section>
    </main>
  )
}

export default ProfileSettings
