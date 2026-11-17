/** Cloudinary client. Credentials come from CLOUDINARY_URL in the environment. */
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({ secure: true })

/** Upload an in-memory image buffer; resolves to the Cloudinary result. */
export function uploadImage(buffer, folder = 'theusgallery/artworks') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder, resource_type: 'image' }, (err, result) =>
      err ? reject(err) : resolve(result)
    )
    stream.end(buffer)
  })
}

/** Delete an asset by its public_id (best-effort cleanup). */
export function deleteImage(publicId) {
  return cloudinary.uploader.destroy(publicId, { resource_type: 'image' })
}
