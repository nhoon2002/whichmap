/**
 * Google Maps API Type Definitions
 * Type definitions for Google Maps Routes API (v2) and related services
 * Documentation: https://developers.google.com/maps/documentation/routes
 */

/**
 * Duration format (protobuf)
 * Can be either a string like "123s" or an object with seconds property
 */
export type Duration = string | { seconds: string | number }

/**
 * Google Maps location format for Routes API
 */
export interface GoogleMapsLocation {
  location?: {
    latLng: {
      latitude: number
      longitude: number
    }
  }
  address?: string
}

/**
 * Travel mode for routing
 */
export type GoogleTravelMode = 'DRIVE' | 'BICYCLE' | 'WALK' | 'TWO_WHEELER'

/**
 * Routing preference
 */
export type GoogleRoutingPreference = 'TRAFFIC_AWARE_OPTIMAL' | 'TRAFFIC_UNAWARE'

/**
 * Unit system
 */
export type GoogleUnits = 'IMPERIAL' | 'METRIC'

/**
 * Route modifiers (avoid options)
 */
export interface GoogleRouteModifiers {
  avoidTolls: boolean
  avoidHighways: boolean
  avoidFerries: boolean
}

/**
 * Lat/Lng coordinate pair (Google format uses latitude/longitude)
 */
export interface GoogleLatLng {
  latitude: number
  longitude: number
}

/**
 * Convert GoogleLatLng to standard Coordinates format
 */
export function googleLatLngToCoordinates(latLng: GoogleLatLng): { lat: number; lng: number } {
  return {
    lat: latLng.latitude,
    lng: latLng.longitude,
  }
}

/**
 * Location with address and coordinates
 */
export interface GoogleLocation {
  address?: string
  latLng?: GoogleLatLng
}

/**
 * Navigation instruction
 */
export interface GoogleNavigationInstruction {
  instructions?: string
  maneuver?: string
}

/**
 * Route step
 */
export interface GoogleRouteStep {
  navigationInstruction?: GoogleNavigationInstruction
  distanceMeters?: number
  staticDuration?: string | { seconds: string | number }
}

/**
 * Route leg (segment of a route)
 */
export interface GoogleRouteLeg {
  startLocation?: GoogleLocation
  endLocation?: GoogleLocation
  steps?: GoogleRouteStep[]
}

/**
 * Polyline encoding
 */
export interface GooglePolyline {
  encodedPolyline: string
}

/**
 * Individual route in response
 */
export interface GoogleRoute {
  description?: string
  duration?: string | { seconds: string | number }
  distanceMeters?: number
  polyline?: GooglePolyline
  legs?: GoogleRouteLeg[]
  warnings?: string[]
}

/**
 * Google Maps Routes API request
 */
export interface GoogleRoutesRequest {
  origin: GoogleMapsLocation
  destination: GoogleMapsLocation
  travelMode: GoogleTravelMode
  routingPreference: GoogleRoutingPreference
  computeAlternativeRoutes: boolean
  routeModifiers: GoogleRouteModifiers
  languageCode: string
  units: GoogleUnits
}

/**
 * Google Maps Routes API response
 */
export interface GoogleRoutesResponse {
  routes: GoogleRoute[]
}
