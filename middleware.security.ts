import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Global security headers configuration
const securityHeaders = {
  // Content Security Policy to prevent XSS attacks
  'Content-Security-Policy': [
    // Allow same origin for scripts and styles
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://checkout.stripe.com https://js.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cloudinary.com",
    "img-src 'self' data: https: blob: https://res.cloudinary.com https://images.unsplash.com https://*.stripe.com",
    "media-src 'self' https://res.cloudinary.com blob: data:",
    "font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com",
    "connect-src 'self' https://api.supabase.co https://www.google-analytics.com https://www.googletagmanager.com https://checkout.stripe.com https://api.stripe.com ws://localhost:*",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://checkout.stripe.com",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
    // Trusted types for DOM XSS protection
    "require-trusted-types-for 'script'",
    // Report-only for monitoring
    "report-uri /api/csp-report"
  ].join('; '),

  // HTTP Strict Transport Security (HSTS)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

  // Cross-Origin-Opener-Policy (COOP) for origin isolation
  'Cross-Origin-Opener-Policy': 'same-origin',

  // Clickjacking protection
  'X-Frame-Options': 'DENY',

  // MIME type sniffing protection
  'X-Content-Type-Options': 'nosniff',

  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions policy for browser features
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()',
    'autoplay=(self)',
    'fullscreen=(self)',
    'picture-in-picture=(self)'
  ].join(),

  // CORS headers
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400'
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  response.headers.set('x-middleware-debug-security', 'true')

  // Add security headers to all responses (except admin routes which have their own middleware)
  if (!request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/api/admin')) {
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes) - these will be handled by admin middleware if needed
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
    */
    '/((?!api|_next/static|_next/image|favicon.ico|admin).*)',
  ],
}