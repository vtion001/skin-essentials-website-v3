'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface BeforeAfterItem {
  id: string
  title: string
  category: string
  beforeImage: string
  afterImage: string
  description: string
  treatment: string
}

interface BeforeAfterCarouselProps {
  items: BeforeAfterItem[]
  autoPlay?: boolean
  autoPlayInterval?: number
  showControls?: boolean
  className?: string
}

export function BeforeAfterCarousel({
  items,
  autoPlay = true,
  autoPlayInterval = 4000,
  showControls = true,
  className = ''
}: BeforeAfterCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && items.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length)
      }, autoPlayInterval)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, items.length, autoPlayInterval])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length)
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length)
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      goToNext()
    } else if (isRightSwipe) {
      goToPrevious()
    }
  }

  if (!items || items.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-3xl">
        <p className="text-gray-500">No before-and-after photos available</p>
      </div>
    )
  }

  const currentItem = items[currentIndex]

  return (
    <div className={`relative w-full ${className}`}>
      {/* Main Carousel Container */}
      <div 
        className="relative overflow-hidden rounded-3xl bg-white shadow-2xl"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Before & After Images */}
        <div className="relative h-96 md:h-[32rem] lg:h-[36rem]">
          <div className="grid grid-cols-2 h-full">
            {/* Before Image */}
            <div className="relative overflow-hidden">
              <Image
                src={currentItem.beforeImage || "/placeholder.svg"}
                alt={`Before ${currentItem.title}`}
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
                priority
              />
              <div className="absolute top-4 left-4">
                <Badge className="bg-red-500/90 backdrop-blur-sm text-white px-3 py-1 text-sm font-semibold shadow-lg">
                  Before
                </Badge>
              </div>
            </div>

            {/* After Image */}
            <div className="relative overflow-hidden">
              <Image
                src={currentItem.afterImage || "/placeholder.svg"}
                alt={`After ${currentItem.title}`}
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
                priority
              />
              <div className="absolute top-4 right-4">
                <Badge className="bg-green-500/90 backdrop-blur-sm text-white px-3 py-1 text-sm font-semibold shadow-lg">
                  After
                </Badge>
              </div>
            </div>
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
            <div className="max-w-2xl">
              <Badge className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-3 py-1 text-xs font-semibold mb-3">
                {currentItem.category}
              </Badge>
              <h3 className="text-2xl md:text-3xl font-bold mb-2 leading-tight">
                {currentItem.title}
              </h3>
              <p className="text-white/90 text-sm md:text-base leading-relaxed mb-2">
                {currentItem.description}
              </p>
              <p className="text-white/80 text-sm font-medium">
                Treatment: {currentItem.treatment}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {showControls && items.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-0 w-12 h-12 rounded-full shadow-lg transition-all duration-300"
              onClick={goToPrevious}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-0 w-12 h-12 rounded-full shadow-lg transition-all duration-300"
              onClick={goToNext}
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </>
        )}

        {/* Play/Pause Button */}
        {showControls && items.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-0 w-10 h-10 rounded-full shadow-lg transition-all duration-300"
            onClick={togglePlayPause}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
        )}
      </div>

      {/* Dots Indicator */}
      {items.length > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {items.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-rose-500 scale-125'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      )}

      {/* Thumbnail Navigation (for larger screens) */}
      {items.length > 1 && (
        <div className="hidden lg:flex justify-center mt-8 space-x-4 overflow-x-auto pb-4">
          {items.map((item, index) => (
            <button
              key={item.id}
              className={`flex-shrink-0 w-24 h-16 rounded-xl overflow-hidden transition-all duration-300 ${
                index === currentIndex
                  ? 'ring-2 ring-rose-500 scale-105'
                  : 'opacity-60 hover:opacity-80'
              }`}
              onClick={() => goToSlide(index)}
            >
              <div className="grid grid-cols-2 h-full">
                <Image
                  src={item.beforeImage || "/placeholder.svg"}
                  alt={`Before ${item.title}`}
                  width={48}
                  height={64}
                  className="object-cover w-full h-full"
                />
                <Image
                  src={item.afterImage || "/placeholder.svg"}
                  alt={`After ${item.title}`}
                  width={48}
                  height={64}
                  className="object-cover w-full h-full"
                />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {isPlaying && items.length > 1 && (
        <div className="mt-4 w-full bg-gray-200 rounded-full h-1">
          <div 
            className="bg-gradient-to-r from-rose-500 to-pink-500 h-1 rounded-full transition-all duration-100"
            style={{
              width: `${((currentIndex + 1) / items.length) * 100}%`
            }}
          />
        </div>
      )}
    </div>
  )
}