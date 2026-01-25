'use client'

import { useRef } from 'react'
import { usePathname } from 'next/navigation'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export function MorphingBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const pathname = usePathname()
  
  // Brand Colors: Soft Rose and Muted Tan
  const colors = ['#fbc6c5', '#d09d80', '#fbc6c5', '#d09d80']
  const numPaths = colors.length
  const numPoints = 6 // Fewer points for smoother, simpler waves
  
  useGSAP(() => {
    if (!svgRef.current) return

    const paths = Array.from(svgRef.current.querySelectorAll('path'))
    
    // UI/UX Decision: Use point objects for a "Liquid Horizon" look
    // Instead of full screen, we keep the wave in a subtle band
    const allPoints: { y: number }[][] = []
    for (let i = 0; i < numPaths; i++) {
      const points = []
      for (let j = 0; j < numPoints; j++) {
        // Start at 95% height (bottom anchor)
        points.push({ y: 95 }) 
      }
      allPoints.push(points)
    }

    const render = () => {
      paths.forEach((path, i) => {
        const points = allPoints[i]
        let d = `M 0 ${points[0].y} C`
        
        for (let j = 0; j < numPoints - 1; j++) {
          const p = (j + 1) / (numPoints - 1) * 100
          const cp = p - (1 / (numPoints - 1) * 100) / 2
          d += ` ${cp} ${points[j].y} ${cp} ${points[j+1].y} ${p} ${points[j+1].y}`
        }
        
        // Close the shape at the bottom to create a rising/falling floor
        d += ` V 100 H 0 Z` 
        path.setAttribute('d', d)
      })
    }

    // Scrub is set higher (3) to make the animation feel "heavy" and premium
    const tl = gsap.timeline({
      onUpdate: render,
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 3, 
        invalidateOnRefresh: true
      }
    })

    // Create 6 slow undulating "Atmospheric Shifts" throughout the page
    const totalMovements = 6
    for (let m = 0; m < totalMovements; m++) {
      const startTime = m * 2
      
      allPoints.forEach((points, i) => {
        const pathDelay = i * 0.2
        
        // Wave rises slightly (only up to 70-85% height to avoid covering text)
        points.forEach((pt, j) => {
          const pointDelay = Math.random() * 0.5
          tl.to(pt, {
            y: 70 + (Math.random() * 15),
            duration: 1.5,
            ease: "sine.inOut"
          }, startTime + pathDelay + pointDelay)
        })
        
        // Wave falls back
        points.forEach((pt, j) => {
          const pointDelay = Math.random() * 0.5
          tl.to(pt, {
            y: 95 + (Math.random() * 5),
            duration: 1.5,
            ease: "sine.inOut"
          }, startTime + pathDelay + pointDelay + 1.2)
        })
      })
    }

    ScrollTrigger.refresh()

  }, { scope: containerRef, dependencies: [pathname] })

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden" 
      style={{ zIndex: 0 }} // Moved to background
    >
      <svg
        ref={svgRef}
        className="w-full h-full opacity-[0.06] dark:opacity-[0.03] mix-blend-multiply dark:mix-blend-screen"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {colors.map((color, i) => (
          <path key={i} fill={color} />
        ))}
      </svg>
    </div>
  )
}