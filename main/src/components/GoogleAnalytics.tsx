'use client'

import { GoogleAnalytics } from '@next/third-parties/google'

/**
 * Google Analytics component
 * 
 * Loads Google Analytics 4 (GA4) using Next.js third-parties integration.
 * The GA measurement ID should be set in NEXT_PUBLIC_GA_MEASUREMENT_ID environment variable.
 * 
 * This component only renders if the measurement ID is configured.
 */
export function GoogleAnalyticsComponent() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  if (!measurementId) {
    // Don't render anything if GA is not configured
    return null
  }

  return <GoogleAnalytics gaId={measurementId} />
}



