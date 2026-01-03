import { useEffect } from 'react'

interface UseAdminEventSyncProps {
  setClientForm: (data: any) => void
  setIsClientModalOpen: (open: boolean) => void
  onBookAppointment: (data: any) => void
  setPaymentForm: (data: any) => void
  setIsPaymentModalOpen: (open: boolean) => void
  isClientModalOpen: boolean
  isPaymentModalOpen: boolean
}

export function useAdminEventSync({
  setClientForm,
  setIsClientModalOpen,
  onBookAppointment,
  setPaymentForm,
  setIsPaymentModalOpen,
  isClientModalOpen,
  isPaymentModalOpen
}: UseAdminEventSyncProps) {

  useEffect(() => {
    try {
      // Check initial state
      const draft = localStorage.getItem('potential_client_draft')
      const link = localStorage.getItem('potential_conversation_id')
      if (draft && link) {
        const data = JSON.parse(draft)
        setClientForm(data)
        setIsClientModalOpen(true)
      }

      // Event handlers
      const onStorage = (e: StorageEvent) => {
        if (e.key === 'potential_client_draft') {
          const d = localStorage.getItem('potential_client_draft')
          const l = localStorage.getItem('potential_conversation_id')
          if (d && l) {
            setClientForm(JSON.parse(d))
            setIsClientModalOpen(true)
          }
        }
        if (e.key === 'payment_draft') {
          const d = localStorage.getItem('payment_draft')
          const l = localStorage.getItem('payment_conversation_id')
          if (d && l) {
            setPaymentForm(JSON.parse(d))
            setIsPaymentModalOpen(true)
          }
        }
      }

      const onCapture = () => {
        const d = localStorage.getItem('potential_client_draft')
        const l = localStorage.getItem('potential_conversation_id')
        if (d && l) {
          setClientForm(JSON.parse(d))
          setIsClientModalOpen(true)
        }
      }

      const onBook = () => {
        const d = localStorage.getItem('appointment_draft')
        const l = localStorage.getItem('appointment_conversation_id')
        if (d && l) {
          const data = JSON.parse(d)
          onBookAppointment(data)
        }
      }

      const onRecordPayment = () => {
        const d = localStorage.getItem('payment_draft')
        const l = localStorage.getItem('payment_conversation_id')
        if (d && l) {
          setPaymentForm(JSON.parse(d))
          setIsPaymentModalOpen(true)
        }
      }

      window.addEventListener('storage', onStorage)
      window.addEventListener('capture_client', onCapture as EventListener)
      window.addEventListener('book_appointment', onBook as EventListener)
      window.addEventListener('record_payment', onRecordPayment as EventListener)

      return () => {
        window.removeEventListener('storage', onStorage)
        window.removeEventListener('capture_client', onCapture as EventListener)
        window.removeEventListener('book_appointment', onBook as EventListener)
        window.removeEventListener('record_payment', onRecordPayment as EventListener)
      }
    } catch { }
  }, [setClientForm, setIsClientModalOpen, onBookAppointment, setPaymentForm, setIsPaymentModalOpen])

  // Cleanup effects
  useEffect(() => {
    if (!isClientModalOpen) {
      try {
        localStorage.removeItem('potential_client_draft')
        localStorage.removeItem('potential_conversation_id')
      } catch { }
    }
  }, [isClientModalOpen])


  useEffect(() => {
    if (!isPaymentModalOpen) {
      try {
        localStorage.removeItem('payment_draft')
        localStorage.removeItem('payment_conversation_id')
      } catch { }
    }
  }, [isPaymentModalOpen])
}
