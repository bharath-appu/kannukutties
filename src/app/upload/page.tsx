import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PostForm from '@/components/PostForm'
import SetupNotice from '@/components/SetupNotice'

export default async function UploadPage() {
  const supabase = await createClient()
  if (!supabase) return <SetupNotice />
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div>
      <PostForm />
    </div>
  )
}
