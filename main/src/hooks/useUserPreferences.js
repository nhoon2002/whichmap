'use client'

import { useState, useEffect } from 'react'
import { onAuthChange } from '@/services/authService'
import { User } from '@/models/User'

/**
 * Custom hook to manage user preferences in Firestore
 * Uses the User model for data operations
 * @returns {Object} { preferences, updatePreferences, toggleNavService, loading, isLoggedIn }
 */
export function useUserPreferences() {
  const [currentUser, setCurrentUser] = useState(null)
  const [userModel, setUserModel] = useState(null)
  const [preferences, setPreferences] = useState(User.defaultPreferences)
  const [loading, setLoading] = useState(true)

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      setCurrentUser(firebaseUser)
    })
    return () => unsubscribe()
  }, [])

  // Load user preferences from Firestore when user signs in
  useEffect(() => {
    async function loadUserModel() {
      if (!currentUser) {
        // User not logged in, use defaults
        setUserModel(null)
        setPreferences(User.defaultPreferences)
        setLoading(false)
        return
      }

      try {
        // Find or create user in Firestore
        const user = await User.findOrCreate(currentUser.uid, {
          email: currentUser.email,
        })

        setUserModel(user)
        setPreferences(user.preferences)
      } catch (error) {
        console.error('Error loading user:', error)
        setPreferences(User.defaultPreferences)
      } finally {
        setLoading(false)
      }
    }

    loadUserModel()
  }, [currentUser])

  /**
   * Update user preferences in Firestore
   * @param {Object} newPreferences - Updated preferences object
   */
  const updatePreferences = async (newPreferences) => {
    // Update local state immediately for responsive UI
    setPreferences(newPreferences)

    if (!userModel) {
      // User not logged in, local state only
      return
    }

    try {
      await userModel.updatePreferences(newPreferences)
    } catch (error) {
      console.error('Error updating preferences:', error)
      // Revert local state on error
      setPreferences(userModel.preferences)
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
    isLoggedIn: !!currentUser,
  }
}
