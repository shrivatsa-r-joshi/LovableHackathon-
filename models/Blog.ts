import { Schema, model, models } from "mongoose"

const BlogSchema = new Schema(
  {
    title: { type: String, required: true },
    contentMarkdown: { type: String, required: true },
    tags: [{ type: String }],
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "published", "rejected", "hidden"], default: "pending", index: true },
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
  },
  { timestamps: true },
)

const LikeSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    blogId: { type: Schema.Types.ObjectId, ref: "Blog", index: true },
  },
  { timestamps: true },
)
LikeSchema.index({ userId: 1, blogId: 1 }, { unique: true })

export const Blog = models.Blog || model("Blog", BlogSchema)
export const Like = models.Like || model("Like", LikeSchema)
