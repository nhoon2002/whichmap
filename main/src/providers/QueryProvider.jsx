'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

/**
 * React Query provider for API data caching and state management
 * Used for external APIs (Google Maps, Waze, Yelp, etc.)
 * NOT used for Firebase - Firebase has its own real-time system
 */
export function QueryProvider({ children }) {
  // Create QueryClient inside component to avoid sharing between requests
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Don't refetch on window focus in development
            refetchOnWindowFocus: false,
            // Retry failed requests once
            retry: 1,
            // Cache for 5 minutes by default
            staleTime: 5 * 60 * 1000,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
