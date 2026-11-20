import Link from 'next/link'
import Image from 'next/image'
import tgLogo from '../../assets/TG_Logo.png'
import { ThemeSwitcher } from '../ui/ThemeSwitcher'
import { AccountControl } from '../auth/AccountControl'
import { Icon } from '../ui/Icon'
import { scrollToTarget } from '../../lib/scroll'

export function Wordmark({ className = '' }) {
  return (
    <Link href="/" aria-label="TheUsGallery — home" className={`font-display text-[28px] leading-none text-text ${className}`}>
      {/* Mobile: TG logo mark. Desktop: full wordmark. */}
      <Image src={tgLogo} alt="" width={40} height={40} priority className="h-10 w-10 rounded-lg md:hidden" />
      <span className="hidden md:inline">
        TheUsGallery<span className="align-super text-xs text-accent">°</span>
      </span>
    </Link>
  )
}

/**
 * @param nav   [{ label, to }] routes or [{ label, href: '#id' }] in-page anchors
 * @param home  show an icon-only button back to the home page
 */
export function Header({ nav = [], home = false }) {
  const onAnchor = (e, href) => {
    e.preventDefault()
    scrollToTarget(href, { offset: -24 })
  }

  return (
    <header className="px-page flex flex-wrap items-center justify-between gap-x-10 gap-y-4 border-b border-line py-6">
      <Wordmark />

      {home && (
        <Link
          href="/"
          aria-label="Home"
          className="sm:inline-flex hidden size-11 shrink-0 items-center justify-center border border-line-strong text-text transition-colors duration-300 ease-aperture hover:border-text"
        >
          <Icon name="home" size={18} />
        </Link>
      )}

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
