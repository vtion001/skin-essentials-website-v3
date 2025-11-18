"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
  
  // Calendar and search states
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const [appointmentsSearch, setAppointmentsSearch] = useState("")
  const [appointmentsStatusFilter, setAppointmentsStatusFilter] = useState<string>("all")
  const [appointmentsServiceFilter, setAppointmentsServiceFilter] = useState<string>("all")
  const [appointmentsDateFrom, setAppointmentsDateFrom] = useState<string>("")
  const [appointmentsDateTo, setAppointmentsDateTo] = useState<string>("")
  const [appointmentsSort, setAppointmentsSort] = useState<string>("date_desc")
  const [appointmentsPage, setAppointmentsPage] = useState<number>(1)
  const [appointmentsPageSize, setAppointmentsPageSize] = useState<number>(10)
  const [staffSearch, setStaffSearch] = useState("")
  const [staffPositionFilter, setStaffPositionFilter] = useState<string>("all")
  const [staffStatusFilter, setStaffStatusFilter] = useState<string>("all")
  const [influencerSearch, setInfluencerSearch] = useState("")
  const [influencerPlatformFilter, setInfluencerPlatformFilter] = useState<string>('all')
  const [influencerStatusFilter, setInfluencerStatusFilter] = useState<string>('all')
  const [analyticsDateFrom, setAnalyticsDateFrom] = useState<string>("")
  const [analyticsDateTo, setAnalyticsDateTo] = useState<string>("")

  // Authentication is enforced by middleware; optional client-side redirect kept minimal
  useEffect(() => {
    // No-op: relying on middleware and Supabase session
  }, [router])

  // Load data
  useEffect(() => {
    loadAllData()
  }, [])

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
    setPayments(paymentService.getAllPayments())
    setMedicalRecords(medicalRecordService.getAllRecords())
    setClients(clientService.getAllClients())
    setSocialMessages(socialMediaService.getAllMessages())
    setStaff(staffService.getAllStaff())
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

  // Dashboard Statistics
  const getDashboardStats = () => {
    const today = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' })).toISOString().split('T')[0]
    const thisMonth = new Date().toISOString().slice(0, 7)
    
    return {
      todayAppointments: appointments.filter(apt => apt.date === today).length,
      totalClients: clients.length,
      monthlyRevenue: payments
        .filter(payment => payment.createdAt.startsWith(thisMonth) && payment.status === 'completed')
        .reduce((sum, payment) => sum + payment.amount, 0),
      unreadMessages: socialMessages.filter(msg => !msg.isRead).length,
      pendingPayments: payments.filter(payment => payment.status === 'pending').length,
      completedAppointments: appointments.filter(apt => apt.status === 'completed').length,
    }
  }

  const stats = getDashboardStats()

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
    
    try {
      if (selectedPayment) {
        paymentService.updatePayment(selectedPayment.id, paymentForm)
        showNotification("success", "Payment updated successfully!")
      } else {
        paymentService.addPayment(paymentForm as Omit<Payment, "id" | "createdAt" | "updatedAt">)
        showNotification("success", "Payment recorded successfully!")
      }
      
      setPayments(paymentService.getAllPayments())
      setIsPaymentModalOpen(false)
      setPaymentForm({})
      setSelectedPayment(null)
    } catch (error) {
      showNotification("error", "Failed to save payment")
    } finally {
      setIsLoading(false)
    }
  }

  // Medical Record Management
  const handleMedicalRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      if (selectedMedicalRecord) {
        medicalRecordService.updateRecord(selectedMedicalRecord.id, medicalRecordForm)
        showNotification("success", "Medical record updated successfully!")
      } else {
        medicalRecordService.addRecord(medicalRecordForm as Omit<MedicalRecord, "id" | "createdAt" | "updatedAt">)
        showNotification("success", "Medical record created successfully!")
      }
      
      setMedicalRecords(medicalRecordService.getAllRecords())
      setIsMedicalRecordModalOpen(false)
      setMedicalRecordForm({})
      setSelectedMedicalRecord(null)
    } catch (error) {
      showNotification("error", "Failed to save medical record")
    } finally {
      setIsLoading(false)
    }
  }

  // Client Management
  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const emailOk = !clientForm.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientForm.email)
      const phoneOk = !clientForm.phone || /\+?\d[\d\s-]{6,}$/.test(clientForm.phone)
      if (!emailOk || !phoneOk) {
        showNotification("error", "Please enter valid email and phone")
        setIsLoading(false)
        return
      }
      if (selectedClient) {
        clientService.updateClient(selectedClient.id, clientForm)
        showNotification("success", "Client updated successfully!")
      } else {
        clientService.addClient(clientForm as Omit<Client, "id" | "createdAt" | "updatedAt">)
        showNotification("success", "Client added successfully!")
      }
      
      const all = clientService.getAllClients()
      setClients(all)
      const link = localStorage.getItem('potential_conversation_id')
      if (!selectedClient && link) {
        const created = all[all.length - 1]
        socialMediaService.setConversationClient(link, created.id)
        try { localStorage.removeItem('potential_client_draft'); localStorage.removeItem('potential_conversation_id') } catch {}
      }
      setIsClientModalOpen(false)
      setClientForm({})
      setSelectedClient(null)
    } catch (error) {
      showNotification("error", "Failed to save client")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const emailOk = !staffForm.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(staffForm.email)
      const phoneOk = !staffForm.phone || /\+?\d[\d\s-]{6,}$/.test(staffForm.phone)
      if (!emailOk || !phoneOk) {
        showNotification("error", "Please enter valid email and phone")
        setIsLoading(false)
        return
      }
      if (selectedStaff) {
        staffService.updateStaff(selectedStaff.id, staffForm)
        showNotification("success", "Staff updated successfully!")
      } else {
        staffService.addStaff(staffForm as Omit<Staff, "id" | "createdAt" | "updatedAt">)
        showNotification("success", "Staff added successfully!")
      }
      setStaff(staffService.getAllStaff())
      setIsStaffModalOpen(false)
      setStaffForm({})
      setSelectedStaff(null)
    } catch {
      showNotification("error", "Failed to save staff")
    } finally {
      setIsLoading(false)
    }
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
    try {
      if (!influencerForm.name || !influencerForm.platform) {
        showNotification('error', 'Please fill required fields')
        setIsLoading(false)
        return
      }
      if (selectedInfluencer) {
        influencerService.updateInfluencer(selectedInfluencer.id, influencerForm)
        showNotification('success', 'Influencer updated successfully!')
      } else {
        influencerService.addInfluencer(influencerForm as Omit<Influencer, 'id' | 'createdAt' | 'updatedAt' | 'totalCommissionPaid'>)
        showNotification('success', 'Influencer added successfully!')
      }
      setInfluencers(influencerService.getAllInfluencers())
      setIsInfluencerModalOpen(false)
      setSelectedInfluencer(null)
      setInfluencerForm({ commissionRate: 0.10, status: 'active' })
    } catch {
      showNotification('error', 'Failed to save influencer')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReferralSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedInfluencer) return
    setIsLoading(true)
    try {
      if (!referralForm.clientName || !referralForm.amount || !referralForm.date) {
        showNotification('error', 'Please fill referral details')
        setIsLoading(false)
        return
      }
      influencerService.addReferral({ influencerId: selectedInfluencer.id, clientName: referralForm.clientName!, amount: Number(referralForm.amount), date: referralForm.date!, notes: referralForm.notes })
      showNotification('success', 'Referral recorded successfully!')
      setIsReferralModalOpen(false)
      setReferralForm({})
    } catch {
      showNotification('error', 'Failed to save referral')
    } finally {
      setIsLoading(false)
    }
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
    <div className="min-h-screen relative bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20">
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes slideInUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); }
          50% { box-shadow: 0 0 30px rgba(139, 92, 246, 0.5); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-slideInUp {
          animation: slideInUp 0.6s ease-out;
        }
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
        .animate-shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          background-size: 200% 100%;
          animation: shimmer 3s infinite;
        }
        .delay-1000 { animation-delay: 1s; }
        .delay-2000 { animation-delay: 2s; }
        .delay-3000 { animation-delay: 3s; }
      `}</style>
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-16 -left-24 w-96 h-96 bg-gradient-to-br from-purple-400/20 via-pink-300/15 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/4 -right-32 w-80 h-80 bg-gradient-to-br from-blue-400/20 via-cyan-300/15 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-gradient-to-br from-amber-400/20 via-orange-300/15 to-transparent rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-emerald-400/10 via-teal-300/8 to-transparent rounded-full blur-3xl animate-pulse delay-3000"></div>
      </div>
      

      {/* Premium Notification */}
      {notification && (
        <div
          className={`fixed top-24 right-6 z-50 p-6 rounded-3xl shadow-2xl border-2 backdrop-blur-2xl animate-slideInUp ${
            notification.type === "success"
              ? "bg-gradient-to-br from-green-50/90 via-emerald-50/80 to-green-50/90 border-emerald-300/70 text-emerald-900 shadow-emerald-500/20"
              : "bg-gradient-to-br from-red-50/90 via-rose-50/80 to-red-50/90 border-rose-300/70 text-rose-900 shadow-rose-500/20"
          }`}
        >
          <div className="flex items-center space-x-4">
            {notification.type === "success" ? (
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-lg shadow-green-500/30">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            ) : (
              <div className="p-3 bg-gradient-to-br from-red-500 to-rose-500 rounded-2xl shadow-lg shadow-red-500/30">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
            )}
            <span className="font-bold text-lg">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="pt-20 sm:pt-24 pb-10 sm:pb-12 px-4 sm:px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Page Header - Glassmorphism effect */}
          <div className="flex items-center justify-between mb-8">
            <div className="bg-white/40 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-2xl shadow-purple-500/5">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 text-lg font-medium">Comprehensive management system for Skin Essentials</p>
            </div>
            <div className="flex items-center space-x-4">
              {supabaseAvailable() ? (
                <Badge className="bg-green-500 text-white shadow-sm">Supabase Connected</Badge>
              ) : (
                <Badge className="bg-red-500 text-white shadow-sm">Supabase Not Configured</Badge>
              )}
              <FacebookStatusIndicator />
              <Button
                onClick={loadAllData}
                variant="outline"
                className="bg-white/60 backdrop-blur-sm border border-white/70 text-gray-700 hover:bg-white/80 hover:shadow-lg transition-all duration-300 hover:scale-105"
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="bg-white/60 backdrop-blur-sm border border-red-200/70 text-red-600 hover:bg-red-50/80 hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                Logout
              </Button>
            </div>
          </div>

          {/* Main Dashboard Navigation */}
          <div className="grid lg:grid-cols-[240px_1fr] gap-6 lg:gap-8">
            <aside role="navigation" aria-label="Admin sections" className="hidden lg:block">
              <div className="rounded-3xl bg-white/30 backdrop-blur-2xl shadow-2xl shadow-purple-500/10 border border-white/60 p-6">
                <div className="text-sm font-bold text-gray-700 px-2 mb-4 uppercase tracking-wider">Navigation</div>
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
                  ].map(({ key, label, icon: Icon, color }) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      aria-current={activeTab === key ? 'page' : undefined}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 motion-safe:hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        activeTab === key
                          ? `bg-gradient-to-r ${color} text-white shadow-xl shadow-${color.split('-')[1]}-500/30 border border-white/80 transform scale-105`
                          : 'text-gray-700 hover:bg-white/60 hover:shadow-md'
                      }`}
                    >
                      <div className={`p-2 rounded-xl ${activeTab === key ? 'bg-white/20' : 'bg-gray-100'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="flex-1 text-left">{label}</span>
                      {activeTab === key && <div className="w-3 h-3 bg-white/40 rounded-full animate-pulse" />}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col gap-2 w-full">
            <TabsList className="bg-white/30 backdrop-blur-xl border border-white/60 shadow-2xl shadow-purple-500/10 h-16 items-center justify-center rounded-3xl p-3 grid w-full grid-cols-6 mb-8 lg:hidden overflow-x-auto scrollbar-none">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:shadow-blue-500/30 text-gray-700 h-[calc(100%-8px)] flex-1 justify-center rounded-2xl border border-transparent px-3 py-2 text-sm font-bold whitespace-nowrap transition-all duration-300 focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-white/80 data-[state=active]:scale-110 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5 flex items-center gap-2 hover:scale-105 hover:shadow-lg">
                <BarChart3 className="w-5 h-5" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="appointments" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:shadow-purple-500/30 text-gray-700 h-[calc(100%-8px)] flex-1 justify-center rounded-2xl border border-transparent px-3 py-2 text-sm font-bold whitespace-nowrap transition-all duration-300 focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-white/80 data-[state=active]:scale-110 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5 flex items-center gap-2 hover:scale-105 hover:shadow-lg">
                <CalendarIcon className="w-5 h-5" />
                Bookings
              </TabsTrigger>
              <TabsTrigger value="payments" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:shadow-green-500/30 text-gray-700 h-[calc(100%-8px)] flex-1 justify-center rounded-2xl border border-transparent px-3 py-2 text-sm font-bold whitespace-nowrap transition-all duration-300 focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-white/80 data-[state=active]:scale-110 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5 flex items-center gap-2 hover:scale-105 hover:shadow-lg">
                <CreditCard className="w-5 h-5" />
                Payments
              </TabsTrigger>
              <TabsTrigger value="medical" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:shadow-orange-500/30 text-gray-700 h-[calc(100%-8px)] flex-1 justify-center rounded-2xl border border-transparent px-3 py-2 text-sm font-bold whitespace-nowrap transition-all duration-300 focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-white/80 data-[state=active]:scale-110 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5 flex items-center gap-2 hover:scale-105 hover:shadow-lg">
                <FileText className="w-5 h-5" />
                EMR
              </TabsTrigger>
              <TabsTrigger value="clients" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:shadow-indigo-500/30 text-gray-700 h-[calc(100%-8px)] flex-1 justify-center rounded-2xl border border-transparent px-3 py-2 text-sm font-bold whitespace-nowrap transition-all duration-300 focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-white/80 data-[state=active]:scale-110 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5 flex items-center gap-2 hover:scale-105 hover:shadow-lg">
                <Users className="w-5 h-5" />
                Clients
              </TabsTrigger>
              <TabsTrigger value="staff" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-500 data-[state=active]:to-gray-600 data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:shadow-slate-500/30 text-gray-700 h-[calc(100%-8px)] flex-1 justify-center rounded-2xl border border-transparent px-3 py-2 text-sm font-bold whitespace-nowrap transition-all duration-300 focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-white/80 data-[state=active]:scale-110 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5 flex items-center gap-2 hover:scale-105 hover:shadow-lg">
                <Settings className="w-5 h-5" />
                Staff
              </TabsTrigger>
              <TabsTrigger value="influencers" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-fuchsia-500 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:shadow-fuchsia-500/30 text-gray-700 h-[calc(100%-8px)] flex-1 justify-center rounded-2xl border border-transparent px-3 py-2 text-sm font-bold whitespace-nowrap transition-all duration-300 focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-white/80 data-[state=active]:scale-110 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5 flex items-center gap-2 hover:scale-105 hover:shadow-lg">
                <TrendingUp className="w-5 h-5" />
                Influencers
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:shadow-blue-600/30 text-gray-700 h-[calc(100%-8px)] flex-1 justify-center rounded-2xl border border-transparent px-3 py-2 text-sm font-bold whitespace-nowrap transition-all duration-300 focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-white/80 data-[state=active]:scale-110 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5 flex items-center gap-2 hover:scale-105 hover:shadow-lg">
                <BarChart3 className="w-5 h-5" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="social" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:shadow-rose-500/30 text-gray-700 h-[calc(100%-8px)] flex-1 justify-center rounded-2xl border border-transparent px-3 py-2 text-sm font-bold whitespace-nowrap transition-all duration-300 focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-white/80 data-[state=active]:scale-110 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5 flex items-center gap-2 hover:scale-105 hover:shadow-lg">
                <MessageSquare className="w-5 h-5" />
                Social Media
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Overview - Premium Animated */}
            <TabsContent value="dashboard" className="space-y-8 animate-slideInUp">
              {/* Stats Cards - Premium Glassmorphism */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            <Card className="bg-gradient-to-br from-blue-50/40 via-white/50 to-cyan-50/30 backdrop-blur-xl border border-blue-200/50 shadow-2xl shadow-blue-500/10 transition-all duration-500 hover:shadow-blue-500/20 hover:scale-[1.03]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600/80 mb-1">Today's Appointments</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      {stats.todayAppointments}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg shadow-blue-500/30">
                    <CalendarIcon className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="mt-4 h-2 bg-gradient-to-r from-blue-200/50 to-cyan-200/50 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse" style={{width: `${Math.min(stats.todayAppointments * 10, 100)}%`}}></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50/40 via-white/50 to-emerald-50/30 backdrop-blur-xl border border-green-200/50 shadow-2xl shadow-green-500/10 transition-all duration-500 hover:shadow-green-500/20 hover:scale-[1.03]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600/80 mb-1">Total Clients</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {stats.totalClients}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-lg shadow-green-500/30">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="mt-4 h-2 bg-gradient-to-r from-green-200/50 to-emerald-200/50 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse" style={{width: `${Math.min(stats.totalClients * 2, 100)}%`}}></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50/40 via-white/50 to-violet-50/30 backdrop-blur-xl border border-purple-200/50 shadow-2xl shadow-purple-500/10 transition-all duration-500 hover:shadow-purple-500/20 hover:scale-[1.03]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600/80 mb-1">Monthly Revenue</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                      ₱{stats.monthlyRevenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-500 rounded-2xl shadow-lg shadow-purple-500/30">
                    <DollarSign className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="mt-4 h-2 bg-gradient-to-r from-purple-200/50 to-violet-200/50 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full animate-pulse" style={{width: `${Math.min((stats.monthlyRevenue / 100000) * 100, 100)}%`}}></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50/40 via-white/50 to-amber-50/30 backdrop-blur-xl border border-orange-200/50 shadow-2xl shadow-orange-500/10 transition-all duration-500 hover:shadow-orange-500/20 hover:scale-[1.03]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600/80 mb-1">Unread Messages</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                      {stats.unreadMessages}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl shadow-lg shadow-orange-500/30">
                    <MessageSquare className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="mt-4 h-2 bg-gradient-to-r from-orange-200/50 to-amber-200/50 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full animate-pulse" style={{width: `${Math.min(stats.unreadMessages * 20, 100)}%`}}></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50/40 via-white/50 to-rose-50/30 backdrop-blur-xl border border-red-200/50 shadow-2xl shadow-red-500/10 transition-all duration-500 hover:shadow-red-500/20 hover:scale-[1.03]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600/80 mb-1">Pending Payments</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                      {stats.pendingPayments}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-red-500 to-rose-500 rounded-2xl shadow-lg shadow-red-500/30">
                    <Clock className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="mt-4 h-2 bg-gradient-to-r from-red-200/50 to-rose-200/50 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full animate-pulse" style={{width: `${Math.min(stats.pendingPayments * 15, 100)}%`}}></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50/40 via-white/50 to-yellow-50/30 backdrop-blur-xl border border-amber-200/50 shadow-2xl shadow-amber-500/10 transition-all duration-500 hover:shadow-amber-500/20 hover:scale-[1.03]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-600/80 mb-1">Completed</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                      {stats.completedAppointments}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-2xl shadow-lg shadow-amber-500/30">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="mt-4 h-2 bg-gradient-to-r from-amber-200/50 to-yellow-200/50 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full animate-pulse" style={{width: `${Math.min(stats.completedAppointments * 5, 100)}%`}}></div>
                </div>
              </CardContent>
            </Card>
              </div>

              {/* Recent Activity - Premium Glass Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-slate-50/40 via-white/60 to-blue-50/30 backdrop-blur-2xl border border-white/70 shadow-2xl shadow-blue-500/10 transition-all duration-500 hover:shadow-blue-500/20 hover:scale-[1.02]">
                  <CardHeader className="border-b border-white/50">
                    <CardTitle className="flex items-center gap-3 text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg shadow-blue-500/30">
                        <Activity className="w-5 h-5 text-white" />
                      </div>
                      Recent Appointments
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {appointments.slice(0, 5).map((appointment, index) => (
                        <div key={appointment.id} className="flex items-center justify-between p-4 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg shadow-gray-500/5 transition-all duration-300 hover:shadow-xl hover:scale-[1.01] hover:bg-white/50">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/10">
                              <span className="text-blue-600 font-bold text-lg">{index + 1}</span>
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-lg">{appointment.clientName}</p>
                              <p className="text-sm text-gray-600 font-medium">{appointment.service}</p>
                              <p className="text-xs text-gray-500 font-medium">{appointment.date} at {appointment.time}</p>
                            </div>
                          </div>
                          <Badge className={
                            appointment.status === 'completed' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30 border-0' :
                            appointment.status === 'confirmed' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30 border-0' :
                            appointment.status === 'scheduled' ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg shadow-yellow-500/30 border-0' :
                            'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/30 border-0'
                          }>
                            {appointment.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-slate-50/40 via-white/60 to-purple-50/30 backdrop-blur-2xl border border-white/70 shadow-2xl shadow-purple-500/10 transition-all duration-500 hover:shadow-purple-500/20 hover:scale-[1.02]">
                  <CardHeader className="border-b border-white/50">
                    <CardTitle className="flex items-center gap-3 text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg shadow-purple-500/30">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      Recent Messages
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {socialMessages.slice(0, 5).map((message, index) => (
                        <div key={message.id} className="flex items-start gap-4 p-4 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg shadow-gray-500/5 transition-all duration-300 hover:shadow-xl hover:scale-[1.01] hover:bg-white/50">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/10">
                              {message.platform === 'instagram' ? (
                                <Instagram className="w-6 h-6 text-pink-500" />
                              ) : (
                                <Facebook className="w-6 h-6 text-blue-500" />
                              )}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-bold text-gray-900 text-lg">{message.senderName}</p>
                              <span className="text-xs text-gray-500 font-medium">{new Date(message.timestamp).toLocaleString()}</span>
                            </div>
                            <p className="text-sm text-gray-700 font-medium leading-relaxed">{message.message}</p>
                          </div>
                          {!message.isRead && (
                            <div className="flex-shrink-0">
                              <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-rose-500 rounded-full animate-pulse shadow-lg shadow-red-500/30"></div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Appointments/Booking System - Premium Animated */}
            <TabsContent value="appointments" className="space-y-8 animate-slideInUp">
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
                                    <Button size="sm" variant="outline" onClick={() => openAppointmentModal(a)}>
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => appointmentService.deleteAppointment(a.id) && loadAllData()}>
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

            {/* Payment Processing - Premium Animated */}
            <TabsContent value="payments" className="space-y-8 animate-slideInUp">
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

              <Card className="bg-white/60 backdrop-blur-sm border border-[#fbc6c5]/20">
                <CardContent className="p-4 sm:p-6">
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
                      {payments.map((payment) => {
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
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openPaymentModal(payment)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                {payment.receiptUrl && (
                                  <Button size="sm" variant="outline">
                                    <Download className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Electronic Medical Records - Premium Animated */}
            <TabsContent value="medical" className="space-y-8 animate-slideInUp">
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

            {/* User Management - Premium Animated */}
            <TabsContent value="clients" className="space-y-8 animate-slideInUp">
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clients
                  .filter(client => 
                    searchQuery === '' || 
                    client.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    client.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    client.phone.includes(searchQuery)
                  )
                  .map((client) => (
                    <Card key={client.id} className="bg-white/60 backdrop-blur-sm border border-[#fbc6c5]/20">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-bold text-lg">{client.firstName} {client.lastName}</h3>
                            <p className="text-sm text-gray-600">{client.email}</p>
                            <p className="text-sm text-gray-600">{client.phone}</p>
                          </div>
                          <Badge className={
                            client.status === 'active' ? 'bg-green-100 text-green-800' :
                            client.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {client.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="w-4 h-4 text-gray-500" />
                            <span>Total Spent: ₱{client.totalSpent.toLocaleString()}</span>
                          </div>
                          {client.lastVisit && (
                            <div className="flex items-center gap-2 text-sm">
                              <CalendarIcon className="w-4 h-4 text-gray-500" />
                              <span>Last Visit: {new Date(client.lastVisit).toLocaleDateString()}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="w-4 h-4 text-gray-500" />
                            <span>Source: {client.source.replace('_', ' ')}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openClientModal(client)}
                            className="flex-1"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openMedicalRecordModal(undefined, client.id)}
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Phone className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Mail className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="staff" className="space-y-8 animate-slideInUp">
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {staff
                  .filter(s => staffStatusFilter === 'all' ? true : s.status === staffStatusFilter)
                  .filter(s => staffPositionFilter === 'all' ? true : s.position === staffPositionFilter)
                  .filter(s => 
                    staffSearch === '' ||
                    s.firstName.toLowerCase().includes(staffSearch.toLowerCase()) ||
                    s.lastName.toLowerCase().includes(staffSearch.toLowerCase()) ||
                    s.email.toLowerCase().includes(staffSearch.toLowerCase()) ||
                    s.phone.includes(staffSearch)
                  )
                  .map((s) => (
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
                          <Button size="sm" variant="outline" onClick={() => staffService.deleteStaff(s.id) && setStaff(staffService.getAllStaff())}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="influencers" className="space-y-8 animate-slideInUp">
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {influencers
                  .filter(i => influencerStatusFilter === 'all' ? true : i.status === influencerStatusFilter)
                  .filter(i => influencerPlatformFilter === 'all' ? true : i.platform === influencerPlatformFilter)
                  .filter(i => influencerSearch === '' || i.name.toLowerCase().includes(influencerSearch.toLowerCase()) || (i.handle ?? '').toLowerCase().includes(influencerSearch.toLowerCase()))
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
                            <Button size="sm" variant="outline" onClick={() => influencerService.payCommission(i.id) && setInfluencers(influencerService.getAllInfluencers())} className="w-full sm:w-auto">
                              <DollarSign className="w-4 h-4 mr-2" />
                              Pay Commission
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {influencerService.getReferralsByInfluencer(i.id).slice(0,5).map(ref => (
                              <div key={ref.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                                <div>
                                  <p className="font-medium text-sm">{ref.clientName}</p>
                                  <p className="text-xs text-gray-500">{new Date(ref.date).toLocaleDateString()}</p>
                                </div>
                                <div className="text-sm font-semibold">₱{ref.amount.toLocaleString()}</div>
                              </div>
                            ))}
                            {influencerService.getReferralsByInfluencer(i.id).length === 0 && (
                              <div className="text-center py-6 text-gray-500">No referrals yet</div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-8 animate-slideInUp">
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

            {/* Social Media Integration - Premium Animated */}
            <TabsContent value="social" className="space-y-8 animate-slideInUp">
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
          </Tabs>
          </div>
        </div>
      </div>

      {/* Appointment Modal */}
      <Dialog open={isAppointmentModalOpen} onOpenChange={setIsAppointmentModalOpen}>
        <DialogContent className="max-w-2xl">
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
                  <Button type="button" variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Files
                  </Button>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  PNG, JPG, PDF up to 10MB
                </p>
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

       <Dialog open={isInfluencerModalOpen} onOpenChange={setIsInfluencerModalOpen}>
         <DialogContent className="max-w-2xl">
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
         <DialogContent className="max-w-lg">
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

      {/* Medical Record Modal */}
      <Dialog open={isMedicalRecordModalOpen} onOpenChange={setIsMedicalRecordModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                  <Button type="button" variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Medical Files
                  </Button>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Images, PDFs, and documents up to 10MB each
                </p>
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
         <DialogContent className="max-w-2xl">
           <DialogHeader>
             <DialogTitle>
               {selectedClient ? 'Edit Client' : 'Add New Client'}
             </DialogTitle>
           </DialogHeader>
           <form onSubmit={handleClientSubmit} className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <Label htmlFor="firstName">First Name</Label>
                 <Input
                   id="firstName"
                   value={clientForm.firstName || ''}
                   onChange={(e) => setClientForm(prev => ({ ...prev, firstName: e.target.value }))}
                   required
                 />
               </div>
               <div>
                 <Label htmlFor="lastName">Last Name</Label>
                 <Input
                   id="lastName"
                   value={clientForm.lastName || ''}
                   onChange={(e) => setClientForm(prev => ({ ...prev, lastName: e.target.value }))}
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
                   onChange={(e) => setClientForm(prev => ({ ...prev, email: e.target.value }))}
                   required
                 />
               </div>
               <div>
                 <Label htmlFor="phone">Phone</Label>
                 <Input
                   id="phone"
                   value={clientForm.phone || ''}
                   onChange={(e) => setClientForm(prev => ({ ...prev, phone: e.target.value }))}
                   required
                 />
               </div>
             </div>

             <div>
               <Label htmlFor="address">Address</Label>
               <Textarea
                 id="address"
                 value={clientForm.address || ''}
                 onChange={(e) => setClientForm(prev => ({ ...prev, address: e.target.value }))}
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
                   onChange={(e) => setClientForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                 />
               </div>
               <div>
                 <Label htmlFor="gender">Gender</Label>
                 <Select
                   value={clientForm.gender || ''}
                   onValueChange={(value) => setClientForm(prev => ({ ...prev, gender: value as any }))}
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
                   onValueChange={(value) => setClientForm(prev => ({ ...prev, status: value as any }))}
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
                 value={clientForm.emergencyContact || ''}
                 onChange={(e) => setClientForm(prev => ({ ...prev, emergencyContact: e.target.value }))}
                 placeholder="Name and phone number"
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
         <DialogContent className="max-w-2xl">
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
         <DialogContent className="max-w-lg">
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
     </div>
   )
 }
