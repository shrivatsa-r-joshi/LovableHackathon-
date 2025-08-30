import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/mongodb"
import { Blog } from "@/models/Blog"
import { getUserFromCookie } from "@/lib/auth"

export async function GET(_: Request, { params }: { params: { id: string } }) {
  await dbConnect()
  const blog = await Blog.findById(params.id)
  if (!blog || blog.status === "hidden") return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({
    blog: {
      id: String(blog._id),
      title: blog.title,
      contentMarkdown: blog.contentMarkdown,
      likesCount: blog.likesCount,
      createdAt: blog.createdAt,
      status: blog.status,
      tags: blog.tags,
    },
  })
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = getUserFromCookie()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  await dbConnect()
  const blog = await Blog.findById(params.id)
  if (!blog) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const body = await req.json()
  const isOwner = user.sub === String(blog.authorId)
  const isAdmin = user.role === "admin"

  if (isOwner) {
    if (body.title) blog.title = body.title
    if (body.contentMarkdown) blog.contentMarkdown = body.contentMarkdown
    if (Array.isArray(body.tags)) blog.tags = body.tags
  }
  if (isAdmin && body.status && ["pending", "published", "rejected", "hidden"].includes(body.status)) {
    blog.status = body.status
  }

  await blog.save()
  return NextResponse.json({ ok: true })
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const user = getUserFromCookie()
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  await dbConnect()
  await Blog.findByIdAndDelete(params.id)
  return NextResponse.json({ ok: true })
}
