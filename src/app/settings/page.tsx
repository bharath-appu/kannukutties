'use client'

import { useState, useEffect } from 'react'
import { getCurrentProfile, updateProfile } from '@/lib/actions/profiles'
import { useAuth } from '@/components/Providers'
import { useRouter } from 'next/navigation'
import { proxyMediaUrl } from '@/lib/media'
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
    Promise.all([
      getCurrentProfile().catch(() => null),
      getMyVerificationStatus().catch(() => null),
      getPendingVerifications().catch(() => null),
    ]).then(([profile, verif, pending]) => {
      setProfile(profile as any)
      if (verif) setVerifStatus(verif as any)
      if (pending && pending !== null) {
        setPendingList(pending as any)
        setIsAdmin(true)
      }
      setLoading(false)
    }).catch(() => setLoading(false))
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
        <Loader2 className="h-8 w-8 animate-spin text-[#1D9BF0]" />
      </div>
    )
  }

  return (
    <div className="border-b border-[var(--border)]">
      <div className="border-b border-[var(--border)] px-4 py-3">
        <h1 className="text-lg font-bold text-[var(--text-primary)]">Settings</h1>
      </div>

      <div className="border-b border-[var(--border)] px-4 py-4">
        <h2 className="mb-4 text-base font-bold text-[var(--text-primary)]">Profile</h2>

        {error && <div className="mb-4 rounded-[4px] border border-[#F4212E] bg-[#F4212E]/10 p-3 text-sm text-[#F4212E]">{error}</div>}
        {success && <div className="mb-4 rounded-[4px] border border-[#00BA7C] bg-[#00BA7C]/10 p-3 text-sm text-[#00BA7C]">{success}</div>}

        <div className="mb-6 flex items-center gap-4">
          <div className="group relative h-20 w-20 overflow-hidden rounded-full bg-[#1D9BF0]">
            {profile?.avatar_url ? (
              <img src={proxyMediaUrl(profile.avatar_url)!} alt="" className="h-full w-full object-cover" />
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
            <p className="font-bold text-[var(--text-primary)]">{profile?.display_name || 'User'}</p>
            <p className="text-sm text-[var(--text-secondary)]">@{profile?.username}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)]">Display name</label>
            <input
              name="display_name"
              defaultValue={profile?.display_name || ''}
              className="mt-1 w-full rounded-[4px] border border-[var(--border)] bg-transparent px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[#1D9BF0] focus:shadow-[0_0_0_1px_#1D9BF0]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)]">Bio</label>
            <textarea
              name="bio"
              rows={3}
              defaultValue={profile?.bio || ''}
              className="mt-1 w-full resize-none rounded-[4px] border border-[var(--border)] bg-transparent px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[#1D9BF0] focus:shadow-[0_0_0_1px_#1D9BF0]"
              maxLength={500}
            />
            <p className="mt-1 text-xs text-[var(--text-secondary)]">Max 500 characters</p>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-full bg-[#1D9BF0] px-6 py-2 text-sm font-bold text-white hover:bg-[#1A8CD8] disabled:opacity-50 transition-colors"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>

      <div className="border-b border-[var(--border)] px-4 py-4">
        <h2 className="mb-4 text-base font-bold text-[var(--text-primary)]">Account</h2>
        <p className="text-sm text-[var(--text-secondary)]">Email: {user?.email}</p>
        <p className="text-sm text-[var(--text-secondary)]">User ID: {user?.id}</p>
      </div>

      <div className="border-b border-[var(--border)]" id="verification">
        <div className="bg-[#1D9BF0] px-4 py-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BadgeCheck className="h-5 w-5" />
            Blue Tick Verification
          </h2>
          <p className="text-blue-100 text-sm mt-1">Get verified and stand out on kanukuties</p>
        </div>

        {verifStatus?.isVerified ? (
          <div className="px-4 py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#1D9BF0]/10">
              <BadgeCheck className="h-10 w-10 text-[#1D9BF0]" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">You are verified!</h3>
            <p className="text-[var(--text-secondary)] text-sm mb-6">Your blue badge is active on your profile.</p>
          </div>
        ) : verifStatus?.request?.status === 'pending' ? (
          <div className="px-4 py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10">
              <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">Verification Pending</h3>
            <p className="text-[var(--text-secondary)] text-sm mb-2">Admin will review your request shortly.</p>
            <div className="mx-auto max-w-xs rounded-[4px] border border-[var(--border)] p-3">
              <p className="text-xs text-[var(--text-secondary)]">
                UTR: <span className="font-mono font-medium">{verifStatus.request.utr}</span>
              </p>
            </div>
          </div>
        ) : showVerificationFlow ? (
          <div className="px-4 py-6">
            <button
              onClick={() => setShowVerificationFlow(false)}
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4 flex items-center gap-1 transition-colors"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
              Back
            </button>

            {verifError && (
              <div className="mb-4 rounded-[4px] border border-[#F4212E] bg-[#F4212E]/10 p-3 text-sm text-[#F4212E] flex items-center gap-2">
                <CircleCheck className="h-4 w-4 shrink-0" />
                {verifError}
              </div>
            )}
            {verifSuccess && (
              <div className="mb-4 rounded-[4px] border border-[#00BA7C] bg-[#00BA7C]/10 p-3 text-sm text-[#00BA7C] flex items-center gap-2">
                <CircleCheck className="h-4 w-4 shrink-0" />
                {verifSuccess}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1D9BF0] text-xs font-bold text-white">1</span>
                  <span className="font-medium text-[var(--text-primary)] text-sm">Pay ₹1 to this UPI ID</span>
                </div>
                <div className="ml-10 rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <code className="flex-1 rounded-[4px] border border-[var(--border)] bg-transparent px-3 py-2.5 text-sm font-mono text-[var(--foreground)]">{UPI_ID}</code>
                    <button
                      onClick={copyUpiId}
                      className="rounded-[4px] border border-[var(--border)] bg-transparent p-2.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                      title="Copy UPI ID"
                    >
                      {copied ? <CheckCircle className="h-5 w-5 text-[#00BA7C]" /> : <Clipboard className="h-5 w-5" />}
                    </button>
                  </div>
                  <a
                    href={UPI_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1D9BF0] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#1A8CD8] transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Pay ₹1 via GPay / UPI
                  </a>
                  <p className="text-xs text-[var(--text-secondary)] mt-2 text-center">
                    Opens GPay, PhonePe, PayTM — send exactly ₹1
                  </p>
                </div>
              </div>

              <div className="border-t border-[var(--border)] pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1D9BF0] text-xs font-bold text-white">2</span>
                  <span className="font-medium text-[var(--text-primary)] text-sm">Enter UTR from your payment receipt</span>
                </div>
                <div className="ml-10">
                  <form onSubmit={handleVerificationSubmit}>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={utr}
                        onChange={e => setUtr(e.target.value)}
                        placeholder="e.g. HDFC123456789"
                        className="flex-1 rounded-[4px] border border-[var(--border)] bg-transparent px-3 py-2.5 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--text-secondary)] focus:border-[#1D9BF0]"
                        maxLength={50}
                      />
                      <button
                        type="submit"
                        disabled={verifSubmitting}
                        className="flex items-center gap-2 rounded-full bg-[#1D9BF0] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1A8CD8] disabled:opacity-50 transition-colors"
                      >
                        {verifSubmitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ArrowRight className="h-4 w-4" />
                        )}
                        Submit
                      </button>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-2">
                      UTR is the 12-digit reference number on your GPay / PhonePe receipt
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-4 py-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#1D9BF0] shadow-lg">
                <VerifiedBadge size={40} />
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium text-[#1D9BF0] mb-3">
                <Sparkles className="h-3 w-3" />
                One-time payment · Lifetime badge
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)]">Get the Blue Tick</h3>
              <p className="text-[var(--text-secondary)] text-sm mt-2 max-w-xs">
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
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1D9BF0]/10">
                    <CircleCheck className="h-3 w-3 text-[#1D9BF0]" />
                  </div>
                  <span className="text-sm text-[var(--text-primary)]">{text}</span>
                </div>
              ))}
            </div>

            <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[var(--text-primary)]">Blue Tick Verification</span>
                  <VerifiedBadge size={14} />
                </div>
                <span className="text-lg font-bold text-[var(--text-primary)]">₹1</span>
              </div>
            </div>

            <button
              onClick={() => setShowVerificationFlow(true)}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1D9BF0] px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-[#1A8CD8] transition-all"
            >
              <BadgeCheck className="h-5 w-5" />
              Get Blue Tick for ₹1
            </button>
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="border-b border-[var(--border)]">
          <div className="bg-[#1D9BF0] px-4 py-4">
            <h2 className="font-bold text-white flex items-center gap-2">
              <Loader2 className="h-4 w-4" />
              Pending Verifications ({pendingList.length})
            </h2>
          </div>
          <div className="px-4 py-4 space-y-3">
            {pendingList.length === 0 ? (
              <div className="py-6 text-center text-sm text-[var(--text-secondary)]">
                No pending verification requests.
              </div>
            ) : (
              pendingList.map(req => (
                <div key={req.id} className="flex items-center justify-between rounded-[16px] border border-[var(--border)] p-3 hover:bg-[var(--surface-hover)] transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-[var(--text-primary)] text-sm truncate">
                        {req.profiles?.display_name || req.profiles?.username}
                      </p>
                      <VerifiedBadge size={12} />
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">@{req.profiles?.username}</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      UTR: <span className="font-mono">{req.utr}</span> · {new Date(req.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => handleApprove(req.user_id)}
                      className="rounded-full bg-[#00BA7C] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#00BA7C]/90 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(req.user_id)}
                      className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-bold text-[var(--text-secondary)] hover:text-[#F4212E] hover:border-[#F4212E] transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
