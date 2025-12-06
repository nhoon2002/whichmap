/**
 * Authentication Service
 * Abstracts Firebase Auth operations
 * Makes it easier to swap auth providers later (Supabase, Auth0, etc.)
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
  deleteUser,
  fetchSignInMethodsForEmail,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  EmailAuthProvider,
  type User as FirebaseUser,
  type Unsubscribe,
  type AuthError,
} from 'firebase/auth'
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  updateDoc,
  doc,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { User } from '@/models/User'
import { getUserFriendlyError } from '@/lib/errorMessages'
import { authConfig } from '@/configs/auth'

/**
 * Check if current user is a test user (skips email verification)
 * @returns {Promise<boolean>} True if user is a test user
 */
export async function isTestUser(): Promise<boolean> {
  const user = auth.currentUser
  if (!user) return false

  try {
    const userModel = await User.find(user.uid)
    return userModel?.isTestUser || false
  } catch (error) {
    console.error('Error checking if user is test user:', error)
    return false
  }
}

/**
 * Sign in with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} User credential
 * @throws {Error} If email is not verified (when requireEmailVerification is enabled and user is not a test user)
 */
export async function signInWithEmail(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)

  // Check email verification status if required
  if (authConfig.emailPassword.requireEmailVerification && !userCredential.user.emailVerified) {
    // Check if user is a test user (test users skip verification)
    const userModel = await User.find(userCredential.user.uid)
    const isTest = userModel?.isTestUser || false

    if (!isTest) {
      // Sign out the user since they haven't verified their email
      await firebaseSignOut(auth)
      throw new Error('Please verify your email before signing in. Check your inbox for the verification link.')
    }
  }

  return userCredential
}

/**
 * Sign up with email and password
 * Also creates user document in Firestore and sends verification email
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} User credential
 */
export async function signUpWithEmail(email: string, password: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)

  // Create user document in Firestore
  await User.create(userCredential.user.uid, userCredential.user.email)

  // Send verification email if required
  if (authConfig.emailPassword.requireEmailVerification) {
    await sendEmailVerification(userCredential.user)
  }

  return userCredential
}

/**
 * Sign in with Google OAuth
 * Also creates user document in Firestore if first time
 * 
 * Note: If an account with the same email exists using email/password,
 * this will fail with an error. Accounts are not linked - users must
 * use the original sign-in method.
 * 
 * @returns {Promise<object>} User credential
 * @throws {Error} If account exists with different credential
 */
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider()

  try {
    const userCredential = await signInWithPopup(auth, provider)

    // Create user document if doesn't exist
    const existingUser = await User.find(userCredential.user.uid)
    if (!existingUser) {
      await User.create(userCredential.user.uid, userCredential.user.email)
    }

    // Google OAuth users have verified emails - mark as verified in Firestore
    await User.markAsVerified(userCredential.user.uid)

    return userCredential
  } catch (error: unknown) {
    const authError = error as AuthError
    
    // Check if account exists with different credential
    if (authError.code === 'auth/account-exists-with-different-credential') {
      const email = authError.customData?.email as string | undefined
      
      if (email) {
        // Check what sign-in methods exist for this email
        const signInMethods = await fetchSignInMethodsForEmail(auth, email)
        
        // If email/password exists, throw error with helpful message
        if (signInMethods.includes('password')) {
          throw new Error(
            'An account with this email already exists. Please sign in with your email and password instead.'
          )
        }
      }
      
      // Generic error for other cases
      throw new Error(
        'An account with this email already exists with a different sign-in method. Please use your original sign-in method.'
      )
    }
    
    // Re-throw original error if not handled
    throw error
  }
}

/**
 * Sign out current user
 * @returns {Promise<void>}
 */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth)
}

/**
 * Subscribe to auth state changes
 * @param {function} callback - Called with user object or null
 * @returns {function} Unsubscribe function
 */
export function onAuthChange(callback: (user: FirebaseUser | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, callback)
}

/**
 * Get current authenticated user
 * @returns {object|null} Current user or null
 */
export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export function isAuthenticated(): boolean {
  return !!auth.currentUser
}

/**
 * Send password reset email
 * @param {string} email - User's email address
 * @returns {Promise<void>}
 */
export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email)
}

/**
 * Send email verification to current user
 * @returns {Promise<void>}
 * @throws {Error} If no user is signed in
 */
export async function sendVerificationEmail(): Promise<void> {
  const user = auth.currentUser
  if (!user) {
    throw new Error('No user is currently signed in')
  }
  if (user.emailVerified) {
    throw new Error('Email is already verified')
  }
  await sendEmailVerification(user)
}

/**
 * Check if current user's email is verified
 * @returns {boolean}
 */
export function isEmailVerified(): boolean {
  const user = auth.currentUser
  return user?.emailVerified ?? false
}

/**
 * Reload current user to get latest emailVerified status
 * @returns {Promise<boolean>} Updated email verification status
 */
export async function refreshEmailVerificationStatus(): Promise<boolean> {
  const user = auth.currentUser
  if (!user) return false

  await user.reload()
  return user.emailVerified
}

/**
 * Get user's authentication provider
 * @param {FirebaseUser} user - Firebase user object
 * @returns {string} Provider name ('password', 'google.com', etc.)
 */
export function getAuthProvider(user: FirebaseUser): string {
  if (!user.providerData || user.providerData.length === 0) {
    return 'unknown'
  }
  // Return the first provider (most common case)
  const firstProvider = user.providerData[0]
  return firstProvider?.providerId || 'unknown'
}

/**
 * Check if user signed in with email/password
 * @param {FirebaseUser} user - Firebase user object
 * @returns {boolean}
 */
export function isEmailPasswordUser(user: FirebaseUser): boolean {
  return getAuthProvider(user) === 'password'
}

/**
 * Re-authenticate user (required for sensitive operations like account deletion)
 * @param {string} password - User's password (required for email/password users)
 * @returns {Promise<void>}
 * @throws {Error} If re-authentication fails
 */
export async function reauthenticateUser(password?: string): Promise<void> {
  const user = auth.currentUser
  if (!user) {
    throw new Error('No user is currently signed in')
  }

  try {
    const providerId = user.providerData[0]?.providerId

    if (providerId === 'password') {
      // Email/password users need to provide password
      if (!password) {
        throw new Error('Password is required to confirm account deletion')
      }
      if (!user.email) {
        throw new Error('User email not found')
      }
      const credential = EmailAuthProvider.credential(user.email, password)
      await reauthenticateWithCredential(user, credential)
    } else if (providerId === 'google.com') {
      // Google OAuth users need to re-authenticate with popup
      const provider = new GoogleAuthProvider()
      await reauthenticateWithPopup(user, provider)
    } else {
      throw new Error('Unsupported authentication provider')
    }
  } catch (error: unknown) {
    // Convert Firebase errors to user-friendly messages
    const friendlyError = getUserFriendlyError(error)
    throw new Error(friendlyError)
  }
}

/**
 * Deactivate user account (soft delete)
 * This operation:
 * - Re-authenticates the user (required by Firebase for security)
 * - Marks user as deactivated in Firestore (keeps data for analytics)
 * - Removes PII (email) from user document
 * - Deletes all search history (personal location data)
 * - Keeps userId in tracking events/clicks (for analytics)
 * - Deletes Firebase Auth account (prevents login)
 * 
 * Note: If user re-registers with same email, they get a NEW account with NEW userId.
 * Old data remains linked to old userId for analytics, but is NOT linked to new account.
 * 
 * Benefits:
 * - Analytics data remains linked via userId
 * - Can restore account if user changes mind
 * - GDPR compliant (removed PII, kept anonymized analytics)
 * - Fresh start for users who re-register
 * 
 * @param {string} password - User's password (required for email/password users, ignored for OAuth)
 * @returns {Promise<void>}
 * @throws {Error} If user is not authenticated or deletion fails
 */
export async function deleteUserAccount(password?: string): Promise<void> {
  const user = auth.currentUser
  if (!user) {
    throw new Error('No user is currently signed in')
  }

  const userId = user.uid

  try {
    // Step 0: Re-authenticate user (required by Firebase for account deletion)
    await reauthenticateUser(password)

    // Step 1: Soft delete user document (mark as deactivated, remove PII)
    const userDocRef = doc(db, 'users', userId)
    await updateDoc(userDocRef, {
      deactivatedAt: serverTimestamp(),
      email: null, // Remove PII
      // Keep preferences and createdAt for analytics
    })

    // Step 2: Delete all search history (personal location data)
    const searchHistoryQuery = query(
      collection(db, 'search_history'),
      where('userId', '==', userId)
    )
    const searchHistorySnapshot = await getDocs(searchHistoryQuery)
    const searchHistoryBatch = writeBatch(db)
    searchHistorySnapshot.docs.forEach((docSnapshot) => {
      searchHistoryBatch.delete(docSnapshot.ref)
    })
    await searchHistoryBatch.commit()

    // Step 3: Keep tracking events with userId (for analytics)
    // No changes needed - userId stays linked for analytics

    // Step 4: Keep tracking clicks with userId (for analytics)
    // No changes needed - userId stays linked for analytics

    // Step 5: Delete Firebase Auth account (prevents login)
    await deleteUser(user)

    // Step 6: Sign out (should happen automatically, but ensure it)
    await firebaseSignOut(auth)
  } catch (error) {
    console.error('Error deactivating user account:', error)
    throw error
  }
}
