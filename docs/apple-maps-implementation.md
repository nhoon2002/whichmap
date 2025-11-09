# Apple Maps Server API Implementation Guide

Complete step-by-step guide to integrate Apple Maps Server API into WhichMap.

---

## Overview

This guide walks through implementing Apple Maps Server API to enable real route comparisons alongside Google Maps. By the end, you'll have a working Apple Maps integration that returns ETAs, distances, and route data.

**Estimated Time:** 2-3 hours  
**Difficulty:** Intermediate  
**Prerequisites:** Apple Developer Account ($99/year)

---

## Phase 1: Apple Developer Setup (30 minutes)

### Step 1.1: Sign Up for Apple Developer Program
1. Go to https://developer.apple.com/programs/
2. Enroll in the Apple Developer Program ($99/year)
3. Wait for approval (usually 24-48 hours, but can be instant)

### Step 1.2: Create Maps Identifier
1. Log in to https://developer.apple.com/account/
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Identifiers** → **+** (Add new)
4. Select **Maps IDs** → Continue
5. Enter:
   - **Description:** WhichMap Server API
   - **Identifier:** `com.whichmap.server` (or your bundle ID)
6. Click **Continue** → **Register**

### Step 1.3: Create API Key for Maps
1. In Apple Developer Console, go to **Keys** → **+** (Add new)
2. Enter:
   - **Key Name:** WhichMap Maps Server Key
3. Check **MapKit JS** (yes, even for Server API - it's the same key)
4. Click **Continue** → **Register**
5. **IMPORTANT:** Download the `.p8` key file immediately
   - You can only download this ONCE
   - Save it securely (e.g., `apple-maps-key.p8`)
6. Note down:
   - **Key ID** (e.g., `ABC123DEFG`)
   - **Team ID** (found in top-right of developer console)

### Step 1.4: Store Credentials Securely
Save these values - you'll need them for JWT generation:
- ✅ Key ID (10 characters)
- ✅ Team ID (10 characters)
- ✅ Private Key file (`.p8` file contents)

---

## Phase 2: JWT Token Generation Setup (45 minutes)

Apple Maps Server API uses JWT (JSON Web Tokens) for authentication instead of simple API keys.

### Step 2.1: Install JWT Library
```bash
cd main
npm install jsonwebtoken
```

### Step 2.2: Add Environment Variables
Add to `main/.env.local`:
```env
# Apple Maps Server API
APPLE_MAPS_TEAM_ID=YOUR_TEAM_ID
APPLE_MAPS_KEY_ID=YOUR_KEY_ID
APPLE_MAPS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
YOUR_PRIVATE_KEY_CONTENT_HERE
-----END PRIVATE KEY-----"
```

**Note:** For the private key, you can either:
- **Option A:** Paste the entire `.p8` file contents (including header/footer)
- **Option B:** Store the file path and read it at runtime

### Step 2.3: Update `.env.local.example`
Create/update `main/.env.local.example`:
```env
# Apple Maps Server API
APPLE_MAPS_TEAM_ID=your_team_id_here
APPLE_MAPS_KEY_ID=your_key_id_here
APPLE_MAPS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----"
```

### Step 2.4: Create JWT Token Utility
Create `main/src/lib/appleJWT.js`:
```javascript
import jwt from 'jsonwebtoken'

/**
 * Generate JWT token for Apple Maps Server API
 * Tokens are valid for 1 hour
 * @returns {string} JWT token
 */
export function generateAppleMapsToken() {
  const teamId = process.env.APPLE_MAPS_TEAM_ID
  const keyId = process.env.APPLE_MAPS_KEY_ID
  const privateKey = process.env.APPLE_MAPS_PRIVATE_KEY

  if (!teamId || !keyId || !privateKey) {
    throw new Error('Apple Maps credentials not configured')
  }

  const token = jwt.sign(
    {
      iss: teamId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiration
    },
    privateKey,
    {
      algorithm: 'ES256',
      keyid: keyId,
      header: {
        kid: keyId,
        typ: 'JWT',
        alg: 'ES256',
      },
    }
  )

  return token
}

/**
 * Token cache to avoid regenerating on every request
 * Tokens are valid for 1 hour, we cache for 55 minutes
 */
let cachedToken = null
let tokenExpiry = 0

export function getCachedAppleMapsToken() {
  const now = Date.now()
  
  // If token exists and hasn't expired, return cached version
  if (cachedToken && now < tokenExpiry) {
    return cachedToken
  }

  // Generate new token
  cachedToken = generateAppleMapsToken()
  tokenExpiry = now + 55 * 60 * 1000 // Cache for 55 minutes

  return cachedToken
}
```

---

## Phase 3: Apple Maps Service Implementation (60 minutes)

### Step 3.1: Implement `appleMapsService.js`
Update `main/src/services/routes/providers/appleMapsService.js`:

```javascript
/**
 * Apple Maps Server API Service
 * Fetches directions using Apple Maps Server API
 * Documentation: https://developer.apple.com/documentation/applemapsserverapi
 */

import { getCachedAppleMapsToken } from '@/lib/appleJWT'

const APPLE_MAPS_API_BASE = 'https://maps-api.apple.com/v1'

/**
 * Get route from Apple Maps Server API
 * @param {string} origin - Starting location (address or coordinates)
 * @param {string} destination - Ending location (address or coordinates)
 * @param {object} options - Additional options
 * @returns {Promise<object>} Normalized route object
 */
export async function getRoute(origin, destination, options = {}) {
  try {
    // Generate JWT token for authentication
    const token = getCachedAppleMapsToken()

    // Prepare request body
    const requestBody = {
      origin: origin,
      destination: destination,
      transportType: 'Automobile',
      requestsAlternateRoutes: true, // Get multiple route options
      lang: 'en-US',
    }

    // Add optional parameters
    if (options.avoid === 'tolls') {
      requestBody.avoid = ['Tolls']
    }

    // Call Apple Maps Directions API
    const response = await fetch(`${APPLE_MAPS_API_BASE}/directions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Apple Maps API error: ${response.status} - ${errorData.message || 'Unknown error'}`)
    }

    const data = await response.json()

    if (!data.routes || data.routes.length === 0) {
      throw new Error('No routes found from Apple Maps')
    }

    // Normalize the response to match our format
    return normalizeAppleMapsResponse(data)
  } catch (error) {
    console.error('Apple Maps API error:', error)
    throw error
  }
}

/**
 * Normalize Apple Maps API response to our standard format
 * @param {object} appleMapsResponse - Raw Apple Maps API response
 * @returns {object} Normalized route data
 */
function normalizeAppleMapsResponse(appleMapsResponse) {
  const routes = appleMapsResponse.routes.map((route, index) => {
    // Apple returns duration in seconds and distance in meters
    const durationSeconds = route.expectedTravelTime || 0
    const distanceMeters = route.distance || 0

    return {
      // Route identification
      provider: 'apple',
      routeIndex: index,
      summary: route.name || `Route ${index + 1}`,

      // Duration (seconds)
      duration: durationSeconds,
      durationText: formatDuration(durationSeconds),
      durationInTraffic: durationSeconds, // Apple already includes traffic
      durationInTrafficText: formatDuration(durationSeconds),

      // Distance
      distance: distanceMeters,
      distanceText: formatDistance(distanceMeters),

      // Start/End locations
      startAddress: appleMapsResponse.origin?.name || 'Start',
      endAddress: appleMapsResponse.destination?.name || 'End',
      startLocation: appleMapsResponse.origin?.coordinate,
      endLocation: appleMapsResponse.destination?.coordinate,

      // Additional info
      warnings: route.advisories || [],
      copyrights: 'Map data © Apple',

      // Steps (if available)
      steps: route.steps?.map(step => ({
        instruction: step.instructions || '',
        distance: formatDistance(step.distance || 0),
        duration: formatDuration(step.expectedTravelTime || 0),
        maneuver: step.maneuver || '',
      })) || [],

      // Polyline for map display (if available)
      polyline: route.polyline || '',
    }
  })

  return {
    routes,
    status: 'OK',
  }
}

/**
 * Format duration in seconds to human-readable text
 * @param {number} seconds
 * @returns {string}
 */
function formatDuration(seconds) {
  if (!seconds) return '0 min'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} min`
  }
  return `${minutes} min`
}

/**
 * Format distance in meters to human-readable text
 * @param {number} meters
 * @returns {string}
 */
function formatDistance(meters) {
  if (!meters) return '0 mi'

  const miles = (meters * 0.000621371).toFixed(1)
  return `${miles} mi`
}

/**
 * Generate deep link URL for Apple Maps app
 * @param {string} origin
 * @param {string} destination
 * @returns {string} Deep link URL
 */
export function getDeepLinkUrl(origin, destination) {
  const params = new URLSearchParams({
    saddr: origin,
    daddr: destination,
    dirflg: 'd', // driving directions
  })

  return `maps://maps.apple.com/?${params}`
}

/**
 * Generate web URL for Apple Maps
 * @param {string} origin
 * @param {string} destination
 * @returns {string} Web URL
 */
export function getWebUrl(origin, destination) {
  const params = new URLSearchParams({
    saddr: origin,
    daddr: destination,
  })

  return `https://maps.apple.com/?${params}`
}
```

### Step 3.2: Update Route Service Registry
Update `main/src/services/routes/routeService.js`:

```javascript
// Change line 26 from:
hasAPI: false, // Deep links only

// To:
hasAPI: true, // Full route API available
```

---

## Phase 4: Update UI Configuration (15 minutes)

### Step 4.1: Update Settings Component
Update `main/src/components/Settings.jsx`:

```javascript
// Change line 30 from:
{ key: 'apple', label: 'Apple Maps', available: false, comingSoon: true },

// To:
{ key: 'apple', label: 'Apple Maps', available: true },
```

### Step 4.2: Update Default Preferences
Update `main/src/contexts/UserPreferencesContext.jsx`:

```javascript
// Change lines 16-21 from:
const [preferences, setPreferences] = useState(() => ({
  navServices: {
    google: false,
    apple: true,
    waze: true,
  },
}))

// To:
const [preferences, setPreferences] = useState(() => ({
  navServices: {
    google: true,  // Enable Google by default
    apple: true,   // Enable Apple by default
    waze: false,   // Disable Waze (not implemented yet)
  },
}))
```

### Step 4.3: Update User Model Defaults
Update `main/src/models/User.js`:

```javascript
// Keep lines 14-20 as:
static defaultPreferences = {
  navServices: {
    google: true,
    apple: true,
    waze: false,  // Disable Waze until implemented
  },
}
```

---

## Phase 5: Testing (30 minutes)

### Step 5.1: Test JWT Token Generation
Create a test file `main/src/lib/__test_apple_jwt.js`:

```javascript
import { generateAppleMapsToken, getCachedAppleMapsToken } from './appleJWT'

// Test token generation
try {
  console.log('Generating Apple Maps JWT token...')
  const token = generateAppleMapsToken()
  console.log('✅ Token generated successfully')
  console.log('Token preview:', token.substring(0, 50) + '...')
  
  // Test caching
  const cachedToken = getCachedAppleMapsToken()
  console.log('✅ Token caching works')
  
  console.log('\n🎉 JWT setup is working!')
} catch (error) {
  console.error('❌ JWT generation failed:', error.message)
}
```

Run: `node main/src/lib/__test_apple_jwt.js`

### Step 5.2: Test Apple Maps API Call
Create a test file `main/src/services/routes/providers/__test_apple.js`:

```javascript
import { getRoute } from './appleMapsService.js'

async function testAppleMaps() {
  try {
    console.log('Testing Apple Maps API...')
    
    const result = await getRoute(
      '1932 Selby Ave, Los Angeles, CA 90025',
      '111 N Broadway, Los Angeles, CA 90012'
    )
    
    console.log('✅ Apple Maps API working!')
    console.log('Routes found:', result.routes.length)
    console.log('First route ETA:', result.routes[0].durationText)
    console.log('First route distance:', result.routes[0].distanceText)
    
    console.log('\n🎉 Apple Maps integration successful!')
  } catch (error) {
    console.error('❌ Apple Maps API failed:', error.message)
  }
}

testAppleMaps()
```

Run: `node main/src/services/routes/providers/__test_apple.js`

### Step 5.3: Test Full Integration
1. Start dev server: `npm run dev`
2. Open http://localhost:3000
3. Open Settings → Enable both Google and Apple Maps
4. Enter test addresses and click "Compare Routes"
5. Verify both providers return results
6. Check that fastest route is highlighted correctly

### Step 5.4: Test Error Handling
Test these scenarios:
- Invalid addresses
- Missing API credentials
- Rate limiting (make 25,000+ requests in a day - just kidding, don't do this)
- Network failures

---

## Phase 6: Documentation Updates (15 minutes)

### Step 6.1: Update README.md
Add to the "Environment Variables" section:

```markdown
### Apple Maps (Server-side only)
- `APPLE_MAPS_TEAM_ID` - Apple Developer Team ID
- `APPLE_MAPS_KEY_ID` - Apple Maps API Key ID
- `APPLE_MAPS_PRIVATE_KEY` - Apple Maps Private Key (.p8 file contents)
```

### Step 6.2: Update CLAUDE.md
Update the "Current Implementation Status" section:

```markdown
### Phase 3 - API Integration & Security (COMPLETE)
- ✅ Google Maps Routes API v2 integration (working)
- ✅ Apple Maps Server API integration (working)
- ✅ Service layer architecture (routeService.js)
- ✅ React Query caching
- ✅ Rate limiting (10 req/min per IP)
- ✅ Input validation with Zod schemas
- ✅ Error sanitization (no internal details exposed)
- ⚠️ Waze - marked as "Coming Soon" (no public API)
```

### Step 6.3: Create Apple Maps Setup Documentation
Create `docs/apple-maps-setup.md` with:
- Apple Developer account setup
- API key generation steps
- JWT token explanation
- Troubleshooting guide
- Rate limits and pricing

---

## Phase 7: Deployment Preparation (15 minutes)

### Step 7.1: Add Environment Variables to Vercel/Hosting
When deploying, add these environment variables:
- `APPLE_MAPS_TEAM_ID`
- `APPLE_MAPS_KEY_ID`
- `APPLE_MAPS_PRIVATE_KEY`

**Important:** For the private key in Vercel:
- Paste the entire `.p8` file contents including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Replace newlines with `\n` if needed

### Step 7.2: Test in Production
1. Deploy to staging environment
2. Test with real addresses
3. Monitor error logs
4. Check API usage in Apple Developer Console

---

## Troubleshooting

### Issue: "Apple Maps credentials not configured"
**Solution:** Check that all three environment variables are set correctly in `.env.local`

### Issue: "JWT generation failed"
**Solution:** 
- Verify your private key format (should include header/footer)
- Check that Key ID and Team ID are correct (10 characters each)
- Ensure you're using the ES256 algorithm

### Issue: "401 Unauthorized"
**Solution:**
- Regenerate JWT token
- Verify your API key has MapKit JS enabled
- Check that your Apple Developer account is active

### Issue: "No routes found"
**Solution:**
- Verify addresses are valid
- Check that origin and destination are different
- Try with coordinates instead of addresses

### Issue: "Rate limit exceeded"
**Solution:**
- Apple Maps allows 25,000 requests/day on free tier
- Implement request caching
- Consider upgrading to paid tier

---

## Success Criteria

✅ JWT token generation works  
✅ Apple Maps API returns route data  
✅ Routes display in UI alongside Google Maps  
✅ Fastest route highlighting works correctly  
✅ Deep links open Apple Maps app  
✅ Error handling works for invalid inputs  
✅ Settings toggle enables/disables Apple Maps  
✅ User preferences persist in Firestore  
✅ "Coming Soon" badge removed from Apple Maps  

---

## Next Steps After Implementation

1. **Monitor API Usage** - Track requests in Apple Developer Console
2. **Optimize Caching** - Cache routes for 5-10 minutes to reduce API calls
3. **Add Analytics** - Track which provider wins most often
4. **Implement Waze** - Research Waze API alternatives
5. **Performance Testing** - Compare Apple vs Google response times
6. **User Feedback** - Collect feedback on accuracy

---

## Estimated Costs

- **Apple Developer Account:** $99/year (one-time setup)
- **Apple Maps API:** Free up to 25,000 requests/day
- **Beyond 25k requests/day:** Contact Apple for pricing

**For WhichMap's scale:** Free tier should be sufficient for months/years.

---

## Resources

- [Apple Maps Server API Documentation](https://developer.apple.com/documentation/applemapsserverapi)
- [Apple Developer Portal](https://developer.apple.com/account/)
- [JWT.io Debugger](https://jwt.io/) - Debug your JWT tokens
- [Apple Maps API Rate Limits](https://developer.apple.com/documentation/applemapsserverapi/rate_limits)

---

## Timeline Summary

| Phase | Duration | Description |
|-------|----------|-------------|
| 1. Apple Developer Setup | 30 min | Create account, keys, credentials |
| 2. JWT Token Setup | 45 min | Install library, create token utility |
| 3. Service Implementation | 60 min | Build appleMapsService.js |
| 4. UI Updates | 15 min | Enable Apple Maps in settings |
| 5. Testing | 30 min | Test JWT, API, and full integration |
| 6. Documentation | 15 min | Update README, CLAUDE.md |
| 7. Deployment Prep | 15 min | Configure production environment |
| **Total** | **3.5 hours** | End-to-end implementation |

---

**Ready to start? Let's begin with Phase 1!** 🚀

