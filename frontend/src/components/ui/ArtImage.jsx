/**
 * Artwork image. Renders the tonal gradient placeholder until real photography
 * exists; when the API starts returning `image.src`, it is layered on top.
 */
export function ArtImage({ image, className = '', hoverZoom = true }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
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
