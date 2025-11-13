'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { onAuthChange } from '@/services/auth/authService'
import { User } from '@/models/User'
import type { UserPreferences } from '@/types'
import type { User as FirebaseUser } from 'firebase/auth'

interface UserPreferencesContextValue {
  preferences: UserPreferences
  updatePreferences: (newPreferences: UserPreferences) => Promise<void>
  toggleNavService: (service: keyof UserPreferences['navServices']) => Promise<void>
  loading: boolean
  isLoggedIn: boolean
}

const UserPreferencesContext = createContext<UserPreferencesContextValue | null>(null)

interface UserPreferencesProviderProps {
  children: ReactNode
}

/**
 * Provider for user preferences
 * Manages a single shared state across all components
 */
export function UserPreferencesProvider({ children }: UserPreferencesProviderProps) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null)
  const [userModel, setUserModel] = useState<User | null>(null)
  const [preferences, setPreferences] = useState<UserPreferences>(() => ({
    navServices: {
      google: true,
      apple: true,
      waze: false, // Waze Transport SDK pending approval
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
        // Find or create user
        let user = await User.find(currentUser.uid)
        if (!user) {
          user = await User.create(currentUser.uid, currentUser.email)
        }

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

  const updatePreferences = async (newPreferences: UserPreferences): Promise<void> => {
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

  const toggleNavService = async (service: keyof UserPreferences['navServices']): Promise<void> => {
    const newPreferences: UserPreferences = {
      ...preferences,
      navServices: {
        ...preferences.navServices,
        [service]: !preferences.navServices[service],
      },
    }

    await updatePreferences(newPreferences)
  }

  const value: UserPreferencesContextValue = {
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
export function useUserPreferences(): UserPreferencesContextValue {
  const context = useContext(UserPreferencesContext)
  if (!context) {
    throw new Error('useUserPreferences must be used within UserPreferencesProvider')
  }
  return context
}
