"use client"
import Link from "next/link"

export function BlogCard({ blog }: { blog: { id: string; title: string; likesCount: number } }) {
  return (
    <Link href={`/blogs/${blog.id}`} className="block rounded-md border bg-white hover:shadow-sm transition">
      <div className="w-full aspect-video bg-neutral-200" aria-hidden />
      <div className="px-3 py-2 border-t">
        <div className="text-sm font-medium line-clamp-1">{blog.title}</div>
        <div className="text-xs text-neutral-500">{blog.likesCount} likes</div>
      </div>
    </Link>
  )
}
