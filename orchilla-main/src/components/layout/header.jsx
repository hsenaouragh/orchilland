import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, Person, Moon, Sun, Bars, Xmark, Magnifier, Globe } from '@gravity-ui/icons'
import Profile from '../../pages/profile'
import logo from '../../assets/orchillaland.png'
import { useAuth } from '../../hooks/AuthContext'
import { useTheme } from '../../hooks/ThemeContext'

const NAV_LINKS = [
  { label: 'Courses', to: '/courses' },
  { label: 'Offers', to: '/offers' },
  { label: 'Books', to: '/books' },
  { label: 'About', to: '/#why-choose' },
]


const LANGUAGES_LIST = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'ar', label: 'العربية', flag: '🇩🇿' },
]

const Header = () => {
  const { user, isLoggedIn, openAuth } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()

  const [profileOpen, setProfileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [selectedLang, setSelectedLang] = useState('English')
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const profileRef = useRef(null)
  const langRef = useRef(null)
  const searchInputRef = useRef(null)

  // Close menus on route change
  useEffect(() => {
    setMenuOpen(false)
    setLangOpen(false)
    setSearchOpen(false)
  }, [location.pathname])

  // Close dropdowns on click outside
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (!isLoggedIn) setProfileOpen(false)
  }, [isLoggedIn])

  // Focus search input when modal opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchOpen])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/courses?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  // Derive display values from live user
  const displayName = user?.name || ''
  const displayAvatar = user?.avatar || displayName.slice(0, 2).toUpperCase()
  const displayAvatarUrl = user?.avatarUrl || null

  return (
    <>
      <header className='sticky top-3 z-40 px-4 max-w-7xl mx-auto'>
        <div
          className='flex items-center justify-between gap-4 px-5 py-3 rounded-full bg-white/95 dark:bg-[#3D2020]/95 backdrop-blur-md border border-[var(--color-border)] text-[var(--color-text)] transition-all duration-300'
          style={{ boxShadow: '0 4px 20px rgba(78, 0, 0, 0.06)' }}
        >
          {/* ── Brand Logo ── */}
          <Link to='/' className='flex items-center gap-2 group shrink-0'>
            <img
              src={logo}
              alt='OrchillaLand'
              className='h-9 w-auto object-contain transition-transform duration-200 group-hover:scale-105'
            />
          </Link>

          {/* ── Desktop Navigation ── */}
          <nav className='hidden lg:flex items-center gap-8 text-[14.5px] font-semibold text-[var(--color-text-body)]'>
            {NAV_LINKS.map(({ label, to }) => {
              const isAnchor = to.includes('#')
              return isAnchor ? (
                <a
                  key={to}
                  href={to}
                  className='hover:text-[var(--color-primary)] dark:hover:text-[var(--color-accent)] transition-colors'
                >
                  {label}
                </a>
              ) : (
                <Link
                  key={to}
                  to={to}
                  className={`transition-colors ${
                    location.pathname === to
                      ? 'text-[var(--color-primary)] dark:text-[var(--color-accent)] font-bold'
                      : 'hover:text-[var(--color-primary)] dark:hover:text-[var(--color-accent)]'
                  }`}
                >
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* ── Right Actions ── */}
          <div className='flex items-center gap-2.5'>
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className='w-9 h-9 rounded-full flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-accent-faint)] transition-colors'
            >
              {theme === 'dark' ? <Sun style={{ width: 17, height: 17 }} /> : <Moon style={{ width: 17, height: 17 }} />}
            </button>

            {/* ── My Account / Login CTA ── */}
            {isLoggedIn ? (
              <div ref={profileRef} className='relative'>
                <button
                  onClick={() => setProfileOpen(o => !o)}
                  className='flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors'
                  style={{ background: 'var(--color-surface)' }}
                >
                  <div className='w-7 h-7 rounded-full overflow-hidden flex items-center justify-center bg-[var(--color-primary)] text-white text-xs font-bold'>
                    {displayAvatarUrl ? (
                      <img src={displayAvatarUrl} alt='' className='w-full h-full object-cover' />
                    ) : (
                      displayAvatar
                    )}
                  </div>
                  <span className='hidden sm:inline text-xs font-semibold text-[var(--color-text)] max-w-[80px] truncate'>
                    {displayName.split(' ')[0]}
                  </span>
                  <ChevronDown style={{ width: 12, height: 12, color: 'var(--color-text-muted)' }} />
                </button>

                {profileOpen && <Profile onClose={() => setProfileOpen(false)} />}
              </div>
            ) : (
              <button
                onClick={() => openAuth()}
                className='flex items-center gap-1.5 px-5 py-2 rounded-full font-bold text-xs text-white transition-all duration-200 cursor-pointer'
                style={{
                  backgroundColor: 'var(--color-primary)',
                  boxShadow: '0 3px 12px rgba(78, 0, 0, 0.25)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'var(--color-primary)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <Person style={{ width: 14, height: 14 }} />
                <span>My Account</span>
              </button>
            )}

            {/* Hamburger Button (Mobile) */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-label='Toggle navigation menu'
              className='lg:hidden w-9 h-9 rounded-full border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-body)]'
            >
              {menuOpen ? <Xmark style={{ width: 17, height: 17 }} /> : <Bars style={{ width: 17, height: 17 }} />}
            </button>
          </div>
        </div>

        {/* ── Mobile Menu Dropdown ── */}
        {menuOpen && (
          <div
            className='lg:hidden absolute left-4 right-4 top-full mt-2 rounded-3xl bg-white dark:bg-[#3D2020] border border-[var(--color-border)] p-4 shadow-2xl z-50 animate-fade-in'
          >
            <div className='flex flex-col gap-1 pb-3 border-b border-[var(--color-border)]'>
              {NAV_LINKS.map(({ label, to }) => {
                const isAnchor = to.includes('#')
                return isAnchor ? (
                  <a
                    key={to}
                    href={to}
                    onClick={() => setMenuOpen(false)}
                    className='px-4 py-2.5 rounded-2xl text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-accent-faint)] transition-colors'
                  >
                    {label}
                  </a>
                ) : (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMenuOpen(false)}
                    className='px-4 py-2.5 rounded-2xl text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-accent-faint)] transition-colors'
                  >
                    {label}
                  </Link>
                )
              })}
            </div>

            <div className='flex items-center justify-end pt-3 px-2'>
              <button
                onClick={toggleTheme}
                className='flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-muted)] px-3 py-1.5 rounded-full border border-[var(--color-border)] hover:bg-[var(--color-accent-faint)] transition-colors'
              >
                {theme === 'dark' ? <Sun style={{ width: 13, height: 13 }} /> : <Moon style={{ width: 13, height: 13 }} />}
                <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── Search Modal ── */}
      {searchOpen && (
        <div
          className='fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/40 backdrop-blur-sm'
          onClick={() => setSearchOpen(false)}
        >
          <div
            className='w-full max-w-lg bg-white dark:bg-[#3D2020] rounded-3xl border border-[var(--color-border)] p-5 shadow-2xl animate-fade-up'
            onClick={e => e.stopPropagation()}
          >
            <form onSubmit={handleSearchSubmit} className='flex items-center gap-3'>
              <Magnifier style={{ width: 20, height: 20, color: 'var(--color-accent)' }} />
              <input
                ref={searchInputRef}
                type='text'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder='Search courses by language, title, or level...'
                className='flex-1 bg-transparent border-none outline-none text-base text-[var(--color-text)] placeholder-[var(--color-text-faint)]'
              />
              <button
                type='submit'
                className='px-4 py-2 rounded-full text-xs font-bold text-white'
                style={{ background: 'var(--color-primary)' }}
              >
                Search
              </button>
              <button
                type='button'
                onClick={() => setSearchOpen(false)}
                className='w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-accent-faint)]'
              >
                <Xmark style={{ width: 14, height: 14 }} />
              </button>
            </form>
            <div className='flex flex-wrap gap-2 mt-4 pt-3 border-t border-[var(--color-border)] text-xs text-[var(--color-text-muted)]'>
              <span>Popular searches:</span>
              {['English', 'French', 'Italian', 'Korean', 'Conversation', 'Grammar'].map(term => (
                <button
                  key={term}
                  type='button'
                  onClick={() => {
                    navigate(`/courses?q=${encodeURIComponent(term)}`)
                    setSearchOpen(false)
                  }}
                  className='px-2.5 py-1 rounded-full bg-[var(--color-panel)] hover:bg-[var(--color-accent-faint)] hover:text-[var(--color-primary)] transition-colors'
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Header
