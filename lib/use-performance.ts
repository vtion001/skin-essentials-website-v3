'use client'

import { useEffect, useCallback, useRef } from 'react'

// Throttle function for performance optimization
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null
  let lastExecTime = 0
  
  return (...args: Parameters<T>) => {
    const currentTime = Date.now()
    
    if (currentTime - lastExecTime > delay) {
      func(...args)
      lastExecTime = currentTime
    } else {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        func(...args)
        lastExecTime = Date.now()
      }, delay - (currentTime - lastExecTime))
    }
  }
}

// Debounce function for performance optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

// Custom hook for optimized scroll handling
export function useOptimizedScroll(
  callback: (scrollY: number) => void,
  deps: any[] = []
) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    const handleScroll = throttle(() => {
      callbackRef.current(window.scrollY)
    }, 16) // ~60fps

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, deps)
}

// Custom hook for intersection observer with performance optimizations
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  callback: (isIntersecting: boolean) => void,
  options: IntersectionObserverInit = {}
) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          callbackRef.current(entry.isIntersecting)
        })
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [elementRef, options.threshold, options.rootMargin])
}

// Performance monitoring utilities
export function measurePerformance(name: string, fn: () => void) {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const start = performance.now()
    fn()
    const end = performance.now()
    console.log(`${name} took ${end - start} milliseconds`)
  } else {
    fn()
  }
}

// Preload critical resources
export function preloadResource(href: string, as: string) {
  if (typeof document !== 'undefined') {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = href
    link.as = as
    document.head.appendChild(link)
  }
}

// Lazy load images with intersection observer
export function useLazyImage(
  imageRef: React.RefObject<HTMLImageElement>,
  src: string,
  placeholder?: string
) {
  useEffect(() => {
    const imageElement = imageRef.current
    if (!imageElement) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            img.src = src
            img.classList.remove('opacity-0')
            img.classList.add('opacity-100')
            observer.unobserve(img)
          }
        })
      },
      { threshold: 0.1, rootMargin: '50px' }
    )

    if (placeholder) {
      imageElement.src = placeholder
    }
    imageElement.classList.add('opacity-0', 'transition-opacity', 'duration-300')
    observer.observe(imageElement)

    return () => observer.disconnect()
  }, [imageRef, src, placeholder])
}