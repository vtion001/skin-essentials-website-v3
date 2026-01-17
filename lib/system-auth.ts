import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_MONITOR_KEY = process.env.SYSTEM_MONITOR_KEY;

export function validateSystemRequest(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  
  // Allow if running locally in development without a key (optional, for ease of testing)
  // But generally, require the key.
  if (!SYSTEM_MONITOR_KEY) {
    // If no key is set in env, fail secure (or allow in dev? let's fail secure)
    if (process.env.NODE_ENV === 'development') return true; 
    return false;
  }

  if (!authHeader || authHeader !== `Bearer ${SYSTEM_MONITOR_KEY}`) {
    return false;
  }

  return true;
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized: Invalid System Monitor Key' }, { status: 401 });
}
