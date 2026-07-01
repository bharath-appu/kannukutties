import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ConversationList from './ConversationList'
import SetupNotice from '@/components/SetupNotice'

export default async function MessagesPage() {
  const supabase = await createClient()
  if (!supabase) return <SetupNotice />
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="py-4 md:py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Messages</h1>
      <ConversationList />
    </div>
  )
}
