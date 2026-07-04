'use server'

import { createClient } from '@/lib/supabase/server'

export async function signup(formData: FormData) {
  const supabase = await createClient()
  if (!supabase) return { error: 'Supabase not configured' }

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const username = formData.get('username') as string
  const display_name = formData.get('display_name') as string

  try {
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, display_name },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      },
    })

    if (error) return { error: error.message }

    if (data?.user?.identities?.length === 0) {
      return { error: 'An account with this email already exists.' }
    }

    return { success: true }
  } catch (e) {
    return { error: 'Network error. Check your Supabase URL and anon key are set in your Vercel environment variables.' }
  }
}

export async function login(formData: FormData) {
  const supabase = await createClient()
  if (!supabase) return { error: 'Supabase not configured' }

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return { success: true }
  } catch (e) {
    return { error: 'Network error. Check your Supabase URL and anon key are set in your Vercel environment variables.' }
  }
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  if (!supabase) return { error: 'Supabase not configured' }

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      },
    })

    if (error) return { error: error.message }
    return { url: data.url }
  } catch (e) {
    return { error: 'Network error. Check your Supabase URL and anon key are set in your Vercel environment variables.' }
  }
}

export async function logout() {
  const supabase = await createClient()
  if (!supabase) return
  try {
    await supabase.auth.signOut()
  } catch {}
}
