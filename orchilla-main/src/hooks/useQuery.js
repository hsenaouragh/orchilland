import { useCallback, useEffect, useRef, useState } from 'react'

// Minimal per-page data hook: runs `fetcher` on mount (and when `deps` change),
// exposing { data, loading, error, reload, setData }. Replaces the old global
// AppDataContext — every page owns its own fetch.
export const useQuery = (fetcher, deps = [], initial = null) => {
  const [data, setData] = useState(initial)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const activeRef = useRef(true)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(fetcher, deps)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await run()
      if (activeRef.current) { setData(result); setError('') }
    } catch (err) {
      if (activeRef.current) setError(err?.message || 'Failed to load')
    } finally {
      if (activeRef.current) setLoading(false)
    }
  }, [run])

  useEffect(() => {
    activeRef.current = true
    load()
    return () => { activeRef.current = false }
  }, [load])

  return { data, loading, error, reload: load, setData }
}
