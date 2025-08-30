"use client"
import useSWR from "swr"
import { Navbar } from "@/components/navbar"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ProfilePage() {
  const { data: me } = useSWR("/api/auth/me", fetcher)
  const { data: pending } = useSWR("/api/blogs?status=pending&mine=true", fetcher)
  const { data: published } = useSWR("/api/blogs?status=published&mine=true", fetcher)

  return (
    <main className="min-h-screen bg-neutral-50">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-xl font-semibold mb-4">My Articles</h1>
        {!me?.user && <p className="text-sm">Please login to see your articles.</p>}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-neutral-700 mb-2">Pending</h2>
          <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {(pending?.blogs || []).map((b: any) => (
              <li key={b.id} className="border rounded-md bg-white p-3">
                {b.title}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="text-sm font-semibold text-neutral-700 mb-2">Published</h2>
          <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {(published?.blogs || []).map((b: any) => (
              <li key={b.id} className="border rounded-md bg-white p-3">
                {b.title}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  )
}
