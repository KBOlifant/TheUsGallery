'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Reorder, useDragControls } from 'framer-motion'
import Link from 'next/link'
import { Header } from '../components/layout/Header'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { useAuth } from '../auth/AuthProvider'
import {
  adminListUsers,
  adminApproveUser,
  adminRejectUser,
  adminSetUserRole,
  getCategories,
  getCategory,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  adminListCollections,
  adminCreateCollection,
  adminUpdateCollection,
  adminDeleteCollection,
  adminReorderCategories,
  adminReorderCollections,
} from '../functions/api'

const TABS = [
  { id: 'users', label: 'Users' },
  { id: 'categories', label: 'Categories' },
  { id: 'collections', label: 'Collections' },
]

function Field({ label, value, onChange, type = 'text', ...rest }) {
  const id = useId()
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5">
      <span className="text-[10px] uppercase tracking-[0.2em] text-muted">{label}</span>
      {type === 'textarea' ? (
        <textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} rows={2}
          className="border border-line bg-ground px-3 py-2 text-[13px] text-text outline-none focus:border-accent" {...rest} />
      ) : (
        <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)}
          className="h-11 border border-line bg-ground px-3 text-[13px] text-text outline-none focus:border-accent" {...rest} />
      )}
    </label>
  )
}

/** One draggable row; only the grip starts a drag so the row's buttons stay clickable. */
function ReorderRow({ value, className, onDragEnd, label, children }) {
  const controls = useDragControls()
  return (
    <Reorder.Item
      value={value}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onDragEnd}
      whileDrag={{ scale: 1.01, boxShadow: '0 8px 24px rgba(0,0,0,0.25)' }}
      className={`relative flex items-center gap-3 bg-ground px-4 py-3 ${className ?? ''}`}
    >
      <span
        role="img"
        aria-label={`Drag to reorder ${label}`}
        title="Drag to reorder"
        onPointerDown={(e) => controls.start(e)}
        className="cursor-grab touch-none select-none text-muted hover:text-text active:cursor-grabbing"
      >
        <Icon name="grip" size={16} />
      </span>
      {children}
    </Reorder.Item>
  )
}

/** Drag-to-reorder list. `onCommit(items)` runs when a drag ends with the final order. */
function ReorderList({ items, setItems, getId, getLabel, rowClass, onCommit, children }) {
  const latest = useRef(items)
  latest.current = items
  return (
    <Reorder.Group axis="y" values={items} onReorder={setItems} as="ul" className="flex flex-col divide-y divide-line border border-line">
      {items.map((item) => (
        <ReorderRow key={getId(item)} value={item} label={getLabel(item)} className={rowClass?.(item)} onDragEnd={() => onCommit(latest.current)}>
          {children(item)}
        </ReorderRow>
      ))}
    </Reorder.Group>
  )
}

// ---------------------------------------------------------------- Users tab ---
function UsersTab() {
  const [filter, setFilter] = useState('pending')
  const [users, setUsers] = useState(null)
  const [error, setError] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [notice, setNotice] = useState(null)

  const load = useCallback(() => {
    setUsers(null)
    setError(null)
    adminListUsers(filter === 'all' ? undefined : filter).then(setUsers, (e) => setError(e.message))
  }, [filter])
  useEffect(load, [load])

  const act = async (id, fn, label) => {
    setBusyId(id)
    setNotice(null)
    try {
      const res = await fn(id)
      if (label === 'approve') {
        const e = res?.email
        setNotice(e?.sent ? 'Approved — email sent.' : e?.skipped ? 'Approved (no email on file).' : `Approved — email not sent: ${e?.error || 'unknown'}.`)
      }
      load()
    } catch (e) {
      setNotice(e.message)
    } finally {
      setBusyId(null)
    }
  }

  const setRole = (id, role) => act(id, () => adminSetUserRole(id, role), 'role')

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-2">
        {['pending', 'approved', 'rejected', 'all'].map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)}
            className={`label border px-3 py-1.5 capitalize transition-colors ${filter === f ? 'border-accent text-accent' : 'border-line text-muted hover:border-text hover:text-text'}`}>
            {f}
          </button>
        ))}
      </div>

      {notice && <p className="text-[13px] text-accent">{notice}</p>}
      {error && <p role="alert" className="text-[13px] text-accent">{error}</p>}

      {!users ? (
        <p className="text-[13px] text-muted">Loading…</p>
      ) : users.length === 0 ? (
        <p className="text-[13px] text-muted">No {filter === 'all' ? '' : filter} users.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-line border border-line">
          {users.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-[14px] text-text">{u.displayName || u.email || '(no name)'}</p>
                <p className="truncate text-[12px] text-muted">{u.email} · <span className="capitalize">{u.status}</span>{u.role !== 'user' && ` · ${u.role}`}</p>
              </div>
              <div className="flex gap-2">
                {u.status !== 'approved' && (
                  <Button variant="accent" disabled={busyId === u.id} onClick={() => act(u.id, adminApproveUser, 'approve')}>Approve</Button>
                )}
                {u.status !== 'rejected' && (
                  <Button disabled={busyId === u.id} onClick={() => act(u.id, adminRejectUser, 'reject')}>Reject</Button>
                )}
                {u.role !== 'admin' && (
                  u.role === 'co-admin' ? (
                    <Button disabled={busyId === u.id} onClick={() => setRole(u.id, 'user')}>Remove co-admin</Button>
                  ) : (
                    <Button disabled={busyId === u.id} onClick={() => setRole(u.id, 'co-admin')}>Make co-admin</Button>
                  )
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ----------------------------------------------------------- Categories tab ---
const EMPTY_CATEGORY = { name: '', eyebrow: '', title: '', intro: '', cover: '' }

function CategoriesTab() {
  const [cats, setCats] = useState(null)
  const [error, setError] = useState(null)
  const [form, setForm] = useState(EMPTY_CATEGORY)
  const [banner, setBanner] = useState(null)
  const [fileKey, setFileKey] = useState(0) // remount the file input to clear it
  const [busy, setBusy] = useState(false)
  // Editing: the category's slug, plus the values it loaded with (to send only changes).
  const [editing, setEditing] = useState(null)
  const [original, setOriginal] = useState(null)
  const [loadingEdit, setLoadingEdit] = useState(false)

  const load = useCallback(() => {
    setCats(null)
    getCategories().then(setCats, (e) => setError(e.message))
  }, [])
  useEffect(load, [load])

  const reset = () => {
    setEditing(null)
    setOriginal(null)
    setForm(EMPTY_CATEGORY)
    setBanner(null)
    setFileKey((k) => k + 1)
  }

  const startEdit = async (slug) => {
    setError(null)
    setEditing(slug)
    setLoadingEdit(true)
    setBanner(null)
    setFileKey((k) => k + 1)
    try {
      // The list only has summaries; the detail has title + intro.
      const c = await getCategory(slug)
      const values = {
        name: c.name ?? '',
        eyebrow: c.eyebrow ?? '',
        title: c.title ?? '',
        intro: c.intro ?? '',
        // A banner shows up as cover "url(...)"; that isn't a gradient to edit.
        cover: c.cover?.startsWith('url(') ? '' : (c.cover ?? ''),
      }
      setForm(values)
      setOriginal(values)
    } catch (err) {
      setError(err.message)
      reset()
    } finally {
      setLoadingEdit(false)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || busy || loadingEdit) return
    setBusy(true)
    setError(null)
    try {
      if (editing) {
        const changes = Object.fromEntries(Object.entries(form).filter(([k, v]) => v !== original[k]))
        if (Object.keys(changes).length || banner) await adminUpdateCategory(editing, changes, banner)
      } else {
        await adminCreateCategory(form, banner)
      }
      reset()
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const commitOrder = async (next) => {
    setError(null)
    try {
      await adminReorderCategories(next.map((c) => c.id))
    } catch (err) {
      setError(err.message)
      load()
    }
  }

  const remove = async (slug) => {
    if (!window.confirm(`Delete category "${slug}" and ALL its collections and artworks? This cannot be undone.`)) return
    try {
      await adminDeleteCategory(slug)
      if (editing === slug) reset()
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="flex flex-col gap-4">
        <h3 className="label text-muted">Existing</h3>
        {error && <p role="alert" className="text-[13px] text-accent">{error}</p>}
        {!cats ? <p className="text-[13px] text-muted">Loading…</p> : (
          <ReorderList
            items={cats}
            setItems={setCats}
            getId={(c) => c.id}
            getLabel={(c) => c.name}
            rowClass={(c) => (editing === c.id ? 'bg-raised' : '')}
            onCommit={commitOrder}
          >
            {(c) => (
              <>
                <span className="flex-1 text-[14px] text-text">{c.name} <span className="text-muted">· {c.workCount} works</span></span>
                <div className="flex gap-2">
                  <Button onClick={() => startEdit(c.id)} disabled={editing === c.id}>Edit</Button>
                  <Button onClick={() => remove(c.id)}>Delete</Button>
                </div>
              </>
            )}
          </ReorderList>
        )}
      </div>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <h3 className="label text-muted">{editing ? `Edit category · ${editing}` : 'New category'}</h3>
        <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} disabled={loadingEdit} />
        <Field label="Eyebrow" value={form.eyebrow} onChange={(v) => setForm({ ...form, eyebrow: v })} disabled={loadingEdit} />
        <Field label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} disabled={loadingEdit} />
        <Field label="Intro" type="textarea" value={form.intro} onChange={(v) => setForm({ ...form, intro: v })} disabled={loadingEdit} />
        <Field label="Cover gradient (CSS, optional)" value={form.cover} onChange={(v) => setForm({ ...form, cover: v })} placeholder="linear-gradient(...)" disabled={loadingEdit} />
        <label className="flex flex-col gap-1.5">
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted">
            {editing ? 'Replace banner image (optional)' : 'Banner image (optional)'}
          </span>
          <input key={fileKey} type="file" accept="image/*" onChange={(e) => setBanner(e.target.files?.[0] ?? null)} className="text-[12px] text-muted file:mr-3 file:border file:border-line file:bg-transparent file:px-3 file:py-1.5 file:text-text" />
        </label>
        <div className="flex gap-3">
          <Button variant="accent" type="submit" disabled={busy || loadingEdit || !form.name.trim()}>
            {busy ? 'Saving…' : editing ? 'Save changes' : 'Create category'}
          </Button>
          {editing && <Button onClick={reset} disabled={busy}>Cancel</Button>}
        </div>
      </form>
    </div>
  )
}

// ---------------------------------------------------------- Collections tab ---
const EMPTY_COLLECTION = { title: '', eyebrow: '', description: '' }

function CollectionsTab() {
  const [cats, setCats] = useState(null)
  const [categoryId, setCategoryId] = useState('')
  const [cols, setCols] = useState(null)
  const [error, setError] = useState(null)
  const [form, setForm] = useState(EMPTY_COLLECTION)
  const [editing, setEditing] = useState(null) // the collection's _id
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    getCategories().then((list) => {
      setCats(list)
      if (list[0]) setCategoryId((id) => id || list[0].id)
    }, (e) => setError(e.message))
  }, [])

  const loadCols = useCallback(() => {
    if (!categoryId) return
    setCols(null)
    adminListCollections(categoryId).then(setCols, (e) => setError(e.message))
  }, [categoryId])
  useEffect(loadCols, [loadCols])

  const reset = () => {
    setEditing(null)
    setForm(EMPTY_COLLECTION)
  }

  const startEdit = (col) => {
    setError(null)
    setEditing(col._id)
    setForm({ title: col.title ?? '', eyebrow: col.eyebrow ?? '', description: col.description ?? '' })
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !categoryId || busy) return
    setBusy(true)
    setError(null)
    try {
      if (editing) await adminUpdateCollection(editing, form)
      else await adminCreateCollection({ categoryId, ...form })
      reset()
      loadCols()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const commitOrder = async (next) => {
    setError(null)
    try {
      await adminReorderCollections(next.map((c) => c._id))
    } catch (err) {
      setError(err.message)
      loadCols()
    }
  }

  const remove = async (col) => {
    if (!window.confirm(`Delete collection "${col.title}" and all its artworks?`)) return
    try {
      await adminDeleteCollection(col._id)
      if (editing === col._id) reset()
      loadCols()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <label className="flex max-w-xs flex-col gap-1.5">
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted">Category</span>
        <select value={categoryId} onChange={(e) => { reset(); setCategoryId(e.target.value) }}
          className="h-11 border border-line bg-ground px-3 text-[13px] text-text outline-none focus:border-accent">
          {cats?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </label>

      {error && <p role="alert" className="text-[13px] text-accent">{error}</p>}

      <div className="grid gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h3 className="label text-muted">Collections</h3>
          {!cols ? <p className="text-[13px] text-muted">Loading…</p> : cols.length === 0 ? (
            <p className="text-[13px] text-muted">No collections yet.</p>
          ) : (
            <ReorderList
              items={cols}
              setItems={setCols}
              getId={(c) => c._id}
              getLabel={(c) => c.title}
              rowClass={(c) => (editing === c._id ? 'bg-raised' : '')}
              onCommit={commitOrder}
            >
              {(c) => (
                <>
                  <span className="flex-1 text-[14px] text-text">{c.title}</span>
                  <div className="flex gap-2">
                    <Button onClick={() => startEdit(c)} disabled={editing === c._id}>Edit</Button>
                    <Button onClick={() => remove(c)}>Delete</Button>
                  </div>
                </>
              )}
            </ReorderList>
          )}
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <h3 className="label text-muted">{editing ? 'Edit collection' : 'New collection'}</h3>
          <Field label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
          <Field label="Eyebrow" value={form.eyebrow} onChange={(v) => setForm({ ...form, eyebrow: v })} />
          <Field label="Description" type="textarea" value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
          <div className="flex gap-3">
            <Button variant="accent" type="submit" disabled={busy || !form.title.trim()}>
              {busy ? 'Saving…' : editing ? 'Save changes' : 'Create collection'}
            </Button>
            {editing && <Button onClick={reset} disabled={busy}>Cancel</Button>}
          </div>
        </form>
      </div>
    </div>
  )
}

// ------------------------------------------------------------------- Page ----
export function AdminPage() {
  const { loading, isAdmin } = useAuth()
  const [tab, setTab] = useState('users')

  return (
    <div className="flex min-h-svh flex-col">
      <Header nav={[{ label: 'Gallery', to: '/' }]} />
      <main className="px-page flex-1 py-10">
        <h1 className="font-display text-[clamp(2rem,4vw,3.5rem)] leading-none text-text">Admin</h1>

        {loading ? (
          <p className="mt-8 text-[13px] text-muted">Checking access…</p>
        ) : !isAdmin ? (
          <div className="mt-8 flex flex-col items-start gap-4">
            <p className="text-body text-muted">You don’t have admin access.</p>
            <Link href="/" className="label border-b border-line pb-1 text-text hover:border-text">Back to the gallery</Link>
          </div>
        ) : (
          <>
            <nav className="mt-8 flex gap-6 border-b border-line">
              {TABS.map((t) => (
                <button key={t.id} type="button" onClick={() => setTab(t.id)}
                  className={`label -mb-px border-b-2 pb-3 transition-colors ${tab === t.id ? 'border-accent text-text' : 'border-transparent text-muted hover:text-text'}`}>
                  {t.label}
                </button>
              ))}
            </nav>
            <div className="mt-8 max-w-4xl">
              {tab === 'users' && <UsersTab />}
              {tab === 'categories' && <CategoriesTab />}
              {tab === 'collections' && <CollectionsTab />}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
