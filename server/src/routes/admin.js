import express from "express"
import Blog from "../models/Blog.js"
import { requireAuth } from "../middleware/auth.js"
import { SAFE_ADMIN_BOOTSTRAP_TOKEN } from "../config.js"

const router = express.Router()

// Helper: allow if requester is admin OR provides the bootstrap token
function isAuthorizedForBootstrap(req) {
  const headerToken = req.headers["x-bootstrap-token"]
  if (SAFE_ADMIN_BOOTSTRAP_TOKEN && headerToken && headerToken === SAFE_ADMIN_BOOTSTRAP_TOKEN) {
    return true
  }
  return false
}

// POST /admin/seed
// Creates several published blogs across categories and pre-fills likes to drive "trending".
// Auth: admin JWT or valid x-bootstrap-token
router.post("/seed", requireAuth, async (req, res) => {
  try {
    const user = req.user // set by requireAuth
    const canSeed = user?.role === "admin" || isAuthorizedForBootstrap(req)
    if (!canSeed) {
      return res.status(403).json({ error: "Forbidden" })
    }

    const now = new Date()
    const demo = [
      {
        title: "AI Tooling in 2025",
        slug: "ai-tooling-2025",
        excerpt: "A fast tour through today’s AI dev stack.",
        content: "Content about AI tooling...",
        category: "Technology",
        status: "published",
        // if your schema supports images/tags, they can be added too
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1),
        likesCount: 12,
      },
      {
        title: "Design Systems that Scale",
        slug: "design-systems-scale",
        excerpt: "How to build and maintain a resilient design system.",
        content: "Content about design systems...",
        category: "Design",
        status: "published",
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2),
        likesCount: 18,
      },
      {
        title: "Neuroscience of Focus",
        slug: "neuroscience-focus",
        excerpt: "Evidence-based tactics for deep work.",
        content: "Content about focus...",
        category: "Research",
        status: "published",
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3),
        likesCount: 7,
      },
      {
        title: "Explore: Side Projects Playbook",
        slug: "explore-side-projects",
        excerpt: "From idea to shipped in a weekend.",
        content: "Content about side projects...",
        category: "Explore",
        status: "published",
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 4),
        likesCount: 25,
      },
      {
        title: "TypeScript Patterns You’ll Reuse",
        slug: "typescript-patterns",
        excerpt: "Everyday patterns for safer apps.",
        content: "Content about TS patterns...",
        category: "Technology",
        status: "published",
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5),
        likesCount: 3,
      },
    ]

    const results = []
    for (const d of demo) {
      // Upsert by slug so we don't duplicate on repeated calls
      const updated = await Blog.findOneAndUpdate({ slug: d.slug }, { $set: d }, { new: true, upsert: true })
      results.push(updated)
    }

    return res.json({ inserted: results.length, items: results })
  } catch (err) {
    console.error("[seed] error", err)
    return res.status(500).json({ error: "Failed to seed blogs" })
  }
})

export default router
