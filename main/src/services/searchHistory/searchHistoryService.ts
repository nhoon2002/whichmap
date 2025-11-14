/**
 * Search History Service
 * Manages search history in Firestore for logged-in users
 * Falls back to localStorage for anonymous users
 */

import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  Timestamp,
  deleteDoc,
  updateDoc,
  doc
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface SearchHistoryItem {
  address: string
  timestamp: number
  coordinates?: {
    lat: number
    lng: number
  }
  searchType?: 'origin' | 'destination'
}

export interface FirestoreSearchHistoryItem {
  userId: string
  address: string
  timestamp: Timestamp
  coordinates?: {
    lat: number
    lng: number
  }
  searchType?: 'origin' | 'destination'
}

const COLLECTION_NAME = 'search_history'
const MAX_HISTORY_ITEMS = 5

// localStorage keys
const STORAGE_KEY = 'whichmap_search_history'

/**
 * Add search to history (Firestore for logged-in users, localStorage for anonymous)
 */
export async function addToSearchHistory(
  address: string,
  userId: string | null,
  coordinates?: { lat: number; lng: number },
  searchType?: 'origin' | 'destination'
): Promise<void> {
  if (!address || address === 'Current Location') return

  // If user is logged in, save to Firestore
  if (userId) {
    try {
      // Check if this address already exists for this user
      const existingQuery = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId),
        where('address', '==', address),
        limit(1)
      )
      
      const existingSnapshot = await getDocs(existingQuery)
      
      if (!existingSnapshot.empty && existingSnapshot.docs[0]) {
        // Update existing entry with new timestamp and coordinates
        const docRef = doc(db, COLLECTION_NAME, existingSnapshot.docs[0].id)
        await updateDoc(docRef, {
          coordinates: coordinates || null,
          searchType: searchType || null,
          timestamp: Timestamp.now(),
        })
      } else {
        // Create new entry
        await addDoc(collection(db, COLLECTION_NAME), {
          userId,
          address,
          coordinates: coordinates || null,
          searchType: searchType || null,
          timestamp: Timestamp.now(),
        })
      }

      // Optional: Clean up old entries (keep last 50 for analytics)
      await cleanupOldHistory(userId, 50)
    } catch (error) {
      console.error('Error saving search history to Firestore:', error)
      // Fallback to localStorage if Firestore fails
      addToLocalStorage(address, coordinates)
    }
  } else {
    // Anonymous user - use localStorage
    addToLocalStorage(address, coordinates)
  }
}

/**
 * Get search history (Firestore for logged-in users, localStorage for anonymous)
 */
export async function getSearchHistory(userId: string | null): Promise<SearchHistoryItem[]> {
  // If user is logged in, get from Firestore
  if (userId) {
    try {
      const historyQuery = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(MAX_HISTORY_ITEMS)
      )

      const snapshot = await getDocs(historyQuery)
      
      return snapshot.docs.map(doc => {
        const data = doc.data() as FirestoreSearchHistoryItem
        return {
          address: data.address,
          timestamp: data.timestamp.toMillis(),
          coordinates: data.coordinates,
          searchType: data.searchType,
        }
      })
    } catch (error) {
      console.error('Error fetching search history from Firestore:', error)
      // Fallback to localStorage if Firestore fails
      return getFromLocalStorage()
    }
  } else {
    // Anonymous user - use localStorage
    return getFromLocalStorage()
  }
}

/**
 * Clear search history
 */
export async function clearSearchHistory(userId: string | null): Promise<void> {
  if (userId) {
    try {
      const historyQuery = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId)
      )

      const snapshot = await getDocs(historyQuery)
      const deletePromises = snapshot.docs.map(docSnapshot => 
        deleteDoc(doc(db, COLLECTION_NAME, docSnapshot.id))
      )

      await Promise.all(deletePromises)
    } catch (error) {
      console.error('Error clearing search history:', error)
    }
  } else {
    clearLocalStorage()
  }
}

/**
 * Clean up old history entries (keep last N entries)
 */
async function cleanupOldHistory(userId: string, keepCount: number): Promise<void> {
  try {
    const historyQuery = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    )

    const snapshot = await getDocs(historyQuery)
    
    // Keep only the most recent entries
    if (snapshot.docs.length > keepCount) {
      const docsToDelete = snapshot.docs.slice(keepCount)
      const deletePromises = docsToDelete.map(docSnapshot =>
        deleteDoc(doc(db, COLLECTION_NAME, docSnapshot.id))
      )
      await Promise.all(deletePromises)
    }
  } catch (error) {
    console.error('Error cleaning up old history:', error)
  }
}

// ============================================
// localStorage Fallback Functions
// ============================================

function getFromLocalStorage(): SearchHistoryItem[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    
    const history = JSON.parse(stored) as SearchHistoryItem[]
    return history.sort((a, b) => b.timestamp - a.timestamp)
  } catch (error) {
    console.error('Error reading search history from localStorage:', error)
    return []
  }
}

function addToLocalStorage(address: string, coordinates?: { lat: number; lng: number }): void {
  if (typeof window === 'undefined') return
  
  try {
    const history = getFromLocalStorage()
    
    // Remove duplicates (same address)
    const filteredHistory = history.filter(item => 
      item.address.toLowerCase() !== address.toLowerCase()
    )
    
    // Add new item at the beginning
    const newItem: SearchHistoryItem = {
      address,
      timestamp: Date.now(),
      coordinates,
    }
    
    // Keep only the most recent MAX_HISTORY_ITEMS
    const updatedHistory = [newItem, ...filteredHistory].slice(0, MAX_HISTORY_ITEMS)
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory))
  } catch (error) {
    console.error('Error saving search history to localStorage:', error)
  }
}

function clearLocalStorage(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Error clearing localStorage:', error)
  }
}

/**
 * Check if user has any search history
 */
export async function hasSearchHistory(userId: string | null): Promise<boolean> {
  const history = await getSearchHistory(userId)
  return history.length > 0
}

