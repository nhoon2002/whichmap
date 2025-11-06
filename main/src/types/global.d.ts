/**
 * Global type declarations for window helper functions
 * Provides autocomplete/intellisense in VS Code
 */

export {}

declare global {
  interface Window {
    /**
     * Console log with color styling
     * @param something - The content to log (can be any type)
     * @param color - CSS color value (e.g., 'red', '#ff0000', 'rgb(255,0,0)')
     */
    log: (something: any, color?: string) => void

    /**
     * Predefined colored log functions
     */
    logger: {
      info: (msg: any) => void
      success: (msg: any) => void
      warning: (msg: any) => void
      error: (msg: any) => void
      debug: (msg: any) => void
    }

    /**
     * Log with timestamp
     */
    logTime: (something: any, color?: string) => void

    /**
     * Log only in development mode
     */
    devLog: (something: any, color?: string) => void

    /**
     * Pretty print objects with color
     */
    logObject: (obj: object, color?: string) => void

    /**
     * Log function entry/exit for debugging
     */
    logTrace: (functionName: string, action?: 'enter' | 'exit', data?: any) => void
  }
}
