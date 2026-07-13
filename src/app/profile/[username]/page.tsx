import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProfileClient from './ProfileClient'
import SetupNotice from '@/components/SetupNotice'

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params
  const supabase = await createClient()
  if (!supabase) return {}

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, username, bio')
    .eq('username', username)
    .single()

  if (!profile) return {}

  const title = profile.display_name || profile.username
  const description = profile.bio || `View ${title}'s profile on kanukuties`

  return {
    title: `${title} (@${profile.username})`,
    description,
    openGraph: {
      title: `${title} (@${profile.username}) | kanukuties`,
      description,
    },
  }
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createClient()
  if (!supabase) return <SetupNotice />

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  if (!profile.is_verified) {
    const { data: verifReq } = await supabase
      .from('verification_requests')
      .select('status')
      .eq('user_id', profile.id)
      .eq('status', 'approved')
      .maybeSingle()
    if (verifReq) profile.is_verified = true
  }

  const { data: { user } } = await supabase.auth.getUser()
  const isOwnProfile = user?.id === profile.id

  return <ProfileClient profile={profile} isOwnProfile={isOwnProfile} />
}
