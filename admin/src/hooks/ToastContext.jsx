import { createContext, useCallback, useContext, useState } from 'react'
import { createPortal } from 'react-dom'

const ToastContext = createContext(null)

const makeId = () => (crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()))

const TYPE_COLOR = {
  payment: '#E85D26',
  enrollment: '#1D9E75',
  assignment: '#378ADD',
  test: '#8B5CF6',
  lesson: '#0EA5E9',
  account: '#6366F1',
  post: '#E1306C',
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), [])

  const toast = useCallback(({ title, message, type }) => {
    const id = makeId()
    setToasts((list) => [...list, { id, title, message, type }])
    setTimeout(() => dismiss(id), 5000)
  }, [dismiss])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {createPortal(
        <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 'calc(100vw - 32px)' }}>
          {toasts.map((t) => {
            const color = TYPE_COLOR[t.type] || 'var(--color-primary)'
            return (
              <div
                key={t.id}
                onClick={() => dismiss(t.id)}
                className="animate-fade-in"
                style={{
                  width: 320, maxWidth: '100%', cursor: 'pointer',
                  background: 'var(--color-surface)', color: 'var(--color-text)',
                  border: '1px solid var(--color-border)', borderLeft: `4px solid ${color}`,
                  borderRadius: 14, padding: '12px 14px',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.16)',
                }}
              >
                <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>{t.title}</p>
                {t.message && <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '4px 0 0' }}>{t.message}</p>}
              </div>
            )
          })}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  return ctx || { toast: () => {} }
}
