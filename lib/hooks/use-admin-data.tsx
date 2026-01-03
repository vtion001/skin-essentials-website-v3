import { useState, useCallback, useEffect } from "react"
import {
  clientService,
  medicalRecordService,
  staffService,
  influencerService,
  socialMediaService,
  type Payment,
  type MedicalRecord,
  type Client,
  type SocialMessage,
  type Staff,
  type Influencer,
} from "@/lib/admin-services"

export function useAdminData() {
  const [isLoading, setIsLoading] = useState(false)
  const [payments, setPayments] = useState<Payment[]>([])
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [socialMessages, setSocialMessages] = useState<SocialMessage[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [influencers, setInfluencers] = useState<Influencer[]>([])


  const refreshClients = useCallback(async () => {
    try {
      await clientService.fetchFromSupabase?.()
      setClients(clientService.getAllClients())
    } catch (e) {
      console.error("Failed to refresh clients", e)
    }
  }, [])

  const refreshPayments = useCallback(async () => {
    try {
      const payRes = await fetch('/api/admin/payments', { cache: 'no-store' })
      if (!payRes.ok) { setPayments([]); return }
      const ctype = payRes.headers.get('content-type') || ''
      if (!ctype.includes('application/json')) { setPayments([]); return }
      const payJson = await payRes.json()
      const arr = Array.isArray(payJson?.payments) ? payJson.payments : []
      const normalized = arr.map((p: any) => ({
        id: String(p.id),
        appointmentId: p.appointment_id ?? undefined,
        clientId: String(p.client_id ?? ''),
        amount: Number(p.amount ?? 0),
        method: String(p.method ?? 'gcash'),
        status: String(p.status ?? 'pending'),
        transactionId: p.transaction_id ?? undefined,
        receiptUrl: p.receipt_url ?? undefined,
        uploadedFiles: Array.isArray(p.uploaded_files) ? p.uploaded_files : [],
        notes: p.notes ?? '',
        createdAt: String(p.created_at ?? new Date().toISOString()),
        updatedAt: String(p.updated_at ?? new Date().toISOString()),
      })) as Payment[]
      setPayments(normalized)
    } catch (e) {
      console.error("Failed to refresh payments", e)
    }
  }, [])

  const refreshMedicalRecords = useCallback(async () => {
    try {
      await medicalRecordService.fetchFromSupabase?.()
      setMedicalRecords(medicalRecordService.getAllRecords())
    } catch (e) {
      console.error("Failed to refresh medical records", e)
    }
  }, [])

  const refreshSocialMessages = useCallback(() => {
    setSocialMessages(socialMediaService.getAllMessages())
  }, [])

  const refreshStaff = useCallback(async () => {
    try {
      await staffService.syncLocalToSupabaseIfEmpty?.()
      await staffService.fetchFromSupabase?.()
      setStaff(staffService.getAllStaff())
    } catch (e) {
      console.error("Failed to refresh staff", e)
    }
  }, [])

  const refreshInfluencers = useCallback(async () => {
    try {
      await influencerService.syncLocalToSupabaseIfEmpty?.()
      await influencerService.fetchFromSupabase?.()
      setInfluencers(influencerService.getAllInfluencers())
    } catch (e) {
      console.error("Failed to refresh influencers", e)
    }
  }, [])

  const loadAllData = useCallback(async () => {
    setIsLoading(true)
    try {
      await Promise.all([
        refreshClients(),
        refreshPayments(),
        refreshMedicalRecords(),
        refreshStaff(),
        refreshInfluencers()
      ])
      refreshSocialMessages()
    } finally {
      setIsLoading(false)
    }
  }, [refreshClients, refreshPayments, refreshMedicalRecords, refreshStaff, refreshInfluencers, refreshSocialMessages])

  useEffect(() => {
    loadAllData()
  }, [loadAllData])

  return {
    isLoading,
    payments,
    setPayments,
    medicalRecords,
    setMedicalRecords,
    clients,
    setClients,
    socialMessages,
    setSocialMessages,
    staff,
    setStaff,
    influencers,
    setInfluencers,
    refreshData: loadAllData,
    refreshClients,
    refreshPayments,
    refreshMedicalRecords,
    refreshStaff,
    refreshInfluencers,
    refreshSocialMessages
  }
}
