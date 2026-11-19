/**
 * Artwork image. Renders the tonal gradient placeholder until real photography
 * exists; when the API starts returning `image.src`, it is layered on top.
 */
export function ArtImage({ image, className = '', hoverZoom = true }) {
  // Only default to `relative` when the caller hasn't positioned it: with both
  // `relative` and `absolute` set, `.relative` wins in the CSS and the box collapses to 0px tall.
  const positioned = /(^|\s)(absolute|fixed|sticky)(\s|$)/.test(className)
  return (
    <div className={`${positioned ? '' : 'relative '}overflow-hidden ${className}`}>
      <div
        role="img"
        aria-label={image.alt}
        className={`absolute inset-0 transition-transform duration-[900ms] ease-aperture ${
          hoverZoom ? 'group-hover:scale-[1.04]' : ''
        }`}
        style={{ background: image.gradient }}
      >
        {image.src && <img src={image.src} alt="" className="size-full object-cover" loading="lazy" />}
      </div>
    </div>
  )
}
