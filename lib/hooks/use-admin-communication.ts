import { useState, useCallback } from 'react'

export interface EmailPreview {
  id: string
  from: string
  to: string
  subject: string
  snippet: string
}

export interface SmsStatus {
  configured: boolean
  sender?: string
  provider?: string
  status?: string
  balance?: string
}

export function useAdminCommunication() {
  const [emailPreview, setEmailPreview] = useState<EmailPreview[]>([])
  const [emailLoading, setEmailLoading] = useState(false)
  const [smsStatus, setSmsStatus] = useState<SmsStatus | null>(null)

  const refreshEmailPreview = useCallback(async () => {
    try {
      setEmailLoading(true)
      const resp = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list' })
      })
      const j = await resp.json()
      if (j?.ok && Array.isArray(j.messages)) {
        setEmailPreview(j.messages)
      }
    } catch (error) {
      console.error('Failed to refresh email preview:', error)
    } finally {
      setEmailLoading(false)
    }
  }, [])

  const refreshSmsStatus = useCallback(async () => {
    try {
      const r = await fetch('/api/sms')
      const j = await r.json()
      setSmsStatus(j)
    } catch (error) {
      console.error('Failed to refresh SMS status:', error)
    }
  }, [])

  return {
    emailPreview,
    emailLoading,
    refreshEmailPreview,
    smsStatus,
    refreshSmsStatus
  }
}
