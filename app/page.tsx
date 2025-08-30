"use client"
import useSWR from "swr"
import { useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { BlogCard } from "@/components/blog-card"

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || ""
const fetcher = (url: string) => fetch(`${BASE}${url}`).then((r) => r.json())

export default function HomePage() {
  const params = useSearchParams()
  const search = params.get("search") || "" // backend expects "search"
  const category = params.get("category") || ""
  const query = new URLSearchParams({ status: "published" })
  if (search) query.set("search", search)
  if (category) query.set("category", category)

  const { data } = useSWR(`/api/blogs?${query.toString()}`, fetcher)
  const { data: trending } = useSWR(`/api/blogs?status=published&sort=trending&limit=4`, fetcher)

  const blogs = data?.items || []
  const hot = trending?.items || []

  return (
    <main className="min-h-screen bg-neutral-50">
      <Navbar />

      <section className="mx-auto max-w-6xl px-4 py-6">
        <h2 className="mb-3 text-sm font-semibold text-neutral-700">Trending</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {hot.slice(0, 4).map((b: any) => (
            <BlogCard key={b._id || b.id} blog={b} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-700">Latest {category ? `· ${category}` : ""}</h2>
          {search && <span className="text-xs text-neutral-500">Search: “{search}”</span>}
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {blogs.map((b: any) => (
            <BlogCard key={b._id || b.id} blog={b} />
          ))}
        </div>
      </section>
    </main>
  )
}
