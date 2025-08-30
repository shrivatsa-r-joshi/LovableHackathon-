import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/mongodb"
import { Blog } from "@/models/Blog"
import { getUserFromCookie } from "@/lib/auth"

export async function GET(req: Request) {
  await dbConnect()
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.trim()
  const cat = searchParams.get("cat")?.trim()
  const trending = searchParams.get("trending") === "true"
  const status = searchParams.get("status") || "published"
  const mine = searchParams.get("mine") === "true"
  const payload = getUserFromCookie()

  const filter: any = { status }
  if (q) filter.title = { $regex: q, $options: "i" }
  if (cat) filter.tags = { $in: [cat] }
  if (mine && payload) filter.authorId = payload.sub

  const sort = trending ? { likesCount: -1, createdAt: -1 } : { createdAt: -1 }
  const blogs = await Blog.find(filter).sort(sort).limit(30).select("title likesCount createdAt status")
  return NextResponse.json({
    blogs: blogs.map((b) => ({
      id: String(b._id),
      title: b.title,
      likesCount: b.likesCount,
      createdAt: b.createdAt,
      status: b.status,
    })),
  })
}

export async function POST(req: Request) {
  const user = getUserFromCookie()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  await dbConnect()
  const { title, contentMarkdown, tags } = await req.json()
  if (!title || !contentMarkdown) return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  const blog = await Blog.create({ title, contentMarkdown, tags: tags || [], authorId: user.sub, status: "pending" })
  return NextResponse.json({ id: String(blog._id) })
}
