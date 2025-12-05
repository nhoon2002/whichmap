'use client'

import { useState, useRef, useEffect } from 'react'
import { useUserPreferences } from '@/contexts/UserPreferencesContext'
import type { ProviderId } from '@/types'

interface NavService {
  key: ProviderId
  label: string
  available: boolean
  comingSoon?: boolean
}

interface SettingsProps {
  /**
   * If true, shows settings inline (always visible)
   * If false, shows as dropdown button (default)
   */
  inline?: boolean
}

export function Settings({ inline = false }: SettingsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { preferences, toggleNavService, loading, isLoggedIn } = useUserPreferences()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const navServices: NavService[] = [
    { key: 'google', label: 'Google Maps', available: true },
    { key: 'apple', label: 'Apple Maps', available: true },
    { key: 'waze', label: 'Waze', available: false, comingSoon: true },
  ]

  // Inline mode - always show settings
  if (inline) {
    return (
      <div>
        {!isLoggedIn && (
          <p className="text-xs text-neutral-600 mb-3 p-2 bg-neutral-50 rounded">
            Sign in to save your preferences
          </p>
        )}

        <div className="space-y-2">
          {navServices.map(({ key, label, available, comingSoon }) => (
            <label
              key={key}
              className={`flex items-center gap-3 p-2 rounded transition ${
                available 
                  ? 'cursor-pointer hover:bg-neutral-50' 
                  : 'cursor-not-allowed opacity-60'
              }`}
              title={!available ? 'Coming soon' : ''}
            >
              <input
                type="checkbox"
                checked={available ? preferences.navServices[key] : false}
                onChange={() => available && toggleNavService(key)}
                disabled={loading || !available}
                className="h-4 w-4 rounded border-neutral-300 text-neutral-950 focus:ring-neutral-950 disabled:cursor-not-allowed"
              />
              <span className="text-sm text-neutral-700 flex-1">{label}</span>
              {comingSoon && (
                <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                  Coming Soon
                </span>
              )}
            </label>
          ))}
        </div>

        <p className="text-xs text-neutral-500 mt-3">
          Select which services to compare
        </p>
      </div>
    )
  }

  // Dropdown mode (default) - for header
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-50 cursor-pointer"
        aria-label="Settings"
      >
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
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <span className="hidden sm:inline">Settings</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-lg border border-neutral-200 bg-white shadow-lg z-10">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-neutral-950 mb-3">
              Navigation Services
            </h3>

            {!isLoggedIn && (
              <p className="text-xs text-neutral-600 mb-3 p-2 bg-neutral-50 rounded">
                Sign in to save your preferences
              </p>
            )}

            <div className="space-y-2">
              {navServices.map(({ key, label, available, comingSoon }) => (
                <label
                  key={key}
                  className={`flex items-center gap-3 p-2 rounded transition ${
                    available 
                      ? 'cursor-pointer hover:bg-neutral-50' 
                      : 'cursor-not-allowed opacity-60'
                  }`}
                  title={!available ? 'Coming soon' : ''}
                >
                  <input
                    type="checkbox"
                    checked={available ? preferences.navServices[key] : false}
                    onChange={() => available && toggleNavService(key)}
                    disabled={loading || !available}
                    className="h-4 w-4 rounded border-neutral-300 text-neutral-950 focus:ring-neutral-950 disabled:cursor-not-allowed"
                  />
                  <span className="text-sm text-neutral-700 flex-1">{label}</span>
                  {comingSoon && (
                    <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                      Coming Soon
                    </span>
                  )}
                </label>
              ))}
            </div>

            <p className="text-xs text-neutral-500 mt-3">
              Select which services to compare
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
