// Simple test to verify Facebook credentials in Next.js environment
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    facebookAppId: process.env.FACEBOOK_APP_ID || 'not_set',
    facebookAppSecret: process.env.FACEBOOK_APP_SECRET ? 'set' : 'not_set',
    facebookRedirectUri: process.env.FACEBOOK_REDIRECT_URI || 'not_set',
    nextPublicBaseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'not_set',
    nodeEnv: process.env.NODE_ENV || 'not_set'
  });
}