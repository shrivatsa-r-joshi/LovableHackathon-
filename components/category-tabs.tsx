"use client"

import { useRouter, useSearchParams } from "next/navigation"

const CATEGORIES = ["Technology", "Design", "Research", "Explore"]

export default function CategoryTabs() {
  const router = useRouter()
  const params = useSearchParams()
  const active = params.get("category") || ""

  const click = (cat: string) => {
    const usp = new URLSearchParams(Array.from(params.entries()))
    if (cat) usp.set("category", cat)
    else usp.delete("category")
    router.push(`/?${usp.toString()}`)
  }

  return (
    <div className="w-full border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center gap-6 overflow-x-auto px-4 py-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => click(c)}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-sm ${
              active === c ? "bg-black text-white" : "text-neutral-700 hover:text-black"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  )
}
