"use client"
import Link from "next/link"

export function BlogCard({
  blog,
}: {
  blog: { _id?: string; id?: string; slug?: string; title: string; likesCount?: number }
}) {
  const href = `/blogs/${blog.slug || blog._id || blog.id}`
  return (
    <Link href={href} className="block rounded-md border bg-white transition hover:shadow-sm">
      <div className="w-full aspect-video bg-neutral-200" aria-hidden />
      <div className="border-t px-3 py-2">
        <div className="line-clamp-1 text-sm font-medium">{blog.title}</div>
        {typeof blog.likesCount === "number" && <div className="text-xs text-neutral-500">{blog.likesCount} likes</div>}
      </div>
    </Link>
  )
}
