/**
 * Global helper and debug utilities for WhichMap
 */

/**
 * Initialize global helpers - attach to window object
 * Call this once in your root component
 * Note: Only attaches helpers in development mode
 */
export function initGlobalHelpers(): void {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && !(window as any).log) {
    (window as any).log = log;
    (window as any).logger = logger;
    (window as any).logTime = logTime;
    (window as any).devLog = devLog;
    (window as any).logObject = logObject;
    (window as any).logTrace = logTrace

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
 */
export function log(something: any, color: string = 'black'): void {
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
  info: (msg: any) => log(msg, '#6CB4EE'),      // Light blue
  success: (msg: any) => log(msg, '#7FFF00'),   // Chartreuse green
  warning: (msg: any) => log(msg, '#FFA500'),   // Orange
  error: (msg: any) => log(msg, '#FF6B6B'),     // Light red/coral
  debug: (msg: any) => log(msg, '#DA70D6'),     // Orchid purple
}

/**
 * Log with timestamp
 */
export function logTime(something: any, color: string = 'black'): void {
  const timestamp = new Date().toLocaleTimeString()
  log(`[${timestamp}] ${JSON.stringify(something)}`, color)
}

/**
 * Log only in development mode
 */
export function devLog(something: any, color: string = 'blue'): void {
  if (process.env.NODE_ENV === 'development') {
    log(something, color)
  }
}

/**
 * Pretty print objects with color
 */
export function logObject(obj: any, color: string = 'teal'): void {
  if (typeof window !== 'undefined') {
    console.log(`%c${JSON.stringify(obj, null, 2)}`, `color: ${color}; font-family: monospace;`)
  } else {
    console.log(obj)
  }
}

/**
 * Log function entry/exit for debugging
 */
export function logTrace(functionName: string, action: 'enter' | 'exit' = 'enter', data: any = null): void {
  const color = action === 'enter' ? 'green' : 'red'
  const symbol = action === 'enter' ? '→' : '←'
  const message = data
    ? `${symbol} ${functionName}() ${action} | Data: ${JSON.stringify(data)}`
    : `${symbol} ${functionName}() ${action}`
  log(message, color)
}
