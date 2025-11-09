/**
 * Input Validation Schemas
 * Using Zod for runtime type checking and validation
 */

import { z } from 'zod'

/**
 * Address validation schema
 * Prevents injection attacks and ensures valid input
 */
const addressSchema = z
  .string()
  .min(3, 'Address must be at least 3 characters')
  .max(200, 'Address must be less than 200 characters')
  .regex(
    /^[a-zA-Z0-9\s,.-]+$/,
    'Address contains invalid characters'
  )
  .trim()

/**
 * Coordinate validation schema
 * Validates {lat, lng} objects
 */
const coordinateSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
})

/**
 * Location schema - accepts either address string or coordinates
 */
const locationSchema = z.union([addressSchema, coordinateSchema])

/**
 * Route comparison request schema
 */
export const routeComparisonSchema = z.object({
  start: locationSchema,
  end: locationSchema,
  preferences: z
    .object({
      navServices: z
        .object({
          google: z.boolean().optional(),
          apple: z.boolean().optional(),
          waze: z.boolean().optional(),
        })
        .optional(),
    })
    .optional(),
})

/**
 * Validate route comparison input
 * @param {object} data - Request data to validate
 * @returns {object} { success: boolean, data?: object, error?: string }
 */
export function validateRouteComparison(data) {
  try {
    const validated = routeComparisonSchema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstIssue = error.issues?.[0]
      return {
        success: false,
        error: firstIssue?.message || 'Invalid input',
      }
    }
    return {
      success: false,
      error: 'Invalid input',
    }
  }
}

/**
 * Sanitize address string
 * Additional layer of protection
 * @param {string} address
 * @returns {string}
 */
export function sanitizeAddress(address) {
  return address
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML
    .replace(/[;'"]/g, '') // Remove potential SQL/command injection chars
    .substring(0, 200) // Hard limit
}

