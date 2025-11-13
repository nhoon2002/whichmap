/**
 * Deep Link Helpers
 * Utilities for generating and opening deep links across map providers
 */

import type { Location } from '@/types'

/**
 * Open a universal link (works on all platforms)
 * - Desktop: Opens in browser
 * - Mobile with app: Opens in native app
 * - Mobile without app: Opens in browser
 */
export function openMapLink(url: string | undefined): void {
  if (typeof window === 'undefined' || !url) {
    return
  }

  // Universal Links work everywhere - just open them!
  window.open(url, '_blank', 'noopener,noreferrer')
}

export function formatLocationForDeepLink(location: Location): string {
  if (typeof location === 'object' && location !== null && 'lat' in location && 'lng' in location) {
    return `${location.lat},${location.lng}`
  }
  if (typeof location === 'string') {
    return location
  }
  return String(location)
}

// Simple device detection without deprecated properties
function isIOS(): boolean {
  if (typeof window === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

function isAndroid(): boolean {
  if (typeof window === 'undefined') return false
  return /Android/.test(navigator.userAgent)
}

export function shouldUseDeepLink(): boolean {
  return isIOS() || isAndroid()
}
