/**
 * Tracking Service for Commission-Based Payouts
 * Tracks user search sessions and provider clicks for attribution
 */

import { 
  collection, 
  addDoc, 
  Timestamp,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { RouteResult } from '@/types'

export interface DeviceInfo {
  screenWidth: number
  screenHeight: number
  hasTouch: boolean
  platform: string
  language: string
}

export interface TrackingEvent {
  trackingCode: string
  userId: string | null
  sessionId: string
  
  // Search details
  origin: string
  originCoords?: { lat: number; lng: number }
  destination: string
  destCoords?: { lat: number; lng: number }
  
  // Provider results shown to user
  providers: Array<{
    id: string
    name: string
    eta: number
    distance: string
    isFastest: boolean
  }>
  
  // Attribution
  referralSource?: string
  utmParams?: {
    source?: string
    medium?: string
    campaign?: string
    content?: string
  }
  
  // Metadata
  createdAt: Timestamp
  device: DeviceInfo
}

/**
 * Tracking click event - stored in separate collection for easy analytics
 * Linked to TrackingEvent via trackingCode
 */
export interface TrackingClick {
  trackingCode: string      // Links to parent TrackingEvent
  sessionId: string         // Denormalized for easier queries
  userId: string | null     // Denormalized for easier queries
  providerId: string        // 'google' | 'apple' | 'waze'
  createdAt: Timestamp
}

const EVENTS_COLLECTION = 'tracking_events'
const CLICKS_COLLECTION = 'tracking_clicks'
const SESSION_ID_KEY = 'whichmap_session_id'
const TRACKING_CODE_KEY = 'whichmap_current_tracking_code'

/**
 * Generate a unique tracking code
 */
function generateTrackingCode(): string {
  return `wm_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

/**
 * Get or create session ID (persists across browser sessions via localStorage)
 */
function getSessionId(): string {
  if (typeof window === 'undefined') return 'server'
  
  let sessionId = localStorage.getItem(SESSION_ID_KEY)
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
    localStorage.setItem(SESSION_ID_KEY, sessionId)
  }
  return sessionId
}

/**
 * Get device information for analytics
 * 
 * Note on values:
 * - screenWidth/Height: Physical screen dimensions (not browser window size)
 *   These don't change when user resizes browser, but CAN be affected by
 *   Chrome's responsive mode / device emulation during development.
 * - hasTouch: True for touch-capable devices (phones, tablets, touch laptops)
 *   Also true in Chrome responsive mode (emulates touch).
 * - platform: OS identifier (e.g., 'MacIntel', 'iPhone', 'Linux x86_64', 'Win32')
 *   This is NOT affected by Chrome responsive mode - shows actual device.
 * - language: Browser language preference (e.g., 'en-US', 'ko-KR')
 * 
 * Detecting dev testing: A "MacIntel" platform with small screen + hasTouch
 * is clearly Chrome responsive mode, not a real mobile device.
 */
function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      screenWidth: 0,
      screenHeight: 0,
      hasTouch: false,
      platform: 'server',
      language: 'en',
    }
  }
  
  return {
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    platform: navigator.platform || 'unknown',
    language: navigator.language || 'en',
  }
}

/**
 * Parse UTM parameters from URL
 */
function getUtmParams(): TrackingEvent['utmParams'] | undefined {
  if (typeof window === 'undefined') return undefined
  
  const params = new URLSearchParams(window.location.search)
  const utmSource = params.get('utm_source')
  const utmMedium = params.get('utm_medium')
  const utmCampaign = params.get('utm_campaign')
  const utmContent = params.get('utm_content')
  
  if (!utmSource && !utmMedium && !utmCampaign && !utmContent) {
    return undefined
  }
  
  // Only include fields that have values (Firestore doesn't allow undefined)
  const utmParams: Record<string, string> = {}
  if (utmSource) utmParams.source = utmSource
  if (utmMedium) utmParams.medium = utmMedium
  if (utmCampaign) utmParams.campaign = utmCampaign
  if (utmContent) utmParams.content = utmContent
  
  return utmParams as TrackingEvent['utmParams']
}

/**
 * Get referral source
 */
function getReferralSource(): string | undefined {
  if (typeof window === 'undefined') return undefined
  if (typeof document === 'undefined') return undefined
  
  const referrer = document.referrer
  if (!referrer) return undefined
  
  try {
    const url = new URL(referrer)
    return url.hostname
  } catch {
    return undefined
  }
}

/**
 * Create a tracking event when user compares routes
 * Returns the tracking code to be stored for later click tracking
 */
export async function createTrackingEvent(
  userId: string | null,
  origin: string,
  destination: string,
  originCoords?: { lat: number; lng: number },
  destCoords?: { lat: number; lng: number },
  results?: RouteResult[]
): Promise<string> {
  const trackingCode = generateTrackingCode()
  
  try {
    const referralSource = getReferralSource()
    const utmParams = getUtmParams()
    
    // Find the fastest provider (lowest ETA)
    const fastestEta = results && results.length > 0 
      ? Math.min(...results.map(r => r.eta))
      : null
    
    const event: Record<string, unknown> = {
      trackingCode,
      userId,
      sessionId: getSessionId(),
      
      origin,
      destination,
      
      providers: results?.map(result => ({
        id: result.id,
        name: result.provider,
        eta: result.eta,
        distance: result.distance,
        isFastest: fastestEta !== null && result.eta === fastestEta,
      })) || [],
      
      device: getDeviceInfo(),
      createdAt: serverTimestamp(),
    }
    
    // Only add optional fields if they have values
    if (originCoords) event.originCoords = originCoords
    if (destCoords) event.destCoords = destCoords
    if (referralSource) event.referralSource = referralSource
    if (utmParams) event.utmParams = utmParams
    
    await addDoc(collection(db, EVENTS_COLLECTION), event)
    
    return trackingCode
  } catch (error) {
    console.error('Error creating tracking event:', error)
    // Don't fail the user's search if tracking fails
    return trackingCode
  }
}

/**
 * Track when user clicks a provider link
 * Creates a new document in tracking_clicks collection
 * This is the conversion event for commission tracking
 * 
 * @param trackingCode - Links this click to the parent search event
 * @param providerId - Which provider was clicked ('google', 'apple', 'waze')
 * @param userId - Optional user ID if logged in (for easier queries)
 */
export async function trackProviderClick(
  trackingCode: string,
  providerId: string,
  userId: string | null = null
): Promise<void> {
  if (!trackingCode) return
  
  try {
    // Create a new click document in the clicks collection
    // Denormalize sessionId and userId for easier queries
    const clickEvent = {
      trackingCode,
      sessionId: getSessionId(),
      userId,
      providerId,
      createdAt: serverTimestamp(),
    }
    
    await addDoc(collection(db, CLICKS_COLLECTION), clickEvent)
  } catch (error) {
    console.error('Error tracking provider click:', error)
    // Don't fail the user's navigation if tracking fails
  }
}

/**
 * Store tracking code in session for later use
 */
export function storeTrackingCode(trackingCode: string): void {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.setItem(TRACKING_CODE_KEY, trackingCode)
}

/**
 * Get current tracking code from session
 */
export function getCurrentTrackingCode(): string | null {
  if (typeof sessionStorage === 'undefined') return null
  return sessionStorage.getItem(TRACKING_CODE_KEY)
}

/**
 * Clear tracking code after use
 */
export function clearTrackingCode(): void {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.removeItem(TRACKING_CODE_KEY)
}
