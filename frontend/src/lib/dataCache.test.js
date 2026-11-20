import { describe, expect, it, vi } from 'vitest'
import { cachedJSON, createMemoryStore } from './dataCache'

const tick = () => new Promise((r) => setTimeout(r, 0))

describe('cachedJSON', () => {
  it('fetches and caches on a miss', async () => {
    const store = createMemoryStore()
    const fetcher = vi.fn().mockResolvedValue({ id: 'light' })
    const result = await cachedJSON('category:light', fetcher, store)
    expect(result).toEqual({ id: 'light' })
    expect(fetcher).toHaveBeenCalledTimes(1)
    await expect(store.get('category:light')).resolves.toEqual({ id: 'light' })
  })

  it('returns the cached value immediately without waiting on the network', async () => {
    const store = createMemoryStore()
    await store.set('categories', ['old'])
    let resolveFetch
    const fetcher = vi.fn(() => new Promise((r) => (resolveFetch = r)))

    const result = await cachedJSON('categories', fetcher, store)
    expect(result).toEqual(['old']) // resolved before the network call ever settles

    resolveFetch(['new'])
    await tick()
    await expect(store.get('categories')).resolves.toEqual(['new']) // cache refreshed for next time
  })

  it('propagates a fetch error on a miss, and never caches it', async () => {
    const store = createMemoryStore()
    const fetcher = vi.fn().mockRejectedValue(new Error('not found'))
    await expect(cachedJSON('category:nope', fetcher, store)).rejects.toThrow('not found')
    await expect(store.get('category:nope')).resolves.toBeUndefined()
  })

  it('swallows a background revalidation failure — the cached value already returned stands', async () => {
    const store = createMemoryStore()
    await store.set('categories', ['cached'])
    const fetcher = vi.fn().mockRejectedValue(new Error('offline'))
    const result = await cachedJSON('categories', fetcher, store)
    expect(result).toEqual(['cached'])
    await tick()
    await expect(store.get('categories')).resolves.toEqual(['cached'])
  })
})
