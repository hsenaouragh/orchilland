import { useRef, useState } from 'react'
import { ArrowUpFromLine, Xmark, CircleExclamation } from '@gravity-ui/icons'
import { uploadFile } from '../lib/storage'

// ─────────────────────────────────────────────────────────────────────────────
// Upload one OR many images from the laptop. Holds an array of public URLs.
//
//   value    string[] of URLs
//   folder   storage subfolder
//   bucket   storage bucket (e.g. 'POSTS')
//   onChange (urls[]) called after each add/remove
// ─────────────────────────────────────────────────────────────────────────────
const MultiImageUpload = ({ value = [], folder, bucket, onChange, label, hint }) => {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const pick = () => inputRef.current?.click()

  const handle = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setUploading(true)
    setError('')
    try {
      const results = await Promise.all(
        files.map((file) => (bucket ? uploadFile(folder, file, bucket) : uploadFile(folder, file))),
      )
      const urls = results.map((r) => r?.url).filter(Boolean)
      onChange?.([...value, ...urls])
    } catch (err) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const removeAt = (index) => onChange?.(value.filter((_, i) => i !== index))

  return (
    <div>
      {label && <span className="mb-1.5 block text-sm font-semibold text-[var(--color-text-body)]">{label}</span>}

      <input ref={inputRef} type="file" accept="image/*" multiple onChange={handle} className="hidden" />

      <div className="flex flex-wrap gap-2.5">
        {value.map((url, i) => (
          <div key={url + i} className="relative h-20 w-20 overflow-hidden rounded-xl border border-[var(--color-border)]">
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(i)}
              title="Remove image"
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-[var(--color-danger)]"
            >
              <Xmark style={{ width: 11, height: 11 }} />
            </button>
            {i === 0 && (
              <span className="absolute bottom-0 left-0 right-0 bg-black/55 py-0.5 text-center text-[10px] font-semibold text-white">Cover</span>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={pick}
          disabled={uploading}
          className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-panel)] text-[var(--color-text-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:opacity-50"
        >
          <ArrowUpFromLine style={{ width: 16, height: 16 }} />
          <span className="text-[11px] font-semibold">{uploading ? 'Uploading…' : 'Add'}</span>
        </button>
      </div>

      {hint && !error && <span className="mt-1.5 block text-xs text-[var(--color-text-faint)]">{hint}</span>}
      {error && (
        <span className="mt-1.5 flex items-center gap-1 text-xs text-[var(--color-danger)]">
          <CircleExclamation style={{ width: 13, height: 13 }} /> {error}
        </span>
      )}
    </div>
  )
}

export default MultiImageUpload
