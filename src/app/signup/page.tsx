'use client'

import { useState } from 'react'
import { signInWithGoogle } from '@/lib/actions/auth'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Aurora from '@/components/reactbits/Aurora'

export default function SignupPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const username = formData.get('username') as string
    const display_name = formData.get('display_name') as string
    const supabase = createClient()
    if (!supabase) { setError('Supabase not configured'); setLoading(false); return }
    const { error: authError, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, display_name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (authError) { setError(authError.message); setLoading(false); return }
    if (data?.user?.identities?.length === 0) {
      setError('An account with this email already exists.')
      setLoading(false)
      return
    }
    window.location.href = '/'
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    setError('')
    const result = await signInWithGoogle()
    if (result?.error) {
      setError(result.error)
      setGoogleLoading(false)
      return
    }
    if (result?.url) window.location.href = result.url
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <Aurora colorStops={["#8b5cf6", "#6366f1", "#3b82f6", "#8b5cf6"]} speed={3} blur={80} />
      <div className="relative z-10 w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">kanukuties</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-white/20 bg-white/90 p-6 backdrop-blur-sm">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              name="username"
              type="text"
              required
              pattern="[a-zA-Z0-9_]+"
              title="Letters, numbers, and underscores only"
              className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="your_username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Display name</label>
            <input
              name="display_name"
              type="text"
              className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Your Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="At least 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-purple-600 py-2.5 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white/90 dark:bg-[#1a1a2e]/90 px-2 text-gray-500 dark:text-gray-400">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/30 bg-white/80 py-2.5 text-sm font-medium text-gray-700 hover:bg-white transition-colors disabled:opacity-50 backdrop-blur-sm"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {googleLoading ? 'Redirecting...' : 'Sign up with Google'}
          </button>

          <p className="text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-purple-300 hover:text-purple-200 underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
