'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from './Providers'
import {
  Home, Compass, PlusSquare, MessageCircle, Bell, User, LogOut, Search, Loader2, Sun, Moon,
} from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { logout } from '@/lib/actions/auth'
import { getUnreadCounts } from '@/lib/actions/notifications'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import SplitText from '@/components/reactbits/SplitText'

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

  if (loading) return null

  const navItems = user ? [
    { href: '/', icon: Home, label: 'Home', active: pathname === '/' },
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
  ] : [
    { href: '/explore', icon: Compass, label: 'Explore', active: pathname === '/explore' },
  ]

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white md:top-0 md:bottom-auto md:border-b md:border-t-0">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-2">
          <Link href="/" className="hidden md:block">
            <SplitText text="kanukuties" className="text-xl font-bold" stagger={0.03} />
          </Link>

          <div className="hidden md:block flex-1 max-w-md mx-4">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search kanukuties"
                className="w-full rounded-full bg-gray-100 py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </form>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs transition-colors md:flex-row md:gap-1.5 md:text-sm ${
                  item.active ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <div className="relative">
                  <item.icon className="h-5 w-5 md:h-5 md:w-5" />
                  {item.badge ? (
                    <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  ) : null}
                </div>
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            ))}

            {user && (
              <button
                onClick={async () => { await logout(); window.location.href = '/login' }}
                className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-gray-500 transition-colors hover:text-red-500 md:text-sm"
              >
                <LogOut className="h-5 w-5" />
                <span className="hidden md:inline">Logout</span>
              </button>
            )}

            {!user && (
              <Link
                href="/login"
                className="rounded-full bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Login
              </Link>
            )}

            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-gray-500 hover:text-gray-900 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      <button
        onClick={() => setShowMobileSearch(true)}
        className="fixed bottom-20 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg md:hidden"
      >
        <Search className="h-5 w-5" />
      </button>

      {showMobileSearch && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/50 pt-20 md:hidden">
          <form onSubmit={handleSearch} className="w-full max-w-sm px-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search kanukuties..."
                autoFocus
                className="w-full rounded-xl bg-white py-3 pl-12 pr-4 text-base shadow-lg outline-none"
              />
              <button
                type="button"
                onClick={() => setShowMobileSearch(false)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
