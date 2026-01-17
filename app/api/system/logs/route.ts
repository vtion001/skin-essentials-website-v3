import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdminClient } from '@/lib/supabase-admin';
import { validateSystemRequest, unauthorizedResponse } from '@/lib/system-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!validateSystemRequest(req)) {
    return unauthorizedResponse();
  }

  const searchParams = req.nextUrl.searchParams;
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');
  const search = searchParams.get('search') || '';
  const type = searchParams.get('type') || 'error'; // 'error' or 'audit'

  const supabase = supabaseAdminClient();

  try {
    let data = [];
    let count = 0;

    if (type === 'audit') {
      let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .order('timestamp', { ascending: false })
        .range(offset, offset + limit - 1);

      if (search) {
        query = query.or(`action.ilike.%${search}%,resource.ilike.%${search}%`);
      }
      
      const result = await query;
      data = result.data || [];
      count = result.count || 0;

    } else {
      // Default to error logs
      let query = supabase
        .from('error_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (search) {
        query = query.or(`message.ilike.%${search}%,context.ilike.%${search}%`);
      }

      const result = await query;
      data = result.data || [];
      count = result.count || 0;
    }

    // Standardize the response format
    const standardizedLogs = data.map(log => {
      if (type === 'audit') {
        return {
          id: log.id,
          level: 'INFO', // Audit logs are generally info
          source: log.resource,
          message: `${log.action} - ${log.details ? JSON.stringify(log.details).substring(0, 100) : ''}`,
          timestamp: log.timestamp,
          metadata: {
            user_id: log.user_id,
            ip: log.ip_address,
            status: log.status
          }
        };
      } else {
        return {
          id: log.id,
          level: 'ERROR', // error_logs are errors
          source: log.context,
          message: log.message,
          timestamp: log.created_at,
          metadata: {
            stack: log.stack,
            meta: log.meta
          }
        };
      }
    });

    return NextResponse.json({
      data: standardizedLogs,
      pagination: {
        total: count,
        limit,
        offset,
        hasMore: offset + limit < count
      }
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
