import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) throw new Error("Missing JWT_SECRET. Add it in Project Settings > Environment Variables.")

export type JWTPayload = { sub: string; role: "user" | "admin"; email: string }

export const signToken = (payload: JWTPayload, expiresIn = "7d") => jwt.sign(payload, JWT_SECRET!, { expiresIn })

export function verifyToken<T = JWTPayload>(token: string): T | null {
  try {
    return jwt.verify(token, JWT_SECRET!) as T
  } catch {
    return null
  }
}

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export function setAuthCookie(token: string) {
  cookies().set("token", token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 })
}

export function clearAuthCookie() {
  cookies().delete("token")
}

export function getUserFromCookie() {
  const token = cookies().get("token")?.value
  return token ? verifyToken(token) : null
}
