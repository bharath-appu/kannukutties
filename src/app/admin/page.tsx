'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/Providers'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  getPendingVerifications,
  getAllUsers,
  approveVerification,
  rejectVerification,
} from '@/lib/actions/verification'
import VerifiedBadge from '@/components/VerifiedBadge'
import { Loader2, BadgeCheck, CheckCircle, Users, Clock } from 'lucide-react'

type Tab = 'users' | 'pending'

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('users')
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [pendingList, setPendingList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/login'); return }
    Promise.all([
      getAllUsers(),
      getPendingVerifications(),
    ]).then(([users, pending]) => {
      if (users === null) { setIsAdmin(false); setLoading(false); return }
      setAllUsers(users)
      setPendingList(pending || [])
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
      setAllUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, is_verified: true, verification: { ...u.verification, status: 'approved' } } : u
      ))
    } catch (err: any) {
      setError(err.message || 'Failed to approve')
    }
  }

  const handleReject = async (userId: string) => {
    setError(''); setSuccess('')
    try {
      await rejectVerification(userId)
      setPendingList(prev => prev.filter(r => r.user_id !== userId))
      setAllUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, verification: { ...u.verification, status: 'rejected' } } : u
      ))
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

  const getBadge = (userProf: any) => {
    if (userProf.is_verified) return { label: 'Verified', color: 'text-[#00BA7C]', bg: 'bg-[#00BA7C]/10' }
    const req = userProf.verification
    if (req?.status === 'pending') return { label: 'Pending', color: 'text-yellow-500', bg: 'bg-yellow-500/10' }
    if (req?.status === 'rejected') return { label: 'Rejected', color: 'text-[#F4212E]', bg: 'bg-[#F4212E]/10' }
    return { label: 'None', color: 'text-[var(--text-secondary)]', bg: 'bg-[var(--surface)]' }
  }

  return (
    <div>
      <div className="border-b border-[var(--border)] px-4 py-3">
        <h1 className="text-lg font-bold text-[var(--text-primary)]">Admin Panel</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          {allUsers.length} total users · {pendingList.length} pending
        </p>
      </div>

      <div className="flex border-b border-[var(--border)]">
        <button
          onClick={() => setTab('users')}
          className={`flex items-center justify-center gap-2 flex-1 py-3 text-sm font-medium transition-colors hover:bg-[var(--surface-hover)] ${
            tab === 'users' ? 'text-[var(--text-primary)] border-b-2 border-[#1D9BF0]' : 'text-[var(--text-secondary)]'
          }`}
        >
          <Users className="h-4 w-4" />
          All Users
        </button>
        <button
          onClick={() => setTab('pending')}
          className={`flex items-center justify-center gap-2 flex-1 py-3 text-sm font-medium transition-colors hover:bg-[var(--surface-hover)] ${
            tab === 'pending' ? 'text-[var(--text-primary)] border-b-2 border-[#1D9BF0]' : 'text-[var(--text-secondary)]'
          }`}
        >
          <Clock className="h-4 w-4" />
          Pending ({pendingList.length})
        </button>
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

      {tab === 'users' && (
        <div className="divide-y divide-[var(--border)]">
          {allUsers.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-sm text-[var(--text-secondary)]">No users found.</p>
            </div>
          ) : (
            allUsers.map((u: any) => {
              const badge = getBadge(u)
              return (
                <div key={u.id} className="flex items-center justify-between px-4 py-3 hover:bg-[var(--surface-hover)] transition-colors">
                  <Link href={`/profile/${u.username}`} className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-[#1D9BF0] flex items-center justify-center text-sm font-bold text-white">
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                      ) : (
                        (u.display_name?.[0] || u.username?.[0] || '?').toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-[var(--text-primary)] text-sm truncate">
                          {u.display_name || u.username}
                        </p>
                        {u.is_verified && <VerifiedBadge size={14} />}
                      </div>
                      <p className="text-sm text-[var(--text-secondary)]">@{u.username}</p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.color} ${badge.bg}`}>
                      {badge.label}
                    </span>
                    {u.verification?.status === 'pending' && (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleApprove(u.id)}
                          className="rounded-full bg-[#00BA7C] px-3 py-1 text-xs font-bold text-white hover:bg-[#00BA7C]/90 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(u.id)}
                          className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-bold text-[var(--text-secondary)] hover:text-[#F4212E] hover:border-[#F4212E] transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {tab === 'pending' && (
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
                <Link href={`/profile/${req.profiles?.username}`} className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-[#1D9BF0] flex items-center justify-center text-sm font-bold text-white">
                    {(req.profiles?.display_name?.[0] || req.profiles?.username?.[0] || '?').toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-[var(--text-primary)] text-sm truncate">
                        {req.profiles?.display_name || req.profiles?.username}
                      </p>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">@{req.profiles?.username}</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      UTR: <span className="font-mono">{req.utr}</span>
                    </p>
                  </div>
                </Link>
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
      )}
    </div>
  )
}
