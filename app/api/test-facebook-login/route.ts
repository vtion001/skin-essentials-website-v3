import { NextResponse } from 'next/server';
import { facebookAPI } from '@/lib/facebook-api';

export async function GET() {
  try {
    const redirectUri = process.env.FACEBOOK_REDIRECT_URI || 'http://localhost:3002/api/auth/facebook';
    const loginUrl = facebookAPI.getLoginUrl(redirectUri);
    
    return NextResponse.json({ 
      success: true, 
      loginUrl,
      redirectUri,
      appId: process.env.FACEBOOK_APP_ID || 'not_set'
    });
  } catch (error) {
    console.error('Error generating Facebook login URL:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to generate login URL' 
    }, { status: 500 });
  }
}