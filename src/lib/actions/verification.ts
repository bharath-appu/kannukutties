'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function submitVerificationRequest(utr: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: existing } = await supabase
    .from('verification_requests')
    .select('id, status')
    .eq('user_id', user.id)
    .in('status', ['pending', 'approved'])
    .maybeSingle()

  if (existing) {
    if (existing.status === 'approved') throw new Error('You are already verified')
    throw new Error('You already have a pending verification request')
  }

  const { error } = await supabase
    .from('verification_requests')
    .insert({ user_id: user.id, utr })

  if (error) throw error
  revalidatePath('/settings')
}

export async function getMyVerificationStatus() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: req } = await supabase
    .from('verification_requests')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_verified')
    .eq('id', user.id)
    .single()

  return {
    isVerified: profile?.is_verified || false,
    request: req,
  }
}

function checkAdminEmail(userEmail: string | undefined) {
  const adminEmail = process.env.ADMIN_EMAIL
  return adminEmail && userEmail && userEmail === adminEmail
}

export async function approveVerification(userId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  if (!checkAdminEmail(user.email)) throw new Error('Not authorized')

  const { error: reqError } = await supabase
    .from('verification_requests')
    .update({ status: 'approved', reviewed_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('status', 'pending')

  if (reqError) throw reqError

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ is_verified: true, verified_at: new Date().toISOString() })
    .eq('id', userId)

  if (profileError) throw profileError
  revalidatePath('/settings')
}

export async function rejectVerification(userId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  if (!checkAdminEmail(user.email)) throw new Error('Not authorized')

  const { error } = await supabase
    .from('verification_requests')
    .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('status', 'pending')

  if (error) throw error
  revalidatePath('/settings')
}

export async function getPendingVerifications() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  if (!checkAdminEmail(user.email)) return []

  const { data } = await supabase
    .from('verification_requests')
    .select('*, profiles:user_id(id, username, display_name, avatar_url)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  return data || []
}
