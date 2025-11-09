'use client'

import { useQuery } from '@tanstack/react-query'

/**
 * Fetch route comparison from API
 * Always fetches ALL providers - preferences are applied client-side only
 */
async function fetchRouteComparison(start, end) {
  const response = await fetch('/api/compare', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // TODO: Add API key header for monetization
      // 'x-api-key': process.env.NEXT_PUBLIC_API_KEY
    },
    // Don't send preferences - always fetch all providers
    // Preferences are applied client-side via filterRoutes()
    body: JSON.stringify({ start, end }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch route data')
  }

  const data = await response.json()
  return data.results
}

/**
 * Custom hook to fetch and cache route comparisons
 * Uses React Query for caching, refetching, and state management
 *
 * @param {string} start - Starting location
 * @param {string} end - Destination location
 * @param {object} preferences - DEPRECATED - preferences now only filter client-side
 * @param {object} options - React Query options
 * @returns {object} { data, isLoading, error, refetch }
 */
export function useRouteComparison(start, end, preferences = null, options = {}) {
  return useQuery({
    // Query key - unique identifier for this query
    // React Query will cache based on this
    // NOTE: Preferences are NOT included in query key
    // This prevents refetching when preferences change
    // Preferences only filter results client-side
    queryKey: ['routes', start, end],

    // Query function - how to fetch the data
    // IMPORTANT: Get values from queryKey to avoid stale closure
    // Always fetch ALL providers - preferences filter client-side only
    queryFn: ({ queryKey }) => {
      const [, queryStart, queryEnd] = queryKey
      // Don't send preferences - always fetch all providers
      return fetchRouteComparison(queryStart, queryEnd)
    },

    // Only fetch if we have both start and end
    enabled: Boolean(start && end),

    // Cache data for 5 minutes
    // Routes don't change that often, so we can cache aggressively
    staleTime: 5 * 60 * 1000,

    // Keep cache for 10 minutes even if not being used
    gcTime: 10 * 60 * 1000,

    // Allow manual refetch
    ...options,
  })
}

/**
 * Example usage in a component:
 *
 * function MyComponent() {
 *   const { preferences } = useUserPreferences()
 *   const { data: routes, isLoading, error, refetch } = useRouteComparison(
 *     '1932 Selby Ave, Los Angeles, CA',
 *     '111 N Broadway, Los Angeles, CA',
 *     preferences
 *   )
 *
 *   if (isLoading) return <div>Loading...</div>
 *   if (error) return <div>Error: {error.message}</div>
 *
 *   return (
 *     <div>
 *       {routes.map(route => (
 *         <div key={route.id}>{route.provider}: {route.eta} min</div>
 *       ))}
 *       <button onClick={() => refetch()}>Refresh</button>
 *     </div>
 *   )
 * }
 */
