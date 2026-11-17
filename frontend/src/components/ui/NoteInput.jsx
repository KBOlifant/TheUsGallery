import { useId, useState } from 'react'
import { Icon } from './Icon'

/** Square field with an attached accent submit. Focus draws the accent hairline. */
export function NoteInput({ onSubmit, autoFocus, label = 'Add your perspective', placeholder = 'Leave a thoughtful note…' }) {
  const id = useId()
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const canSend = text.trim().length > 0 && !busy

  async function handleSubmit(e) {
    e.preventDefault()
    if (!canSend) return
    setBusy(true)
    setError(null)
    try {
      await onSubmit(text)
      setText('')
    } catch (err) {
      setError(err.message ?? 'Could not post your note.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
      <label htmlFor={id} className="text-[10px] uppercase tracking-[0.2em] text-muted">
        {label}
      </label>
      <div className="group flex h-12 border border-line bg-ground transition-colors duration-300 focus-within:border-accent">
        <input
          id={id}
          autoFocus={autoFocus}
          value={text}
          maxLength={500}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent px-4 text-[13px] text-text outline-none placeholder:text-muted"
        />
        <button
          type="submit"
          aria-label="Send note"
          disabled={!canSend}
          className="flex w-12 items-center justify-center border-l border-line text-accent transition-colors duration-300 group-focus-within:border-accent group-focus-within:bg-accent group-focus-within:text-on-accent disabled:cursor-default"
        >
          <Icon name="arrow-right" />
        </button>
      </div>
      {error && (
        <p role="alert" className="text-caption text-accent">
          {error}
        </p>
      )}
    </form>
  )
}
