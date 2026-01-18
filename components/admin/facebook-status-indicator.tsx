'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Facebook, CheckCircle, AlertTriangle } from 'lucide-react'
import { socialMediaService } from '@/lib/admin-services'
import { facebookAPI } from '@/lib/facebook-api'

export function FacebookStatusIndicator() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking')
  const [message, setMessage] = useState('Checking Facebook connection…')
  const timer = useRef<NodeJS.Timeout | null>(null)

  const check = useMemo(
    () => async () => {
      try {
        let connections = socialMediaService.getPlatformConnections().filter(c => c.platform === 'facebook')
        if (connections.length === 0) {
          try {
            const stored = localStorage.getItem('facebook_connection')
            if (stored) {
              const data = JSON.parse(stored)
              const pages = Array.isArray(data.pages) ? data.pages : []
              pages.forEach((page: any) => {
                socialMediaService.addPlatformConnection({
                  platform: 'facebook',
                  pageId: page.id,
                  pageName: page.name,
                  accessToken: page.access_token,
                  isConnected: true,
                  lastSyncTimestamp: new Date().toISOString(),
                  webhookVerified: false
                })
              })
              connections = socialMediaService.getPlatformConnections().filter(c => c.platform === 'facebook')
            }
          } catch (rebuildErr) {
            console.error('[FB_STATUS] rebuild from storage failed', rebuildErr)
          }
        }
        if (connections.length === 0) {
          setStatus('disconnected')
          setMessage('Not connected to Facebook')
          return
        }
        const active = connections.find(c => c.isConnected)
        if (!active) {
          setStatus('disconnected')
          setMessage('Facebook disconnected')
          return
        }
        // If token missing, try to fetch a page token using stored user token
        if (!active.accessToken || active.accessToken.trim() === '') {
          try {
            const stored = localStorage.getItem('facebook_connection')
            const userToken = stored ? JSON.parse(stored).accessToken : ''
            if (userToken) {
              const pageTokenRes = await facebookAPI.getPageAccessToken(userToken, active.pageId)
              if (pageTokenRes.accessToken) {
                socialMediaService.updatePlatformConnectionTokenByPageId(active.pageId, pageTokenRes.accessToken)
                active.accessToken = pageTokenRes.accessToken
                console.log('[FB_STATUS] fetched page token')
              } else {
                console.error('[FB_STATUS] failed to fetch page token', pageTokenRes.error)
              }
            } else {
              console.error('[FB_STATUS] user token missing for page token fetch')
            }
          } catch (tokErr) {
            console.error('[FB_STATUS] page token fetch error', tokErr)
          }
        }

        const validation = await facebookAPI.validateAccessToken(active.accessToken)
        if (validation.isValid) {
          setStatus('connected')
          setMessage('Facebook connected')
        } else {
          setStatus('disconnected')
          setMessage('Token invalid; reconnect required')
          console.error('[FB_STATUS] token invalid', validation.error)
        }
      } catch (e: any) {
        setStatus('disconnected')
        setMessage('Status check failed')
        console.error('[FB_STATUS] check error', e?.message || e)
      }
    },
    []
  )

  useEffect(() => {
    setTimeout(() => { check() }, 0)
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'social_connections_data' || e.key === 'facebook_connection') {
        setTimeout(() => { check() }, 0)
      }
    }
    window.addEventListener('storage', onStorage)
    timer.current = setInterval(() => { check() }, 10000)
    return () => {
      window.removeEventListener('storage', onStorage)
      if (timer.current) clearInterval(timer.current)
    }
  }, [check])

  if (status === 'checking') {
    return (
      <Badge title={message} className="bg-gray-200 text-gray-800">
        <Facebook className="w-4 h-4 mr-1" />
        Checking…
      </Badge>
    )
  }

  if (status === 'connected') {
    return (
      <Badge title={message} className="bg-green-500 text-white">
        <CheckCircle className="w-4 h-4 mr-1" />
        Facebook Connected
      </Badge>
    )
  }

  return (
    <Badge title={message} className="bg-red-500 text-white">
      <AlertTriangle className="w-4 h-4 mr-1" />
      Facebook Disconnected
    </Badge>
  )
}
