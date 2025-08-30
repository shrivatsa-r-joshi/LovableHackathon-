import { NextResponse } from "next/server"
import { clearAuthCookie } from "@/lib/auth"

export async function POST() {
  clearAuthCookie()
  // no-cache response for safety
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } })
}
