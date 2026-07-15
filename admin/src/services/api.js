import { supabase } from '../lib/supabase'

// ─────────────────────────────────────────────────────────────────────────────
// Data access layer — talks to Supabase.
//
// Column names throughout the app match the recommended schema
// (see database/schema.sql), so these generic helpers are all the pages need.
// ─────────────────────────────────────────────────────────────────────────────

// Every table the admin dashboard reads on boot.
export const TABLES = [
  'users', 'languages', 'courses', 'course_applications', 'payment_receipts',
  'enrollments', 'lessons', 'lesson_access', 'assignments', 'assignment_releases',
  'assignment_submissions', 'course_tests', 'course_test_questions', 'course_test_options',
  'course_test_releases', 'course_test_attempts', 'course_test_answers', 'books',
  'book_orders', 'book_payment_receipts', 'posts', 'post_likes', 'post_comments',
  'course_reviews', 'notifications', 'offers',
]

// Strip undefined so we never send phantom columns to PostgREST.
const clean = (payload) =>
  Object.fromEntries(Object.entries(payload).filter(([, v]) => v !== undefined))

export const api = {
  // Read every table in parallel. A failing table (missing / RLS) yields [] and
  // a console warning rather than blocking the whole dashboard.
  async loadAll() {
    const entries = await Promise.all(
      TABLES.map(async (table) => {
        const { data, error } = await supabase.from(table).select('*')
        if (error) {
          console.warn(`[Supabase] ${table}: ${error.message}`)
          return [table, []]
        }
        return [table, data || []]
      }),
    )
    return Object.fromEntries(entries)
  },

  async list(table) {
    const { data, error } = await supabase.from(table).select('*')
    if (error) throw error
    return data || []
  },

  async create(table, payload) {
    const { data, error } = await supabase.from(table).insert(clean(payload)).select().single()
    if (error) throw error
    return data
  },

  async update(table, id, patch) {
    const { data, error } = await supabase.from(table).update(clean(patch)).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  async remove(table, id) {
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) throw error
    return true
  },
}

export default api
