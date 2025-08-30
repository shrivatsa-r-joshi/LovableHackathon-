import "dotenv/config"

export const PORT = process.env.PORT || 8080
export const MONGODB_URI = process.env.MONGODB_URI || ""
export const JWT_SECRET = process.env.JWT_SECRET || "change-this-in-prod"
export const CORS_ORIGIN = process.env.CORS_ORIGIN || "*"
