/**
 * MongoDB connection via Mongoose. Cached on globalThis so dev hot-reloads and
 * warm serverless invocations reuse one connection instead of opening new ones.
 */
import mongoose from 'mongoose'
import { env } from './env.js'

const cache = (globalThis.__mongoose ??= { conn: null, promise: null })

export async function connectDB() {
  if (cache.conn) return cache.conn
  if (!cache.promise) {
    mongoose.set('strictQuery', true)
    cache.promise = mongoose
      .connect(env.mongoUri)
      .then((m) => {
        const { host, name } = m.connection
        console.log(`[db] connected to ${host}/${name}`)
        return m.connection
      })
      .catch((err) => {
        cache.promise = null // allow a retry on the next request
        throw err
      })
  }
  cache.conn = await cache.promise
  return cache.conn
}
