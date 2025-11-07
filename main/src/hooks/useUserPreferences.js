'use client'

import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'

// Default preferences for new users
const DEFAULT_PREFERENCES = {
  navServices: {
    google: true,
    apple: true,
    waze: true,
  },
}

/**
 * Custom hook to manage user preferences in Firestore
 * @returns {Object} { preferences, updatePreferences, loading }
 */
export function useUserPreferences() {
  const [user, setUser] = useState(null)
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES)
  const [loading, setLoading] = useState(true)

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [])

  // Load user preferences from Firestore when user signs in
  useEffect(() => {
    async function loadPreferences() {
      if (!user) {
        // User not logged in, use defaults
        setPreferences(DEFAULT_PREFERENCES)
        setLoading(false)
        return
      }

      try {
        const userDocRef = doc(db, 'users', user.uid)
        const userDoc = await getDoc(userDocRef)

        if (userDoc.exists()) {
          const userData = userDoc.data()
          setPreferences(userData.preferences || DEFAULT_PREFERENCES)
        } else {
          // First time user, create document with defaults
          await setDoc(userDocRef, {
            email: user.email,
            preferences: DEFAULT_PREFERENCES,
            createdAt: new Date(),
          })
          setPreferences(DEFAULT_PREFERENCES)
        }
      } catch (error) {
        console.error('Error loading preferences:', error)
        setPreferences(DEFAULT_PREFERENCES)
      } finally {
        setLoading(false)
      }
    }

    loadPreferences()
  }, [user])

  /**
   * Update user preferences in Firestore
   * @param {Object} newPreferences - Updated preferences object
   */
  const updatePreferences = async (newPreferences) => {
    if (!user) {
      // User not logged in, update local state only
      setPreferences(newPreferences)
      return
    }

    try {
      const userDocRef = doc(db, 'users', user.uid)
      await setDoc(
        userDocRef,
        { preferences: newPreferences },
        { merge: true }
      )
      setPreferences(newPreferences)
    } catch (error) {
      console.error('Error updating preferences:', error)
      throw error
    }
  }

  /**
   * Toggle a specific nav service on/off
   * @param {string} service - Service key (google, apple, waze)
   */
  const toggleNavService = async (service) => {
    const newPreferences = {
      ...preferences,
      navServices: {
        ...preferences.navServices,
        [service]: !preferences.navServices[service],
      },
    }
    await updatePreferences(newPreferences)
  }

  return {
    preferences,
    updatePreferences,
    toggleNavService,
    loading,
    isLoggedIn: !!user,
  }
}
