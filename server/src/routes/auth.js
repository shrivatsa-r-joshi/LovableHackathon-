import { Router } from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import User from "../models/User.js"
import { JWT_SECRET } from "../config.js"
import { requireAuth } from "../middleware/auth.js"

const router = Router()

router.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) return res.status(400).json({ error: "Missing fields" })
    const exists = await User.findOne({ email })
    if (exists) return res.status(409).json({ error: "Email already in use" })
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, passwordHash })
    const token = jwt.sign({ sub: user._id.toString(), role: user.role }, JWT_SECRET, { expiresIn: "7d" })
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch {
    res.status(500).json({ error: "Server error" })
  }
})

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ error: "Invalid credentials" })
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return res.status(401).json({ error: "Invalid credentials" })
    const token = jwt.sign({ sub: user._id.toString(), role: user.role }, JWT_SECRET, { expiresIn: "7d" })
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch {
    res.status(500).json({ error: "Server error" })
  }
})

router.get("/auth/me", requireAuth, async (req, res) => {
  res.json({ user: req.user })
})

// Returns whether any admin exists (for convenience)
router.get("/auth/admin-exists", async (_req, res) => {
  const count = await User.countDocuments({ role: "admin" })
  res.json({ exists: count > 0 })
})

// One-time self-promotion with secret, or when no admin exists
router.post("/auth/promote-self", requireAuth, async (req, res) => {
  try {
    const secret = process.env.SAFE_ADMIN_BOOTSTRAP_TOKEN
    const provided = (req.headers["x-bootstrap-token"] || req.query.token || "").toString()
    const noAdmins = (await User.countDocuments({ role: "admin" })) === 0

    if (!noAdmins && (!secret || provided !== secret)) {
      return res.status(403).json({ error: "Forbidden" })
    }

    await User.updateOne({ _id: req.user.id }, { $set: { role: "admin" } })
    const user = await User.findById(req.user.id).lean()
    res.json({ ok: true, user: { id: user._id, role: user.role, email: user.email, name: user.name } })
  } catch (e) {
    res.status(500).json({ error: "Server error" })
  }
})

export default router
