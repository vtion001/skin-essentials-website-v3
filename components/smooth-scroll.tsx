'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register ScrollTrigger
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const SmoothScrollContext = createContext<Lenis | null>(null)

export const useSmoothScrollContext = () => useContext(SmoothScrollContext)

interface SmoothScrollProps {
  children: React.ReactNode
  offset?: number
  duration?: number
}

export function SmoothScroll({ children }: SmoothScrollProps) {
  const [lenis, setLenis] = useState<Lenis | null>(null)

  useEffect(() => {
    const lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 2,
    })

    setLenis(lenisInstance)

    // Sync Lenis with GSAP ScrollTrigger
    lenisInstance.on('scroll', ScrollTrigger.update)

    gsap.ticker.add((time) => {
      lenisInstance.raf(time * 1000)
    })

    gsap.ticker.lagSmoothing(0)
    
    // Force a refresh after a short delay to ensure layout is settled
    setTimeout(() => {
        ScrollTrigger.refresh()
    }, 1000)

    // Handle anchor links
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a')
      if (anchor && anchor.hash && anchor.hash.startsWith('#')) {
        const targetElement = document.querySelector(anchor.hash) as HTMLElement
        if (targetElement) {
          e.preventDefault()
          lenisInstance.scrollTo(targetElement, { offset: -100 })
        }
      }
    }

    document.addEventListener('click', handleAnchorClick)

    return () => {
      lenisInstance.destroy()
      gsap.ticker.remove((time) => {
        lenisInstance.raf(time * 1000)
      })
      document.removeEventListener('click', handleAnchorClick)
    }
  }, [])

  return (
    <SmoothScrollContext.Provider value={lenis}>
      {children}
    </SmoothScrollContext.Provider>
  )
}

// Hook for programmatic smooth scrolling
export function useSmoothScroll() {
  const lenis = useSmoothScrollContext()

  const scrollToElement = (elementId: string, offset = 100) => {
    if (lenis) {
      const element = document.getElementById(elementId)
      if (element) {
        lenis.scrollTo(element, { offset: -offset })
      }
    } else {
      const element = document.getElementById(elementId)
      if (element) {
        const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        })
      }
    }
  }

  const scrollToTop = () => {
    if (lenis) {
      lenis.scrollTo(0)
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  }

  return { scrollToElement, scrollToTop }
}