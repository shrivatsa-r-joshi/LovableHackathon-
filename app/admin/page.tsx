"use client"
import useSWR from "swr"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function AdminPage() {
  const { data: me } = useSWR("/api/auth/me", fetcher)
  const { data, mutate } = useSWR("/api/blogs?status=pending", fetcher)
  const { data: published, mutate: mutatePublished } = useSWR("/api/blogs?status=published", fetcher)
  const router = useRouter()

  if (me && me.user && me.user.role !== "admin") router.push("/")

  async function setStatus(id: string, status: "published" | "rejected" | "hidden") {
    await fetch(`/api/blogs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    mutate()
    mutatePublished()
  }

  async function del(id: string) {
    await fetch(`/api/blogs/${id}`, { method: "DELETE" })
    mutate()
    mutatePublished()
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-xl font-semibold mb-4">Admin Moderation</h1>

        <section className="mb-8">
          <h2 className="text-sm font-semibold text-neutral-700 mb-2">Pending</h2>
          <ul className="space-y-3">
            {(data?.blogs || []).map((b: any) => (
              <li key={b.id} className="bg-white border rounded-md p-3 flex items-center justify-between">
                <span className="text-sm">{b.title}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setStatus(b.id, "published")}
                    className="px-3 py-1 rounded-md bg-black text-white text-sm"
                  >
                    Approve
                  </button>
                  <button onClick={() => setStatus(b.id, "rejected")} className="px-3 py-1 rounded-md border text-sm">
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-neutral-700 mb-2">Published</h2>
          <ul className="space-y-3">
            {(published?.blogs || []).map((b: any) => (
              <li key={b.id} className="bg-white border rounded-md p-3 flex items-center justify-between">
                <span className="text-sm">{b.title}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setStatus(b.id, "hidden")} className="px-3 py-1 rounded-md border text-sm">
                    Hide
                  </button>
                  <button onClick={() => del(b.id)} className="px-3 py-1 rounded-md border text-sm">
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  )
}
