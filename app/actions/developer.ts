'use server';

import { getSystemHealth, getSystemLogs } from '@/lib/system-monitor';

export async function fetchSystemHealth() {
  try {
    const data = await getSystemHealth();
    return data;
  } catch (error) {
    console.error('Fetch health failed:', error);
    return { status: 'error', error: String(error) };
  }
}

export async function fetchSystemLogs(type: 'error' | 'audit' = 'error', search: string = '') {
  try {
    const data = await getSystemLogs(50, 0, search, type);
    return data;
  } catch (error) {
    console.error('Fetch logs failed:', error);
    return { data: [], error: String(error) };
  }
}

export async function triggerTestError() {
  // This is just a helper to test the logger
  const { logError } = await import('@/lib/error-logger');
  await logError('TEST_CONTEXT', new Error('This is a test error triggered from the Developer Hub'), { user: 'admin' });
  return { success: true };
}

export async function simulateClientError() {
  // Simulate a report coming from the frontend
  const { logError } = await import('@/lib/error-logger');
  await logError('client_test_simulation', new Error('Simulated Client Crash'), { 
    path: '/admin/developer',
    browser: 'Simulator',
    timestamp: new Date().toISOString()
  });
  return { success: true };
}

export async function testSlack() {
  const { sendSlackAlert } = await import('@/lib/slack-service');
  await sendSlackAlert('✅ Slack Integration Verified!', {
    status: 'Success',
    message: 'The Developer Hub is now connected to this Slack channel.',
    timestamp: new Date().toISOString()
  });
  return { success: true };
}

export async function simulateActivity() {
  const { logActivity } = await import('@/lib/audit-logger');
  await logActivity('NAVIGATE', 'Developer Hub', { 
    view: 'Activity Test', 
    userAgent: 'Simulator' 
  });
  return { success: true };
}

export async function trackActivity(action: string, resource: string, details?: any) {
  const { logActivity } = await import('@/lib/audit-logger');
  await logActivity(action, resource, details);
  return { success: true };
}