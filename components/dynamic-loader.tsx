'use client'

import { Suspense, lazy, ComponentType } from 'react'

// Custom skeleton component
function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded ${className}`} />
}

// Loading skeleton component
function LoadingSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  )
}

// Enhanced loading component with better UX
function EnhancedLoading({ 
  message = 'Loading...', 
  className = '',
  showSkeleton = true 
}: { 
  message?: string
  className?: string
  showSkeleton?: boolean
}) {
  return (
    <div className={`flex flex-col items-center justify-center min-h-[200px] ${className}`}>
      {showSkeleton ? (
        <LoadingSkeleton className="w-full max-w-md" />
      ) : (
        <>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground text-sm">{message}</p>
        </>
      )}
    </div>
  )
}

// Dynamic import wrapper with error boundary
export function DynamicComponent<T extends ComponentType<any>>({
  loader,
  loading,
  error,
  ...props
}: {
  loader: () => Promise<{ default: T }>
  loading?: ComponentType
  error?: ComponentType<{ error: Error; retry: () => void }>
} & React.ComponentProps<T>) {
  const LazyComponent = lazy(loader)
  
  const LoadingComponent = loading || (() => <EnhancedLoading />)
  
  return (
    <Suspense fallback={<LoadingComponent />}>
      <LazyComponent {...props} />
    </Suspense>
  )
}

// Preload function for critical components
export function preloadComponent<T>(loader: () => Promise<{ default: T }>) {
  // Preload the component
  loader()
}

// Hook for intersection-based lazy loading
export function useLazyLoad<T extends ComponentType<any>>(
  loader: () => Promise<{ default: T }>,
  options: IntersectionObserverInit = {}
) {
  const LazyComponent = lazy(loader)
  
  return function LazyLoadedComponent(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={<EnhancedLoading />}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}

// Utility for creating route-based code splits
export function createRouteComponent<T extends ComponentType<any>>(
  loader: () => Promise<{ default: T }>,
  LoadingComponent?: ComponentType
) {
  const RouteComponent = lazy(loader)
  
  return function WrappedRouteComponent(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={LoadingComponent ? <LoadingComponent /> : <EnhancedLoading showSkeleton={false} />}>
        <RouteComponent {...props} />
      </Suspense>
    )
  }
}