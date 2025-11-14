/**
 * Search History Management
 * Stores and retrieves recent searches from localStorage
 */

export interface SearchHistoryItem {
  address: string
  timestamp: number
  coordinates?: {
    lat: number
    lng: number
  }
}

const STORAGE_KEY = 'whichmap_search_history'
const MAX_HISTORY_ITEMS = 5

/**
 * Get search history from localStorage
 */
export function getSearchHistory(): SearchHistoryItem[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    
    const history = JSON.parse(stored) as SearchHistoryItem[]
    return history.sort((a, b) => b.timestamp - a.timestamp)
  } catch (error) {
    console.error('Error reading search history:', error)
    return []
  }
}

/**
 * Add a search to history
 */
export function addToSearchHistory(address: string, coordinates?: { lat: number; lng: number }): void {
  if (typeof window === 'undefined') return
  if (!address || address === 'Current Location') return // Don't save "Current Location"
  
  try {
    const history = getSearchHistory()
    
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
    console.error('Error saving search history:', error)
  }
}

/**
 * Clear all search history
 */
export function clearSearchHistory(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Error clearing search history:', error)
  }
}

/**
 * Check if user has any search history
 */
export function hasSearchHistory(): boolean {
  return getSearchHistory().length > 0
}

