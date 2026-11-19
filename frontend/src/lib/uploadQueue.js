/**
 * A small upload queue: every file is its own job, sent to the server as its own
 * request, with at most `concurrency` jobs in flight at once.
 *
 *   queued → uploading → done | error      (error jobs can be retried)
 *
 * Framework-free so it can be tested without React; the UI subscribes via `subscribe`.
 */
let nextId = 1

export function createUploadQueue({ worker, concurrency = 2 } = {}) {
  let jobs = []
  const listeners = new Set()

  const emit = () => listeners.forEach((fn) => fn(jobs))
  const update = (id, patch) => {
    jobs = jobs.map((j) => (j.id === id ? { ...j, ...patch } : j))
    emit()
  }

  function pump() {
    const active = jobs.filter((j) => j.status === 'uploading').length
    const free = concurrency - active
    jobs
      .filter((j) => j.status === 'queued')
      .slice(0, Math.max(free, 0))
      .forEach(run)
  }

  async function run(job) {
    update(job.id, { status: 'uploading', error: null })
    try {
      const result = await worker(job.file, job)
      update(job.id, { status: 'done', result })
    } catch (err) {
      update(job.id, { status: 'error', error: err?.message || 'Upload failed' })
    }
    pump()
  }

  return {
    /** Queue files; returns the created jobs. `options` is attached to each job (e.g. category). */
    add(files, options = {}) {
      const added = [...files].map((file) => ({ id: nextId++, file, options, status: 'queued', error: null, result: null }))
      jobs = [...jobs, ...added]
      emit()
      pump()
      return added
    },
    retry(id) {
      if (jobs.find((j) => j.id === id)?.status !== 'error') return
      update(id, { status: 'queued', error: null })
      pump()
    },
    retryFailed() {
      jobs = jobs.map((j) => (j.status === 'error' ? { ...j, status: 'queued', error: null } : j))
      emit()
      pump()
    },
    /** Remove a job that is not currently uploading. */
    remove(id) {
      if (jobs.find((j) => j.id === id)?.status === 'uploading') return
      jobs = jobs.filter((j) => j.id !== id)
      emit()
    },
    clearFinished() {
      jobs = jobs.filter((j) => j.status !== 'done')
      emit()
    },
    getJobs: () => jobs,
    subscribe(fn) {
      listeners.add(fn)
      return () => listeners.delete(fn)
    },
  }
}
