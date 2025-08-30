import mongoose from "mongoose"

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: { type: String, default: "" },
    content: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    category: { type: String, default: "Technology", index: true },
    tags: [{ type: String, index: true }],
    status: { type: String, enum: ["pending", "published", "rejected", "hidden"], default: "pending", index: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    likesCount: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export default mongoose.models.Blog || mongoose.model("Blog", blogSchema)
