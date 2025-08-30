import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/mongodb"
import User from "@/models/User"
import { hashPassword, signToken, setAuthCookie } from "@/lib/auth"

export async function POST(req: Request) {
  await dbConnect()
  const { name, email, password } = await req.json()
  if (!name || !email || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  const existing = await User.findOne({ email })
  if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 409 })
  const passwordHash = await hashPassword(password)
  const user = await User.create({ name, email, passwordHash })
  const token = signToken({ sub: String(user._id), role: user.role, email: user.email })
  setAuthCookie(token)
  return NextResponse.json({ user: { id: String(user._id), name: user.name, email: user.email, role: user.role } })
}
