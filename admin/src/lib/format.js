// Small shared formatting helpers.

export const formatDate = (value) => {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export const formatDateTime = (value) => {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export const timeAgo = (value) => {
  if (!value) return ''
  const diff = Date.now() - new Date(value).getTime()
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return `${days}d ago`
}

// Algerian dinar. e.g. 12000 -> "12,000 DA"
export const money = (amount) => {
  const n = Number(amount || 0)
  return `${n.toLocaleString('en-US')} DA`
}

export const titleCase = (value = '') =>
  String(value).replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())

export const initials = (name = '', email = '') => {
  const source = (name || '').trim() || (email || '').split('@')[0] || '?'
  return source.split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase()
}
