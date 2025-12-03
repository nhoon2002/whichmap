'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { onAuthChange, signOut } from '@/services/auth/authService'
import { Container } from '@/components/Container'
import { Button } from '@/components/Button'
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

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur-sm">
      <Container>
        <nav className="flex items-center justify-between py-4 sm:py-6">
          {/* Logo/Brand */}
          <Link href="/" className="font-display text-2xl font-semibold text-neutral-950">
            WhichMap
          </Link>

          {/* Settings & Auth Actions */}
          <div className="flex items-center gap-4">
            {/* Settings (always visible) */}
            <Settings />

            {/* Auth Actions */}
            {loading ? (
              <div className="h-9 w-20 animate-pulse rounded-full bg-neutral-200" />
            ) : user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-neutral-600 hidden sm:inline">
                  {user.email}
                </span>
                <Button onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            ) : (
              pathname !== '/login' && (
                <Link href="/login">
                  <Button>Sign In</Button>
                </Link>
              )
            )}
          </div>
        </nav>
      </Container>
    </header>
  )
}
