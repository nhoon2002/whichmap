/**
 * IP Geolocation API Route
 * Returns approximate location based on client IP address
 * Used as fallback for autocomplete biasing when device location unavailable
 *
 * Privacy: Only provides city-level accuracy, no device sensors accessed
 * Rate Limit: 45 requests/minute (ip-api.com free tier)
 * Supports: IPv4 and IPv6
 */

import { NextRequest, NextResponse } from 'next/server'

interface IpApiResponse {
  status: string
  message?: string
  country: string
  countryCode: string
  region: string
  regionName: string
  city: string
  lat: number
  lon: number
  timezone: string
  query: string // The IP that was queried
}

export async function GET(request: NextRequest) {
  try {
    // Get client IP from headers (works for both IPv4 and IPv6)
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const clientIp = forwardedFor?.split(',')[0]?.trim() || realIp

    // Build URL - if no IP provided, ip-api.com will use the requester's IP
    const apiUrl = clientIp && !clientIp.startsWith('127.') && !clientIp.startsWith('::1') && !clientIp.startsWith('192.168.')
      ? `http://ip-api.com/json/${clientIp}?fields=status,message,country,countryCode,region,regionName,city,lat,lon,timezone,query`
      : 'http://ip-api.com/json/?fields=status,message,country,countryCode,region,regionName,city,lat,lon,timezone,query'

    const response = await fetch(apiUrl)

    if (!response.ok) {
      throw new Error('IP geolocation service unavailable')
    }

    const data = await response.json() as IpApiResponse

    // Check for error response
    if (data.status === 'fail') {
      console.error('IP geolocation error:', data.message)
      return NextResponse.json(
        { error: data.message || 'Unable to determine location from IP' },
        { status: 400 }
      )
    }

    // Return coordinates and city info
    return NextResponse.json({
      coordinates: {
        lat: data.lat,
        lng: data.lon,
      },
      city: data.city,
      region: data.regionName,
      country: data.countryCode,
      source: 'ip',
      query: data.query, // Return the IP that was geolocated (for debugging)
    })
  } catch (error) {
    console.error('IP geolocation error:', error)
    return NextResponse.json(
      { error: 'Failed to get location from IP' },
      { status: 500 }
    )
  }
}
