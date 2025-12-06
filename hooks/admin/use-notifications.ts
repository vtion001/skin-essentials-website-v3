import { useState, useCallback } from 'react'

type NotificationType = 'success' | 'error'

interface Notification {
  type: NotificationType
  message: string
}

export function useNotifications() {
  const [notification, setNotification] = useState<Notification | null>(null)

  const showNotification = useCallback((type: NotificationType, message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }, [])

  return {
    notification,
    showNotification
  }
}
