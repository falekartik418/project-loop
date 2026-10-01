'use client'

import { useThemeMode } from '@/app/theme-provider'
import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { BellOutlined, MoonOutlined, SunOutlined, SearchOutlined, CloseOutlined } from '@ant-design/icons'
import Link from 'next/link'

interface SearchResult {
  id: string
  type: 'feedback' | 'theme'
  title: string
  subtitle: string
  href: string
}

interface Notification {
  id: string
  message: string
  createdAt: string
  read: boolean
  href: string
}

export function Topbar() {
  const { data: session } = useSession()
  const { dark, toggle } = useThemeMode()
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
      if (e.key === 'Escape') setSearchOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 50)
  }, [searchOpen])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }
    const handle = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data.results ?? [])
    }, 250)
    return () => clearTimeout(handle)
  }, [query])

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/notifications')
      const data = await res.json()
      setNotifications(data.notifications ?? [])
    }
    load()
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  async function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    await fetch('/api/notifications', { method: 'PATCH' })
  }

  return (
    <header className="app-topbar">
      <div className="search-box" onClick={() => setSearchOpen(true)}>
        <SearchOutlined /> <span>Search LOOP...</span>
        <kbd>⌘K</kbd>
      </div>

      <div className="top-actions">
        <div style={{ position: 'relative' }}>
         <BellOutlined
  onClick={async () => {
    const next = !notifOpen
    setNotifOpen(next)
    if (next) {
      const res = await fetch('/api/notifications')
      const data = await res.json()
      setNotifications(data.notifications ?? [])
    }
  }}
  style={{ cursor: 'pointer' }}
/>
          {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          {notifOpen && (
            <div className="notif-dropdown">
              <div className="notif-header">
                <strong>Notifications</strong>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="notif-mark-read">Mark all read</button>
                  )}
                  <CloseOutlined
                    onClick={() => setNotifOpen(false)}
                    style={{ cursor: 'pointer', color: '#9ca3af', fontSize: 13 }}
                  />
                </div>
              </div>
              {notifications.length === 0 ? (
  <div className="notif-empty">
    <BellOutlined style={{ fontSize: 22, color: '#d1d5db', marginBottom: 8, display: 'block' }} />
    No notifications yet
  </div>
) : (
  notifications.map((n) => (
    <a key={n.id} href={n.href} className={`notif-item ${n.read ? '' : 'unread'}`}>
      {!n.read && <span className="notif-dot" />}
      <div className="notif-item-body">
        <div>{n.message}</div>
        <small>{new Date(n.createdAt).toLocaleDateString()}</small>
      </div>
    </a>
  ))
)}
            </div>
          )}
        </div>

        {dark ? (
  <SunOutlined onClick={toggle} style={{ cursor: 'pointer' }} />
) : (
  <MoonOutlined onClick={toggle} style={{ cursor: 'pointer' }} />
)}
       <Link href="/profile">
  <span className="avatar" style={{ cursor: 'pointer' }}>
    {session?.user?.name?.slice(0, 2).toUpperCase()}
  </span>
    </Link>
      </div>

      {searchOpen && (
        <div className="search-modal-overlay" onClick={() => setSearchOpen(false)}>
          <div className="search-modal" onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-input">
              <SearchOutlined />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search feedback, themes..."
              />
              <CloseOutlined
                onClick={() => {
                  setQuery('')
                  setSearchOpen(false)
                }}
                style={{ cursor: 'pointer', color: '#9ca3af', fontSize: 14 }}
              />
            </div>
            <div className="search-modal-results">
              {query.trim() === '' ? (
                <div className="search-modal-empty">Start typing to search...</div>
              ) : results.length === 0 ? (
                <div className="search-modal-empty">No results found</div>
              ) : (
                results.map((r) => (
                  <a key={r.id} href={r.href} className="search-result-row" onClick={() => setSearchOpen(false)}>
                    <span className="search-result-type">{r.type}</span>
                    <div>
                      <div>{r.title}</div>
                      <small>{r.subtitle}</small>
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}