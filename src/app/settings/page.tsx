'use client'

import { useState, useEffect } from 'react'
import { getCurrentProfile, updateProfile } from '@/lib/actions/profiles'
import { useAuth } from '@/components/Providers'
import { useRouter } from 'next/navigation'
import { Camera, Loader2, Save } from 'lucide-react'
import type { Profile } from '@/lib/types'

export default function SettingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    getCurrentProfile().then(p => {
      setProfile(p)
      setLoading(false)
    })
  }, [user])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const formData = new FormData(e.currentTarget)
      await updateProfile(formData)
      setSuccess('Profile updated!')
      const updated = await getCurrentProfile()
      setProfile(updated)
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    }
    setSaving(false)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      const { uploadAvatar } = await import('@/lib/actions/profiles')
      await uploadAvatar(formData)
      setSuccess('Avatar updated!')
      window.location.reload()
    } catch {
      setError('Failed to upload avatar')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="py-4 md:py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Settings</h1>

      <div className="space-y-6">
        <div className="rounded-xl border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Profile</h2>

          {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
          {success && <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-600">{success}</div>}

          <div className="mb-6 flex items-center gap-4">
            <div className="group relative h-20 w-20 overflow-hidden rounded-full bg-gradient-to-br from-blue-400 to-purple-500">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-white">
                  {profile?.display_name?.[0] || user?.email?.[0].toUpperCase() || '?'}
                </div>
              )}
              <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/0 text-white opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                <Camera className="h-6 w-6" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>
            </div>
            <div>
              <p className="font-semibold text-gray-900">{profile?.display_name || 'User'}</p>
              <p className="text-sm text-gray-500">@{profile?.username}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Display name</label>
              <input
                name="display_name"
                defaultValue={profile?.display_name || ''}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bio</label>
              <textarea
                name="bio"
                rows={3}
                defaultValue={profile?.bio || ''}
                className="mt-1 w-full resize-none rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={500}
              />
              <p className="mt-1 text-xs text-gray-400">Max 500 characters</p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </form>
        </div>

        <div className="rounded-xl border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Account</h2>
          <p className="text-sm text-gray-500">Email: {user?.email}</p>
          <p className="text-sm text-gray-500">User ID: {user?.id}</p>
        </div>
      </div>
    </div>
  )
}
