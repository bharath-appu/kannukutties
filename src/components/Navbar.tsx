'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from './Providers'
import {
  Home, Compass, PlusSquare, MessageCircle, Bell, User, LogOut, LogIn, Search, Loader2, Sun, Moon, BadgeCheck,
} from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { logout } from '@/lib/actions/auth'
import { getUnreadCounts } from '@/lib/actions/notifications'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function Navbar() {
  const { user, loading } = useAuth()
  const { theme, toggle: toggleTheme } = useTheme()
  const pathname = usePathname()
  const router = useRouter()
  const [unreadNotifs, setUnreadNotifs] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [showMobileSearch, setShowMobileSearch] = useState(false)

  useEffect(() => {
    if (!user) return

    const load = async () => {
      const counts = await getUnreadCounts()
      setUnreadNotifs(counts.notifications)
      setUnreadMessages(counts.messages)
    }
    load()

    const supabase = createClient()
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, () => load())
      .subscribe()

    const msgChannel = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${user.id}`,
      }, () => load())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      supabase.removeChannel(msgChannel)
    }
  }, [user])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setShowMobileSearch(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    window.location.href = '/login'
  }

  if (loading) return null

  const navItems = user ? [
    { href: '/', icon: Home, label: 'Home', active: pathname === '/' },
    { href: '/search', icon: Search, label: 'Search', active: pathname === '/search' },
    { href: '/explore', icon: Compass, label: 'Explore', active: pathname === '/explore' },
    { href: '/upload', icon: PlusSquare, label: 'Upload', active: pathname === '/upload' },
    {
      href: '/messages', icon: MessageCircle, label: 'Messages', active: pathname.startsWith('/messages'),
      badge: unreadMessages,
    },
    {
      href: '/notifications', icon: Bell, label: 'Notifications', active: pathname === '/notifications',
      badge: unreadNotifs,
    },
    { href: '/settings', icon: User, label: 'Profile', active: pathname === '/settings' },
    { href: '/admin', icon: BadgeCheck, label: 'Admin', active: pathname === '/admin' },
  ] : [
    { href: '/search', icon: Search, label: 'Search', active: pathname === '/search' },
    { href: '/explore', icon: Compass, label: 'Explore', active: pathname === '/explore' },
    { href: '/login', icon: LogIn, label: 'Login', active: pathname === '/login' },
    { href: '/signup', icon: User, label: 'Sign Up', active: pathname === '/signup' },
  ]

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="fixed left-0 top-0 z-50 hidden h-screen w-[68px] flex-col items-center border-r border-[var(--border)] bg-[var(--background)] md:flex">
        <Link href="/" className="mt-3 mb-2">
          <img src="/cat.webp" alt="kanukuties" className="h-8 w-8 rounded-full object-contain" />
        </Link>

        <div className="flex flex-col items-center gap-1 mt-2">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center justify-center rounded-full p-3 transition-colors ${
                item.active
                  ? 'text-[#1D9BF0]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
              }`}
            >
              <div className="relative">
                <item.icon className="h-6 w-6" />
                {item.badge ? (
                  <span className="absolute -right-1.5 -top-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#1D9BF0] text-[11px] font-bold text-white">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                ) : null}
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-auto mb-4 flex flex-col items-center gap-1">
          {user && (
            <button
              onClick={handleLogout}
              className="rounded-full p-3 text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[#F4212E] transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={toggleTheme}
            className="rounded-full p-3 text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-colors"
            aria-label="Toggle theme"
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[var(--background)] md:hidden">
        <div className="flex items-center justify-around py-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center rounded-full px-3 py-2 transition-colors ${
                item.active ? 'text-[#1D9BF0]' : 'text-[var(--text-secondary)]'
              }`}
            >
              <div className="relative">
                <item.icon className="h-6 w-6" />
                {item.badge ? (
                  <span className="absolute -right-1.5 -top-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#1D9BF0] text-[11px] font-bold text-white">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                ) : null}
              </div>
            </Link>
          ))}
          <button
            onClick={toggleTheme}
            className="rounded-full px-3 py-2 text-[var(--text-secondary)] transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile search FAB */}
      <button
        onClick={() => setShowMobileSearch(true)}
        className="fixed bottom-20 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#1D9BF0] text-white shadow-lg md:hidden"
      >
        <Search className="h-5 w-5" />
      </button>

      {/* Mobile search overlay */}
      {showMobileSearch && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/50 pt-20 md:hidden">
          <form onSubmit={handleSearch} className="w-full max-w-sm px-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search kanukuties..."
                autoFocus
                className="w-full rounded-[16px] border border-[var(--border)] bg-[var(--surface)] py-3 pl-12 pr-4 text-base text-[var(--foreground)] placeholder:text-[var(--text-secondary)] outline-none focus:border-[#1D9BF0]"
              />
              <button
                type="button"
                onClick={() => setShowMobileSearch(false)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Desktop top search bar */}
      <div className="hidden md:fixed md:top-0 md:left-[68px] md:right-0 md:z-40 md:border-b md:border-[var(--border)] md:bg-[var(--background)] md:px-4 md:py-2">
        <div className="mx-auto max-w-[600px]">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full rounded-full border border-[var(--border)] bg-transparent py-1.5 pl-9 pr-3 text-sm text-[var(--foreground)] placeholder:text-[var(--text-secondary)] outline-none focus:border-[#1D9BF0] focus:shadow-[0_0_0_1px_#1D9BF0]"
            />
          </form>
        </div>
      </div>
    </>
  )
}
