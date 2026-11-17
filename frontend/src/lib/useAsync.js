import { useEffect, useState } from 'react'

/** Run an async loader when deps change. Ignores results from stale runs. */
export function useAsync(load, deps) {
  const [state, setState] = useState({ data: null, error: null, loading: true })

  useEffect(() => {
    let cancelled = false
    setState((s) => ({ ...s, loading: true, error: null }))
    load().then(
      (data) => !cancelled && setState({ data, error: null, loading: false }),
      (error) => !cancelled && setState({ data: null, error, loading: false }),
    )
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  const setData = (update) =>
    setState((s) => ({ ...s, data: typeof update === 'function' ? update(s.data) : update }))

  return { ...state, setData }
}
