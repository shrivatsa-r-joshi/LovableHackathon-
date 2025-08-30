"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { apiFetch, getToken } from "@/lib/api"

// If no admin exists on the server, secret is not required. Otherwise, set SAFE_ADMIN_BOOTSTRAP_TOKEN in your backend env and provide it here.

export default function PromoteAdminPage() {
  const [secret, setSecret] = useState("")
  const [msg, setMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const token = getToken()

  async function onPromote(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    setError(null)
    try {
      const res = await apiFetch<{ ok: boolean; user: any }>("/auth/promote-self", {
        method: "POST",
        headers: secret ? { "x-bootstrap-token": secret } : undefined,
        token: token || undefined,
      })
      setMsg(`Role updated to: ${res.user.role}`)
      // Give the app a moment to update and then go to /admin
      setTimeout(() => router.replace("/admin"), 600)
    } catch (err: any) {
      setError(err?.message || "Failed to promote")
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <Navbar />
      <div className="mx-auto max-w-md px-4 py-10">
        <h1 className="text-xl font-semibold mb-4">Promote to Admin</h1>
        <p className="text-sm text-neutral-600 mb-4">
          If no admin exists yet, you can promote yourself without a secret. Otherwise, your backend must define
          SAFE_ADMIN_BOOTSTRAP_TOKEN and you must enter it below.
        </p>
        <form onSubmit={onPromote} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Bootstrap Secret (optional)</label>
            <input
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              placeholder="SAFE_ADMIN_BOOTSTRAP_TOKEN"
            />
          </div>
          <button className="w-full px-4 py-2 rounded-md bg-black text-white text-sm">Promote me</button>
          {msg && <p className="text-sm text-green-700">{msg}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      </div>
    </main>
  )
}
