/**
 * User Model
 * Handles user data operations with Firestore
 * 
 * Firestore Document Structure:
 * {
 *   email: string | null              // null if deactivated (PII removed)
 *   createdAt: Timestamp              // Account creation date
 *   deactivatedAt: Timestamp | null   // Deactivation timestamp (null = active)
 *   preferences: UserPreferences      // User preferences
 * }
 */

import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { UserPreferences } from '@/types'

export class User {
  id: string
  email: string | null
  createdAt: Date
  preferences: UserPreferences
  deactivatedAt?: Date | null

  constructor(
    id: string, 
    email: string | null, 
    createdAt: Date, 
    preferences: UserPreferences,
    deactivatedAt?: Date | null
  ) {
    this.id = id
    this.email = email
    this.createdAt = createdAt
    this.preferences = preferences
    this.deactivatedAt = deactivatedAt
  }

  static async find(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId))
      if (!userDoc.exists()) {
        return null
      }
      const data = userDoc.data()
      
      // Don't return deactivated users
      if (data.deactivatedAt) {
        return null
      }
      
      return new User(
        userDoc.id,
        data.email || null,
        data.createdAt?.toDate() || new Date(),
        data.preferences || { navServices: {} },
        data.deactivatedAt?.toDate() || null
      )
    } catch (error) {
      console.error('Error fetching user:', error)
      return null
    }
  }

  static async create(userId: string, email: string | null): Promise<User> {
    const defaultPreferences: UserPreferences = {
      navServices: {
        google: true,
        apple: true,
        waze: true,
      },
    }

    const userData = {
      email,
      createdAt: serverTimestamp(),
      preferences: defaultPreferences,
    }

    await setDoc(doc(db, 'users', userId), userData)

    return new User(userId, email, new Date(), defaultPreferences)
  }

  async updatePreferences(newPreferences: Partial<UserPreferences>): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', this.id), {
        preferences: { ...this.preferences, ...newPreferences },
      })
      this.preferences = { ...this.preferences, ...newPreferences }
    } catch (error) {
      console.error('Error updating preferences:', error)
      throw error
    }
  }
}
