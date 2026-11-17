'use client'

import { useEffect, useId, useState } from 'react'
import Link from 'next/link'
import { Header } from '../components/layout/Header'
import { Button } from '../components/ui/Button'
import { useAuth } from '../auth/AuthProvider'
import { getCategories, getCategory, uploadArtwork } from '../functions/api'

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

export function UploadPage() {
  const { loading, isApproved, isAuthed } = useAuth()

  const [cats, setCats] = useState([])
  const [collections, setCollections] = useState([])
  const [form, setForm] = useState({ categoryId: '', collectionId: '', title: '', artist: '', year: '', alt: '' })
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(null)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

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

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!file) return setError('Please choose an image.')
    if (!form.title.trim()) return setError('Please add a title.')
    if (!form.collectionId) return setError('Please choose a collection.')
    setBusy(true)
    try {
      const art = await uploadArtwork(
        { categoryId: form.categoryId, collectionId: form.collectionId, title: form.title, artist: form.artist, year: form.year, alt: form.alt },
        file
      )
      setDone(art)
      setForm((f) => ({ ...f, title: '', artist: '', year: '', alt: '' }))
      setFile(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-svh flex-col">
      <Header nav={[{ label: 'Gallery', to: '/' }]} />
      <main className="px-page flex-1 py-10">
        <h1 className="font-display text-[clamp(2rem,4vw,3.5rem)] leading-none text-text">Upload a work</h1>

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
          <form onSubmit={submit} className="mt-8 flex max-w-xl flex-col gap-5">
            {done && (
              <div className="border border-accent/60 bg-surface p-4 text-[13px] text-text">
                Uploaded “{done.title}”.{' '}
                <Link className="text-accent underline-offset-4 hover:underline" href={`/collections/${done.categoryId}/works/${done.id}`}>
                  View it
                </Link>
              </div>
            )}

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

            <Field label="Title">{(id) => <input id={id} value={form.title} onChange={(e) => set('title', e.target.value)} className={inputCls} />}</Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Artist (optional)">{(id) => <input id={id} value={form.artist} onChange={(e) => set('artist', e.target.value)} className={inputCls} />}</Field>
              <Field label="Year (optional)">{(id) => <input id={id} type="number" value={form.year} onChange={(e) => set('year', e.target.value)} className={inputCls} />}</Field>
            </div>
            <Field label="Alt text (optional)">{(id) => <input id={id} value={form.alt} onChange={(e) => set('alt', e.target.value)} className={inputCls} />}</Field>

            <Field label="Image">
              {(id) => (
                <input id={id} type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="text-[12px] text-muted file:mr-3 file:border file:border-line file:bg-transparent file:px-3 file:py-1.5 file:text-text" />
              )}
            </Field>

            {error && <p role="alert" className="text-[13px] text-accent">{error}</p>}

            <div>
              <Button variant="accent" type="submit" disabled={busy}>{busy ? 'Uploading…' : 'Upload work'}</Button>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
