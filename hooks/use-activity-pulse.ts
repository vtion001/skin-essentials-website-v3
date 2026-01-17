'use client';

import { useEffect, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackActivity } from '@/app/actions/developer';

/**
 * Hook to automatically track page views and provide manual tracking methods.
 */
export function useActivityPulse() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Automatic Page View Tracking
  useEffect(() => {
    if (!pathname) return;
    
    const url = searchParams?.toString() 
      ? `${pathname}?${searchParams.toString()}` 
      : pathname;

    trackActivity('PAGE_VIEW', url, {
      timestamp: new Date().toISOString(),
      referrer: typeof document !== 'undefined' ? document.referrer : undefined
    }).catch(() => {}); // Silently fail if tracking is blocked
  }, [pathname, searchParams]);

  // Manual Event Tracker
  const pulse = useCallback(async (action: string, resource: string, details?: any) => {
    return trackActivity(action, resource, details);
  }, []);

  return { pulse };
}
