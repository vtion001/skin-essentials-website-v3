import { NextRequest, NextResponse } from 'next/server';
import { validateSystemRequest, unauthorizedResponse } from '@/lib/system-auth';
import { getSystemHealth } from '@/lib/system-monitor';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!validateSystemRequest(req)) {
    return unauthorizedResponse();
  }

  const data = await getSystemHealth();
  return NextResponse.json(data);
}