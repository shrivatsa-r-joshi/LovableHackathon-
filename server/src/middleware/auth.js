import jwt from "jsonwebtoken"
import { JWT_SECRET } from "../config.js"
import User from "../models/User.js"

export const requireAuth = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || ""
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null
    if (!token) return res.status(401).json({ error: "Unauthorized" })
    const payload = jwt.verify(token, JWT_SECRET)
    const user = await User.findById(payload.sub).lean()
    if (!user) return res.status(401).json({ error: "Unauthorized" })
    req.user = { id: user._id.toString(), role: user.role, email: user.email, name: user.name }
    next()
  } catch {
    res.status(401).json({ error: "Unauthorized" })
  }
}

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") return res.status(403).json({ error: "Forbidden" })
  next()
}
