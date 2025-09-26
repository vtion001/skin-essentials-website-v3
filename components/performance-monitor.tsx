'use client'

import { useEffect } from 'react'

interface PerformanceMetrics {
  fcp?: number // First Contentful Paint
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay
  cls?: number // Cumulative Layout Shift
  ttfb?: number // Time to First Byte
}

export function PerformanceMonitor() {
  useEffect(() => {
    // Only run in production and if performance API is available
    if (process.env.NODE_ENV !== 'production' || typeof window === 'undefined' || !window.performance) {
      return
    }

    const metrics: PerformanceMetrics = {}

    // Measure Core Web Vitals
    const measureWebVitals = () => {
      // First Contentful Paint
      const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0] as PerformanceEntry
      if (fcpEntry) {
        metrics.fcp = fcpEntry.startTime
      }

      // Time to First Byte
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigationEntry) {
        metrics.ttfb = navigationEntry.responseStart - navigationEntry.requestStart
      }

      // Largest Contentful Paint
      if ('PerformanceObserver' in window) {
        try {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries()
            const lastEntry = entries[entries.length - 1] as any
            if (lastEntry) {
              metrics.lcp = lastEntry.startTime
            }
          })
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

          // First Input Delay
          const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries()
            entries.forEach((entry: any) => {
              if (entry.processingStart && entry.startTime) {
                metrics.fid = entry.processingStart - entry.startTime
              }
            })
          })
          fidObserver.observe({ entryTypes: ['first-input'] })

          // Cumulative Layout Shift
          const clsObserver = new PerformanceObserver((list) => {
            let clsValue = 0
            const entries = list.getEntries()
            entries.forEach((entry: any) => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value
              }
            })
            metrics.cls = clsValue
          })
          clsObserver.observe({ entryTypes: ['layout-shift'] })

          // Report metrics after page load
          setTimeout(() => {
            reportMetrics(metrics)
          }, 5000)
        } catch (error) {
          console.warn('Performance monitoring failed:', error)
        }
      }
    }

    // Report metrics (you can send to analytics service)
    const reportMetrics = (metrics: PerformanceMetrics) => {
      if (process.env.NODE_ENV === 'development') {
        console.group('🚀 Performance Metrics')
        console.log('First Contentful Paint (FCP):', metrics.fcp ? `${metrics.fcp.toFixed(2)}ms` : 'N/A')
        console.log('Largest Contentful Paint (LCP):', metrics.lcp ? `${metrics.lcp.toFixed(2)}ms` : 'N/A')
        console.log('First Input Delay (FID):', metrics.fid ? `${metrics.fid.toFixed(2)}ms` : 'N/A')
        console.log('Cumulative Layout Shift (CLS):', metrics.cls ? metrics.cls.toFixed(4) : 'N/A')
        console.log('Time to First Byte (TTFB):', metrics.ttfb ? `${metrics.ttfb.toFixed(2)}ms` : 'N/A')
        console.groupEnd()

        // Performance recommendations
        const recommendations = []
        if (metrics.fcp && metrics.fcp > 1800) recommendations.push('FCP is slow - optimize critical resources')
        if (metrics.lcp && metrics.lcp > 2500) recommendations.push('LCP is slow - optimize largest content element')
        if (metrics.fid && metrics.fid > 100) recommendations.push('FID is slow - reduce JavaScript execution time')
        if (metrics.cls && metrics.cls > 0.1) recommendations.push('CLS is high - avoid layout shifts')
        if (metrics.ttfb && metrics.ttfb > 600) recommendations.push('TTFB is slow - optimize server response time')

        if (recommendations.length > 0) {
          console.group('⚠️ Performance Recommendations')
          recommendations.forEach(rec => console.warn(rec))
          console.groupEnd()
        }
      }

      // In production, you would send these metrics to your analytics service
      // Example: analytics.track('performance_metrics', metrics)
    }

    // Start measuring when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', measureWebVitals)
    } else {
      measureWebVitals()
    }

    // Cleanup
    return () => {
      document.removeEventListener('DOMContentLoaded', measureWebVitals)
    }
  }, [])

  return null // This component doesn't render anything
}

// Hook for manual performance tracking
export function usePerformanceTracking() {
  const trackPageLoad = (pageName: string) => {
    if (typeof window !== 'undefined' && window.performance) {
      const loadTime = performance.now()
      console.log(`📊 ${pageName} loaded in ${loadTime.toFixed(2)}ms`)
    }
  }

  const trackUserInteraction = (action: string) => {
    if (typeof window !== 'undefined' && window.performance) {
      const timestamp = performance.now()
      console.log(`👆 User interaction: ${action} at ${timestamp.toFixed(2)}ms`)
    }
  }

  return { trackPageLoad, trackUserInteraction }
}