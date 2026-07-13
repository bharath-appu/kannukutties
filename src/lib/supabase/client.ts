import { createBrowserClient } from '@supabase/ssr'

const QUERY_TIMEOUT = 4000

function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), QUERY_TIMEOUT)
  const signal = controller.signal as AbortSignal
  return fetch(input, { ...init, signal }).finally(() => clearTimeout(timer))
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key || url.includes('placeholder') || url.includes('supabase.com/dashboard')) {
    return null as any
  }

  return createBrowserClient(url, key, {
    global: { fetch: fetchWithTimeout },
  })
}
