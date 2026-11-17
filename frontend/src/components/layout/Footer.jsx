import { Wordmark } from './Header'

export function Footer() {
  return (
    <footer className="px-page flex flex-col items-start gap-6 border-t border-line py-12 md:flex-row md:items-center md:justify-between">
      <Wordmark />
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Made with Sauce</p>
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted">© {new Date().getFullYear()} The Us Gallery</p>
    </footer>
  )
}
