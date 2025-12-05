'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useQueryClient } from '@tanstack/react-query'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { AutocompleteInput } from '@/components/AutocompleteInput'
import { Button } from '@/components/Button'
import { ProviderCard } from '@/components/ProviderCard'
import { initGlobalHelpers } from '@/lib/helpers'
import { filterRoutes, findFastestRoute, generateDeepLink } from '@/lib/routeHelpers'
import { ShareButton } from '@/components/ShareButton'
import { addToSearchHistory } from '@/services/searchHistory/searchHistoryService'
import { createTrackingEvent, storeTrackingCode, trackProviderClick, getCurrentTrackingCode } from '@/services/tracking/trackingService'
import { onAuthChange } from '@/services/auth/authService'
import { useUserPreferences } from '@/contexts/UserPreferencesContext'
import { useRouteComparison } from '@/hooks/useRouteComparison'
import type { Location, Coordinates, Place } from '@/types'
import type { User as FirebaseUser } from 'firebase/auth'

export default function Home() {
  const [startLocation, setStartLocation] = useState('')
  const [endLocation, setEndLocation] = useState('')
  const [user, setUser] = useState<FirebaseUser | null>(null)

  // Store geocoded coordinates
  const [startCoordinates, setStartCoordinates] = useState<Coordinates | null>(null)
  const [endCoordinates, setEndCoordinates] = useState<Coordinates | null>(null)

  // Store full formatted addresses (for tracking)
  const [startFullAddress, setStartFullAddress] = useState<string>('')
  const [endFullAddress, setEndFullAddress] = useState<string>('')

  // Store SUBMITTED values (only updated when button is clicked)
  const [submittedStart, setSubmittedStart] = useState<Location | null>(null)
  const [submittedEnd, setSubmittedEnd] = useState<Location | null>(null)

  const resultsRef = useRef<HTMLDivElement>(null)
  const { preferences } = useUserPreferences()
  const queryClient = useQueryClient()

  // Use the route comparison hook with SUBMITTED values
  // This prevents the query from running on every keystroke
  const {
    data: results,
    isLoading,
    error: queryError,
  } = useRouteComparison(submittedStart, submittedEnd, preferences, {
    enabled: Boolean(submittedStart && submittedEnd),
  })

  // Initialize global helpers on mount
  useEffect(() => {
    initGlobalHelpers()
  }, [])

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser: FirebaseUser | null) => {
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [])

  // Smooth scroll to results when they appear (mobile only)
  useEffect(() => {
    if (results && results.length > 0 && resultsRef.current) {
      // Only scroll on mobile (below lg breakpoint)
      const isMobile = window.innerWidth < 1024
      if (isMobile) {
        // Wait for fade animation to complete (500ms) before scrolling
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          })
        }, 600)
      }
    }
  }, [results])

  // Check if start and end locations are the same
  const areSameLocation = (): boolean => {
    const start = startLocation.trim()
    const end = endLocation.trim()
    
    if (!start || !end) return false
    
    // Compare by coordinates if both are available
    if (startCoordinates && endCoordinates) {
      const latDiff = Math.abs(startCoordinates.lat - endCoordinates.lat)
      const lngDiff = Math.abs(startCoordinates.lng - endCoordinates.lng)
      // Consider same if within ~10 meters (0.0001 degrees ≈ 11 meters)
      return latDiff < 0.0001 && lngDiff < 0.0001
    }
    
    // Compare by address text (case-insensitive, normalized)
    const normalizeAddress = (addr: string) => 
      addr.toLowerCase().replace(/\s+/g, ' ').trim()
    
    return normalizeAddress(start) === normalizeAddress(end)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const start = startLocation.trim()
    const end = endLocation.trim()

    if (!start || !end) {
      return
    }

    // Update submitted values - this will trigger the React Query to fetch
    const startData: Location = startCoordinates || start
    const endData: Location = endCoordinates || end

    setSubmittedStart(startData)
    setSubmittedEnd(endData)

    // Save to search history (Firestore for logged-in users, localStorage for anonymous)
    await addToSearchHistory(start, user?.uid || null, startCoordinates || undefined, 'origin')
    await addToSearchHistory(end, user?.uid || null, endCoordinates || undefined, 'destination')
  }

  // Create tracking event when results load
  useEffect(() => {
    if (results && results.length > 0 && submittedStart && submittedEnd) {
      const createTracking = async () => {
        try {
          // Use full formatted addresses if available, otherwise fall back to current input
          const origin = startFullAddress || startLocation
          const dest = endFullAddress || endLocation
          
          const trackingCode = await createTrackingEvent(
            user?.uid || null,
            origin,
            dest,
            startCoordinates || undefined,
            endCoordinates || undefined,
            results
          )
          
          // Store for later when user clicks a provider
          storeTrackingCode(trackingCode)
        } catch (error) {
          console.error('Error creating tracking event:', error)
        }
      }
      
      createTracking()
    }
  }, [results, submittedStart, submittedEnd, user, startFullAddress, endFullAddress, startLocation, endLocation, startCoordinates, endCoordinates])

  // Filter and deduplicate results based on user preferences
  const filteredResults = filterRoutes(results, preferences)
  const fastest = findFastestRoute(filteredResults)

  return (
    <main className="flex-auto flex flex-col pt-[calc(4rem+env(safe-area-inset-top,0px))] sm:pt-[calc(5.5rem+env(safe-area-inset-top,0px))]">
      <Container className="mt-8 sm:mt-10 lg:mt-12 flex-1">
        {/* Mobile: Stack vertically, Desktop: Split 50/50 */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 xl:gap-20 lg:min-h-[calc(100vh-8rem)]">
          {/* Left side: Form and Header */}
          <div className="lg:sticky lg:top-12 lg:self-start lg:max-w-xl">
            <FadeIn animate>
              <div>
                <h1 className="font-display text-3xl font-medium tracking-tight text-neutral-950 sm:text-4xl lg:text-4xl">
                  Compare routes. Choose smarter.
                </h1>
                <p className="mt-4 text-base text-neutral-600 sm:text-lg">
                  Compare travel times across popular navigation platforms.
                </p>
              </div>
            </FadeIn>

            <FadeIn animate className="mt-10 sm:mt-12">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative -space-y-px rounded-2xl bg-white shadow-sm">
                  <AutocompleteInput
                    label="Starting Location"
                    value={startLocation}
                    onChange={(value) => {
                      setStartLocation(value)
                      // Clear full address when user manually types
                      if (!value) setStartFullAddress('')
                    }}
                    onSelect={(place: Place) => {
                      setStartLocation(place.address)
                      setStartCoordinates(place.coordinates)
                      setStartFullAddress(place.address) // Store full formatted address
                    }}
                    autoComplete="off"
                    className="rounded-t-2xl"
                    userId={user?.uid || null}
                  />
                  <AutocompleteInput
                    label="Destination"
                    value={endLocation}
                    onChange={(value) => {
                      setEndLocation(value)
                      // Clear full address when user manually types
                      if (!value) setEndFullAddress('')
                    }}
                    onSelect={(place: Place) => {
                      setEndLocation(place.address)
                      setEndCoordinates(place.coordinates)
                      setEndFullAddress(place.address) // Store full formatted address
                    }}
                    autoComplete="off"
                    className="rounded-b-2xl"
                    userId={user?.uid || null}
                  />
                </div>

                {queryError && (
                  <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                    {queryError.message || 'Failed to fetch route data. Please try again.'}
                  </div>
                )}

                {areSameLocation() && startLocation.trim() && endLocation.trim() && (
                  <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800" role="alert">
                    Start and destination are the same location. Please enter different addresses.
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !startLocation.trim() || !endLocation.trim() || areSameLocation()}
                >
                  {isLoading ? 'Comparing routes' : 'Compare Routes'}
                </Button>
              </form>
            </FadeIn>
          </div>

          {/* Right side: Results */}
          <div ref={resultsRef} className="mt-20 lg:mt-0">
            {isLoading && (
              <FadeIn animate>
                <div className="flex h-full min-h-[400px] items-center justify-center">
                  <div className="text-center">
                    <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-neutral-950 border-r-transparent"></div>
                    <p className="mt-6 text-base text-neutral-600">Comparing routes...</p>
                  </div>
                </div>
              </FadeIn>
            )}

            {!isLoading && filteredResults.length > 0 && (
              <div className="space-y-6">
                <FadeIn animate>
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-2xl font-semibold text-neutral-950 sm:text-3xl">
                      Results
                    </h2>
                    <ShareButton
                      origin={startLocation}
                      destination={endLocation}
                      fastestProvider={fastest?.provider}
                      fastestTime={fastest ? `${fastest.eta} ${fastest.unit}` : undefined}
                    />
                  </div>
                </FadeIn>

                <FadeInStagger className="space-y-3">
                  {filteredResults.map((result) => (
                    <ProviderCard
                      key={result.id}
                      provider={result.provider}
                      eta={result.eta}
                      distance={result.distance}
                      unit={result.unit}
                      isFastest={fastest ? result.id === fastest.id : false}
                      link={result.link || generateDeepLink(result.id, submittedStart!, submittedEnd!)}
                    />
                  ))}
                </FadeInStagger>
              </div>
            )}

            {/* Show message when all services are disabled */}
            {!isLoading && results && results.length > 0 && filteredResults.length === 0 && (
              <FadeIn animate>
                <div className="rounded-xl bg-neutral-50 px-6 py-8 text-center">
                  <p className="text-base text-neutral-600">
                    All navigation services are disabled. Enable at least one service in Settings to see results.
                  </p>
                </div>
              </FadeIn>
            )}

            {/* Empty state for desktop */}
            {!isLoading && !results && (
              <FadeIn animate>
                <div className="hidden lg:flex h-full min-h-[400px] items-center justify-center">
                  <div className="text-center max-w-md px-8">
                    {/* Minimal map marker icon */}
                    <div className="mb-6 flex justify-center">
                      <svg
                        className="h-32 w-32 text-neutral-200"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={0.75}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={0.75}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-neutral-950 mb-2">
                      Ready to compare routes
                    </h3>
                    <p className="text-sm text-neutral-500 leading-relaxed">
                      Enter your starting location and destination to see real-time travel times from all providers
                    </p>
                  </div>
                </div>
              </FadeIn>
            )}
          </div>
        </div>
      </Container>
    </main>
  )
}

