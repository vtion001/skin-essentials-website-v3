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