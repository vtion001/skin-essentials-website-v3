import { useEffect } from 'react'

interface UseAdminEventSyncProps {
  setClientForm: (data: any) => void
  setIsClientModalOpen: (open: boolean) => void
  setAppointmentForm: (data: any) => void
  setIsAppointmentModalOpen: (open: boolean) => void
  setPaymentForm: (data: any) => void
  setIsPaymentModalOpen: (open: boolean) => void
  isClientModalOpen: boolean
  isAppointmentModalOpen: boolean
  isPaymentModalOpen: boolean
}

export function useAdminEventSync({
  setClientForm,
  setIsClientModalOpen,
  setAppointmentForm,
  setIsAppointmentModalOpen,
  setPaymentForm,
  setIsPaymentModalOpen,
  isClientModalOpen,
  isAppointmentModalOpen,
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
          setAppointmentForm(data)
          setIsAppointmentModalOpen(true)
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
    } catch {}
  }, [setClientForm, setIsClientModalOpen, setAppointmentForm, setIsAppointmentModalOpen, setPaymentForm, setIsPaymentModalOpen])

  // Cleanup effects
  useEffect(() => {
    if (!isClientModalOpen) {
      try {
        localStorage.removeItem('potential_client_draft')
        localStorage.removeItem('potential_conversation_id')
      } catch {}
    }
  }, [isClientModalOpen])

  useEffect(() => {
    if (!isAppointmentModalOpen) {
      try {
        localStorage.removeItem('appointment_draft')
        localStorage.removeItem('appointment_conversation_id')
      } catch {}
    }
  }, [isAppointmentModalOpen])

  useEffect(() => {
    if (!isPaymentModalOpen) {
      try {
        localStorage.removeItem('payment_draft')
        localStorage.removeItem('payment_conversation_id')
      } catch {}
    }
  }, [isPaymentModalOpen])
}
