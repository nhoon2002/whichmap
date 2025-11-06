# WhichMap Implementation Guide

Practical guide for building WhichMap using the v1 template components and patterns.

## Table of Contents
- [Current Status](#current-status)
- [Recommended Improvements](#recommended-improvements)
- [API Integration Plan](#api-integration-plan)
- [Component Enhancement Options](#component-enhancement-options)
- [Production Checklist](#production-checklist)

---

## Current Status

### ✅ Completed (main/ directory)

**Project Setup**
- Next.js 15 + React 19
- Tailwind CSS v4
- Framer Motion animations
- Minimal dependencies (no MDX, no unnecessary packages)

**Components Implemented**
- ✅ `Button` - Submit action
- ✅ `Container` - Layout wrapper
- ✅ `FadeIn` / `FadeInStagger` - Scroll animations
- ✅ `Border` - Accent decorations
- ✅ `TextInput` - Floating label form inputs
- ✅ `ProviderCard` - Result display with fastest highlighting

**Pages**
- ✅ `app/layout.jsx` - Root layout with WhichMap branding
- ✅ `app/page.jsx` - Main comparison page with:
  - Form (start/end inputs)
  - Loading state with spinner
  - Results grid (3 provider cards)
  - Error handling
  - Deep link generation

**Functionality**
- ✅ Form validation
- ✅ Mock data with realistic delay
- ✅ Fastest route detection
- ✅ Deep links (Google, Apple, Waze)
- ✅ Responsive design
- ✅ Accessibility features (ARIA, semantic HTML)

### 🔄 Using Mock Data

Current locations with `// TODO:` comments:
- `app/page.jsx:8` - Mock provider data
- `app/page.jsx:54` - Simulated API delay
- `app/page.jsx:35` - Waze deep link (needs coordinates)
- `app/page.jsx:83` - Geocoding placeholder
- `app/page.jsx:51` - Real API implementation needed

---

## Recommended Improvements

### Priority 1: Polish Current UI

#### 1.1 Enhance ProviderCard with StatList Pattern

**Current**: Custom ProviderCard component
**Recommendation**: Use StatList pattern from v1 for better metric display

```jsx
// Current approach:
<ProviderCard
  provider="Google Maps"
  eta={25}
  distance="15.2 mi"
  isFastest={true}
  deepLink={url}
/>

// Enhanced approach (copy StatList from v1):
import { StatList, StatListItem } from '@/components/StatList'

<StatList>
  <StatListItem
    label={
      <div className="flex items-center justify-between">
        <span>Google Maps</span>
        {isFastest && <span className="text-sm text-green-600">Fastest</span>}
      </div>
    }
    value="25 min"
  />
</StatList>
```

**File to copy**: `v1/src/components/StatList.jsx`

#### 1.2 Add Loading Skeleton

Instead of just a spinner, show card skeletons:

```jsx
// Create src/components/LoadingSkeleton.jsx
function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="animate-pulse">
          <div className="h-24 rounded-lg bg-neutral-200" />
        </div>
      ))}
    </div>
  )
}
```

#### 1.3 Improve Error Display

Current error is basic. Make it match the design system:

```jsx
{error && (
  <FadeIn>
    <div className="mt-4 rounded-2xl border border-red-300 bg-red-50 px-6 py-4">
      <h3 className="font-semibold text-red-800">Error</h3>
      <p className="mt-1 text-sm text-red-700">{error}</p>
    </div>
  </FadeIn>
)}
```

### Priority 2: Add Visual Polish

#### 2.1 Background Pattern

Add GridPattern for visual interest:

```bash
# Copy the component
cp v1/src/components/GridPattern.jsx main/src/components/
```

```jsx
// In app/page.jsx
import { GridPattern } from '@/components/GridPattern'

<div className="relative">
  <GridPattern className="absolute inset-0 -z-10" />
  {/* Existing content */}
</div>
```

#### 2.2 Improve Typography Hierarchy

```jsx
// Current title
<h1 className="font-display text-5xl font-medium tracking-tight text-white sm:text-7xl">

// Add more context
<div className="max-w-2xl">
  <h1 className="font-display text-5xl font-medium tracking-tight text-white [text-wrap:balance] sm:text-7xl">
    WhichMap
  </h1>
  <p className="mt-6 text-xl text-neutral-300">
    Compare travel times across Google Maps, Apple Maps, and Waze.
  </p>
  <p className="mt-4 text-base text-neutral-400">
    Get instant comparisons to find the fastest route.
  </p>
</div>
```

#### 2.3 Add Section Intro for Results

```bash
# Copy component
cp v1/src/components/SectionIntro.jsx main/src/components/
```

```jsx
import { SectionIntro } from '@/components/SectionIntro'

<SectionIntro
  title="Route Comparison"
  className="mt-24 sm:mt-32"
>
  <p>Showing estimated travel times from {startLocation} to {endLocation}</p>
</SectionIntro>
```

### Priority 3: Enhance Interactions

#### 3.1 Add Auto-focus

```jsx
<TextInput
  label="Starting Location"
  value={startLocation}
  onChange={(e) => setStartLocation(e.target.value)}
  autoFocus  // Add this
/>
```

#### 3.2 Add Keyboard Shortcuts

```jsx
useEffect(() => {
  function handleKeyDown(e) {
    // Clear with Escape
    if (e.key === 'Escape') {
      setStartLocation('')
      setEndLocation('')
      setResults([])
    }
    // Submit with Cmd+Enter
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit(e)
    }
  }
  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [startLocation, endLocation])
```

#### 3.3 Add Recent Searches (localStorage)

```jsx
// Save searches
useEffect(() => {
  if (results.length > 0) {
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]')
    recent.unshift({ start: startLocation, end: endLocation, timestamp: Date.now() })
    localStorage.setItem('recentSearches', JSON.stringify(recent.slice(0, 5)))
  }
}, [results])

// Display recent searches below form
```

---

## API Integration Plan

### Phase 1: Geocoding

**Goal**: Convert addresses to coordinates

**Option A: Google Geocoding API**
```javascript
async function geocodeAddress(address) {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`
  )
  const data = await response.json()
  if (data.status === 'OK') {
    return data.results[0].geometry.location
  }
  throw new Error('Geocoding failed')
}
```

**Option B: OpenStreetMap (Nominatim) - Free**
```javascript
async function geocodeAddress(address) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
  )
  const data = await response.json()
  if (data.length > 0) {
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
  }
  throw new Error('Geocoding failed')
}
```

**Implementation**:
```javascript
async function fetchAllProviders(start, end) {
  // Geocode addresses
  const [startCoords, endCoords] = await Promise.all([
    geocodeAddress(start),
    geocodeAddress(end)
  ])

  // Fetch from all providers in parallel
  const [google, apple, waze] = await Promise.all([
    fetchGoogleRoute(startCoords, endCoords),
    fetchAppleRoute(startCoords, endCoords),  // Mock or web scrape
    fetchWazeRoute(startCoords, endCoords)
  ])

  return [google, apple, waze]
}
```

### Phase 2: Provider APIs

#### Google Maps Directions API

**Setup**:
1. Get API key from Google Cloud Console
2. Enable "Directions API"
3. Set up billing (pay-as-you-go)

**Implementation**:
```javascript
async function fetchGoogleRoute(origin, destination) {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/directions/json?` +
    `origin=${origin.lat},${origin.lng}&` +
    `destination=${destination.lat},${destination.lng}&` +
    `key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
  )
  const data = await response.json()

  if (data.status === 'OK') {
    const route = data.routes[0].legs[0]
    return {
      id: 'google',
      provider: 'Google Maps',
      eta: Math.round(route.duration.value / 60), // seconds to minutes
      distance: route.distance.text,
      unit: 'min'
    }
  }
  throw new Error('Google API failed')
}
```

**Pricing**: $5 per 1000 requests (first $200/month free)

#### Apple Maps

**Challenge**: No public API

**Options**:
1. **Mock with average data** (current approach)
2. **Web scraping** (against ToS, not recommended)
3. **Use web deep link only** (no ETA display)
4. **Omit from comparison** (just Google + Waze)

**Recommendation**: Keep mocked for now, or remove from comparison

#### Waze

**Option A: Waze Routing API** (if available)
```javascript
async function fetchWazeRoute(origin, destination) {
  const response = await fetch(
    `https://www.waze.com/row-RoutingManager/routingRequest?` +
    `from=x:${origin.lng}%20y:${origin.lat}&` +
    `to=x:${destination.lng}%20y:${destination.lat}&` +
    `returnJSON=true`
  )
  const data = await response.json()
  // Parse response (structure varies)
}
```

**Option B: Mock or omit**

**Recommendation**: Start with Google only, add Waze if API access confirmed

### Phase 3: Error Handling & Rate Limiting

```javascript
async function fetchWithRetry(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === retries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
}

async function fetchGoogleRoute(origin, destination) {
  return fetchWithRetry(async () => {
    const response = await fetch(url)
    if (!response.ok) {
      if (response.status === 429) throw new Error('Rate limit exceeded')
      if (response.status >= 500) throw new Error('Server error')
      throw new Error(`HTTP ${response.status}`)
    }
    return response.json()
  })
}
```

### Phase 4: Caching Strategy

```javascript
const cache = new Map()

function getCacheKey(start, end) {
  // Round coordinates to reduce cache misses
  const roundCoord = (coord) => Math.round(coord * 100) / 100
  return `${roundCoord(start.lat)},${roundCoord(start.lng)}-${roundCoord(end.lat)},${roundCoord(end.lng)}`
}

async function fetchWithCache(start, end) {
  const key = getCacheKey(start, end)
  const cached = cache.get(key)

  if (cached && Date.now() - cached.timestamp < 120000) { // 2 min TTL
    return cached.data
  }

  const data = await fetchAllProviders(start, end)
  cache.set(key, { data, timestamp: Date.now() })
  return data
}
```

---

## Component Enhancement Options

### Option 1: Copy StatList (Recommended)

**Why**: Better visual hierarchy for metrics

```bash
cp v1/src/components/StatList.jsx main/src/components/
```

Update `app/page.jsx` to use StatList instead of ProviderCard:

```jsx
<FadeInStagger>
  <dl className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
    {results.map((result) => (
      <Border
        key={result.id}
        as={FadeIn}
        position="left"
        className={clsx(
          'flex flex-col-reverse pl-8',
          fastest?.id === result.id && 'before:!bg-green-500 after:!bg-green-500/10'
        )}
      >
        <dt className="mt-2 flex items-baseline justify-between text-base text-neutral-600">
          <span>{result.provider}</span>
          {fastest?.id === result.id && (
            <span className="text-sm font-semibold text-green-600">Fastest</span>
          )}
        </dt>
        <dd className="font-display text-3xl font-semibold text-neutral-950 sm:text-4xl">
          {result.eta} {result.unit}
        </dd>
        <div className="mt-1 text-sm text-neutral-500">
          {result.distance}
        </div>
        <a
          href={generateDeepLink(result.id, startLocation, endLocation)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center text-sm font-semibold text-neutral-950 hover:text-neutral-700"
        >
          Open in {result.provider} →
        </a>
      </Border>
    ))}
  </dl>
</FadeInStagger>
```

### Option 2: Add GridPattern Background

**Why**: Visual interest without distraction

```bash
cp v1/src/components/GridPattern.jsx main/src/components/
```

Wrap main content:
```jsx
<main className="relative flex-auto">
  <GridPattern className="absolute inset-0 -z-10 opacity-20" />
  <Container>
    {/* Existing content */}
  </Container>
</main>
```

### Option 3: Add Comparison Table View

Toggle between card view and table view:

```jsx
const [viewMode, setViewMode] = useState('cards') // or 'table'

// Table view
<table className="w-full">
  <thead>
    <tr>
      <th>Provider</th>
      <th>ETA</th>
      <th>Distance</th>
      <th>Action</th>
    </tr>
  </thead>
  <tbody>
    {results.map(result => (
      <tr key={result.id} className={fastest?.id === result.id ? 'bg-green-50' : ''}>
        <td>{result.provider}</td>
        <td>{result.eta} min</td>
        <td>{result.distance}</td>
        <td><a href={...}>Open</a></td>
      </tr>
    ))}
  </tbody>
</table>
```

---

## Production Checklist

### Environment Setup
- [ ] Create `.env.local` file
- [ ] Add API keys:
  ```
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
  ```
- [ ] Add `.env.local` to `.gitignore`

### Security
- [ ] API keys in environment variables only
- [ ] Consider API route proxy (`/app/api/route.ts`) to hide keys
- [ ] Implement rate limiting (per IP or session)
- [ ] Add CORS headers if needed
- [ ] Validate and sanitize all inputs

### Performance
- [ ] Implement caching (memory or Redis)
- [ ] Add request deduplication
- [ ] Optimize images (add WhichMap logo)
- [ ] Enable Next.js image optimization
- [ ] Consider ISR for static parts

### SEO & Metadata
- [ ] Update `metadata` in `app/layout.jsx`
- [ ] Add Open Graph tags
- [ ] Add favicon
- [ ] Create `robots.txt`
- [ ] Add `sitemap.xml`

### Accessibility
- [ ] Test with screen reader
- [ ] Verify keyboard navigation
- [ ] Check color contrast (WCAG AA)
- [ ] Add skip links if needed
- [ ] Test with reduced motion preference

### Testing
- [ ] Test with various addresses
- [ ] Test error scenarios (invalid addresses, API failures)
- [ ] Test on mobile devices
- [ ] Test with slow network
- [ ] Test rate limit handling

### Analytics (Optional)
- [ ] Add Google Analytics or Plausible
- [ ] Track comparison events
- [ ] Track fastest provider wins
- [ ] Track errors

### Deployment
- [ ] Deploy to Vercel (recommended for Next.js)
- [ ] Configure environment variables
- [ ] Set up custom domain
- [ ] Enable HTTPS
- [ ] Monitor error logs

---

## Next Steps

### Immediate (Next 1-2 hours)
1. Install dependencies: `cd main && npm install`
2. Run dev server: `npm run dev`
3. Test the mock data flow
4. Make any UI tweaks

### Short-term (Next few days)
1. Implement Google Geocoding API
2. Implement Google Directions API
3. Add proper error handling
4. Improve loading states

### Medium-term (Next week)
1. Add caching layer
2. Implement Waze API (if possible)
3. Add recent searches feature
4. Polish UI with StatList pattern
5. Add GridPattern background

### Long-term (Production)
1. Set up API rate limiting
2. Add analytics
3. Deploy to production
4. Monitor and optimize
5. Gather user feedback

---

## File Structure Reference

```
main/
├── src/
│   ├── app/
│   │   ├── layout.jsx          # ✅ Root layout
│   │   ├── page.jsx            # ✅ Main page (needs API integration)
│   │   └── api/                # 📋 TODO: API routes for server-side calls
│   ├── components/
│   │   ├── Border.jsx          # ✅ Copied from v1
│   │   ├── Button.jsx          # ✅ Copied from v1
│   │   ├── Container.jsx       # ✅ Copied from v1
│   │   ├── FadeIn.jsx          # ✅ Copied from v1
│   │   ├── TextInput.jsx       # ✅ Created custom
│   │   ├── ProviderCard.jsx    # ✅ Created custom
│   │   ├── GridPattern.jsx     # 📋 TODO: Copy from v1
│   │   ├── StatList.jsx        # 📋 TODO: Copy from v1
│   │   └── LoadingSkeleton.jsx # 📋 TODO: Create
│   ├── lib/
│   │   ├── geocoding.js        # 📋 TODO: Geocoding utilities
│   │   ├── providers.js        # 📋 TODO: Provider API calls
│   │   └── cache.js            # 📋 TODO: Caching layer
│   └── styles/
│       ├── tailwind.css        # ✅ Copied from v1
│       └── base.css            # ✅ Copied from v1
├── .env.local                  # 📋 TODO: Create (not committed)
└── package.json                # ✅ Configured
```

Ready to start development!
