import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/mongodb"
import { Blog, Like } from "@/models/Blog"
import { getUserFromCookie } from "@/lib/auth"

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const user = getUserFromCookie()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  await dbConnect()
  try {
    await Like.create({ userId: user.sub, blogId: params.id })
    await Blog.findByIdAndUpdate(params.id, { $inc: { likesCount: 1 } })
    return NextResponse.json({ liked: true })
  } catch {
    await Like.findOneAndDelete({ userId: user.sub, blogId: params.id })
    await Blog.findByIdAndUpdate(params.id, { $inc: { likesCount: -1 } })
    return NextResponse.json({ liked: false })
  }
}
