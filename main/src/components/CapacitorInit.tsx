'use client'

import { useEffect } from 'react'
import { initializeCapacitor } from '@/lib/capacitor'

/**
 * Capacitor initialization component
 * Handles native app setup like splash screen and status bar
 */
export function CapacitorInit() {
  useEffect(() => {
    initializeCapacitor()
  }, [])

  return null
}

