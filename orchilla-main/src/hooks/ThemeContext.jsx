import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const ThemeContext = createContext(null)

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'light'

  const stored = localStorage.getItem('orchilla_theme')
  if (stored === 'light' || stored === 'dark') return stored

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.style.colorScheme = theme
    localStorage.setItem('orchilla_theme', theme)
  }, [theme])

  const value = useMemo(() => ({
    theme,
    isDark: theme === 'dark',
    setTheme,
    toggleTheme: () => setTheme(t => (t === 'dark' ? 'light' : 'dark')),
  }), [theme])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}
