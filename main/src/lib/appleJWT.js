/**
 * Apple Maps JWT Token Generator
 * Generates and caches JWT tokens for Apple Maps Server API authentication
 * 
 * Apple Maps Server API requires JWT tokens signed with ES256 algorithm
 * Tokens are valid for 1 hour, we cache them for 55 minutes to avoid expiration issues
 */

import jwt from 'jsonwebtoken'

/**
 * Generate JWT token for Apple Maps Server API
 * @returns {string} JWT token
 * @throws {Error} If Apple Maps credentials are not configured
 */
export function generateAppleMapsToken() {
  const teamId = process.env.APPLE_MAPS_TEAM_ID
  const keyId = process.env.APPLE_MAPS_KEY_ID
  const privateKey = process.env.APPLE_MAPS_PRIVATE_KEY

  if (!teamId || !keyId || !privateKey) {
    throw new Error('Apple Maps credentials not configured. Please set APPLE_MAPS_TEAM_ID, APPLE_MAPS_KEY_ID, and APPLE_MAPS_PRIVATE_KEY in .env.local')
  }

  // Validate credentials format
  if (teamId.length !== 10) {
    throw new Error('APPLE_MAPS_TEAM_ID must be 10 characters')
  }
  if (keyId.length !== 10) {
    throw new Error('APPLE_MAPS_KEY_ID must be 10 characters')
  }
  if (!privateKey.includes('BEGIN PRIVATE KEY')) {
    throw new Error('APPLE_MAPS_PRIVATE_KEY must include BEGIN PRIVATE KEY header')
  }

  try {
    const now = Math.floor(Date.now() / 1000)

    // Ensure private key has proper newlines
    const formattedPrivateKey = privateKey.replace(/\\n/g, '\n')

    const token = jwt.sign(
      {
        iss: teamId,
        iat: now,
        exp: now + 3600, // Token expires in 1 hour
      },
      formattedPrivateKey,
      {
        algorithm: 'ES256',
        header: {
          kid: keyId,
          typ: 'JWT',
          alg: 'ES256',
        },
      }
    )

    return token
  } catch (error) {
    console.error('JWT generation error:', error)
    throw new Error(`Failed to generate Apple Maps JWT token: ${error.message}`)
  }
}

/**
 * Token cache to avoid regenerating JWT on every request
 * Tokens are valid for 1 hour, we cache for 55 minutes to be safe
 */
let cachedToken = null
let tokenExpiry = 0

/**
 * Get cached Apple Maps JWT token or generate a new one if expired
 * This reduces overhead and improves performance
 * @returns {string} Valid JWT token
 */
export function getCachedAppleMapsToken() {
  const now = Date.now()
  
  // If token exists and hasn't expired, return cached version
  if (cachedToken && now < tokenExpiry) {
    return cachedToken
  }

  // Generate new token
  cachedToken = generateAppleMapsToken()
  tokenExpiry = now + 55 * 60 * 1000 // Cache for 55 minutes (3300 seconds)

  return cachedToken
}

/**
 * Clear cached token (useful for testing or when credentials change)
 */
export function clearTokenCache() {
  cachedToken = null
  tokenExpiry = 0
}

/**
 * Access token cache (separate from JWT cache)
 * Access tokens are exchanged from JWT and valid for 30 minutes
 */
let cachedAccessToken = null
let accessTokenExpiry = 0

/**
 * Exchange JWT for Apple Maps access token
 * This is required by Apple Maps Server API - you can't use JWT directly
 * @returns {Promise<string>} Access token for Apple Maps API calls
 */
export async function getAppleMapsAccessToken() {
  const now = Date.now()

  // If access token exists and hasn't expired, return cached version
  if (cachedAccessToken && now < accessTokenExpiry) {
    return cachedAccessToken
  }

  // Get JWT token
  const jwt = getCachedAppleMapsToken()

  // Exchange JWT for access token
  try {
    const response = await fetch('https://maps-api.apple.com/v1/token', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to get Apple Maps access token: ${response.status} - ${errorText}`)
    }

    const data = await response.json()

    if (!data.accessToken) {
      throw new Error('No accessToken in response from Apple Maps token endpoint')
    }

    cachedAccessToken = data.accessToken
    // Cache for 25 minutes (access tokens valid for 30 min, we refresh early)
    accessTokenExpiry = now + 25 * 60 * 1000

    return cachedAccessToken
  } catch (error) {
    console.error('Apple Maps access token error:', error)
    throw error
  }
}

/**
 * Clear cached access token (useful for testing)
 */
export function clearAccessTokenCache() {
  cachedAccessToken = null
  accessTokenExpiry = 0
}


