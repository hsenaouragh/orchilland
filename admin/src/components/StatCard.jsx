// Operational KPI card used across the dashboard.
// `tone` picks an accent from the Orchilland palette.

const TONES = {
  orange: { fg: 'var(--color-accent)', bg: 'var(--color-accent-faint)' },
  maroon: { fg: 'var(--color-primary)', bg: 'var(--color-primary-soft)' },
  green: { fg: 'var(--color-green)', bg: 'var(--color-green-faint)' },
  danger: { fg: 'var(--color-danger)', bg: 'var(--color-danger-faint)' },
}

const StatCard = ({ label, value, hint, icon: Icon, tone = 'orange', onClick }) => {
  const t = TONES[tone] || TONES.orange
  const Wrapper = onClick ? 'button' : 'div'
  return (
    <Wrapper
      onClick={onClick}
      className={`w-full text-left rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition ${
        onClick ? 'hover:border-[var(--color-accent)] hover:shadow-sm' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-3xl font-bold text-[var(--color-text)] leading-none">{value}</p>
          <p className="mt-2 text-sm font-medium text-[var(--color-text-muted)]">{label}</p>
        </div>
        {Icon && (
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{ background: t.bg, color: t.fg }}
          >
            <Icon style={{ width: 20, height: 20 }} />
          </span>
        )}
      </div>
      {hint && <p className="mt-3 text-xs text-[var(--color-text-faint)]">{hint}</p>}
    </Wrapper>
  )
}

export default StatCard
