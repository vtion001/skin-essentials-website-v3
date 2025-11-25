'use client'

import Image from 'next/image'
import { useState, useRef } from 'react'
import { useIntersectionObserver } from '@/lib/use-performance'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  sizes?: string
  fill?: boolean
  quality?: number
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  placeholder = 'empty',
  blurDataURL,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  fill = false,
  quality = 85,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(priority)
  const imageRef = useRef<HTMLDivElement>(null)

  useIntersectionObserver(
    imageRef as React.RefObject<Element>,
    (inView) => {
      if (inView && !isInView) {
        setIsInView(true)
      }
    },
    { threshold: 0.1, rootMargin: '50px' }
  )

  const handleLoad = () => {
    setIsLoaded(true)
  }

  const imageProps = {
    src,
    alt,
    quality,
    onLoad: handleLoad,
    className: `transition-opacity duration-300 ${
      isLoaded ? 'opacity-100' : 'opacity-0'
    } ${className}`,
    sizes,
    ...props,
  }

  return (
    <div ref={imageRef} className={`relative ${fill ? 'w-full h-full' : ''}`}>
      {(isInView || priority) && (
        <>
          {fill ? (
            <Image
              {...imageProps}
              alt={alt}
              fill
              priority={priority}
              placeholder={placeholder}
              blurDataURL={blurDataURL}
            />
          ) : (
            <Image
              {...imageProps}
              alt={alt}
              width={width}
              height={height}
              priority={priority}
              placeholder={placeholder}
              blurDataURL={blurDataURL}
            />
          )}
        </>
      )}
      {!isLoaded && (isInView || priority) && (
        <div
          className={`absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse ${
            fill ? 'w-full h-full' : ''
          }`}
          style={!fill ? { width, height } : undefined}
        />
      )}
    </div>
  )
}

// Optimized background image component
export function OptimizedBackgroundImage({
  src,
  alt,
  className = '',
  children,
  priority = false,
}: {
  src: string
  alt: string
  className?: string
  children?: React.ReactNode
  priority?: boolean
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        priority={priority}
        className="object-cover"
        sizes="100vw"
      />
      {children && (
        <div className="relative z-10">
          {children}
        </div>
      )}
    </div>
  )
}
