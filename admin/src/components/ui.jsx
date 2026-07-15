// Small shared UI atoms so every page styles buttons, fields and headers alike.

export const Button = ({ variant = 'primary', size = 'md', icon: Icon, children, className = '', ...props }) => {
  const variants = {
    primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]',
    accent: 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]',
    green: 'bg-[var(--color-green)] text-white hover:bg-[var(--color-green-dark)]',
    danger: 'bg-[var(--color-danger)] text-white hover:opacity-90',
    outline: 'border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-body)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]',
    ghost: 'text-[var(--color-text-muted)] hover:bg-[var(--color-accent-faint)] hover:text-[var(--color-accent)]',
  }
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2.5 text-sm', lg: 'px-5 py-3 text-sm' }
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {Icon && <Icon style={{ width: 16, height: 16 }} />}
      {children}
    </button>
  )
}

export const IconButton = ({ icon: Icon, label, tone = 'muted', ...props }) => {
  const tones = {
    muted: 'text-[var(--color-text-muted)] hover:bg-[var(--color-accent-faint)] hover:text-[var(--color-accent)]',
    green: 'text-[var(--color-green)] hover:bg-[var(--color-green-faint)]',
    danger: 'text-[var(--color-danger)] hover:bg-[var(--color-danger-faint)]',
  }
  return (
    <button
      {...props}
      title={label}
      aria-label={label}
      className={`flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] transition ${tones[tone]}`}
    >
      <Icon style={{ width: 16, height: 16 }} />
    </button>
  )
}

export const Field = ({ label, hint, children }) => (
  <label className="block">
    {label && <span className="mb-1.5 block text-sm font-semibold text-[var(--color-text-body)]">{label}</span>}
    {children}
    {hint && <span className="mt-1 block text-xs text-[var(--color-text-faint)]">{hint}</span>}
  </label>
)

const inputBase =
  'w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] px-3.5 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-accent)] placeholder:text-[var(--color-text-faint)]'

export const Input = (props) => <input {...props} className={`${inputBase} ${props.className || ''}`} />
export const Textarea = (props) => <textarea {...props} className={`${inputBase} min-h-24 resize-y ${props.className || ''}`} />
export const Select = ({ children, ...props }) => (
  <select {...props} className={`${inputBase} ${props.className || ''}`}>{children}</select>
)

export const PageHeader = ({ title, subtitle, actions }) => (
  <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-text)]">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-[var(--color-text-muted)]">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
)

export const Panel = ({ title, actions, children, className = '' }) => (
  <section className={`rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] ${className}`}>
    {(title || actions) && (
      <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] px-5 py-4">
        {title && <h3 className="font-bold text-[var(--color-text)]">{title}</h3>}
        {actions}
      </div>
    )}
    <div className="p-5">{children}</div>
  </section>
)

export const EmptyNote = ({ children }) => (
  <p className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-6 text-center text-sm text-[var(--color-text-muted)]">
    {children}
  </p>
)
