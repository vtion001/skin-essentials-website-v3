import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdminClient } from '@/lib/supabase-admin';
import { validateSystemRequest, unauthorizedResponse } from '@/lib/system-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!validateSystemRequest(req)) {
    return unauthorizedResponse();
  }

  const startTime = Date.now();
  
  // Check Database Connection
  let dbStatus = 'unknown';
  let dbLatency = 0;
  
  try {
    const dbStart = Date.now();
    const { count, error } = await supabaseAdminClient()
      .from('audit_logs')
      .select('*', { count: 'exact', head: true });
      
    if (error) throw error;
    dbLatency = Date.now() - dbStart;
    dbStatus = 'healthy';
  } catch (err) {
    dbStatus = 'unhealthy';
    console.error('Health check DB error:', err);
  }

  const memoryUsage = process.memoryUsage();

  return NextResponse.json({
    status: dbStatus === 'healthy' ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    system: {
      uptime: process.uptime(),
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024) + 'MB',
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
      }
    },
    services: {
      database: {
        status: dbStatus,
        latency: `${dbLatency}ms`
      }
    },
    meta: {
      duration: `${Date.now() - startTime}ms`
    }
  });
}
