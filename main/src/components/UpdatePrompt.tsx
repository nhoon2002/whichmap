'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/Button'
import { checkForUpdate, reloadApp } from '@/services/version/versionService'

/**
 * Update Prompt Component
 * Shows a user-friendly dialog when new version is available
 *
 * Usage: Add to your root layout or main page
 */
export function UpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Check for updates on mount (optional)
    checkForUpdate().then((needsUpdate) => {
      if (needsUpdate) {
        setShowPrompt(true)
      }
    })
  }, [])

  if (!showPrompt) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-blue-100 p-3">
            <svg
              className="h-6 w-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
        </div>

        <h3 className="text-center font-display text-xl font-semibold text-neutral-950">
          Update Available
        </h3>
        <p className="mt-2 text-center text-sm text-neutral-600">
          A new version of WhichMap is available. Reload to get the latest features and improvements.
        </p>

        <div className="mt-6 flex gap-3">
          <Button
            onClick={() => setShowPrompt(false)}
            className="flex-1 justify-center bg-neutral-100 hover:bg-neutral-200 text-neutral-950"
          >
            Later
          </Button>
          <Button
            onClick={() => reloadApp()}
            className="flex-1 justify-center"
          >
            Update Now
          </Button>
        </div>
      </div>
    </div>
  )
}
