'use client'

import React from 'react'
import { Container } from '@/components/Container'
import { Button } from '@/components/Button'

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * Prevents the entire app from crashing
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console (in production, send to error tracking service)
    console.error('Error Boundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo,
    })

    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
    // if (process.env.NODE_ENV === 'production') {
    //   Sentry.captureException(error, { extra: errorInfo })
    // }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <main className="flex-auto">
          <Container className="mt-24 sm:mt-32 lg:mt-40">
            <div className="max-w-2xl">
              <h1 className="font-display text-4xl font-medium tracking-tight text-neutral-950 sm:text-5xl">
                Something went wrong
              </h1>
              <p className="mt-6 text-lg text-neutral-600">
                We're sorry, but something unexpected happened. The error has been logged and we'll look into it.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-8 rounded-lg bg-red-50 p-6">
                  <h2 className="text-lg font-semibold text-red-900">Error Details (Development Only)</h2>
                  <pre className="mt-4 overflow-auto text-sm text-red-800">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              )}

              <div className="mt-10 flex gap-4">
                <Button onClick={this.handleReset}>
                  Try Again
                </Button>
                <Button onClick={() => window.location.href = '/'}>
                  Go to Home
                </Button>
              </div>
            </div>
          </Container>
        </main>
      )
    }

    return this.props.children
  }
}

/**
 * Functional wrapper for easier use
 * @param {React.ReactNode} children - Child components to wrap
 * @returns {React.ReactElement}
 */
export function withErrorBoundary(Component) {
  return function WithErrorBoundaryWrapper(props) {
    return (
      <ErrorBoundary>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}

