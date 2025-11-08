'use client'

import { useQuery } from '@tanstack/react-query'

/**
 * Fetch route comparison from API
 * This will eventually call Google Maps, Waze, etc.
 * For now, it calls our mock API endpoint
 */
async function fetchRouteComparison(start, end) {
  const response = await fetch('/api/compare', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // TODO: Add API key header for monetization
      // 'x-api-key': process.env.NEXT_PUBLIC_API_KEY
    },
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
 * @param {object} options - React Query options
 * @returns {object} { data, isLoading, error, refetch }
 */
export function useRouteComparison(start, end, options = {}) {
  return useQuery({
    // Query key - unique identifier for this query
    // React Query will cache based on this
    queryKey: ['routes', start, end],

    // Query function - how to fetch the data
    queryFn: () => fetchRouteComparison(start, end),

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
 *   const { data: routes, isLoading, error, refetch } = useRouteComparison(
 *     '1932 Selby Ave, Los Angeles, CA',
 *     '111 N Broadway, Los Angeles, CA'
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
