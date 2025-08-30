import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/mongodb"
import User from "@/models/User"
import { signToken, setAuthCookie, clearAuthCookie } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  await dbConnect()
  const { email, password } = await req.json()
  const user = await User.findOne({ email })
  if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  const token = signToken({ sub: String(user._id), role: user.role, email: user.email })
  setAuthCookie(token)
  return NextResponse.json({ user: { id: String(user._id), name: user.name, email: user.email, role: user.role } })
}

export async function DELETE() {
  clearAuthCookie()
  return NextResponse.json({ ok: true })
}
