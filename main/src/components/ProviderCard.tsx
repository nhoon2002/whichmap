'use client'

import { Border } from '@/components/Border'
import { FadeIn } from '@/components/FadeIn'
import clsx from 'clsx'
import { openMapLink } from '@/lib/deeplinkHelpers'
import type { ProviderCardProps } from '@/types'

export function ProviderCard({ 
  provider, 
  eta, 
  distance, 
  unit = 'min', 
  isFastest = false, 
  link
}: ProviderCardProps) {
  const handleOpenMap = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    openMapLink(link)
  }

  const hasLink = Boolean(link)

  return (
    <Border
      as={FadeIn}
      position="left"
      className={clsx(
        'flex flex-col-reverse pl-8',
        isFastest && 'before:bg-green-500! after:bg-green-500/10!'
      )}
    >
      <div className="mt-2 flex items-baseline justify-between">
        <dt className="text-base text-neutral-600">{provider}</dt>
        {isFastest && (
          <span className="text-sm font-semibold text-green-600">
            Fastest
          </span>
        )}
      </div>
      <dd className="font-display text-3xl font-semibold text-neutral-950 sm:text-4xl">
        {eta} {unit}
      </dd>
      {distance && (
        <div className="mt-1 text-sm text-neutral-500">
          {distance}
        </div>
      )}
      {hasLink && (
        <button
          onClick={handleOpenMap}
          className="mt-4 inline-flex items-center text-sm font-semibold text-neutral-950 hover:text-neutral-700 transition-colors"
        >
          Open in {provider} →
        </button>
      )}
    </Border>
  )
}
