'use client'

import { useState, useEffect, useRef } from 'react'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { TextInput } from '@/components/TextInput'
import { Button } from '@/components/Button'
import { ProviderCard } from '@/components/ProviderCard'
import { initGlobalHelpers } from '@/lib/helpers'
import { useUserPreferences } from '@/hooks/useUserPreferences'
import { useRouteComparison } from '@/hooks/useRouteComparison'

// Generate deep links for each provider
function generateDeepLink(provider, start, end) {
  const encodedStart = encodeURIComponent(start)
  const encodedEnd = encodeURIComponent(end)

  switch (provider) {
    case 'google':
      return `https://www.google.com/maps/dir/?api=1&origin=${encodedStart}&destination=${encodedEnd}`
    case 'apple':
      return `https://maps.apple.com/?saddr=${encodedStart}&daddr=${encodedEnd}`
    case 'waze':
      // TODO: Use coordinate format (ll.{lat},{lon}) when geocoding is implemented
      return `https://www.waze.com/live-map/directions?from=${encodedStart}&to=${encodedEnd}`
    default:
      return '#'
  }
}

// Find the fastest route
function findFastestRoute(results) {
  return results.reduce((fastest, current) => {
    return current.eta < fastest.eta ? current : fastest
  })
}

export default function Home() {
  const [startLocation, setStartLocation] = useState('1932 Selby Ave, Los Angeles, CA 90025')
  const [endLocation, setEndLocation] = useState('111 N Broadway, Los Angeles, CA 90012')
  const [searchStart, setSearchStart] = useState('')
  const [searchEnd, setSearchEnd] = useState('')
  const resultsRef = useRef(null)
  const { preferences } = useUserPreferences()

  // Use the route comparison hook
  // Auto-fetch when searchStart and searchEnd are set (after form submit)
  const {
    data: results,
    isLoading,
    error: queryError,
  } = useRouteComparison(searchStart, searchEnd, preferences)

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

  const handleSubmit = async (e) => {
    e.preventDefault()

    const start = startLocation.trim()
    const end = endLocation.trim()

    if (!start || !end) {
      return
    }

    // Update search parameters to trigger the query
    // The hook will auto-fetch when these change
    setSearchStart(start)
    setSearchEnd(end)
  }

  // Filter and deduplicate results based on user preferences
  // Google returns multiple route alternatives - we only show the first (fastest) one
  const filteredResults = results ? (() => {
    // First, filter by user preferences
    const preferenceFiltered = results.filter((result) => {
      return preferences.navServices[result.id] !== false
    })

    // Then, group by provider and take only the first route from each
    const seenProviders = new Set()
    return preferenceFiltered.filter((result) => {
      if (seenProviders.has(result.id)) {
        return false // Skip duplicate providers
      }
      seenProviders.add(result.id)
      return true
    })
  })() : []

  const fastest = filteredResults.length > 0 ? findFastestRoute(filteredResults) : null

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
            <div className="isolate -space-y-px rounded-2xl bg-white">
              <TextInput
                label="Starting Location"
                value={startLocation}
                onChange={(e) => setStartLocation(e.target.value)}
                autoComplete="off"
              />
              <TextInput
                label="Destination"
                value={endLocation}
                onChange={(e) => setEndLocation(e.target.value)}
                autoComplete="off"
              />
            </div>

            {queryError && (
              <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                {queryError.message || 'Failed to fetch route data. Please try again.'}
              </div>
            )}

            <Button
              type="submit"
              className="mt-10"
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
                    isFastest={fastest && result.id === fastest.id}
                    deepLink={result.webLink || result.deepLink || generateDeepLink(result.id, searchStart, searchEnd)}
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
