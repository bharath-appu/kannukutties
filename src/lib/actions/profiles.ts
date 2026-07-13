'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const display_name = formData.get('display_name') as string
  const bio = formData.get('bio') as string

  const { error } = await supabase
    .from('profiles')
    .update({ display_name, bio, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) throw error
  revalidatePath('/settings')
  redirect('/settings')
}

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const file = formData.get('avatar') as File
  if (!file) throw new Error('No file provided')

  const ext = file.name.split('.').pop()
  const filePath = `${user.id}/avatar.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true })

  if (uploadError) throw uploadError

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (updateError) throw updateError
  revalidatePath('/settings')
}

export async function getProfile(username: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (data && !data.is_verified) {
    const { data: verifReq } = await supabase
      .from('verification_requests')
      .select('status')
      .eq('user_id', data.id)
      .eq('status', 'approved')
      .maybeSingle()
    if (verifReq) data.is_verified = true
  }

  return data
}

export async function getCurrentProfile() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data && !data.is_verified) {
      const { data: verifReq } = await supabase
        .from('verification_requests')
        .select('status')
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .maybeSingle()
      if (verifReq) data.is_verified = true
    }

    return data
  } catch { return null }
}

export async function searchProfiles(query: string) {
  try {
    const supabase = await createClient()
    if (!supabase) return []
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .limit(20)

    return data || []
  } catch { return [] }
}
