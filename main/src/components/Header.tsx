'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { onAuthChange } from '@/services/auth/authService'
import { Container } from '@/components/Container'
import { Settings } from '@/components/Settings'
import type { User } from 'firebase/auth'

export function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser: User | null) => {
      setUser(currentUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <header className="sticky top-[env(safe-area-inset-top,0px)] z-50 border-b border-neutral-200 bg-white/95 backdrop-blur-sm">
      <Container>
        <nav className="flex items-center justify-between py-3 sm:py-6">
          {/* Logo/Brand */}
          <Link href="/" className="font-display text-2xl font-semibold text-neutral-950">
            WhichMap
          </Link>

          {/* Auth Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Settings (only for anonymous users - signed-in users see it in Account page) */}
            {!loading && !user && <Settings />}

            {/* Auth Actions */}
            {loading ? (
              <div className="h-9 w-9 animate-pulse rounded-full bg-neutral-200" />
            ) : user ? (
              <Link
                href="/account"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-200 text-neutral-600 transition hover:bg-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 overflow-hidden"
                aria-label="Account settings"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || user.email || 'User'}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                )}
              </Link>
            ) : (
              pathname !== '/login' && (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 rounded-full bg-neutral-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 sm:px-4 sm:gap-2"
                >
                  <span>Sign In</span>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
              )
            )}
          </div>
        </nav>
      </Container>
    </header>
  )
}
