'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/Providers'
import { useRouter } from 'next/navigation'
import {
  getPendingVerifications,
  approveVerification,
  rejectVerification,
} from '@/lib/actions/verification'
import VerifiedBadge from '@/components/VerifiedBadge'
import { Loader2, BadgeCheck, CheckCircle } from 'lucide-react'

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [pendingList, setPendingList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/login'); return }
    getPendingVerifications().then(list => {
      if (list === null) { setIsAdmin(false); setLoading(false); return }
      setPendingList(list)
      setIsAdmin(true)
      setLoading(false)
    }).catch(() => { setIsAdmin(false); setLoading(false) })
  }, [user, authLoading])

  const handleApprove = async (userId: string) => {
    setError(''); setSuccess('')
    try {
      await approveVerification(userId)
      setSuccess('User verified!')
      setPendingList(prev => prev.filter(r => r.user_id !== userId))
    } catch (err: any) {
      setError(err.message || 'Failed to approve')
    }
  }

  const handleReject = async (userId: string) => {
    setError(''); setSuccess('')
    try {
      await rejectVerification(userId)
      setPendingList(prev => prev.filter(r => r.user_id !== userId))
    } catch (err: any) {
      setError(err.message || 'Failed to reject')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#1D9BF0]" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="px-4 py-12 text-center">
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Access Denied</h3>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          You do not have admin permissions.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="border-b border-[var(--border)] px-4 py-3">
        <h1 className="text-lg font-bold text-[var(--text-primary)]">Admin Panel</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          {pendingList.length} pending verification requests
        </p>
      </div>

      {error && (
        <div className="mx-4 mt-4 rounded-[4px] border border-[#F4212E] bg-[#F4212E]/10 p-3 text-sm text-[#F4212E]">
          {error}
        </div>
      )}
      {success && (
        <div className="mx-4 mt-4 rounded-[4px] border border-[#00BA7C] bg-[#00BA7C]/10 p-3 text-sm text-[#00BA7C]">
          {success}
        </div>
      )}

      <div className="divide-y divide-[var(--border)]">
        {pendingList.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#00BA7C]/10">
              <CheckCircle className="h-8 w-8 text-[#00BA7C]" />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">All caught up!</h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              No pending verification requests.
            </p>
          </div>
        ) : (
          pendingList.map(req => (
            <div key={req.id} className="flex items-center justify-between px-4 py-4 hover:bg-[var(--surface-hover)] transition-colors">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-[var(--text-primary)] truncate">
                    {req.profiles?.display_name || req.profiles?.username}
                  </p>
                  <VerifiedBadge size={14} />
                </div>
                <p className="text-sm text-[var(--text-secondary)]">@{req.profiles?.username}</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  UTR: <span className="font-mono">{req.utr}</span>
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {new Date(req.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2 shrink-0 ml-4">
                <button
                  onClick={() => handleApprove(req.user_id)}
                  className="rounded-full bg-[#00BA7C] px-4 py-2 text-sm font-bold text-white hover:bg-[#00BA7C]/90 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(req.user_id)}
                  className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-bold text-[var(--text-secondary)] hover:text-[#F4212E] hover:border-[#F4212E] transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
