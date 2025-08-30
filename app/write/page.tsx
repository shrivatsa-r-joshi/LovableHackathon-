"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"

export default function WritePage() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState("")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function submit() {
    setError(null)
    const res = await fetch("/api/blogs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        contentMarkdown: content,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      }),
    })
    const data = await res.json()
    if (!res.ok) return setError(data.error || "Failed to submit")
    router.push("/profile")
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 py-8 grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm mb-1">Title</label>
          <input
            className="w-full border rounded-md px-3 py-2 mb-4"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <label className="block text-sm mb-1">Tags (comma separated)</label>
          <input
            className="w-full border rounded-md px-3 py-2 mb-4"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <label className="block text-sm mb-1">Content (Markdown)</label>
          <textarea
            className="w-full border rounded-md px-3 py-2 h-80"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          <button onClick={submit} className="mt-4 px-4 py-2 rounded-md bg-black text-white">
            Submit for approval
          </button>
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-2">Preview</h3>
          <article className="prose prose-sm max-w-none bg-white border rounded-md p-4">
            <pre className="whitespace-pre-wrap text-sm">{content || "Start typing markdown..."}</pre>
          </article>
        </div>
      </div>
    </main>
  )
}
