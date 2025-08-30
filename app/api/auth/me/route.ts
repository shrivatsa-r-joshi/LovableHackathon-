import { NextResponse } from "next/server"
import User from "@/models/User"
import { dbConnect } from "@/lib/mongodb"
import { getUserFromCookie } from "@/lib/auth"

export async function GET() {
  const payload = getUserFromCookie()
  if (!payload) return NextResponse.json({ user: null })
  await dbConnect()
  const user = await User.findById(payload.sub).select("name email role")
  return NextResponse.json({
    user: user ? { id: String(user._id), name: user.name, email: user.email, role: user.role } : null,
  })
}
