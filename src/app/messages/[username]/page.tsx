import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Chat from './Chat'
import SetupNotice from '@/components/SetupNotice'

export default async function ChatPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createClient()
  if (!supabase) return <SetupNotice />
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: otherProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!otherProfile) notFound()

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col py-4 md:py-8">
      <Chat otherUser={otherProfile} />
    </div>
  )
}
