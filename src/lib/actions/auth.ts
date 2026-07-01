'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signup(formData: FormData) {
  const supabase = await createClient()
  if (!supabase) return { error: 'Supabase not configured' }

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const username = formData.get('username') as string
  const display_name = formData.get('display_name') as string

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

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function login(formData: FormData) {
  const supabase = await createClient()
  if (!supabase) return { error: 'Supabase not configured' }

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  if (!supabase) return { error: 'Supabase not configured' }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) return { error: error.message }
  return { url: data.url }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
