import { useEffect, useId, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '../ui/Button'
import { useAuth } from '../../auth/AuthProvider'

function Field({ label, type = 'text', value, onChange, autoFocus, autoComplete }) {
  const id = useId()
  return (
    <label htmlFor={id} className="flex flex-col gap-2">
      <span className="text-[10px] uppercase tracking-[0.2em] text-muted">{label}</span>
      <input
        id={id}
        type={type}
        value={value}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 border border-line bg-ground px-4 text-[13px] text-text outline-none transition-colors duration-300 focus:border-accent placeholder:text-muted"
      />
    </label>
  )
}

/** Sign in / sign up modal. Google + email/password. */
export function AuthModal({ onClose }) {
  const { signInEmail, signUpEmail, signInGoogle } = useAuth()
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const run = async (fn) => {
    setBusy(true)
    setError(null)
    try {
      await fn()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const submit = (e) => {
    e.preventDefault()
    if (busy) return
    run(() => (mode === 'signin' ? signInEmail(email, password) : signUpEmail(email, password, name)))
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={mode === 'signin' ? 'Sign in' : 'Create account'}
        className="w-full max-w-md border border-line bg-ground p-8"
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 12, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-[28px] leading-none text-text">
          {mode === 'signin' ? 'Sign in' : 'Create account'}
        </h2>
        <p className="mt-2 text-[13px] text-muted">
          {mode === 'signin' ? 'Welcome back to TheUsGallery.' : 'Join TheUsGallery — an admin approves new members before you can post.'}
        </p>

        <Button className="mt-6 w-full justify-center" onClick={() => run(signInGoogle)} disabled={busy}>
          Continue with Google
        </Button>

        <div className="my-5 flex items-center gap-4 text-[10px] uppercase tracking-[0.2em] text-muted">
          <span className="h-px flex-1 bg-line" />
          or
          <span className="h-px flex-1 bg-line" />
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          {mode === 'signup' && (
            <Field label="Name" value={name} onChange={setName} autoComplete="name" autoFocus />
          )}
          <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" autoFocus={mode === 'signin'} />
          <Field
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          />

          {error && (
            <p role="alert" className="text-[13px] text-accent">
              {error}
            </p>
          )}

          <Button variant="accent" type="submit" className="w-full justify-center" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </Button>
        </form>

        <button
          type="button"
          className="mt-5 text-[13px] text-muted underline-offset-4 hover:text-text hover:underline"
          onClick={() => {
            setError(null)
            setMode((m) => (m === 'signin' ? 'signup' : 'signin'))
          }}
        >
          {mode === 'signin' ? 'New here? Create an account' : 'Already have an account? Sign in'}
        </button>
      </motion.div>
    </motion.div>
  )
}
