'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { Container } from '@/components/Container'
import { Button } from '@/components/Button'

export function Header() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <header className="border-b border-neutral-200 bg-white">
      <Container>
        <nav className="flex items-center justify-between py-6">
          {/* Logo/Brand */}
          <Link href="/" className="font-display text-2xl font-semibold text-neutral-950">
            WhichMap
          </Link>

          {/* Auth Actions */}
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="h-9 w-20 animate-pulse rounded-full bg-neutral-200" />
            ) : user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-neutral-600">
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
