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
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { User } from '@/models/User'

/**
 * Sign in with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} User credential
 */
export async function signInWithEmail(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  return userCredential
}

/**
 * Sign up with email and password
 * Also creates user document in Firestore
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} User credential
 */
export async function signUpWithEmail(email, password) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)

  // Create user document in Firestore
  await User.create(userCredential.user.uid, {
    email: userCredential.user.email,
  })

  return userCredential
}

/**
 * Sign in with Google OAuth
 * Also creates user document in Firestore if first time
 * @returns {Promise<object>} User credential
 */
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider()
  const userCredential = await signInWithPopup(auth, provider)

  // Create user document if doesn't exist
  await User.findOrCreate(userCredential.user.uid, {
    email: userCredential.user.email,
  })

  return userCredential
}

/**
 * Sign out current user
 * @returns {Promise<void>}
 */
export async function signOut() {
  await firebaseSignOut(auth)
}

/**
 * Subscribe to auth state changes
 * @param {function} callback - Called with user object or null
 * @returns {function} Unsubscribe function
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback)
}

/**
 * Get current authenticated user
 * @returns {object|null} Current user or null
 */
export function getCurrentUser() {
  return auth.currentUser
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
  return !!auth.currentUser
}
