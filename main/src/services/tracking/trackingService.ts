/**
 * Tracking Service for Commission-Based Payouts
 * Tracks user search sessions and provider clicks for attribution
 */

import { 
  collection, 
  addDoc, 
  doc,
  updateDoc,
  query,
  where,
  limit,
  getDocs,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { RouteResult } from '@/types'

export interface TrackingEvent {
  trackingCode: string
  userId: string | null
  sessionId: string
  
  // Search details
  origin: string
  originCoords?: { lat: number; lng: number }
  destination: string
  destCoords?: { lat: number; lng: number }
  
  // Provider results
  providers: Array<{
    id: string
    name: string
    eta: number
    distance: string
    isFastest: boolean
  }>
  
  // User action (filled when user clicks)
  providerClicked?: string
  clickTimestamp?: Timestamp
  
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
  userAgent: string
  deviceType?: 'mobile' | 'tablet' | 'desktop'
}

const COLLECTION_NAME = 'tracking_events'
const SESSION_STORAGE_KEY = 'whichmap_session_id'

/**
 * Generate a unique tracking code
 */
function generateTrackingCode(): string {
  return `wm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get or create session ID
 */
function getSessionId(): string {
  if (typeof window === 'undefined') return 'server'
  
  let sessionId = sessionStorage.getItem(SESSION_STORAGE_KEY)
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId)
  }
  return sessionId
}

/**
 * Get device type
 */
function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop'
  
  const width = window.innerWidth
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
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
    
    const event: Record<string, any> = {
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
      
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      deviceType: getDeviceType(),
      createdAt: serverTimestamp(),
    }
    
    // Only add optional fields if they have values
    if (originCoords) event.originCoords = originCoords
    if (destCoords) event.destCoords = destCoords
    if (referralSource) event.referralSource = referralSource
    if (utmParams) event.utmParams = utmParams
    
    await addDoc(collection(db, COLLECTION_NAME), event)
    
    return trackingCode
  } catch (error) {
    console.error('Error creating tracking event:', error)
    // Don't fail the user's search if tracking fails
    return trackingCode
  }
}

/**
 * Track when user clicks a provider link
 * This is the conversion event for commission tracking
 */
export async function trackProviderClick(
  trackingCode: string,
  providerId: string
): Promise<void> {
  if (!trackingCode) return
  
  try {
    // Find the tracking event by trackingCode
    // Note: This requires a Firestore index on trackingCode
    const eventsRef = collection(db, COLLECTION_NAME)
    const q = query(
      eventsRef,
      where('trackingCode', '==', trackingCode),
      limit(1)
    )
    
    const snapshot = await getDocs(q)
    
    if (!snapshot.empty && snapshot.docs[0]) {
      const docRef = doc(db, COLLECTION_NAME, snapshot.docs[0].id)
      await updateDoc(docRef, {
        providerClicked: providerId,
        clickTimestamp: serverTimestamp(),
      })
    }
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
  sessionStorage.setItem('whichmap_current_tracking_code', trackingCode)
}

/**
 * Get current tracking code from session
 */
export function getCurrentTrackingCode(): string | null {
  if (typeof sessionStorage === 'undefined') return null
  return sessionStorage.getItem('whichmap_current_tracking_code')
}

/**
 * Clear tracking code after use
 */
export function clearTrackingCode(): void {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.removeItem('whichmap_current_tracking_code')
}

