import { useCachedImageUrl } from '../../lib/imageCache'

/**
 * Artwork image. Renders the tonal gradient placeholder until real photography
 * exists; when the API starts returning `image.src`, it is layered on top.
 * The photo itself is cached in IndexedDB (see lib/imageCache.js) so a repeat
 * showing of the same work — another card, the modal — paints from disk, not the network.
 */
export function ArtImage({ image, className = '', hoverZoom = true }) {
  // Only default to `relative` when the caller hasn't positioned it: with both
  // `relative` and `absolute` set, `.relative` wins in the CSS and the box collapses to 0px tall.
  const positioned = /(^|\s)(absolute|fixed|sticky)(\s|$)/.test(className)
  // Falls back to the original URL until (or unless) the cached copy is ready.
  const cachedSrc = useCachedImageUrl(image.src)
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
        {image.src && <img src={cachedSrc || image.src} alt="" className="size-full object-cover" loading="lazy" />}
      </div>
    </div>
  )
}
