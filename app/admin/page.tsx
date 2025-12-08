"use client"

import "./admin-styles.css"
import React, { useState, useEffect, useTransition, useMemo, useCallback, memo } from "react"
import { createClient } from "@supabase/supabase-js"
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
  CalendarDays,
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
import { serviceCategories } from "@/lib/services-data"
import { portfolioService, type PortfolioItem } from "@/lib/portfolio-data"
import { AnimatedInput } from "@/components/ui/animated-input"
import { AnimatedSelect } from "@/components/ui/animated-select"
import { EnhancedButton } from "@/components/ui/enhanced-button"
import { LazyTabContent } from "@/components/ui/lazy-tab-content"
import { InfluencerModal } from "@/components/admin/modals/influencer-modal"

const ServiceEditDialog = memo(function ServiceEditDialog({ open, onOpenChange, target, selectedCategory, onSaved }: { open: boolean; onOpenChange: (v: boolean) => void; target: { name: string; price: string; description: string; duration?: string; results?: string; sessions?: string; includes?: string; originalPrice?: string; badge?: string; pricing?: string; benefits?: string[]; faqs?: { q: string; a: string }[] } | null; selectedCategory: string; onSaved: () => void }) {
  const [draft, setDraft] = useState<{ name: string; price: string; description: string; duration?: string; results?: string; sessions?: string; includes?: string; originalPrice?: string; badge?: string; pricing?: string; benefits?: string[]; faqs?: { q: string; a: string }[] }>({ name: "", price: "", description: "", benefits: [], faqs: [] })
  useEffect(() => {
    if (open) {
      setDraft(target || { name: "", price: "", description: "", benefits: [], faqs: [] })
    }
  }, [open, target])
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Service</DialogTitle>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Name</Label>
            <Input value={draft.name} onChange={(e) => setDraft(prev => ({ ...prev, name: e.target.value }))} placeholder="Service name" />
          </div>
          <div>
            <Label>Price</Label>
            <Input value={draft.price} onChange={(e) => setDraft(prev => ({ ...prev, price: e.target.value }))} placeholder="₱0" />
          </div>
          <div>
            <Label>Duration</Label>
            <Input value={draft.duration || ''} onChange={(e) => setDraft(prev => ({ ...prev, duration: e.target.value }))} placeholder="e.g. 45 minutes" />
          </div>
          <div>
            <Label>Results</Label>
            <Input value={draft.results || ''} onChange={(e) => setDraft(prev => ({ ...prev, results: e.target.value }))} placeholder="e.g. 6-12 months" />
          </div>
          <div>
            <Label>Sessions</Label>
            <Input value={draft.sessions || ''} onChange={(e) => setDraft(prev => ({ ...prev, sessions: e.target.value }))} placeholder="e.g. 6-8 sessions" />
          </div>
          <div>
            <Label>Includes</Label>
            <Input value={draft.includes || ''} onChange={(e) => setDraft(prev => ({ ...prev, includes: e.target.value }))} placeholder="e.g. Post-care kit" />
          </div>
          <div>
            <Label>Original Price</Label>
            <Input value={draft.originalPrice || ''} onChange={(e) => setDraft(prev => ({ ...prev, originalPrice: e.target.value }))} placeholder="₱0" />
          </div>
          <div>
            <Label>Badge</Label>
            <Input value={draft.badge || ''} onChange={(e) => setDraft(prev => ({ ...prev, badge: e.target.value }))} placeholder="e.g. PROMO" />
          </div>
          <div className="md:col-span-2">
            <Label>Pricing Notes</Label>
            <Input value={draft.pricing || ''} onChange={(e) => setDraft(prev => ({ ...prev, pricing: e.target.value }))} placeholder="e.g. per thread/cc" />
          </div>
          <div className="md:col-span-2">
            <Label>Description</Label>
            <Textarea value={draft.description} onChange={(e) => setDraft(prev => ({ ...prev, description: e.target.value }))} placeholder="Describe the service" />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label>Benefits</Label>
            {(draft.benefits || []).map((b, idx) => (
              <div key={idx} className="flex gap-2">
                <Input value={b} onChange={(e) => setDraft(prev => ({ ...prev, benefits: (prev.benefits || []).map((x, i) => i === idx ? e.target.value : x) }))} placeholder={`Benefit ${idx+1}`} />
                <Button variant="outline" onClick={() => setDraft(prev => ({ ...prev, benefits: (prev.benefits || []).filter((_, i) => i !== idx) }))}>Remove</Button>
              </div>
            ))}
            <Button variant="secondary" onClick={() => setDraft(prev => ({ ...prev, benefits: [ ...(prev.benefits || []), '' ] }))}>Add Benefit</Button>
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label>FAQs</Label>
            {(draft.faqs || []).map((f, idx) => (
              <div key={idx} className="grid md:grid-cols-2 gap-2">
                <Input value={f?.q || ''} onChange={(e) => setDraft(prev => ({ ...prev, faqs: (prev.faqs || []).map((x, i) => i === idx ? { ...x, q: e.target.value } : x) }))} placeholder={`Question ${idx+1}`} />
                <Textarea value={f?.a || ''} onChange={(e) => setDraft(prev => ({ ...prev, faqs: (prev.faqs || []).map((x, i) => i === idx ? { ...x, a: e.target.value } : x) }))} placeholder="Answer" />
                <div className="md:col-span-2 flex justify-end">
                  <Button variant="outline" onClick={() => setDraft(prev => ({ ...prev, faqs: (prev.faqs || []).filter((_, i) => i !== idx) }))}>Remove FAQ</Button>
                </div>
              </div>
            ))}
            <Button variant="secondary" onClick={() => setDraft(prev => ({ ...prev, faqs: [ ...(prev.faqs || []), { q: '', a: '' } ] }))}>Add FAQ</Button>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            variant="brand"
            onClick={async () => {
              if (!target) return
              try {
                const res = await fetch('/api/services', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'updateService', categoryId: selectedCategory, originalName: target.name, service: draft }) })
                if (!res.ok) throw new Error('Failed')
                onOpenChange(false)
                onSaved()
              } catch {}
            }}
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
})
import { DashboardTab } from "@/components/admin/tabs/dashboard-tab"
import { AppointmentsTab } from "@/components/admin/tabs/appointments-tab"
import { ClientsTab } from "@/components/admin/tabs/clients-tab"
import { PaymentsTab } from "@/components/admin/tabs/payments-tab"
import { useAdminData } from "@/lib/hooks/use-admin-data"
import { useFileUpload } from "@/lib/hooks/use-file-upload"
import { useAdminCommunication } from "@/lib/hooks/use-admin-communication"
import { useAdminEventSync } from "@/lib/hooks/use-admin-event-sync"
import { useAdminFilters } from "@/lib/hooks/use-admin-filters"

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
  
  // State management
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isLoading, setIsLoading] = useState(false)
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null)
  
  // Data states
  const {
    appointments, setAppointments,
    payments, setPayments,
    medicalRecords, setMedicalRecords,
    clients, setClients,
    socialMessages, setSocialMessages,
    staff, setStaff,
    influencers, setInfluencers,
    refreshData: loadAllData,
    isLoading: isDataLoading,
    refreshAppointments,
    refreshClients,
    refreshPayments,
    refreshMedicalRecords,
    refreshStaff,
    refreshInfluencers,
    refreshSocialMessages
  } = useAdminData()
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

  function updateMedicalTreatment(idx: number, key: 'date' | 'procedure' | 'staffName' | 'total' | 'aestheticianId', value: any) {
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
  const [smsForm, setSmsForm] = useState<{ to: string; message: string }>({ to: '', message: '' })
  
  useEffect(() => { if (activeTab === 'sms') refreshSmsStatus() }, [activeTab, refreshSmsStatus])


  const [contentServices, setContentServices] = useState<{ id: string; category: string; services: any[] }[]>([])
  const [contentSelectedCategory, setContentSelectedCategory] = useState("")
  const [contentSubTab, setContentSubTab] = useState<string>("services")
  const [newServiceForm, setNewServiceForm] = useState<{ name: string; price: string; description: string; duration?: string; results?: string }>({ name: "", price: "", description: "" })
  const [isServiceEditOpen, setIsServiceEditOpen] = useState(false)
  const [serviceEditTarget, setServiceEditTarget] = useState<{ name: string; price: string; description: string; duration?: string; results?: string; sessions?: string; includes?: string; originalPrice?: string; badge?: string; pricing?: string; benefits?: string[]; faqs?: { q: string; a: string }[] } | null>(null)
  const [serviceEditForm, setServiceEditForm] = useState<{ name: string; price: string; description: string; duration?: string; results?: string; sessions?: string; includes?: string; originalPrice?: string; badge?: string; pricing?: string; benefits?: string[]; faqs?: { q: string; a: string }[] }>({ name: "", price: "", description: "", benefits: [], faqs: [] })
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
  const uploadPortfolioFile = async (file: File, kind: 'before' | 'after', target: 'create' | 'edit' = 'create') => {
    try {
      const url = await uploadToApi(file, kind)
      if (target === 'create') {
        setPortfolioForm(prev => ({ ...prev, [kind === 'before' ? 'beforeImage' : 'afterImage']: url }))
      } else {
        setEditPortfolioForm(prev => ({ ...prev, [kind === 'before' ? 'beforeImage' : 'afterImage']: url }))
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
  const [appointmentReveal, setAppointmentReveal] = useState<{ clientName: boolean; clientEmail: boolean; clientPhone: boolean }>({ clientName: false, clientEmail: false, clientPhone: false })
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
    } catch {}
  }, [])



  useEffect(() => {
    setReferralPage(1)
  }, [referralDetailsSearch, referralDateFrom, referralDateTo, referralSort, selectedInfluencer])

  useAdminEventSync({
    setClientForm,
    setIsClientModalOpen,
    setAppointmentForm,
    setIsAppointmentModalOpen,
    setPaymentForm,
    setIsPaymentModalOpen,
    isClientModalOpen,
    isAppointmentModalOpen,
    isPaymentModalOpen
  })



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
      const clientId = String(medicalRecordForm.clientId || 'unknown')
      const today = new Date()
      const y = today.getFullYear()
      const m = String(today.getMonth() + 1).padStart(2, '0')
      const d = String(today.getDate()).padStart(2, '0')
      const folder = `${clientId}/${y}${m}${d}`
      const ext = file.name.split('.').pop() || 'jpg'
      const filename = `attachment_${Date.now()}.${ext}`
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
    if (!supabaseBrowser) return
    const channel = supabaseBrowser.channel('admin-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => { refreshAppointments() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => { refreshClients() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff' }, () => { refreshStaff() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => { refreshPayments() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'medical_records' }, () => { refreshMedicalRecords() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'influencers' }, () => { refreshInfluencers() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'influencer_referrals' }, () => { refreshInfluencers() })
      .subscribe()
    return () => { supabaseBrowser.removeChannel(channel) }
  }, [refreshAppointments, refreshClients, refreshStaff, refreshPayments, refreshMedicalRecords, refreshInfluencers])

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
    try {
      const items = portfolioService.getAllItems()
      setContentPortfolioItems(items)
      const unsub = portfolioService.subscribe((updated: PortfolioItem[]) => setContentPortfolioItems(updated))
      subs.push(unsub)
    } catch {}
    ;(async () => {
      try {
        const res = await fetch('/api/services')
        const j = await res.json()
        if (j?.ok && Array.isArray(j?.data)) {
          const cats = j.data.map((c: any) => ({ id: c.id, category: c.category, services: c.services }))
          setContentServices(cats)
          if (!contentSelectedCategory && cats.length) setContentSelectedCategory(cats[0].id)
        }
      } catch {}
    })()
    return () => { subs.forEach(fn => fn()) }
  }, [])

  const stats = React.useMemo(() => getDashboardStats(), [appointments, clients, payments, socialMessages])

  // Appointment Management
  const handleAppointmentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const formEl = e.currentTarget as HTMLFormElement
      const fd = new FormData(formEl)
      const clientName = String(fd.get('clientName') || '')
      const clientEmail = String(fd.get('clientEmail') || '')
      const clientPhone = String(fd.get('clientPhone') || '')
      const durationRaw = String(fd.get('duration') || '')
      const priceRaw = String(fd.get('price') || '')
      const notes = String(fd.get('notes') || '')
      const duration = durationRaw ? parseInt(durationRaw) : (appointmentForm.duration || 0)
      const price = priceRaw ? parseFloat(priceRaw) : (appointmentForm.price || 0)

      const payloadBase = {
        ...appointmentForm,
        clientName,
        clientEmail,
        clientPhone,
        duration,
        price,
        notes,
      }

      if (selectedAppointment) {
        appointmentService.updateAppointment(selectedAppointment.id, payloadBase)
        showNotification("success", "Appointment updated successfully!")
      } else {
        appointmentService.addAppointment(payloadBase as Omit<Appointment, "id" | "createdAt" | "updatedAt">)
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
    ;(async () => {
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
          if (method === 'POST' && json?.record?.id) {
            medicalRecordService.updateRecord(json.record.id, { treatments: medicalRecordForm.treatments || [] })
          }
          if (method === 'PATCH' && selectedMedicalRecord?.id) {
            medicalRecordService.updateRecord(selectedMedicalRecord.id, { treatments: medicalRecordForm.treatments || [] })
          }
        } catch {}
        await refreshMedicalRecords()
        try {
          const items = Array.isArray(medicalRecordForm.treatments) ? medicalRecordForm.treatments : []
          if (items.length > 0) {
            const client = clients.find(c => c.id === (medicalRecordForm.clientId || ''))
            const clientName = client ? `${client.firstName} ${client.lastName}`.trim() : ''
            const byStaff: Record<string, { procedure: string; clientName: string; total: number; date: string }[]> = {}
            for (const t of items) {
              const sid = String(t?.aestheticianId || '')
              if (!sid) continue
              const entry = { procedure: String(t?.procedure || ''), clientName, total: Number(t?.total || 0), date: String(t?.date || medicalRecordForm.date || new Date().toISOString().split('T')[0]) }
              if (!byStaff[sid]) byStaff[sid] = []
              byStaff[sid].push(entry)
            }
            const csrf2 = typeof document !== 'undefined' ? (document.cookie.match(/(?:^|; )csrf_token=([^;]+)/)?.[1] || '') : ''
            for (const [staffId, entries] of Object.entries(byStaff)) {
              const person = staff.find(s => s.id === staffId)
              const existing = Array.isArray(person?.treatments) ? person!.treatments.slice() : []
              const dedup = new Set(existing.map(x => `${x.date}|${x.procedure}|${x.clientName}|${x.total}`))
              const next = existing.concat(entries.filter(x => !dedup.has(`${x.date}|${x.procedure}|${x.clientName}|${x.total}`)))
              await fetch('/api/admin/staff', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf2 },
                credentials: 'include',
                body: JSON.stringify({ id: staffId, treatments: next })
              }).catch(() => {})
            }
            await staffService.fetchFromSupabase?.()
            setStaff(staffService.getAllStaff())
          }
        } catch {}
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
    ;(async () => {
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
        const norm = (s: any) => String(s || '').trim().toLowerCase()
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
      const norm = (s: any) => String(s || '').trim().toLowerCase()
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

  function buildStaffPayload(selectedStaff: { id: string } | null, staffForm: any, overrides: any) {
    return selectedStaff
      ? { id: selectedStaff.id, ...staffForm, ...overrides }
      : { ...staffForm, ...overrides }
  }

  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    ;(async () => {
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
        } catch {}
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
      <div className="min-h-screen relative bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20">
      {(() => {
        const reduceMotion = 
          isAppointmentModalOpen ||
          isPaymentModalOpen ||
          isMedicalRecordModalOpen ||
          isClientModalOpen ||
          isSocialReplyModalOpen ||
          isStaffModalOpen ||
          isInfluencerModalOpen ||
          isReferralModalOpen ||
          isStaffTreatmentQuickOpen
        return !reduceMotion ? (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-16 -left-24 w-96 h-96 bg-gradient-to-br from-purple-400/20 via-pink-300/15 to-transparent rounded-full blur-3xl animate-pulse" />
            <div className="absolute top-1/4 -right-32 w-80 h-80 bg-gradient-to-br from-blue-400/20 via-cyan-300/15 to-transparent rounded-full blur-3xl animate-pulse delay-1000" />
            <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-gradient-to-br from-amber-400/20 via-orange-300/15 to-transparent rounded-full blur-3xl animate-pulse delay-2000" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-emerald-400/10 via-teal-300/8 to-transparent rounded-full blur-3xl animate-pulse delay-3000" />
          </div>
        ) : null
      })()}
      

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

      <div className="pt-20 sm:pt-24 pb-10 sm:pb-12 px-2 sm:px-4 md:px-6">
        <div className="mx-auto w-full max-w-screen-2xl">
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
                      { key: 'content', label: 'Content', icon: FileImage, color: 'from-indigo-600 to-pink-600' },
                      { key: 'email', label: 'Email Services', icon: Mail, color: 'from-red-500 to-rose-500' },
                      { key: 'sms', label: 'SMS Services', icon: MessageSquare, color: 'from-emerald-500 to-teal-500' },
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
                  <TabsList className="bg-white/30 backdrop-blur-xl border border-white/60 shadow-2xl shadow-purple-500/10 h-16 items-center justify-center rounded-3xl p-3 grid w-full grid-cols-8 mb-8 lg:hidden overflow-x-auto scrollbar-none">
                    {[
                      { value: 'dashboard', icon: BarChart3, label: 'Dashboard', color: 'from-blue-500 to-cyan-500' },
                      { value: 'appointments', icon: CalendarIcon, label: 'Bookings', color: 'from-purple-500 to-pink-500' },
                      { value: 'payments', icon: CreditCard, label: 'Payments', color: 'from-green-500 to-emerald-500' },
                      { value: 'medical', icon: FileText, label: 'EMR', color: 'from-orange-500 to-amber-500' },
                      { value: 'clients', icon: Users, label: 'Clients', color: 'from-indigo-500 to-purple-500' },
                      { value: 'staff', icon: Settings, label: 'Staff', color: 'from-slate-500 to-gray-500' },
                      { value: 'content', icon: FileImage, label: 'Content', color: 'from-indigo-600 to-pink-600' },
                      { value: 'email', icon: Mail, label: 'Email', color: 'from-red-500 to-rose-500' },
                      { value: 'sms', icon: MessageSquare, label: 'SMS', color: 'from-emerald-500 to-teal-500' },
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
                                <p className="font-medium">{privacyMode ? maskName(appointment.clientName) : appointment.clientName}</p>
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
                                  <div className="font-medium">{privacyMode ? maskName(a.clientName) : a.clientName}</div>
                                  <div className="text-xs text-gray-500">{privacyMode ? maskEmail(a.clientEmail) : a.clientEmail} • {privacyMode ? maskPhone(a.clientPhone) : a.clientPhone}</div>
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
            <LazyTabContent isActive={activeTab === "email"}>
              <TabsContent value="email" className="space-y-8">
                <Card className="border-white/60 bg-white/70 backdrop-blur-xl shadow-xl rounded-3xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-rose-500" />
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
                          <TableHeader>
                            <TableRow>
                              <TableHead>From</TableHead>
                              <TableHead>Subject</TableHead>
                              <TableHead>Preview</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {emailPreview.map(m => (
                              <TableRow key={m.id}>
                                <TableCell className="font-medium">{m.from}</TableCell>
                                <TableCell className="truncate max-w-[200px]">{m.subject || 'No Subject'}</TableCell>
                                <TableCell className="text-gray-600 truncate max-w-[320px]">{m.snippet}</TableCell>
                              </TableRow>
                            ))}
                            {emailPreview.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={3} className="text-center text-gray-500">No recent messages</TableCell>
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
                <Card className="border-white/60 bg-white/70 backdrop-blur-xl shadow-xl rounded-3xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-emerald-600" />
                      SMS Services
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label>Sender ID</Label>
                        <Input value={smsStatus?.sender || 'iprogtech'} disabled />
                        <p className="text-xs text-gray-500 mt-2">Uses IPROG SMS provider</p>
                      </div>
                      <div>
                        <Label>Status</Label>
                        <div className="flex items-center gap-3">
                          <Badge className={smsStatus?.configured ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                            {smsStatus?.configured ? 'Configured' : 'Not Configured'}
                          </Badge>
                          <Button variant="secondary" onClick={refreshSmsStatus}>Refresh</Button>
                        </div>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label>Recipient Phone</Label>
                        <Input value={smsForm.to} onChange={(e) => setSmsForm(prev => ({ ...prev, to: e.target.value }))} placeholder="e.g. +63XXXXXXXXXX" />
                      </div>
                      <div className="space-y-3 md:col-span-1">
                        <Label>Message</Label>
                        <Textarea value={smsForm.message} onChange={(e) => setSmsForm(prev => ({ ...prev, message: e.target.value }))} placeholder="Type your message" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={async () => {
                          try {
                            const to = String(smsForm.to || '').trim()
                            const message = String(smsForm.message || '').trim()
                            if (!to || !message) { showNotification('error', 'Please enter phone and message'); return }
                            const res = await fetch('/api/sms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to, message }) })
                            const j = await res.json()
                            showNotification(j?.ok ? 'success' : 'error', j?.ok ? 'SMS sent' : (j?.error || 'Failed to send'))
                          } catch { showNotification('error', 'Failed to send') }
                        }}
                        variant="brand"
                      >
                        Send SMS
                      </Button>
                      <Button
                        onClick={async () => {
                          try {
                            const res = await fetch('/api/automation/sms-reminders', { method: 'POST', headers: { 'x-automation-secret': String(process.env.NEXT_PUBLIC_SMS_AUTOMATION_SECRET || '') } })
                            const j = await res.json()
                            showNotification(j?.ok ? 'success' : 'error', j?.ok ? `Reminders sent: ${j?.sent || 0}` : (j?.error || 'Failed to run'))
                          } catch { showNotification('error', 'Failed to run automation') }
                        }}
                        variant="outline"
                      >
                        Run Reminder Scan
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </LazyTabContent>
            <LazyTabContent isActive={activeTab === "content"}>
              <TabsContent value="content" className="space-y-8">
                <Tabs value={contentSubTab} onValueChange={setContentSubTab} className="w-full">
                  <TabsList className="bg-white/30 backdrop-blur-xl border border-white/60 shadow h-12 items-center justify-center rounded-2xl p-2 grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="services" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-gray-700 h-9 justify-center rounded-xl border border-transparent px-3 py-2 text-sm font-bold transition-all duration-300 data-[state=active]:border-white/80">Services Manager</TabsTrigger>
                    <TabsTrigger value="portfolio" className="data-[state=active]:bg-rose-600 data-[state=active]:text-white text-gray-700 h-9 justify-center rounded-xl border border-transparent px-3 py-2 text-sm font-bold transition-all duration-300 data-[state=active]:border-white/80">Portfolio Manager</TabsTrigger>
                  </TabsList>
                  <TabsContent value="services" className="space-y-8">
                <Card className="border-white/60 bg-white/70 backdrop-blur-xl shadow-xl rounded-3xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileImage className="w-5 h-5 text-indigo-500" />
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
                        <div className="col-span-2 flex items-end">
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
                                  if (jr?.ok) setContentServices(jr.data.map((c: any) => ({ id: c.id, category: c.category, services: c.services })))
                                  setNewServiceForm({ name: '', price: '', description: '' })
                                  showNotification('success', 'Service added')
                                } else showNotification('error', 'Failed to add service')
                              } catch { showNotification('error', 'Failed to add service') }
                            }}
                            variant="brand"
                          >
                            Add Service
                          </Button>
                        </div>
                      </div>
                    </div>
                    <ServiceEditDialog open={isServiceEditOpen} onOpenChange={(v) => { setIsServiceEditOpen(v); if (!v) setServiceEditTarget(null) }} target={serviceEditTarget} selectedCategory={contentSelectedCategory} onSaved={async () => { try { const r = await fetch('/api/services'); const jr = await r.json(); if (jr?.ok) setContentServices(jr.data.map((c: any) => ({ id: c.id, category: c.category, services: c.services }))); showNotification('success', 'Service updated') } catch {} }} />
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
                                        if (jr?.ok) setContentServices(jr.data.map((c: any) => ({ id: c.id, category: c.category, services: c.services })))
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
                <Card className="border-white/60 bg-white/70 backdrop-blur-xl shadow-xl rounded-3xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileImage className="w-5 h-5 text-rose-500" />
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
                                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPortfolioFile(f, 'before', 'create'); e.currentTarget.value = '' }}
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
                                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPortfolioFile(f, 'after', 'create'); e.currentTarget.value = '' }}
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
                              try {
                                portfolioService.addItem({
                                  title: String(f.title),
                                  category: String(f.category),
                                  beforeImage: String(f.beforeImage),
                                  afterImage: String(f.afterImage),
                                  description: String(f.description || ''),
                                  treatment: String(f.treatment || ''),
                                  duration: String(f.duration || ''),
                                  results: String(f.results || ''),
                                })
                                setPortfolioForm({})
                                showNotification('success', 'Portfolio item added')
                              } catch { showNotification('error', 'Failed to add item') }
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
                                      onClick={() => { setAddResultTarget(p); setAddResultForm({ beforeImage: '', afterImage: '' }) }}
                                    >
                                      Add Result
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        try {
                                          portfolioService.deleteItem(p.id)
                                          showNotification('success', 'Removed')
                                        } catch { showNotification('error', 'Failed') }
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
                                    onChange={async (e) => { const f = e.target.files?.[0]; if (f) { await uploadPortfolioFile(f, 'before', 'edit'); setAddResultForm(prev => ({ ...prev, beforeImage: editPortfolioForm.beforeImage || prev.beforeImage })) } e.currentTarget.value = '' }}
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
                                    onChange={async (e) => { const f = e.target.files?.[0]; if (f) { await uploadPortfolioFile(f, 'after', 'edit'); setAddResultForm(prev => ({ ...prev, afterImage: editPortfolioForm.afterImage || prev.afterImage })) } e.currentTarget.value = '' }}
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
                                  try {
                                    const curr = portfolioService.getItemById(addResultTarget.id)
                                    const list = Array.isArray(curr?.extraResults) ? curr!.extraResults! : []
                                    portfolioService.updateItem(addResultTarget.id, { extraResults: [...list, { beforeImage: b, afterImage: a }] })
                                    setAddResultTarget(null)
                                    setAddResultForm({ beforeImage: '', afterImage: '' })
                                    showNotification('success', 'Result added')
                                  } catch { showNotification('error', 'Failed to add result') }
                                }}
                              >
                                Add
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    <Dialog open={!!editPortfolioItem} onOpenChange={(v) => { if (!v) setEditPortfolioItem(null) }}>
                      <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Edit Portfolio Item</DialogTitle>
                        </DialogHeader>
                        {editPortfolioItem && (
                          <div className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                              <AnimatedInput
                                id="epf-title"
                                label="Title"
                                value={editPortfolioForm.title || ''}
                                onChange={(e) => setEditPortfolioForm(prev => ({ ...prev, title: e.target.value }))}
                                required
                              />
                              <AnimatedSelect
                                value={editPortfolioForm.category || ''}
                                onValueChange={(v) => setEditPortfolioForm(prev => ({ ...prev, category: v }))}
                                placeholder="Select category"
                                options={categoryOptions.map(c => ({ value: c, label: c }))}
                                label="Category"
                              />
                              <AnimatedSelect
                                value={editPortfolioForm.treatment || ''}
                                onValueChange={(v) => setEditPortfolioForm(prev => ({ ...prev, treatment: v }))}
                                placeholder="Select treatment"
                                options={procedureOptions.map(p => ({ value: p, label: p }))}
                                label="Treatment"
                              />
                              <div className="space-y-2 md:col-span-2">
                                <Label className="text-sm font-medium text-gray-700">Description</Label>
                                <Textarea
                                  value={editPortfolioForm.description || ''}
                                  onChange={(e) => setEditPortfolioForm(prev => ({ ...prev, description: e.target.value }))}
                                  rows={3}
                                />
                              </div>
                              <div className="space-y-2">
                                <AnimatedInput
                                  id="epf-before"
                                  label="Before Image URL"
                                  value={editPortfolioForm.beforeImage || ''}
                                  onChange={(e) => setEditPortfolioForm(prev => ({ ...prev, beforeImage: e.target.value }))}
                                  required
                                />
                                <div className="flex gap-2">
                                  <Button variant="outline" onClick={() => editPortfolioBeforeFileInputRef.current?.click()}>
                                    <Upload className="w-4 h-4 mr-2" /> Upload Before
                                  </Button>
                                  <input
                                    ref={editPortfolioBeforeFileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPortfolioFile(f, 'before', 'edit'); e.currentTarget.value = '' }}
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <AnimatedInput
                                  id="epf-after"
                                  label="After Image URL"
                                  value={editPortfolioForm.afterImage || ''}
                                  onChange={(e) => setEditPortfolioForm(prev => ({ ...prev, afterImage: e.target.value }))}
                                  required
                                />
                                <div className="flex gap-2">
                                  <Button variant="outline" onClick={() => editPortfolioAfterFileInputRef.current?.click()}>
                                    <Upload className="w-4 h-4 mr-2" /> Upload After
                                  </Button>
                                  <input
                                    ref={editPortfolioAfterFileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPortfolioFile(f, 'after', 'edit'); e.currentTarget.value = '' }}
                                  />
                                </div>
                              </div>
                              <AnimatedInput
                                id="epf-duration"
                                label="Duration"
                                value={editPortfolioForm.duration || ''}
                                onChange={(e) => setEditPortfolioForm(prev => ({ ...prev, duration: e.target.value }))}
                              />
                              <AnimatedInput
                                id="epf-results"
                                label="Results"
                                value={editPortfolioForm.results || ''}
                                onChange={(e) => setEditPortfolioForm(prev => ({ ...prev, results: e.target.value }))}
                              />
                            </div>
                            <div className="flex justify-end gap-3">
                              <Button variant="outline" onClick={() => setEditPortfolioItem(null)}>Cancel</Button>
                              <Button
                                variant="brand"
                                onClick={() => {
                                  if (!editPortfolioItem) return
                                  try {
                                    portfolioService.updateItem(editPortfolioItem.id, {
                                      title: String(editPortfolioForm.title || editPortfolioItem.title),
                                      category: String(editPortfolioForm.category || editPortfolioItem.category),
                                      treatment: String(editPortfolioForm.treatment || editPortfolioItem.treatment),
                                      description: String(editPortfolioForm.description || editPortfolioItem.description),
                                      beforeImage: String(editPortfolioForm.beforeImage || editPortfolioItem.beforeImage),
                                      afterImage: String(editPortfolioForm.afterImage || editPortfolioItem.afterImage),
                                      duration: String(editPortfolioForm.duration || editPortfolioItem.duration),
                                      results: String(editPortfolioForm.results || editPortfolioItem.results),
                                    })
                                    setEditPortfolioItem(null)
                                    setEditPortfolioForm({})
                                    showNotification('success', 'Changes saved')
                                  } catch { showNotification('error', 'Failed to save changes') }
                                }}
                              >
                                Save Changes
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
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
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setConfirmMedicalRecord(record)}
                                aria-label="Delete medical record"
                                className="ml-2"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Dialog open={!!confirmMedicalRecord} onOpenChange={(open) => { if (!open && !confirmMedicalDeleting) setConfirmMedicalRecord(null) }}>
              <DialogContent className="max-w-md bg-white/80 backdrop-blur-sm border border-rose-200/60 shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-rose-600" />
                    Delete Medical Record
                  </DialogTitle>
                </DialogHeader>
                {confirmMedicalRecord && (
                  <div className="space-y-3 text-sm text-gray-700">
                    <p>Are you sure you want to delete this medical record? This action cannot be undone.</p>
                    <div className="rounded-lg border bg-white/70 p-3">
                      <div className="font-medium">
                        {(() => {
                          const c = clients.find(x => x.id === confirmMedicalRecord.clientId)
                          return c ? `${c.firstName} ${c.lastName}` : 'Unknown Client'
                        })()}
                      </div>
                      <div className="text-gray-600">{new Date(confirmMedicalRecord.date).toLocaleDateString()}</div>
                      {confirmMedicalRecord.chiefComplaint && <div className="text-gray-600 truncate">{confirmMedicalRecord.chiefComplaint}</div>}
                      {confirmMedicalRecord.treatmentPlan && <div className="text-gray-600 truncate">{confirmMedicalRecord.treatmentPlan}</div>}
                    </div>
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setConfirmMedicalRecord(null)} disabled={confirmMedicalDeleting}>Cancel</Button>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      if (!confirmMedicalRecord) return
                      setConfirmMedicalDeleting(true)
                      try {
                        const csrf = typeof document !== 'undefined' ? (document.cookie.match(/(?:^|; )csrf_token=([^;]+)/)?.[1] || '') : ''
                        const res = await fetch('/api/admin/medical-records', {
                          method: 'DELETE',
                          headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf },
                          credentials: 'include',
                          body: JSON.stringify({ id: confirmMedicalRecord.id })
                        })
                        if (res.ok) {
                          await refreshMedicalRecords()
                          showNotification('success', 'Medical record deleted')
                          setConfirmMedicalRecord(null)
                        } else {
                          showNotification('error', 'Failed to delete medical record')
                        }
                      } finally {
                        setConfirmMedicalDeleting(false)
                      }
                    }}
                  >
                    {confirmMedicalDeleting ? (
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
                  <Button variant="outline" className="h-9" onClick={() => setPrivacyMode(prev => !prev)}>{privacyMode ? 'Privacy On' : 'Privacy Off'}</Button>
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
              <Button className="h-9" variant="outline" onClick={() => setIsStaffTotalsOpen(true)} aria-label="View staff treatment totals" title="View staff treatment totals">
                View Totals
              </Button>
              </div>

              <Dialog open={isStaffTotalsOpen} onOpenChange={setIsStaffTotalsOpen}>
                <DialogContent className="max-w-2xl max-h-[70vh] overflow-y-auto p-4">
                  <DialogHeader>
                    <DialogTitle>All Staff Treatments</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                    <div className="sm:col-span-1">
                      <Label htmlFor="totals_staff_filter">Staff</Label>
                      <Select value={staffTotalsFilter} onValueChange={setStaffTotalsFilter}>
                        <SelectTrigger id="totals_staff_filter" className="h-9">
                          <SelectValue placeholder="All Staff" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Staff</SelectItem>
                          {staff.map(s => (
                            <SelectItem key={s.id} value={s.id}>{`${s.firstName} ${s.lastName}`.trim()}</SelectItem>
                          ))}
                        </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-end">
                <Button variant="outline" className="h-9" onClick={() => setPrivacyMode(prev => !prev)}>{privacyMode ? 'Privacy On' : 'Privacy Off'}</Button>
              </div>
              </div>
                  {(() => {
                    const rows = staff.flatMap(s => (
                      Array.isArray(s.treatments) ? s.treatments.map(t => ({
                        staffId: s.id,
                        staffName: `${s.firstName} ${s.lastName}`.trim(),
                        date: t.date || '-',
                        procedure: t.procedure,
                        clientName: t.clientName || '',
                        total: Number(t.total || 0),
                      })) : []
                    ))
                      .filter(r => staffTotalsFilter === 'all' ? true : r.staffId === staffTotalsFilter)
                    if (rows.length === 0) return (<div className="text-sm text-muted-foreground">No treatments recorded.</div>)
                    const grandTotal = rows.reduce((acc, r) => acc + r.total, 0)

                    const nameById = new Map<string, string>()
                    for (const c of clients) {
                      nameById.set(c.id, `${c.firstName} ${c.lastName}`.trim())
                    }
                    const paymentsByClient = new Map<string, number>()
                    for (const p of payments) {
                      if (String(p.status || '').toLowerCase() !== 'completed') continue
                      const nm = nameById.get(String(p.clientId)) || ''
                      if (!nm) continue
                      paymentsByClient.set(nm, (paymentsByClient.get(nm) || 0) + Number(p.amount || 0))
                    }
                    const paymentsGrandTotal = rows.reduce((sum, r) => sum + (paymentsByClient.get(r.clientName || '') || 0), 0)

                    const byStaff = new Map<string, { staffName: string; clients: Map<string, number>; staffTotal: number }>()
                    for (const r of rows) {
                      const staffEntry = byStaff.get(r.staffId) || { staffName: r.staffName, clients: new Map<string, number>(), staffTotal: 0 }
                      const cname = r.clientName || ''
                      if (cname) staffEntry.clients.set(cname, (staffEntry.clients.get(cname) || 0) + r.total)
                      staffEntry.staffTotal += r.total
                      byStaff.set(r.staffId, staffEntry)
                    }

                    return (
                      <div className="space-y-3">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Procedure</TableHead>
                              <TableHead>Client</TableHead>
                              <TableHead>Staff</TableHead>
                              <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {rows.map((r, i) => (
                              <TableRow key={i}>
                                <TableCell className="whitespace-nowrap">{r.date}</TableCell>
                                <TableCell className="max-w-[16rem] truncate">{r.procedure}</TableCell>
                                <TableCell className="max-w-[12rem] truncate">{privacyMode ? maskName(r.clientName) : r.clientName}</TableCell>
                                <TableCell className="max-w-[12rem] truncate">{r.staffName}</TableCell>
                                <TableCell className="text-right">{r.total.toLocaleString()}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        <div className="flex items-center justify-end gap-6 text-sm">
                          <div className="font-medium">Grand Total: {grandTotal.toLocaleString()}</div>
                          <div className="font-medium">Payments Grand Total: {paymentsGrandTotal.toLocaleString()}</div>
                          <div className="font-medium">Difference: {(paymentsGrandTotal - grandTotal).toLocaleString()}</div>
                        </div>

                        <div className="pt-2">
                          {[...byStaff.entries()].map(([staffId, info]) => (
                            <div key={staffId} className="mb-3">
                              <div className="flex items-center justify-between">
                                <div className="text-sm font-medium">{info.staffName}</div>
                                <div className="text-xs text-muted-foreground">{info.staffTotal.toLocaleString()}</div>
                              </div>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Client</TableHead>
                                    <TableHead className="text-right">Treatment Total</TableHead>
                                    <TableHead className="text-right">Payment Total</TableHead>
                                    <TableHead className="text-right">Difference</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {[...info.clients.entries()].map(([clientName, total]) => (
                                    <TableRow key={clientName}>
                                      <TableCell className="max-w-[16rem] truncate">{privacyMode ? maskName(clientName) : clientName}</TableCell>
                                      <TableCell className="text-right">{total.toLocaleString()}</TableCell>
                                      <TableCell className="text-right">{(paymentsByClient.get(clientName) || 0).toLocaleString()}</TableCell>
                                      <TableCell className="text-right">{(((paymentsByClient.get(clientName) || 0) - total) || 0).toLocaleString()}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })()}
                  <div className="flex justify-end mt-4">
                    <Button variant="outline" onClick={() => setIsStaffTotalsOpen(false)}>Close</Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Card className="bg-white/60 backdrop-blur-sm border border-white/70 shadow-2xl">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Staff</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>License</TableHead>
                        <TableHead>Hired</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Treatments</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStaff.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell>
                            <div className="font-medium">{s.firstName} {s.lastName}</div>
                            <div className="text-xs text-gray-500">{s.email}</div>
                            <div className="text-xs text-gray-500">{s.phone}</div>
                          </TableCell>
                          <TableCell className="capitalize">{s.position.replace('_', ' ')}</TableCell>
                          <TableCell>{s.department ?? '-'}</TableCell>
                          <TableCell>{s.licenseNumber ?? '-'}</TableCell>
                          <TableCell>{new Date(s.hireDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                          <Badge className="bg-gradient-to-r from-slate-600 to-gray-700 text-white">{s.status}</Badge>
                          </TableCell>
                          <TableCell>
                            {Array.isArray(s.treatments) && s.treatments.length > 0 ? (
                              <Table className="bg-transparent">
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="text-xs">Procedure</TableHead>
                                    <TableHead className="text-xs">Client</TableHead>
                                    <TableHead className="text-xs">Total</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {s.treatments.map((t, i) => (
                                    <TableRow key={i}>
                                      <TableCell className="text-xs max-w-[12rem] truncate">{t.procedure}</TableCell>
                                      <TableCell className="text-xs max-w-[12rem] truncate">{privacyMode ? maskName(t.clientName || '') : (t.clientName || '-')}</TableCell>
                                      <TableCell className="text-xs font-medium">{t.total}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            ) : (
                              <span className="text-xs text-gray-500">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 justify-end">
                              <Button size="sm" variant="outline" onClick={() => { setStaffTreatmentTarget(s); setStaffTreatmentForm([ ...(s.treatments || []), { procedure: '', clientName: '', total: 0, date: new Date().toISOString().slice(0,10) } ]); setIsStaffTreatmentQuickOpen(true) }} aria-label="Treatment Tracking" title="Treatment Tracking">
                                <Plus className="w-4 h-4 mr-1" />
                                Treatment
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => openStaffModal(s)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => { setStaffPreviewTarget(s); setIsStaffPreviewOpen(true) }} aria-label="Preview">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={async () => {
                                if (!confirmTwice(`${s.firstName} ${s.lastName}`.trim() || 'this staff')) return
                                const res = await fetch('/api/admin/staff', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: s.id }) })
                                if (res.ok) { await staffService.fetchFromSupabase?.(); setStaff(staffService.getAllStaff()); showNotification('success', 'Staff deleted') } else { showNotification('error', 'Failed to delete staff') }
                              }}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
              </CardContent>
              </Card>
              <Dialog open={isStaffPreviewOpen} onOpenChange={setIsStaffPreviewOpen}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto p-4">
                  <DialogHeader>
                    <DialogTitle>Staff Preview</DialogTitle>
                  </DialogHeader>
                  {staffPreviewTarget && (
                    <div className="space-y-6">
                      <div className="space-y-1">
                        <div className="font-semibold text-lg">{staffPreviewTarget.firstName} {staffPreviewTarget.lastName}</div>
                        <div className="text-sm text-gray-600">{staffPreviewTarget.email}</div>
                        <div className="text-sm text-gray-600">{staffPreviewTarget.phone}</div>
                      </div>
                      <div className="space-y-3">
                        <div className="font-medium">Treatment Tracking</div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Procedure</TableHead>
                              <TableHead>Client</TableHead>
                              <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(Array.isArray(staffPreviewTarget.treatments) ? staffPreviewTarget.treatments : []).map((t, i) => (
                              <TableRow key={i}>
                                <TableCell>{t.date || '-'}</TableCell>
                                <TableCell className="max-w-[18rem] truncate">{t.procedure}</TableCell>
                                <TableCell className="max-w-[14rem] truncate">{privacyMode ? maskName(t.clientName || '') : (t.clientName || '-')}</TableCell>
                                <TableCell className="text-right">{Number(t.total || 0).toLocaleString()}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      <div className="space-y-3">
                        <div className="font-medium">Payment Preview</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {(() => {
                            const names = new Set<string>((Array.isArray(staffPreviewTarget.treatments) ? staffPreviewTarget.treatments : []).map(t => String(t.clientName || '').trim()).filter(Boolean))
                            const ids = new Set<string>()
                            for (const n of names) {
                              const c = clients.find(x => `${x.firstName} ${x.lastName}`.trim() === n)
                              if (c) ids.add(c.id)
                            }
                            const items = payments.filter(p => ids.has(String(p.clientId)))
                            if (items.length === 0) return [
                              <div key="empty" className="rounded-md border bg-white/60 p-3 text-sm text-gray-600">No payments found</div>
                            ]
                            return items.slice(0,6).map((p) => (
                              <div key={p.id} className="rounded-md border bg-white/60 p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                  <Badge variant="outline">{String(p.status || '').toUpperCase()}</Badge>
                                  <span className="text-sm font-medium">₱{Number(p.amount || 0).toLocaleString()}</span>
                                </div>
                                <div className="text-xs text-gray-500">{new Date(p.createdAt || p.updatedAt || Date.now()).toLocaleDateString()}</div>
                                <div className="grid grid-cols-3 gap-2">
                                  {[p.receiptUrl, ...(Array.isArray(p.uploadedFiles) ? p.uploadedFiles : [])]
                                    .filter(Boolean)
                                    .slice(0,3)
                                    .map((url, i) => (
                                      <a key={`${p.id}-${i}`} href={String(url)} target="_blank" rel="noreferrer" className="block aspect-square rounded-md overflow-hidden">
                                        <img src={String(url)} alt="receipt" className="w-full h-full object-cover" loading="lazy" />
                                      </a>
                                    ))}
                                </div>
                              </div>
                            ))
                          })()}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-end mt-4">
                    <Button variant="outline" onClick={() => setIsStaffPreviewOpen(false)}>Close</Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog open={isStaffTreatmentQuickOpen} onOpenChange={setIsStaffTreatmentQuickOpen}>
                <DialogContent className="max-w-md sm:max-w-xl max-h-[70vh] overflow-y-auto p-4 sm:p-4">
                  <DialogHeader>
                    <DialogTitle>{staffTreatmentTarget ? `Add Treatment – ${staffTreatmentTarget.firstName} ${staffTreatmentTarget.lastName}` : 'Add Treatment'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2">
                    {staffTreatmentForm.map((t, idx) => (
                      <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                        <div className="sm:col-span-3 space-y-1.5 relative">
                          <Label htmlFor={`qt_date_${idx}`}>Date</Label>
                          <div className="flex items-center gap-2">
                            <Input id={`qt_date_${idx}`} type="date" className="h-9 w-full" value={t?.date || ''} onChange={(e) => setStaffTreatmentForm(prev => prev.map((x, i) => i === idx ? { ...x, date: e.target.value } : x))} />
                            <Button type="button" variant="outline" className="h-9 px-2" aria-label="Pick date" title="Pick date" onClick={() => setOpenQuickCalendarIdx(openQuickCalendarIdx === idx ? null : idx)}>
                              <CalendarDays className="w-4 h-4" />
                            </Button>
                          </div>
                          {openQuickCalendarIdx === idx ? (
                            <div className="absolute left-0 top-[calc(100%+0.5rem)] min-w-[18rem] p-2 border rounded-md bg-white shadow-lg z-50">
                              <Calendar selectedDate={t?.date ? new Date(t.date) : undefined} onDateSelect={(d) => {
                                const iso = new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().slice(0,10)
                                setStaffTreatmentForm(prev => prev.map((x, i) => i === idx ? { ...x, date: iso } : x))
                                setOpenQuickCalendarIdx(null)
                              }} />
                            </div>
                          ) : null}
                        </div>
                        <div className="sm:col-span-4 space-y-1.5">
                          <Label htmlFor={`qt_procedure_${idx}`}>Procedure</Label>
                          <Select value={t?.procedure || ''} onValueChange={(value) => setStaffTreatmentForm(prev => prev.map((x, i) => i === idx ? { ...x, procedure: value } : x))}>
                            <SelectTrigger id={`qt_procedure_${idx}`} className="h-9 w-full min-w-0 truncate">
                              <SelectValue placeholder="Select procedure" />
                            </SelectTrigger>
                            <SelectContent>
                              {procedureOptions.map(name => (
                                <SelectItem key={name} value={name}>{name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="sm:col-span-3 space-y-1.5">
                          <Label htmlFor={`qt_client_${idx}`}>Client</Label>
                          <Select value={t?.clientName || ''} onValueChange={(value) => setStaffTreatmentForm(prev => prev.map((x, i) => i === idx ? { ...x, clientName: value } : x))}>
                            <SelectTrigger id={`qt_client_${idx}`} className="h-9 w-full min-w-0 truncate">
                              <SelectValue placeholder="Select client" />
                            </SelectTrigger>
                            <SelectContent>
                              {clients.map(c => (
                                <SelectItem key={c.id} value={`${c.firstName} ${c.lastName}`.trim()}>{`${c.firstName} ${c.lastName}`.trim()}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="sm:col-span-2 space-y-1.5">
                          <Label htmlFor={`qt_total_${idx}`}>Total</Label>
                          <Input id={`qt_total_${idx}`} type="number" className="h-9 w-full" value={typeof t?.total === 'number' ? t.total : 0} onChange={(e) => setStaffTreatmentForm(prev => prev.map((x, i) => i === idx ? { ...x, total: Number(e.target.value || 0) } : x))} />
                        </div>
                        <div className="sm:col-span-12 flex justify-end">
                          <Button type="button" variant="outline" onClick={() => setStaffTreatmentForm(prev => prev.filter((_, i) => i !== idx))}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button type="button" variant="outline" onClick={() => setStaffTreatmentForm(prev => ([ ...prev, { date: new Date().toISOString().split('T')[0], procedure: '', clientName: '', total: 0 } ]))}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Treatment
                    </Button>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button type="button" variant="outline" onClick={() => setIsStaffTreatmentQuickOpen(false)}>Cancel</Button>
                    <Button type="button" onClick={async () => {
                      if (!staffTreatmentTarget) return
                      try {
                        await patchJson('/api/admin/staff', { id: staffTreatmentTarget.id, treatments: staffTreatmentForm })
                        await staffService.fetchFromSupabase?.()
                        setStaff(staffService.getAllStaff())
                        setIsStaffTreatmentQuickOpen(false)
                        showNotification('success', 'Treatments saved')
                      } catch {
                        // fall back to local update
                        staffService.updateStaff(staffTreatmentTarget.id, { treatments: staffTreatmentForm })
                        setStaff(staffService.getAllStaff())
                        setIsStaffTreatmentQuickOpen(false)
                        showNotification('error', 'Saved locally; backend update failed')
                      }
                    }}>Save</Button>
                  </div>
                </DialogContent>
              </Dialog>
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
                  {(() => {
                    const reduceMotion = 
                      isAppointmentModalOpen ||
                      isPaymentModalOpen ||
                      isMedicalRecordModalOpen ||
                      isClientModalOpen ||
                      isSocialReplyModalOpen ||
                      isStaffModalOpen ||
                      isInfluencerModalOpen ||
                      isReferralModalOpen ||
                      isStaffTreatmentQuickOpen
                    const base = "bg-gradient-to-r from-fuchsia-500 via-violet-600 to-indigo-600 text-white font-bold px-6 py-3 rounded-2xl"
                    const fx = "hover:from-fuchsia-600 hover:via-violet-700 hover:to-indigo-700 shadow-2xl shadow-fuchsia-500/30 hover:shadow-fuchsia-500/40 transition-all duration-300 hover:scale-105"
                    return (
                      <Button onClick={() => openInfluencerModal()} className={`${base} ${reduceMotion ? "" : fx}`}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Influencer
                      </Button>
                    )
                  })()}
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
                const filteredInfluencers = influencers
                  .filter(i => influencerStatusFilter === 'all' ? true : i.status === influencerStatusFilter)
                  .filter(i => influencerPlatformFilter === 'all' ? true : i.platform === influencerPlatformFilter)
                  .filter(i => q === '' || i.name.toLowerCase().includes(q) || (i.handle ?? '').toLowerCase().includes(q))
                return (
              <Card className="bg-white/60 backdrop-blur-sm border border-white/70 shadow-2xl">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Influencer</TableHead>
                        <TableHead>Platform</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Referrals</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Commission Due</TableHead>
                        <TableHead>Paid</TableHead>
                        <TableHead>Remaining</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInfluencers.map(i => {
                        const stats = influencerService.getStats(i.id)
                        return (
                          <TableRow key={i.id}>
                            <TableCell>
                              <div className="font-medium">{i.name}</div>
                              {i.handle && <div className="text-xs text-gray-500">{i.handle}</div>}
                              {i.email && <div className="text-xs text-gray-500">{i.email}</div>}
                              {i.phone && <div className="text-xs text-gray-500">{i.phone}</div>}
                            </TableCell>
                            <TableCell className="capitalize">{i.platform}</TableCell>
                            <TableCell>
                              <Badge className="bg-gradient-to-r from-slate-600 to-gray-700 text-white">{i.status}</Badge>
                            </TableCell>
                            <TableCell>{stats.totalReferrals}</TableCell>
                            <TableCell>₱{stats.totalRevenue.toLocaleString()}</TableCell>
                            <TableCell>₱{stats.commissionDue.toLocaleString()}</TableCell>
                            <TableCell>₱{stats.commissionPaid.toLocaleString()}</TableCell>
                            <TableCell>₱{stats.commissionRemaining.toLocaleString()}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 justify-end">
                                <Button size="sm" variant="outline" onClick={() => openInfluencerModal(i)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => { setSelectedInfluencer(i); setIsReferralModalOpen(true) }}>
                                  <Plus className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={async () => {
                                  if (!confirmTwice(i.name || 'this influencer')) return
                                  const res = await fetch('/api/admin/influencers', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: i.id }) })
                                  if (res.ok) { await influencerService.fetchFromSupabase?.(); setInfluencers(influencerService.getAllInfluencers()); showNotification('success', 'Influencer deleted') } else { showNotification('error', 'Failed to delete influencer') }
                                }}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
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
      <Dialog open={isAppointmentModalOpen} onOpenChange={setIsAppointmentModalOpen} modal={false}>
         <DialogContent className="max-w-2xl pointer-events-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedAppointment ? 'Edit Appointment' : 'New Appointment'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAppointmentSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName">Client Name</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="clientName"
                    name="clientName"
                    autoFocus
                    defaultValue={selectedAppointment ? (selectedAppointment.clientName || '') : (appointmentForm.clientName || '')}
                    required
                    type="text"
                    autoComplete="off"
                    onKeyDown={(e) => e.stopPropagation()}
                    onInput={(e) => e.stopPropagation()}
                  />
                  <Button type="button" variant="outline" className="h-9 px-2" onClick={() => setAppointmentReveal(prev => ({ ...prev, clientName: !prev.clientName }))}>{appointmentReveal.clientName ? 'Hide' : 'Reveal'}</Button>
                </div>
              </div>
              <div>
                <Label htmlFor="clientEmail">Client Email</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="clientEmail"
                    type="email"
                    name="clientEmail"
                    defaultValue={selectedAppointment ? (selectedAppointment.clientEmail || '') : (appointmentForm.clientEmail || '')}
                    required
                    autoComplete="off"
                    onKeyDown={(e) => e.stopPropagation()}
                    onInput={(e) => e.stopPropagation()}
                  />
                  <Button type="button" variant="outline" className="h-9 px-2" onClick={() => setAppointmentReveal(prev => ({ ...prev, clientEmail: !prev.clientEmail }))}>{appointmentReveal.clientEmail ? 'Hide' : 'Reveal'}</Button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientPhone">Client Phone</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="clientPhone"
                    name="clientPhone"
                    defaultValue={selectedAppointment ? (selectedAppointment.clientPhone || '') : (appointmentForm.clientPhone || '')}
                    required
                    type="tel"
                    autoComplete="off"
                    onKeyDown={(e) => e.stopPropagation()}
                    onInput={(e) => e.stopPropagation()}
                  />
                  <Button type="button" variant="outline" className="h-9 px-2" onClick={() => setAppointmentReveal(prev => ({ ...prev, clientPhone: !prev.clientPhone }))}>{appointmentReveal.clientPhone ? 'Hide' : 'Reveal'}</Button>
                </div>
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

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={appointmentForm.date || ''}
                  onChange={(e) => startTransition(() => setAppointmentForm(prev => ({ ...prev, date: e.target.value })))}
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
                  name="duration"
                  defaultValue={selectedAppointment ? String(selectedAppointment.duration || '') : String(appointmentForm.duration || '')}
                  required
                  onKeyDown={(e) => e.stopPropagation()}
                  onInput={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price (₱)</Label>
                <Input
                  id="price"
                  type="number"
                  name="price"
                  defaultValue={selectedAppointment ? String(selectedAppointment.price || '') : String(appointmentForm.price || '')}
                  required
                  onKeyDown={(e) => e.stopPropagation()}
                  onInput={(e) => e.stopPropagation()}
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
                name="notes"
                defaultValue={selectedAppointment ? (selectedAppointment.notes || '') : (appointmentForm.notes || '')}
                rows={3}
                onKeyDown={(e) => e.stopPropagation()}
                onInput={(e) => e.stopPropagation()}
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
                  treatments: [ ...(prev.treatments || []), { date: prev.date || new Date().toISOString().split('T')[0], procedure: '', aestheticianId: '', staffName: '', total: 0 } ]
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
                    .slice(0,3)
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
                            .slice(0,3)
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
                <Button type="button" variant="outline" onClick={() => setStaffForm(prev => ({ ...prev, treatments: [ ...(prev.treatments || []), { procedure: '', clientName: '', total: 0 } ] }))}>
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
  
