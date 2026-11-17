import Link from 'next/link'
import { ThemeSwitcher } from '../ui/ThemeSwitcher'
import { AccountControl } from '../auth/AccountControl'
import { scrollToTarget } from '../../lib/scroll'

export function Wordmark({ className = '' }) {
  return (
    <Link href="/" aria-label="Aperture — home" className={`font-display text-[28px] leading-none text-text ${className}`}>
      Aperture<span className="align-super text-xs text-accent">°</span>
    </Link>
  )
}

/**
 * @param nav  [{ label, to }] routes or [{ label, href: '#id' }] in-page anchors
 */
export function Header({ nav = [] }) {
  const onAnchor = (e, href) => {
    e.preventDefault()
    scrollToTarget(href, { offset: -24 })
  }

  return (
    <header className="px-page flex flex-wrap items-center justify-between gap-x-10 gap-y-4 border-b border-line py-6">
      <Wordmark />

      {nav.length > 0 && (
        <nav aria-label="Primary" className="order-last w-full md:order-none md:w-auto">
          <ul className="label flex gap-8 text-muted md:gap-10">
            {nav.map((item) => (
              <li key={item.label}>
                {item.to ? (
                  <Link href={item.to} className="transition-colors duration-300 hover:text-text">
                    {item.label}
                  </Link>
                ) : (
                  <a href={item.href} onClick={(e) => onAnchor(e, item.href)} className="transition-colors duration-300 hover:text-text">
                    {item.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="flex items-center gap-4">
        <ThemeSwitcher />
        <AccountControl />
      </div>
    </header>
  )
}
