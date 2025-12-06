'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  onAuthChange,
  sendVerificationEmail,
  refreshEmailVerificationStatus,
  signOut,
} from '@/services/auth/authService'
import { User } from '@/models/User'
import { authConfig } from '@/configs/auth'
import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
import { Button } from '@/components/Button'
import { getUserFriendlyError } from '@/lib/errorMessages'
import type { User as FirebaseUser } from 'firebase/auth'

export default function VerifyEmailPage() {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthChange(async (currentUser: FirebaseUser | null) => {
      setUser(currentUser)
      setLoading(false)

      // Redirect if not logged in
      if (!currentUser) {
        router.push('/login')
        return
      }

      // Redirect if email verification is not required
      if (!authConfig.emailPassword.requireEmailVerification) {
        router.push('/')
        return
      }

      // Check if user is a test user (test users skip verification)
      const userModel = await User.find(currentUser.uid)
      if (userModel?.isTestUser) {
        router.push('/')
        return
      }

      // Redirect if email is already verified
      if (currentUser.emailVerified) {
        router.push('/')
        return
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleCheckVerification = async () => {
    setError('')
    setSuccess('')
    setChecking(true)

    try {
      const isVerified = await refreshEmailVerificationStatus()
      if (isVerified) {
        // Mark user as verified in Firestore (sets verifiedAt timestamp)
        if (user?.uid) {
          await User.markAsVerified(user.uid)
        }

        setSuccess('Email verified! Redirecting...')
        setTimeout(() => {
          router.push('/')
        }, 1500)
      } else {
        setError('Email not verified yet. Please check your inbox and click the verification link.')
      }
    } catch (err: any) {
      console.error('Error checking verification:', err)
      setError(getUserFriendlyError(err))
    } finally {
      setChecking(false)
    }
  }

  const handleResendEmail = async () => {
    setError('')
    setSuccess('')
    setResending(true)

    try {
      await sendVerificationEmail()
      setSuccess('Verification email sent! Check your inbox.')
      // Auto-clear success message after 5 seconds
      setTimeout(() => {
        setSuccess('')
      }, 5000)
    } catch (err: any) {
      console.error('Error resending email:', err)
      setError(getUserFriendlyError(err))
    } finally {
      setResending(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (err: any) {
      console.error('Error signing out:', err)
      setError(getUserFriendlyError(err))
    }
  }

  if (loading) {
    return (
      <main className="flex-auto pt-[calc(4rem+env(safe-area-inset-top,0px))] sm:pt-[calc(5.5rem+env(safe-area-inset-top,0px))]">
        <Container className="mt-8 sm:mt-10 lg:mt-12">
          <div className="flex h-[400px] items-center justify-center">
            <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-neutral-950 border-r-transparent"></div>
          </div>
        </Container>
      </main>
    )
  }

  return (
    <main className="flex-auto pt-[calc(4rem+env(safe-area-inset-top,0px))] sm:pt-[calc(5.5rem+env(safe-area-inset-top,0px))]">
      <Container className="mt-8 sm:mt-10 lg:mt-12">
        <FadeIn animate>
          <div className="max-w-md mx-auto">
            {/* Icon */}
            <div className="flex justify-center mb-8">
              <div className="rounded-full bg-neutral-100 p-6">
                <svg
                  className="h-12 w-12 text-neutral-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>

            <h1 className="font-display text-4xl font-medium tracking-tight text-neutral-950 text-center">
              Verify Your Email
            </h1>
            <p className="mt-6 text-lg text-neutral-600 text-center">
              We've sent a verification link to:
            </p>
            <p className="mt-2 text-base font-semibold text-neutral-950 text-center">
              {user?.email}
            </p>

            <div className="mt-8 rounded-2xl bg-white p-6 border-2 border-neutral-200">
              <p className="text-sm text-neutral-600">
                Click the link in the email to verify your account. Once verified, come back here
                and click the button below to continue.
              </p>

              <p className="mt-4 text-sm text-neutral-600">
                Don't see the email? Check your spam folder or request a new one.
              </p>
            </div>

            {error && (
              <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800" role="alert">
                {success}
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 space-y-3">
              <Button
                onClick={handleCheckVerification}
                disabled={checking || resending}
                className="w-full justify-center"
              >
                {checking ? 'Checking...' : 'I\'ve Verified My Email'}
              </Button>

              <Button
                onClick={handleResendEmail}
                disabled={checking || resending}
                className="w-full justify-center bg-neutral-100 hover:bg-neutral-200 text-neutral-950 border-2 border-neutral-300"
              >
                {resending ? 'Sending...' : 'Resend Verification Email'}
              </Button>

              <button
                onClick={handleSignOut}
                disabled={checking || resending}
                className="w-full text-sm text-neutral-600 hover:text-neutral-950 transition py-2"
              >
                Sign out
              </button>
            </div>
          </div>
        </FadeIn>
      </Container>
    </main>
  )
}
