/**
 * Apple Maps API Type Definitions
 * Type definitions for Apple Maps Server API
 * Documentation: https://developer.apple.com/documentation/applemapsserverapi
 */

/**
 * ETA destination coordinates
 */
export interface AppleEtaDestination {
  latitude: number
  longitude: number
}

/**
 * Individual ETA result
 */
export interface AppleEta {
  expectedTravelTimeSeconds: number
  distanceMeters: number
  transportType?: string
  staticTravelTimeSeconds?: number
  destination?: AppleEtaDestination
}

/**
 * Apple Maps ETA API response
 */
export interface AppleEtaResponse {
  etas: AppleEta[]
}

/**
 * Transport types supported by Apple Maps
 */
export type AppleTransportType = 'Automobile' | 'Walking' | 'Transit'

