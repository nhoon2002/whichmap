'use client'

import { useState } from 'react'
import { shareResults, canShare, hapticLight } from '@/lib/capacitor'
import clsx from 'clsx'

interface ShareButtonProps {
  origin: string
  destination: string
  fastestProvider?: string
  fastestTime?: string
  className?: string
}

/**
 * Native Share button component
 * Uses Capacitor Share plugin on native, Web Share API on web, clipboard as fallback
 */
export function ShareButton({
  origin,
  destination,
  fastestProvider,
  fastestTime,
  className,
}: ShareButtonProps) {
  const [showCopied, setShowCopied] = useState(false)

  if (!canShare()) {
    return null
  }

  const handleShare = async () => {
    await hapticLight()
    const shared = await shareResults(origin, destination, fastestProvider, fastestTime)
    
    // Show "Copied!" feedback if we fell back to clipboard
    if (shared && !navigator.share) {
      setShowCopied(true)
      setTimeout(() => setShowCopied(false), 2000)
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-full px-4 py-2',
        'bg-neutral-100 text-neutral-700 hover:bg-neutral-200',
        'transition-all active:scale-95',
        'text-sm font-medium',
        className
      )}
      aria-label="Share results"
    >
      {showCopied ? (
        <>
          <svg
            className="h-4 w-4 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-green-600">Copied!</span>
        </>
      ) : (
        <>
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          <span>Share</span>
        </>
      )}
    </button>
  )
}

