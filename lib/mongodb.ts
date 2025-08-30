import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI. Add it in Project Settings > Environment Variables.")
}

type Cached = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
let cached = (global as any)._mongoose as Cached
if (!cached) cached = (global as any)._mongoose = { conn: null, promise: null }

export async function dbConnect() {
  if (cached.conn) return cached.conn
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { dbName: process.env.MONGODB_DB || "devnovate_blog" })
  }
  cached.conn = await cached.promise
  return cached.conn
}
