import type { MetadataRoute } from 'next'
import { createServiceClient } from '@/lib/supabase/server'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServiceClient()

  const entries: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/explore`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
  ]

  if (supabase) {
    const [profileResult, postResult] = await Promise.allSettled([
      supabase.from('profiles').select('username, updated_at').limit(100),
      supabase.from('posts').select('id, created_at').order('created_at', { ascending: false }).limit(100),
    ])

    if (profileResult.status === 'fulfilled' && profileResult.value.data) {
      for (const p of profileResult.value.data) {
        entries.push({
          url: `${siteUrl}/profile/${p.username}`,
          lastModified: new Date(p.updated_at),
          changeFrequency: 'weekly',
          priority: 0.6,
        })
      }
    }

    if (postResult.status === 'fulfilled' && postResult.value.data) {
      for (const p of postResult.value.data) {
        entries.push({
          url: `${siteUrl}/post/${p.id}`,
          lastModified: new Date(p.created_at),
          changeFrequency: 'monthly',
          priority: 0.5,
        })
      }
    }
  }

  return entries
}
