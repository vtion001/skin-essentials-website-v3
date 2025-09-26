'use client'

import { useEffect } from 'react'

interface SmoothScrollProps {
  children: React.ReactNode
  offset?: number
  duration?: number
}

export function SmoothScroll({ children, offset = 100, duration = 800 }: SmoothScrollProps) {
  useEffect(() => {
    // Enhanced smooth scrolling for anchor links
    const handleAnchorClick = (e: Event) => {
      const target = e.target as HTMLAnchorElement
      if (target.tagName === 'A' && target.hash) {
        const href = target.getAttribute('href')
        if (href?.startsWith('#')) {
          e.preventDefault()
          const targetElement = document.querySelector(href)
          if (targetElement) {
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset
            
            // Use requestAnimationFrame for smooth animation
            const startPosition = window.pageYOffset
            const distance = targetPosition - startPosition
            let startTime: number | null = null

            const animation = (currentTime: number) => {
              if (startTime === null) startTime = currentTime
              const timeElapsed = currentTime - startTime
              const progress = Math.min(timeElapsed / duration, 1)
              
              // Easing function for smooth animation
              const ease = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
              
              window.scrollTo(0, startPosition + distance * ease(progress))
              
              if (progress < 1) {
                requestAnimationFrame(animation)
              }
            }
            
            requestAnimationFrame(animation)
          }
        }
      }
    }

    // Add event listener for anchor clicks
    document.addEventListener('click', handleAnchorClick)
    
    // Add smooth scroll class to html element
    document.documentElement.classList.add('smooth-scroll')

    return () => {
      document.removeEventListener('click', handleAnchorClick)
      document.documentElement.classList.remove('smooth-scroll')
    }
  }, [offset, duration])

  return <>{children}</>
}

// Hook for programmatic smooth scrolling
export function useSmoothScroll() {
  const scrollToElement = (elementId: string, offset = 100) => {
    const element = document.getElementById(elementId)
    if (element) {
      const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      })
    }
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return { scrollToElement, scrollToTop }
}