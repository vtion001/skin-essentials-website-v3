'use client';

import { useActivityPulse } from "@/hooks/use-activity-pulse";

/**
 * Lightweight client component to initiate global activity tracking.
 * Placed in the root layout.
 */
export function ActivityPulseTracker() {
  useActivityPulse();
  return null;
}
