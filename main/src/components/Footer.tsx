'use client'

import Link from 'next/link'
import { Container } from '@/components/Container'
import { onAuthChange } from '@/services/auth/authService'
import { useState, useEffect } from 'react'
import type { User } from 'firebase/auth'

export function Footer() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser: User | null) => {
      setUser(currentUser)
    })

    return () => unsubscribe()
  }, [])

  return (
    <footer className="mt-auto border-t border-neutral-200 pt-8 pb-8">
      <Container>
        <div className="flex flex-col items-center gap-6">
          {/* Signed in status */}
          {user && (
            <p className="text-sm text-neutral-500">
              Signed in as: <span className="text-neutral-700">{user.email}</span>
            </p>
          )}

          {/* Footer Links */}
          <div className="flex items-center gap-3">
            {user && (
              <>
                <Link
                  href="/account"
                  className="text-sm text-neutral-600 hover:text-neutral-950 transition"
                >
                  Account
                </Link>
                <span className="text-neutral-300">•</span>
              </>
            )}
            <Link
              href="/support"
              className="text-sm text-neutral-600 hover:text-neutral-950 transition"
            >
              Support
            </Link>
            <span className="text-neutral-300">•</span>
            <Link
              href="/privacy"
              className="text-sm text-neutral-600 hover:text-neutral-950 transition"
            >
              Privacy Policy
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-center text-sm text-neutral-500">
            <p>© {new Date().getFullYear()} WhichMap. All rights reserved.</p>
          </div>
        </div>
      </Container>
    </footer>
  )
}

