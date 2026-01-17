import { NextRequest, NextResponse } from 'next/server';
import { validateSystemRequest, unauthorizedResponse } from '@/lib/system-auth';
import { getSystemLogs } from '@/lib/system-monitor';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!validateSystemRequest(req)) {
    return unauthorizedResponse();
  }

  const searchParams = req.nextUrl.searchParams;
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');
  const search = searchParams.get('search') || '';
  const type = searchParams.get('type') || 'error';

  try {
    const data = await getSystemLogs(limit, offset, search, type);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}