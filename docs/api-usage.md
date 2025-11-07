# WhichMap API Usage

The route comparison API is available at `/api/compare` and can be called from:
- The web app
- React Native apps
- Any HTTP client
- Third-party services

## Endpoints

### POST /api/compare

Compare travel times across Google Maps, Apple Maps, and Waze.

**Request:**
```javascript
POST https://your-domain.com/api/compare
Content-Type: application/json

{
  "start": "1932 Selby Ave, Los Angeles, CA 90025",
  "end": "111 N Broadway, Los Angeles, CA 90012"
}
```

**Response:**
```javascript
{
  "success": true,
  "start": "1932 Selby Ave, Los Angeles, CA 90025",
  "end": "111 N Broadway, Los Angeles, CA 90012",
  "results": [
    {
      "id": "google",
      "provider": "Google Maps",
      "eta": 25,
      "distance": "15.2 mi",
      "unit": "min"
    },
    {
      "id": "apple",
      "provider": "Apple Maps",
      "eta": 23,
      "distance": "15.1 mi",
      "unit": "min"
    },
    {
      "id": "waze",
      "provider": "Waze",
      "eta": 27,
      "distance": "15.3 mi",
      "unit": "min"
    }
  ],
  "timestamp": "2025-11-06T09:30:00.000Z"
}
```

### GET /api/compare

Alternative endpoint using query parameters.

**Request:**
```
GET https://your-domain.com/api/compare?start=StartAddress&end=EndAddress
```

## Usage Examples

### React Native

```javascript
// React Native example
async function compareRoutes(start, end) {
  try {
    const response = await fetch('https://your-domain.com/api/compare', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // TODO: Add your API key when monetization is enabled
        // 'x-api-key': 'your-api-key-here'
      },
      body: JSON.stringify({ start, end })
    });

    const data = await response.json();

    if (data.success) {
      // Find fastest route
      const fastest = data.results.reduce((prev, curr) =>
        curr.eta < prev.eta ? curr : prev
      );

      console.log('Fastest route:', fastest);
      return data.results;
    }
  } catch (error) {
    console.error('Error comparing routes:', error);
  }
}

// Usage
compareRoutes(
  '1932 Selby Ave, Los Angeles, CA 90025',
  '111 N Broadway, Los Angeles, CA 90012'
);
```

### JavaScript/Fetch

```javascript
// Browser or Node.js with fetch
fetch('https://your-domain.com/api/compare', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    start: 'New York, NY',
    end: 'Boston, MA'
  })
})
  .then(res => res.json())
  .then(data => console.log(data.results))
  .catch(err => console.error(err));
```

### cURL

```bash
# POST request
curl -X POST https://your-domain.com/api/compare \
  -H "Content-Type: application/json" \
  -d '{"start":"New York, NY","end":"Boston, MA"}'

# GET request
curl "https://your-domain.com/api/compare?start=New%20York%2C%20NY&end=Boston%2C%20MA"
```

### Python

```python
import requests

def compare_routes(start, end):
    url = "https://your-domain.com/api/compare"
    payload = {
        "start": start,
        "end": end
    }

    response = requests.post(url, json=payload)
    data = response.json()

    if data['success']:
        return data['results']
    else:
        raise Exception(data.get('error', 'Unknown error'))

# Usage
results = compare_routes(
    "1932 Selby Ave, Los Angeles, CA 90025",
    "111 N Broadway, Los Angeles, CA 90012"
)
print(results)
```

## Error Responses

**400 Bad Request - Missing parameters:**
```json
{
  "error": "Both start and end locations are required"
}
```

**401 Unauthorized - Invalid API key (when monetization enabled):**
```json
{
  "error": "Invalid API key"
}
```

**429 Too Many Requests - Rate limit exceeded:**
```json
{
  "error": "Rate limit exceeded"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

## Monetization Setup (TODO)

To enable API key authentication and rate limiting:

1. **Add API key validation in `app/api/compare/route.js`:**
```javascript
const apiKey = request.headers.get('x-api-key')
if (!apiKey || !isValidApiKey(apiKey)) {
  return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
}
```

2. **Implement rate limiting:**
```javascript
const rateLimitOk = await checkRateLimit(apiKey, request.ip)
if (!rateLimitOk) {
  return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
}
```

3. **Track usage for billing:**
```javascript
await logApiUsage(apiKey, {
  endpoint: '/api/compare',
  start,
  end,
  timestamp: new Date()
})
```

## Deployment

When deploying to Vercel/Netlify/etc:

1. The API route will be available at: `https://your-domain.com/api/compare`
2. Serverless function - scales automatically
3. Add rate limiting and authentication as needed
4. Monitor usage via your hosting platform's analytics

## Local Development

```bash
cd main
npm run dev

# API available at:
# http://localhost:3000/api/compare
```

Test with:
```bash
curl -X POST http://localhost:3000/api/compare \
  -H "Content-Type: application/json" \
  -d '{"start":"LA","end":"SF"}'
```
