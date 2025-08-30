"use client"
import useSWR from "swr"
import { useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { BlogCard } from "@/components/blog-card"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function HomePage() {
  const params = useSearchParams()
  const q = params.get("q") || ""
  const cat = params.get("cat") || ""
  const query = new URLSearchParams({ status: "published" })
  if (q) query.set("q", q)
  if (cat) query.set("cat", cat)

  const { data } = useSWR(`/api/blogs?${query.toString()}`, fetcher)
  const { data: trending } = useSWR(`/api/blogs?status=published&trending=true`, fetcher)

  const blogs = data?.blogs || []
  const hot = trending?.blogs || []

  return (
    <main className="min-h-screen bg-neutral-50">
      <Navbar />

      <section className="mx-auto max-w-6xl px-4 py-6">
        <h2 className="text-sm font-semibold text-neutral-700 mb-3">Trending</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {hot.slice(0, 4).map((b: any) => (
            <BlogCard key={b.id} blog={b} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-neutral-700">Latest {cat ? `· ${cat}` : ""}</h2>
          {q && <span className="text-xs text-neutral-500">Search: “{q}”</span>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {blogs.map((b: any) => (
            <BlogCard key={b.id} blog={b} />
          ))}
        </div>
      </section>
    </main>
  )
}
