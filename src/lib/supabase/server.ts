import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const QUERY_TIMEOUT = 4000

function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), QUERY_TIMEOUT)
  const signal = controller.signal as AbortSignal
  return fetch(input, { ...init, signal })
    .finally(() => clearTimeout(timer))
    .catch(() => new Response(null, { status: 502, statusText: 'Gateway Timeout' }))
}

export async function createClient() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key || url.includes('placeholder') || url.includes('supabase.com/dashboard')) {
      return null as any
    }

    const cookieStore = await cookies()
    return createServerClient(url, key, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
      global: { fetch: fetchWithTimeout },
    })
  } catch { return null as any }
}

export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) return null as any

  return createSupabaseClient(url, key, {
    auth: { persistSession: false },
    global: { fetch: fetchWithTimeout },
  })
}
