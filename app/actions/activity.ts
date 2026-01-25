'use server';

import { logActivity } from '@/lib/audit-logger';

interface ActionResult<T = null> {
  success: boolean;
  data?: T;
  error?: string;
}

interface ActivityDetails {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Tracks user activity across the admin dashboard.
 * This is called from client components to log administrative actions.
 * 
 * @param action - The action type (e.g., 'CREATE_SERVICE', 'DELETE_STAFF')
 * @param resource - The resource being acted upon (e.g., 'Staff Management')
 * @param details - Optional structured details about the action
 */
export async function trackActivity(
  action: string,
  resource: string,
  details?: ActivityDetails
): Promise<ActionResult> {
  try {
    await logActivity(action, resource, details);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to track activity';
    console.error('Track activity failed:', error);
    return { success: false, error: message };
  }
}
