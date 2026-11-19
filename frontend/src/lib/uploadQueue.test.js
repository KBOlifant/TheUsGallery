import { describe, expect, it } from 'vitest'
import { createUploadQueue } from './uploadQueue'

const deferred = () => {
  let resolve, reject
  const promise = new Promise((res, rej) => ((resolve = res), (reject = rej)))
  return { promise, resolve, reject }
}
const tick = () => new Promise((r) => setTimeout(r, 0))
const statuses = (q) => q.getJobs().map((j) => j.status)

describe('createUploadQueue', () => {
  it('runs at most `concurrency` uploads at once and starts the next as each finishes', async () => {
    const pending = []
    const worker = () => {
      const d = deferred()
      pending.push(d)
      return d.promise
    }
    const q = createUploadQueue({ worker, concurrency: 2 })
    q.add(['a', 'b', 'c'])
    expect(statuses(q)).toEqual(['uploading', 'uploading', 'queued'])

    pending[0].resolve('ok')
    await tick()
    expect(statuses(q)).toEqual(['done', 'uploading', 'uploading'])

    pending[1].resolve('ok')
    pending[2].resolve('ok')
    await tick()
    expect(statuses(q)).toEqual(['done', 'done', 'done'])
  })

  it('marks failures, keeps going, and can retry them', async () => {
    let fail = true
    const worker = async (file) => {
      if (file === 'bad' && fail) throw new Error('boom')
      return file
    }
    const q = createUploadQueue({ worker, concurrency: 1 })
    q.add(['good', 'bad', 'also-good'])
    await tick()
    await tick()
    await tick()
    expect(statuses(q)).toEqual(['done', 'error', 'done'])
    expect(q.getJobs()[1].error).toBe('boom')

    fail = false
    q.retryFailed()
    await tick()
    expect(statuses(q)).toEqual(['done', 'done', 'done'])
  })

  it('passes per-batch options to the worker and does not remove uploading jobs', async () => {
    const d = deferred()
    let seen
    const q = createUploadQueue({ worker: (file, job) => ((seen = job.options), d.promise) })
    const [job] = q.add(['x'], { categoryId: 'c1' })
    expect(seen).toEqual({ categoryId: 'c1' })
    q.remove(job.id)
    expect(q.getJobs()).toHaveLength(1)
    d.resolve(1)
    await tick()
    q.clearFinished()
    expect(q.getJobs()).toHaveLength(0)
  })
})
