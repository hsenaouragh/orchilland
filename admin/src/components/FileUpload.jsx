import { useRef, useState } from 'react'
import { ArrowUpFromLine, File as FileIcon, Xmark, CircleExclamation } from '@gravity-ui/icons'
import { uploadFile } from '../lib/storage'

// ─────────────────────────────────────────────────────────────────────────────
// Reusable "upload straight from your laptop" control.
//
//   value    current URL (edit mode)
//   folder   storage subfolder (courses / books / lessons / assignments / posts)
//   image    render a picture preview vs. a file chip
//   onChange (url, meta) called after a successful upload
// ─────────────────────────────────────────────────────────────────────────────
const FileUpload = ({ value, folder, bucket, image = false, accept, onChange, label, hint }) => {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')

  const pick = () => inputRef.current?.click()

  const handle = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      // bucket is optional; uploadFile falls back to the default when undefined.
      const result = bucket ? await uploadFile(folder, file, bucket) : await uploadFile(folder, file)
      setName(result?.name || file.name)
      onChange?.(result?.url || null, result)
    } catch (err) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const clear = () => { setName(''); onChange?.(null, null) }

  return (
    <div>
      {label && <span className="mb-1.5 block text-sm font-semibold text-[var(--color-text-body)]">{label}</span>}

      <input
        ref={inputRef}
        type="file"
        accept={accept || (image ? 'image/*' : undefined)}
        onChange={handle}
        className="hidden"
      />

      {image ? (
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)]">
            {value
              ? <img src={value} alt="" className="h-full w-full object-cover" />
              : <FileIcon style={{ width: 22, height: 22, color: 'var(--color-text-faint)' }} />}
          </div>
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={pick}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2 text-sm font-semibold text-[var(--color-text-body)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:opacity-50"
            >
              <ArrowUpFromLine style={{ width: 15, height: 15 }} />
              {uploading ? 'Uploading…' : value ? 'Replace image' : 'Upload image'}
            </button>
            {value && !uploading && (
              <button type="button" onClick={clear} className="ml-2 text-xs font-semibold text-[var(--color-danger)]">Remove</button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={pick}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2 text-sm font-semibold text-[var(--color-text-body)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:opacity-50"
          >
            <ArrowUpFromLine style={{ width: 15, height: 15 }} />
            {uploading ? 'Uploading…' : value ? 'Replace file' : 'Upload file'}
          </button>
          {(name || value) && !uploading && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-panel)] px-3 py-1.5 text-xs text-[var(--color-text-muted)]">
              <FileIcon style={{ width: 13, height: 13 }} />
              <span className="max-w-40 truncate">{name || value.split('/').pop()}</span>
              <button type="button" onClick={clear} className="text-[var(--color-danger)]"><Xmark style={{ width: 12, height: 12 }} /></button>
            </span>
          )}
        </div>
      )}

      {hint && !error && <span className="mt-1.5 block text-xs text-[var(--color-text-faint)]">{hint}</span>}
      {error && (
        <span className="mt-1.5 flex items-center gap-1 text-xs text-[var(--color-danger)]">
          <CircleExclamation style={{ width: 13, height: 13 }} /> {error}
        </span>
      )}
    </div>
  )
}

export default FileUpload
