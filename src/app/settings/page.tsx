'use client'

import { useState, useEffect } from 'react'
import { getCurrentProfile, updateProfile } from '@/lib/actions/profiles'
import { useAuth } from '@/components/Providers'
import { useRouter } from 'next/navigation'
import { Camera, Loader2, Save, BadgeCheck, ExternalLink, Clipboard, CheckCircle, ChevronRight, ArrowRight, CircleCheck, Sparkles } from 'lucide-react'
import type { Profile } from '@/lib/types'
import VerifiedBadge from '@/components/VerifiedBadge'
import {
  submitVerificationRequest,
  getMyVerificationStatus,
  getPendingVerifications,
  approveVerification,
  rejectVerification,
} from '@/lib/actions/verification'

export default function SettingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [verifStatus, setVerifStatus] = useState<{ isVerified: boolean; request: any } | null>(null)
  const [utr, setUtr] = useState('')
  const [verifSubmitting, setVerifSubmitting] = useState(false)
  const [verifError, setVerifError] = useState('')
  const [verifSuccess, setVerifSuccess] = useState('')
  const [copied, setCopied] = useState(false)
  const [showVerificationFlow, setShowVerificationFlow] = useState(false)
  const [pendingList, setPendingList] = useState<any[]>([])
  const [isAdmin, setIsAdmin] = useState(false)

  const UPI_ID = 'barathappu777-3@okhdfcbank'
  const UPI_LINK = `upi://pay?pa=${UPI_ID}&pn=Kanukuties&am=1.00&cu=INR&tn=Blue%20Tick%20Verification`

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    getCurrentProfile().then(p => {
      setProfile(p)
      setLoading(false)
    })
    getMyVerificationStatus().then(setVerifStatus)
    getPendingVerifications().then(list => {
      if (list === null) return
      setPendingList(list)
      setIsAdmin(true)
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

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setVerifError('')
    setVerifSuccess('')
    if (!utr.trim()) { setVerifError('Please enter the UTR number'); return }
    setVerifSubmitting(true)
    try {
      await submitVerificationRequest(utr.trim())
      setVerifSuccess('Request submitted! Wait for admin approval.')
      setUtr('')
      const status = await getMyVerificationStatus()
      setVerifStatus(status)
    } catch (err: any) {
      setVerifError(err.message || 'Failed to submit')
    }
    setVerifSubmitting(false)
  }

  const handleApprove = async (userId: string) => {
    try {
      await approveVerification(userId)
      setVerifSuccess('User verified!')
      setPendingList(prev => prev.filter(r => r.user_id !== userId))
    } catch (err: any) {
      setVerifError(err.message || 'Failed to approve')
    }
  }

  const handleReject = async (userId: string) => {
    try {
      await rejectVerification(userId)
      setPendingList(prev => prev.filter(r => r.user_id !== userId))
    } catch (err: any) {
      setVerifError(err.message || 'Failed to reject')
    }
  }

  const copyUpiId = () => {
    navigator.clipboard.writeText(UPI_ID)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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

        <div className="rounded-xl border bg-white overflow-hidden" id="verification">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BadgeCheck className="h-5 w-5" />
              Blue Tick Verification
            </h2>
            <p className="text-blue-100 text-sm mt-1">Get verified and stand out on kanukuties</p>
          </div>

          {verifStatus?.isVerified ? (
            <div className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <BadgeCheck className="h-10 w-10 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">You are verified!</h3>
              <p className="text-gray-500 text-sm mb-6">Your blue badge is active on your profile.</p>
              <div className="mx-auto max-w-xs rounded-lg bg-blue-50 border border-blue-100 p-4">
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-700">
                  <span>@{profile?.username}</span>
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
                    <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3 text-white">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          ) : verifStatus?.request?.status === 'pending' ? (
            <div className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
                <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Verification Pending</h3>
              <p className="text-gray-500 text-sm mb-2">Admin will review your request shortly.</p>
              <div className="mx-auto max-w-xs rounded-lg bg-yellow-50 border border-yellow-100 p-3">
                <p className="text-xs text-yellow-700">
                  UTR: <span className="font-mono font-medium">{verifStatus.request.utr}</span>
                </p>
              </div>
            </div>
          ) : showVerificationFlow ? (
            <div className="p-6">
              <button
                onClick={() => setShowVerificationFlow(false)}
                className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1 transition-colors"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
                Back
              </button>

              {verifError && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600 flex items-center gap-2">
                  <CircleCheck className="h-4 w-4 shrink-0 text-red-400" />
                  {verifError}
                </div>
              )}
              {verifSuccess && (
                <div className="mb-4 rounded-lg bg-green-50 border border-green-100 p-3 text-sm text-green-600 flex items-center gap-2">
                  <CircleCheck className="h-4 w-4 shrink-0 text-green-400" />
                  {verifSuccess}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">1</span>
                    <span className="font-medium text-gray-900 text-sm">Pay ₹1 to this UPI ID</span>
                  </div>
                  <div className="ml-10 rounded-xl border bg-gray-50 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <code className="flex-1 rounded-lg border bg-white px-3 py-2.5 text-sm font-mono">{UPI_ID}</code>
                      <button
                        onClick={copyUpiId}
                        className="rounded-lg border bg-white p-2.5 text-gray-500 hover:text-gray-700 transition-colors"
                        title="Copy UPI ID"
                      >
                        {copied ? <CheckCircle className="h-5 w-5 text-green-500" /> : <Clipboard className="h-5 w-5" />}
                      </button>
                    </div>
                    <a
                      href={UPI_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Pay ₹1 via GPay / UPI
                    </a>
                    <p className="text-xs text-gray-400 mt-2 text-center">
                      Opens GPay, PhonePe, PayTM — send exactly ₹1
                    </p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">2</span>
                    <span className="font-medium text-gray-900 text-sm">Enter UTR from your payment receipt</span>
                  </div>
                  <div className="ml-10">
                    <form onSubmit={handleVerificationSubmit}>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={utr}
                          onChange={e => setUtr(e.target.value)}
                          placeholder="e.g. HDFC123456789"
                          className="flex-1 rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                          maxLength={50}
                        />
                        <button
                          type="submit"
                          disabled={verifSubmitting}
                          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                          {verifSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ArrowRight className="h-4 w-4" />
                          )}
                          Submit
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        UTR is the 12-digit reference number on your GPay / PhonePe receipt
                      </p>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-200">
                  <svg viewBox="0 0 24 24" fill="none" className="h-10 w-10 text-white">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor" />
                  </svg>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-medium text-blue-600 mb-3">
                  <Sparkles className="h-3 w-3" />
                  One-time payment · Lifetime badge
                </div>
                <h3 className="text-xl font-bold text-gray-900">Get the Blue Tick</h3>
                <p className="text-gray-500 text-sm mt-2 max-w-xs">
                  Verify your account and get a blue badge on your profile.
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  'Verified badge on your profile & posts',
                  'Stand out in comments and searches',
                  'One-time ₹1 payment, valid forever',
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100">
                      <CircleCheck className="h-3 w-3 text-blue-600" />
                    </div>
                    <span className="text-sm text-gray-700">{text}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border-2 border-blue-100 bg-blue-50 p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Blue Tick Verification</span>
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-500">
                      <svg viewBox="0 0 24 24" fill="none" className="h-2.5 w-2.5 text-white">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor" />
                      </svg>
                    </span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">₹1</span>
                </div>
              </div>

              <button
                onClick={() => setShowVerificationFlow(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 hover:shadow-xl hover:from-blue-600 hover:to-blue-700 transition-all"
              >
                <BadgeCheck className="h-5 w-5" />
                Get Blue Tick for ₹1
              </button>
            </div>
          )}
        </div>

        {isAdmin && pendingList.length > 0 && (
          <div className="rounded-xl border bg-white overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4">
              <h2 className="font-bold text-white flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Pending Verifications ({pendingList.length})
              </h2>
            </div>
            <div className="p-4 space-y-3">
              {pendingList.map(req => (
                <div key={req.id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {req.profiles?.display_name || req.profiles?.username}
                      </p>
                      <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gray-200">
                        <svg viewBox="0 0 24 24" fill="none" className="h-2.5 w-2.5 text-gray-400">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor" />
                        </svg>
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">@{req.profiles?.username}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      UTR: <span className="font-mono">{req.utr}</span> · {new Date(req.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => handleApprove(req.user_id)}
                      className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 transition-colors"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => handleReject(req.user_id)}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      ✕ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
