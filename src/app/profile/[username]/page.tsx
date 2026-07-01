import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProfileClient from './ProfileClient'
import SetupNotice from '@/components/SetupNotice'

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

  const { data: { user } } = await supabase.auth.getUser()
  const isOwnProfile = user?.id === profile.id

  return <ProfileClient profile={profile} isOwnProfile={isOwnProfile} />
}
