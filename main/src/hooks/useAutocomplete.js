/**
 * Custom hook for Google Places Autocomplete
 * Provides debounced search with predictions
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { getAutocompletePredictions, getPlaceDetails } from '@/services/geocoding/autocompleteService'

/**
 * Hook for address autocomplete functionality
 * @param {object} options - Configuration options
 * @returns {object} Autocomplete state and handlers
 */
export function useAutocomplete(options = {}) {
  const { debounceMs = 300, minChars = 2 } = options

  const [input, setInput] = useState('')
  const [predictions, setPredictions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)

  const debounceTimer = useRef(null)
  const justSelected = useRef(false) // Flag to prevent autocomplete after selection

  // Fetch predictions when input changes (with debounce)
  useEffect(() => {
    // Skip autocomplete if user just selected a place
    if (justSelected.current) {
      justSelected.current = false
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
        const results = await getAutocompletePredictions(input)
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
  }, [input, debounceMs, minChars])

  // Handle input change
  const handleInputChange = useCallback((value) => {
    setInput(value)
    setSelectedPlace(null) // Clear selection when user types
  }, [])

  // Handle prediction selection
  const handleSelect = useCallback(async (prediction) => {
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
