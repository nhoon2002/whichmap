'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  onAuthChange,
  sendPasswordReset,
} from '@/services/auth/authService'
import { authConfig, hasSocialAuthEnabled } from '@/configs/auth'
import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
import { TextInput } from '@/components/TextInput'
import { Button } from '@/components/Button'
import { getUserFriendlyError } from '@/lib/errorMessages'

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  // Redirect if already logged in
  useEffect(() => {
    const unsubscribe = onAuthChange((user: any) => {
      if (user) {
        router.push('/')
      }
    })
    return () => unsubscribe()
  }, [router])

  const handleEmailAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password)
        // Redirect to verification page if email verification is required
        if (authConfig.emailPassword.requireEmailVerification) {
          router.push('/verify-email')
        } else {
          router.push('/')
        }
      } else {
        await signInWithEmail(email, password)
        router.push('/')
      }
    } catch (err: any) {
      console.error('Auth error:', err)
      setError(getUserFriendlyError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setLoading(true)

    try {
      await signInWithGoogle()
      router.push('/')
    } catch (err: any) {
      console.error('Google sign in error:', err)
      setError(getUserFriendlyError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setResetLoading(true)

    try {
      await sendPasswordReset(resetEmail)
      setSuccess('Password reset email sent! Check your inbox for instructions.')
      setResetEmail('')
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setShowForgotPassword(false)
        setSuccess('')
      }, 5000)
    } catch (err: any) {
      console.error('Password reset error:', err)
      setError(getUserFriendlyError(err))
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <main className="flex-auto pt-[calc(4rem+env(safe-area-inset-top,0px))] sm:pt-[calc(5.5rem+env(safe-area-inset-top,0px))]">
        <Container className="mt-8 sm:mt-10 lg:mt-12">
        <FadeIn animate>
          <div className="max-w-md mx-auto">
            <h1 className="font-display text-5xl font-medium tracking-tight text-neutral-950 text-center">
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </h1>
            <p className="mt-6 text-xl text-neutral-600 text-center">
              {isSignUp
                ? 'Create an account to save your favorite routes'
                : 'Welcome back! Sign in to continue'}
            </p>

            {/* Forgot Password Form */}
            {showForgotPassword ? (
              <form onSubmit={handleForgotPassword} className="mt-16">
                <div className="rounded-2xl bg-white p-6 border-2 border-neutral-200">
                  <h2 className="text-lg font-semibold text-neutral-950 mb-2">
                    Reset Password
                  </h2>
                  <p className="text-sm text-neutral-600 mb-4">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                  
                  <TextInput
                    label="Email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => {
                      setResetEmail(e.target.value)
                      setError('')
                    }}
                    required
                    autoComplete="off"
                    autoFocus
                  />

                  {error && (
                    <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800" role="alert">
                      {success}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <Button
                      type="submit"
                      className="flex-1 justify-center"
                      disabled={resetLoading || !resetEmail}
                    >
                      {resetLoading ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(false)
                        setResetEmail('')
                        setError('')
                        setSuccess('')
                      }}
                      className="flex-1 justify-center bg-neutral-200 hover:bg-neutral-300 text-neutral-950"
                      disabled={resetLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </form>
            ) : (
              /* Email/Password Form */
              <form onSubmit={handleEmailAuth} className="mt-16">
                <div className="isolate -space-y-px rounded-2xl bg-white">
                  <TextInput
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError('')
                    }}
                    required
                    autoComplete="off"
                  />
                  <TextInput
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setError('')
                    }}
                    required
                    autoComplete="off"
                  />
                </div>

                {/* Email Verification Notice - Only show on Sign Up */}
                {isSignUp && authConfig.emailPassword.requireEmailVerification && (
                  <div className="mt-4 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800">
                    You'll need to verify your email address before you can sign in.
                  </div>
                )}

                {/* Forgot Password Link - Only show on Sign In */}
                {!isSignUp && (
                  <div className="mt-4 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(true)
                        setResetEmail(email) // Pre-fill with current email
                        setError('')
                      }}
                      className="text-sm text-neutral-600 hover:text-neutral-950 transition"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {error && (
                  <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="mt-10 w-full justify-center"
                  disabled={loading}
                >
                  {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
                </Button>
              </form>
            )}

            {/* Social Sign-In Options - Only show divider if any social auth is enabled */}
            {hasSocialAuthEnabled() && (
              <div className="relative mt-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-neutral-50 px-4 text-neutral-500">Or</span>
                </div>
              </div>
            )}

            {/* Google Sign In - Controlled by authConfig.google.enabled */}
            {authConfig.google.enabled && (
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="mt-8 w-full inline-flex items-center justify-center gap-3 rounded-full border border-neutral-300 bg-white px-6 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-50 disabled:opacity-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </button>
            )}

            {/* Toggle Sign Up/Sign In */}
            <p className="mt-8 text-center text-sm text-neutral-600">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError('')
                }}
                className="font-semibold text-neutral-950 hover:text-neutral-700"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </FadeIn>
      </Container>
    </main>
  )
}
