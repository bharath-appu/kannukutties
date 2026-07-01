import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Chat from './Chat'
import SetupNotice from '@/components/SetupNotice'

export default async function ChatPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params
  const supabase = await createClient()
  if (!supabase) return <SetupNotice />
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: otherProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (!otherProfile) redirect('/messages')

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col py-4 md:py-8">
      <Chat otherUser={otherProfile} />
    </div>
  )
}
