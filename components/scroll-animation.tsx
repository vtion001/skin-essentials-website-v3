'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { cn } from '@/lib/utils'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface ScrollAnimationProps {
  children: React.ReactNode
  className?: string
  animation?: 'fade-up' | 'fade-in' | 'slide-in-right' | 'scale-up'
  delay?: number
  duration?: number
  stagger?: number
  threshold?: number // 0 to 1, how much of the element must be visible
  once?: boolean
}

export function ScrollAnimation({
  children,
  className,
  animation = 'fade-up',
  delay = 0,
  duration = 0.8,
  stagger = 0,
  threshold = 0.1,
  once = true
}: ScrollAnimationProps) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const element = ref.current
    if (!element) return

    const scrollTriggerVars = {
      trigger: element,
      start: `top ${100 - (threshold * 100)}%`, // e.g., "top 90%"
      toggleActions: once ? 'play none none none' : 'play none none reverse',
    }

    let fromVars: gsap.TweenVars = { duration: duration, delay: delay, ease: 'power3.out' }
    let toVars: gsap.TweenVars = { duration: duration, delay: delay, ease: 'power3.out' }

    switch (animation) {
      case 'fade-up':
        fromVars = { ...fromVars, y: 50, autoAlpha: 0 }
        toVars = { ...toVars, y: 0, autoAlpha: 1 }
        break
      case 'fade-in':
        fromVars = { ...fromVars, autoAlpha: 0 }
        toVars = { ...toVars, autoAlpha: 1 }
        break
      case 'slide-in-right':
        fromVars = { ...fromVars, x: 50, autoAlpha: 0 }
        toVars = { ...toVars, x: 0, autoAlpha: 1 }
        break
       case 'scale-up':
        fromVars = { ...fromVars, scale: 0.95, autoAlpha: 0 }
        toVars = { ...toVars, scale: 1, autoAlpha: 1 }
        break
    }

    if (stagger > 0 && element.children.length > 0) {
       // Animate children if stagger is set
       gsap.fromTo(Array.from(element.children), 
         fromVars,
         {
           ...toVars,
           stagger: stagger,
           scrollTrigger: scrollTriggerVars
         }
       )
    } else {
       // Animate self
       gsap.fromTo(element, 
         fromVars,
         {
           ...toVars,
           scrollTrigger: scrollTriggerVars
         }
       )
    }

  }, { scope: ref })

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  )
}
