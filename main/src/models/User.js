import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

/**
 * User Model
 * Manages user data in Firestore
 * Similar to PHP/Laravel models
 */
export class User {
  // Collection name
  static collection = 'users'

  // Default preferences structure
  static defaultPreferences = {
    navServices: {
      google: true,
      apple: true,
      waze: false, // Waze not yet implemented
    },
  }

  constructor(data) {
    this.id = data.id
    this.email = data.email
    this.createdAt = data.createdAt
    this.preferences = data.preferences || User.defaultPreferences
  }

  /**
   * Find a user by ID
   * @param {string} userId - Firebase Auth UID
   * @returns {Promise<User|null>}
   */
  static async find(userId) {
    try {
      const userDocRef = doc(db, User.collection, userId)
      const userDoc = await getDoc(userDocRef)

      if (!userDoc.exists()) {
        return null
      }

      return new User({
        id: userId,
        ...userDoc.data(),
      })
    } catch (error) {
      console.error('Error finding user:', error)
      throw error
    }
  }

  /**
   * Create a new user document
   * @param {string} userId - Firebase Auth UID
   * @param {object} userData - User data
   * @returns {Promise<User>}
   */
  static async create(userId, userData) {
    try {
      const data = {
        email: userData.email,
        createdAt: new Date(),
        preferences: userData.preferences || User.defaultPreferences,
      }

      const userDocRef = doc(db, User.collection, userId)
      await setDoc(userDocRef, data)

      return new User({
        id: userId,
        ...data,
      })
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  }

  /**
   * Find user by ID or create if doesn't exist
   * @param {string} userId - Firebase Auth UID
   * @param {object} userData - User data for creation
   * @returns {Promise<User>}
   */
  static async findOrCreate(userId, userData) {
    const user = await User.find(userId)
    if (user) {
      return user
    }
    return await User.create(userId, userData)
  }

  /**
   * Update user preferences
   * @param {object} newPreferences - New preferences object
   * @returns {Promise<void>}
   */
  async updatePreferences(newPreferences) {
    try {
      const userDocRef = doc(db, User.collection, this.id)
      await updateDoc(userDocRef, {
        preferences: newPreferences,
      })

      // Update local instance
      this.preferences = newPreferences
    } catch (error) {
      console.error('Error updating preferences:', error)
      throw error
    }
  }
}
