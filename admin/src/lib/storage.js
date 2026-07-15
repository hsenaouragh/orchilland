import { supabase } from './supabase'

// ─────────────────────────────────────────────────────────────────────────────
// Direct-from-laptop uploads to Supabase Storage.
//
// The admin picks a file on their machine; we upload it to the `uploads` bucket
// and return a public URL to store on the row. Create a PUBLIC bucket named
// `uploads` in your Supabase project (see database/schema.sql for the SQL).
// ─────────────────────────────────────────────────────────────────────────────

// Storage bucket. Covers (and, by default, all admin uploads) live in `COVER`.
export const BUCKET = 'COVER'

const safeName = (name = 'file') =>
  name.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/^-+|-+$/g, '') || 'file'

// folder groups uploads, e.g. 'courses', 'books', 'lessons', 'assignments', 'posts'.
// bucket can be overridden per call if you later split files across buckets.
export const uploadFile = async (folder, file, bucket = BUCKET) => {
  if (!file) return null
  const path = `${folder}/${Date.now()}-${safeName(file.name)}`

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return { url: data?.publicUrl || null, name: file.name, path }
}

export default uploadFile
