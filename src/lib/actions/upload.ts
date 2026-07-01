'use server'

import { createClient } from '@/lib/supabase/server'

export type MediaUploadResult = {
  url: string
  type: 'image' | 'video' | 'audio' | 'document'
}

export async function uploadMedia(file: File): Promise<MediaUploadResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  if (file.size > 50 * 1024 * 1024) {
    throw new Error('File too large. Maximum size is 50MB.')
  }

  let type: 'image' | 'video' | 'audio' | 'document'
  if (file.type.startsWith('image/')) type = 'image'
  else if (file.type.startsWith('video/')) type = 'video'
  else if (file.type.startsWith('audio/')) type = 'audio'
  else if (file.type === 'application/pdf' || file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.type === 'text/plain') type = 'document'
  else throw new Error('Unsupported file type')

  const ext = file.name.split('.').pop()
  const filePath = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(filePath, file)

  if (uploadError) throw uploadError

  const { data: { publicUrl } } = supabase.storage
    .from('media')
    .getPublicUrl(filePath)

  return { url: publicUrl, type }
}
