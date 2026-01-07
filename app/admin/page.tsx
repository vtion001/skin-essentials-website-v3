"use client"

import "./admin-styles.css"
import React, { useState, useEffect, useTransition, useMemo, useCallback, memo } from "react"
import { Button } from "@/components/ui/button"
import { patchJson } from "@/lib/request"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar } from "@/components/ui/calendar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import {
  PieChart,
  Pie,
  Cell,
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts"
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  Eye,
  EyeOff,
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
  CalendarDays,
  LayoutDashboard,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  UserCircle,
  MoreHorizontal,
} from "lucide-react"
import { OptimizedImage } from "@/components/optimized-image"
import Image from "next/image"
import { supabaseAvailable } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import {
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
import { serviceCategories, type Service, type ServiceCategory } from "@/lib/services-data"
import { portfolioService, type PortfolioItem } from "@/lib/portfolio-data"
import { AnimatedInput } from "@/components/ui/animated-input"
import { AnimatedSelect } from "@/components/ui/animated-select"
import { EnhancedButton } from "@/components/ui/enhanced-button"
import { LazyTabContent } from "@/components/ui/lazy-tab-content"
import { InfluencerModal } from "@/components/admin/modals/influencer-modal"
import { AdminProfileButton } from "@/components/admin/admin-profile-button"
import { SmsManager } from "@/components/admin/sms-manager"

import { ServiceEditModal, type ServiceEditData } from "@/components/admin/modals/service-edit-modal"
import { CategoryEditModal, type CategoryEditData } from "@/components/admin/modals/category-edit-modal"
import { PortfolioEditDialog } from "@/components/admin/modals/portfolio-edit-dialog"

import { DashboardTab } from "@/components/admin/tabs/dashboard-tab"
import { AppointmentsTab } from "@/components/admin/tabs/appointments-tab"
import { AppointmentsTable } from "@/components/admin/appointments/appointments-table"
import { ClientsTab } from "@/components/admin/tabs/clients-tab"
import { PaymentsTab } from "@/components/admin/tabs/payments-tab"
import { InfluencersTab } from "@/components/admin/tabs/influencers-tab"
import { MedicalRecordsTab } from "@/components/admin/tabs/medical-records-tab"
import { StaffTab } from "@/components/admin/tabs/staff-tab"
import { useAdminData } from "@/lib/hooks/use-admin-data"
import { useFileUpload } from "@/lib/hooks/use-file-upload"
import { useAdminCommunication } from "@/lib/hooks/use-admin-communication"
import { useAdminEventSync } from "@/lib/hooks/use-admin-event-sync"
import { useAdminFilters } from "@/lib/hooks/use-admin-filters"
import { supabaseBrowserClient } from "@/lib/supabase/client"
import { AppointmentModal } from "@/components/admin/modals/appointment-modal"
import { ProfileSettingsModal } from "@/components/admin/modals/profile-settings-modal"
import { useAdminAppointments } from "@/lib/hooks/features/use-admin-appointments"
import { AuditLogsTab } from "@/components/admin/tabs/audit-logs-tab"
import { EncryptionErrorBanner } from "@/components/admin/encryption-error-banner"

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

const procedureOptions = Array.from(new Set(serviceCategories.flatMap(c => c.services.map(s => s.name))))
const categoryOptions = Array.from(new Set(serviceCategories.map(c => c.category)))









export default function AdminDashboard() {
  // Authentication and navigation
  const router = useRouter()
  const toId = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

  // State management
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isLoading, setIsLoading] = useState(false)
  const [notification, setNotification] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null)

  const showNotification = (type: "success" | "error" | "info", message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  // Data states
  const {
    payments, setPayments,
    medicalRecords, setMedicalRecords,
    clients, setClients,
    socialMessages, setSocialMessages,
    staff, setStaff,
    influencers, setInfluencers,
    refreshData: loadAllData,
    isLoading: isDataLoading,
    refreshClients,
    refreshPayments,
    refreshMedicalRecords,
    refreshStaff,
    refreshInfluencers,
    refreshSocialMessages
  } = useAdminData()

  // Appointment Management Hook
  const {
    appointments,
    setAppointments,
    loadAppointments,
    createAppointment,
    updateAppointment,
    handleUpdateStatus: handleUpdateAppointmentStatus,
    handleDelete: handleAppointmentDeleteAction,
    handleViberNotify,
    getAvailableTimeSlots,
    isModalOpen,
    editingAppointment,
    openModal,
    closeModal
  } = useAdminAppointments(showNotification)

  const decryptionErrorCount = useMemo(() => {
    const aptCount = appointments.filter(a => a.decryption_error || a.clientName === "[Unavailable]").length
    const clientCount = clients.filter(c => c.decryption_error || c.firstName === "[Unavailable]").length
    const recordCount = medicalRecords.filter(r => r.decryption_error || r.treatmentPlan === "[Unavailable]").length
    const paymentCount = payments.filter(p => p.decryption_error).length
    const staffCount = staff.filter(s => s.decryption_error || s.firstName === "[Unavailable]").length
    return aptCount + clientCount + recordCount + paymentCount + staffCount
  }, [appointments, clients, medicalRecords, payments, staff])

  useEffect(() => {
    if (medicalRecords.length > 0) {
      console.log(`[Admin] Loaded ${medicalRecords.length} medical records`)
    }
  }, [medicalRecords])
  const [typingPending, startTransition] = useTransition()

  // Modal states
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isMedicalRecordModalOpen, setIsMedicalRecordModalOpen] = useState(false)
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)
  const [isSocialReplyModalOpen, setIsSocialReplyModalOpen] = useState(false)
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false)
  const [isInfluencerModalOpen, setIsInfluencerModalOpen] = useState(false)
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false)
  const [isProfileSettingsOpen, setIsProfileSettingsOpen] = useState(false)

  // Selected items
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [selectedMedicalRecord, setSelectedMedicalRecord] = useState<MedicalRecord | null>(null)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [selectedMessage, setSelectedMessage] = useState<SocialMessage | null>(null)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null)

  // Form states
  const [paymentForm, setPaymentForm] = useState<Partial<Payment>>({})
  const [medicalRecordForm, setMedicalRecordForm] = useState<Partial<MedicalRecord>>({})
  const [chiefComplaintText, setChiefComplaintText] = useState<string>("")
  const [medicalHistoryText, setMedicalHistoryText] = useState<string>("")
  const [allergiesText, setAllergiesText] = useState<string>("")
  const [currentMedicationsText, setCurrentMedicationsText] = useState<string>("")
  const [treatmentPlanText, setTreatmentPlanText] = useState<string>("")
  const [notesText, setNotesText] = useState<string>("")
  const [clientForm, setClientForm] = useState<Partial<Client>>({})
  const [replyMessage, setReplyMessage] = useState("")
  const [staffForm, setStaffForm] = useState<Partial<Staff>>({})
  const [influencerForm, setInfluencerForm] = useState<Partial<Influencer>>({ commissionRate: 0.10, status: 'active' })
  const [referralForm, setReferralForm] = useState<Partial<ReferralRecord>>({})

  // Communication hooks
  const {
    emailPreview,
    emailLoading,
    refreshEmailPreview,
    smsStatus,
    refreshSmsStatus
  } = useAdminCommunication()

  // File upload hook
  const { uploadToSupabase, uploadToApi } = useFileUpload()

  function updateMedicalTreatment(idx: number, key: 'date' | 'procedure' | 'staffName' | 'total' | 'aestheticianId', value: string | number | boolean) {
    setMedicalRecordForm(prev => ({
      ...prev,
      treatments: (prev.treatments || []).map((x, i) => i === idx ? { ...x, [key]: value } : x)
    }))
  }

  function updateStaffTreatment(idx: number, updates: { procedure?: string; clientName?: string; total?: number; date?: string }) {
    setStaffForm(prev => ({
      ...prev,
      treatments: (prev.treatments || []).map((x, i) => i === idx ? { ...x, ...updates } : x)
    }))
  }

  useEffect(() => { if (activeTab === 'email') refreshEmailPreview() }, [activeTab, refreshEmailPreview])

  useEffect(() => { if (activeTab === 'sms') refreshSmsStatus() }, [activeTab, refreshSmsStatus])


  const [contentServices, setContentServices] = useState<{ id: string; category: string; description?: string; image?: string; color?: string; services: Service[] }[]>([])
  const [contentSelectedCategory, setContentSelectedCategory] = useState("")
  const [contentSubTab, setContentSubTab] = useState<string>("services")
  const [newCategoryForm, setNewCategoryForm] = useState<{ category: string; description?: string; image?: string; color?: string }>({ category: "" })
  const [newServiceForm, setNewServiceForm] = useState<{ name: string; price: string; description: string; duration?: string; results?: string; image?: string }>({ name: "", price: "", description: "" })
  const [isServiceEditOpen, setIsServiceEditOpen] = useState(false)
  const [serviceEditTarget, setServiceEditTarget] = useState<{ name: string; price: string; description: string; duration?: string; results?: string; sessions?: string; includes?: string; originalPrice?: string; badge?: string; pricing?: string; image?: string; benefits?: string[]; faqs?: { q: string; a: string }[] } | null>(null)
  const [serviceEditForm, setServiceEditForm] = useState<{ name: string; price: string; description: string; duration?: string; results?: string; sessions?: string; includes?: string; originalPrice?: string; badge?: string; pricing?: string; image?: string; benefits?: string[]; faqs?: { q: string; a: string }[] }>({ name: "", price: "", description: "", benefits: [], faqs: [] })
  const [isCategoryEditOpen, setIsCategoryEditOpen] = useState(false)
  const [categoryEditTarget, setCategoryEditTarget] = useState<{ id: string; category: string; description?: string; image?: string; color?: string } | null>(null)
  const [categoryEditForm, setCategoryEditForm] = useState<{ category?: string; description?: string; image?: string; color?: string }>({})
  const [contentPortfolioItems, setContentPortfolioItems] = useState<PortfolioItem[]>([])
  const [portfolioForm, setPortfolioForm] = useState<Partial<PortfolioItem>>({})
  const [editPortfolioItem, setEditPortfolioItem] = useState<PortfolioItem | null>(null)
  const [editPortfolioForm, setEditPortfolioForm] = useState<Partial<PortfolioItem>>({})
  const portfolioBeforeFileInputRef = React.useRef<HTMLInputElement | null>(null)
  const portfolioAfterFileInputRef = React.useRef<HTMLInputElement | null>(null)
  const editPortfolioBeforeFileInputRef = React.useRef<HTMLInputElement | null>(null)
  const editPortfolioAfterFileInputRef = React.useRef<HTMLInputElement | null>(null)
  const [addResultTarget, setAddResultTarget] = useState<PortfolioItem | null>(null)
  const [addResultForm, setAddResultForm] = useState<{ beforeImage: string; afterImage: string }>({ beforeImage: "", afterImage: "" })
  const addResultBeforeRef = React.useRef<HTMLInputElement | null>(null)
  const addResultAfterRef = React.useRef<HTMLInputElement | null>(null)
  const [previewPortfolioItem, setPreviewPortfolioItem] = useState<PortfolioItem | null>(null)
  const [previewShowSimilar, setPreviewShowSimilar] = useState(false)
  const [previewRevealedMap, setPreviewRevealedMap] = useState<Record<string, boolean>>({})
  const previewSimilarRef = React.useRef<HTMLDivElement | null>(null)
  const isSensitivePreview = (item: PortfolioItem) => {
    const title = String(item.title || '').toLowerCase()
    return title.includes('feminine') || title.includes('intimate') || title.includes('butt') || title.includes('breast')
  }
  const uploadPortfolioFile = async (file: File, kind: 'before' | 'after', target: 'create' | 'edit' | 'addResult' = 'create') => {
    try {
      const url = await uploadToApi(file, kind)
      if (target === 'create') {
        setPortfolioForm(prev => ({ ...prev, [kind === 'before' ? 'beforeImage' : 'afterImage']: url }))
      } else if (target === 'edit') {
        setEditPortfolioForm(prev => ({ ...prev, [kind === 'before' ? 'beforeImage' : 'afterImage']: url }))
      } else if (target === 'addResult') {
        setAddResultForm(prev => ({ ...prev, [kind === 'before' ? 'beforeImage' : 'afterImage']: url }))
      }
      showNotification('success', 'Image uploaded')
    } catch { showNotification('error', 'Upload failed') }
  }

  // Deletion confirmation (Client)

  // Deletion confirmation (Medical Record)
  const [confirmMedicalRecord, setConfirmMedicalRecord] = useState<MedicalRecord | null>(null)
  const [confirmMedicalDeleting, setConfirmMedicalDeleting] = useState(false)


  // Calendar and search states
  const {
    appointments: {
      search: appointmentsSearch, setSearch: setAppointmentsSearch,
      statusFilter: appointmentsStatusFilter, setStatusFilter: setAppointmentsStatusFilter,
      serviceFilter: appointmentsServiceFilter, setServiceFilter: setAppointmentsServiceFilter,
      dateFrom: appointmentsDateFrom, setDateFrom: setAppointmentsDateFrom,
      dateTo: appointmentsDateTo, setDateTo: setAppointmentsDateTo,
      sort: appointmentsSort, setSort: setAppointmentsSort,
      page: appointmentsPage, setPage: setAppointmentsPage,
      pageSize: appointmentsPageSize, setPageSize: setAppointmentsPageSize,
    },
    clients: {
      statusFilter: clientsStatusFilter, setStatusFilter: setClientsStatusFilter,
      sourceFilter: clientsSourceFilter, setSourceFilter: setClientsSourceFilter,
      sort: clientsSort, setSort: setClientsSort,
    },
    payments: {
      search: paymentSearch, setSearch: setPaymentSearch,
      methodFilter: paymentMethodFilter, setMethodFilter: setPaymentMethodFilter,
      statusFilter: paymentStatusFilter, setStatusFilter: setPaymentStatusFilter,
      dateFrom: paymentDateFrom, setDateFrom: setPaymentDateFrom,
      dateTo: paymentDateTo, setDateTo: setPaymentDateTo,
      sort: paymentSort, setSort: setPaymentSort,
      page: paymentPage, setPage: setPaymentPage,
      pageSize: paymentPageSize, setPageSize: setPaymentPageSize,
    },
    staff: {
      search: staffSearch, setSearch: setStaffSearch,
      positionFilter: staffPositionFilter, setPositionFilter: setStaffPositionFilter,
      statusFilter: staffStatusFilter, setStatusFilter: setStaffStatusFilter,
      totalsFilter: staffTotalsFilter, setTotalsFilter: setStaffTotalsFilter,
    },
    influencers: {
      search: influencerSearch, setSearch: setInfluencerSearch,
      platformFilter: influencerPlatformFilter, setPlatformFilter: setInfluencerPlatformFilter,
      statusFilter: influencerStatusFilter, setStatusFilter: setInfluencerStatusFilter,
    },
    general: {
      searchQuery, setSearchQuery,
      filterStatus, setFilterStatus,
      selectedDate, setSelectedDate,
    },
    analytics: {
      dateFrom: analyticsDateFrom, setDateFrom: setAnalyticsDateFrom,
      dateTo: analyticsDateTo, setDateTo: setAnalyticsDateTo,
    }
  } = useAdminFilters()
  const [clientDuplicateWarning, setClientDuplicateWarning] = useState<string | null>(null)


  const [privacyMode, setPrivacyMode] = useState<boolean>(false)
  const [clientReveal, setClientReveal] = useState<{ name: boolean; email: boolean; phone: boolean; address: boolean }>({ name: false, email: false, phone: false, address: false })
  const [influencerReveal, setInfluencerReveal] = useState<{ referralCode: boolean; email: boolean; phone: boolean }>({ referralCode: false, email: false, phone: false })

  const [isStaffTreatmentQuickOpen, setIsStaffTreatmentQuickOpen] = useState(false)
  const [staffTreatmentTarget, setStaffTreatmentTarget] = useState<Staff | null>(null)
  const [staffTreatmentForm, setStaffTreatmentForm] = useState<{ procedure: string; clientName?: string; total: number; date?: string }[]>([])
  const [isStaffTotalsOpen, setIsStaffTotalsOpen] = useState(false)
  const [isStaffPreviewOpen, setIsStaffPreviewOpen] = useState(false)
  const [staffPreviewTarget, setStaffPreviewTarget] = useState<Staff | null>(null)
  const [openQuickCalendarIdx, setOpenQuickCalendarIdx] = useState<number | null>(null)


  const filteredStaff = React.useMemo(() => {
    const q = staffSearch.toLowerCase()
    return staff
      .filter(s => staffStatusFilter === 'all' ? true : s.status === staffStatusFilter)
      .filter(s => staffPositionFilter === 'all' ? true : s.position === staffPositionFilter)
      .filter(s => (
        q === '' ||
        s.firstName.toLowerCase().includes(q) ||
        s.lastName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.phone.includes(staffSearch)
      ))
  }, [staff, staffStatusFilter, staffPositionFilter, staffSearch])

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

  useEffect(() => {
    try {
      const original = window.fetch
      window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === 'string' ? input : String(input)
        const method = (init?.method || 'GET').toUpperCase()
        if (url.startsWith('/api/admin') && method !== 'GET') {
          const csrf = document.cookie.match(/(?:^|; )csrf_token=([^;]+)/)?.[1] || ''
          const headers = new Headers(init?.headers || {})
          if (!headers.get('x-csrf-token')) headers.set('x-csrf-token', csrf)
          return original(input, { ...init, headers })
        }
        return original(input, init)
      }
    } catch { }
  }, [])



  useEffect(() => {
    setReferralPage(1)
  }, [referralDetailsSearch, referralDateFrom, referralDateTo, referralSort, selectedInfluencer])

  useAdminEventSync({
    setClientForm,
    setIsClientModalOpen,
    onBookAppointment: (data) => openModal(data),
    setPaymentForm,
    setIsPaymentModalOpen,
    isClientModalOpen,
    isPaymentModalOpen
  })



  const handleLogout = async () => {
    try {
      await fetch('/api/admin/login', { method: 'DELETE' })
    } catch { }
    router.push('/admin/login')
  }

  const handleRunDiagnostics = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/diagnostics/decryption', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': document.cookie.split('; ').find(row => row.startsWith('csrf_token='))?.split('=')[1] || ''
        }
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to run diagnostics')

      // Log recommendations for admin
      if (data.recommendations?.length > 0) {
        showNotification('info', `Diagnostics: ${data.recommendations[0]}`)
        console.log('[Encryption Diagnostics]', data)
      } else {
        showNotification('success', 'Diagnostics Complete: No issues detected.')
      }
    } catch (err: any) {
      showNotification('error', `Diagnostic Error: ${err.message}`)
    }
  }, [showNotification])


  const confirmTwice = (subject: string) => {
    if (typeof window === 'undefined') return false
    if (!window.confirm(`Are you sure you want to delete ${subject}?`)) return false
    if (!window.confirm(`Please confirm deletion of ${subject}. This action cannot be undone.`)) return false
    return true
  }

  const supabaseRealtimeEnabled = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

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
      const clientId = String(paymentForm.clientId || 'unknown')
      const today = new Date()
      const y = today.getFullYear()
      const m = String(today.getMonth() + 1).padStart(2, '0')
      const d = String(today.getDate()).padStart(2, '0')
      const folder = `${clientId}/${y}${m}${d}`
      const ext = file.name.split('.').pop() || 'jpg'
      const filename = `receipt_${Date.now()}.${ext}`
      const path = `${folder}/${filename}`

      const publicUrl = await uploadToSupabase(file, 'payment-receipts', path)

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
    } catch { }
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
      const clientId = String(medicalRecordForm.clientId || 'unknown')
      const today = new Date()
      const y = today.getFullYear()
      const m = String(today.getMonth() + 1).padStart(2, '0')
      const d = String(today.getDate()).padStart(2, '0')
      const folder = `${clientId}/${y}${m}${d}`
      const ext = file.name.split('.').pop() || 'jpg'
      const filename = `attachment_${Date.now()}.jpg`
      const path = `${folder}/${filename}`

      const publicUrl = await uploadToSupabase(file, 'medical-attachments', path)

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



  useEffect(() => {
    const client = supabaseBrowserClient()
    if (!client || !supabaseRealtimeEnabled) return

    const channel = client
      .channel('admin-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => { loadAppointments() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => { refreshClients() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff' }, () => { refreshStaff() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => { refreshPayments() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'medical_records' }, () => { refreshMedicalRecords() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'influencers' }, () => { refreshInfluencers() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'influencer_referrals' }, () => { refreshInfluencers() })
      .subscribe()

    return () => {
      client.removeChannel(channel)
    }
  }, [supabaseRealtimeEnabled, loadAppointments, refreshClients, refreshStaff, refreshPayments, refreshMedicalRecords, refreshInfluencers])

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

  useEffect(() => {
    const subs: (() => void)[] = []
      ; (async () => {
        try {
          const res = await fetch('/api/portfolio')
          const j = await res.json()
          if (j?.ok && Array.isArray(j.data)) setContentPortfolioItems(j.data)
        } catch { }
      })()
      ; (async () => {
        try {
          const res = await fetch('/api/services')
          const j = await res.json()
          if (j?.ok && Array.isArray(j?.data)) {
            const cats = j.data.map((c: ServiceCategory) => ({ id: c.id, category: c.category, description: c.description, image: c.image, color: c.color, services: c.services }))
            setContentServices(cats)
            if (!contentSelectedCategory && cats.length) setContentSelectedCategory(cats[0].id)
          }
        } catch { }
      })()
    return () => { subs.forEach(fn => fn()) }
  }, [])

  const stats = React.useMemo(() => getDashboardStats(), [appointments, clients, payments, socialMessages])



  // Payment Management
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
      ; (async () => {
        try {
          const method = selectedPayment ? 'PATCH' : 'POST'
          const formEl = e.currentTarget as HTMLFormElement
          const fd = new FormData(formEl)
          const amountRaw = String(fd.get('amount') || '')
          const transactionId = String(fd.get('transactionId') || '')
          const notes = String(fd.get('notes') || '')
          const payloadBase = selectedPayment ? { id: selectedPayment.id, ...paymentForm } : paymentForm
          const payload = {
            ...payloadBase,
            amount: amountRaw ? parseFloat(amountRaw) : (payloadBase.amount || 0),
            transactionId,
            notes,
          }
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
      ; (async () => {
        try {
          const method = selectedMedicalRecord ? 'PATCH' : 'POST'
          const formEl = e.currentTarget as HTMLFormElement
          const fd = new FormData(formEl)
          const chiefComplaint = String(fd.get('chiefComplaint') || '')
          const treatmentPlan = String(fd.get('treatmentPlan') || '')
          const notes = String(fd.get('notes') || '')
          const medicalHistoryRaw = String(fd.get('medicalHistory') || '')
          const allergiesRaw = String(fd.get('allergies') || '')
          const currentMedicationsRaw = String(fd.get('currentMedications') || '')
          const payloadBase = selectedMedicalRecord ? { id: selectedMedicalRecord.id, ...medicalRecordForm } : medicalRecordForm
          const payload = {
            ...payloadBase,
            chiefComplaint,
            treatmentPlan,
            notes,
            medicalHistory: medicalHistoryRaw.split('\n').filter(item => item.trim()),
            allergies: allergiesRaw.split('\n').filter(item => item.trim()),
            currentMedications: currentMedicationsRaw.split('\n').filter(item => item.trim()),
          }
          const csrf = typeof document !== 'undefined' ? (document.cookie.match(/(?:^|; )csrf_token=([^;]+)/)?.[1] || '') : ''
          const res = await fetch('/api/admin/medical-records', {
            method,
            headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf },
            credentials: 'include',
            body: JSON.stringify(payload)
          })
          if (!res.ok) throw new Error('Failed')
          try {
            const json = await res.json()
            const recordId = json?.record?.id || selectedMedicalRecord?.id
            const items = Array.isArray(medicalRecordForm.treatments) ? medicalRecordForm.treatments : []

            if (recordId && items.length > 0) {
              const csrf2 = typeof document !== 'undefined' ? (document.cookie.match(/(?:^|; )csrf_token=([^;]+)/)?.[1] || '') : ''
              await fetch('/api/admin/treatments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf2 },
                credentials: 'include',
                body: JSON.stringify({
                  medicalRecordId: recordId,
                  clientId: medicalRecordForm.clientId,
                  treatments: items
                })
              })
            }
          } catch (err) {
            console.error("Treatment sync error:", err)
          }
          await refreshMedicalRecords()
          await staffService.fetchFromSupabase?.()
          setStaff(staffService.getAllStaff())
          showNotification("success", selectedMedicalRecord ? "Medical record updated successfully!" : "Medical record created successfully!")
          setIsMedicalRecordModalOpen(false)
          setMedicalRecordForm({})
          setChiefComplaintText('')
          setMedicalHistoryText('')
          setAllergiesText('')
          setCurrentMedicationsText('')
          setTreatmentPlanText('')
          setNotesText('')
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
      ; (async () => {
        try {
          const formEl = e.currentTarget as HTMLFormElement
          const fd = new FormData(formEl)
          const firstName = String(fd.get('firstName') || '')
          const lastName = String(fd.get('lastName') || '')
          const emailVal = String(fd.get('email') || '')
          const phoneVal = String(fd.get('phone') || '')
          const addressVal = String(fd.get('address') || '')
          const dobVal = String(fd.get('dateOfBirth') || '')
          const emergencyRaw = String(fd.get('emergencyContact') || '')
          const emailOk = !emailVal || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)
          const phoneOk = !phoneVal || /\+?\d[\d\s-]{6,}$/.test(phoneVal)
          if (!emailOk || !phoneOk) {
            showNotification("error", "Please enter valid email and phone")
            setIsLoading(false)
            return
          }
          setClientDuplicateWarning(null)
          const isEditing = Boolean(selectedClient?.id)
          const norm = (s: unknown) => String(s || '').trim().toLowerCase()
          const email = norm(emailVal)
          const phone = norm(phoneVal)
          const nameKey = `${norm(firstName)} ${norm(lastName)}`.trim()
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
          const [ecName, ecPhoneRaw] = emergencyRaw.split('(')
          const emergencyName = String(ecName || '').trim()
          const emergencyPhone = String((ecPhoneRaw || '').replace(')', '')).trim()
          const overrides = {
            firstName,
            lastName,
            email: emailVal,
            phone: phoneVal,
            address: addressVal,
            dateOfBirth: dobVal,
            emergencyContact: emergencyName || emergencyPhone ? { name: emergencyName, phone: emergencyPhone, relationship: 'family' } : clientForm.emergencyContact,
            preferences: clientForm.preferences,
          }
          const payload = selectedClient ? { id: selectedClient.id, ...clientForm, ...overrides } : { ...clientForm, ...overrides }
          const res = await fetch('/api/admin/clients', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
          if (!res.ok) throw new Error('Failed')
          await clientService.fetchFromSupabase?.()
          setClients(clientService.getAllClients())
          const link = localStorage.getItem('potential_conversation_id')
          if (!selectedClient && link) {
            const all = clientService.getAllClients()
            const created = all[0]
            socialMediaService.setConversationClient(link, created.id)
            try { localStorage.removeItem('potential_client_draft'); localStorage.removeItem('potential_conversation_id') } catch { }
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
      const norm = (s: unknown) => String(s || '').trim().toLowerCase()
      const email = norm(payload.email)
      const phone = norm(payload.phone)
      const nameKey = `${norm(payload.firstName)} ${norm(payload.lastName)}`.trim()
      const duplicate = clients.find(c => {
        const cEmail = norm(c.email)
        const cPhone = norm(c.phone)
        const cNameKey = `${norm(c.firstName)} ${norm(c.lastName)}`.trim()
        return (email && cEmail && email === cEmail) || (phone && cPhone && phone === cPhone) || (!email && !phone && nameKey && cNameKey && cNameKey === nameKey)
      })
      if (duplicate) {
        showNotification('error', 'Duplicate contact detected')
        return
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

  function parseStaffFormData(fd: FormData) {
    const firstName = String(fd.get('staffFirstName') || '')
    const lastName = String(fd.get('staffLastName') || '')
    const email = String(fd.get('staffEmail') || '')
    const phone = String(fd.get('staffPhone') || '')
    const department = String(fd.get('staffDepartment') || '')
    const licenseNumber = String(fd.get('licenseNumber') || '')
    const hireDate = String(fd.get('hireDate') || '')
    const specialtiesRaw = String(fd.get('specialties') || '')
    const notes = String(fd.get('staffNotes') || '')
    return {
      firstName,
      lastName,
      email,
      phone,
      department,
      licenseNumber,
      hireDate,
      specialties: specialtiesRaw.split('\n').filter(i => i.trim()),
      notes,
    }
  }

  function isValidContact(email: string, phone: string) {
    const emailOk = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    const phoneOk = !phone || /\+?\d[\d\s-]{6,}$/.test(phone)
    return emailOk && phoneOk
  }

  function buildStaffPayload(selectedStaff: { id: string } | null, staffForm: Record<string, unknown>, overrides: Record<string, unknown>) {
    return selectedStaff
      ? { id: selectedStaff.id, ...staffForm, ...overrides }
      : { ...staffForm, ...overrides }
  }

  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
      ; (async () => {
        try {
          const formEl = e.currentTarget as HTMLFormElement
          const fd = new FormData(formEl)
          const parsed = parseStaffFormData(fd)
          if (!isValidContact(parsed.email, parsed.phone)) {
            showNotification("error", "Please enter valid email and phone")
            setIsLoading(false)
            return
          }
          const method = selectedStaff ? 'PATCH' : 'POST'
          const payload = buildStaffPayload(selectedStaff, staffForm, parsed)
          const res = await fetch('/api/admin/staff', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
          if (!res.ok) throw new Error('Failed')
          try {
            const json = await res.json()
            if (method === 'POST' && json?.staff?.id) {
              staffService.updateStaff(json.staff.id, { treatments: staffForm.treatments || [] })
            }
            if (method === 'PATCH' && selectedStaff?.id) {
              staffService.updateStaff(selectedStaff.id, { treatments: staffForm.treatments || [] })
            }
          } catch { }
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
      ; (async () => {
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
      ; (async () => {
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

  const openPaymentModalPrefill = (prefill: Partial<Payment>) => {
    setSelectedPayment(null)
    setPaymentForm({
      status: 'pending',
      method: 'gcash',
      uploadedFiles: [],
      ...prefill,
    })
    setIsPaymentModalOpen(true)
  }

  const openMedicalRecordModal = (record?: MedicalRecord, clientId?: string) => {
    if (record) {
      setSelectedMedicalRecord(record)
      setMedicalRecordForm(record)
      setChiefComplaintText(String(record.chiefComplaint || ''))
      setMedicalHistoryText(Array.isArray(record.medicalHistory) ? record.medicalHistory.join('\n') : '')
      setAllergiesText(Array.isArray(record.allergies) ? record.allergies.join('\n') : '')
      setCurrentMedicationsText(Array.isArray(record.currentMedications) ? record.currentMedications.join('\n') : '')
      setTreatmentPlanText(String(record.treatmentPlan || ''))
      setNotesText(String(record.notes || ''))
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
        treatments: []
      })
      setChiefComplaintText('')
      setMedicalHistoryText('')
      setAllergiesText('')
      setCurrentMedicationsText('')
      setTreatmentPlanText('')
      setNotesText('')
    }
    setIsMedicalRecordModalOpen(true)
  }

  const medicalTreatmentItems = React.useMemo(() => {
    const client = clients.find(c => c.id === (medicalRecordForm.clientId || ''))
    const clientName = client ? `${client.firstName} ${client.lastName}`.trim() : ''
    const items = staff.flatMap(s => (Array.isArray(s.treatments) ? s.treatments.map(t => ({ ...t, staffName: `${s.firstName} ${s.lastName}`.trim() })) : []))
    return items.filter(t => clientName ? (String(t.clientName || '').trim() === clientName) : true)
  }, [staff, clients, medicalRecordForm.clientId])

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
      // Sanitize fields that might be encrypted
      const sanitized = {
        ...person,
        licenseNumber: typeof person.licenseNumber === 'string' && person.licenseNumber.includes('"iv":') ? '••••••••' : person.licenseNumber,
        notes: typeof person.notes === 'string' && person.notes.includes('"iv":') ? 'Encrypted' : person.notes
      }
      setStaffForm(sanitized)
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
        notes: '',
        treatments: []
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
    setInfluencerReveal({ referralCode: true, email: true, phone: true })
    setIsInfluencerModalOpen(true)
  }

  return (
    <>
      <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] font-sans selection:bg-[#E2D1C3] selection:text-[#1A1A1A]">
        {/* Subtle background grain or texture */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100] bg-[url('https://www.transparenttextures.com/patterns/felt.png')]" />

        {/* Interactive background elements - refined */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#E2D1C3]/20 blur-[120px] rounded-full animate-pulse-subtle" />
          <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-[#C3D7E2]/20 blur-[100px] rounded-full animate-pulse-subtle delay-1000" />
        </div>

        {/* Premium Notification */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`fixed top-24 right-6 z-50 p-6 rounded-3xl shadow-2xl border-2 backdrop-blur-2xl ${notification.type === "success"
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

        <div className="flex min-h-screen bg-[#FDFCFB]">
          {/* Main Sidebar - Desktop (Minimalist White & Pink) */}
          <aside className="hidden lg:flex w-[280px] flex-col bg-white border-r border-stone-100 fixed h-screen z-50">
            {/* Sidebar Header: Brand Logo & Title */}
            <div className="p-8 pb-6">
              <div className="flex items-center justify-center mb-6">
                <img
                  src="https://res.cloudinary.com/dbviya1rj/image/upload/v1753674655/skinessentials_logo_350_x_180_px_fpp26r.png"
                  alt="Skin Essentials Logo"
                  className="w-full h-auto object-contain max-w-[200px]"
                />
              </div>

              {/* System Status Indicators in Sidebar */}
              <div className="mt-6 space-y-2">
                {supabaseAvailable() ? (
                  <div className="flex items-center gap-2 text-[9px] font-bold tracking-widest text-[#0F2922] bg-[#0F2922]/10 px-3 py-1.5 rounded-full border border-[#0F2922]/20 uppercase">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0F2922] animate-pulse" />
                    System Online
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-[9px] font-bold tracking-widest text-rose-600 bg-rose-500/10 px-3 py-1.5 rounded-full border border-rose-500/20 uppercase">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    System Offline
                  </div>
                )}
                <div className="scale-90 origin-left">
                  <FacebookStatusIndicator />
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-none">
              <div className="mb-10">
                <p className="text-[10px] font-bold tracking-[0.25em] text-stone-400 uppercase mb-6 px-4">Menu</p>
                <div className="space-y-1">
                  {[
                    { key: 'dashboard', label: 'Overview', icon: LayoutDashboard },
                    { key: 'appointments', label: 'Bookings', icon: CalendarDays },
                    { key: 'payments', label: 'Financials', icon: CreditCard },
                    { key: 'medical', label: 'Medical Records', icon: FileText },
                    { key: 'clients', label: 'Client Base', icon: Users },
                    { key: 'staff', label: 'Team', icon: Settings },
                    { key: 'social', label: 'Communications', icon: MessageSquare },
                    { key: 'content', label: 'Media & Assets', icon: FileImage },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setActiveTab(item.key)}
                      className={`relative w-full flex items-center gap-4 px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 group ${activeTab === item.key
                        ? 'text-[#d09d80] bg-[#fbc6c5]/10'
                        : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
                        }`}
                    >
                      {activeTab === item.key && (
                        <motion.div
                          layoutId="active-indicator"
                          className="absolute left-0 w-1.5 h-6 bg-[#d09d80] rounded-r-full"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      <item.icon className={`w-5 h-5 transition-colors ${activeTab === item.key ? 'text-[#d09d80]' : 'text-stone-400 group-hover:text-stone-900'}`} />
                      {item.label}
                      {item.key === 'social' && socialMessages.filter(m => !m.isReplied).length > 0 && (
                        <span className="ml-auto bg-[#0F2922] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[20px] text-center">
                          {socialMessages.filter(m => !m.isReplied).length}
                        </span>
                      )}
                      {item.key === 'medical' && medicalRecords.length > 0 && (
                        <span className="ml-auto bg-[#0F2922]/10 text-[#0F2922] text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[20px] text-center border border-[#0F2922]/20">
                          {medicalRecords.length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold tracking-[0.25em] text-stone-400 uppercase mb-6 px-4">General</p>
                <div className="space-y-1">
                  {[
                    { key: 'email', label: 'Automations', icon: Mail },
                    { key: 'sms', label: 'SMS Gateway', icon: MessageSquare },
                    { key: 'influencers', label: 'Partnerships', icon: TrendingUp },
                    { key: 'analytics', label: 'Performance', icon: BarChart3 },
                    { key: 'audit-logs', label: 'Audit Trails', icon: Shield },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setActiveTab(item.key)}
                      className={`relative w-full flex items-center gap-4 px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 group ${activeTab === item.key
                        ? 'text-[#d09d80] bg-[#fbc6c5]/10'
                        : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
                        }`}
                    >
                      {activeTab === item.key && (
                        <motion.div
                          layoutId="active-indicator"
                          className="absolute left-0 w-1.5 h-6 bg-[#d09d80] rounded-r-full"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      <item.icon className={`w-5 h-5 transition-colors ${activeTab === item.key ? 'text-[#d09d80]' : 'text-stone-400 group-hover:text-stone-900'}`} />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Footer: Profile Section */}
            <div className="p-6 border-t border-stone-100">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div>
                    <AdminProfileButton />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl border border-stone-100 shadow-xl bg-white/95 backdrop-blur-md">
                  <DropdownMenuLabel className="text-stone-800">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-stone-100" />
                  <DropdownMenuItem
                    className="focus:bg-stone-50 focus:text-stone-900 cursor-pointer rounded-lg"
                    onClick={() => setIsProfileSettingsOpen(true)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="focus:bg-red-50 focus:text-red-900 text-red-700 cursor-pointer rounded-lg"
                    onClick={handleLogout}
                  >
                    <div className="flex items-center w-full">
                      <span className="flex-1">Log out</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 lg:ml-[280px]">
            {/* Top Navigation Bar - Main Page Header */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-stone-100 px-8 py-5 flex items-center justify-between">
              <div className="flex flex-col">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight text-stone-800 uppercase">
                    Admin <span className="text-[#d09d80]">Dashboard.</span>
                  </h1>
                  <div className="h-4 w-[1px] bg-stone-200" />
                  <p className="text-[11px] text-[#d09d80] font-bold tracking-[0.2em] uppercase">
                    Portal
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 mr-4 text-[10px] font-bold text-stone-500 uppercase tracking-widest bg-white border border-stone-100 px-3 py-1.5 rounded-full">
                  <Clock className="w-3 h-3" />
                  <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPrivacyMode(prev => !prev)}
                  className={`text-[10px] font-bold tracking-[0.2em] uppercase border border-stone-200 px-4 h-9 rounded-full transition-all ${privacyMode ? 'bg-stone-900 text-white' : 'hover:bg-stone-50 text-stone-600'}`}
                >
                  {privacyMode ? 'Privacy: On' : 'Privacy: Off'}
                </Button>

                <div className="w-[1px] h-6 bg-stone-200 mx-1" />

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadAllData}
                  disabled={isLoading}
                  className="text-[10px] font-bold tracking-[0.2em] uppercase text-stone-600 hover:bg-stone-50 h-9 px-4 rounded-full border border-stone-200"
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-[10px] font-bold tracking-[0.2em] uppercase text-rose-600 hover:bg-rose-50 h-9 px-4 rounded-full border border-rose-100"
                >
                  Logout
                </Button>
              </div>
            </header>

            <main className="px-8 py-10 max-w-screen-2xl mx-auto">
              <EncryptionErrorBanner
                errorCount={decryptionErrorCount}
                onRetry={loadAllData}
                onRunDiagnostics={handleRunDiagnostics}
              />
              <ProfileSettingsModal 
                open={isProfileSettingsOpen} 
                onOpenChange={setIsProfileSettingsOpen} 
              />
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col gap-8 w-full">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="lg:hidden mb-10"
                >
                  <TabsList className="bg-white border border-stone-100 h-16 items-center rounded-2xl p-2 w-full flex overflow-x-auto scrollbar-none gap-2">
                    {[
                      { value: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
                      { value: 'appointments', icon: CalendarDays, label: 'Bookings' },
                      { value: 'payments', icon: CreditCard, label: 'Financials' },
                      { value: 'medical', icon: FileText, label: 'EMR' },
                      { value: 'clients', icon: Users, label: 'Clients' },
                      { value: 'staff', icon: Settings, label: 'Staff' },
                      { value: 'audit-logs', icon: Shield, label: 'Audit' },
                    ].map((tab) => (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="data-[state=active]:bg-stone-900 data-[state=active]:text-white data-[state=active]:shadow-xl text-stone-500 h-full flex items-center gap-3 rounded-xl px-6 text-[10px] font-bold uppercase tracking-widest transition-all"
                      >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </motion.div>

                {/* Dashboard Overview */}
                <LazyTabContent isActive={activeTab === "dashboard"}>
                  <TabsContent value="dashboard" className="space-y-8">
                    <DashboardTab
                        appointments={appointments}
                        payments={payments}
                        clients={clients}
                        staff={staff}
                        socialMessages={socialMessages}
                    />
                  </TabsContent>
                </LazyTabContent>

                {/* Appointments/Booking System */}
                <LazyTabContent isActive={activeTab === "appointments"}>
                  <TabsContent value="appointments" className="space-y-8">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900">Booking Management</h2>
                      <Button
                        onClick={() => openModal()}
                        className="bg-stone-900 hover:bg-stone-800 text-white shadow-lg shadow-stone-900/10 hover:shadow-stone-900/20 transition-all duration-300 hover:scale-105 font-bold px-6 py-3 rounded-2xl"
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
                                .sort((a, b) => a.time.localeCompare(b.time))
                                .map((appointment) => (
                                  <div key={appointment.id} className="group flex items-center gap-6 p-5 bg-white border border-[#E2D1C3]/20 rounded-2xl hover:border-[#8B735B]/40 hover:shadow-xl hover:shadow-[#8B735B]/5 transition-all duration-300">
                                    <div className="flex flex-col items-center justify-center w-20 h-20 bg-[#FDFCFB] border border-[#E2D1C3]/30 rounded-2xl">
                                      <span className="text-[10px] font-bold text-[#8B735B] uppercase tracking-wider mb-1">Time</span>
                                      <span className="text-lg font-bold text-[#1A1A1A] leading-none">{appointment.time}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-3 mb-2">
                                        <h4 className="font-bold text-[#1A1A1A] tracking-tight truncate">
                                          {privacyMode ? maskName(appointment.clientName) : appointment.clientName}
                                        </h4>
                                        <span className={`text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full border ${appointment.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                          appointment.status === 'confirmed' ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' :
                                            appointment.status === 'scheduled' ? 'bg-[#E2D1C3]/20 text-[#8B735B] border-[#E2D1C3]/30' :
                                              'bg-rose-50 text-rose-600 border-rose-100'
                                          }`}>
                                          {appointment.status}
                                        </span>
                                      </div>
                                      <p className="text-[10px] text-[#8B735B] font-bold uppercase tracking-[0.1em] mb-1">{appointment.service}</p>
                                      <div className="flex items-center gap-3 text-[11px] text-[#1A1A1A]/60 font-medium">
                                        <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {appointment.duration} min</span>
                                        <span className="flex items-center gap-1.5"><DollarSign className="w-3 h-3" /> ₱{appointment.price.toLocaleString()}</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button size="icon" variant="ghost" onClick={() => openModal(appointment)} className="h-9 w-9 rounded-xl hover:bg-[#E2D1C3]/20 text-[#8B735B]">
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      <Button size="icon" variant="ghost" onClick={() => { const client = clients.find(c => c.id === appointment.clientId); if (client) openMedicalRecordModal(undefined, client.id) }} className="h-9 w-9 rounded-xl hover:bg-[#E2D1C3]/20 text-[#8B735B]">
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
                          <div className="flex items-center justify-end">
                            <Button variant="outline" className="h-9" onClick={() => setPrivacyMode(prev => !prev)}>{privacyMode ? 'Privacy On' : 'Privacy Off'}</Button>
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
                              <AppointmentsTable
                                appointments={pageItems}
                                isLoading={isLoading}
                                onEdit={(apt: Appointment) => openModal(apt)}
                                onDelete={(apt: Appointment) => { if (confirm("Are you sure?")) handleAppointmentDeleteAction(apt.id) }}
                                onStatusChange={handleUpdateAppointmentStatus}
                                onViberNotify={handleViberNotify}
                                onQuickAddClient={quickAddClientFromAppointment}
                              />
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
                <LazyTabContent isActive={activeTab === "email"}>
                  <TabsContent value="email" className="space-y-8">
                    <Card className="border-stone-100 bg-white/70 backdrop-blur-xl shadow-xl rounded-3xl">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Mail className="w-5 h-5 text-[#d09d80]" />
                          Email Services
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">

                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <Label>Sender Email (Google)</Label>
                            <Input placeholder="Configured via environment" disabled />
                            <p className="text-xs text-gray-500 mt-2">Uses GOOGLE_SENDER_EMAIL with OAuth2 refresh token</p>
                          </div>
                          <div>
                            <Label>AI Auto-Reply</Label>
                            <div className="flex items-center gap-3">
                              <Badge className="bg-rose-100 text-rose-700">Enabled when OPENAI_API_KEY is set</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label>Send Test Email</Label>
                            <div className="flex items-center gap-3">
                              <Input value={clientForm.email || ''} onChange={(e) => setClientForm(prev => ({ ...prev, email: e.target.value }))} placeholder="recipient@example.com" />
                              <Button
                                onClick={async () => {
                                  try {
                                    const to = String(clientForm.email || '').trim()
                                    if (!to) return
                                    const res = await fetch('/api/email', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ action: 'send', payload: { to, subject: 'Test Email', html: '<div style=\'font-family:system-ui\'>This is a test email from Skin Essentials.</div>' } })
                                    })
                                    const j = await res.json()
                                    showNotification(j?.ok ? 'success' : 'error', j?.ok ? 'Email sent' : 'Failed to send')
                                  } catch {
                                    showNotification('error', 'Failed to send')
                                  }
                                }}
                                variant="brand"
                              >
                                Send
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <Label>Process Inbox (AI)</Label>
                            <div className="flex items-center gap-3">
                              <Button
                                onClick={async () => {
                                  try {
                                    const res = await fetch('/api/email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'process' }) })
                                    const j = await res.json()
                                    showNotification(j?.ok ? 'success' : 'error', j?.ok ? `Processed ${j?.processed || 0} emails` : 'Failed to process')
                                  } catch {
                                    showNotification('error', 'Failed to process')
                                  }
                                }}
                                variant="brand"
                              >
                                Run Now
                              </Button>
                            </div>
                            <p className="text-xs text-gray-500">Composes replies and sends via Gmail</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Inbox Preview</h3>
                            <Button onClick={refreshEmailPreview} disabled={emailLoading} variant="secondary" className="h-9">
                              {emailLoading ? 'Loading...' : 'Refresh'}
                            </Button>
                          </div>
                          <div className="rounded-2xl border bg-white/70 p-4">
                            <Table>
                              <TableHeader className="bg-stone-50/50">
                                <TableRow className="border-b border-stone-100 hover:bg-transparent">
                                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-stone-500 py-5">From</TableHead>
                                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Subject</TableHead>
                                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Preview</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {emailPreview.map(m => (
                                  <TableRow key={m.id} className="group border-b border-[#E2D1C3]/10 hover:bg-[#FDFCFB] transition-colors cursor-default">
                                    <TableCell className="py-4">
                                      <div className="font-bold text-[#1A1A1A] tracking-tight truncate max-w-[200px]">{m.from}</div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-tight truncate max-w-[200px]">{m.subject || 'No Subject'}</div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="text-[10px] text-[#8B735B]/70 font-medium tracking-tight truncate max-w-[320px]">{m.snippet}</div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                                {emailPreview.length === 0 && (
                                  <TableRow>
                                    <TableCell colSpan={3} className="text-center py-10 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8B735B]/40">No recent messages</TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </LazyTabContent>
                <LazyTabContent isActive={activeTab === "sms"}>
                  <TabsContent value="sms" className="space-y-8">
                    <SmsManager
                      smsStatus={smsStatus}
                      refreshSmsStatus={refreshSmsStatus}
                      showNotification={showNotification}
                    />
                  </TabsContent>
                </LazyTabContent>
                <LazyTabContent isActive={activeTab === "content"}>
                  <TabsContent value="content" className="space-y-8">
                    <Tabs value={contentSubTab} onValueChange={setContentSubTab} className="w-full">
                      <TabsList className="bg-white/30 backdrop-blur-xl border border-white/60 shadow h-12 items-center justify-center rounded-2xl p-2 grid w-full grid-cols-3 mb-6">
                        <TabsTrigger value="services" className="data-[state=active]:bg-stone-900 data-[state=active]:text-white text-gray-700 h-9 justify-center rounded-xl border border-transparent px-3 py-2 text-sm font-bold transition-all duration-300 data-[state=active]:border-white/80">Services Manager</TabsTrigger>
                        <TabsTrigger value="portfolio" className="data-[state=active]:bg-stone-900 data-[state=active]:text-white text-gray-700 h-9 justify-center rounded-xl border border-transparent px-3 py-2 text-sm font-bold transition-all duration-300 data-[state=active]:border-white/80">Portfolio Manager</TabsTrigger>
                        <TabsTrigger value="categories" className="data-[state=active]:bg-stone-900 data-[state=active]:text-white text-gray-700 h-9 justify-center rounded-xl border border-transparent px-3 py-2 text-sm font-bold transition-all duration-300 data-[state=active]:border-white/80">Category Manager</TabsTrigger>
                      </TabsList>
                      <TabsContent value="services" className="space-y-8">
                        <Card className="border-stone-100 bg-white/70 backdrop-blur-xl shadow-xl rounded-3xl">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <FileImage className="w-5 h-5 text-[#d09d80]" />
                              Services Manager
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            <div className="grid md:grid-cols-3 gap-4 items-end">
                              <div>
                                <Label>Category</Label>
                                <Select value={contentSelectedCategory} onValueChange={(v) => setContentSelectedCategory(v)}>
                                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
                                  <SelectContent>
                                    {contentServices.map((c) => (
                                      <SelectItem key={c.id} value={c.id}>{c.category}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="md:col-span-2 grid grid-cols-3 gap-3">
                                <div>
                                  <Label>Name</Label>
                                  <Input value={newServiceForm.name} onChange={(e) => setNewServiceForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Service name" />
                                </div>
                                <div>
                                  <Label>Price</Label>
                                  <Input value={newServiceForm.price} onChange={(e) => setNewServiceForm(prev => ({ ...prev, price: e.target.value }))} placeholder="₱0" />
                                </div>
                                <div>
                                  <Label>Duration</Label>
                                  <Input value={newServiceForm.duration || ''} onChange={(e) => setNewServiceForm(prev => ({ ...prev, duration: e.target.value }))} placeholder="e.g. 45 minutes" />
                                </div>
                                <div className="col-span-3">
                                  <Label>Description</Label>
                                  <Textarea value={newServiceForm.description} onChange={(e) => setNewServiceForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Describe the service" />
                                </div>
                                <div>
                                  <Label>Results</Label>
                                  <Input value={newServiceForm.results || ''} onChange={(e) => setNewServiceForm(prev => ({ ...prev, results: e.target.value }))} placeholder="e.g. 6-12 months" />
                                </div>
                                <div>
                                  <Label>Image URL</Label>
                                  <Input value={newServiceForm.image || ''} onChange={(e) => setNewServiceForm(prev => ({ ...prev, image: e.target.value }))} placeholder="https://..." />
                                </div>
                                <div className="col-span-1 flex items-end">
                                  <Button
                                    onClick={async () => {
                                      try {
                                        const id = contentSelectedCategory
                                        if (!id || !newServiceForm.name || !newServiceForm.price) return
                                        const res = await fetch('/api/services', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'addService', categoryId: id, service: newServiceForm }) })
                                        const j = await res.json()
                                        if (j?.ok) {
                                          const r = await fetch('/api/services')
                                          const jr = await r.json()
                                          if (jr?.ok) setContentServices(jr.data.map((c: ServiceCategory) => ({ id: c.id, category: c.category, description: c.description, image: c.image, color: c.color, services: c.services })))
                                          setNewServiceForm({ name: '', price: '', description: '', duration: '', results: '', image: '' })
                                          showNotification('success', 'Service added')
                                        } else showNotification('error', 'Failed to add service')
                                      } catch { showNotification('error', 'Failed to add service') }
                                    }}
                                    variant="brand"
                                    className="w-full"
                                  >
                                    Add Service
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <ServiceEditModal open={isServiceEditOpen} onOpenChange={(v) => { setIsServiceEditOpen(v); if (!v) setServiceEditTarget(null) }} target={serviceEditTarget} selectedCategory={contentSelectedCategory} onSaved={async () => { try { const r = await fetch('/api/services'); const jr = await r.json(); if (jr?.ok) setContentServices(jr.data.map((c: ServiceCategory) => ({ id: c.id, category: c.category, description: c.description, image: c.image, color: c.color, services: c.services }))); showNotification('success', 'Service updated') } catch { } }} />
                            <div className="rounded-2xl border bg-white/70 p-4">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead></TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {(contentServices.find(c => c.id === contentSelectedCategory)?.services || []).map((s, i) => (
                                    <TableRow key={i}>
                                      <TableCell className="font-medium">{s.name}</TableCell>
                                      <TableCell>{s.price}</TableCell>
                                      <TableCell>{s.duration || ''}</TableCell>
                                      <TableCell className="text-right">
                                        <Button
                                          variant="outline"
                                          className="mr-2"
                                          onClick={() => {
                                            setServiceEditTarget(s)
                                            setServiceEditForm({
                                              name: s.name,
                                              price: s.price,
                                              description: s.description || '',
                                              duration: s.duration || '',
                                              results: s.results || '',
                                              sessions: s.sessions || '',
                                              includes: s.includes || '',
                                              originalPrice: s.originalPrice || '',
                                              badge: s.badge || '',
                                              pricing: s.pricing || '',
                                              benefits: Array.isArray(s.benefits) ? s.benefits : [],
                                              faqs: Array.isArray(s.faqs) ? s.faqs : []
                                            })
                                            setIsServiceEditOpen(true)
                                          }}
                                        >
                                          Edit
                                        </Button>
                                        <Button
                                          variant="outline"
                                          onClick={async () => {
                                            try {
                                              const res = await fetch('/api/services', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'deleteService', categoryId: contentSelectedCategory, name: s.name }) })
                                              const j = await res.json()
                                              if (j?.ok) {
                                                const r = await fetch('/api/services')
                                                const jr = await r.json()
                                                if (jr?.ok) setContentServices(jr.data.map((c: ServiceCategory) => ({ id: c.id, category: c.category, services: c.services })))
                                                showNotification('success', 'Service removed')
                                              } else showNotification('error', 'Failed')
                                            } catch { showNotification('error', 'Failed') }
                                          }}
                                        >
                                          Remove
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="portfolio" className="space-y-8">
                        <Card className="border-stone-100 bg-white/70 backdrop-blur-xl shadow-xl rounded-3xl">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <FileImage className="w-5 h-5 text-[#d09d80]" />
                              Portfolio Manager
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-4 items-start">
                              <div className="space-y-4 rounded-2xl border bg-white/70 p-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                  <AnimatedInput
                                    id="pf-title"
                                    label="Title"
                                    value={portfolioForm.title || ''}
                                    onChange={(e) => setPortfolioForm(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Case title"
                                    required
                                  />
                                  <AnimatedSelect
                                    value={portfolioForm.category || ''}
                                    onValueChange={(v) => setPortfolioForm(prev => ({ ...prev, category: v }))}
                                    placeholder="Select category"
                                    options={categoryOptions.map(c => ({ value: c, label: c }))}
                                    label="Category"
                                  />
                                  <AnimatedSelect
                                    value={portfolioForm.treatment || ''}
                                    onValueChange={(v) => setPortfolioForm(prev => ({ ...prev, treatment: v }))}
                                    placeholder="Select treatment"
                                    options={procedureOptions.map(p => ({ value: p, label: p }))}
                                    label="Treatment"
                                  />
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">Description</Label>
                                    <Textarea
                                      value={portfolioForm.description || ''}
                                      onChange={(e) => setPortfolioForm(prev => ({ ...prev, description: e.target.value }))}
                                      placeholder="Describe the transformation"
                                      rows={3}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <AnimatedInput
                                      id="pf-before"
                                      label="Before Image URL"
                                      value={portfolioForm.beforeImage || ''}
                                      onChange={(e) => setPortfolioForm(prev => ({ ...prev, beforeImage: e.target.value }))}
                                      placeholder="https://..."
                                      required
                                    />
                                    <div className="flex gap-2">
                                      <Button variant="outline" onClick={() => portfolioBeforeFileInputRef.current?.click()}>
                                        <Upload className="w-4 h-4 mr-2" /> Upload Before
                                      </Button>
                                      <input
                                        ref={portfolioBeforeFileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => { const input = e.currentTarget; const f = input.files?.[0]; input.value = ''; if (f) uploadPortfolioFile(f, 'before', 'create') }}
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <AnimatedInput
                                      id="pf-after"
                                      label="After Image URL"
                                      value={portfolioForm.afterImage || ''}
                                      onChange={(e) => setPortfolioForm(prev => ({ ...prev, afterImage: e.target.value }))}
                                      placeholder="https://..."
                                      required
                                    />
                                    <div className="flex gap-2">
                                      <Button variant="outline" onClick={() => portfolioAfterFileInputRef.current?.click()}>
                                        <Upload className="w-4 h-4 mr-2" /> Upload After
                                      </Button>
                                      <input
                                        ref={portfolioAfterFileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => { const input = e.currentTarget; const f = input.files?.[0]; input.value = ''; if (f) uploadPortfolioFile(f, 'after', 'create') }}
                                      />
                                    </div>
                                  </div>
                                  <AnimatedInput
                                    id="pf-duration"
                                    label="Duration"
                                    value={portfolioForm.duration || ''}
                                    onChange={(e) => setPortfolioForm(prev => ({ ...prev, duration: e.target.value }))}
                                    placeholder="e.g. 1 hour"
                                  />
                                  <AnimatedInput
                                    id="pf-results"
                                    label="Results"
                                    value={portfolioForm.results || ''}
                                    onChange={(e) => setPortfolioForm(prev => ({ ...prev, results: e.target.value }))}
                                    placeholder="e.g. 12-18 months"
                                  />
                                </div>
                                <div className="flex items-center gap-3">
                                  <Button
                                    onClick={() => {
                                      const f = portfolioForm
                                      if (!f.title || !f.category || !f.beforeImage || !f.afterImage) { showNotification('error', 'Please fill required fields'); return }
                                      ; (async () => {
                                        try {
                                          const res = await fetch('/api/portfolio', {
                                            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
                                              title: String(f.title),
                                              category: String(f.category),
                                              beforeImage: String(f.beforeImage),
                                              afterImage: String(f.afterImage),
                                              description: String(f.description || ''),
                                              treatment: String(f.treatment || ''),
                                              duration: String(f.duration || ''),
                                              results: String(f.results || ''),
                                            })
                                          })
                                          const j = await res.json()
                                          if (j?.ok) {
                                            const r = await fetch('/api/portfolio')
                                            const jr = await r.json()
                                            if (jr?.ok && Array.isArray(jr.data)) setContentPortfolioItems(jr.data)
                                            setPortfolioForm({})
                                            showNotification('success', 'Portfolio item added')
                                          } else showNotification('error', 'Failed to add item')
                                        } catch { showNotification('error', 'Failed to add item') }
                                      })()
                                    }}
                                    variant="brand"
                                  >
                                    Add Item
                                  </Button>
                                </div>
                              </div>
                              <div className="md:col-span-1 rounded-2xl border bg-white/70 p-4 md:col-span-2">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Title</TableHead>
                                      <TableHead>Category</TableHead>
                                      <TableHead>Treatment</TableHead>
                                      <TableHead></TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {contentPortfolioItems.map((p) => (
                                      <TableRow key={p.id}>
                                        <TableCell className="font-medium">{p.title}</TableCell>
                                        <TableCell>{p.category}</TableCell>
                                        <TableCell>{p.treatment}</TableCell>
                                        <TableCell className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                                          <div className="flex items-center justify-end gap-2">
                                            <Button
                                              variant="outline"
                                              onClick={() => { setEditPortfolioItem(p); setEditPortfolioForm({ ...p }) }}
                                            >
                                              Edit
                                            </Button>
                                            <Button
                                              variant="outline"
                                              onClick={() => { setPreviewPortfolioItem(p); setPreviewShowSimilar(false) }}
                                            >
                                              Preview
                                            </Button>
                                            <Button
                                              variant="outline"
                                              onClick={() => {
                                                ; (async () => {
                                                  try {
                                                    const res = await fetch(`/api/portfolio/${p.id}`, { method: 'DELETE' })
                                                    const j = await res.json()
                                                    if (j?.ok) {
                                                      const r = await fetch('/api/portfolio')
                                                      const jr = await r.json()
                                                      if (jr?.ok && Array.isArray(jr.data)) setContentPortfolioItems(jr.data)
                                                      showNotification('success', 'Removed')
                                                    } else showNotification('error', 'Failed')
                                                  } catch { showNotification('error', 'Failed') }
                                                })()
                                              }}
                                            >
                                              Remove
                                            </Button>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                            <Dialog open={!!addResultTarget} onOpenChange={(v) => { if (!v) setAddResultTarget(null) }}>
                              <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Add Result</DialogTitle>
                                </DialogHeader>
                                {addResultTarget && (
                                  <div className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <AnimatedInput
                                          id="arf-before"
                                          label="Before Image URL"
                                          value={addResultForm.beforeImage}
                                          onChange={(e) => setAddResultForm(prev => ({ ...prev, beforeImage: e.target.value }))}
                                          required
                                        />
                                        <div className="flex gap-2">
                                          <Button variant="outline" onClick={() => addResultBeforeRef.current?.click()}>
                                            <Upload className="w-4 h-4 mr-2" /> Upload Before
                                          </Button>
                                          <input
                                            ref={addResultBeforeRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={async (e) => { const input = e.currentTarget; const f = input.files?.[0]; input.value = ''; if (f) { await uploadPortfolioFile(f, 'before', 'addResult') } }}
                                          />
                                        </div>
                                      </div>
                                      <div className="space-y-2">
                                        <AnimatedInput
                                          id="arf-after"
                                          label="After Image URL"
                                          value={addResultForm.afterImage}
                                          onChange={(e) => setAddResultForm(prev => ({ ...prev, afterImage: e.target.value }))}
                                          required
                                        />
                                        <div className="flex gap-2">
                                          <Button variant="outline" onClick={() => addResultAfterRef.current?.click()}>
                                            <Upload className="w-4 h-4 mr-2" /> Upload After
                                          </Button>
                                          <input
                                            ref={addResultAfterRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={async (e) => { const input = e.currentTarget; const f = input.files?.[0]; input.value = ''; if (f) { await uploadPortfolioFile(f, 'after', 'addResult') } }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex justify-end gap-3">
                                      <Button variant="outline" onClick={() => setAddResultTarget(null)}>Cancel</Button>
                                      <Button
                                        variant="brand"
                                        onClick={() => {
                                          if (!addResultTarget) return
                                          const b = String(addResultForm.beforeImage || '')
                                          const a = String(addResultForm.afterImage || '')
                                          if (!b || !a) { showNotification('error', 'Please provide both images'); return }
                                          ; (async () => {
                                            try {
                                              const payload = {
                                                title: addResultTarget.title,
                                                category: addResultTarget.category,
                                                beforeImage: b,
                                                afterImage: a,
                                                description: addResultTarget.description,
                                                treatment: addResultTarget.treatment,
                                                duration: addResultTarget.duration,
                                                results: addResultTarget.results,
                                                extraResults: []
                                              }
                                              const res = await fetch('/api/portfolio', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
                                              if (res.ok) {
                                                const r = await fetch('/api/portfolio', { cache: 'no-store' })
                                                const jr = await r.json()
                                                if (jr?.ok && Array.isArray(jr.data)) setContentPortfolioItems(jr.data)
                                                setAddResultTarget(null)
                                                setAddResultForm({ beforeImage: '', afterImage: '' })
                                                showNotification('success', 'Result added')
                                              } else {
                                                showNotification('error', 'Failed to add result')
                                              }
                                            } catch { showNotification('error', 'Failed to add result') }
                                          })()
                                        }}
                                      >
                                        Add
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            <Dialog open={!!previewPortfolioItem} onOpenChange={(v) => { if (!v) setPreviewPortfolioItem(null) }}>
                              <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-md border border-white/20 shadow-2xl">
                                {previewPortfolioItem && (
                                  <div className="space-y-8">
                                    <DialogHeader className="pb-2">
                                      <DialogTitle className="text-2xl font-bold text-gray-900 leading-tight">{previewPortfolioItem.title}</DialogTitle>
                                    </DialogHeader>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="relative h-64">
                                        <OptimizedImage src={previewPortfolioItem.beforeImage || '/placeholder.svg'} alt={`Before ${previewPortfolioItem.title}`} fill className="object-cover rounded-xl" />
                                        <div className="absolute top-2 left-2"><Badge className="bg-red-500/90 text-white text-[10px] font-semibold px-2 py-0.5">Before</Badge></div>
                                      </div>
                                      <div className="relative h-64">
                                        <OptimizedImage src={previewPortfolioItem.afterImage || '/placeholder.svg'} alt={`After ${previewPortfolioItem.title}`} fill className="object-cover rounded-xl" />
                                        <div className="absolute top-2 right-2"><Badge className="bg-green-500/90 text-white text-[10px] font-semibold px-2 py-0.5">After</Badge></div>
                                      </div>
                                    </div>
                                    <div className="rounded-xl border bg-white/80 p-4">
                                      <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div className="text-center"><div className="font-semibold text-gray-900">Duration</div><div className="text-gray-600">{previewPortfolioItem.duration || ''}</div></div>
                                        <div className="text-center"><div className="font-semibold text-gray-900">Results Last</div><div className="text-gray-600">{previewPortfolioItem.results || ''}</div></div>
                                        <div className="text-center"><div className="font-semibold text-gray-900">Treatment</div><div className="text-gray-600">{previewPortfolioItem.treatment || ''}</div></div>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <div className="text-gray-700 text-sm">{previewPortfolioItem.description || ''}</div>
                                      <Button variant="outline" size="sm" className="border-gray-300 bg-white/80 backdrop-blur-sm hover:bg-rose-50 hover:border-rose-300" onClick={() => { const next = !previewShowSimilar; setPreviewShowSimilar(next); if (next) setTimeout(() => previewSimilarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0) }}>
                                        {previewShowSimilar ? 'Hide More Results' : 'View More Results'}
                                      </Button>
                                    </div>
                                    {previewShowSimilar && (
                                      <div className="space-y-6" ref={previewSimilarRef}>
                                        <h4 className="font-bold text-gray-900 text-xl">More Results: {previewPortfolioItem.treatment}</h4>
                                        {contentPortfolioItems.filter(i => i.treatment === previewPortfolioItem.treatment && i.id !== previewPortfolioItem.id).length === 0 ? (
                                          <div className="text-center py-10 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200">
                                            <p className="text-gray-600">No additional results available for this treatment yet.</p>
                                          </div>
                                        ) : (
                                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {contentPortfolioItems
                                              .filter(i => i.treatment === previewPortfolioItem.treatment && i.id !== previewPortfolioItem.id)
                                              .map((i) => (
                                                <div key={i.id} className="group rounded-2xl overflow-hidden border border-gray-200 bg-white/90 backdrop-blur-sm shadow-sm">
                                                  <div className="grid grid-cols-2 h-52">
                                                    <div className="relative">
                                                      <OptimizedImage src={i.beforeImage || '/placeholder.svg'} alt={`Before ${i.title}`} fill className={`object-cover ${isSensitivePreview(i) && !previewRevealedMap[i.id] ? 'filter blur-xl' : ''}`} />
                                                      <div className="absolute top-2 left-2"><Badge className="bg-red-500/90 text-white text-[10px] font-semibold px-2 py-0.5">Before</Badge></div>
                                                    </div>
                                                    <div className="relative">
                                                      <OptimizedImage src={i.afterImage || '/placeholder.svg'} alt={`After ${i.title}`} fill className={`object-cover ${isSensitivePreview(i) && !previewRevealedMap[i.id] ? 'filter blur-xl' : ''}`} />
                                                      <div className="absolute top-2 right-2"><Badge className="bg-green-500/90 text-white text-[10px] font-semibold px-2 py-0.5">After</Badge></div>
                                                    </div>
                                                  </div>
                                                  <div className="p-4 flex items-center justify-between">
                                                    <p className="text-sm font-medium text-gray-800 line-clamp-1">{i.title}</p>
                                                    {isSensitivePreview(i) && (
                                                      <Button variant="secondary" size="sm" className="bg-white/80 text-gray-900 hover:bg-white" onClick={() => setPreviewRevealedMap((prev) => ({ ...prev, [i.id]: !prev[i.id] }))} aria-label={previewRevealedMap[i.id] ? 'Hide sensitive content' : 'Reveal sensitive content'}>
                                                        {previewRevealedMap[i.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                      </Button>
                                                    )}
                                                  </div>
                                                </div>
                                              ))}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            <PortfolioEditDialog
                              open={!!editPortfolioItem}
                              onOpenChange={(v) => { setEditPortfolioItem(v ? editPortfolioItem : null) }}
                              target={editPortfolioItem}
                              onSaved={async () => { try { const r = await fetch('/api/portfolio'); const jr = await r.json(); if (jr?.ok && Array.isArray(jr.data)) setContentPortfolioItems(jr.data); showNotification('success', 'Changes saved') } catch { } }}
                              categoryOptions={categoryOptions}
                              procedureOptions={procedureOptions}
                            />
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="categories" className="space-y-8">
                        <Card className="border-stone-100 bg-white/70 backdrop-blur-xl shadow-xl rounded-3xl">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <LayoutDashboard className="w-5 h-5 text-[#d09d80]" />
                              Category Manager
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            <CategoryEditModal open={isCategoryEditOpen} onOpenChange={(v) => { setIsCategoryEditOpen(v); if (!v) setCategoryEditTarget(null) }} target={categoryEditTarget} onSaved={async () => { try { const r = await fetch('/api/services'); const jr = await r.json(); if (jr?.ok) { const cats = jr.data.map((c: ServiceCategory) => ({ id: c.id, category: c.category, description: c.description, image: c.image, color: c.color, services: c.services })); setContentServices(cats); if (!contentSelectedCategory && cats.length) setContentSelectedCategory(cats[0].id) } showNotification('success', 'Category updated') } catch { } }} />
                            <div className="rounded-2xl border bg-white/70 p-4 space-y-4">
                              <div className="grid md:grid-cols-4 gap-3 items-end">
                                <div>
                                  <Label>New Category</Label>
                                  <Input value={newCategoryForm.category} onChange={(e) => setNewCategoryForm(prev => ({ ...prev, category: e.target.value }))} placeholder="Category name" />
                                </div>
                                <div>
                                  <Label>Color</Label>
                                  <Input value={newCategoryForm.color || ''} onChange={(e) => setNewCategoryForm(prev => ({ ...prev, color: e.target.value }))} placeholder="#hex or theme color" />
                                </div>
                                <div>
                                  <Label>Image URL</Label>
                                  <Input value={newCategoryForm.image || ''} onChange={(e) => setNewCategoryForm(prev => ({ ...prev, image: e.target.value }))} placeholder="https://..." />
                                </div>
                                <div className="md:col-span-4">
                                  <Label>Description</Label>
                                  <Textarea value={newCategoryForm.description || ''} onChange={(e) => setNewCategoryForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Describe the category" />
                                </div>
                                <div className="md:col-span-4 flex items-center justify-end">
                                  <Button
                                    onClick={async () => {
                                      try {
                                        if (!newCategoryForm.category) { showNotification('error', 'Category name required'); return }
                                        const res = await fetch('/api/services', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'addCategory', ...newCategoryForm }) })
                                        const j = await res.json()
                                        if (j?.ok) {
                                          const r = await fetch('/api/services')
                                          const jr = await r.json()
                                          if (jr?.ok) {
                                            const cats = jr.data.map((c: ServiceCategory) => ({ id: c.id, category: c.category, description: c.description, image: c.image, color: c.color, services: c.services }))
                                            setContentServices(cats)
                                            const createdId = newCategoryForm.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
                                            setContentSelectedCategory(createdId)
                                          }
                                          setNewCategoryForm({ category: '' })
                                          showNotification('success', 'Category added')
                                        } else showNotification('error', 'Failed to add category')
                                      } catch { showNotification('error', 'Failed to add category') }
                                    }}
                                    variant="brand"
                                  >
                                    Add Category
                                  </Button>
                                </div>
                              </div>
                              <div className="rounded-2xl border bg-white/70 p-4">
                                <Table>
                                  <TableHeader className="bg-[#FDFCFB]">
                                    <TableRow className="border-b border-[#E2D1C3]/20 hover:bg-transparent">
                                      <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B] py-5">Category</TableHead>
                                      <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B] text-right">Actions</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {contentServices.map((c) => (
                                      <TableRow key={c.id} className="group border-b border-[#E2D1C3]/10 hover:bg-[#FDFCFB] transition-colors cursor-default">
                                        <TableCell className="p-4 align-middle [&:has([role=checkbox])]:pr-0 py-4">
                                          <div className="font-bold text-[#1A1A1A] tracking-tight">{c.category}</div>
                                          <div className="text-[10px] text-[#8B735B]/70 font-bold uppercase tracking-widest">
                                            {c.services?.length || 0} Services
                                          </div>
                                        </TableCell>
                                        <TableCell className="p-4 align-middle [&:has([role=checkbox])]:pr-0 text-right">
                                          <div className="flex items-center justify-end gap-1">
                                            <Button
                                              size="icon"
                                              variant="ghost"
                                              className="h-8 w-8 rounded-lg text-[#8B735B] hover:bg-[#E2D1C3]/20"
                                              onClick={() => { setCategoryEditTarget({ id: c.id, category: c.category, description: c.description, image: c.image, color: c.color }); setCategoryEditForm({ category: c.category, description: c.description, image: c.image, color: c.color }); setIsCategoryEditOpen(true) }}
                                            >
                                              <Edit className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button
                                              size="icon"
                                              variant="ghost"
                                              className="h-8 w-8 rounded-lg text-rose-400 hover:bg-rose-50 hover:text-rose-600"
                                              onClick={async () => {
                                                try {
                                                  if (!confirmTwice(`category "${c.category}"`)) return
                                                  const res = await fetch('/api/services', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'deleteCategory', id: c.id }) })
                                                  const j = await res.json()
                                                  if (j?.ok) {
                                                    const r = await fetch('/api/services')
                                                    const jr = await r.json()
                                                    if (jr?.ok) {
                                                      const cats = jr.data.map((x: ServiceCategory) => ({ id: x.id, category: x.category, description: x.description, image: x.image, color: x.color, services: x.services }))
                                                      setContentServices(cats)
                                                      if (contentSelectedCategory === c.id) setContentSelectedCategory(cats[0]?.id || '')
                                                    }
                                                    showNotification('success', 'Category removed')
                                                  } else showNotification('error', 'Failed')
                                                } catch { showNotification('error', 'Failed') }
                                              }}
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </TabsContent>
                </LazyTabContent>

                {/* Payment Processing - Premium Animated */}
                <LazyTabContent isActive={activeTab === "payments"}>
                  <TabsContent value="payments" className="space-y-8">
                    <PaymentsTab
                      payments={payments}
                      clients={clients}
                      search={paymentSearch}
                      setSearch={setPaymentSearch}
                      methodFilter={paymentMethodFilter}
                      setMethodFilter={setPaymentMethodFilter}
                      statusFilter={paymentStatusFilter}
                      setStatusFilter={setPaymentStatusFilter}
                      dateFrom={paymentDateFrom}
                      setDateFrom={setPaymentDateFrom}
                      dateTo={paymentDateTo}
                      setDateTo={setPaymentDateTo}
                      sort={paymentSort}
                      setSort={setPaymentSort}
                      page={paymentPage}
                      setPage={setPaymentPage}
                      pageSize={paymentPageSize}
                      setPageSize={setPaymentPageSize}
                      openPaymentModal={openPaymentModal}
                      refreshPayments={refreshPayments}
                      showNotification={showNotification}
                    />
                  </TabsContent>
                </LazyTabContent>

                {/* Electronic Medical Records - Premium Animated */}
                <LazyTabContent isActive={activeTab === "medical"}>
                  <TabsContent value="medical" className="space-y-8">
                    <MedicalRecordsTab
                      medicalRecords={medicalRecords}
                      clients={clients}
                      privacyMode={privacyMode}
                      openMedicalRecordModal={openMedicalRecordModal}
                      refreshMedicalRecords={refreshMedicalRecords}
                      showNotification={showNotification}
                    />
                  </TabsContent>
                </LazyTabContent>

                {/* User Management - Premium Animated */}
                <LazyTabContent isActive={activeTab === "clients"}>
                  <TabsContent value="clients" className="space-y-8">
                    <ClientsTab
                      clients={clients}
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                      statusFilter={clientsStatusFilter}
                      setStatusFilter={setClientsStatusFilter}
                      sourceFilter={clientsSourceFilter}
                      setSourceFilter={setClientsSourceFilter}
                      sort={clientsSort}
                      setSort={setClientsSort}
                      privacyMode={privacyMode}
                      openClientModal={openClientModal}
                      openMedicalRecordModal={openMedicalRecordModal}
                      onRefresh={refreshClients}
                      showNotification={showNotification}
                    />
                  </TabsContent>
                </LazyTabContent>

                <LazyTabContent isActive={activeTab === "staff"}>
                  <TabsContent value="staff" className="space-y-8">
                    <StaffTab
                      staff={staff}
                      setStaff={setStaff}
                      clients={clients}
                      payments={payments}
                      privacyMode={privacyMode}
                      setPrivacyMode={setPrivacyMode}
                      openStaffModal={openStaffModal}
                      confirmTwice={confirmTwice}
                      showNotification={showNotification}
                      procedureOptions={procedureOptions}
                      patchJson={patchJson}
                      search={staffSearch}
                      setSearch={setStaffSearch}
                      positionFilter={staffPositionFilter}
                      setPositionFilter={setStaffPositionFilter}
                      statusFilter={staffStatusFilter}
                      setStatusFilter={setStaffStatusFilter}
                    />
                  </TabsContent>
                </LazyTabContent>

                <LazyTabContent isActive={activeTab === "audit-logs"}>
                  <TabsContent value="audit-logs" className="space-y-8">
                    <AuditLogsTab />
                  </TabsContent>
                </LazyTabContent>


                <LazyTabContent isActive={activeTab === "influencers"}>
                  <TabsContent value="influencers" className="space-y-8">
                    <InfluencersTab
                      influencers={influencers}
                      setInfluencers={setInfluencers}
                      openInfluencerModal={openInfluencerModal}
                      setSelectedInfluencer={setSelectedInfluencer}
                      setIsReferralModalOpen={setIsReferralModalOpen}
                      setIsReferralDetailsOpen={setIsReferralDetailsOpen}
                      confirmTwice={confirmTwice}
                      showNotification={showNotification}
                      search={influencerSearch}
                      setSearch={setInfluencerSearch}
                      platformFilter={influencerPlatformFilter}
                      setPlatformFilter={setInfluencerPlatformFilter}
                      statusFilter={influencerStatusFilter}
                      setStatusFilter={setInfluencerStatusFilter}
                      isPaymentModalOpen={isPaymentModalOpen}
                      isMedicalRecordModalOpen={isMedicalRecordModalOpen}
                      isClientModalOpen={isClientModalOpen}
                      isSocialReplyModalOpen={isSocialReplyModalOpen}
                      isStaffModalOpen={isStaffModalOpen}
                      isInfluencerModalOpen={isInfluencerModalOpen}
                      isReferralModalOpen={isReferralModalOpen}
                      isStaffTreatmentQuickOpen={isStaffTreatmentQuickOpen}
                    />
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
                      const clientsInRange = clients.filter(c => inRange(c.createdAt))
                      const totalRevenue = completedPayments.reduce((s, p) => s + p.amount, 0)
                      const avgOrder = completedPayments.length ? totalRevenue / completedPayments.length : 0

                      const bookedApts = appointments.filter(a => inRangeDateOnly(a.date))
                      const completedApts = appointments.filter(a => a.status === 'completed' && inRangeDateOnly(a.date))

                      const bySourceClients: Record<string, number> = {}
                      clientsInRange.forEach(c => {
                        const src = c.source || 'unknown'
                        if (clientsSourceFilter === 'all' || src === clientsSourceFilter) {
                          bySourceClients[src] = (bySourceClients[src] || 0) + 1
                        }
                      })
                      const clientsForSource = clientsInRange.filter(c => clientsSourceFilter === 'all' || c.source === clientsSourceFilter)

                      const displayBySource = bySourceClients
                      const displayDenominator = clientsForSource.length

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

                      const sourceLabels: Record<string, string> = {
                        website: 'Website',
                        referral: 'Referral',
                        facebook: 'Facebook',
                        instagram: 'Instagram',
                        tiktok: 'TikTok',
                        social_media: 'Social Media',
                        walk_in: 'Walk-in',
                        unknown: 'Unknown'
                      }

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
                                        <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" style={{ width: `${pct(displayBySource[key] || 0, displayDenominator)}%` }}></div>
                                      </div>
                                      <div className="w-12 text-sm font-medium text-gray-900 text-right">{displayBySource[key] || 0}</div>
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
                                      <div className="w-28 text-sm capitalize text-gray-700">{st.replace('_', ' ')}</div>
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
                                      <div className="w-28 text-sm capitalize text-gray-700">{st.replace('_', ' ')}</div>
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
                                <TableHeader className="bg-[#FDFCFB]">
                                  <TableRow className="border-b border-[#E2D1C3]/20 hover:bg-transparent">
                                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B] py-5">Name</TableHead>
                                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]">Platform</TableHead>
                                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]">Referrals</TableHead>
                                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]">Revenue</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {topInfluencers.map(t => (
                                    <TableRow key={t.id} className="group border-b border-[#E2D1C3]/10 hover:bg-[#FDFCFB] transition-colors cursor-default">
                                      <TableCell className="py-4">
                                        <div className="font-bold text-[#1A1A1A] tracking-tight">{t.name} {t.handle ? `(${t.handle})` : ''}</div>
                                      </TableCell>
                                      <TableCell>
                                        <div className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-tight">{t.platform}</div>
                                      </TableCell>
                                      <TableCell>
                                        <div className="text-[11px] font-bold text-[#1A1A1A]">{t.count}</div>
                                      </TableCell>
                                      <TableCell>
                                        <div className="text-[11px] font-bold text-[#1A1A1A]">₱{t.revenue.toLocaleString()}</div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                  {topInfluencers.length === 0 && (
                                    <TableRow>
                                      <TableCell colSpan={4} className="text-center py-10 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8B735B]/40">No influencer data</TableCell>
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
            </main>
          </div>
        </div>

        {/* Modals & Dialogs */}
        <AppointmentModal
          isOpen={isModalOpen}
          onClose={closeModal}
          appointment={editingAppointment}
          onCreate={createAppointment}
          onUpdate={updateAppointment}
          getAvailableTimeSlots={getAvailableTimeSlots}
        />

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
                    name="amount"
                    type="number"
                    defaultValue={selectedPayment ? String(selectedPayment.amount || '') : String(paymentForm.amount || '')}
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
                  name="transactionId"
                  defaultValue={selectedPayment ? (selectedPayment.transactionId || '') : (paymentForm.transactionId || '')}
                />
              </div>

              <div>
                <Label htmlFor="paymentNotes">Notes</Label>
                <Textarea
                  id="paymentNotes"
                  name="notes"
                  defaultValue={selectedPayment ? (selectedPayment.notes || '') : (paymentForm.notes || '')}
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

        <InfluencerModal
          open={isInfluencerModalOpen}
          onOpenChange={setIsInfluencerModalOpen}
          selectedInfluencer={selectedInfluencer}
          influencerForm={influencerForm}
          setInfluencerForm={(updater) => setInfluencerForm(updater(influencerForm))}
          privacyMode={privacyMode}
          isLoading={isLoading}
          handleSubmit={handleInfluencerSubmit}
        />

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
                      <TableHeader className="bg-[#FDFCFB]">
                        <TableRow className="border-b border-[#E2D1C3]/20 hover:bg-transparent">
                          <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B] py-5">Client</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]">Date</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]">Amount</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]">Notes</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B] text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map(r => (
                          <TableRow key={r.id} className="group border-b border-[#E2D1C3]/10 hover:bg-[#FDFCFB] transition-colors cursor-default">
                            <TableCell className="py-4">
                              <div className="font-bold text-[#1A1A1A] tracking-tight">{r.clientName}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-[11px] font-bold text-[#1A1A1A]">{new Date(r.date).toLocaleDateString()}</div>
                            </TableCell>
                            <TableCell className="font-bold text-[#1A1A1A]">₱{r.amount.toLocaleString()}</TableCell>
                            <TableCell>
                              <div className="text-[10px] text-[#8B735B]/70 font-medium tracking-tight truncate max-w-[300px]">{r.notes || ''}</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-end">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 rounded-lg text-rose-400 hover:bg-rose-50 hover:text-rose-600"
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
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {items.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-10 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8B735B]/40">No referrals found</TableCell>
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
            {selectedMedicalRecord?.decryption_error && (
              <div className="mx-6 mt-2 bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-3 items-start animate-in fade-in slide-in-from-top-1">
                <div className="p-1 bg-amber-100 rounded-md text-amber-600">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-amber-800 uppercase tracking-widest leading-none mb-1">Decryption Error</p>
                  <p className="text-[10px] text-amber-600 font-medium">Critical treatment data could not be decrypted. Editing this record might save empty values into fields that failed to decrypt.</p>
                </div>
              </div>
            )}
            <form onSubmit={handleMedicalRecordSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="recordClientId">Client</Label>
                  <Select
                    value={medicalRecordForm.clientId || ''}
                    onValueChange={(value) => startTransition(() => setMedicalRecordForm(prev => ({ ...prev, clientId: value })))}
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
                    onChange={(e) => startTransition(() => setMedicalRecordForm(prev => ({ ...prev, date: e.target.value })))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="chiefComplaint">Chief Complaint</Label>
                <Textarea
                  id="chiefComplaint"
                  name="chiefComplaint"
                  defaultValue={chiefComplaintText}
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="medicalHistory">Medical History (one per line)</Label>
                <Textarea
                  id="medicalHistory"
                  name="medicalHistory"
                  defaultValue={medicalHistoryText}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="allergies">Allergies (one per line)</Label>
                  <Textarea
                    id="allergies"
                    name="allergies"
                    defaultValue={allergiesText}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="currentMedications">Current Medications (one per line)</Label>
                  <Textarea
                    id="currentMedications"
                    name="currentMedications"
                    defaultValue={currentMedicationsText}
                    rows={3}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="treatmentPlan">Treatment Plan</Label>
                <Textarea
                  id="treatmentPlan"
                  name="treatmentPlan"
                  defaultValue={treatmentPlanText}
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-4">
                <Label>Treatment Tracking</Label>
                {(Array.isArray(medicalRecordForm.treatments) ? medicalRecordForm.treatments : []).map((t, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-3">
                      <Label htmlFor={`mr_t_date_${idx}`}>Date</Label>
                      <Input
                        id={`mr_t_date_${idx}`}
                        type="date"
                        value={t?.date || ''}
                        onChange={(e) => updateMedicalTreatment(idx, 'date', e.target.value)}
                      />
                    </div>
                    <div className="col-span-4">
                      <Label htmlFor={`mr_t_procedure_${idx}`}>Procedure</Label>
                      <Select
                        value={t?.procedure || ''}
                        onValueChange={(value) => updateMedicalTreatment(idx, 'procedure', value)}
                      >
                        <SelectTrigger id={`mr_t_procedure_${idx}`}>
                          <SelectValue placeholder="Select procedure" />
                        </SelectTrigger>
                        <SelectContent>
                          {procedureOptions.map(name => (
                            <SelectItem key={name} value={name}>{name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-3">
                      <Label htmlFor={`mr_t_staff_${idx}`}>Staff</Label>
                      <Select
                        value={t?.aestheticianId || ''}
                        onValueChange={(value) => {
                          const person = staff.find(s => s.id === value)
                          const staffName = person ? `${person.firstName} ${person.lastName}`.trim() : ''
                          updateMedicalTreatment(idx, 'aestheticianId', value)
                          updateMedicalTreatment(idx, 'staffName', staffName)
                        }}
                      >
                        <SelectTrigger id={`mr_t_staff_${idx}`}>
                          <SelectValue placeholder="Select staff" />
                        </SelectTrigger>
                        <SelectContent>
                          {staff.map(s => (
                            <SelectItem key={s.id} value={s.id}>{`${s.firstName} ${s.lastName}`.trim()}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor={`mr_t_total_${idx}`}>Total</Label>
                      <Input
                        id={`mr_t_total_${idx}`}
                        type="number"
                        value={typeof t?.total === 'number' ? t.total : 0}
                        onChange={(e) => updateMedicalTreatment(idx, 'total', Number(e.target.value || 0))}
                      />
                    </div>
                    <div className="col-span-12 flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setMedicalRecordForm(prev => ({
                          ...prev,
                          treatments: (prev.treatments || []).filter((_, i) => i !== idx)
                        }))}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMedicalRecordForm(prev => ({
                    ...prev,
                    treatments: [...(prev.treatments || []), { date: prev.date || new Date().toISOString().split('T')[0], procedure: '', aestheticianId: '', staffName: '', total: 0 }]
                  }))}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Treatment
                </Button>
                {(() => {
                  const items = Array.isArray(medicalRecordForm.treatments) ? medicalRecordForm.treatments : []
                  const overall = items.reduce((s, t) => s + (typeof t?.total === 'number' ? t.total : 0), 0)
                  const byStaff: Record<string, number> = {}
                  for (const t of items) {
                    const name = (t?.staffName && t.staffName.trim()) ? t.staffName.trim() : 'Unassigned'
                    const amt = typeof t?.total === 'number' ? t.total : 0
                    byStaff[name] = (byStaff[name] || 0) + amt
                  }
                  const currency = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' })
                  return (
                    <div className="mt-4 border rounded-lg p-3 bg-white/60">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Customer Total</span>
                        <span className="text-sm font-bold">{currency.format(overall)}</span>
                      </div>
                      <div className="mt-2 space-y-1">
                        {Object.entries(byStaff).map(([name, sum]) => (
                          <div key={name} className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">{name}</span>
                            <span className="text-sm">{currency.format(sum)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}
                <div className="mt-6 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Payment Preview</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        openPaymentModalPrefill({
                          clientId: medicalRecordForm.clientId || '',
                          status: 'pending',
                          method: 'gcash',
                          notes: 'Encoded from treatment tracking',
                        })
                      }}
                      aria-label="Encode Payment"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Encode Payment
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {payments
                      .filter(p => String(p.clientId) === String(medicalRecordForm.clientId || ''))
                      .slice(0, 3)
                      .map((p) => (
                        <div key={p.id} className="rounded-md border bg-white/60 p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">{String(p.status || '').toUpperCase()}</Badge>
                            <span className="text-sm font-medium">₱{Number(p.amount || 0).toLocaleString()}</span>
                          </div>
                          <div className="text-xs text-gray-500">{String(p.method || '').toUpperCase()}</div>
                          <div className="grid grid-cols-3 gap-2">
                            {[p.receiptUrl, ...(Array.isArray(p.uploadedFiles) ? p.uploadedFiles : [])]
                              .filter(Boolean)
                              .slice(0, 3)
                              .map((url, i) => (
                                <a key={`${p.id}-${i}`} href={String(url)} target="_blank" rel="noreferrer" className="block aspect-square rounded-md overflow-hidden">
                                  <img src={String(url)} alt="receipt" className="w-full h-full object-cover" loading="lazy" />
                                </a>
                              ))}
                          </div>
                        </div>
                      ))}
                    {payments.filter(p => String(p.clientId) === String(medicalRecordForm.clientId || '')).length === 0 && (
                      <div className="rounded-md border bg-white/60 p-3 text-sm text-gray-600">No payments yet</div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="recordNotes">Additional Notes</Label>
                <Textarea
                  id="recordNotes"
                  name="notes"
                  defaultValue={notesText}
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
            {selectedClient?.decryption_error && (
              <div className="mx-6 mt-2 bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-3 items-start animate-in fade-in slide-in-from-top-1">
                <div className="p-1 bg-amber-100 rounded-md text-amber-600">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-amber-800 uppercase tracking-widest leading-none mb-1">Secure Data Locked</p>
                  <p className="text-[10px] text-amber-600 font-medium">Sensitive contact information could not be decrypted. Please verify the encryption key before attempting to update this client.</p>
                </div>
              </div>
            )}
            {clientDuplicateWarning && (
              <div role="alert" aria-live="polite" className="rounded-md border border-rose-200 bg-rose-50 text-rose-700 p-3 text-sm">
                {clientDuplicateWarning}
              </div>
            )}
            <form onSubmit={handleClientSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="firstName"
                      name="firstName"
                      defaultValue={clientForm.firstName || ''}
                      required
                      type="text"
                    />
                    <Button type="button" variant="outline" className="h-9 px-2" onClick={() => setClientReveal(prev => ({ ...prev, name: !prev.name }))}>{clientReveal.name ? 'Hide' : 'Reveal'}</Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="lastName"
                      name="lastName"
                      defaultValue={clientForm.lastName || ''}
                      required
                      type="text"
                    />
                    <Button type="button" variant="outline" className="h-9 px-2" onClick={() => setClientReveal(prev => ({ ...prev, name: !prev.name }))}>{clientReveal.name ? 'Hide' : 'Reveal'}</Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={clientForm.email || ''}
                      required
                    />
                    <Button type="button" variant="outline" className="h-9 px-2" onClick={() => setClientReveal(prev => ({ ...prev, email: !prev.email }))}>{clientReveal.email ? 'Hide' : 'Reveal'}</Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="phone"
                      name="phone"
                      defaultValue={clientForm.phone || ''}
                      required
                      type="text"
                    />
                    <Button type="button" variant="outline" className="h-9 px-2" onClick={() => setClientReveal(prev => ({ ...prev, phone: !prev.phone }))}>{clientReveal.phone ? 'Hide' : 'Reveal'}</Button>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <div className="space-y-2">
                  <Textarea
                    id="address"
                    name="address"
                    defaultValue={clientForm.address || ''}
                    rows={2}
                  />
                  <div className="flex justify-end">
                    <Button type="button" variant="outline" className="h-9 px-2" onClick={() => setClientReveal(prev => ({ ...prev, address: !prev.address }))}>{clientReveal.address ? 'Hide' : 'Reveal'}</Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    defaultValue={clientForm.dateOfBirth || ''}
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
                <div>
                  <Label htmlFor="clientSource">Source</Label>
                  <Select
                    value={clientForm.source || ''}
                    onValueChange={(value) => startTransition(() => setClientForm(prev => ({ ...prev, source: value as any })))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="walk_in">Walk-in</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  name="emergencyContact"
                  defaultValue={clientForm.emergencyContact ? `${clientForm.emergencyContact.name} (${clientForm.emergencyContact.phone})` : ''}
                  placeholder="Name and phone number (e.g., John Doe (09123456789))"
                />
              </div>

              <div className="bg-[#0F2922]/5 p-4 rounded-2xl border border-[#0F2922]/10 space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#0F2922]/40">Compliance & Communications</p>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium text-[#0F2922]">Marketing Consent</Label>
                    <p className="text-[10px] text-[#0F2922]/50">Accept promotional SMS/Viber and Email updates.</p>
                  </div>
                  <Switch
                    checked={clientForm.preferences?.marketingConsent || false}
                    onCheckedChange={(checked) => setClientForm(prev => ({
                      ...prev,
                      preferences: {
                        communicationMethod: prev.preferences?.communicationMethod ?? 'email',
                        reminderSettings: prev.preferences?.reminderSettings ?? true,
                        marketingConsent: checked
                      }
                    }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium text-[#0F2922]">Reminder Alerts</Label>
                    <p className="text-[10px] text-[#0F2922]/50">Enable automated appointment reminders and confirmations.</p>
                  </div>
                  <Switch
                    checked={clientForm.preferences?.reminderSettings ?? true}
                    onCheckedChange={(checked) => setClientForm(prev => ({
                      ...prev,
                      preferences: {
                        communicationMethod: prev.preferences?.communicationMethod ?? 'email',
                        marketingConsent: prev.preferences?.marketingConsent ?? false,
                        reminderSettings: checked
                      }
                    }))}
                  />
                </div>
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
                  <Input id="staffFirstName" name="staffFirstName" defaultValue={staffForm.firstName || ''} required />
                </div>
                <div>
                  <Label htmlFor="staffLastName">Last Name</Label>
                  <Input id="staffLastName" name="staffLastName" defaultValue={staffForm.lastName || ''} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="staffEmail">Email</Label>
                  <Input id="staffEmail" name="staffEmail" type="email" defaultValue={staffForm.email || ''} required />
                </div>
                <div>
                  <Label htmlFor="staffPhone">Phone</Label>
                  <Input id="staffPhone" name="staffPhone" defaultValue={staffForm.phone || ''} required />
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
                  <Input id="staffDepartment" name="staffDepartment" defaultValue={staffForm.department || ''} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="licenseNumber">License Number</Label>
                  <Input id="licenseNumber" name="licenseNumber" defaultValue={staffForm.licenseNumber || ''} />
                </div>
                <div>
                  <Label htmlFor="hireDate">Hire Date</Label>
                  <Input id="hireDate" name="hireDate" type="date" defaultValue={staffForm.hireDate || ''} />
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
                  <Textarea id="specialties" name="specialties" rows={3} defaultValue={Array.isArray(staffForm.specialties) ? staffForm.specialties.join('\n') : ''} />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Treatment Tracking</Label>
                {Array.isArray(staffForm.treatments) && staffForm.treatments.map((t, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-5">
                      <Label htmlFor={`t_procedure_${idx}`}>Procedure</Label>
                      <Select value={t?.procedure || ''} onValueChange={(value) => updateStaffTreatment(idx, { procedure: value })}>
                        <SelectTrigger id={`t_procedure_${idx}`}>
                          <SelectValue placeholder="Select procedure" />
                        </SelectTrigger>
                        <SelectContent>
                          {procedureOptions.map(name => (
                            <SelectItem key={name} value={name}>{name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-4">
                      <Label htmlFor={`t_client_${idx}`}>Client</Label>
                      <Select value={t?.clientName || ''} onValueChange={(value) => updateStaffTreatment(idx, { clientName: value })}>
                        <SelectTrigger id={`t_client_${idx}`}>
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map(c => (
                            <SelectItem key={c.id} value={`${c.firstName} ${c.lastName}`.trim()}>{`${c.firstName} ${c.lastName}`.trim()}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-3">
                      <Label htmlFor={`t_total_${idx}`}>Total</Label>
                      <Input id={`t_total_${idx}`} type="number" value={typeof t?.total === 'number' ? t.total : 0} onChange={(e) => updateStaffTreatment(idx, { total: Number(e.target.value || 0) })} />
                    </div>
                    <div className="col-span-12 flex justify-end">
                      <Button type="button" variant="outline" onClick={() => setStaffForm(prev => ({ ...prev, treatments: (prev.treatments || []).filter((_, i) => i !== idx) }))}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={() => setStaffForm(prev => ({ ...prev, treatments: [...(prev.treatments || []), { procedure: '', clientName: '', total: 0 }] }))}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Treatment
                </Button>
              </div>

              <div>
                <Label htmlFor="staffNotes">Notes</Label>
                <Textarea id="staffNotes" name="staffNotes" rows={3} defaultValue={staffForm.notes || ''} />
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
                    className="bg-[#0F2922] hover:bg-[#0F2922]/90 text-white shadow-2xl shadow-[#0F2922]/30 hover:shadow-[#0F2922]/40 transition-all duration-300 hover:scale-105 font-bold px-6 py-3 rounded-2xl"
                  >
                    {isLoading ? 'Sending...' : 'Send Reply'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div >
    </>
  )
}
const maskEmail = (e: string) => {
  const s = String(e || '').trim()
  const at = s.indexOf('@')
  if (at <= 0) return s ? '••••' : ''
  const local = s.slice(0, at)
  const domain = s.slice(at + 1)
  return `${local[0]}${'•'.repeat(Math.max(0, local.length - 1))}@${domain[0]}${'•'.repeat(Math.max(0, domain.length - 1))}`
}
const maskPhone = (p: string) => {
  const s = String(p || '')
  if (!s) return ''
  const last4 = s.slice(-4)
  return `••••••••${last4}`
}
const maskName = (n: string) => {
  const s = String(n || '').trim()
  if (!s) return ''
  return s.split(/\s+/).map(part => part ? `${part[0]}${'•'.repeat(Math.max(0, part.length - 1))}` : '').join(' ')
}
const maskAddress = (a: string) => {
  const s = String(a || '').trim()
  if (!s) return ''
  return '•'.repeat(Math.min(s.length, 12))
}

