import { Router } from "express"
const router = Router()

router.get("/health", (req, res) => {
  res.json({ ok: true, uptime: process.uptime() })
})

export default router
