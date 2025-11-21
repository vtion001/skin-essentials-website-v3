"use client"

import "./admin-styles.css"
import React, { useState, useEffect, useTransition, useMemo, useCallback, memo } from "react"
import { createClient } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  Eye,
  Save,
  X,
  Calendar as CalendarIcon,
  Users,
  CreditCard,
  FileText,
  MessageSquare,
  Search,
  Filter,
  RefreshCw,
  Clock,
  DollarSign,
  UserPlus,
  Bell,
  Settings,
  Download,
  Phone,
  Mail,
  MapPin,
  Shield,
  AlertCircle,
  CheckCircle,
  Instagram,
  Facebook,
  Send,
  FileImage,
  Activity,
  TrendingUp,
  BarChart3,
  Camera,
} from "lucide-react"
import Image from "next/image"
import { supabaseAvailable } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import {
  appointmentService,
  paymentService,
  medicalRecordService,
  clientService,
  socialMediaService,
  staffService,
  influencerService,
  type Appointment,
  type Payment,
  type MedicalRecord,
  type Client,
  type SocialMessage,
  type Staff,
  type Influencer,
  type ReferralRecord,
} from "@/lib/admin-services"
import { SocialConversationUI } from "@/components/admin/social-conversation-ui"
import { FacebookStatusIndicator } from "@/components/admin/facebook-status-indicator"
import { PlatformConnections } from "@/components/admin/platform-connections"
import { FacebookConnection } from "@/components/admin/facebook-connection"

const services = [
  "Thread Lifts - Nose Enhancement",
  "Thread Lifts - Face Contouring",
  "Thread Lifts - Eyebrow Lift",
  "Dermal Fillers - Lip Enhancement",
  "Dermal Fillers - Cheek Enhancement",
  "Dermal Fillers - Body Contouring",
  "Skin Treatments - Anti-Aging",
  "Skin Treatments - Acne Treatment",
  "Skin Treatments - Pigmentation",
  "Laser Treatments - Hair Removal",
  "Laser Treatments - Skin Resurfacing",
  "Laser Treatments - Tattoo Removal",
  "Botox - Wrinkle Reduction",
  "Botox - Facial Contouring",
  "Specialized Treatments - Hair Growth",
  "Specialized Treatments - Body Enhancement",
  "Specialized Treatments - Wellness",
]

// Enhanced form input component with animations
const AnimatedInput = memo(({ 
  id, 
  label, 
  value, 
  onChange, 
  type = "text", 
  required = false,
  placeholder = "",
  className = ""
}: {
  id: string
  label: string
  value: string | number
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  required?: boolean
  placeholder?: string
  className?: string
}) => {
  return (
    <motion.div 
      className="space-y-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <motion.div
        whileFocus={{ scale: 1.02 }}
        transition={{ duration: 0.1 }}
      >
        <Input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className={cn(
            "transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent",
            "hover:shadow-md focus:shadow-lg",
            className
          )}
        />
      </motion.div>
    </motion.div>
  )
})

AnimatedInput.displayName = 'AnimatedInput'

// Enhanced select component with animations
const AnimatedSelect = memo(({
  value,
  onValueChange,
  placeholder,
  options,
  label
}: {
  value: string
  onValueChange: (value: string) => void
  placeholder: string
  options: Array<{ value: string; label: string }>
  label: string
}) => {
  return (
    <motion.div 
      className="space-y-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      <motion.div
        whileFocus={{ scale: 1.02 }}
        transition={{ duration: 0.1 }}
      >
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent hover:shadow-md focus:shadow-lg">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>
    </motion.div>
  )
})

AnimatedSelect.displayName = 'AnimatedSelect'

// Lazy loading wrapper for tab content
const LazyTabContent = memo(({ 
  children, 
  isActive 
}: { 
  children: React.ReactNode
  isActive: boolean
}) => {
  const [hasBeenVisible, setHasBeenVisible] = useState(isActive)
  
  useEffect(() => {
    if (isActive && !hasBeenVisible) {
      setHasBeenVisible(true)
    }
  }, [isActive, hasBeenVisible])
  
  return (
    <AnimatePresence mode="wait">
      {(isActive || hasBeenVisible) && (
        <motion.div
          key={isActive ? 'active' : 'inactive'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="w-full"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
})

LazyTabContent.displayName = 'LazyTabContent'

// Enhanced button with loading states
const EnhancedButton = memo(({
  onClick,
  children,
  variant = "default",
  size = "default",
  loading = false,
  disabled = false,
  className = ""
}: {
  onClick?: () => void
  children: React.ReactNode
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  loading?: boolean
  disabled?: boolean
  className?: string
}) => {
  return (
    <motion.div
      whileHover={{ scale: disabled || loading ? 1 : 1.05 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.95 }}
      transition={{ duration: 0.1 }}
    >
      <Button
        onClick={onClick}
        variant={variant}
        size={size}
        disabled={disabled || loading}
        className={cn(
          "transition-all duration-200",
          "focus:ring-2 focus:ring-offset-2 focus:ring-purple-500",
          className
        )}
      >
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <RefreshCw className="w-4 h-4" />
          </motion.div>
        ) : children}
      </Button>
    </motion.div>
  )
})

EnhancedButton.displayName = 'EnhancedButton'

export default function AdminDashboard() {
  // Authentication and navigation
  const router = useRouter()
  
  // State management
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isLoading, setIsLoading] = useState(false)
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null)
  
  // Data states
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [socialMessages, setSocialMessages] = useState<SocialMessage[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [influencers, setInfluencers] = useState<Influencer[]>([])
  const [typingPending, startTransition] = useTransition()
  
  // Modal states
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isMedicalRecordModalOpen, setIsMedicalRecordModalOpen] = useState(false)
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)
  const [isSocialReplyModalOpen, setIsSocialReplyModalOpen] = useState(false)
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false)
  const [isInfluencerModalOpen, setIsInfluencerModalOpen] = useState(false)
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false)
  
  // Selected items
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [selectedMedicalRecord, setSelectedMedicalRecord] = useState<MedicalRecord | null>(null)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [selectedMessage, setSelectedMessage] = useState<SocialMessage | null>(null)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null)
  
  // Form states
  const [appointmentForm, setAppointmentForm] = useState<Partial<Appointment>>({})
  const [paymentForm, setPaymentForm] = useState<Partial<Payment>>({})
  const [medicalRecordForm, setMedicalRecordForm] = useState<Partial<MedicalRecord>>({})
  const [clientForm, setClientForm] = useState<Partial<Client>>({})
  const [replyMessage, setReplyMessage] = useState("")
  const [staffForm, setStaffForm] = useState<Partial<Staff>>({})
  const [influencerForm, setInfluencerForm] = useState<Partial<Influencer>>({ commissionRate: 0.10, status: 'active' })
  const [referralForm, setReferralForm] = useState<Partial<ReferralRecord>>({})

  // Deletion confirmation (Client)
  const [confirmClient, setConfirmClient] = useState<Client | null>(null)
  const [confirmDeleting, setConfirmDeleting] = useState(false)
  
  // Calendar and search states
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const [clientsStatusFilter, setClientsStatusFilter] = useState<string>("all")
  const [clientsSourceFilter, setClientsSourceFilter] = useState<string>("all")
  const [clientsSort, setClientsSort] = useState<string>("name_asc")
  const [clientDuplicateWarning, setClientDuplicateWarning] = useState<string | null>(null)

  const [appointmentsSearch, setAppointmentsSearch] = useState("")
  const [appointmentsStatusFilter, setAppointmentsStatusFilter] = useState<string>("all")
  const [appointmentsServiceFilter, setAppointmentsServiceFilter] = useState<string>("all")
  const [appointmentsDateFrom, setAppointmentsDateFrom] = useState<string>("")
  const [appointmentsDateTo, setAppointmentsDateTo] = useState<string>("")
  const [appointmentsSort, setAppointmentsSort] = useState<string>("date_desc")
  const [appointmentsPage, setAppointmentsPage] = useState<number>(1)
  const [appointmentsPageSize, setAppointmentsPageSize] = useState<number>(10)
  const [paymentSearch, setPaymentSearch] = useState("")
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all")
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all")
  const [paymentDateFrom, setPaymentDateFrom] = useState<string>("")
  const [paymentDateTo, setPaymentDateTo] = useState<string>("")
  const [paymentSort, setPaymentSort] = useState<string>("date_desc")
  const [paymentPage, setPaymentPage] = useState<number>(1)
  const [paymentPageSize, setPaymentPageSize] = useState<number>(10)
  const [staffSearch, setStaffSearch] = useState("")
  const [staffPositionFilter, setStaffPositionFilter] = useState<string>("all")
  const [staffStatusFilter, setStaffStatusFilter] = useState<string>("all")
  const [influencerSearch, setInfluencerSearch] = useState("")
  const [influencerPlatformFilter, setInfluencerPlatformFilter] = useState<string>('all')
  const [influencerStatusFilter, setInfluencerStatusFilter] = useState<string>('all')
  const [analyticsDateFrom, setAnalyticsDateFrom] = useState<string>("")
  const [analyticsDateTo, setAnalyticsDateTo] = useState<string>("")

  const [isReferralDetailsOpen, setIsReferralDetailsOpen] = useState(false)
  const [referralDetailsSearch, setReferralDetailsSearch] = useState("")
  const [referralDateFrom, setReferralDateFrom] = useState<string>("")
  const [referralDateTo, setReferralDateTo] = useState<string>("")
  const [referralSort, setReferralSort] = useState<string>("date_desc")
  const [referralPage, setReferralPage] = useState<number>(1)
  const [referralPageSize, setReferralPageSize] = useState<number>(10)

  // Authentication is enforced by middleware; optional client-side redirect kept minimal
  useEffect(() => {
    // No-op: relying on middleware and Supabase session
  }, [router])

  // Load data
  useEffect(() => {
    loadAllData()
  }, [])

  useEffect(() => {
    setReferralPage(1)
  }, [referralDetailsSearch, referralDateFrom, referralDateTo, referralSort, selectedInfluencer])

  useEffect(() => {
    try {
      const draft = localStorage.getItem('potential_client_draft')
      const link = localStorage.getItem('potential_conversation_id')
      if (draft && link) {
        const data = JSON.parse(draft)
        setClientForm(data)
        setIsClientModalOpen(true)
      }
      const onStorage = (e: StorageEvent) => {
        if (e.key === 'potential_client_draft') {
          const d = localStorage.getItem('potential_client_draft')
          const l = localStorage.getItem('potential_conversation_id')
          if (d && l) {
            setClientForm(JSON.parse(d))
            setIsClientModalOpen(true)
          }
        }
      }
      window.addEventListener('storage', onStorage)
      const onCapture = () => {
        const d = localStorage.getItem('potential_client_draft')
        const l = localStorage.getItem('potential_conversation_id')
        if (d && l) {
          setClientForm(JSON.parse(d))
          setIsClientModalOpen(true)
        }
      }
      window.addEventListener('capture_client', onCapture as EventListener)
      return () => window.removeEventListener('storage', onStorage)
    
    } catch {}
  }, [])

  useEffect(() => {
    if (!isClientModalOpen) {
      try {
        localStorage.removeItem('potential_client_draft')
        localStorage.removeItem('potential_conversation_id')
      } catch {}
    }
  }, [isClientModalOpen])

  const loadAllData = async () => {
    await appointmentService.fetchFromSupabase?.()
    setAppointments(appointmentService.getAllAppointments())
    await clientService.fetchFromSupabase?.()
    try {
      const payRes = await fetch('/api/admin/payments', { cache: 'no-store' })
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
    } catch {}
    try {
      const recRes = await fetch('/api/admin/medical-records', { cache: 'no-store' })
      const recJson = await recRes.json()
      setMedicalRecords(Array.isArray(recJson?.records) ? recJson.records : [])
    } catch {}
    setClients(clientService.getAllClients())
    setSocialMessages(socialMediaService.getAllMessages())
    await staffService.syncLocalToSupabaseIfEmpty?.()
    await staffService.fetchFromSupabase?.()
    setStaff(staffService.getAllStaff())
    await influencerService.syncLocalToSupabaseIfEmpty?.()
    await influencerService.fetchFromSupabase?.()
    setInfluencers(influencerService.getAllInfluencers())
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/login', { method: 'DELETE' })
    } catch {}
    router.push('/admin/login')
  }

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  const confirmTwice = (subject: string) => {
    if (typeof window === 'undefined') return false
    if (!window.confirm(`Are you sure you want to delete ${subject}?`)) return false
    if (!window.confirm(`Please confirm deletion of ${subject}. This action cannot be undone.`)) return false
    return true
  }

  const supabaseRealtimeEnabled = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  const supabaseBrowser = supabaseRealtimeEnabled ? createClient(String(process.env.NEXT_PUBLIC_SUPABASE_URL), String(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) : null

  const paymentFileInputRef = React.useRef<HTMLInputElement | null>(null)
  const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false)
  const videoRef = React.useRef<HTMLVideoElement | null>(null)
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [cameraTarget, setCameraTarget] = useState<null | 'payment' | 'medical'>(null)
  const medicalFileInputRef = React.useRef<HTMLInputElement | null>(null)
  const [supplierPayAmount, setSupplierPayAmount] = useState<number>(0)
  const [supplierPayMethod, setSupplierPayMethod] = useState<string>('bank_transfer')
  const [supplierPayNotes, setSupplierPayNotes] = useState<string>('')

  const uploadReceiptFile = async (file: File) => {
    try {
      if (!supabaseBrowser) {
        showNotification('error', 'Supabase is not configured')
        return null
      }
      const clientId = String(paymentForm.clientId || 'unknown')
      const today = new Date()
      const y = today.getFullYear()
      const m = String(today.getMonth() + 1).padStart(2, '0')
      const d = String(today.getDate()).padStart(2, '0')
      const folder = `${clientId}/${y}${m}${d}`
      const ext = file.name.split('.').pop() || 'jpg'
      const filename = `receipt_${Date.now()}.${ext}`
      const path = `${folder}/${filename}`
      const { error } = await supabaseBrowser.storage.from('payment-receipts').upload(path, file, { upsert: true, contentType: file.type })
      if (error) {
        showNotification('error', 'Upload failed')
        return null
      }
      const { data } = supabaseBrowser.storage.from('payment-receipts').getPublicUrl(path)
      const publicUrl = data.publicUrl
      const nextFiles = [...(Array.isArray(paymentForm.uploadedFiles) ? paymentForm.uploadedFiles : []), publicUrl]
      setPaymentForm(prev => ({ ...prev, uploadedFiles: nextFiles, receiptUrl: prev.receiptUrl || publicUrl }))
      showNotification('success', 'Receipt uploaded')
      return publicUrl
    } catch {
      showNotification('error', 'Upload error')
      return null
    }
  }

  const handleUploadButtonClick = () => {
    paymentFileInputRef.current?.click()
  }

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    for (const file of Array.from(files)) {
      await uploadReceiptFile(file)
    }
    e.target.value = ''
  }

  const openCamera = async (target?: 'payment' | 'medical') => {
    try {
      if (target) setCameraTarget(target)
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      setCameraStream(stream)
      setIsCameraDialogOpen(true)
      if (videoRef.current) {
        // @ts-ignore
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
    } catch {
      showNotification('error', 'Camera unavailable')
    }
  }

  const closeCamera = () => {
    try {
      cameraStream?.getTracks().forEach(t => t.stop())
    } catch {}
    setCameraStream(null)
    setIsCameraDialogOpen(false)
  }

  const capturePhoto = async () => {
    if (!videoRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current || document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(b => resolve(b), 'image/jpeg', 0.9))
    if (!blob) return
    const file = new File([blob], `camera_${Date.now()}.jpg`, { type: 'image/jpeg' })
    if (cameraTarget === 'medical') {
      await uploadMedicalFile(file)
    } else {
      await uploadReceiptFile(file)
    }
    closeCamera()
  }

  const uploadMedicalFile = async (file: File) => {
    try {
      if (!supabaseBrowser) {
        showNotification('error', 'Supabase is not configured')
        return null
      }
      const clientId = String(medicalRecordForm.clientId || 'unknown')
      const today = new Date()
      const y = today.getFullYear()
      const m = String(today.getMonth() + 1).padStart(2, '0')
      const d = String(today.getDate()).padStart(2, '0')
      const folder = `${clientId}/${y}${m}${d}`
      const ext = file.name.split('.').pop() || 'jpg'
      const filename = `attachment_${Date.now()}.${ext}`
      const path = `${folder}/${filename}`
      const { error } = await supabaseBrowser.storage.from('medical-attachments').upload(path, file, { upsert: true, contentType: file.type })
      if (error) {
        showNotification('error', 'Upload failed')
        return null
      }
      const { data } = supabaseBrowser.storage.from('medical-attachments').getPublicUrl(path)
      const publicUrl = data.publicUrl
      const nextFiles = [...(Array.isArray(medicalRecordForm.attachments) ? medicalRecordForm.attachments : []), publicUrl]
      setMedicalRecordForm(prev => ({ ...prev, attachments: nextFiles }))
      showNotification('success', 'Attachment uploaded')
      return publicUrl
    } catch {
      showNotification('error', 'Upload error')
      return null
    }
  }

  const handleMedicalUploadButtonClick = () => {
    medicalFileInputRef.current?.click()
  }

  const handleMedicalFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    for (const file of Array.from(files)) {
      await uploadMedicalFile(file)
    }
    e.target.value = ''
  }

  const refreshAppointments = async () => {
    await appointmentService.fetchFromSupabase?.()
    setAppointments(appointmentService.getAllAppointments())
  }
  const refreshClients = async () => {
    await clientService.fetchFromSupabase?.()
    setClients(clientService.getAllClients())
  }
  const refreshStaff = async () => {
    await staffService.fetchFromSupabase?.()
    setStaff(staffService.getAllStaff())
  }
  const refreshPayments = async () => {
    try {
      const res = await fetch('/api/admin/payments', { cache: 'no-store' })
      const json = await res.json()
      const arr = Array.isArray(json?.payments) ? json.payments : []
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
    } catch {}
  }
  const refreshMedical = async () => {
    try {
      const res = await fetch('/api/admin/medical-records', { cache: 'no-store' })
      const json = await res.json()
      setMedicalRecords(Array.isArray(json?.records) ? json.records : [])
    } catch {}
  }
  const refreshInfluencers = async () => {
    await influencerService.fetchFromSupabase?.()
    setInfluencers(influencerService.getAllInfluencers())
  }
  const refreshReferrals = async () => {
    await influencerService.fetchFromSupabase?.()
    setInfluencers(influencerService.getAllInfluencers())
  }

  useEffect(() => {
    if (!supabaseBrowser) return
    const channel = supabaseBrowser.channel('admin-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => { refreshAppointments() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => { refreshClients() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff' }, () => { refreshStaff() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => { refreshPayments() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'medical_records' }, () => { refreshMedical() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'influencers' }, () => { refreshInfluencers() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'influencer_referrals' }, () => { refreshReferrals() })
      .subscribe()
    return () => { supabaseBrowser.removeChannel(channel) }
  }, [])

  // Dashboard Statistics
  const getDashboardStats = () => {
    const today = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' })).toISOString().split('T')[0]
    const thisMonth = new Date().toISOString().slice(0, 7)
    
    return {
      todayAppointments: appointments.filter(apt => apt.date === today).length,
      totalClients: clients.length,
      monthlyRevenue: payments
        .filter(payment => String(payment.createdAt || '').startsWith(thisMonth) && payment.status === 'completed')
        .reduce((sum, payment) => sum + payment.amount, 0),
      unreadMessages: socialMessages.filter(msg => !msg.isRead).length,
      pendingPayments: payments.filter(payment => payment.status === 'pending').length,
      completedAppointments: appointments.filter(apt => apt.status === 'completed').length,
    }
  }

  const stats = React.useMemo(() => getDashboardStats(), [appointments, clients, payments, socialMessages])

  // Appointment Management
  const handleAppointmentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      if (selectedAppointment) {
        appointmentService.updateAppointment(selectedAppointment.id, appointmentForm)
        showNotification("success", "Appointment updated successfully!")
      } else {
        appointmentService.addAppointment(appointmentForm as Omit<Appointment, "id" | "createdAt" | "updatedAt">)
        showNotification("success", "Appointment created successfully!")
      }
      
      setAppointments(appointmentService.getAllAppointments())
      setIsAppointmentModalOpen(false)
      setAppointmentForm({})
      setSelectedAppointment(null)
    } catch (error) {
      showNotification("error", "Failed to save appointment")
    } finally {
      setIsLoading(false)
    }
  }

  // Payment Management
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    ;(async () => {
      try {
        const method = selectedPayment ? 'PATCH' : 'POST'
        const payload = selectedPayment ? { id: selectedPayment.id, ...paymentForm } : paymentForm
        const res = await fetch('/api/admin/payments', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        if (!res.ok) throw new Error('Failed')
        const listRes = await fetch('/api/admin/payments', { cache: 'no-store' })
        const json = await listRes.json()
        setPayments(Array.isArray(json?.payments) ? json.payments : [])
        showNotification("success", selectedPayment ? "Payment updated successfully!" : "Payment recorded successfully!")
        setIsPaymentModalOpen(false)
        setPaymentForm({})
        setSelectedPayment(null)
      } catch {
        showNotification("error", "Failed to save payment")
      } finally {
        setIsLoading(false)
      }
    })()
  }

  // Medical Record Management
  const handleMedicalRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    ;(async () => {
      try {
        const method = selectedMedicalRecord ? 'PATCH' : 'POST'
        const payload = selectedMedicalRecord ? { id: selectedMedicalRecord.id, ...medicalRecordForm } : medicalRecordForm
        const res = await fetch('/api/admin/medical-records', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        if (!res.ok) throw new Error('Failed')
        const listRes = await fetch('/api/admin/medical-records', { cache: 'no-store' })
        const json = await listRes.json()
        setMedicalRecords(Array.isArray(json?.records) ? json.records : [])
        showNotification("success", selectedMedicalRecord ? "Medical record updated successfully!" : "Medical record created successfully!")
        setIsMedicalRecordModalOpen(false)
        setMedicalRecordForm({})
        setSelectedMedicalRecord(null)
      } catch {
        showNotification("error", "Failed to save medical record")
      } finally {
        setIsLoading(false)
      }
    })()
  }

  // Client Management
  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    ;(async () => {
      try {
        const emailOk = !clientForm.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientForm.email)
        const phoneOk = !clientForm.phone || /\+?\d[\d\s-]{6,}$/.test(clientForm.phone)
        if (!emailOk || !phoneOk) {
          showNotification("error", "Please enter valid email and phone")
          setIsLoading(false)
          return
        }
        setClientDuplicateWarning(null)
        const isEditing = Boolean(selectedClient?.id)
        const norm = (s: any) => String(s || '').trim().toLowerCase()
        const email = norm(clientForm.email)
        const phone = norm(clientForm.phone)
        const nameKey = `${norm(clientForm.firstName)} ${norm(clientForm.lastName)}`.trim()
        const duplicate = clients.find(c => {
          if (isEditing && c.id === selectedClient!.id) return false
          const cEmail = norm(c.email)
          const cPhone = norm(c.phone)
          const cNameKey = `${norm(c.firstName)} ${norm(c.lastName)}`.trim()
          return (email && cEmail && email === cEmail) || (phone && cPhone && phone === cPhone) || (!email && !phone && nameKey && cNameKey && cNameKey === nameKey)
        })
        if (duplicate) {
          const basis = email ? 'email' : phone ? 'phone' : 'name'
          setClientDuplicateWarning(`A client with the same ${basis} already exists.`)
          showNotification("error", "Duplicate contact detected")
          setIsLoading(false)
          return
        }
        const method = selectedClient ? 'PATCH' : 'POST'
        const payload = selectedClient ? { id: selectedClient.id, ...clientForm } : clientForm
        const res = await fetch('/api/admin/clients', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        if (!res.ok) throw new Error('Failed')
        await clientService.fetchFromSupabase?.()
        setClients(clientService.getAllClients())
        const link = localStorage.getItem('potential_conversation_id')
        if (!selectedClient && link) {
          const all = clientService.getAllClients()
          const created = all[0]
          socialMediaService.setConversationClient(link, created.id)
          try { localStorage.removeItem('potential_client_draft'); localStorage.removeItem('potential_conversation_id') } catch {}
        }
        showNotification("success", selectedClient ? "Client updated successfully!" : "Client added successfully!")
        setIsClientModalOpen(false)
        setClientForm({})
        setSelectedClient(null)
      } catch {
        showNotification("error", "Failed to save client")
      } finally {
        setIsLoading(false)
      }
    })()
  }

  const quickAddClientFromAppointment = async (a: Appointment) => {
    setIsLoading(true)
    try {
      const parts = (a.clientName || '').split(' ')
      const firstName = parts[0] || (a.clientName || '')
      const lastName = parts.slice(1).join(' ')
      const payload = {
        firstName,
        lastName,
        email: a.clientEmail || '',
        phone: a.clientPhone || '',
        preferences: { communicationMethod: 'email', reminderSettings: true, marketingConsent: false },
        source: 'website',
        status: 'active',
        totalSpent: 0,
      }
      const res = await fetch('/api/admin/clients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error('Failed')
      await clientService.fetchFromSupabase?.()
      setClients(clientService.getAllClients())
      showNotification('success', 'Client added successfully!')
    } catch {
      showNotification('error', 'Failed to add client')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    ;(async () => {
      try {
        const emailOk = !staffForm.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(staffForm.email))
        const phoneOk = !staffForm.phone || /\+?\d[\d\s-]{6,}$/.test(String(staffForm.phone))
        if (!emailOk || !phoneOk) {
          showNotification("error", "Please enter valid email and phone")
          setIsLoading(false)
          return
        }
        const method = selectedStaff ? 'PATCH' : 'POST'
        const payload = selectedStaff ? { id: selectedStaff.id, ...staffForm } : staffForm
        const res = await fetch('/api/admin/staff', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        if (!res.ok) throw new Error('Failed')
        await staffService.fetchFromSupabase?.()
        setStaff(staffService.getAllStaff())
        showNotification("success", selectedStaff ? "Staff updated successfully!" : "Staff added successfully!")
        setIsStaffModalOpen(false)
        setStaffForm({})
        setSelectedStaff(null)
      } catch {
        showNotification("error", "Failed to save staff")
      } finally {
        setIsLoading(false)
      }
    })()
  }

  // Social Media Management
  const handleSocialReply = () => {
    if (!selectedMessage || !replyMessage.trim()) return
    
    setIsLoading(true)
    try {
      socialMediaService.replyToMessage(selectedMessage.id, replyMessage)
      socialMediaService.markAsRead(selectedMessage.id)
      setSocialMessages(socialMediaService.getAllMessages())
      setIsSocialReplyModalOpen(false)
      setReplyMessage("")
      setSelectedMessage(null)
      showNotification("success", "Reply sent successfully!")
    } catch (error) {
      showNotification("error", "Failed to send reply")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInfluencerSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    ;(async () => {
      try {
        if (!influencerForm.name || !influencerForm.platform) {
          showNotification('error', 'Please fill required fields')
          setIsLoading(false)
          return
        }
        const method = selectedInfluencer ? 'PATCH' : 'POST'
        const payload = selectedInfluencer ? { id: selectedInfluencer.id, ...influencerForm } : influencerForm
        const res = await fetch('/api/admin/influencers', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        if (!res.ok) throw new Error('Failed')
        await influencerService.fetchFromSupabase?.()
        setInfluencers(influencerService.getAllInfluencers())
        showNotification('success', selectedInfluencer ? 'Influencer updated successfully!' : 'Influencer added successfully!')
        setIsInfluencerModalOpen(false)
        setSelectedInfluencer(null)
        setInfluencerForm({ commissionRate: 0.10, status: 'active' })
      } catch {
        showNotification('error', 'Failed to save influencer')
      } finally {
        setIsLoading(false)
      }
    })()
  }

  const handleReferralSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedInfluencer) return
    setIsLoading(true)
    ;(async () => {
      try {
        if (!referralForm.clientName || !referralForm.amount || !referralForm.date) {
          showNotification('error', 'Please fill referral details')
          setIsLoading(false)
          return
        }
        const payload = { influencer_id: selectedInfluencer.id, client_name: referralForm.clientName!, amount: Number(referralForm.amount), date: referralForm.date!, notes: referralForm.notes }
        const res = await fetch('/api/admin/influencer-referrals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        if (!res.ok) throw new Error('Failed')
        await influencerService.fetchFromSupabase?.()
        setInfluencers(influencerService.getAllInfluencers())
        showNotification('success', 'Referral recorded successfully!')
        setIsReferralModalOpen(false)
        setReferralForm({})
      } catch {
        showNotification('error', 'Failed to save referral')
      } finally {
        setIsLoading(false)
      }
    })()
  }

  const openAppointmentModal = (appointment?: Appointment) => {
    if (appointment) {
      setSelectedAppointment(appointment)
      setAppointmentForm(appointment)
    } else {
      setSelectedAppointment(null)
      setAppointmentForm({
        date: selectedDate.toISOString().split('T')[0],
        status: 'scheduled',
        duration: 60,
      })
    }
    setIsAppointmentModalOpen(true)
  }

  const openPaymentModal = (payment?: Payment) => {
    if (payment) {
      setSelectedPayment(payment)
      setPaymentForm(payment)
    } else {
      setSelectedPayment(null)
      setPaymentForm({
        status: 'pending',
        method: 'gcash',
        uploadedFiles: [],
      })
    }
    setIsPaymentModalOpen(true)
  }

  const openMedicalRecordModal = (record?: MedicalRecord, clientId?: string) => {
    if (record) {
      setSelectedMedicalRecord(record)
      setMedicalRecordForm(record)
    } else {
      setSelectedMedicalRecord(null)
      setMedicalRecordForm({
        clientId: clientId || '',
        date: new Date().toISOString().split('T')[0],
        medicalHistory: [],
        allergies: [],
        currentMedications: [],
        attachments: [],
        isConfidential: true,
        createdBy: 'Admin',
      })
    }
    setIsMedicalRecordModalOpen(true)
  }

  const openClientModal = (client?: Client) => {
    if (client) {
      setSelectedClient(client)
      setClientForm(client)
    } else {
      setSelectedClient(null)
      setClientForm({
        id: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        medicalHistory: [],
        allergies: [],
        preferences: {
          communicationMethod: 'email',
          reminderSettings: true,
          marketingConsent: false,
        },
        source: 'website',
        status: 'active',
        totalSpent: 0,
        createdAt: '',
        updatedAt: '',
      })
    }
    setClientDuplicateWarning(null)
    setIsClientModalOpen(true)
  }

  const openStaffModal = (person?: Staff) => {
    if (person) {
      setSelectedStaff(person)
      setStaffForm(person)
    } else {
      setSelectedStaff(null)
      setStaffForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        position: 'other',
        department: '',
        licenseNumber: '',
        specialties: [],
        hireDate: new Date().toISOString().split('T')[0],
        status: 'active',
        notes: ''
      })
    }
    setIsStaffModalOpen(true)
  }

  const openSocialReplyModal = (message: SocialMessage) => {
    setSelectedMessage(message)
    setReplyMessage("")
    setIsSocialReplyModalOpen(true)
    if (!message.isRead) {
      socialMediaService.markAsRead(message.id)
      setSocialMessages(socialMediaService.getAllMessages())
    }
  }

  const openInfluencerModal = (inf?: Influencer) => {
    if (inf) {
      setSelectedInfluencer(inf)
      setInfluencerForm(inf)
    } else {
      setSelectedInfluencer(null)
      setInfluencerForm({ name: '', handle: '', platform: 'instagram', email: '', phone: '', referralCode: '', commissionRate: 0.10, status: 'active', notes: '' })
    }
    setIsInfluencerModalOpen(true)
  }

  return (
    <>
      <div className="min-h-screen relative bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-16 -left-24 w-96 h-96 bg-gradient-to-br from-purple-400/20 via-pink-300/15 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/4 -right-32 w-80 h-80 bg-gradient-to-br from-blue-400/20 via-cyan-300/15 to-transparent rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-gradient-to-br from-amber-400/20 via-orange-300/15 to-transparent rounded-full blur-3xl animate-pulse delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-emerald-400/10 via-teal-300/8 to-transparent rounded-full blur-3xl animate-pulse delay-3000" />
      </div>
      

      {/* Premium Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`fixed top-24 right-6 z-50 p-6 rounded-3xl shadow-2xl border-2 backdrop-blur-2xl ${
              notification.type === "success"
                ? "bg-gradient-to-br from-green-50/90 via-emerald-50/80 to-green-50/90 border-emerald-300/70 text-emerald-900 shadow-emerald-500/20"
                : "bg-gradient-to-br from-red-50/90 via-rose-50/80 to-red-50/90 border-rose-300/70 text-rose-900 shadow-rose-500/20"
            }`}
          >
            <div className="flex items-center space-x-4">
              {notification.type === "success" ? (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-lg shadow-green-500/30"
                >
                  <CheckCircle className="w-6 h-6 text-white" />
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  className="p-3 bg-gradient-to-br from-red-500 to-rose-500 rounded-2xl shadow-lg shadow-red-500/30"
                >
                  <AlertCircle className="w-6 h-6 text-white" />
                </motion.div>
              )}
              <motion.span 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="font-bold text-lg"
              >
                {notification.message}
              </motion.span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-20 sm:pt-24 pb-10 sm:pb-12 px-4 sm:px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Page Header - Glassmorphism effect */}
          <motion.div 
            className="flex items-center justify-between mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <motion.div 
              className="bg-white/40 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-2xl shadow-purple-500/5"
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <motion.h1 
                className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                Admin Dashboard
              </motion.h1>
              <motion.p 
                className="text-gray-600 text-lg font-medium"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                Comprehensive management system for Skin Essentials
              </motion.p>
            </motion.div>
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {supabaseAvailable() ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                >
                  <Badge className="bg-green-500 text-white shadow-sm animate-pulse-subtle">Supabase Connected</Badge>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                >
                  <Badge className="bg-red-500 text-white shadow-sm">Supabase Not Configured</Badge>
                </motion.div>
              )}
              <FacebookStatusIndicator />
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  onClick={loadAllData}
                  variant="outline"
                  className="bg-white/60 backdrop-blur-sm border border-white/70 text-gray-700 hover:bg-white/80 hover:shadow-lg transition-all duration-300"
                  disabled={isLoading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="bg-white/60 backdrop-blur-sm border border-red-200/70 text-red-600 hover:bg-red-50/80 hover:shadow-lg transition-all duration-300"
                >
                  Logout
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Main Dashboard Navigation */}
          <div className="grid lg:grid-cols-[240px_1fr] gap-6 lg:gap-8">
            <motion.aside 
              role="navigation" 
              aria-label="Admin sections" 
              className="hidden lg:block"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <motion.div 
                className="rounded-3xl bg-white/30 backdrop-blur-2xl shadow-2xl shadow-purple-500/10 border border-white/60 p-6"
                whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
              >
                <motion.div 
                  className="text-sm font-bold text-gray-700 px-2 mb-4 uppercase tracking-wider"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Navigation
                </motion.div>
                <div className="space-y-2">
                  {[
                    { key: 'dashboard', label: 'Dashboard', icon: BarChart3, color: 'from-blue-500 to-cyan-500' },
                    { key: 'appointments', label: 'Bookings', icon: CalendarIcon, color: 'from-purple-500 to-pink-500' },
                    { key: 'payments', label: 'Payments', icon: CreditCard, color: 'from-green-500 to-emerald-500' },
                    { key: 'medical', label: 'EMR', icon: FileText, color: 'from-orange-500 to-amber-500' },
                    { key: 'clients', label: 'Clients', icon: Users, color: 'from-indigo-500 to-purple-500' },
                    { key: 'staff', label: 'Staff', icon: Settings, color: 'from-slate-500 to-gray-500' },
                    { key: 'influencers', label: 'Influencers', icon: TrendingUp, color: 'from-fuchsia-500 to-violet-600' },
                    { key: 'analytics', label: 'Analytics', icon: BarChart3, color: 'from-blue-600 to-emerald-600' },
                    { key: 'social', label: 'Social Media', icon: MessageSquare, color: 'from-rose-500 to-pink-500' },
                  ].map(({ key, label, icon: Icon, color }, index) => (
                    <motion.button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      aria-current={activeTab === key ? 'page' : undefined}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 motion-safe:hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        activeTab === key
                          ? `bg-gradient-to-r ${color} text-white shadow-xl shadow-${color.split('-')[1]}-500/30 border border-white/80 transform scale-105`
                          : 'text-gray-700 hover:bg-white/60 hover:shadow-md'
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                      whileHover={{ scale: activeTab === key ? 1.05 : 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <motion.div 
                        className={`p-2 rounded-xl ${activeTab === key ? 'bg-white/20' : 'bg-gray-100'}`}
                        whileHover={{ rotate: activeTab === key ? 0 : 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Icon className="w-5 h-5" />
                      </motion.div>
                      <span className="flex-1 text-left">{label}</span>
                      {activeTab === key && (
                        <motion.div 
                          className="w-3 h-3 bg-white/40 rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </motion.aside>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col gap-2 w-full">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  <TabsList className="bg-white/30 backdrop-blur-xl border border-white/60 shadow-2xl shadow-purple-500/10 h-16 items-center justify-center rounded-3xl p-3 grid w-full grid-cols-6 mb-8 lg:hidden overflow-x-auto scrollbar-none">
                    {[
                      { value: 'dashboard', icon: BarChart3, label: 'Dashboard', color: 'from-blue-500 to-cyan-500' },
                      { value: 'appointments', icon: CalendarIcon, label: 'Bookings', color: 'from-purple-500 to-pink-500' },
                      { value: 'payments', icon: CreditCard, label: 'Payments', color: 'from-green-500 to-emerald-500' },
                      { value: 'medical', icon: FileText, label: 'EMR', color: 'from-orange-500 to-amber-500' },
                      { value: 'clients', icon: Users, label: 'Clients', color: 'from-indigo-500 to-purple-500' },
                      { value: 'staff', icon: Settings, label: 'Staff', color: 'from-slate-500 to-gray-500' },
                    ].map((tab, index) => (
                      <motion.div
                        key={tab.value}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + index * 0.05 }}
                      >
                        <TabsTrigger 
                          value={tab.value} 
                          className={`data-[state=active]:bg-gradient-to-r data-[state=active]:${tab.color} data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:shadow-${tab.color.split('-')[1]}-500/30 text-gray-700 h-[calc(100%-8px)] flex-1 justify-center rounded-2xl border border-transparent px-3 py-2 text-sm font-bold whitespace-nowrap transition-all duration-300 focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-white/80 data-[state=active]:scale-110 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5 flex items-center gap-2 hover:scale-105 hover:shadow-lg`}
                        >
                          <tab.icon className="w-5 h-5" />
                          {tab.label}
                        </TabsTrigger>
                      </motion.div>
                    ))}
                  </TabsList>
                </motion.div>

            {/* Dashboard Overview */}
            <LazyTabContent isActive={activeTab === "dashboard"}>
              <TabsContent value="dashboard" className="space-y-8">
                {/* Stats Cards - Premium Glassmorphism */}
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  {[
                    { 
                      title: "Today's Appointments", 
                      value: appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length,
                      icon: CalendarIcon,
                      color: 'blue',
                      gradient: 'from-blue-600 to-cyan-600'
                    },
                    { 
                      title: "Pending Payments", 
                      value: payments.filter(p => p.status === 'pending').length,
                      icon: CreditCard,
                      color: 'purple',
                      gradient: 'from-purple-600 to-pink-600'
                    },
                    { 
                      title: "Total Clients", 
                      value: clients.length,
                      icon: Users,
                      color: 'green',
                      gradient: 'from-green-600 to-emerald-600'
                    },
                    { 
                      title: "Active Staff", 
                      value: staff.filter(s => s.status === 'active').length,
                      icon: Settings,
                      color: 'orange',
                      gradient: 'from-orange-600 to-amber-600'
                    },
                    { 
                      title: "Social Messages", 
                      value: socialMessages.filter(m => !m.isReplied).length,
                      icon: MessageSquare,
                      color: 'indigo',
                      gradient: 'from-indigo-600 to-purple-600'
                    },
                    { 
                      title: "Monthly Revenue", 
                      value: `₱${payments.filter(p => p.status === 'completed' && new Date(p.createdAt).getMonth() === new Date().getMonth()).reduce((sum, p) => sum + p.amount, 0).toLocaleString()}`,
                      icon: DollarSign,
                      color: 'fuchsia',
                      gradient: 'from-fuchsia-600 to-violet-600'
                    }
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      whileHover={{ scale: 1.03, y: -2 }}
                      className="transform-gpu"
                    >
                      <Card className={`bg-gradient-to-br from-${stat.color}-50/40 via-white/50 to-${stat.color}-50/30 backdrop-blur-xl border border-${stat.color}-200/50 shadow-2xl shadow-${stat.color}-500/10 transition-all duration-500 hover:shadow-${stat.color}-500/20`}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`text-sm font-medium text-${stat.color}-600/80 mb-1`}>{stat.title}</p>
                              <motion.p 
                                className={`text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
                              >
                                {stat.value}
                              </motion.p>
                            </div>
                            <motion.div 
                              className={`p-3 bg-gradient-to-br ${stat.gradient} rounded-2xl shadow-lg shadow-${stat.color}-500/30`}
                              whileHover={{ rotate: 10, scale: 1.1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <stat.icon className="w-6 h-6 text-white" />
                            </motion.div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
            </TabsContent>
          </LazyTabContent>

          {/* Appointments/Booking System */}
            <LazyTabContent isActive={activeTab === "appointments"}>
              <TabsContent value="appointments" className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Booking Management</h2>
                <Button
                  onClick={() => openAppointmentModal()}
                  className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 text-white shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105 font-bold px-6 py-3 rounded-2xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Appointment
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar */}
                <Card className="bg-white/60 backdrop-blur-sm border border-[#fbc6c5]/20">
                  <CardHeader>
                    <CardTitle>Calendar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      selectedDate={selectedDate}
                      onDateSelect={setSelectedDate}
                      bookedDates={appointments.map(apt => new Date(new Date(apt.date).toLocaleString('en-US', { timeZone: 'Asia/Manila' })))}
                    />
                  </CardContent>
                </Card>

                {/* Appointments List */}
                <div className="lg:col-span-2">
                  <Card className="bg-white/60 backdrop-blur-sm border border-[#fbc6c5]/20">
                    <CardHeader>
                      <CardTitle>
                        Appointments for {new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Manila', year: 'numeric', month: 'numeric', day: 'numeric' }).format(selectedDate)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {appointments
                          .filter(apt => apt.date === new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' }).format(selectedDate))
                          .map((appointment) => (
                            <div key={appointment.id} className="flex items-center justify-between p-4 bg-white/50 rounded-lg border">
                              <div className="flex-1">
                                <div className="flex items-center gap-4">
                                  <div className="flex-1">
                                    <p className="font-medium">{appointment.clientName}</p>
                                    <p className="text-sm text-gray-600">{appointment.service}</p>
                                    <p className="text-xs text-gray-500">
                                      {appointment.time} • {appointment.duration} min • ₱{appointment.price}
                                    </p>
                                  </div>
                                  <Badge className={
                                    appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                    appointment.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }>
                                    {appointment.status}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openAppointmentModal(appointment)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const client = clients.find(c => c.id === appointment.clientId)
                                    if (client) openMedicalRecordModal(undefined, client.id)
                                  }}
                                >
                                  <FileText className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        {appointments.filter(apt => apt.date === new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' }).format(selectedDate)).length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            No appointments scheduled for this date
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Card className="bg-white/60 backdrop-blur-sm border border-[#fbc6c5]/20">
                <CardHeader>
                  <CardTitle>All Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 mb-4">
                    <div className="lg:col-span-2">
                      <Input
                        placeholder="Search by client or service"
                        value={appointmentsSearch}
                        onChange={(e) => { setAppointmentsSearch(e.target.value); setAppointmentsPage(1) }}
                      />
                    </div>
                    <div>
                      <Select value={appointmentsStatusFilter} onValueChange={(v) => { setAppointmentsStatusFilter(v); setAppointmentsPage(1) }}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="no-show">No Show</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Select value={appointmentsServiceFilter} onValueChange={(v) => { setAppointmentsServiceFilter(v); setAppointmentsPage(1) }}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Service" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Services</SelectItem>
                          {services.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Input type="date" value={appointmentsDateFrom} onChange={(e) => { setAppointmentsDateFrom(e.target.value); setAppointmentsPage(1) }} className="h-9" />
                    </div>
                    <div>
                      <Input type="date" value={appointmentsDateTo} onChange={(e) => { setAppointmentsDateTo(e.target.value); setAppointmentsPage(1) }} className="h-9" />
                    </div>
                    <div>
                      <Select value={appointmentsSort} onValueChange={setAppointmentsSort}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Sort" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="date_desc">Date ↓</SelectItem>
                          <SelectItem value="date_asc">Date ↑</SelectItem>
                          <SelectItem value="price_desc">Price ↓</SelectItem>
                          <SelectItem value="price_asc">Price ↑</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {(() => {
                    const inRange = (d: string) => {
                      if (!appointmentsDateFrom && !appointmentsDateTo) return true
                      const t = new Date(d).getTime()
                      const from = appointmentsDateFrom ? new Date(appointmentsDateFrom).getTime() : -Infinity
                      const to = appointmentsDateTo ? new Date(appointmentsDateTo).getTime() : Infinity
                      return t >= from && t <= to
                    }
                    const filtered = appointments
                      .filter(a => inRange(a.date))
                      .filter(a => appointmentsStatusFilter === 'all' ? true : a.status === appointmentsStatusFilter)
                      .filter(a => appointmentsServiceFilter === 'all' ? true : a.service === appointmentsServiceFilter)
                      .filter(a => {
                        if (!appointmentsSearch.trim()) return true
                        const q = appointmentsSearch.toLowerCase()
                        return (
                          a.clientName.toLowerCase().includes(q) ||
                          a.clientEmail.toLowerCase().includes(q) ||
                          a.clientPhone.toLowerCase().includes(q) ||
                          a.service.toLowerCase().includes(q)
                        )
                      })
                      .sort((x, y) => {
                        if (appointmentsSort === 'date_desc') return new Date(y.date).getTime() - new Date(x.date).getTime()
                        if (appointmentsSort === 'date_asc') return new Date(x.date).getTime() - new Date(y.date).getTime()
                        if (appointmentsSort === 'price_desc') return y.price - x.price
                        if (appointmentsSort === 'price_asc') return x.price - y.price
                        return 0
                      })

                    const totalPages = Math.max(1, Math.ceil(filtered.length / appointmentsPageSize))
                    const page = Math.min(appointmentsPage, totalPages)
                    const start = (page - 1) * appointmentsPageSize
                    const pageItems = filtered.slice(start, start + appointmentsPageSize)

                    return (
                      <div className="space-y-3">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Client</TableHead>
                              <TableHead>Service</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Time</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Duration</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {pageItems.map(a => (
                              <TableRow key={a.id} className="cursor-pointer" onClick={() => setSelectedDate(new Date(a.date + 'T00:00:00'))}>
                                <TableCell>
                                  <div className="font-medium">{a.clientName}</div>
                                  <div className="text-xs text-gray-500">{a.clientEmail} • {a.clientPhone}</div>
                                </TableCell>
                                <TableCell className="max-w-xs truncate">{a.service}</TableCell>
                                <TableCell>{new Date(a.date).toLocaleDateString()}</TableCell>
                                <TableCell>{a.time}</TableCell>
                                <TableCell>
                                  <Select
                                    value={a.status}
                                    onValueChange={(value) => {
                                      appointmentService.updateAppointment(a.id, { status: value as any })
                                      setAppointments(appointmentService.getAllAppointments())
                                    }}
                                  >
                                    <SelectTrigger onClick={(e) => e.stopPropagation()} className="w-40">
                                      <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent onClick={(e) => e.stopPropagation()}>
                                      <SelectItem value="scheduled">Scheduled</SelectItem>
                                      <SelectItem value="confirmed">Confirmed</SelectItem>
                                      <SelectItem value="completed">Completed</SelectItem>
                                      <SelectItem value="cancelled">Cancelled</SelectItem>
                                      <SelectItem value="no-show">No Show</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell>{a.duration} min</TableCell>
                                <TableCell>₱{a.price.toLocaleString()}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Button size="sm" variant="outline" onClick={() => { quickAddClientFromAppointment(a) }}>
                                      <UserPlus className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => openAppointmentModal(a)}>
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={async () => {
                                      if (!confirmTwice(a.clientName || 'this appointment')) return
                                      const res = await fetch('/api/admin/appointments', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: a.id }) })
                                      if (res.ok) { showNotification('success', 'Appointment deleted'); await loadAllData() } else { showNotification('error', 'Failed to delete appointment') }
                                    }}>
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">Page {page} of {totalPages}</div>
                          <div className="flex items-center gap-2">
                            <Select value={String(appointmentsPageSize)} onValueChange={(v) => { setAppointmentsPageSize(parseInt(v)); setAppointmentsPage(1) }}>
                            <SelectTrigger className="w-24 h-9">
                              <SelectValue placeholder="Rows" />
                            </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button variant="outline" onClick={() => setAppointmentsPage(Math.max(1, page - 1))}>Prev</Button>
                            <Button variant="outline" onClick={() => setAppointmentsPage(Math.min(totalPages, page + 1))}>Next</Button>
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>
            </TabsContent>
            </LazyTabContent>

            {/* Payment Processing - Premium Animated */}
            <LazyTabContent isActive={activeTab === "payments"}>
              <TabsContent value="payments" className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Payment Management</h2>
                <Button
                  onClick={() => openPaymentModal()}
                  className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white shadow-2xl shadow-green-500/30 hover:shadow-green-500/40 transition-all duration-300 hover:scale-105 font-bold px-6 py-3 rounded-2xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Record Payment
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="relative sm:col-span-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by client or transaction"
                    value={paymentSearch}
                    onChange={(e) => { setPaymentSearch(e.target.value); setPaymentPage(1) }}
                    className="pl-10"
                  />
                </div>
                <Select value={paymentMethodFilter} onValueChange={(v) => { setPaymentMethodFilter(v); setPaymentPage(1) }}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Method" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="gcash">GCash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={paymentStatusFilter} onValueChange={(v) => { setPaymentStatusFilter(v); setPaymentPage(1) }}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="date" value={paymentDateFrom} onChange={(e) => { setPaymentDateFrom(e.target.value); setPaymentPage(1) }} className="h-9" />
                <Input type="date" value={paymentDateTo} onChange={(e) => { setPaymentDateTo(e.target.value); setPaymentPage(1) }} className="h-9" />
                <Select value={paymentSort} onValueChange={(v) => { setPaymentSort(v); setPaymentPage(1) }}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Sort" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date_desc">Date ↓</SelectItem>
                    <SelectItem value="date_asc">Date ↑</SelectItem>
                    <SelectItem value="amount_desc">Amount ↓</SelectItem>
                    <SelectItem value="amount_asc">Amount ↑</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Card className="bg-white/60 backdrop-blur-sm border border-[#fbc6c5]/20">
                <CardContent className="p-4 sm:p-6">
                  {(() => {
                    const inRange = (iso: string) => {
                      if (!paymentDateFrom && !paymentDateTo) return true
                      const t = new Date(iso).getTime()
                      const from = paymentDateFrom ? new Date(paymentDateFrom).getTime() : -Infinity
                      const to = paymentDateTo ? new Date(paymentDateTo).getTime() : Infinity
                      return t >= from && t <= to
                    }
                    const filtered = payments
                      .filter(p => inRange(p.createdAt))
                      .filter(p => paymentMethodFilter === 'all' ? true : p.method === paymentMethodFilter)
                      .filter(p => paymentStatusFilter === 'all' ? true : p.status === paymentStatusFilter)
                      .filter(p => {
                        const q = paymentSearch.trim().toLowerCase()
                        if (!q) return true
                        const client = clients.find(c => c.id === p.clientId)
                        const name = client ? `${client.firstName} ${client.lastName}`.toLowerCase() : ''
                        return name.includes(q) || (p.transactionId || '').toLowerCase().includes(q)
                      })
                      .sort((a, b) => {
                        if (paymentSort === 'date_desc') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                        if (paymentSort === 'date_asc') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                        if (paymentSort === 'amount_desc') return b.amount - a.amount
                        if (paymentSort === 'amount_asc') return a.amount - b.amount
                        return 0
                      })

                    const totalPages = Math.max(1, Math.ceil(filtered.length / paymentPageSize))
                    const page = Math.max(1, Math.min(paymentPage, totalPages))
                    const start = (page - 1) * paymentPageSize
                    const pageItems = filtered.slice(start, start + paymentPageSize)

                    return (
                      <div className="space-y-3">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Client</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Method</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {pageItems.map((payment) => {
                              const client = clients.find(c => c.id === payment.clientId)
                              return (
                                <TableRow key={payment.id}>
                                  <TableCell>{client ? `${client.firstName} ${client.lastName}` : 'Unknown Client'}</TableCell>
                                  <TableCell>₱{payment.amount.toLocaleString()}</TableCell>
                                  <TableCell className="capitalize">{payment.method.replace('_', ' ')}</TableCell>
                                  <TableCell>
                                    <Badge className={
                                      payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                      payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                      payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                                      'bg-gray-100 text-gray-800'
                                    }>
                                      {payment.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Button size="sm" variant="outline" onClick={() => openPaymentModal(payment)}>
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      {payment.receiptUrl && (
                                        <Button size="sm" variant="outline">
                                          <Download className="w-4 h-4" />
                                        </Button>
                                      )}
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={async () => {
                                          if (!confirmTwice('this payment')) return
                                          try {
                                            const res = await fetch('/api/admin/payments', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: payment.id }) })
                                            if (res.ok) { await refreshPayments(); showNotification('success', 'Payment deleted') } else { showNotification('error', 'Failed to delete payment') }
                                          } catch { showNotification('error', 'Failed to delete payment') }
                                        }}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                            {pageItems.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center text-gray-500">No payments</TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">Page {page} of {totalPages}</div>
                          <div className="flex items-center gap-2">
                            <Select value={String(paymentPageSize)} onValueChange={(v) => { setPaymentPageSize(parseInt(v)); setPaymentPage(1) }}>
                              <SelectTrigger className="w-24 h-9"><SelectValue placeholder="Rows" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button variant="outline" onClick={() => setPaymentPage(Math.max(1, page - 1))}>Prev</Button>
                            <Button variant="outline" onClick={() => setPaymentPage(Math.min(totalPages, page + 1))}>Next</Button>
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>
            </TabsContent>
            </LazyTabContent>

            {/* Electronic Medical Records - Premium Animated */}
            <LazyTabContent isActive={activeTab === "medical"}>
              <TabsContent value="medical" className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Electronic Medical Records</h2>
                <Button
                  onClick={() => openMedicalRecordModal()}
                  className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:via-amber-600 hover:to-yellow-600 text-white shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/40 transition-all duration-300 hover:scale-105 font-bold px-6 py-3 rounded-2xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Record
                </Button>
              </div>

              <Card className="bg-white/60 backdrop-blur-sm border border-[#fbc6c5]/20">
                <CardContent className="p-4 sm:p-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Chief Complaint</TableHead>
                        <TableHead>Treatment Plan</TableHead>
                        <TableHead>Confidential</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {medicalRecords.map((record) => {
                        const client = clients.find(c => c.id === record.clientId)
                        return (
                          <TableRow key={record.id}>
                            <TableCell>{client ? `${client.firstName} ${client.lastName}` : 'Unknown Client'}</TableCell>
                            <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                            <TableCell className="max-w-xs truncate">{record.chiefComplaint}</TableCell>
                            <TableCell className="max-w-xs truncate">{record.treatmentPlan}</TableCell>
                            <TableCell>
                              {record.isConfidential ? (
                                <Shield className="w-4 h-4 text-red-500" />
                              ) : (
                                <div className="w-4 h-4" />
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openMedicalRecordModal(record)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            </LazyTabContent>

            {/* User Management - Premium Animated */}
            <LazyTabContent isActive={activeTab === "clients"}>
              <TabsContent value="clients" className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Client Management</h2>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search clients..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button
                    onClick={() => openClientModal()}
                    className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-105 font-bold px-6 py-3 rounded-2xl"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Client
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-4">
                <Select value={clientsStatusFilter} onValueChange={setClientsStatusFilter}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={clientsSourceFilter} onValueChange={setClientsSourceFilter}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Source" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={clientsSort} onValueChange={setClientsSort}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Sort" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name_asc">Name (A→Z)</SelectItem>
                    <SelectItem value="name_desc">Name (Z→A)</SelectItem>
                    <SelectItem value="spent_desc">Total Spent (High→Low)</SelectItem>
                    <SelectItem value="last_visit_desc">Last Visit (Newest)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="overflow-x-auto">
                <Table className="min-w-[700px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead scope="col">Name</TableHead>
                      <TableHead scope="col">Email</TableHead>
                      <TableHead scope="col">Phone</TableHead>
                      <TableHead scope="col">Status</TableHead>
                      <TableHead scope="col">Total Spent</TableHead>
                      <TableHead scope="col">Last Visit</TableHead>
                      <TableHead scope="col">Source</TableHead>
                      <TableHead scope="col" className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients
                      .filter(client => 
                        searchQuery === '' || 
                        client.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        client.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (client.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (client.phone || '').includes(searchQuery)
                      )
                      .filter(c => clientsStatusFilter === 'all' ? true : c.status === clientsStatusFilter)
                      .filter(c => clientsSourceFilter === 'all' ? true : c.source === clientsSourceFilter)
                      .sort((a, b) => {
                        if (clientsSort === 'name_asc') return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
                        if (clientsSort === 'name_desc') return `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`)
                        if (clientsSort === 'spent_desc') return (b.totalSpent || 0) - (a.totalSpent || 0)
                        if (clientsSort === 'last_visit_desc') return new Date(b.lastVisit || 0).getTime() - new Date(a.lastVisit || 0).getTime()
                        return 0
                      })
                      .map((client) => (
                        <TableRow key={client.id}>
                          <TableCell className="font-medium">{client.firstName} {client.lastName}</TableCell>
                          <TableCell className="truncate max-w-[220px]">{client.email}</TableCell>
                          <TableCell className="truncate max-w-[160px]">{client.phone}</TableCell>
                          <TableCell>
                            <Badge className={
                              client.status === 'active' ? 'bg-green-100 text-green-800' :
                              client.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {client.status}
                            </Badge>
                          </TableCell>
                          <TableCell>₱{client.totalSpent.toLocaleString()}</TableCell>
                          <TableCell>{client.lastVisit ? new Date(client.lastVisit).toLocaleDateString() : '-'}</TableCell>
                          <TableCell>{client.source.replace('_', ' ')}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline" onClick={() => openClientModal(client)} aria-label="Edit client">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => openMedicalRecordModal(undefined, client.id)} aria-label="Open medical records">
                                <FileText className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" aria-label="Call client">
                                <Phone className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" aria-label="Email client">
                                <Mail className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setConfirmClient(client)} aria-label="Delete client">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
                </TabsContent>
                </LazyTabContent>

                {/* Confirm Delete Client Dialog */}
                <Dialog open={!!confirmClient} onOpenChange={(open) => { if (!open && !confirmDeleting) setConfirmClient(null) }}>
                  <DialogContent className="max-w-md bg-white/80 backdrop-blur-sm border border-rose-200/60 shadow-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-rose-600" />
                        Delete Client
                      </DialogTitle>
                    </DialogHeader>
                    {confirmClient && (
                      <div className="space-y-3 text-sm text-gray-700">
                        <p>Are you sure you want to delete this client? This action cannot be undone.</p>
                        <div className="rounded-lg border bg-white/70 p-3">
                          <div className="font-medium">{confirmClient.firstName} {confirmClient.lastName}</div>
                          {confirmClient.email && <div className="text-gray-600">{confirmClient.email}</div>}
                          {confirmClient.phone && <div className="text-gray-600">{confirmClient.phone}</div>}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="outline" onClick={() => setConfirmClient(null)} disabled={confirmDeleting}>Cancel</Button>
                      <Button
                        variant="destructive"
                        onClick={async () => {
                          if (!confirmClient) return
                          setConfirmDeleting(true)
                          try {
                            const res = await fetch('/api/admin/clients', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: confirmClient.id }) })
                            if (res.ok) {
                              await clientService.fetchFromSupabase?.()
                              setClients(clientService.getAllClients())
                              showNotification('success', 'Client deleted')
                              setConfirmClient(null)
                            } else {
                              showNotification('error', 'Failed to delete client')
                            }
                          } finally {
                            setConfirmDeleting(false)
                          }
                        }}
                      >
                        {confirmDeleting ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </>
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

            <LazyTabContent isActive={activeTab === "staff"}>
              <TabsContent value="staff" className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Staffing Management</h2>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search staff..."
                      value={staffSearch}
                      onChange={(e) => setStaffSearch(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button
                    onClick={() => openStaffModal()}
                    className="bg-gradient-to-r from-slate-600 via-gray-700 to-slate-800 hover:from-slate-700 hover:via-gray-800 hover:to-slate-900 text-white shadow-2xl shadow-slate-500/30 hover:shadow-slate-500/40 transition-all duration-300 hover:scale-105 font-bold px-6 py-3 rounded-2xl"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Staff
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <Select value={staffPositionFilter} onValueChange={setStaffPositionFilter}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Positions</SelectItem>
                    <SelectItem value="anesthesiologist">Anesthesiologist</SelectItem>
                    <SelectItem value="surgeon_aesthetic">Surgeon (Aesthetic)</SelectItem>
                    <SelectItem value="dermatologist">Dermatologist</SelectItem>
                    <SelectItem value="nurse">Nurse</SelectItem>
                    <SelectItem value="therapist">Therapist</SelectItem>
                    <SelectItem value="technician">Technician</SelectItem>
                    <SelectItem value="receptionist">Receptionist</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={staffStatusFilter} onValueChange={setStaffStatusFilter}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on_leave">On Leave</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="terminated">Terminated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(() => {
                const filteredStaff = useMemo(() => {
                  const q = staffSearch.toLowerCase()
                  return staff
                    .filter(s => staffStatusFilter === 'all' ? true : s.status === staffStatusFilter)
                    .filter(s => staffPositionFilter === 'all' ? true : s.position === staffPositionFilter)
                    .filter(s =>
                      q === '' ||
                      s.firstName.toLowerCase().includes(q) ||
                      s.lastName.toLowerCase().includes(q) ||
                      s.email.toLowerCase().includes(q) ||
                      s.phone.includes(staffSearch)
                    )
                }, [staff, staffStatusFilter, staffPositionFilter, staffSearch])
                return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStaff.map((s) => (
                  <Card key={s.id} className="bg-gradient-to-br from-slate-50/40 via-white/60 to-gray-50/30 backdrop-blur-2xl border border-white/70 shadow-2xl shadow-slate-500/10 transition-all duration-500 hover:shadow-slate-500/20 hover:scale-[1.02]">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-lg">{s.firstName} {s.lastName}</h3>
                            <p className="text-sm text-gray-600">{s.email}</p>
                            <p className="text-sm text-gray-600">{s.phone}</p>
                          </div>
                          <Badge className="bg-gradient-to-r from-slate-600 to-gray-700 text-white">{s.position.replace('_', ' ')}</Badge>
                        </div>
                        <div className="space-y-2 mb-4">
                          {s.department && (
                            <div className="flex items-center gap-2 text-sm">
                              <Settings className="w-4 h-4 text-gray-500" />
                              <span>Department: {s.department}</span>
                            </div>
                          )}
                          {s.licenseNumber && (
                            <div className="flex items-center gap-2 text-sm">
                              <Shield className="w-4 h-4 text-gray-500" />
                              <span>License: {s.licenseNumber}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm">
                            <CalendarIcon className="w-4 h-4 text-gray-500" />
                            <span>Hired: {new Date(s.hireDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => openStaffModal(s)} className="flex-1">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" onClick={async () => {
                            if (!confirmTwice(`${s.firstName} ${s.lastName}`.trim() || 'this staff')) return
                            const res = await fetch('/api/admin/staff', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: s.id }) })
                            if (res.ok) { await staffService.fetchFromSupabase?.(); setStaff(staffService.getAllStaff()); showNotification('success', 'Staff deleted') } else { showNotification('error', 'Failed to delete staff') }
                          }}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              )
              })()}
            </TabsContent>
            </LazyTabContent>

            <LazyTabContent isActive={activeTab === "influencers"}>
              <TabsContent value="influencers" className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Influencers Referral Management</h2>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input placeholder="Search influencers..." value={influencerSearch} onChange={(e) => setInfluencerSearch(e.target.value)} className="pl-10 w-64" />
                  </div>
                  <Button onClick={() => openInfluencerModal()} className="bg-gradient-to-r from-fuchsia-500 via-violet-600 to-indigo-600 hover:from-fuchsia-600 hover:via-violet-700 hover:to-indigo-700 text-white shadow-2xl shadow-fuchsia-500/30 hover:shadow-fuchsia-500/40 transition-all duration-300 hover:scale-105 font-bold px-6 py-3 rounded-2xl">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Influencer
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <Select value={influencerPlatformFilter} onValueChange={setInfluencerPlatformFilter}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Platform" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={influencerStatusFilter} onValueChange={setInfluencerStatusFilter}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" variant="outline" onClick={() => setIsReferralDetailsOpen(true)} className="h-9 w-full">
                  <Eye className="w-4 h-4 mr-2" />
                  View All Referrals
                </Button>
              </div>

              {(() => {
                const q = influencerSearch.toLowerCase()
                const filteredInfluencers = useMemo(() => {
                  return influencers
                    .filter(i => influencerStatusFilter === 'all' ? true : i.status === influencerStatusFilter)
                    .filter(i => influencerPlatformFilter === 'all' ? true : i.platform === influencerPlatformFilter)
                    .filter(i => q === '' || i.name.toLowerCase().includes(q) || (i.handle ?? '').toLowerCase().includes(q))
                }, [influencers, influencerStatusFilter, influencerPlatformFilter, influencerSearch])
                return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredInfluencers
                  .map((i) => {
                    const stats = influencerService.getStats(i.id)
                    return (
                      <Card key={i.id} className="bg-gradient-to-br from-fuchsia-50/40 via-white/60 to-violet-50/30 backdrop-blur-2xl border border-white/70 shadow-2xl shadow-fuchsia-500/10 transition-all duration-500 hover:shadow-fuchsia-500/20 hover:scale-[1.02]">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-bold text-lg">{i.name} {i.handle && <span className="text-sm text-gray-500">({i.handle})</span>}</h3>
                              <p className="text-sm text-gray-600 capitalize">{i.platform}</p>
                              {i.email && <p className="text-sm text-gray-600">{i.email}</p>}
                              {i.phone && <p className="text-sm text-gray-600">{i.phone}</p>}
                            </div>
                            <Badge className="bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white">{i.status}</Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="p-3 rounded-xl bg-white/50">
                              <p className="text-xs text-gray-500">Referrals</p>
                              <p className="text-xl font-bold">{stats.totalReferrals}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-white/50">
                              <p className="text-xs text-gray-500">Revenue</p>
                              <p className="text-xl font-bold">₱{stats.totalRevenue.toLocaleString()}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-white/50">
                              <p className="text-xs text-gray-500">Commission ({Math.round(stats.commissionRate*100)}%)</p>
                              <p className="text-xl font-bold">₱{stats.commissionDue.toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="p-3 rounded-xl bg-white/50">
                              <p className="text-xs text-gray-500">Paid</p>
                              <p className="text-lg font-bold">₱{stats.commissionPaid.toLocaleString()}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-white/50">
                              <p className="text-xs text-gray-500">Remaining</p>
                              <p className="text-lg font-bold">₱{stats.commissionRemaining.toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mb-4">
                            <Button size="sm" variant="outline" onClick={() => openInfluencerModal(i)} className="w-full sm:w-auto">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => { setSelectedInfluencer(i); setIsReferralModalOpen(true) }} className="w-full sm:w-auto">
                              <Plus className="w-4 h-4 mr-2" />
                              Add Referral
                            </Button>
                            
                            <Button size="sm" variant="outline" onClick={async () => {
                              if (!confirmTwice(i.name || 'this influencer')) return
                              const res = await fetch('/api/admin/influencers', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: i.id }) })
                              if (res.ok) { await influencerService.fetchFromSupabase?.(); setInfluencers(influencerService.getAllInfluencers()); showNotification('success', 'Influencer deleted') } else { showNotification('error', 'Failed to delete influencer') }
                            }} className="w-full sm:w-auto">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                          
                        </CardContent>
                      </Card>
                    )
                  })}
              </div>
              )
              })()}
            </TabsContent>
            </LazyTabContent>

            <LazyTabContent isActive={activeTab === "analytics"}>
              <TabsContent value="analytics" className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
                <div className="grid grid-cols-2 gap-3 w-full sm:w-auto sm:flex sm:items-center">
                  <Input type="date" value={analyticsDateFrom} onChange={(e) => setAnalyticsDateFrom(e.target.value)} className="h-9" />
                  <Input type="date" value={analyticsDateTo} onChange={(e) => setAnalyticsDateTo(e.target.value)} className="h-9" />
                </div>
              </div>

              {(() => {
                const inRange = (iso: string) => {
                  const t = new Date(iso).getTime()
                  const from = analyticsDateFrom ? new Date(analyticsDateFrom).getTime() : -Infinity
                  const to = analyticsDateTo ? new Date(analyticsDateTo).getTime() : Infinity
                  return t >= from && t <= to
                }
                const inRangeDateOnly = (d: string) => {
                  const t = new Date(d).getTime()
                  const from = analyticsDateFrom ? new Date(analyticsDateFrom).getTime() : -Infinity
                  const to = analyticsDateTo ? new Date(analyticsDateTo).getTime() : Infinity
                  return t >= from && t <= to
                }

                const completedPayments = payments.filter(p => p.status === 'completed' && inRange(p.createdAt))
                const totalRevenue = completedPayments.reduce((s, p) => s + p.amount, 0)
                const avgOrder = completedPayments.length ? totalRevenue / completedPayments.length : 0

                const bookedApts = appointments.filter(a => inRangeDateOnly(a.date))
                const completedApts = appointments.filter(a => a.status === 'completed' && inRangeDateOnly(a.date))

                const bySource: Record<string, number> = {}
                completedPayments.forEach(p => {
                  const c = clients.find(x => x.id === p.clientId)
                  const src = c?.source || 'unknown'
                  bySource[src] = (bySource[src] || 0) + 1
                })

                const platformAgg: Record<string, { referrals: number; revenue: number }> = {}
                influencers.forEach(i => {
                  const refs = influencerService.getReferralsByInfluencer(i.id).filter(r => inRange(r.date))
                  const count = refs.length
                  const rev = refs.reduce((s, r) => s + r.amount, 0)
                  const key = i.platform
                  platformAgg[key] = {
                    referrals: (platformAgg[key]?.referrals || 0) + count,
                    revenue: (platformAgg[key]?.revenue || 0) + rev,
                  }
                })

                const topInfluencers = influencers
                  .map(i => ({ i, refs: influencerService.getReferralsByInfluencer(i.id).filter(r => inRange(r.date)) }))
                  .map(({ i, refs }) => ({ id: i.id, name: i.name, handle: i.handle, platform: i.platform, count: refs.length, revenue: refs.reduce((s, r) => s + r.amount, 0) }))
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 5)

                const sourceLabels: Record<string, string> = { website: 'Website', referral: 'Referral', social_media: 'Social Media', walk_in: 'Walk-in', unknown: 'Unknown' }

                const statusBreakdown: Record<string, number> = {}
                bookedApts.forEach(a => { statusBreakdown[a.status] = (statusBreakdown[a.status] || 0) + 1 })

                const paymentBreakdown: Record<string, number> = {}
                payments.filter(p => inRange(p.createdAt)).forEach(p => { paymentBreakdown[p.status] = (paymentBreakdown[p.status] || 0) + 1 })

                const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0)

                return (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <Card className="bg-gradient-to-br from-blue-50/40 via-white/50 to-cyan-50/30 backdrop-blur-xl border border-blue-200/50 shadow-2xl">
                        <CardContent className="p-6">
                          <p className="text-sm text-blue-600/80">Revenue</p>
                          <p className="text-3xl font-bold">₱{totalRevenue.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">Avg Order: ₱{Math.round(avgOrder).toLocaleString()}</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-purple-50/40 via-white/50 to-violet-50/30 backdrop-blur-xl border border-purple-200/50 shadow-2xl">
                        <CardContent className="p-6">
                          <p className="text-sm text-purple-600/80">Bookings</p>
                          <p className="text-3xl font-bold">{bookedApts.length}</p>
                          <p className="text-xs text-gray-500">Completed: {completedApts.length}</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-fuchsia-50/40 via-white/50 to-violet-50/30 backdrop-blur-xl border border-fuchsia-200/50 shadow-2xl">
                        <CardContent className="p-6">
                          <p className="text-sm text-fuchsia-600/80">Influencer Referrals</p>
                          <p className="text-3xl font-bold">{topInfluencers.reduce((s, x) => s + x.count, 0)}</p>
                          <p className="text-xs text-gray-500">Revenue: ₱{topInfluencers.reduce((s, x) => s + x.revenue, 0).toLocaleString()}</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-emerald-50/40 via-white/50 to-teal-50/30 backdrop-blur-xl border border-emerald-200/50 shadow-2xl">
                        <CardContent className="p-6">
                          <p className="text-sm text-emerald-600/80">Payments</p>
                          <p className="text-3xl font-bold">{completedPayments.length}</p>
                          <p className="text-xs text-gray-500">Completed</p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card className="bg-white/60 backdrop-blur-sm border">
                        <CardHeader>
                          <CardTitle>Conversions by Source</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {Object.entries(sourceLabels).map(([key, label]) => (
                              <div key={key} className="flex items-center gap-4">
                                <div className="w-28 text-sm text-gray-600">{label}</div>
                                <div className="flex-1 h-2 bg-gray-200/60 rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" style={{ width: `${pct(bySource[key] || 0, completedPayments.length)}%` }}></div>
                                </div>
                                <div className="w-12 text-sm font-medium text-gray-900 text-right">{bySource[key] || 0}</div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-white/60 backdrop-blur-sm border">
                        <CardHeader>
                          <CardTitle>Influencer Performance by Platform</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {Object.entries(platformAgg).map(([platform, stats]) => (
                              <div key={platform} className="grid grid-cols-3 gap-3 items-center">
                                <div className="text-sm font-medium capitalize">{platform}</div>
                                <div className="text-sm">Referrals: {stats.referrals}</div>
                                <div className="text-sm">Revenue: ₱{stats.revenue.toLocaleString()}</div>
                              </div>
                            ))}
                            {Object.keys(platformAgg).length === 0 && (
                              <div className="text-center py-6 text-gray-500">No data for selected range</div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card className="bg-white/60 backdrop-blur-sm border">
                        <CardHeader>
                          <CardTitle>Appointment Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {Object.entries(statusBreakdown).map(([st, n]) => (
                              <div key={st} className="flex items-center gap-4">
                                <div className="w-28 text-sm capitalize text-gray-700">{st.replace('_',' ')}</div>
                                <div className="flex-1 h-2 bg-gray-200/60 rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full" style={{ width: `${pct(n, bookedApts.length)}%` }}></div>
                                </div>
                                <div className="w-12 text-sm font-medium text-gray-900 text-right">{n}</div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-white/60 backdrop-blur-sm border">
                        <CardHeader>
                          <CardTitle>Payment Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {Object.entries(paymentBreakdown).map(([st, n]) => (
                              <div key={st} className="flex items-center gap-4">
                                <div className="w-28 text-sm capitalize text-gray-700">{st.replace('_',' ')}</div>
                                <div className="flex-1 h-2 bg-gray-200/60 rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: `${pct(n, payments.filter(p => inRange(p.createdAt)).length)}%` }}></div>
                                </div>
                                <div className="w-12 text-sm font-medium text-gray-900 text-right">{n}</div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="bg-white/60 backdrop-blur-sm border">
                      <CardHeader>
                        <CardTitle>Top Influencers</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Platform</TableHead>
                              <TableHead>Referrals</TableHead>
                              <TableHead>Revenue</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {topInfluencers.map(t => (
                              <TableRow key={t.id}>
                                <TableCell>{t.name} {t.handle ? `(${t.handle})` : ''}</TableCell>
                                <TableCell className="capitalize">{t.platform}</TableCell>
                                <TableCell>{t.count}</TableCell>
                                <TableCell>₱{t.revenue.toLocaleString()}</TableCell>
                              </TableRow>
                            ))}
                            {topInfluencers.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center text-gray-500">No influencer data</TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>
                )
              })()}
            </TabsContent>
            </LazyTabContent>

            {/* Social Media Integration - Premium Animated */}
            <LazyTabContent isActive={activeTab === "social"}>
              <TabsContent value="social" className="space-y-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Social Media Management</h2>
                <Button
                  onClick={loadAllData}
                  variant="outline"
                  className="border-[#fbc6c5]/30"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>

              {/* Conversation UI */}
              <SocialConversationUI socialMediaService={socialMediaService} />
            </TabsContent>
          </LazyTabContent>
        </Tabs>
      </motion.div>
    </div>
  </div>
</div>
</div>

    {/* Appointment Modal */}
      <Dialog open={isAppointmentModalOpen} onOpenChange={setIsAppointmentModalOpen}>
         <DialogContent className="max-w-2xl will-change-transform [backface-visibility:hidden] [transform:translateZ(0)] [contain:layout_paint]">
          <DialogHeader>
            <DialogTitle>
              {selectedAppointment ? 'Edit Appointment' : 'New Appointment'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAppointmentSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  value={appointmentForm.clientName || ''}
                  onChange={(e) => setAppointmentForm(prev => ({ ...prev, clientName: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="clientEmail">Client Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={appointmentForm.clientEmail || ''}
                  onChange={(e) => setAppointmentForm(prev => ({ ...prev, clientEmail: e.target.value }))}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientPhone">Client Phone</Label>
                <Input
                  id="clientPhone"
                  value={appointmentForm.clientPhone || ''}
                  onChange={(e) => setAppointmentForm(prev => ({ ...prev, clientPhone: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="service">Service</Label>
                <Select
                  value={appointmentForm.service || ''}
                  onValueChange={(value) => setAppointmentForm(prev => ({ ...prev, service: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service} value={service}>
                        {service}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={appointmentForm.date || ''}
                  onChange={(e) => setAppointmentForm(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Select
                  value={appointmentForm.time || ''}
                  onValueChange={(value) => setAppointmentForm(prev => ({ ...prev, time: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {appointmentService.getAvailableTimeSlots(appointmentForm.date || '').map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="duration">Duration (min)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={appointmentForm.duration || ''}
                  onChange={(e) => setAppointmentForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price (₱)</Label>
                <Input
                  id="price"
                  type="number"
                  value={appointmentForm.price || ''}
                  onChange={(e) => setAppointmentForm(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={appointmentForm.status || ''}
                  onValueChange={(value) => setAppointmentForm(prev => ({ ...prev, status: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="no-show">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={appointmentForm.notes || ''}
                onChange={(e) => setAppointmentForm(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsAppointmentModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Appointment'}
              </Button>
            </div>
          </form>
       </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedPayment ? 'Edit Payment' : 'Record Payment'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientId">Client</Label>
                <Select
                  value={paymentForm.clientId || ''}
                  onValueChange={(value) => setPaymentForm(prev => ({ ...prev, clientId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.firstName} {client.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="amount">Amount (₱)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={paymentForm.amount || ''}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="method">Payment Method</Label>
                <Select
                  value={paymentForm.method || ''}
                  onValueChange={(value) => setPaymentForm(prev => ({ ...prev, method: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gcash">GCash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={paymentForm.status || ''}
                  onValueChange={(value) => setPaymentForm(prev => ({ ...prev, status: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="transactionId">Transaction ID</Label>
              <Input
                id="transactionId"
                value={paymentForm.transactionId || ''}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, transactionId: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="paymentNotes">Notes</Label>
              <Textarea
                id="paymentNotes"
                value={paymentForm.notes || ''}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="receiptUpload">Upload Receipt/Proof</Label>
              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <input ref={paymentFileInputRef} type="file" accept="image/*,application/pdf" multiple className="hidden" onChange={handleFileInputChange} />
                  <Button type="button" variant="outline" onClick={handleUploadButtonClick} className="mr-2">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Files
                  </Button>
                  <Button type="button" variant="outline" onClick={() => openCamera('payment')}>
                    <Camera className="w-4 h-4 mr-2" />
                    Camera
                  </Button>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  PNG, JPG, PDF up to 10MB
                </p>
                {Array.isArray(paymentForm.uploadedFiles) && paymentForm.uploadedFiles.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {paymentForm.uploadedFiles.map((url, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white/60 border rounded-md p-2">
                        <FileImage className="w-4 h-4" />
                        <a href={url} target="_blank" rel="noreferrer" className="text-sm truncate max-w-[160px]">
                          {url.split('/').pop()}
                        </a>
                        <Button size="sm" variant="outline" className="ml-auto" onClick={() => {
                          const next = (paymentForm.uploadedFiles || []).filter(u => u !== url)
                          setPaymentForm(prev => ({ ...prev, uploadedFiles: next, receiptUrl: prev.receiptUrl === url ? next[0] : prev.receiptUrl }))
                        }}>Remove</Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Payment'}
              </Button>
            </div>
          </form>
       </DialogContent>
      </Dialog>

      <Dialog open={isCameraDialogOpen} onOpenChange={(v) => { if (!v) closeCamera(); else setIsCameraDialogOpen(true) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Capture Receipt</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg overflow-hidden bg-black">
              <video ref={videoRef} className="w-full h-64 object-contain" playsInline muted />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeCamera}>Cancel</Button>
              <Button type="button" onClick={capturePhoto}>Capture</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

       <Dialog open={isInfluencerModalOpen} onOpenChange={setIsInfluencerModalOpen}>
         <DialogContent className="max-w-2xl will-change-transform [backface-visibility:hidden] [transform:translateZ(0)] [contain:layout_paint]">
           <DialogHeader>
             <DialogTitle>{selectedInfluencer ? 'Edit Influencer' : 'Add New Influencer'}</DialogTitle>
           </DialogHeader>
           <form onSubmit={handleInfluencerSubmit} className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <Label htmlFor="infName">Name</Label>
                 <Input id="infName" value={influencerForm.name || ''} onChange={(e) => setInfluencerForm(prev => ({ ...prev, name: e.target.value }))} required />
               </div>
               <div>
                 <Label htmlFor="infHandle">Handle</Label>
                 <Input id="infHandle" value={influencerForm.handle || ''} onChange={(e) => setInfluencerForm(prev => ({ ...prev, handle: e.target.value }))} />
               </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <Label htmlFor="infPlatform">Platform</Label>
                 <Select value={influencerForm.platform || ''} onValueChange={(v) => setInfluencerForm(prev => ({ ...prev, platform: v as Influencer['platform'] }))}>
                   <SelectTrigger><SelectValue placeholder="Select platform" /></SelectTrigger>
                   <SelectContent>
                     <SelectItem value="instagram">Instagram</SelectItem>
                     <SelectItem value="facebook">Facebook</SelectItem>
                     <SelectItem value="tiktok">TikTok</SelectItem>
                     <SelectItem value="youtube">YouTube</SelectItem>
                     <SelectItem value="other">Other</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
               <div>
                 <Label htmlFor="infReferralCode">Referral Code</Label>
                 <Input id="infReferralCode" value={influencerForm.referralCode || ''} onChange={(e) => setInfluencerForm(prev => ({ ...prev, referralCode: e.target.value }))} />
               </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <Label htmlFor="infEmail">Email</Label>
                 <Input id="infEmail" type="email" value={influencerForm.email || ''} onChange={(e) => setInfluencerForm(prev => ({ ...prev, email: e.target.value }))} />
               </div>
               <div>
                 <Label htmlFor="infPhone">Phone</Label>
                 <Input id="infPhone" value={influencerForm.phone || ''} onChange={(e) => setInfluencerForm(prev => ({ ...prev, phone: e.target.value }))} />
               </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <Label htmlFor="infRate">Commission Rate (%)</Label>
                 <Input id="infRate" type="number" step="1" value={Math.round((influencerForm.commissionRate || 0.10) * 100)} onChange={(e) => setInfluencerForm(prev => ({ ...prev, commissionRate: Math.max(0, Math.min(100, Number(e.target.value))) / 100 }))} />
               </div>
               <div>
                 <Label htmlFor="infStatus">Status</Label>
                 <Select value={influencerForm.status || ''} onValueChange={(v) => setInfluencerForm(prev => ({ ...prev, status: v as Influencer['status'] }))}>
                   <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                   <SelectContent>
                     <SelectItem value="active">Active</SelectItem>
                     <SelectItem value="inactive">Inactive</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
             </div>
             <div>
               <Label htmlFor="infNotes">Notes</Label>
               <Textarea id="infNotes" rows={3} value={influencerForm.notes || ''} onChange={(e) => setInfluencerForm(prev => ({ ...prev, notes: e.target.value }))} />
             </div>
             <div className="flex justify-end gap-2">
               <Button type="button" variant="outline" onClick={() => setIsInfluencerModalOpen(false)}>Cancel</Button>
               <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Influencer'}</Button>
             </div>
           </form>
         </DialogContent>
       </Dialog>

       <Dialog open={isReferralModalOpen} onOpenChange={setIsReferralModalOpen}>
         <DialogContent className="max-w-lg will-change-transform [backface-visibility:hidden] [transform:translateZ(0)] [contain:layout_paint]">
           <DialogHeader>
             <DialogTitle>Add Referral</DialogTitle>
           </DialogHeader>
           <form onSubmit={handleReferralSubmit} className="space-y-4">
             <div>
               <Label htmlFor="refClientName">Client Name</Label>
               <Input id="refClientName" value={referralForm.clientName || ''} onChange={(e) => setReferralForm(prev => ({ ...prev, clientName: e.target.value }))} required />
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <Label htmlFor="refAmount">Amount (₱)</Label>
                 <Input id="refAmount" type="number" value={referralForm.amount || ''} onChange={(e) => setReferralForm(prev => ({ ...prev, amount: Number(e.target.value) }))} required />
               </div>
               <div>
                 <Label htmlFor="refDate">Date</Label>
                 <Input id="refDate" type="date" value={referralForm.date || ''} onChange={(e) => setReferralForm(prev => ({ ...prev, date: e.target.value }))} required />
               </div>
             </div>
             <div>
               <Label htmlFor="refNotes">Notes</Label>
               <Textarea id="refNotes" rows={3} value={referralForm.notes || ''} onChange={(e) => setReferralForm(prev => ({ ...prev, notes: e.target.value }))} />
             </div>
             <div className="flex justify-end gap-2">
               <Button type="button" variant="outline" onClick={() => setIsReferralModalOpen(false)}>Cancel</Button>
               <Button type="submit" disabled={isLoading || !selectedInfluencer}>{isLoading ? 'Saving...' : 'Save Referral'}</Button>
             </div>
           </form>
       </DialogContent>
      </Dialog>

       <Dialog open={isReferralDetailsOpen} onOpenChange={setIsReferralDetailsOpen}>
         <DialogContent className="max-w-3xl will-change-transform [backface-visibility:hidden] [transform:translateZ(0)] [contain:layout_paint]">
           <DialogHeader>
             <DialogTitle>{selectedInfluencer ? `Referrals for ${selectedInfluencer.name}` : 'Referrals'}</DialogTitle>
           </DialogHeader>
           <div className="space-y-4">
             <div>
               <Label>Influencer</Label>
               <Select value={selectedInfluencer?.id || ''} onValueChange={(v) => {
                 const found = influencers.find(x => x.id === v) || null
                 setSelectedInfluencer(found)
               }}>
                 <SelectTrigger><SelectValue placeholder="Select influencer" /></SelectTrigger>
                 <SelectContent>
                   {influencers.map(inf => (
                     <SelectItem key={inf.id} value={inf.id}>{inf.name} {inf.handle ? `(${inf.handle})` : ''}</SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
               <div className="relative sm:col-span-2">
                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                 <Input placeholder="Search referrals..." value={referralDetailsSearch} onChange={(e) => setReferralDetailsSearch(e.target.value)} className="pl-10" />
               </div>
               <Input type="date" value={referralDateFrom} onChange={(e) => setReferralDateFrom(e.target.value)} />
               <Input type="date" value={referralDateTo} onChange={(e) => setReferralDateTo(e.target.value)} />
             </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Sort</Label>
                <Select value={referralSort} onValueChange={setReferralSort}>
                  <SelectTrigger><SelectValue placeholder="Sort" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date_desc">Date desc</SelectItem>
                    <SelectItem value="date_asc">Date asc</SelectItem>
                    <SelectItem value="amount_desc">Amount desc</SelectItem>
                    <SelectItem value="amount_asc">Amount asc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Page size</Label>
                <Select value={String(referralPageSize)} onValueChange={(v) => setReferralPageSize(Number(v))}>
                  <SelectTrigger><SelectValue placeholder="Page size" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {selectedInfluencer && (() => {
              const stats = influencerService.getStats(selectedInfluencer.id)
              return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-white/50">
                      <p className="text-xs text-gray-500">Commission Rate</p>
                      <p className="text-lg font-bold">{Math.round(stats.commissionRate * 100)}%</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/50">
                      <p className="text-xs text-gray-500">Total Revenue</p>
                      <p className="text-lg font-bold">₱{stats.totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/50">
                      <p className="text-xs text-gray-500">Commission Due</p>
                      <p className="text-lg font-bold">₱{stats.commissionDue.toLocaleString()}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/50">
                      <p className="text-xs text-gray-500">Paid</p>
                      <p className="text-lg font-bold">₱{stats.commissionPaid.toLocaleString()}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/50">
                      <p className="text-xs text-gray-500">Remaining</p>
                      <p className="text-lg font-bold">₱{stats.commissionRemaining.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="rounded-xl border bg-white/60 p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label>Amount to pay (₱)</Label>
                        <Input type="number" value={supplierPayAmount || stats.commissionRemaining} onChange={(e) => setSupplierPayAmount(Number(e.target.value))} />
                      </div>
                      <div>
                        <Label>Method</Label>
                        <Select value={supplierPayMethod} onValueChange={setSupplierPayMethod}>
                          <SelectTrigger><SelectValue placeholder="Method" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                            <SelectItem value="gcash">GCash</SelectItem>
                            <SelectItem value="cash">Cash</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Label>Notes</Label>
                      <Textarea rows={2} value={supplierPayNotes} onChange={(e) => setSupplierPayNotes(e.target.value)} />
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => setSupplierPayAmount(stats.commissionRemaining)}>Prefill Remaining</Button>
                      <Button size="sm" onClick={async () => {
                        if (!selectedInfluencer) return
                        const amt = supplierPayAmount || stats.commissionRemaining
                        const newPaid = (selectedInfluencer.totalCommissionPaid || 0) + Math.max(amt, 0)
                        const res = await fetch('/api/admin/influencers', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selectedInfluencer.id, total_commission_paid: newPaid }) })
                        if (res.ok) {
                          await influencerService.fetchFromSupabase?.()
                          setInfluencers(influencerService.getAllInfluencers())
                          showNotification('success', 'Supplier payment registered')
                          setSupplierPayNotes('')
                        } else {
                          showNotification('error', 'Failed to register payment')
                        }
                      }}>
                        <DollarSign className="w-4 h-4 mr-2" />
                        Register Payment
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })()}
             {(() => {
               const all = selectedInfluencer ? influencerService.getReferralsByInfluencer(selectedInfluencer.id) : []
               const filtered = all.filter(r => {
                 const q = referralDetailsSearch.trim().toLowerCase()
                 const matchQ = q === '' || r.clientName.toLowerCase().includes(q) || (r.notes ?? '').toLowerCase().includes(q)
                 const d = new Date(r.date)
                 const fromOk = referralDateFrom ? d >= new Date(referralDateFrom) : true
                 const toOk = referralDateTo ? d <= new Date(referralDateTo) : true
                 return matchQ && fromOk && toOk
               }).sort((a, b) => {
                 if (referralSort === 'date_desc') return new Date(b.date).getTime() - new Date(a.date).getTime()
                 if (referralSort === 'date_asc') return new Date(a.date).getTime() - new Date(b.date).getTime()
                 if (referralSort === 'amount_desc') return b.amount - a.amount
                 if (referralSort === 'amount_asc') return a.amount - b.amount
                 return 0
               })
               const totalPages = Math.max(1, Math.ceil(filtered.length / referralPageSize))
               const page = Math.max(1, Math.min(referralPage, totalPages))
               const start = (page - 1) * referralPageSize
               const items = filtered.slice(start, start + referralPageSize)
               return (
                 <div className="space-y-3">
                   <Table>
                     <TableHeader>
                       <TableRow>
                         <TableHead>Client</TableHead>
                         <TableHead>Date</TableHead>
                         <TableHead>Amount</TableHead>
                         <TableHead>Notes</TableHead>
                         <TableHead>Actions</TableHead>
                       </TableRow>
                     </TableHeader>
                     <TableBody>
                       {items.map(r => (
                         <TableRow key={r.id}>
                           <TableCell>{r.clientName}</TableCell>
                           <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                           <TableCell>₱{r.amount.toLocaleString()}</TableCell>
                           <TableCell className="max-w-[300px] truncate">{r.notes || ''}</TableCell>
                           <TableCell>
                             <Button
                               size="sm"
                               variant="outline"
                               onClick={async () => {
                                 if (!confirmTwice('this referral')) return
                                 const res = await fetch('/api/admin/influencer-referrals', {
                                   method: 'DELETE',
                                   headers: { 'Content-Type': 'application/json' },
                                   body: JSON.stringify({ id: r.id })
                                 })
                                 if (res.ok) {
                                   await influencerService.fetchFromSupabase?.()
                                   setInfluencers(influencerService.getAllInfluencers())
                                   showNotification('success', 'Referral deleted')
                                 } else {
                                   showNotification('error', 'Failed to delete referral')
                                 }
                               }}
                             >
                               <Trash2 className="w-4 h-4 mr-2" />
                               Delete
                             </Button>
                           </TableCell>
                         </TableRow>
                       ))}
                       {items.length === 0 && (
                         <TableRow>
                           <TableCell colSpan={5} className="text-center text-gray-500">No referrals</TableCell>
                         </TableRow>
                       )}
                     </TableBody>
                   </Table>
                   <div className="flex items-center justify-between">
                     <div className="text-sm text-gray-600">Page {page} of {totalPages}</div>
                     <div className="flex items-center gap-2">
                       <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setReferralPage(p => Math.max(1, p - 1))}>Prev</Button>
                       <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setReferralPage(p => Math.min(totalPages, p + 1))}>Next</Button>
                     </div>
                   </div>
                 </div>
               )
             })()}
           </div>
         </DialogContent>
       </Dialog>

      {/* Medical Record Modal */}
      <Dialog open={isMedicalRecordModalOpen} onOpenChange={setIsMedicalRecordModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto will-change-transform [backface-visibility:hidden] [transform:translateZ(0)] [contain:layout_paint]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-500" />
              {selectedMedicalRecord ? 'Edit Medical Record' : 'New Medical Record'}
              <Badge variant="outline" className="text-red-600 border-red-200">
                CONFIDENTIAL
              </Badge>
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleMedicalRecordSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="recordClientId">Client</Label>
                <Select
                  value={medicalRecordForm.clientId || ''}
                  onValueChange={(value) => setMedicalRecordForm(prev => ({ ...prev, clientId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.firstName} {client.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="recordDate">Date</Label>
                <Input
                  id="recordDate"
                  type="date"
                  value={medicalRecordForm.date || ''}
                  onChange={(e) => setMedicalRecordForm(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="chiefComplaint">Chief Complaint</Label>
              <Textarea
                id="chiefComplaint"
                value={medicalRecordForm.chiefComplaint || ''}
                onChange={(e) => setMedicalRecordForm(prev => ({ ...prev, chiefComplaint: e.target.value }))}
                rows={3}
                required
              />
            </div>

            <div>
              <Label htmlFor="medicalHistory">Medical History (one per line)</Label>
              <Textarea
                id="medicalHistory"
                value={Array.isArray(medicalRecordForm.medicalHistory) ? medicalRecordForm.medicalHistory.join('\n') : ''}
                onChange={(e) => setMedicalRecordForm(prev => ({ 
                  ...prev, 
                  medicalHistory: e.target.value.split('\n').filter(item => item.trim()) 
                }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="allergies">Allergies (one per line)</Label>
                <Textarea
                  id="allergies"
                  value={Array.isArray(medicalRecordForm.allergies) ? medicalRecordForm.allergies.join('\n') : ''}
                  onChange={(e) => setMedicalRecordForm(prev => ({ 
                    ...prev, 
                    allergies: e.target.value.split('\n').filter(item => item.trim()) 
                  }))}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="currentMedications">Current Medications (one per line)</Label>
                <Textarea
                  id="currentMedications"
                  value={Array.isArray(medicalRecordForm.currentMedications) ? medicalRecordForm.currentMedications.join('\n') : ''}
                  onChange={(e) => setMedicalRecordForm(prev => ({ 
                    ...prev, 
                    currentMedications: e.target.value.split('\n').filter(item => item.trim()) 
                  }))}
                  rows={3}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="treatmentPlan">Treatment Plan</Label>
              <Textarea
                id="treatmentPlan"
                value={medicalRecordForm.treatmentPlan || ''}
                onChange={(e) => setMedicalRecordForm(prev => ({ ...prev, treatmentPlan: e.target.value }))}
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="recordNotes">Additional Notes</Label>
              <Textarea
                id="recordNotes"
                value={medicalRecordForm.notes || ''}
                onChange={(e) => setMedicalRecordForm(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="attachments">Attachments</Label>
              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <FileImage className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <input ref={medicalFileInputRef} type="file" accept="image/*,application/pdf" multiple className="hidden" onChange={handleMedicalFileInputChange} />
                  <Button type="button" variant="outline" onClick={handleMedicalUploadButtonClick} className="mr-2">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Medical Files
                  </Button>
                  <Button type="button" variant="outline" onClick={() => openCamera('medical')}>
                    <Camera className="w-4 h-4 mr-2" />
                    Camera
                  </Button>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Images, PDFs, and documents up to 10MB each
                </p>
                {Array.isArray(medicalRecordForm.attachments) && medicalRecordForm.attachments.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {medicalRecordForm.attachments.map((url, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white/60 border rounded-md p-2">
                        <FileImage className="w-4 h-4" />
                        <a href={url} target="_blank" rel="noreferrer" className="text-sm truncate max-w-[160px]">
                          {url.split('/').pop()}
                        </a>
                        <Button size="sm" variant="outline" className="ml-auto" onClick={() => {
                          const next = (medicalRecordForm.attachments || []).filter(u => u !== url)
                          setMedicalRecordForm(prev => ({ ...prev, attachments: next }))
                        }}>Remove</Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
               <Button type="button" variant="outline" onClick={() => setIsMedicalRecordModalOpen(false)}>
                 Cancel
               </Button>
               <Button type="submit" disabled={isLoading}>
                 {isLoading ? 'Saving...' : 'Save Medical Record'}
               </Button>
             </div>
           </form>
         </DialogContent>
       </Dialog>

       {/* Client Modal */}
      <Dialog open={isClientModalOpen} onOpenChange={setIsClientModalOpen}>
         <DialogContent className="max-w-2xl will-change-transform [backface-visibility:hidden] [transform:translateZ(0)] [contain:layout_paint]">
      <DialogHeader>
        <DialogTitle>
          {selectedClient ? 'Edit Client' : 'Add New Client'}
        </DialogTitle>
      </DialogHeader>
      {clientDuplicateWarning && (
        <div role="alert" aria-live="polite" className="rounded-md border border-rose-200 bg-rose-50 text-rose-700 p-3 text-sm">
          {clientDuplicateWarning}
        </div>
      )}
      <form onSubmit={handleClientSubmit} className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <Label htmlFor="firstName">First Name</Label>
                 <Input
                  id="firstName"
                  value={clientForm.firstName || ''}
                  onChange={(e) => startTransition(() => setClientForm(prev => ({ ...prev, firstName: e.target.value })))}
                  required
                />
               </div>
               <div>
                 <Label htmlFor="lastName">Last Name</Label>
                 <Input
                  id="lastName"
                  value={clientForm.lastName || ''}
                  onChange={(e) => startTransition(() => setClientForm(prev => ({ ...prev, lastName: e.target.value })))}
                  required
                />
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
               <div>
                 <Label htmlFor="email">Email</Label>
                 <Input
                  id="email"
                  type="email"
                  value={clientForm.email || ''}
                  onChange={(e) => startTransition(() => setClientForm(prev => ({ ...prev, email: e.target.value })))}
                  required
                />
               </div>
               <div>
                 <Label htmlFor="phone">Phone</Label>
                 <Input
                  id="phone"
                  value={clientForm.phone || ''}
                  onChange={(e) => startTransition(() => setClientForm(prev => ({ ...prev, phone: e.target.value })))}
                  required
                />
               </div>
             </div>

             <div>
               <Label htmlFor="address">Address</Label>
               <Textarea
                 id="address"
                 value={clientForm.address || ''}
                 onChange={(e) => startTransition(() => setClientForm(prev => ({ ...prev, address: e.target.value })))}
                 rows={2}
               />
             </div>

             <div className="grid grid-cols-3 gap-4">
               <div>
                 <Label htmlFor="dateOfBirth">Date of Birth</Label>
                 <Input
                  id="dateOfBirth"
                  type="date"
                  value={clientForm.dateOfBirth || ''}
                  onChange={(e) => startTransition(() => setClientForm(prev => ({ ...prev, dateOfBirth: e.target.value })))}
                />
               </div>
               <div>
                 <Label htmlFor="gender">Gender</Label>
                 <Select
                  value={clientForm.gender || ''}
                  onValueChange={(value) => startTransition(() => setClientForm(prev => ({ ...prev, gender: value as any })))}
                >
                   <SelectTrigger>
                     <SelectValue placeholder="Select gender" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="female">Female</SelectItem>
                     <SelectItem value="male">Male</SelectItem>
                     <SelectItem value="other">Other</SelectItem>
                     <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
               <div>
                 <Label htmlFor="clientStatus">Status</Label>
                 <Select
                  value={clientForm.status || ''}
                  onValueChange={(value) => startTransition(() => setClientForm(prev => ({ ...prev, status: value as any })))}
                >
                   <SelectTrigger>
                     <SelectValue placeholder="Select status" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="active">Active</SelectItem>
                     <SelectItem value="inactive">Inactive</SelectItem>
                     <SelectItem value="blocked">Blocked</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
             </div>

             <div>
               <Label htmlFor="emergencyContact">Emergency Contact</Label>
               <Input
                 id="emergencyContact"
                 value={clientForm.emergencyContact ? `${clientForm.emergencyContact.name} (${clientForm.emergencyContact.phone})` : ''}
                 onChange={(e) => startTransition(() => {
                   const [name, phone] = e.target.value.split('(').map(s => s.trim().replace(')', ''))
                   setClientForm(prev => ({ 
                     ...prev, 
                     emergencyContact: { name: name || '', phone: phone || '', relationship: 'family' }
                   }))
                 })}
                 placeholder="Name and phone number (e.g., John Doe (09123456789))"
               />
             </div>

             <div className="flex justify-end gap-2">
               <Button type="button" variant="outline" onClick={() => setIsClientModalOpen(false)}>
                 Cancel
               </Button>
               <Button type="submit" disabled={isLoading}>
                 {isLoading ? 'Saving...' : 'Save Client'}
               </Button>
             </div>
           </form>
         </DialogContent>
      </Dialog>

       <Dialog open={isStaffModalOpen} onOpenChange={setIsStaffModalOpen}>
         <DialogContent className="max-w-2xl will-change-transform [backface-visibility:hidden] [transform:translateZ(0)] [contain:layout_paint]">
           <DialogHeader>
             <DialogTitle>
               {selectedStaff ? 'Edit Staff' : 'Add New Staff'}
             </DialogTitle>
           </DialogHeader>
           <form onSubmit={handleStaffSubmit} className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <Label htmlFor="staffFirstName">First Name</Label>
                 <Input id="staffFirstName" value={staffForm.firstName || ''} onChange={(e) => setStaffForm(prev => ({ ...prev, firstName: e.target.value }))} required />
               </div>
               <div>
                 <Label htmlFor="staffLastName">Last Name</Label>
                 <Input id="staffLastName" value={staffForm.lastName || ''} onChange={(e) => setStaffForm(prev => ({ ...prev, lastName: e.target.value }))} required />
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
               <div>
                 <Label htmlFor="staffEmail">Email</Label>
                 <Input id="staffEmail" type="email" value={staffForm.email || ''} onChange={(e) => setStaffForm(prev => ({ ...prev, email: e.target.value }))} required />
               </div>
               <div>
                 <Label htmlFor="staffPhone">Phone</Label>
                 <Input id="staffPhone" value={staffForm.phone || ''} onChange={(e) => setStaffForm(prev => ({ ...prev, phone: e.target.value }))} required />
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
               <div>
                 <Label htmlFor="staffPosition">Position</Label>
                 <Select value={staffForm.position || ''} onValueChange={(value) => setStaffForm(prev => ({ ...prev, position: value as Staff['position'] }))}>
                   <SelectTrigger>
                     <SelectValue placeholder="Select position" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="anesthesiologist">Anesthesiologist</SelectItem>
                     <SelectItem value="surgeon_aesthetic">Surgeon (Aesthetic)</SelectItem>
                     <SelectItem value="dermatologist">Dermatologist</SelectItem>
                     <SelectItem value="nurse">Nurse</SelectItem>
                     <SelectItem value="therapist">Therapist</SelectItem>
                     <SelectItem value="technician">Technician</SelectItem>
                     <SelectItem value="receptionist">Receptionist</SelectItem>
                     <SelectItem value="admin">Admin</SelectItem>
                     <SelectItem value="other">Other</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
               <div>
                 <Label htmlFor="staffDepartment">Department</Label>
                 <Input id="staffDepartment" value={staffForm.department || ''} onChange={(e) => setStaffForm(prev => ({ ...prev, department: e.target.value }))} />
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
               <div>
                 <Label htmlFor="licenseNumber">License Number</Label>
                 <Input id="licenseNumber" value={staffForm.licenseNumber || ''} onChange={(e) => setStaffForm(prev => ({ ...prev, licenseNumber: e.target.value }))} />
               </div>
               <div>
                 <Label htmlFor="hireDate">Hire Date</Label>
                 <Input id="hireDate" type="date" value={staffForm.hireDate || ''} onChange={(e) => setStaffForm(prev => ({ ...prev, hireDate: e.target.value }))} />
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
               <div>
                 <Label htmlFor="staffStatus">Status</Label>
                 <Select value={staffForm.status || ''} onValueChange={(value) => setStaffForm(prev => ({ ...prev, status: value as Staff['status'] }))}>
                   <SelectTrigger>
                     <SelectValue placeholder="Select status" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="active">Active</SelectItem>
                     <SelectItem value="on_leave">On Leave</SelectItem>
                     <SelectItem value="inactive">Inactive</SelectItem>
                     <SelectItem value="terminated">Terminated</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
               <div>
                 <Label htmlFor="specialties">Specialties (one per line)</Label>
                 <Textarea id="specialties" rows={3} value={Array.isArray(staffForm.specialties) ? staffForm.specialties.join('\n') : ''} onChange={(e) => setStaffForm(prev => ({ ...prev, specialties: e.target.value.split('\n').filter(i => i.trim()) }))} />
               </div>
             </div>

             <div>
               <Label htmlFor="staffNotes">Notes</Label>
                 <Textarea id="staffNotes" rows={3} value={staffForm.notes || ''} onChange={(e) => setStaffForm(prev => ({ ...prev, notes: e.target.value }))} />
             </div>

             <div className="flex justify-end gap-2">
               <Button type="button" variant="outline" onClick={() => setIsStaffModalOpen(false)}>Cancel</Button>
               <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Staff'}</Button>
             </div>
           </form>
         </DialogContent>
       </Dialog>

       {/* Social Media Reply Modal */}
       <Dialog open={isSocialReplyModalOpen} onOpenChange={setIsSocialReplyModalOpen}>
         <DialogContent className="max-w-lg will-change-transform [backface-visibility:hidden] [transform:translateZ(0)] [contain:layout_paint]">
           <DialogHeader>
             <DialogTitle className="flex items-center gap-2">
               {selectedMessage?.platform === 'instagram' ? (
                 <Instagram className="w-5 h-5 text-pink-500" />
               ) : (
                 <Facebook className="w-5 h-5 text-blue-500" />
               )}
               Reply to {selectedMessage?.senderName}
             </DialogTitle>
           </DialogHeader>
           
           {selectedMessage && (
             <div className="space-y-4">
               <div className="bg-gray-50 p-4 rounded-lg">
                 <p className="text-sm text-gray-600 mb-2">Original Message:</p>
                 <p className="text-gray-900">{selectedMessage.message}</p>
                 <p className="text-xs text-gray-500 mt-2">
                   {new Date(selectedMessage.timestamp).toLocaleString()}
                 </p>
               </div>

               <div>
                 <Label htmlFor="replyMessage">Your Reply</Label>
                 <Textarea
                   id="replyMessage"
                   value={replyMessage}
                   onChange={(e) => setReplyMessage(e.target.value)}
                   placeholder="Type your reply here..."
                   rows={4}
                   required
                 />
               </div>

               <div className="flex justify-end gap-2">
                 <Button 
                   type="button" 
                   variant="outline" 
                   onClick={() => setIsSocialReplyModalOpen(false)}
                 >
                   Cancel
                 </Button>
                 <Button 
                   onClick={handleSocialReply}
                   disabled={isLoading || !replyMessage.trim()}
                   className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 hover:from-rose-600 hover:via-pink-600 hover:to-purple-600 text-white shadow-2xl shadow-rose-500/30 hover:shadow-rose-500/40 transition-all duration-300 hover:scale-105 font-bold px-6 py-3 rounded-2xl"
                 >
                   {isLoading ? 'Sending...' : 'Send Reply'}
                 </Button>
               </div>
             </div>
           )}
         </DialogContent>
       </Dialog>
    </>
  )
}
