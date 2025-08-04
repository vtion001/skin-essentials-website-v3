"use client"

import type React from "react"

import { useState, useRef, useCallback, type ReactNode } from "react"

interface SwipeCardsProps {
  children: ReactNode[]
  className?: string
}

export function SwipeCards({ children, className = "" }: SwipeCardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const startX = useRef(0)
  const currentX = useRef(0)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true)
    startX.current = e.touches[0].clientX
  }, [])

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return

      currentX.current = e.touches[0].clientX
      const offset = currentX.current - startX.current
      setDragOffset(offset)
    },
    [isDragging],
  )

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return

    const threshold = 50
    const offset = currentX.current - startX.current

    if (Math.abs(offset) > threshold) {
      if (offset > 0 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1)
      } else if (offset < 0 && currentIndex < children.length - 1) {
        setCurrentIndex(currentIndex + 1)
      }
    }

    setIsDragging(false)
    setDragOffset(0)
    startX.current = 0
    currentX.current = 0
  }, [isDragging, currentIndex, children.length])

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        className="flex transition-transform duration-300 ease-out"
        style={{
          transform: `translateX(${-currentIndex * 100 + (isDragging ? (dragOffset / window.innerWidth) * 100 : 0)}%)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children.map((child, index) => (
          <div key={index} className="w-full flex-shrink-0">
            {child}
          </div>
        ))}
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center space-x-2 mt-4">
        {children.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? "bg-rose-600" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
