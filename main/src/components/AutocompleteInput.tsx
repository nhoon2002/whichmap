'use client'

/**
 * Autocomplete Input Component
 * Text input with Google Places autocomplete suggestions
 * Includes "Use Current Location" button for geolocation
 */

import { useRef, useEffect, useState } from 'react'
import { useAutocomplete } from '@/hooks/useAutocomplete'
import { getSearchHistory, type SearchHistoryItem } from '@/services/searchHistory/searchHistoryService'
import { getCurrentPosition } from '@/services/geolocation/geolocationService'
import type { Place, AutocompletePrediction } from '@/types'

export interface AutocompleteInputProps {
  label: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  onSelect?: (place: Place & { isCurrentLocation?: boolean }) => void
  onClear?: () => void
  onUseCurrentLocation?: (coords: { lat: number; lng: number }) => void
  showLocationButton?: boolean
  showClearButton?: boolean
  className?: string
  autoComplete?: string
  userId?: string | null  // Added for auth-aware history
  biasLocation?: {
    lat: number
    lng: number
  }  // Location to bias autocomplete results towards
  radius?: number  // Search radius in meters (default 50km)
}

export function AutocompleteInput({
  label,
  placeholder,
  value,
  onChange,
  onSelect,
  onClear,
  onUseCurrentLocation,
  showLocationButton = true,
  showClearButton = true,
  className = '',
  userId = null,
  biasLocation,
  radius,
  ...props
}: AutocompleteInputProps & Omit<React.InputHTMLAttributes<HTMLInputElement>, keyof AutocompleteInputProps>) {
  const {
    input,
    predictions,
    isLoading,
    showDropdown,
    handleInputChange,
    handleSelect,
    setShowDropdown,
  } = useAutocomplete({ biasLocation, radius })

  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([])
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false)
  const [justSelectedFromHistory, setJustSelectedFromHistory] = useState(false)

  // Load search history on mount and when userId changes
  useEffect(() => {
    const loadHistory = async () => {
      const history = await getSearchHistory(userId)
      setSearchHistory(history)
    }
    loadHistory()
  }, [userId])

  // Sync internal state with external value
  useEffect(() => {
    if (value !== input) {
      handleInputChange(value)
    }
  }, [value, input, handleInputChange])

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
        setShowHistoryDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [setShowDropdown])

  // Handle input change
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    handleInputChange(newValue)
    onChange?.(newValue)
    
    // Hide history dropdown when user starts typing
    if (newValue) {
      setShowHistoryDropdown(false)
    }
    
    // Reset the flag when user manually edits
    if (justSelectedFromHistory) {
      setJustSelectedFromHistory(false)
    }
  }

  // Handle input focus
  const onInputFocus = () => {
    // If just selected from history, don't show any dropdown
    if (justSelectedFromHistory) {
      return
    }
    
    // If input is empty, show history/location dropdown
    if (!input) {
      setShowHistoryDropdown(true)
    } else if (predictions.length > 0) {
      // Only show predictions if user has manually typed (not from history)
      setShowDropdown(true)
    }
  }

  // Handle prediction selection
  const onPredictionSelect = async (prediction: AutocompletePrediction) => {
    try {
      const placeDetails = await handleSelect(prediction)

      // Notify parent component
      onSelect?.({
        address: prediction.description,
        coordinates: placeDetails.coordinates,
        placeId: prediction.place_id,
      })
    } catch (error) {
      console.error('Error selecting prediction:', error)
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setShowDropdown(false)
    }
  }

  // Handle clear button click
  const handleClear = () => {
    handleInputChange('')
    onChange?.('')
    setShowDropdown(false)
    setShowHistoryDropdown(true) // Show history after clearing
    setLocationError(null)
    
    // Notify parent that input was cleared
    onClear?.()
    
    // Focus back on input
    inputRef.current?.focus()
  }

  // Handle history item selection
  const onHistorySelect = (item: SearchHistoryItem) => {
    // Pass skipAutocomplete=true to prevent autocomplete trigger
    handleInputChange(item.address, true)
    onChange?.(item.address)
    
    // Notify parent with coordinates if available
    onSelect?.({
      address: item.address,
      coordinates: item.coordinates || { lat: 0, lng: 0 },
    })
    
    setShowHistoryDropdown(false)
    setShowDropdown(false)
    
    // Set flag to prevent autocomplete from opening on focus
    setJustSelectedFromHistory(true)
    
    // Reset the flag after a short delay (in case user clicks elsewhere then back)
    setTimeout(() => {
      setJustSelectedFromHistory(false)
    }, 500)
  }

  // Handle "Use Current Location" button click
  const handleUseCurrentLocation = async () => {
    setIsGettingLocation(true)
    setLocationError(null)

    try {
      // Use platform-aware geolocation service
      // Native iOS: Uses CoreLocation with persistent permissions
      // Browser: Uses Geolocation API with 5-minute cache
      const position = await getCurrentPosition()

      // Set display text to "Current Location" (skip autocomplete)
      handleInputChange('Current Location', true)
      onChange?.('Current Location')

      // Notify parent with coordinates
      onSelect?.({
        address: 'Current Location',
        coordinates: {
          lat: position.lat,
          lng: position.lng,
        },
        isCurrentLocation: true,
      })

      // Also call the optional callback
      onUseCurrentLocation?.({
        lat: position.lat,
        lng: position.lng,
      })

      setShowDropdown(false)
      setShowHistoryDropdown(false)

      // Set flag to prevent autocomplete from opening on focus
      setJustSelectedFromHistory(true)

      // Reset the flag after a short delay
      setTimeout(() => {
        setJustSelectedFromHistory(false)
      }, 500)
    } catch (error: unknown) {
      console.error('Error getting location:', error)

      // Use error message from service
      const errorMessage = error && typeof error === 'object' && 'message' in error
        ? (error as { message: string }).message
        : 'Unable to get your location'

      setLocationError(errorMessage)
    } finally {
      setIsGettingLocation(false)
    }
  }

  // Type guard for AutocompletePrediction
  const isValidPrediction = (pred: unknown): pred is AutocompletePrediction => {
    return (
      typeof pred === 'object' &&
      pred !== null &&
      'description' in pred &&
      'place_id' in pred
    )
  }

  return (
    <div className="relative w-full">
      {/* Text Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={onInputChange}
          onKeyDown={handleKeyDown}
          onFocus={onInputFocus}
          placeholder=" "
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className={`
            peer w-full border border-neutral-300 pb-4 pt-12
            text-base/6 text-neutral-950 ring-4 ring-transparent
            transition focus:border-neutral-950 focus:outline-none
            focus:ring-neutral-950/5
            ${showLocationButton ? 'pl-6 pr-24' : 'px-6'}
            ${className}
          `}
          {...props}
        />
        <label
          className="pointer-events-none absolute left-6 top-1/2 -mt-3 origin-left text-base/6 text-neutral-500 transition-all duration-200 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:font-semibold peer-focus:text-neutral-950 peer-[:not(:placeholder-shown)]:-translate-y-4 peer-[:not(:placeholder-shown)]:scale-75 peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:text-neutral-950"
        >
          {label}
        </label>

        {/* Clear Button (X) - Shows when there's text */}
        {showClearButton && input && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-12 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2"
            title="Clear input"
            aria-label="Clear input"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        {/* Current Location Button */}
        {showLocationButton && (
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isGettingLocation}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-950 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 disabled:opacity-50"
            title="Use current location"
          >
            {isGettingLocation ? (
              <svg
                className="h-5 w-5 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            )}
          </button>
        )}

        {/* Loading indicator for autocomplete */}
        {isLoading && !showLocationButton && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <svg
              className="h-5 w-5 animate-spin text-neutral-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Location Error Message */}
      {locationError && (
        <div className="mt-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
          {locationError}
        </div>
      )}

      {/* History/Location Dropdown (shown when input is empty and focused) */}
      {showHistoryDropdown && !input && (
        <div
          ref={dropdownRef}
          className="absolute z-9999 mt-2 w-full rounded-sm border border-neutral-200 bg-white shadow-lg"
        >
          {/* Current Location Option - Always on top */}
          {showLocationButton && (
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isGettingLocation}
              className="w-full px-4 py-3 text-left text-sm text-neutral-950 transition hover:bg-neutral-50 focus:bg-neutral-50 focus:outline-none disabled:opacity-50"
            >
              <div className="flex items-start gap-3">
                {/* Location crosshair icon */}
                <svg
                  className="mt-0.5 h-5 w-5 shrink-0 text-neutral-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>

                {/* Text */}
                <div className="flex-1">
                  <div className="font-medium text-neutral-950">
                    {isGettingLocation ? 'Getting location...' : 'Use current location'}
                  </div>
                </div>
              </div>
            </button>
          )}

          {searchHistory.length > 0 && (
            <>
              <div className="border-t border-neutral-100" />
              <div className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                Recently searched
              </div>
              <ul className="max-h-60 overflow-y-auto">
                {searchHistory.map((item, index) => (
                  <li key={`${item.address}-${index}`}>
                    <button
                      type="button"
                      onClick={() => onHistorySelect(item)}
                      className="w-full px-4 py-3 text-left text-sm text-neutral-950 transition hover:bg-neutral-50 focus:bg-neutral-50 focus:outline-none"
                    >
                      <div className="flex items-start gap-3">
                        {/* Clock icon for history */}
                        <svg
                          className="mt-0.5 h-5 w-5 shrink-0 text-neutral-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>

                        {/* Address text */}
                        <div className="flex-1">
                          <div className="font-medium text-neutral-950">
                            {item.address}
                          </div>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {/* Dropdown with predictions */}
      {showDropdown && predictions.length > 0 && !showHistoryDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-9999 mt-2 w-full rounded-sm border border-neutral-200 bg-white shadow-lg"
        >
          <ul className="max-h-60 overflow-y-auto">
            {predictions.map((prediction, index) => (
              <li key={prediction.placeId || index}>
                <button
                  type="button"
                  onClick={() => onPredictionSelect(prediction)}
                  className="w-full px-4 py-3 text-left text-sm text-neutral-950 transition hover:bg-neutral-50 focus:bg-neutral-50 focus:outline-none"
                >
                  <div className="flex items-start gap-3">
                    {/* Location icon */}
                    <svg
                      className="mt-0.5 h-5 w-5 shrink-0 text-neutral-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>

                    {/* Address text */}
                    <div className="flex-1">
                      <div className="font-medium text-neutral-950">
                        {prediction.mainText || prediction.description}
                      </div>
                      {prediction.secondaryText && (
                        <div className="mt-0.5 text-xs text-neutral-500">
                          {prediction.secondaryText}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>

          {/* Powered by Google branding (required by Google's Terms of Service) */}
          <div className="border-t border-neutral-100 px-4 py-2 text-right">
            <span className="text-xs text-neutral-400">Powered by Google</span>
          </div>
        </div>
      )}
    </div>
  )
}
