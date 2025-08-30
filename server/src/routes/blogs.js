import { Router } from "express"
import Blog from "../models/Blog.js"
import { requireAuth, requireAdmin } from "../middleware/auth.js"
import mongoose from "mongoose"

const router = Router()

router.get("/blogs", async (req, res) => {
  try {
    const { search = "", category = "", tag = "", status = "published", sort = "new", limit = 20, page = 1 } = req.query
    const q = {}
    if (status) q.status = status
    if (category) q.category = category
    if (tag) q.tags = tag
    if (search) {
      q.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ]
    }
    const sortObj = sort === "trending" ? { likesCount: -1, createdAt: -1 } : { createdAt: -1 }
    const perPage = Math.min(Number(limit) || 20, 50)
    const skip = (Number(page) - 1) * perPage
    const [items, total] = await Promise.all([
      Blog.find(q).sort(sortObj).skip(skip).limit(perPage).select("-content").lean(),
      Blog.countDocuments(q),
    ])
    res.json({ items, total, page: Number(page), pageSize: perPage })
  } catch {
    res.status(500).json({ error: "Server error" })
  }
})

router.get("/blogs/:id", async (req, res) => {
  try {
    const { id } = req.params
    const byId = mongoose.isValidObjectId(id)
    const blog = byId ? await Blog.findById(id).lean() : await Blog.findOne({ slug: id }).lean()
    if (!blog) return res.status(404).json({ error: "Not found" })
    if (blog.status !== "published") return res.status(403).json({ error: "Not public" })
    res.json(blog)
  } catch {
    res.status(500).json({ error: "Server error" })
  }
})

router.post("/blogs", requireAuth, async (req, res) => {
  try {
    const { title, slug, excerpt = "", content = "", coverImage = "", category = "Technology", tags = [] } = req.body
    if (!title || !slug) return res.status(400).json({ error: "Missing fields" })
    const exists = await Blog.findOne({ slug })
    if (exists) return res.status(409).json({ error: "Slug already exists" })
    const status = req.user.role === "admin" ? "published" : "pending"
    const blog = await Blog.create({
      title,
      slug,
      excerpt,
      content,
      coverImage,
      category,
      tags,
      status,
      author: req.user.id,
    })
    res.status(201).json(blog)
  } catch {
    res.status(500).json({ error: "Server error" })
  }
})

router.put("/blogs/:id", requireAuth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
    if (!blog) return res.status(404).json({ error: "Not found" })
    const isOwner = blog.author.toString() === req.user.id
    const isAdmin = req.user.role === "admin"
    if (!isOwner && !isAdmin) return res.status(403).json({ error: "Forbidden" })
    const updatable = ["title", "slug", "excerpt", "content", "coverImage", "category", "tags"]
    updatable.forEach((k) => {
      if (k in req.body) blog[k] = req.body[k]
    })
    if (isAdmin && "status" in req.body) blog.status = req.body.status
    await blog.save()
    res.json(blog)
  } catch {
    res.status(500).json({ error: "Server error" })
  }
})

router.delete("/blogs/:id", requireAuth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
    if (!blog) return res.status(404).json({ error: "Not found" })
    const isOwner = blog.author.toString() === req.user.id
    const isAdmin = req.user.role === "admin"
    if (!isOwner && !isAdmin) return res.status(403).json({ error: "Forbidden" })
    await blog.deleteOne()
    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: "Server error" })
  }
})

router.post("/blogs/:id/like", requireAuth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
    if (!blog) return res.status(404).json({ error: "Not found" })
    const uid = req.user.id
    const hasLiked = blog.likedBy.some((u) => u.toString() === uid)
    if (hasLiked) {
      blog.likedBy = blog.likedBy.filter((u) => u.toString() !== uid)
      blog.likesCount = Math.max(0, (blog.likesCount || 0) - 1)
    } else {
      blog.likedBy.push(uid)
      blog.likesCount = (blog.likesCount || 0) + 1
    }
    await blog.save()
    res.json({ likesCount: blog.likesCount, liked: !hasLiked })
  } catch {
    res.status(500).json({ error: "Server error" })
  }
})

router.put("/blogs/:id/status", requireAuth, requireAdmin, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
    if (!blog) return res.status(404).json({ error: "Not found" })
    const { status } = req.body
    if (!["pending", "published", "rejected", "hidden"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" })
    }
    blog.status = status
    await blog.save()
    res.json(blog)
  } catch {
    res.status(500).json({ error: "Server error" })
  }
})

export default router
