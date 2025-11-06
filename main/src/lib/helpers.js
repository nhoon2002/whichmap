/**
 * Global helper and debug utilities for WhichMap
 */

/**
 * Initialize global helpers - attach to window object
 * Call this once in your root component
 * Note: Only attaches helpers in development mode
 */
export function initGlobalHelpers() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && !window.log) {
    window.log = log
    window.logger = logger
    window.logTime = logTime
    window.devLog = devLog
    window.logObject = logObject
    window.logTrace = logTrace

    // Confirmation in dev mode
    console.log('%c✓ Global helpers loaded', 'color: green; font-weight: bold;')
    console.log(
      '%cAvailable: log(), logger, logTime(), devLog(), logObject(), logTrace()',
      'color: gray;'
    )
  }
}

/**
 * Console log with color styling
 * @param {*} something - The content to log (can be any type)
 * @param {string} color - CSS color value (e.g., 'red', '#ff0000', 'rgb(255,0,0)')
 *
 * @example
 * log('Hello World', 'blue')
 * log({ user: 'John' }, 'green')
 * log('Error message', '#ff0000')
 */
export function log(something, color = 'black') {
  // Check if we're in the browser
  if (typeof window !== 'undefined') {
    // Use console.log with CSS styling
    console.log(`%c${JSON.stringify(something, null, 2)}`, `color: ${color}; font-weight: bold;`)
  } else {
    // Fallback for server-side (no color support in Node.js console by default)
    console.log('[LOG]', something)
  }
}

/**
 * Predefined colored log functions for common use cases
 * Colors optimized for dark mode consoles
 */
export const logger = {
  info: (msg) => log(msg, '#6CB4EE'),      // Light blue
  success: (msg) => log(msg, '#7FFF00'),   // Chartreuse green
  warning: (msg) => log(msg, '#FFA500'),   // Orange
  error: (msg) => log(msg, '#FF6B6B'),     // Light red/coral
  debug: (msg) => log(msg, '#DA70D6'),     // Orchid purple
}

/**
 * Log with timestamp
 * @param {*} something - The content to log
 * @param {string} color - CSS color value
 */
export function logTime(something, color = 'black') {
  const timestamp = new Date().toLocaleTimeString()
  log(`[${timestamp}] ${JSON.stringify(something)}`, color)
}

/**
 * Log only in development mode
 * @param {*} something - The content to log
 * @param {string} color - CSS color value
 */
export function devLog(something, color = 'blue') {
  if (process.env.NODE_ENV === 'development') {
    log(something, color)
  }
}

/**
 * Pretty print objects with color
 * @param {Object} obj - Object to pretty print
 * @param {string} color - CSS color value
 */
export function logObject(obj, color = 'teal') {
  if (typeof window !== 'undefined') {
    console.log(`%c${JSON.stringify(obj, null, 2)}`, `color: ${color}; font-family: monospace;`)
  } else {
    console.log(obj)
  }
}

/**
 * Log function entry/exit for debugging
 * @param {string} functionName - Name of the function
 * @param {string} action - 'enter' or 'exit'
 * @param {*} data - Optional data to log
 */
export function logTrace(functionName, action = 'enter', data = null) {
  const color = action === 'enter' ? 'green' : 'red'
  const symbol = action === 'enter' ? '→' : '←'
  const message = data
    ? `${symbol} ${functionName}() ${action} | Data: ${JSON.stringify(data)}`
    : `${symbol} ${functionName}() ${action}`
  log(message, color)
}
