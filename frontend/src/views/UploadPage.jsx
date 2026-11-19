'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { Header } from '../components/layout/Header'
import { Button } from '../components/ui/Button'
import { useAuth } from '../auth/AuthProvider'
import { getCategories, getCategory, uploadArtwork } from '../functions/api'
import { createUploadQueue } from '../lib/uploadQueue'

function Field({ label, children }) {
  const id = useId()
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5">
      <span className="text-[10px] uppercase tracking-[0.2em] text-muted">{label}</span>
      {typeof children === 'function' ? children(id) : children}
    </label>
  )
}

const inputCls = 'h-11 border border-line bg-ground px-3 text-[13px] text-text outline-none focus:border-accent'

const STATUS_LABEL = { queued: 'Waiting', uploading: 'Uploading…', done: 'Uploaded', error: 'Failed' }

function QueueRow({ job, onRetry, onRemove }) {
  return (
    <li className="flex items-center justify-between gap-3 border border-line px-3 py-2.5 text-[13px]">
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-text">{job.file.name}</span>
        <span className={`text-[11px] ${job.status === 'error' ? 'text-accent' : 'text-muted'}`} role={job.status === 'error' ? 'alert' : undefined}>
          {job.status === 'error' ? job.error : STATUS_LABEL[job.status]}
          {job.status === 'done' && job.result && (
            <>
              {' · '}
              <Link className="text-accent underline-offset-4 hover:underline" href={`/collections/${job.result.categoryId}/works/${job.result.id}`}>
                View
              </Link>
            </>
          )}
        </span>
      </div>
      <div className="flex shrink-0 gap-3 text-[11px] uppercase tracking-[0.15em]">
        {job.status === 'error' && (
          <button type="button" onClick={() => onRetry(job.id)} className="text-text hover:text-accent">Retry</button>
        )}
        {job.status !== 'uploading' && (
          <button type="button" onClick={() => onRemove(job.id)} className="text-muted hover:text-text" aria-label={`Remove ${job.file.name}`}>
            Remove
          </button>
        )}
      </div>
    </li>
  )
}

export function UploadPage() {
  const { loading, isApproved, isAuthed } = useAuth()

  const [cats, setCats] = useState([])
  const [collections, setCollections] = useState([])
  const [form, setForm] = useState({ categoryId: '', collectionId: '' })
  const [error, setError] = useState(null)
  const [jobs, setJobs] = useState([])
  const fileInput = useRef(null)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  // One queue for the life of the page; each file is its own request, two at a time.
  const queue = useRef(null)
  if (!queue.current) {
    queue.current = createUploadQueue({
      concurrency: 2,
      worker: (file, job) => uploadArtwork({ categoryId: job.options.categoryId, collectionId: job.options.collectionId }, file),
    })
  }
  useEffect(() => queue.current.subscribe(setJobs), [])

  // Load categories once approved.
  useEffect(() => {
    if (!isApproved) return
    getCategories().then((list) => {
      setCats(list)
      if (list[0]) setForm((f) => ({ ...f, categoryId: f.categoryId || list[0].id }))
    }, (e) => setError(e.message))
  }, [isApproved])

  // Load collections when the category changes.
  useEffect(() => {
    if (!form.categoryId) return
    getCategory(form.categoryId).then((cat) => {
      setCollections(cat.collections)
      setForm((f) => ({ ...f, collectionId: cat.collections.some((c) => c.id === f.collectionId) ? f.collectionId : cat.collections[0]?.id || '' }))
    }, (e) => setError(e.message))
  }, [form.categoryId])

  const addFiles = (fileList) => {
    setError(null)
    const files = [...fileList]
    const images = files.filter((f) => f.type.startsWith('image/'))
    if (!form.collectionId) return setError('Please choose a collection first.')
    if (images.length < files.length) setError('Some files were skipped because they are not images.')
    if (images.length) queue.current.add(images, { categoryId: form.categoryId, collectionId: form.collectionId })
    if (fileInput.current) fileInput.current.value = ''
  }

  const failed = jobs.filter((j) => j.status === 'error').length
  const finished = jobs.filter((j) => j.status === 'done').length
  const pending = jobs.filter((j) => j.status === 'queued' || j.status === 'uploading').length

  return (
    <div className="flex min-h-svh flex-col">
      <Header nav={[{ label: 'Gallery', to: '/' }]} />
      <main className="px-page flex-1 py-10">
        <h1 className="font-display text-[clamp(2rem,4vw,3.5rem)] leading-none text-text">Add photos</h1>

        {loading ? (
          <p className="mt-8 text-[13px] text-muted">Checking access…</p>
        ) : !isApproved ? (
          <div className="mt-8 flex flex-col items-start gap-4">
            <p className="text-body text-muted">
              {isAuthed ? 'Your account is pending approval before you can upload.' : 'Sign in with an approved account to upload.'}
            </p>
            <Link href="/" className="label border-b border-line pb-1 text-text hover:border-text">Back to the gallery</Link>
          </div>
        ) : (
          <div className="mt-8 flex max-w-xl flex-col gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Category">
                {(id) => (
                  <select id={id} value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)} className={inputCls}>
                    {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                )}
              </Field>
              <Field label="Collection">
                {(id) => (
                  <select id={id} value={form.collectionId} onChange={(e) => set('collectionId', e.target.value)} className={inputCls}>
                    {collections.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                )}
              </Field>
            </div>

            <Field label="Images — as many as you like">
              {(id) => (
                <input
                  id={id}
                  ref={fileInput}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => addFiles(e.target.files)}
                  className="text-[12px] text-muted file:mr-3 file:border file:border-line file:bg-transparent file:px-3 file:py-1.5 file:text-text"
                />
              )}
            </Field>
            <p className="text-[12px] text-muted">
              Each photo is queued and uploaded on its own. Its title comes from the file name, and the year and other details are read from the photo’s own metadata.
            </p>

            {error && <p role="alert" className="text-[13px] text-accent">{error}</p>}

            {jobs.length > 0 && (
              <section aria-label="Upload queue" className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] uppercase tracking-[0.15em] text-muted" aria-live="polite">
                  <span>{pending > 0 ? `${pending} in queue · ` : ''}{finished} uploaded{failed ? ` · ${failed} failed` : ''}</span>
                  <span className="flex gap-4">
                    {failed > 0 && <button type="button" onClick={() => queue.current.retryFailed()} className="text-text hover:text-accent">Retry failed</button>}
                    {finished > 0 && <button type="button" onClick={() => queue.current.clearFinished()} className="hover:text-text">Clear uploaded</button>}
                  </span>
                </div>
                <ul className="flex flex-col gap-2">
                  {jobs.map((job) => (
                    <QueueRow key={job.id} job={job} onRetry={(id) => queue.current.retry(id)} onRemove={(id) => queue.current.remove(id)} />
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
