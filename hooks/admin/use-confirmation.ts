import { useCallback } from 'react'

export function useConfirmation() {
  const confirmAction = useCallback((subject: string) => {
    if (typeof window === 'undefined') return false
    if (!window.confirm(`Are you sure you want to delete ${subject}?`)) return false
    if (!window.confirm(`Please confirm deletion of ${subject}. This action cannot be undone.`)) return false
    return true
  }, [])

  return { confirmAction }
}
