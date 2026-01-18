'use server';

import { getSystemHealth, getSystemLogs } from '@/lib/system-monitor';
import { logError } from '@/lib/error-logger';
import { logActivity } from '@/lib/audit-logger';
import { sendSlackAlert } from '@/lib/slack-service';

// ============================================================================
// TYPES
// ============================================================================

interface ActionResult<T = null> {
  success: boolean;
  data?: T;
  error?: string;
}

interface SystemHealthData {
  status: string;
  timestamp: string;
  environment: string | undefined;
  system: {
    uptime: number;
    memory: {
      rss: string;
      heapTotal: string;
      heapUsed: string;
    };
  };
  services: {
    database: {
      status: string;
      latency: string;
    };
  };
  meta: {
    duration: string;
  };
}

interface SystemLogsData {
  data: Array<{
    id: string;
    level: string;
    source: string;
    message: string;
    timestamp: string;
    metadata: Record<string, unknown>;
  }>;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

type LogType = 'error' | 'audit' | 'activity';

interface ActivityDetails {
  [key: string]: string | number | boolean | null | undefined;
}

// ============================================================================
// SYSTEM HEALTH & LOGS
// ============================================================================

/**
 * Fetches current system health metrics.
 * Used by the Developer Hub to display database, memory, and service status.
 */
export async function fetchSystemHealth(): Promise<ActionResult<SystemHealthData>> {
  try {
    const data = await getSystemHealth();
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Fetch health failed:', error);
    return { success: false, error: message };
  }
}

/**
 * Fetches system logs with optional filtering.
 * Supports error, audit, and activity log types.
 */
export async function fetchSystemLogs(
  type: LogType = 'error',
  search: string = ''
): Promise<ActionResult<SystemLogsData>> {
  try {
    const data = await getSystemLogs(50, 0, search, type);
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Fetch logs failed:', error);
    return { success: false, error: message };
  }
}

// ============================================================================
// TEST & SIMULATION ACTIONS
// ============================================================================

/**
 * Triggers a test error for logging verification.
 * Creates an entry in error_logs and sends a Slack notification.
 */
export async function triggerTestError(): Promise<ActionResult> {
  try {
    await logError(
      'TEST_CONTEXT',
      new Error('This is a test error triggered from the Developer Hub'),
      { user: 'admin' }
    );
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to trigger test error';
    return { success: false, error: message };
  }
}

/**
 * Simulates a client-side error report.
 * Used for testing the error reporting pipeline from frontend to backend.
 */
export async function simulateClientError(): Promise<ActionResult> {
  try {
    await logError('client_test_simulation', new Error('Simulated Client Crash'), {
      path: '/admin/developer',
      browser: 'Simulator',
      timestamp: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to simulate client error';
    return { success: false, error: message };
  }
}

/**
 * Tests the Slack webhook integration.
 * Sends a verification message to the configured Slack channel.
 */
export async function testSlack(): Promise<ActionResult> {
  try {
    await sendSlackAlert('✅ Slack Integration Verified!', {
      status: 'Success',
      message: 'The Developer Hub is now connected to this Slack channel.',
      timestamp: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send Slack alert';
    return { success: false, error: message };
  }
}

/**
 * Simulates an activity log entry.
 * Used for testing the audit logging pipeline.
 */
export async function simulateActivity(): Promise<ActionResult> {
  try {
    await logActivity('NAVIGATE', 'Developer Hub', {
      view: 'Activity Test',
      userAgent: 'Simulator',
    });
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to simulate activity';
    return { success: false, error: message };
  }
}

// ============================================================================
// ACTIVITY TRACKING
// ============================================================================

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
    return { success: false, error: message };
  }
}