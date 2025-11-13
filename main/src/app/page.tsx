'use client'

import { useState, useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { AutocompleteInput } from '@/components/AutocompleteInput'
import { Button } from '@/components/Button'
import { ProviderCard } from '@/components/ProviderCard'
import { initGlobalHelpers } from '@/lib/helpers'
import { filterRoutes, findFastestRoute, generateDeepLink } from '@/lib/routeHelpers'
import { useUserPreferences } from '@/contexts/UserPreferencesContext'
import { useRouteComparison } from '@/hooks/useRouteComparison'
import type { Location, Coordinates, Place } from '@/types'

export default function Home() {
  const [startLocation, setStartLocation] = useState('')
  const [endLocation, setEndLocation] = useState('')

  // Store geocoded coordinates
  const [startCoordinates, setStartCoordinates] = useState<Coordinates | null>(null)
  const [endCoordinates, setEndCoordinates] = useState<Coordinates | null>(null)

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

  // Smooth scroll to results when they appear
  useEffect(() => {
    if (results && results.length > 0 && resultsRef.current) {
      // Wait for fade animation to complete (500ms) before scrolling
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }, 600)
    }
  }, [results])

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
  }

  // Filter and deduplicate results based on user preferences
  const filteredResults = filterRoutes(results, preferences)
  const fastest = findFastestRoute(filteredResults)

  return (
    <main className="flex-auto">
      <Container className="mt-24 sm:mt-32 lg:mt-40">
        <FadeIn animate>
          <div className="max-w-2xl">
            <h1 className="font-display text-5xl font-medium tracking-tight text-neutral-950 sm:text-7xl">
              WhichMap
            </h1>
            <p className="mt-6 text-xl text-neutral-600">
              Compare travel times across Google Maps, Apple Maps, and Waze on a single screen.
            </p>
          </div>
        </FadeIn>

        <FadeIn animate className="mt-16">
          <form onSubmit={handleSubmit}>
            <div className="relative -space-y-px rounded-2xl bg-white">
              <AutocompleteInput
                label="Starting Location"
                value={startLocation}
                onChange={(value) => setStartLocation(value)}
                onSelect={(place: Place) => {
                  setStartLocation(place.address)
                  setStartCoordinates(place.coordinates)
                }}
                autoComplete="off"
                className="rounded-t-2xl"
              />
              <AutocompleteInput
                label="Destination"
                value={endLocation}
                onChange={(value) => setEndLocation(value)}
                onSelect={(place: Place) => {
                  setEndLocation(place.address)
                  setEndCoordinates(place.coordinates)
                }}
                autoComplete="off"
                className="rounded-b-2xl"
              />
            </div>

            {queryError && (
              <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                {queryError.message || 'Failed to fetch route data. Please try again.'}
              </div>
            )}

            <Button
              type="submit"
              className="relative z-0 mt-10"
              disabled={isLoading}
            >
              {isLoading ? 'Comparing routes...' : 'Compare Routes'}
            </Button>
          </form>
        </FadeIn>

        {isLoading && (
          <FadeIn animate className="mt-24">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-neutral-950 border-r-transparent"></div>
              <p className="mt-4 text-lg text-neutral-600">Loading route comparisons...</p>
            </div>
          </FadeIn>
        )}

        {!isLoading && filteredResults.length > 0 && (
          <div ref={resultsRef} className="mt-24 sm:mt-32">
            <FadeIn animate>
              <h2 className="font-display text-2xl font-semibold text-neutral-950">
                Results
              </h2>
            </FadeIn>

            <FadeInStagger className="mt-10">
              <dl className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
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
              </dl>
            </FadeInStagger>
          </div>
        )}

        {/* Show message when all services are disabled */}
        {!isLoading && results && results.length > 0 && filteredResults.length === 0 && (
          <div className="mt-24 sm:mt-32">
            <FadeIn animate>
              <div className="rounded-lg bg-neutral-50 px-6 py-8 text-center">
                <p className="text-lg text-neutral-600">
                  All navigation services are disabled. Enable at least one service in Settings to see results.
                </p>
              </div>
            </FadeIn>
          </div>
        )}

        {/* Footer */}
        <div className="mt-32 border-t border-neutral-200 pt-10 pb-16">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-sm text-neutral-500">
              Enjoying WhichMap? Support the project
            </p>
            <a
              href="https://buymeacoffee.com/whichmap"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-2.5 text-sm font-semibold text-neutral-900 transition hover:bg-amber-500"
            >
              <span>☕</span>
              Buy Me a Coffee
            </a>
          </div>
        </div>
      </Container>
    </main>
  )
}

