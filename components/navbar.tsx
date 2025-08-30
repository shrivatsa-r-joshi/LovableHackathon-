"use client"
import Link from "next/link"
import type React from "react"
import { usePathname } from "next/navigation"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import useSWR from "swr"
import { useSWRConfig } from "swr"
import { getToken, clearToken } from "@/lib/api"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" width="18" height="18" {...props}>
      <path
        fill="currentColor"
        d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19 15.5 14Zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14Z"
      />
    </svg>
  )
}

export function Navbar() {
  const router = useRouter()
  const params = useSearchParams()
  const { mutate } = useSWRConfig() // SWR global mutate
  const [q, setQ] = useState(params.get("search") || "")
  const token = getToken()
  const { data } = useSWR(["/auth/me", token], fetcher)
  const user = data?.user
  const pathname = usePathname()
  const showCategories = pathname !== "/login" && pathname !== "/register" && pathname !== "/admin"

  useEffect(() => {
    setQ(params.get("search") || "")
  }, [params])

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const base = "/"
    const url = new URL(window.location.origin + base)
    if (q) url.searchParams.set("search", q)
    const category = params.get("category")
    if (category) url.searchParams.set("category", category)
    router.push(url.pathname + url.search)
  }

  async function logout() {
    const current = getToken()
    clearToken()
    // Invalidate any SWR keys matching ['/auth/me', token]
    await mutate((key) => Array.isArray(key) && key[0] === "/auth/me", undefined, false)
    router.replace("/")
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4">
        <Link href="/" className="font-semibold text-xl">
          BlogGate
        </Link>

        <form onSubmit={onSubmit} className="flex-1">
          <div className="flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-2">
            <SearchIcon className="text-neutral-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search"
              className="bg-transparent outline-none flex-1 text-sm"
              aria-label="Search blogs"
            />
          </div>
        </form>

        <nav className="flex items-center gap-4">
          <Link href="/about" className="text-sm text-neutral-700">
            About
          </Link>
          {user ? (
            <>
              <Link href="/write" className="px-4 py-2 rounded-full bg-black text-white text-sm">
                Write
              </Link>
              <Link href="/profile" className="text-sm text-neutral-700">
                Profile
              </Link>
              {user.role === "admin" && (
                <Link href="/admin" className="text-sm text-blue-600">
                  Admin
                </Link>
              )}
              <button onClick={logout} className="text-sm text-neutral-600">
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="px-4 py-2 rounded-full bg-black text-white text-sm">
              Write
            </Link>
          )}
        </nav>
      </div>

      {showCategories && (
        <div className="border-t bg-white">
          <div className="mx-auto max-w-6xl px-4">
            <ul className="flex items-center gap-6 text-sm text-neutral-700 py-2 overflow-x-auto">
              {["technology", "design", "research", "explore"].map((c) => (
                <li key={c}>
                  <Link href={`/?category=${c}`} className="capitalize">
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </header>
  )
}
