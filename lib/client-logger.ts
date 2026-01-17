'use client';

type LogLevel = 'info' | 'warn' | 'error';

interface ClientLogOptions {
  context?: string;
  meta?: Record<string, any>;
  level?: LogLevel;
}

/**
 * Send an error to the server for persistent tracking.
 * Safe to use anywhere in client components.
 */
export function reportError(error: unknown, options: ClientLogOptions = {}) {
  // Always log to console for local debugging
  console.error('[Reported Error]:', error);

  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  
  // Fire and forget - don't await this in UI flow
  fetch('/api/system/client-log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      context: options.context || 'client_app',
      message,
      stack,
      meta: {
        ...options.meta,
        level: options.level || 'error',
        path: typeof window !== 'undefined' ? window.location.pathname : 'server-render'
      }
    })
  }).catch(e => console.warn('Failed to send error report:', e));
}
