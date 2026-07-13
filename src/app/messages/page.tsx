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
    <div>
      <div className="border-b border-[var(--border)] px-4 py-3">
        <h1 className="text-lg font-bold text-[var(--text-primary)]">Messages</h1>
      </div>
      <ConversationList />
    </div>
  )
}
