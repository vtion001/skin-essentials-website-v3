import { NextRequest, NextResponse } from 'next/server';
import { logError } from '@/lib/error-logger';

// Rate limiting map (simple in-memory for demo)
const rateLimit = new Map<string, number>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { context, message, stack, meta } = body;

    // Simple spam protection
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const lastRequest = rateLimit.get(ip) || 0;
    
    if (now - lastRequest < 1000) { // Limit to 1 log per second per IP
      return NextResponse.json({ ignored: true }, { status: 429 });
    }
    rateLimit.set(ip, now);

    // Use our existing server-side logger
    await logError(context || 'client_error', new Error(message), {
      ...meta,
      userAgent: req.headers.get('user-agent'),
      url: req.headers.get('referer'),
      client_stack: stack
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to process client log:', err);
    return NextResponse.json({ error: 'Internal logging error' }, { status: 500 });
  }
}
