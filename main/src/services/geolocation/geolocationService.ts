/**
 * Geolocation Service
 *
 * Handles geolocation with platform detection:
 * - iOS app: Uses Capacitor's native geolocation (respects iOS CoreLocation permissions)
 * - Browser: Uses HTML5 Geolocation API with optimized settings
 */

import { Capacitor } from '@capacitor/core'

// Defensive import - plugin might not be available in older app builds
let CapacitorGeolocation: typeof import('@capacitor/geolocation').Geolocation | null = null
try {
  const geolocationModule = require('@capacitor/geolocation')
  CapacitorGeolocation = geolocationModule.Geolocation
} catch (e) {
  // Plugin not available - will fall back to browser geolocation
  console.debug('Capacitor Geolocation plugin not available, using browser fallback')
}

export interface GeolocationPosition {
  lat: number
  lng: number
  accuracy?: number
  timestamp: number
}

export interface GeolocationError {
  code: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'NOT_SUPPORTED' | 'UNKNOWN'
  message: string
}

// Guard to prevent multiple simultaneous requests
let isRequesting = false
let pendingRequest: Promise<GeolocationPosition> | null = null

/**
 * Request current position with platform-specific implementation
 *
 * iOS App (Capacitor): Uses native CoreLocation API which respects persistent permissions
 * Browser: Uses Geolocation API with 5-minute cache to reduce permission prompts
 */
export async function getCurrentPosition(): Promise<GeolocationPosition> {
  // If already requesting, return the pending request
  if (isRequesting && pendingRequest) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Geolocation] Request already in progress, reusing...')
    }
    return pendingRequest
  }

  isRequesting = true
  const isNative = Capacitor.isNativePlatform()
  const platform = Capacitor.getPlatform()

  // Create the request promise
  // Only use native if plugin is available
  if (isNative && (platform === 'ios' || platform === 'android') && CapacitorGeolocation) {
    pendingRequest = getCurrentPositionNative()
  } else {
    pendingRequest = getCurrentPositionBrowser()
  }

  // Wait for completion and cleanup
  try {
    const result = await pendingRequest
    return result
  } finally {
    isRequesting = false
    pendingRequest = null
  }
}

/**
 * Native implementation using Capacitor Geolocation plugin
 * Uses iOS CoreLocation APIs which properly handle "Allow While Using App" permission
 */
async function getCurrentPositionNative(): Promise<GeolocationPosition> {
  // Safety check - should never reach here if plugin unavailable, but just in case
  if (!CapacitorGeolocation) {
    throw {
      code: 'NOT_SUPPORTED',
      message: 'Capacitor Geolocation plugin not available',
    } as GeolocationError
  }

  try {
    // Check if we have permission
    const permissionStatus = await CapacitorGeolocation.checkPermissions()

    // Request permission if not granted
    if (permissionStatus.location !== 'granted') {
      const requestResult = await CapacitorGeolocation.requestPermissions()

      if (requestResult.location !== 'granted') {
        throw {
          code: 'PERMISSION_DENIED',
          message: 'Location access denied. Please enable location permissions in Settings.',
        } as GeolocationError
      }
    }

    // Get current position
    const position = await CapacitorGeolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // 5 minutes cache
    })

    return {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp,
    }
  } catch (error: unknown) {
    throw normalizeError(error)
  }
}

/**
 * Browser implementation using HTML5 Geolocation API
 * Uses 5-minute cache and permission state tracking to minimize prompts
 */
async function getCurrentPositionBrowser(): Promise<GeolocationPosition> {
  // Check if geolocation is supported
  if (!navigator.geolocation) {
    throw {
      code: 'NOT_SUPPORTED',
      message: 'Geolocation is not supported by your browser',
    } as GeolocationError
  }

  try {
    // Try to check permission status (not supported in all browsers)
    if ('permissions' in navigator) {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' as PermissionName })

        if (permissionStatus.state === 'denied') {
          throw {
            code: 'PERMISSION_DENIED',
            message: 'Location access denied. Please enable location permissions in your browser settings.',
          } as GeolocationError
        }
      } catch (e) {
        // Permissions API not supported or query failed, continue anyway
        console.debug('Permissions API not available:', e)
      }
    }

    // Get current position with caching
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp,
          })
        },
        (error) => {
          reject(error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes cache - prevents repeated permission prompts
        }
      )
    })

    return position
  } catch (error: unknown) {
    throw normalizeError(error)
  }
}

/**
 * Check if geolocation permissions have been granted
 * Note: Only works in browsers that support Permissions API (not iOS Safari)
 */
export async function checkPermissionStatus(): Promise<'granted' | 'denied' | 'prompt' | 'unsupported'> {
  const isNative = Capacitor.isNativePlatform()

  if (isNative && CapacitorGeolocation) {
    try {
      const status = await CapacitorGeolocation.checkPermissions()
      return status.location === 'granted' ? 'granted' : status.location === 'denied' ? 'denied' : 'prompt'
    } catch {
      return 'unsupported'
    }
  } else {
    // Browser
    if ('permissions' in navigator) {
      try {
        const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
        return status.state as 'granted' | 'denied' | 'prompt'
      } catch {
        return 'unsupported'
      }
    }
    return 'unsupported'
  }
}

/**
 * Normalize error objects from different sources
 */
function normalizeError(error: unknown): GeolocationError {
  // Capacitor error
  if (error && typeof error === 'object' && 'message' in error) {
    const err = error as { message: string; code?: string }

    if (err.message.includes('denied') || err.message.includes('permission')) {
      return {
        code: 'PERMISSION_DENIED',
        message: 'Location access denied. Please enable location permissions.',
      }
    }
  }

  // Browser GeolocationPositionError
  if (error && typeof error === 'object' && 'code' in error) {
    const geoError = error as { code: number; message?: string }

    switch (geoError.code) {
      case 1: // PERMISSION_DENIED
        return {
          code: 'PERMISSION_DENIED',
          message: 'Location access denied. Please enable location permissions.',
        }
      case 2: // POSITION_UNAVAILABLE
        return {
          code: 'POSITION_UNAVAILABLE',
          message: 'Location unavailable. Please try again.',
        }
      case 3: // TIMEOUT
        return {
          code: 'TIMEOUT',
          message: 'Location request timed out. Please try again.',
        }
    }
  }

  // Generic error
  return {
    code: 'UNKNOWN',
    message: 'Unable to get your location. Please try again.',
  }
}
