import { NextRequest, NextResponse } from 'next/server'
import { socialMediaService } from '@/lib/admin-services'

export async function GET(request: NextRequest) {
  try {
    // Get all platform connections
    const connections = socialMediaService.getPlatformConnections()
    
    // Get all conversations
    const conversations = socialMediaService.getAllConversations()
    
    return NextResponse.json({
      success: true,
      connections,
      conversations,
      connectionCount: connections.length,
      conversationCount: conversations.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Social media status check error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to check social media status',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}