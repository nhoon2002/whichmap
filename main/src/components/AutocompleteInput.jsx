'use client'

/**
 * Autocomplete Input Component
 * Text input with Google Places autocomplete suggestions
 * Includes "Use Current Location" button for geolocation
 */

import { useRef, useEffect, useState } from 'react'
import { useAutocomplete } from '@/hooks/useAutocomplete'

export function AutocompleteInput({
  label,
  placeholder,
  value,
  onChange,
  onSelect,
  onUseCurrentLocation,
  showLocationButton = true,
  className = '',
  ...props
}) {
  const {
    input,
    predictions,
    isLoading,
    selectedPlace,
    showDropdown,
    handleInputChange,
    handleSelect,
    setShowDropdown,
  } = useAutocomplete()

  const inputRef = useRef(null)
  const dropdownRef = useRef(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationError, setLocationError] = useState(null)

  // Sync internal state with external value
  useEffect(() => {
    if (value !== input) {
      handleInputChange(value)
    }
  }, [value, input, handleInputChange])

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [setShowDropdown])

  // Handle input change
  const onInputChange = (e) => {
    const newValue = e.target.value
    handleInputChange(newValue)
    onChange?.(newValue)
  }

  // Handle prediction selection
  const onPredictionSelect = async (prediction) => {
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
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowDropdown(false)
    }
  }

  // Handle "Use Current Location" button click
  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser')
      return
    }

    setIsGettingLocation(true)
    setLocationError(null)

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        })
      })

      const { latitude, longitude } = position.coords

      // Set display text to "Current Location"
      handleInputChange('Current Location')
      onChange?.('Current Location')

      // Notify parent with coordinates
      onSelect?.({
        address: 'Current Location',
        coordinates: {
          lat: latitude,
          lng: longitude,
        },
        isCurrentLocation: true,
      })

      // Also call the optional callback
      onUseCurrentLocation?.({
        lat: latitude,
        lng: longitude,
      })

      setShowDropdown(false)
    } catch (error) {
      console.error('Error getting location:', error)
      
      // User-friendly error messages
      let errorMessage = 'Unable to get your location'
      if (error.code === 1) {
        errorMessage = 'Location access denied. Please enable location permissions.'
      } else if (error.code === 2) {
        errorMessage = 'Location unavailable. Please try again.'
      } else if (error.code === 3) {
        errorMessage = 'Location request timed out. Please try again.'
      }
      
      setLocationError(errorMessage)
    } finally {
      setIsGettingLocation(false)
    }
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
          onFocus={() => predictions.length > 0 && setShowDropdown(true)}
          placeholder=" "
          className={`
            peer w-full border border-neutral-300 pb-4 pt-12
            text-base/6 text-neutral-950 ring-4 ring-transparent
            transition focus:border-neutral-950 focus:outline-none
            focus:ring-neutral-950/5
            ${showLocationButton ? 'pl-6 pr-12' : 'px-6'}
            ${className}
          `}
          {...props}
        />
        <label
          className="pointer-events-none absolute left-6 top-1/2 -mt-3 origin-left text-base/6 text-neutral-500 transition-all duration-200 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:font-semibold peer-focus:text-neutral-950 peer-[:not(:placeholder-shown)]:-translate-y-4 peer-[:not(:placeholder-shown)]:scale-75 peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:text-neutral-950"
        >
          {label}
        </label>

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

      {/* Dropdown with predictions */}
      {showDropdown && predictions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-9999 mt-2 w-full rounded-sm border border-neutral-200 bg-white shadow-lg"
        >
          <ul className="max-h-60 overflow-y-auto">
            {predictions.map((prediction, index) => (
              <li key={prediction.place_id || index}>
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
                        {prediction.structured_formatting?.main_text || prediction.description}
                      </div>
                      {prediction.structured_formatting?.secondary_text && (
                        <div className="mt-0.5 text-xs text-neutral-500">
                          {prediction.structured_formatting.secondary_text}
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
