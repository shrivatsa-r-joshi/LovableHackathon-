const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || ""

type FetchOptions = RequestInit & { token?: string }

export async function apiFetch<T = any>(path: string, opts: FetchOptions = {}): Promise<T> {
  const headers: HeadersInit = { "Content-Type": "application/json", ...(opts.headers || {}) }
  if (opts.token) headers["Authorization"] = `Bearer ${opts.token}`
  const res = await fetch(`${BASE}${path}`, { ...opts, headers, cache: "no-store" })
  if (!res.ok) throw new Error(await res.text().catch(() => `Request failed ${res.status}`))
  return (await res.json()) as T
}

// Token helpers
export const authStorageKey = "auth_token"

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage.getItem(authStorageKey)
  } catch {
    return null
  }
}

export function setToken(token: string) {
  try {
    window.localStorage.setItem(authStorageKey, token)
  } catch {}
}

export function clearToken() {
  try {
    window.localStorage.removeItem(authStorageKey)
  } catch {}
}

/**
 * SWR-compatible fetcher that automatically attaches Authorization when a token is provided in the key.
 * Usage: useSWR(["/auth/me", getToken()], swrAuthFetcher)
 */
export async function swrAuthFetcher([path, token]: [string, string | null]) {
  return apiFetch(path, token ? { token } : {})
}
