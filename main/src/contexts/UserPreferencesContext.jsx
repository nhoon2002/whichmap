'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { onAuthChange } from '@/services/auth/authService'
import { User } from '@/models/User'

const UserPreferencesContext = createContext(null)

/**
 * Provider for user preferences
 * Manages a single shared state across all components
 */
export function UserPreferencesProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userModel, setUserModel] = useState(null)
  const [preferences, setPreferences] = useState(() => ({
    navServices: {
      google: false,
      apple: true,
      waze: true,
    },
  }))
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
        setUserModel(null)
        setLoading(false)
        return
      }

      try {
        const user = await User.findOrCreate(currentUser.uid, {
          email: currentUser.email,
        })

        setUserModel(user)
        setPreferences(user.preferences)
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserModel()
  }, [currentUser])

  const updatePreferences = async (newPreferences) => {
    setPreferences(newPreferences)

    if (!userModel) {
      return
    }

    try {
      await userModel.updatePreferences(newPreferences)
    } catch (error) {
      console.error('Error updating preferences:', error)
      setPreferences(userModel.preferences)
      throw error
    }
  }

  const toggleNavService = async (service) => {
    const newPreferences = {
      ...preferences,
      navServices: {
        ...preferences.navServices,
        [service]: !preferences.navServices[service],
      },
      _updated: Date.now(),
    }

    await updatePreferences(newPreferences)
  }

  const value = {
    preferences,
    updatePreferences,
    toggleNavService,
    loading,
    isLoggedIn: !!currentUser,
  }

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  )
}

/**
 * Hook to use preferences from context
 */
export function useUserPreferences() {
  const context = useContext(UserPreferencesContext)
  if (!context) {
    throw new Error('useUserPreferences must be used within UserPreferencesProvider')
  }
  return context
}
