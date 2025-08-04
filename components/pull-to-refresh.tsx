"use client"

import type React from "react"

import { useState, useRef, useCallback, type ReactNode } from "react"
import { RefreshCw } from "lucide-react"

interface PullToRefreshProps {
  children: ReactNode
  onRefresh?: () => Promise<void>
}

export function PullToRefresh({ children, onRefresh }: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const startY = useRef(0)
  const currentY = useRef(0)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0 && startY.current > 0) {
      currentY.current = e.touches[0].clientY
      const distance = Math.max(0, currentY.current - startY.current)

      if (distance > 10) {
        setIsPulling(true)
        setPullDistance(Math.min(distance, 100))
      }
    }
  }, [])

  const handleTouchEnd = useCallback(async () => {
    if (isPulling && pullDistance > 60) {
      setIsRefreshing(true)

      if (onRefresh) {
        await onRefresh()
      } else {
        // Default refresh behavior
        await new Promise((resolve) => setTimeout(resolve, 1000))
        window.location.reload()
      }

      setIsRefreshing(false)
    }

    setIsPulling(false)
    setPullDistance(0)
    startY.current = 0
    currentY.current = 0
  }, [isPulling, pullDistance, onRefresh])

  return (
    <div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} className="relative">
      {/* Pull to Refresh Indicator */}
      {(isPulling || isRefreshing) && (
        <div
          className="fixed top-0 left-0 right-0 z-40 bg-rose-50 border-b border-rose-100 transition-all duration-200 ease-out"
          style={{
            height: `${Math.max(pullDistance, isRefreshing ? 60 : 0)}px`,
            transform: `translateY(${isRefreshing ? 0 : -60 + pullDistance}px)`,
          }}
        >
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center space-x-2 text-rose-600">
              <RefreshCw
                className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
                style={{
                  transform: `rotate(${pullDistance * 3.6}deg)`,
                }}
              />
              <span className="text-sm font-medium">
                {isRefreshing ? "Refreshing..." : pullDistance > 60 ? "Release to refresh" : "Pull to refresh"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        className="transition-transform duration-200 ease-out"
        style={{
          transform: `translateY(${isPulling ? pullDistance : 0}px)`,
        }}
      >
        {children}
      </div>
    </div>
  )
}
