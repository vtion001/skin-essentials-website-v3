'use server';

const SYSTEM_MONITOR_KEY = process.env.SYSTEM_MONITOR_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function fetchSystemHealth() {
  try {
    const res = await fetch(`${BASE_URL}/api/system/health`, {
      headers: {
        'Authorization': `Bearer ${SYSTEM_MONITOR_KEY}`,
        'Cache-Control': 'no-cache'
      },
      cache: 'no-store'
    });
    
    if (!res.ok) throw new Error(`Status: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Fetch health failed:', error);
    return { status: 'error', error: String(error) };
  }
}

export async function fetchSystemLogs(type: 'error' | 'audit' = 'error', search: string = '') {
  try {
    const res = await fetch(`${BASE_URL}/api/system/logs?type=${type}&search=${encodeURIComponent(search)}`, {
      headers: {
        'Authorization': `Bearer ${SYSTEM_MONITOR_KEY}`,
      },
      cache: 'no-store'
    });

    if (!res.ok) throw new Error(`Status: ${res.status}`);
    return await res.json();
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
