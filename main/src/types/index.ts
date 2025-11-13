/**
 * Core Type Definitions
 * Central type system for WhichMap
 */

// ============================================
// Location Types
// ============================================

/**
 * Coordinate pair (latitude, longitude)
 */
export interface Coordinates {
  lat: number
  lng: number
}

/**
 * Location can be either an address string or coordinates
 */
export type Location = string | Coordinates

/**
 * Place from Google Places Autocomplete
 */
export interface Place {
  address: string
  coordinates: Coordinates
  placeId?: string
}

// ============================================
// Route Types
// ============================================

/**
 * Provider identifier
 * Only includes currently implemented providers
 * TODO: Add 'tmap' | 'kakao' when implementing international providers
 */
export type ProviderId = 'google' | 'apple' | 'waze'

/**
 * Route result from a navigation provider
 */
export interface RouteResult {
  id: ProviderId
  provider: string
  eta: number
  distance: string
  unit: 'min'
  link: string

  // Optional detailed data
  summary?: string
  durationText?: string
  distanceMeters?: number
  startAddress?: string
  endAddress?: string
  warnings?: string[]
  steps?: RouteStep[]
}

/**
 * Individual step in a route
 */
export interface RouteStep {
  instruction: string
  distance: string
  duration: string
  maneuver?: string
}

/**
 * Raw route data from provider services (before normalization)
 */
export interface RawRouteData {
  provider: ProviderId
  duration: number // seconds
  durationInTraffic?: number // seconds
  durationText?: string
  durationInTrafficText?: string
  distance: number // meters
  distanceText?: string
  summary?: string
  startAddress?: string
  endAddress?: string
  startLocation?: Coordinates
  endLocation?: Coordinates
  warnings?: string[]
  steps?: RouteStep[]
  polyline?: string
  link?: string // Universal link to open in provider app
  message?: string // Message for providers without API
}

// ============================================
// User Preferences
// ============================================

/**
 * Navigation service toggles
 * TODO: Add tmap and kakao when implementing international providers
 */
export interface NavServices {
  google?: boolean
  apple?: boolean
  waze?: boolean
}

/**
 * User preferences stored in Firestore
 */
export interface UserPreferences {
  navServices: NavServices
  // Future preferences
  units?: 'metric' | 'imperial'
  theme?: 'light' | 'dark'
}

// ============================================
// Provider Service Interface
// ============================================

/**
 * Provider configuration
 */
export interface ProviderConfig {
  id: ProviderId
  name: string
  service: ProviderService
  hasAPI: boolean
}

/**
 * Standard interface all provider services must implement
 */
export interface ProviderService {
  getRoute(origin: Location, destination: Location, options?: RouteOptions): Promise<ProviderRouteResponse>
  getUniversalLink(origin: Location, destination: Location): string
  getWebUrl?(origin: Location, destination: Location): string
  getDeepLinkUrl?(origin: Location, destination: Location): string
}

/**
 * Route options for provider services
 */
export interface RouteOptions {
  avoid?: 'tolls' | 'highways' | 'ferries'
  transportType?: 'Automobile' | 'Walking' | 'Transit'
}

/**
 * Response from provider getRoute() call
 */
export interface ProviderRouteResponse {
  routes: RawRouteData[]
  status: 'OK' | 'ERROR'
  error?: string
}

// ============================================
// API Types
// ============================================

/**
 * Request body for /api/compare
 */
export interface CompareRoutesRequest {
  start: Location
  end: Location
  preferences?: UserPreferences
}

/**
 * Response from /api/compare
 */
export interface CompareRoutesResponse {
  success: boolean
  start: Location
  end: Location
  results: RouteResult[]
  timestamp: string
  error?: string
}

/**
 * Geocoding result
 */
export interface GeocodeResult {
  address: string
  coordinates: Coordinates
  formattedAddress?: string
  placeId?: string
}

/**
 * Autocomplete prediction
 */
export interface AutocompletePrediction {
  description: string
  placeId: string
  mainText: string
  secondaryText: string
}

// ============================================
// Firebase/Auth Types
// ============================================

/**
 * User data stored in Firestore
 */
export interface UserData {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  preferences: UserPreferences
  createdAt: string
  updatedAt: string
}

/**
 * Auth context value
 */
export interface AuthContextValue {
  user: UserData | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

// ============================================
// Component Props Types
// ============================================

/**
 * Props for ProviderCard component
 */
export interface ProviderCardProps {
  provider: string
  eta: number
  distance: string
  unit: 'min'
  isFastest: boolean
  link: string
}

/**
 * Props for AutocompleteInput component
 */
export interface AutocompleteInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  onSelect: (place: Place) => void
  onClear?: () => void
  onUseCurrentLocation?: () => void
  showLocationButton?: boolean
  showClearButton?: boolean
  className?: string
  autoComplete?: string
}

/**
 * Props for TextInput component
 */
export interface TextInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  className?: string
  type?: string
  autoComplete?: string
}

// ============================================
// Utility Types
// ============================================

/**
 * Result type for validation
 */
export interface ValidationResult<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

/**
 * Generic API error
 */
export interface ApiError {
  message: string
  code?: string
  statusCode?: number
}
