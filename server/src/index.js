import express from "express"
import mongoose from "mongoose"
import morgan from "morgan"
import cors from "cors"
import { PORT, MONGODB_URI, CORS_ORIGIN } from "./config.js"
import healthRoutes from "./routes/health.js"
import authRoutes from "./routes/auth.js"
import blogRoutes from "./routes/blogs.js"

const app = express()

app.use(morgan("tiny"))
app.use(express.json({ limit: "1mb" }))
app.use(
  cors({
    origin: CORS_ORIGIN === "*" ? true : CORS_ORIGIN,
    credentials: false,
  }),
)

app.use("/api", healthRoutes)
app.use("/api", authRoutes)
app.use("/api", blogRoutes)

app.use((req, res) => res.status(404).json({ error: "Not found" }))
app.use((err, req, res, next) => {
  console.error("[server-error]", err)
  res.status(500).json({ error: "Server error" })
})

const start = async () => {
  if (!MONGODB_URI) {
    console.error("Missing MONGODB_URI")
    process.exit(1)
  }
  await mongoose.connect(MONGODB_URI)
  app.listen(PORT, () => console.log(`API listening on :${PORT}`))
}
start()
