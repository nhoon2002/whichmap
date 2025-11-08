# State Management Architecture

Complete guide to state management in WhichMap - when to use Firebase vs React Query vs local state.

## Overview

WhichMap uses a **hybrid approach** combining multiple state management solutions, each for its specific strength:

| Tool | Purpose | Use Cases |
|------|---------|-----------|
| **Local State** (useState) | Component-scoped state | Form inputs, UI toggles, temporary data |
| **Custom Hooks** | Reusable stateful logic | Encapsulating Firebase, combining multiple states |
| **Firebase/Firestore** | Real-time user data | Auth, preferences, saved routes (persistent data) |
| **React Query** | External API caching | Google Maps, Waze, Yelp, Google Places (transient data) |

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                   React Components                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │   useState   │  │ Custom Hooks │  │ Context  │ │
│  │  (UI State)  │  │ (Reusable)   │  │ (Rare)   │ │
│  └──────────────┘  └──────┬───────┘  └──────────┘ │
│                           │                         │
│              ┌────────────┴────────────┐           │
│              ▼                         ▼           │
│  ┌────────────────────┐    ┌────────────────────┐ │
│  │  useUserPreferences│    │ useRouteComparison │ │
│  │   (Custom Hook)    │    │   (Custom Hook)    │ │
│  └─────────┬──────────┘    └─────────┬──────────┘ │
│            │                          │            │
└────────────┼──────────────────────────┼────────────┘
             │                          │
             ▼                          ▼
   ┌──────────────────┐      ┌──────────────────┐
   │  Firebase/       │      │  React Query     │
   │  Firestore       │      │  (Cached APIs)   │
   │  (Real-time DB)  │      └─────────┬────────┘
   └──────────────────┘                │
                                       ▼
                           ┌────────────────────────┐
                           │  External APIs         │
                           │  - Google Maps         │
                           │  - Waze                │
                           │  - Yelp                │
                           │  - Google Places       │
                           └────────────────────────┘
```

## When to Use What

### 1. Local State (useState)

**Use for:** Temporary UI state that doesn't need to persist

**Examples:**
```javascript
// Form inputs
const [startLocation, setStartLocation] = useState('')

// Loading states
const [isLoading, setIsLoading] = useState(false)

// UI toggles
const [isMenuOpen, setIsMenuOpen] = useState(false)
```

**Current usage:**
- `src/app/page.jsx` - form inputs, loading, results
- `src/components/Settings.jsx` - dropdown open/close

### 2. Firebase/Firestore

**Use for:** User data that needs to persist across sessions

**Why Firebase:**
- ✅ Real-time updates (changes sync automatically)
- ✅ Offline persistence
- ✅ Authentication integration
- ✅ Security rules

**Examples:**
```javascript
// User preferences
{
  preferences: {
    navServices: { google: true, apple: false, waze: true }
  }
}

// Saved routes (future)
{
  savedRoutes: [
    { start: 'LA', end: 'SF', savedAt: timestamp }
  ]
}
```

**Current implementation:**
- `src/models/User.js` - Data layer (CRUD operations)
- `src/hooks/useUserPreferences.js` - React layer (state + Firebase)

**How to use:**
```javascript
// In components
import { useUserPreferences } from '@/hooks/useUserPreferences'

function MyComponent() {
  const { preferences, toggleNavService, loading } = useUserPreferences()

  if (loading) return <div>Loading...</div>

  return <div>{JSON.stringify(preferences)}</div>
}

// In API routes or server-side
import { User } from '@/models/User'

const user = await User.find(userId)
await user.updatePreferences(newPrefs)
```

### 3. React Query

**Use for:** External API data that needs caching

**Why React Query:**
- ✅ Automatic caching (avoid redundant API calls)
- ✅ Background refetching
- ✅ Loading/error states
- ✅ Request deduplication
- ✅ Stale data management

**Examples:**
```javascript
// Route comparison (calls Google Maps, Waze APIs)
const { data: routes, isLoading } = useRouteComparison(start, end)

// Business search (future - Phase 4)
const { data: businesses } = useBusinessSearch(location, category)
```

**Current implementation:**
- `src/providers/QueryProvider.jsx` - Setup
- `src/hooks/useRouteComparison.js` - Hook for route data

**How to use:**
```javascript
import { useRouteComparison } from '@/hooks/useRouteComparison'

function RouteResults() {
  const {
    data: routes,
    isLoading,
    error,
    refetch
  } = useRouteComparison(start, end)

  if (isLoading) return <div>Loading routes...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      {routes.map(route => <RouteCard key={route.id} {...route} />)}
      <button onClick={() => refetch()}>Refresh</button>
    </div>
  )
}
```

**Benefits over manual fetch:**
```javascript
// ❌ Manual fetch - No caching, manual loading state
const [data, setData] = useState(null)
const [loading, setLoading] = useState(false)
useEffect(() => {
  setLoading(true)
  fetch('/api/compare').then(r => setData(r))
  setLoading(false)
}, [start, end])

// ✅ React Query - Automatic caching, loading state, refetch, etc.
const { data, isLoading } = useRouteComparison(start, end)
```

## Decision Tree

```
Need to store data?
├─ NO → useState (component state)
└─ YES → Needs to persist across sessions?
    ├─ YES → User-specific data?
    │   ├─ YES → Firebase/Firestore
    │   │        (preferences, saved routes, history)
    │   └─ NO  → LocalStorage or cookies
    └─ NO → External API data?
        ├─ YES → React Query
        │        (Google Maps, Waze, Yelp)
        └─ NO → useState
```

## Comparison

| Feature | Firebase | React Query | useState |
|---------|----------|-------------|----------|
| **Persistence** | ✅ Database | ❌ Cache only | ❌ No |
| **Real-time** | ✅ Yes | ❌ Polling only | ❌ No |
| **Caching** | ✅ Built-in | ✅ Smart cache | ❌ No |
| **Auth required** | ✅ Yes | ❌ No | ❌ No |
| **Offline support** | ✅ Yes | ⚠️ Partial | ❌ No |
| **Use case** | User data | API data | UI state |

## File Structure

```
src/
├── hooks/
│   ├── useUserPreferences.js    # Firebase + React (user prefs)
│   └── useRouteComparison.js    # React Query (API caching)
├── models/
│   └── User.js                  # Firebase data layer
├── providers/
│   └── QueryProvider.jsx        # React Query setup
└── app/
    ├── layout.jsx               # Wraps app with QueryProvider
    └── page.jsx                 # Uses useState + hooks
```

## Best Practices

### ✅ DO

1. **Use Firebase for user data**
   ```javascript
   // User preferences, saved data
   const { preferences } = useUserPreferences()
   ```

2. **Use React Query for API calls**
   ```javascript
   // External APIs (Google, Yelp, etc.)
   const { data } = useRouteComparison(start, end)
   ```

3. **Use useState for UI state**
   ```javascript
   // Temporary, component-scoped
   const [isOpen, setIsOpen] = useState(false)
   ```

4. **Separate concerns (Model → Hook → Component)**
   ```javascript
   User.js → useUserPreferences.js → Component
   ```

### ❌ DON'T

1. **Don't use React Query for Firebase**
   - Firebase has its own real-time system
   - React Query would be redundant

2. **Don't put API logic in components**
   - Create custom hooks instead
   - Keeps components clean

3. **Don't use Firebase for API caching**
   - Firebase is a database, not a cache
   - Use React Query for transient API data

## Migration Guide (Current → React Query)

When we add real APIs, update `page.jsx`:

**Before (manual fetch):**
```javascript
const handleSubmit = async () => {
  setIsLoading(true)
  const results = await fetchAllProviders(start, end)
  setResults(results)
  setIsLoading(false)
}
```

**After (React Query):**
```javascript
const { data: results, isLoading } = useRouteComparison(start, end, {
  enabled: false, // Don't auto-fetch
})

const handleSubmit = () => {
  refetch() // Trigger fetch on demand
}
```

## Future Additions

### Phase 4: Business Search

```javascript
// src/hooks/useBusinessSearch.js
export function useBusinessSearch(location, category) {
  return useQuery({
    queryKey: ['businesses', location, category],
    queryFn: async () => {
      // Fetch from Yelp + Google Places in parallel
      const [yelp, google] = await Promise.all([
        fetchYelp(location, category),
        fetchGooglePlaces(location, category)
      ])

      // Match businesses
      return matchBusinesses(yelp, google)
    },
    staleTime: 10 * 60 * 1000, // 10 min cache
  })
}
```

## Summary

**Architecture:**
- 📱 **Component state** → useState
- 🔄 **Reusable logic** → Custom hooks
- 💾 **User data** → Firebase/Firestore
- 🌐 **API data** → React Query

**Current state:**
- ✅ Firebase for user preferences
- ✅ React Query installed and ready
- 🔜 Will migrate to React Query when adding real APIs

**Next steps:**
1. Keep Firebase for user data (preferences, saved routes)
2. Use React Query when we add Google Maps/Waze APIs
3. Use React Query for Phase 4 business search
