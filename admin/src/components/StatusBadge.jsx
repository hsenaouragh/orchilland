import { titleCase } from '../lib/format'

// Central status → color map. Covers every status used across the tables so
// applications, receipts, lessons, tests, orders and reviews all read alike.
const STYLES = {
  // applications / receipts / orders
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
  pending_payment: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
  pending_approval: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200',
  approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200',
  denied: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200',
  archived: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  locked: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  // enrollments
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200',
  completed: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  suspended: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200',
  // content publishing
  published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200',
  unpublished: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  available: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200',
  not_available: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  // submissions / attempts
  submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200',
  graded: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200',
}

const StatusBadge = ({ status, children }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${STYLES[status] || STYLES.completed}`}>
    {children || titleCase(status || 'unknown')}
  </span>
)

export default StatusBadge
