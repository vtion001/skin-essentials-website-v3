'use client'

import { ComponentType, useEffect, useMemo, useState } from 'react'

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
  const [Comp, setComp] = useState<T | null>(null)
  const [err, setErr] = useState<Error | null>(null)
  useEffect(() => {
    let cancelled = false
    loader()
      .then((mod: { default: T }) => { if (!cancelled) setComp(mod.default) })
      .catch((e: unknown) => { if (!cancelled) setErr(e instanceof Error ? e : new Error(String(e))) })
    return () => { cancelled = true }
  }, [loader])

  const LoadingComponent = useMemo(() => loading || EnhancedLoading, [loading])

  if (err && error) {
    const ErrorComponent = error
    return <ErrorComponent error={err} retry={() => setErr(null)} />
  }
  if (!Comp) {
    const LC = LoadingComponent as ComponentType
    return <LC />
  }
  const C = Comp as ComponentType<any>
  return <C {...props} />
}

// Preload function for critical components
export function preloadComponent<T>(loader: () => Promise<{ default: T }>) {
  // Preload the component
  loader()
}

// Hook for intersection-based lazy loading
export function useLazyLoad<T extends ComponentType<any>>(
  loader: () => Promise<{ default: T }>,
  _options: IntersectionObserverInit = {}
) {
  return function LazyLoadedComponent(props: React.ComponentProps<T>) {
    const [Comp, setComp] = useState<T | null>(null)
    useEffect(() => {
      let cancelled = false
      loader().then((mod: { default: T }) => { if (!cancelled) setComp(mod.default) })
      return () => { cancelled = true }
    }, [loader])
    if (!Comp) return <EnhancedLoading />
    const C = Comp as ComponentType<any>
    return <C {...props} />
  }
}

// Utility for creating route-based code splits
export function createRouteComponent<T extends ComponentType<any>>(
  loader: () => Promise<{ default: T }>,
  LoadingComponent?: ComponentType
) {
  return function WrappedRouteComponent(props: React.ComponentProps<T>) {
    const [Comp, setComp] = useState<T | null>(null)
    useEffect(() => {
      let cancelled = false
      loader().then((mod: { default: T }) => { if (!cancelled) setComp(mod.default) })
      return () => { cancelled = true }
    }, [loader])
    if (!Comp) {
      const LC = LoadingComponent || ((p: any) => <EnhancedLoading showSkeleton={false} {...p} />)
      const L = LC as ComponentType
      return <L />
    }
    const C = Comp as ComponentType<any>
    return <C {...props} />
  }
}
