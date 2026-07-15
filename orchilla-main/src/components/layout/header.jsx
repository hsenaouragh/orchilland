import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown, Person, Moon, Sun, Bars, Xmark } from '@gravity-ui/icons'
import Profile from '../../pages/profile'
import logo from '../../assets/orchillaland.png'
import { useAuth } from '../../hooks/AuthContext'
import { useTheme } from '../../hooks/ThemeContext'

const NAV_LINKS = [
  ['courses', '/courses'],
  ['offers', '/offers'],
  ['books', '/books'],
  ['posts', '/posts'],
  ['placement Tests', '/placement-test'],
]

// ─── Brand palette ────────────────────────────────────────────────────────────
const C = {
  orange:      'var(--color-accent)',
  maroon:      'var(--color-primary)',
  maroonHov:   'var(--color-primary-hover)',
  brown:       'var(--color-text-body)',
  white:       'var(--color-surface)',
  border:      'var(--color-border)',
  text:        'var(--color-text)',
  textMuted:   'var(--color-text-muted)',
  orangeFaint: 'var(--color-accent-faint)',
}

const tint = (color, amount) => `color-mix(in srgb, ${color} ${amount}%, transparent)`

// ─── Header ───────────────────────────────────────────────────────────────────
const Header = () => {
  const { user, isLoggedIn, openAuth } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()

  const [profileOpen, setProfileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const profileRef   = useRef(null)

  // Close the mobile menu whenever the route changes.
  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close profile dropdown whenever user logs out
  useEffect(() => {
    if (!isLoggedIn) setProfileOpen(false)
  }, [isLoggedIn])

  // Inject dropdown animation once
  useEffect(() => {
    if (document.getElementById('header-anim')) return
    const s = document.createElement('style')
    s.id = 'header-anim'
    s.textContent = `@keyframes dropIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`
    document.head.appendChild(s)
  }, [])

  // Derive display values from live user
  const displayName   = user?.name   || ''
  const displayAvatar = user?.avatar || displayName.slice(0, 2).toUpperCase()
  const displayAvatarUrl = user?.avatarUrl || null

  return (
    <div
      className='relative text-xl flex justify-between items-center gap-2 m-4 bg-white dark:bg-slate-900 p-4 rounded-full border border-transparent dark:border-slate-700 text-[var(--color-text)]'
      style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}
    >

      {/* Logo */}
      <Link to='/' style={{ display: 'flex', alignItems: 'center' }}>
        <img
          src={logo}
          alt='OrchillaLand'
          style={{ height: 40, width: 'auto', display: 'block' }}
        />
      </Link>

      {/* Navigation — desktop */}
      <ul
        className='hidden xl:flex items-center gap-12 font-semibold text-base'
        style={{ margin: 0, padding: 0, listStyle: 'none' }}
      >
        {NAV_LINKS.map(([label, to]) => (
          <li key={to}><Link to={to}>{label}</Link></li>
        ))}
      </ul>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className='xl:hidden absolute left-0 right-0 top-full mt-3 rounded-3xl bg-white dark:bg-slate-900 border border-[var(--color-border)] p-2 z-50' style={{ boxShadow: '0 16px 40px rgba(0,0,0,0.14)' }}>
          {NAV_LINKS.map(([label, to]) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className='block px-4 py-3 rounded-2xl text-base font-semibold text-[var(--color-text)] hover:bg-[var(--color-accent-faint)] transition-colors'
            >
              {label}
            </Link>
          ))}
        </div>
      )}


      {/* Right actions */}
      <div className='flex items-center gap-3'>

        {/* Hamburger — only below xl */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          aria-label='Toggle menu'
          className='xl:hidden w-10 h-10 rounded-full border flex items-center justify-center'
          style={{ borderColor: C.border, background: C.white, color: C.textMuted }}
        >
          {menuOpen ? <Xmark style={{ width: 18, height: 18 }} /> : <Bars style={{ width: 18, height: 18 }} />}
        </button>

        <button
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className='w-10 h-10 rounded-full border transition-all duration-200 flex items-center justify-center'
          style={{
            borderColor: C.border,
            background: C.white,
            color: C.textMuted,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = C.orangeFaint
            e.currentTarget.style.borderColor = C.orange
            e.currentTarget.style.color = C.orange
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = C.white
            e.currentTarget.style.borderColor = C.border
            e.currentTarget.style.color = C.textMuted
          }}
        >
          {theme === 'dark'
            ? <Sun style={{ width: 17, height: 17 }} />
            : <Moon style={{ width: 17, height: 17 }} />
          }
        </button>

        {/* ── LOGGED IN: profile trigger + dropdown ── */}
        {isLoggedIn ? (
          <div ref={profileRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setProfileOpen(o => !o)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 14px 6px 6px', borderRadius: 50,
                border: `1.5px solid ${profileOpen ? C.maroon : C.border}`,
                background: profileOpen ? tint(C.maroon, 4) : C.white,
                cursor: 'pointer', transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                if (!profileOpen) {
                  e.currentTarget.style.borderColor = C.orange
                  e.currentTarget.style.background = C.orangeFaint
                }
              }}
              onMouseLeave={e => {
                if (!profileOpen) {
                  e.currentTarget.style.borderColor = C.border
                  e.currentTarget.style.background = C.white
                }
              }}
            >
              {/* Avatar image or initials */}
              <div style={{
                width: 30, height: 30, borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
                background: `linear-gradient(135deg, ${C.maroon}, ${tint(C.maroon, 80)})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 800, color: C.white,
              }}>
                {displayAvatarUrl
                  ? <img src={displayAvatarUrl} alt='' style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : displayAvatar}
              </div>

              {/* First name — large screens only */}
              <span
                className='hidden lg:block'
                style={{
                  fontSize: 13, fontWeight: 700, color: C.text,
                  maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}
              >
                {displayName.split(' ')[0]}
              </span>

              <ChevronDown style={{
                width: 14, height: 14, color: C.textMuted,
                transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }} />
            </button>

            {/* Profile dropdown — imported from profile.jsx */}
            {profileOpen && (
              <Profile onClose={() => setProfileOpen(false)} />
            )}
          </div>

        ) : (
          /* ── LOGGED OUT: Log in button ── */
          <button
            onClick={() => openAuth()}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '9px 20px', borderRadius: 50, border: 'none',
              background: C.maroon, color: C.white,
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              boxShadow: `0 3px 14px ${tint(C.maroon, 22)}`,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = C.maroonHov; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = C.maroon; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <Person style={{ width: 15, height: 15 }} />
            Log in
          </button>
        )}

      </div>
    </div>
  )
}

export default Header
