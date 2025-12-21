/**
 * Custom hook for Google Places Autocomplete
 * Provides debounced search with predictions
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { getAutocompletePredictions, getPlaceDetails, type AutocompleteOptions } from '@/services/geocoding/autocompleteService'
import type { AutocompletePrediction, Place } from '@/types'

/**
 * Autocomplete hook options
 */
interface UseAutocompleteOptions {
  debounceMs?: number
  minChars?: number
  biasLocation?: {
    lat: number
    lng: number
  }
  radius?: number
}

/**
 * Extended place with prediction info
 */
interface SelectedPlace extends Place {
  description: string
  placeId: string
}

/**
 * Return type for useAutocomplete hook
 */
interface UseAutocompleteReturn {
  input: string
  predictions: AutocompletePrediction[]
  isLoading: boolean
  selectedPlace: SelectedPlace | null
  showDropdown: boolean
  handleInputChange: (value: string, skipAutocomplete?: boolean) => void
  handleSelect: (prediction: AutocompletePrediction) => Promise<Place>
  setShowDropdown: (show: boolean) => void
  clear: () => void
}

/**
 * Hook for address autocomplete functionality
 */
export function useAutocomplete(options: UseAutocompleteOptions = {}): UseAutocompleteReturn {
  const { debounceMs = 300, minChars = 2, biasLocation, radius } = options

  const [input, setInput] = useState('')
  const [predictions, setPredictions] = useState<AutocompletePrediction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)

  const debounceTimer = useRef<NodeJS.Timeout | null>(null)
  const justSelected = useRef(false) // Flag to prevent autocomplete after selection

  // Fetch predictions when input changes (with debounce)
  useEffect(() => {
    // Skip autocomplete if user just selected a place
    if (justSelected.current) {
      justSelected.current = false
      return
    }

    // Skip autocomplete for "Current Location" placeholder text
    if (input === 'Current Location') {
      setPredictions([])
      setShowDropdown(false)
      return
    }

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    // Don't search if input is too short
    if (input.length < minChars) {
      setPredictions([])
      setShowDropdown(false)
      return
    }

    // Set loading state
    setIsLoading(true)

    // Debounce the API call
    debounceTimer.current = setTimeout(async () => {
      try {
        const autocompleteOptions: AutocompleteOptions = {}

        // Add location biasing if provided
        if (biasLocation) {
          autocompleteOptions.biasLocation = biasLocation
          if (radius) {
            autocompleteOptions.radius = radius
          }
        }

        const results = await getAutocompletePredictions(input, autocompleteOptions)
        setPredictions(results)
        setShowDropdown(results.length > 0)
      } catch (error) {
        console.error('Autocomplete error:', error)
        setPredictions([])
      } finally {
        setIsLoading(false)
      }
    }, debounceMs)

    // Cleanup
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [input, debounceMs, minChars, biasLocation, radius])

  // Handle input change
  const handleInputChange = useCallback((value: string, skipAutocomplete = false) => {
    if (skipAutocomplete) {
      justSelected.current = true
    }
    setInput(value)
    setSelectedPlace(null) // Clear selection when user types
  }, [])

  // Handle prediction selection
  const handleSelect = useCallback(async (prediction: AutocompletePrediction): Promise<Place> => {
    try {
      setIsLoading(true)
      const placeDetails = await getPlaceDetails(prediction.place_id)

      setSelectedPlace({
        description: prediction.description,
        placeId: prediction.place_id,
        ...placeDetails,
      })

      // Set flag BEFORE updating input to prevent autocomplete trigger
      justSelected.current = true
      setInput(prediction.description)
      setShowDropdown(false)
      setPredictions([])

      return placeDetails
    } catch (error) {
      console.error('Error getting place details:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Clear all state
  const clear = useCallback(() => {
    setInput('')
    setPredictions([])
    setSelectedPlace(null)
    setShowDropdown(false)
    justSelected.current = false
  }, [])

  return {
    input,
    predictions,
    isLoading,
    selectedPlace,
    showDropdown,
    handleInputChange,
    handleSelect,
    setShowDropdown,
    clear,
  }
}
