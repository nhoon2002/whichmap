'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  onAuthChange,
  sendPasswordReset,
  deleteUserAccount,
  getAuthProvider,
  isEmailPasswordUser,
  getCurrentUser,
  signOut,
  reauthenticateUser
} from '@/services/auth/authService'
import { User } from '@/models/User'
import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
import { Button } from '@/components/Button'
import { Settings } from '@/components/Settings'
import { TextInput } from '@/components/TextInput'
import { getUserFriendlyError } from '@/lib/errorMessages'
import type { User as FirebaseUser } from 'firebase/auth'
import { authConfig } from '@/configs/auth'

export default function AccountPage() {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [userModel, setUserModel] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [needsReauth, setNeedsReauth] = useState(false)
  const router = useRouter()

  // Redirect if not authenticated or email not verified
  useEffect(() => {
    const unsubscribe = onAuthChange(async (currentUser: FirebaseUser | null) => {
      if (!currentUser) {
        router.push('/login')
        return
      }

      // Check if user is a test user (test users skip verification)
      const userModel = await User.find(currentUser.uid)
      const isTest = userModel?.isTestUser || false

      // Redirect to verification page if email is not verified (unless test user)
      if (
        authConfig.emailPassword.requireEmailVerification &&
        !currentUser.emailVerified &&
        !isTest
      ) {
        router.push('/verify-email')
        return
      }

      setUser(currentUser)
      loadUserData(currentUser)
    })

    return () => unsubscribe()
  }, [router])

  const loadUserData = async (firebaseUser: FirebaseUser) => {
    try {
      const userData = await User.find(firebaseUser.uid)
      setUserModel(userData)
    } catch (err) {
      console.error('Error loading user data:', err)
      setError('Failed to load account information')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!user?.email) {
      setError('No email address found')
      return
    }

    setError('')
    setSuccess('')
    
    try {
      await sendPasswordReset(user.email)
      setSuccess('Password reset email sent! Check your inbox.')
    } catch (err: any) {
      console.error('Password reset error:', err)
      setError(getUserFriendlyError(err))
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (err: any) {
      console.error('Sign out error:', err)
      setError(err.message || 'Failed to sign out. Please try again.')
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return

    const isEmailPassword = isEmailPasswordUser(user)
    
    // For email/password users, check if we need password first
    if (isEmailPassword && !needsReauth) {
      setNeedsReauth(true)
      return
    }

    // If we need password but don't have it yet, don't proceed
    if (isEmailPassword && needsReauth && !deletePassword) {
      setError('Please enter your password to confirm account deletion.')
      return
    }

    setDeleting(true)
    setError('')
    
    try {
      // Re-authenticate before deletion
      if (isEmailPassword) {
        await reauthenticateUser(deletePassword)
      } else {
        // Google OAuth users - re-authenticate with popup
        await reauthenticateUser()
      }

      // Now proceed with deletion
      await deleteUserAccount(isEmailPassword ? deletePassword : undefined)
      // User will be signed out automatically
      router.push('/')
    } catch (err: any) {
      console.error('Delete account error:', err)
      setError(getUserFriendlyError(err))
      setDeleting(false)
      // Don't reset needsReauth on error - let user try again with password
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  }

  const getProviderDisplayName = (providerId: string) => {
    if (providerId === 'password') return 'Email/Password'
    if (providerId === 'google.com') return 'Google'
    return providerId
  }

  if (loading) {
    return (
      <main className="flex-auto">
        <Container className="mt-12 sm:mt-16 lg:mt-20">
          <div className="max-w-2xl mx-auto">
            <div className="text-center">
              <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-neutral-950 border-r-transparent"></div>
              <p className="mt-6 text-base text-neutral-600">Loading account...</p>
            </div>
          </div>
        </Container>
      </main>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  const authProvider = getAuthProvider(user)
  const canResetPassword = isEmailPasswordUser(user)

  return (
    <main className="flex-auto pt-[calc(4rem+env(safe-area-inset-top,0px))] sm:pt-[calc(5.5rem+env(safe-area-inset-top,0px))]">
        <Container className="mt-8 sm:mt-10 lg:mt-12">
          <FadeIn animate>
            <div className="max-w-2xl mx-auto">
              <h1 className="font-display text-5xl font-medium tracking-tight text-neutral-950">
                Account Settings
              </h1>
              <p className="mt-4 text-xl text-neutral-600">
                Manage your account information and preferences
              </p>

              {/* Account Information */}
              <div className="mt-8 space-y-6">
              <div className="rounded-2xl bg-white border-2 border-neutral-200 p-6">
                <h2 className="text-lg font-semibold text-neutral-950 mb-4">
                  Account Information
                </h2>
                
                <div className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-600 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user.email || ''}
                      readOnly
                      className="w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-2 text-neutral-950 cursor-not-allowed"
                    />
                  </div>

                  {/* Auth Provider */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-600 mb-1">
                      Sign-in Method
                    </label>
                    <input
                      type="text"
                      value={getProviderDisplayName(authProvider)}
                      readOnly
                      className="w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-2 text-neutral-950 cursor-not-allowed"
                    />
                  </div>

                  {/* Account Creation Date */}
                  {userModel && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-600 mb-1">
                        Account Created
                      </label>
                      <input
                        type="text"
                        value={formatDate(userModel.createdAt)}
                        readOnly
                        className="w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-2 text-neutral-950 cursor-not-allowed"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Sign Out */}
              <div className="rounded-2xl bg-white border-2 border-neutral-200 p-6">
                <h2 className="text-lg font-semibold text-neutral-950 mb-4">
                  Sign Out
                </h2>
                <p className="text-sm text-neutral-600 mb-4">
                  Sign out of your account. You can sign back in at any time.
                </p>
                <Button onClick={handleSignOut} className="w-full">
                  Sign Out
                </Button>
              </div>

              {/* Navigation Services Settings */}
              <div className="rounded-2xl bg-white border-2 border-neutral-200 p-6">
                <h2 className="text-lg font-semibold text-neutral-950 mb-4">
                  Navigation Services
                </h2>
                <p className="text-sm text-neutral-600 mb-4">
                  Select which navigation services to compare when searching for routes.
                </p>
                <Settings inline={true} />
              </div>

              {/* Password Reset */}
              {canResetPassword && (
                <div className="rounded-2xl bg-white border-2 border-neutral-200 p-6">
                  <h2 className="text-lg font-semibold text-neutral-950 mb-4">
                    Password
                  </h2>
                  <p className="text-sm text-neutral-600 mb-4">
                    Reset your password by email. We'll send you a link to create a new password.
                  </p>
                  <Button onClick={handlePasswordReset} className="w-full">
                    Send Password Reset Email
                  </Button>
                  
                  {/* Messages for Password Reset */}
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
                </div>
              )}

              {/* Danger Zone */}
              <div className="rounded-2xl bg-red-50 border-2 border-red-200 p-6">
                <h2 className="text-lg font-semibold text-red-900 mb-2">
                  Danger Zone
                </h2>
                <p className="text-sm text-red-800 mb-4">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                
                {!showDeleteConfirm ? (
                  <Button
                    onClick={() => {
                      setShowDeleteConfirm(true)
                      // For email/password users, immediately show password field
                      if (isEmailPasswordUser(user)) {
                        setNeedsReauth(true)
                      }
                    }}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete Account
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-lg bg-white border border-red-300 p-4">
                      <p className="text-sm font-medium text-red-900 mb-2">
                        Are you absolutely sure?
                      </p>
                      <p className="text-sm text-red-800 mb-4">
                        This will permanently delete your account, search history, and anonymize your tracking data. 
                        You will be signed out immediately.
                      </p>
                      
                      {needsReauth && isEmailPasswordUser(user) && (
                        <div className="mt-4">
                          <TextInput
                            label="Confirm Password"
                            type="password"
                            value={deletePassword}
                            onChange={(e) => {
                              setDeletePassword(e.target.value)
                              setError('') // Clear error when user types
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && deletePassword && !deleting) {
                                handleDeleteAccount()
                              }
                            }}
                            required
                            autoComplete="new-password"
                            className="w-full"
                            autoFocus
                          />
                        </div>
                      )}
                      
                      {!isEmailPasswordUser(user) && (
                        <p className="text-sm text-red-800 mt-2">
                          You'll be asked to sign in with Google again to confirm.
                        </p>
                      )}
                    </div>
                    
                    {error && (
                      <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800" role="alert">
                        {error}
                      </div>
                    )}
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={handleDeleteAccount}
                        disabled={deleting || (needsReauth && isEmailPasswordUser(user) && !deletePassword)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deleting ? 'Deleting...' : 'Yes, Delete My Account'}
                      </Button>
                      <Button
                        onClick={() => {
                          setShowDeleteConfirm(false)
                          setNeedsReauth(false)
                          setDeletePassword('')
                          setError('')
                        }}
                        disabled={deleting}
                        className="flex-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-950"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              </div>
            </div>
          </FadeIn>
        </Container>
      </main>
  )
}

