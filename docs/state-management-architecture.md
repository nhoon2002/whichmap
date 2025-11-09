# State Management Architecture

Complete guide to state management in WhichMap - when to use Firebase vs React Query vs local state.

## Overview

WhichMap uses a **hybrid approach** combining multiple state management solutions, each for its specific strength:

| Tool | Purpose | Use Cases |
|------|---------|-----------|
| **Local State** (useState) | Component-scoped state | Form inputs, UI toggles, temporary data |
| **React Context** | Global shared state | User preferences across multiple components |
| **Firebase/Firestore** | Real-time user data | Auth, preferences, saved routes (persistent data) |
| **React Query** | External API caching | Google Maps, Waze, Yelp, Google Places (transient data) |

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                   React Components                  │
│         (Settings, page.jsx, Header)                │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────┐  ┌─────────────────────────────┐ │
│  │   useState   │  │  UserPreferencesContext     │ │
│  │  (UI State)  │  │  (Global Shared State)      │ │
│  └──────────────┘  └──────────┬──────────────────┘ │
│                               │                     │
│                    ┌──────────┴──────────┐         │
│                    ▼                     ▼         │
│        ┌───────────────────┐  ┌──────────────────┐ │
│        │ useUserPreferences│  │useRouteComparison│ │
│        │  (Context Hook)   │  │  (Custom Hook)   │ │
│        └─────────┬─────────┘  └─────────┬────────┘ │
│                  │                       │          │
└──────────────────┼───────────────────────┼──────────┘
                   │                       │
                   ▼                       ▼
         ┌──────────────────┐   ┌──────────────────┐
         │  Firebase/       │   │  React Query     │
         │  Firestore       │   │  (Cached APIs)   │
         │  (Real-time DB)  │   └─────────┬────────┘
         └──────────────────┘             │
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

### 2. React Context (UserPreferencesContext)

**Use for:** Global state that needs to be shared across multiple components

**Why Context:**
- ✅ Single source of truth (prevents multiple state instances)
- ✅ No prop drilling through component tree
- ✅ Components automatically re-render on state changes
- ✅ Works with sibling components (Settings + page.jsx)

**Examples:**
```javascript
// User preferences shared across Settings and page.jsx
{
  navServices: { google: true, apple: false, waze: true },
  _updated: Date.now()
}
```

**Current implementation:**
- `src/contexts/UserPreferencesContext.jsx` - Context provider + hook
- `src/app/layout.jsx` - Wraps app with provider

**How to use:**
```javascript
// In components
import { useUserPreferences } from '@/contexts/UserPreferencesContext'

function MyComponent() {
  const { preferences, toggleNavService, loading } = useUserPreferences()

  if (loading) return <div>Loading...</div>

  return (
    <button onClick={() => toggleNavService('google')}>
      Toggle Google Maps
    </button>
  )
}
```

**Why we use Context instead of a hook:**
- Before: Each component calling `useUserPreferences()` created separate state
- After: Single shared state via Context, all components read from same source

### 3. Firebase/Firestore

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
- `src/contexts/UserPreferencesContext.jsx` - React Context layer (state + Firebase integration)

**How to use:**
```javascript
// In components (via Context)
import { useUserPreferences } from '@/contexts/UserPreferencesContext'

function MyComponent() {
  const { preferences, toggleNavService, loading } = useUserPreferences()

  if (loading) return <div>Loading...</div>

  return <div>{JSON.stringify(preferences)}</div>
}

// In API routes or server-side (direct model access)
import { User } from '@/models/User'

const user = await User.find(userId)
await user.updatePreferences(newPrefs)
```

### 4. React Query

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
├── contexts/
│   └── UserPreferencesContext.jsx  # React Context (shared state)
├── hooks/
│   └── useRouteComparison.js       # React Query (API caching)
├── models/
│   └── User.js                     # Firebase data layer
├── providers/
│   └── QueryProvider.jsx           # React Query setup
└── app/
    ├── layout.jsx                  # Wraps app with providers
    └── page.jsx                    # Uses useState + Context
```

## Best Practices

### ✅ DO

1. **Use Context for shared global state**
   ```javascript
   // User preferences across components
   const { preferences } = useUserPreferences()
   ```

2. **Use Firebase for persistent user data**
   ```javascript
   // Direct model access in API routes
   const user = await User.find(userId)
   ```

3. **Use React Query for API calls**
   ```javascript
   // External APIs (Google, Yelp, etc.)
   const { data } = useRouteComparison(start, end, preferences)
   ```

4. **Use useState for UI state**
   ```javascript
   // Temporary, component-scoped
   const [isOpen, setIsOpen] = useState(false)
   ```

5. **Separate concerns (Model → Context → Component)**
   ```javascript
   User.js → UserPreferencesContext.jsx → Component
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
- 🌍 **Global shared state** → React Context (UserPreferencesContext)
- 💾 **User data** → Firebase/Firestore
- 🌐 **API data** → React Query

**Current state:**
- ✅ Context for user preferences (shared across components)
- ✅ Firebase for user data persistence
- ✅ React Query for route comparison API
- ✅ All components read from single source of truth

**Key benefits:**
1. Single shared state prevents multiple instances bug
2. Firebase handles persistence and authentication
3. React Query handles API caching and invalidation
4. Clean separation of concerns
