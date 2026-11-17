/**
 * EmailJS (server-side send). Used for the "your account is approved" email.
 *
 * NOTE: the template param names below must match the variables in your EmailJS
 * template (Dashboard → Email Templates). We send several common aliases so a
 * typical template "works out of the box"; adjust to your template if needed.
 * Also enable "Allow EmailJS API for non-browser applications" (Account → Security).
 */
import emailjs from '@emailjs/nodejs'
import { env } from './env.js'

const APP_NAME = 'TheUsGallery'

export async function sendApprovalEmail({ toEmail, toName }) {
  const { serviceId, templateId, publicKey, privateKey } = env.emailjs
  if (!serviceId || !templateId || !privateKey) {
    console.warn('[email] EmailJS not configured — skipping approval email')
    return { sent: false, skipped: true }
  }

  const name = toName || toEmail
  const templateParams = {
    to_email: toEmail,
    email: toEmail,
    to_name: name,
    name,
    app_name: APP_NAME,
    message: `Good news — your ${APP_NAME} account has been approved. You can now sign in and start sharing, liking, saving and commenting on work.`,
  }

  try {
    await emailjs.send(serviceId, templateId, templateParams, { publicKey, privateKey })
    return { sent: true }
  } catch (err) {
    // Approval must not fail just because the email did.
    console.error('[email] approval email failed:', err?.text || err?.message || err)
    return { sent: false, error: err?.text || err?.message || 'send failed' }
  }
}
