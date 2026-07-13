const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

export function proxyMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null
  if (!supabaseUrl || !url.startsWith(supabaseUrl)) return url
  return `/api/media?url=${encodeURIComponent(url)}`
}
