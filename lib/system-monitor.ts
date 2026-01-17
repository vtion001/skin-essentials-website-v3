import { supabaseAdminClient } from '@/lib/supabase-admin';

export async function getSystemHealth() {
  const startTime = Date.now();
  
  // Check Database Connection
  let dbStatus = 'unknown';
  let dbLatency = 0;
  
  try {
    const supabase = supabaseAdminClient();
    if (!supabase) {
      dbStatus = 'unhealthy';
    } else {
      const dbStart = Date.now();
      const { error } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true });
        
      if (error) throw error;
      dbLatency = Date.now() - dbStart;
      dbStatus = 'healthy';
    }
  } catch (err) {
    dbStatus = 'unhealthy';
    console.error('Health check DB error:', err);
  }

  const memoryUsage = process.memoryUsage();

  return {
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
  };
}

export async function getSystemLogs(limit: number = 50, offset: number = 0, search: string = '', type: string = 'error') {
  const supabase = supabaseAdminClient();
  if (!supabase) throw new Error('Supabase client not available');

  try {
    let data: any[] = [];
    let count: number = 0;

    if (type === 'audit' || type === 'activity') {
      let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .order('timestamp', { ascending: false })
        .range(offset, offset + limit - 1);

      // If activity, only show ACTIVITY status. If audit, show SUCCESS/FAILURE (security)
      if (type === 'activity') {
        query = query.eq('status', 'ACTIVITY');
      } else {
        query = query.neq('status', 'ACTIVITY');
      }

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
    const standardizedLogs = data.map((log: any) => {
      if (type === 'audit' || type === 'activity') {
        return {
          id: log.id,
          level: type === 'activity' ? 'INFO' : (log.status === 'FAILURE' ? 'ERROR' : 'SUCCESS'),
          source: log.resource,
          message: `${log.action} ${log.resource_id ? `(${log.resource_id})` : ''}`,
          timestamp: log.timestamp,
          metadata: {
            details: log.details,
            user_id: log.user_id,
            ip: log.ip_address,
            status: log.status
          }
        };
      } else {
        // Determine level based on context
        let level = 'ERROR';
        if (['sms_outbound', 'sms_schedule_active', 'sms_log'].includes(log.context)) {
          level = 'INFO';
        } else if (log.context === 'admin_login' && log.message.includes('Invalid')) {
          level = 'WARN';
        }

        return {
          id: log.id,
          level: level,
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

    return {
      data: standardizedLogs,
      pagination: {
        total: count,
        limit,
        offset,
        hasMore: offset + limit < count
      }
    };

  } catch (err: any) {
    console.error('getSystemLogs error:', err);
    throw new Error(err.message);
  }
}