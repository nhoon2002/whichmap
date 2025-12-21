'use client'

import { FadeIn } from '@/components/FadeIn'
import Image from 'next/image'
import clsx from 'clsx'
import { openMapLink } from '@/lib/deeplinkHelpers'
import { trackProviderClick, getCurrentTrackingCode } from '@/services/tracking/trackingService'
import { hapticMedium } from '@/lib/capacitor'
import type { ProviderCardProps } from '@/types'

/**
 * Get the icon path for each map provider
 */
const getProviderIcon = (provider: string): string => {
  const normalizedProvider = provider.toLowerCase()
  if (normalizedProvider.includes('google')) return '/google-maps-icon.png'
  if (normalizedProvider.includes('apple')) return '/apple-maps-icon.png'
  if (normalizedProvider.includes('here')) return '/here-maps-icon.png'
  if (normalizedProvider.includes('waze')) return '/waze-icon.png'
  return '/google-maps-icon.png'
}

/**
 * Get the background color for each provider
 */
const getProviderColors = (provider: string, isFastest: boolean) => {
  const normalizedProvider = provider.toLowerCase()
  
  if (isFastest) {
    return {
      bg: 'bg-green-50',
      text: 'text-green-600',
      ring: 'ring-2 ring-green-600 ring-offset-2'
    }
  }
  
  if (normalizedProvider.includes('google')) {
    return {
      bg: 'bg-white',
      text: 'text-blue-600',
      ring: ''
    }
  }
  if (normalizedProvider.includes('apple')) {
    return {
      bg: 'bg-white',
      text: 'text-gray-700',
      ring: ''
    }
  }
  if (normalizedProvider.includes('here')) {
    return {
      bg: 'bg-white',
      text: 'text-teal-600',
      ring: ''
    }
  }
  if (normalizedProvider.includes('waze')) {
    return {
      bg: 'bg-white',
      text: 'text-sky-600',
      ring: ''
    }
  }
  
  return {
    bg: 'bg-neutral-50',
    text: 'text-neutral-600',
    ring: ''
  }
}

export function ProviderCard({ 
  provider, 
  eta, 
  distance, 
  unit = 'min', 
  isFastest = false, 
  link
}: ProviderCardProps) {
  const handleOpenMap = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    
    // Trigger haptic feedback for native app
    await hapticMedium()
    
    // Track the click for commission attribution
    const trackingCode = getCurrentTrackingCode()
    if (trackingCode) {
      // Determine provider ID from provider name
      const providerId = provider.toLowerCase().includes('google') ? 'google' :
                         provider.toLowerCase().includes('apple') ? 'apple' :
                         provider.toLowerCase().includes('here') ? 'here' :
                         provider.toLowerCase().includes('waze') ? 'waze' : 'unknown'
      
      // Track asynchronously (don't block navigation)
      trackProviderClick(trackingCode, providerId).catch(err => {
        console.error('Error tracking click:', err)
      })
    }
    
    // Open the map
    openMapLink(link)
  }

  const hasLink = Boolean(link)
  const providerIcon = getProviderIcon(provider)
  const colors = getProviderColors(provider, isFastest)

  return (
    <FadeIn>
      <button
        type="button"
        onClick={hasLink ? handleOpenMap : undefined}
        disabled={!hasLink}
      className={clsx(
          'relative w-full rounded-2xl bg-white p-5 text-left transition-all group',
          isFastest 
            ? 'border-[3px] border-green-600 hover:border-green-700 hover:shadow-lg hover:scale-[1.02]' 
            : 'border-2 border-neutral-200 hover:border-neutral-300 hover:shadow-md',
          hasLink && 'cursor-pointer',
          !hasLink && 'cursor-default opacity-75'
      )}
    >
      <div className="flex items-center gap-4">
        {/* Provider Icon */}
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center transition-transform group-hover:scale-110">
          <Image
            src={providerIcon}
            alt={`${provider} icon`}
            width={56}
            height={56}
            className="object-contain"
            loading="lazy"
            unoptimized={false}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
              Open in
            </span>
        {isFastest && (
              <span className="inline-block text-xs font-medium text-green-600 border border-green-600 rounded-full px-2.5 py-0.5 whitespace-nowrap">
            Fastest
          </span>
        )}
      </div>
          <h3 className="text-lg font-semibold text-neutral-950 truncate group-hover:text-neutral-700 transition-colors">
            {provider}
          </h3>
          {distance && (
            <p className="text-sm text-neutral-500 mt-0.5">{distance}</p>
          )}
        </div>
        
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <div className={clsx(
            "text-2xl font-bold tabular-nums",
            isFastest ? "text-green-600" : "text-neutral-950"
          )}>
        {eta} {unit}
          </div>
          <div className="flex items-center gap-1 text-neutral-400 group-hover:text-neutral-600 transition-colors">
            <span className="text-sm font-medium">Tap to open</span>
            <span className="text-lg transition-transform group-hover:translate-x-1">→</span>
          </div>
        </div>
      </div>
        </button>
    </FadeIn>
  )
}
