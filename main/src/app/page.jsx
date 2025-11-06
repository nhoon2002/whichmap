'use client'

import { useState, useEffect, useRef } from 'react'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { TextInput } from '@/components/TextInput'
import { Button } from '@/components/Button'
import { ProviderCard } from '@/components/ProviderCard'
import { initGlobalHelpers } from '@/lib/helpers'

// TODO: Replace with real API data from Google Maps, Apple Maps, and Waze
const MOCK_DATA = {
  google: {
    provider: 'Google Maps',
    eta: 25,
    distance: '15.2 mi',
    unit: 'min'
  },
  apple: {
    provider: 'Apple Maps',
    eta: 23,
    distance: '15.1 mi',
    unit: 'min'
  },
  waze: {
    provider: 'Waze',
    eta: 27,
    distance: '15.3 mi',
    unit: 'min'
  }
}

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

// TODO: Fetch data from all providers using real APIs in parallel
async function fetchAllProviders(start, end) {
  // TODO: Remove simulated delay and implement actual API calls
  await new Promise(resolve => setTimeout(resolve, 1500))

  return [
    { ...MOCK_DATA.google, id: 'google' },
    { ...MOCK_DATA.apple, id: 'apple' },
    { ...MOCK_DATA.waze, id: 'waze' }
  ]
}

export default function Home() {
  const [startLocation, setStartLocation] = useState('1932 Selby Ave, Los Angeles, CA 90025')
  const [endLocation, setEndLocation] = useState('111 N Broadway, Los Angeles, CA 90012')
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const resultsRef = useRef(null)

  // Initialize global helpers on mount
  useEffect(() => {
    initGlobalHelpers()
  }, [])

  // Smooth scroll to results when they appear
  useEffect(() => {
    if (results.length > 0 && resultsRef.current) {
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
      setError('Please enter both starting location and destination')
      return
    }

    setError(null)
    setIsLoading(true)
    setResults([])

    try {
      // TODO: Implement real geocoding to convert addresses to coordinates
      const fetchedResults = await fetchAllProviders(start, end)
      logger.info(fetchedResults)
      setResults(fetchedResults)
    } catch (err) {
      setError('Failed to fetch route data. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const fastest = results.length > 0 ? findFastestRoute(results) : null

  return (
    <main className="flex-auto">
      <Container className="mt-24 sm:mt-32 lg:mt-40">
        <FadeIn>
          <div className="max-w-2xl">
            <h1 className="font-display text-5xl font-medium tracking-tight text-neutral-950 sm:text-7xl">
              WhichMap
            </h1>
            <p className="mt-6 text-xl text-neutral-600">
              Compare travel times across Google Maps, Apple Maps, and Waze on a single screen.
            </p>
          </div>
        </FadeIn>

        <FadeIn className="mt-16">
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

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                {error}
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
          <FadeIn className="mt-24">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-neutral-950 border-r-transparent"></div>
              <p className="mt-4 text-lg text-neutral-600">Loading route comparisons...</p>
            </div>
          </FadeIn>
        )}

        {!isLoading && results.length > 0 && (
          <div ref={resultsRef} className="mt-24 sm:mt-32">
            <FadeIn>
              <h2 className="font-display text-2xl font-semibold text-neutral-950">
                Results
              </h2>
            </FadeIn>

            <FadeInStagger className="mt-10">
              <dl className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((result) => (
                  <ProviderCard
                    key={result.id}
                    provider={result.provider}
                    eta={result.eta}
                    distance={result.distance}
                    unit={result.unit}
                    isFastest={fastest && result.id === fastest.id}
                    deepLink={generateDeepLink(result.id, startLocation, endLocation)}
                  />
                ))}
              </dl>
            </FadeInStagger>
          </div>
        )}
      </Container>
    </main>
  )
}
