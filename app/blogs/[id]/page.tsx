"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Navbar } from "@/components/navbar"

export default function BlogDetail() {
  const params = useParams()
  const id = params?.id as string
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState<boolean | null>(null)

  useEffect(() => {
    let mounted = true
    fetch(`http://localhost:8080/api/blogs/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (mounted) {
          setData(d)
          setLoading(false)
        }
      })
    return () => {
      mounted = false
    }
  }, [id])

  async function toggleLike() {
    const res = await fetch(`http://localhost:8080/api/blogs/${id}/like`, { method: "POST" })
    const d = await res.json()
    setLiked(d.liked)
    setData((prev: any) => (prev ? { ...prev, likesCount: d.likesCount } : prev))
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-8">
        {loading ? (
          <p>Loading...</p>
        ) : data ? (
          <>
            <h1 className="text-2xl font-semibold mb-2">{data.title}</h1>
            <div className="text-sm text-neutral-600 mb-4">{data.likesCount} likes</div>
            <div className="w-full aspect-video bg-neutral-200 rounded-md mb-4" aria-hidden />
            <article className="prose max-w-none bg-white border rounded-md p-4">
              <pre className="whitespace-pre-wrap text-sm">{data.content}</pre>
            </article>
            <button onClick={toggleLike} className="mt-4 px-4 py-2 rounded-md bg-black text-white">
              {liked === null ? "Like / Unlike" : liked ? "Unlike" : "Like"}
            </button>
          </>
        ) : (
          <p>Not found</p>
        )}
      </div>
    </main>
  )
}
