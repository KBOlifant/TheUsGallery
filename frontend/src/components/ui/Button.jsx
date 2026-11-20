import { forwardRef } from 'react'
import Link from 'next/link'
import { Icon } from './Icon'

const cx = (...c) => c.filter(Boolean).join(' ')

const base =
  'label inline-flex items-center gap-3 border transition-colors duration-300 ease-aperture disabled:border-line disabled:text-muted disabled:bg-transparent'

const variants = {
  outline: 'h-11 px-5 border-line-strong text-text hover:border-text',
  solid: 'h-11 px-5 border-text bg-text text-ground hover:opacity-90',
  accent: 'h-11 px-5 border-accent bg-accent text-on-accent hover:opacity-90',
}

/** Outlined by default. Filled accent is reserved for one action per view. */
export const Button = forwardRef(function Button({ variant = 'outline', icon, iconFilled, className, children, ...props }, ref) {
  return (
    <button ref={ref} type="button" className={cx(base, variants[variant], className)} {...props}>
      {icon && <Icon name={icon} filled={iconFilled} />}
      {children}
    </button>
  )
})

const iconSizes = {
  md: 'size-11',
  // Small visual square, 44px hit area via the ::before overlay.
  sm: "size-7 relative before:absolute before:-inset-2 before:content-['']",
}

/** Square icon button. Always pass an aria-label. */
export const IconButton = forwardRef(function IconButton(
  { icon, size = 'md', iconSize, active, className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={cx(
        'inline-flex shrink-0 items-center justify-center border transition-colors duration-300 ease-aperture disabled:opacity-40',
        active ? 'border-accent text-accent' : 'border-line-strong text-text hover:border-text',
        iconSizes[size],
        className,
      )}
      {...props}
    >
      <Icon name={icon} size={iconSize ?? (size === 'sm' ? 13 : 18)} filled={active && (icon === 'heart' || icon === 'save')} />
    </button>
  )
})

/** Label + arrow link CTA. Pass `to` for routes, `href` for anchors. */
export function TextLink({ to, href, accent, children, className, ...props }) {
  const classes = cx(
    'label group inline-flex items-center gap-3 border-b pb-1.5 transition-colors duration-300 ease-aperture',
    accent ? 'border-accent text-accent' : 'border-line text-text hover:border-text',
    className,
  )
  const content = (
    <>
      {children}
      <Icon name="arrow-right" className="transition-transform duration-300 ease-aperture group-hover:translate-x-1" />
    </>
  )
  return to ? (
    <Link href={to} className={classes} {...props}>
      {content}
    </Link>
  ) : (
    <a href={href} className={classes} {...props}>
      {content}
    </a>
  )
}
