'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface MorphingBackgroundProps {
  className?: string
}

export function MorphingBackground({ className = '' }: MorphingBackgroundProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useGSAP(() => {
    if (!svgRef.current) return

    // Timeline for morphing animation
    const tl = gsap.timeline({
      repeat: -1,
      defaults: {
        ease: "power2.inOut",
        duration: 0.9
      }
    })

    // Create morphing paths
    const paths = [
      "M 0 50 C 20 20, 80 0, 100 50",
      "M 0 30 C 15 60, 85 10, 100 30",
      "M 0 70 C 25 40, 75 60, 100 70",
      "M 0 20 C 10 50, 90 15, 100 20",
      "M 0 80 C 30 60, 70 70, 100 80"
    ]

    const pathElements = Array.from(svgRef.current?.querySelectorAll('path') || [])

    // Animate each path
    paths.forEach((pathData, index) => {
      const pathElement = pathElements[index]
      
      gsap.set(pathElement, { d: pathData, opacity: 0.3 })
      
      // Add to timeline with stagger
      tl.to(pathElement, {
        opacity: 0.8,
        duration: 0.9,
        ease: "power2.inOut",
        delay: index * 0.25
      })
    })

    // ScrollTrigger integration
    ScrollTrigger.create({
      trigger: ".hero-section",
      start: "top 70%",
      end: "bottom 30%",
      onEnter: () => {
        tl.restart()
      },
      onLeave: () => {
        tl.pause()
      }
    })

  }, { scope: svgRef })

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`} style={{ zIndex: 1 }}>
      <svg
        ref={svgRef}
        className="w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ mixBlendMode: 'screen' }}
      >
        <defs>
          <linearGradient id="morphingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(254, 178, 178, 0.1)" />
            <stop offset="50%" stopColor="rgba(210, 157, 128, 0.05)" />
            <stop offset="100%" stopColor="rgba(217, 119, 6, 0.1)" />
          </linearGradient>
        </defs>
        
        {/* Morphing paths */}
        <path
          d="M 0 50 C 20 20, 80 0, 100 50"
          fill="none"
          stroke="url(#morphingGradient)"
          strokeWidth="1"
          opacity="0.6"
        />
        
        <path
          d="M 0 30 C 15 60, 85 10, 100 30"
          fill="none"
          stroke="url(#morphingGradient)"
          strokeWidth="0.5"
          opacity="0.3"
        />
        
        <path
          d="M 0 70 C 25 40, 75 60, 100 70"
          fill="none"
          stroke="url(#morphingGradient)"
          strokeWidth="0.5"
          opacity="0.3"
        />

        <path
          d="M 0 20 C 10 50, 90 15, 100 20"
          fill="none"
          stroke="url(#morphingGradient)"
          strokeWidth="0.5"
          opacity="0.3"
        />

        <path
          d="M 0 80 C 30 60, 70 70, 100 80"
          fill="none"
          stroke="url(#morphingGradient)"
          strokeWidth="0.5"
          opacity="0.3"
        />
      </svg>
    </div>
  )
}