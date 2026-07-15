import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Xmark } from '@gravity-ui/icons'

// Reusable centered modal. `size` controls max width; `footer` renders a sticky
// action bar. Closes on Escape and backdrop click.
const SIZES = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl' }

const AdminModal = ({ open, onClose, title, subtitle, children, footer, size = 'md' }) => {
  useEffect(() => {
    if (!open) return
    const handler = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[1000] flex items-start justify-center overflow-y-auto bg-black/55 px-4 py-8 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${SIZES[size]} my-auto animate-fade-in overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-[var(--color-text)]">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-[var(--color-text-muted)]">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)] transition hover:bg-[var(--color-accent-faint)] hover:text-[var(--color-accent)]"
          >
            <Xmark className="h-4 w-4" />
          </button>
        </div>

        <div className="admin-scroll max-h-[65vh] overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-[var(--color-border)] bg-[var(--color-panel)] px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}

export default AdminModal
