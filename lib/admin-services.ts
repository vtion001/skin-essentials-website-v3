// Types for the admin dashboard features

import { facebookAPI, type FacebookPage, type FacebookConversation, type FacebookMessage } from './facebook-api'
import { instagramAPI, type InstagramUser, type InstagramConversation, type InstagramMessage } from './instagram-api'
import { supabaseAvailable, supabaseFetchAppointments, supabaseInsertAppointment, supabaseUpdateAppointment, supabaseDeleteAppointment } from './supabase'

export interface Appointment {
  id: string
  clientId: string
  clientName: string
  clientEmail: string
  clientPhone: string
  service: string
  date: string
  time: string
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show'
  notes?: string
  duration: number // in minutes
  price: number
  createdAt: string
  updatedAt: string
}

export interface Payment {
  id: string
  appointmentId?: string
  clientId: string
  amount: number
  method: 'gcash' | 'bank_transfer' | 'cash' | 'card'
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  transactionId?: string
  receiptUrl?: string
  uploadedFiles: string[]
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface MedicalRecord {
  id: string
  clientId: string
  appointmentId?: string
  date: string
  chiefComplaint: string
  medicalHistory: string[]
  allergies: string[]
  currentMedications: string[]
  treatmentPlan: string
  notes: string
  attachments: string[]
  createdBy: string
  createdAt: string
  updatedAt: string
  isConfidential: boolean
}

export interface Client {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say'
  address?: string
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  medicalHistory: string[]
  allergies: string[]
  preferences: {
    communicationMethod: 'email' | 'sms' | 'phone'
    reminderSettings: boolean
    marketingConsent: boolean
  }
  source: 'website' | 'referral' | 'social_media' | 'walk_in'
  status: 'active' | 'inactive' | 'blocked'
  totalSpent: number
  lastVisit?: string
  createdAt: string
  updatedAt: string
}

export interface SocialMessage {
  id: string
  platform: 'instagram' | 'facebook'
  senderId: string
  senderName: string
  senderProfilePicture?: string
  message: string
  timestamp: string
  isRead: boolean
  isReplied: boolean
  replyMessage?: string
  replyTimestamp?: string
  attachments: string[]
  clientId?: string
  conversationId: string
  messageType: 'text' | 'image' | 'video' | 'audio' | 'file'
  isFromPage: boolean // true if message is from business page, false if from user
}

export interface SocialConversation {
  id: string
  platform: 'instagram' | 'facebook'
  participantId: string
  participantName: string
  participantProfilePicture?: string
  lastMessage: string
  lastMessageTimestamp: string
  unreadCount: number
  isActive: boolean
  messages: SocialMessage[]
  pageId?: string
  pageName?: string
}

export interface SocialPlatformConnection {
  id: string
  platform: 'instagram' | 'facebook'
  pageId: string
  pageName: string
  accessToken: string
  isConnected: boolean
  lastSyncTimestamp?: string
  webhookVerified: boolean
}

// Service Classes

class AppointmentService {
  private appointments: Appointment[] = []
  private initialized = false

  constructor() {
    if (typeof window !== "undefined") {
      this.loadFromStorage()
    }
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem("appointments_data")
      if (stored) {
        this.appointments = JSON.parse(stored)
      } else {
        this.appointments = this.getDefaultAppointments()
        this.saveToStorage()
      }
      this.initialized = true
    } catch (error) {
      console.error("Error loading appointments:", error)
      this.appointments = this.getDefaultAppointments()
      this.initialized = true
    }
    // Try to hydrate from Supabase asynchronously
    this.fetchFromSupabase().catch(() => {})
  }

  private saveToStorage() {
    try {
      localStorage.setItem("appointments_data", JSON.stringify(this.appointments))
    } catch (error) {
      console.error("Error saving appointments:", error)
    }
  }

  private getDefaultAppointments(): Appointment[] {
    return [
      {
        id: "1",
        clientId: "client1",
        clientName: "Sarah Johnson",
        clientEmail: "sarah@example.com",
        clientPhone: "+1234567890",
        service: "Dermal Fillers - Lip Enhancement",
        date: "2024-01-25",
        time: "10:00",
        status: "scheduled",
        duration: 60,
        price: 500,
        notes: "First time client, consultation included",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "2",
        clientId: "client2",
        clientName: "Maria Garcia",
        clientEmail: "maria@example.com",
        clientPhone: "+1234567891",
        service: "Botox - Wrinkle Reduction",
        date: "2024-01-26",
        time: "14:00",
        status: "confirmed",
        duration: 45,
        price: 350,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ]
  }

  getAllAppointments(): Appointment[] {
    if (!this.initialized) this.loadFromStorage()
    return [...this.appointments]
  }

  async fetchFromSupabase() {
    if (!supabaseAvailable()) return
    const rows = await supabaseFetchAppointments()
    if (!rows) return
    // Normalize rows to Appointment shape
    const normalized: Appointment[] = rows.map((r: any) => ({
      id: String(r.id),
      clientId: String(r.client_id ?? r.clientId ?? ''),
      clientName: String(r.client_name ?? r.clientName ?? ''),
      clientEmail: String(r.client_email ?? r.clientEmail ?? ''),
      clientPhone: String(r.client_phone ?? r.clientPhone ?? ''),
      service: String(r.service),
      date: String(r.date),
      time: String(r.time),
      status: (r.status ?? 'scheduled') as Appointment['status'],
      notes: r.notes ?? '',
      duration: Number(r.duration ?? 60),
      price: Number(r.price ?? 0),
      createdAt: String(r.created_at ?? r.createdAt ?? new Date().toISOString()),
      updatedAt: String(r.updated_at ?? r.updatedAt ?? new Date().toISOString()),
    }))
    this.appointments = normalized
    this.saveToStorage()
  }

  async syncLocalToSupabaseIfEmpty() {
    if (!supabaseAvailable()) return
    const rows = await supabaseFetchAppointments()
    if (!rows || rows.length > 0) return
    const payloads = this.appointments.map((a) => ({
      id: a.id,
      client_id: a.clientId,
      client_name: a.clientName,
      client_email: a.clientEmail,
      client_phone: a.clientPhone,
      service: a.service,
      date: a.date,
      time: a.time,
      status: a.status,
      notes: a.notes,
      duration: a.duration,
      price: a.price,
      created_at: a.createdAt,
      updated_at: a.updatedAt,
    }))
    await Promise.all(payloads.map((p) => supabaseInsertAppointment(p).catch(() => false)))
  }

  getAppointmentsByDate(date: string): Appointment[] {
    return this.appointments.filter(apt => apt.date === date)
  }

  addAppointment(appointment: Omit<Appointment, "id" | "createdAt" | "updatedAt">): Appointment {
    const newAppointment: Appointment = {
      ...appointment,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.appointments.push(newAppointment)
    this.saveToStorage()
    // Fire-and-forget insert to Supabase
    if (supabaseAvailable()) {
      const row = {
        id: newAppointment.id,
        client_id: newAppointment.clientId,
        client_name: newAppointment.clientName,
        client_email: newAppointment.clientEmail,
        client_phone: newAppointment.clientPhone,
        service: newAppointment.service,
        date: newAppointment.date,
        time: newAppointment.time,
        status: newAppointment.status,
        notes: newAppointment.notes,
        duration: newAppointment.duration,
        price: newAppointment.price,
        created_at: newAppointment.createdAt,
        updated_at: newAppointment.updatedAt,
      }
      supabaseInsertAppointment(row).catch(() => {})
    }
    return newAppointment
  }

  updateAppointment(id: string, updates: Partial<Appointment>): boolean {
    const index = this.appointments.findIndex(apt => apt.id === id)
    if (index === -1) return false

    this.appointments[index] = {
      ...this.appointments[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    this.saveToStorage()
    if (supabaseAvailable()) {
      const { clientId, clientName, clientEmail, clientPhone, service, date, time, status, notes, duration, price, updatedAt } = this.appointments[index]
      const row = { client_id: clientId, client_name: clientName, client_email: clientEmail, client_phone: clientPhone, service, date, time, status, notes, duration, price, updated_at: updatedAt }
      supabaseUpdateAppointment(id, row).catch(() => {})
    }
    return true
  }

  deleteAppointment(id: string): boolean {
    const index = this.appointments.findIndex(apt => apt.id === id)
    if (index === -1) return false

    this.appointments.splice(index, 1)
    this.saveToStorage()
    if (supabaseAvailable()) {
      supabaseDeleteAppointment(id).catch(() => {})
    }
    return true
  }

  getAvailableTimeSlots(date: string): string[] {
    const bookedSlots = this.getAppointmentsByDate(date).map(apt => apt.time)
    const allSlots = [
      "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
      "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
      "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
    ]
    return allSlots.filter(slot => !bookedSlots.includes(slot))
  }
}

class PaymentService {
  private payments: Payment[] = []
  private initialized = false

  constructor() {
    if (typeof window !== "undefined") {
      this.loadFromStorage()
    }
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem("payments_data")
      if (stored) {
        this.payments = JSON.parse(stored)
      } else {
        this.payments = this.getDefaultPayments()
        this.saveToStorage()
      }
      this.initialized = true
    } catch (error) {
      console.error("Error loading payments:", error)
      this.payments = this.getDefaultPayments()
      this.initialized = true
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem("payments_data", JSON.stringify(this.payments))
    } catch (error) {
      console.error("Error saving payments:", error)
    }
  }

  private getDefaultPayments(): Payment[] {
    return [
      {
        id: "1",
        appointmentId: "1",
        clientId: "client1",
        amount: 500,
        method: "gcash",
        status: "completed",
        transactionId: "GC123456789",
        uploadedFiles: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ]
  }

  getAllPayments(): Payment[] {
    if (!this.initialized) this.loadFromStorage()
    return [...this.payments]
  }

  addPayment(payment: Omit<Payment, "id" | "createdAt" | "updatedAt">): Payment {
    const newPayment: Payment = {
      ...payment,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.payments.push(newPayment)
    this.saveToStorage()
    return newPayment
  }

  updatePayment(id: string, updates: Partial<Payment>): boolean {
    const index = this.payments.findIndex(payment => payment.id === id)
    if (index === -1) return false

    this.payments[index] = {
      ...this.payments[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    this.saveToStorage()
    return true
  }
}

class MedicalRecordService {
  private records: MedicalRecord[] = []
  private initialized = false

  constructor() {
    if (typeof window !== "undefined") {
      this.loadFromStorage()
    }
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem("medical_records_data")
      if (stored) {
        this.records = JSON.parse(stored)
      } else {
        this.records = []
        this.saveToStorage()
      }
      this.initialized = true
    } catch (error) {
      console.error("Error loading medical records:", error)
      this.records = []
      this.initialized = true
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem("medical_records_data", JSON.stringify(this.records))
    } catch (error) {
      console.error("Error saving medical records:", error)
    }
  }

  getAllRecords(): MedicalRecord[] {
    if (!this.initialized) this.loadFromStorage()
    return [...this.records]
  }

  getRecordsByClient(clientId: string): MedicalRecord[] {
    return this.records.filter(record => record.clientId === clientId)
  }

  addRecord(record: Omit<MedicalRecord, "id" | "createdAt" | "updatedAt">): MedicalRecord {
    const newRecord: MedicalRecord = {
      ...record,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.records.push(newRecord)
    this.saveToStorage()
    return newRecord
  }

  updateRecord(id: string, updates: Partial<MedicalRecord>): boolean {
    const index = this.records.findIndex(record => record.id === id)
    if (index === -1) return false

    this.records[index] = {
      ...this.records[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    this.saveToStorage()
    return true
  }
}

class ClientService {
  private clients: Client[] = []
  private initialized = false

  constructor() {
    if (typeof window !== "undefined") {
      this.loadFromStorage()
    }
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem("clients_data")
      if (stored) {
        this.clients = JSON.parse(stored)
      } else {
        this.clients = this.getDefaultClients()
        this.saveToStorage()
      }
      this.initialized = true
    } catch (error) {
      console.error("Error loading clients:", error)
      this.clients = this.getDefaultClients()
      this.initialized = true
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem("clients_data", JSON.stringify(this.clients))
    } catch (error) {
      console.error("Error saving clients:", error)
    }
  }

  private getDefaultClients(): Client[] {
    return [
      {
        id: "client1",
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah@example.com",
        phone: "+1234567890",
        dateOfBirth: "1990-05-15",
        medicalHistory: ["No significant medical history"],
        allergies: ["None known"],
        preferences: {
          communicationMethod: "email",
          reminderSettings: true,
          marketingConsent: true,
        },
        source: "website",
        status: "active",
        totalSpent: 500,
        lastVisit: "2024-01-20",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "client2",
        firstName: "Maria",
        lastName: "Garcia",
        email: "maria@example.com",
        phone: "+1234567891",
        dateOfBirth: "1985-08-22",
        medicalHistory: ["Hypertension"],
        allergies: ["Penicillin"],
        preferences: {
          communicationMethod: "sms",
          reminderSettings: true,
          marketingConsent: false,
        },
        source: "referral",
        status: "active",
        totalSpent: 1200,
        lastVisit: "2024-01-18",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ]
  }

  getAllClients(): Client[] {
    if (!this.initialized) this.loadFromStorage()
    return [...this.clients]
  }

  getClientById(id: string): Client | undefined {
    return this.clients.find(client => client.id === id)
  }

  addClient(client: Omit<Client, "id" | "createdAt" | "updatedAt">): Client {
    const newClient: Client = {
      ...client,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.clients.push(newClient)
    this.saveToStorage()
    return newClient
  }

  updateClient(id: string, updates: Partial<Client>): boolean {
    const index = this.clients.findIndex(client => client.id === id)
    if (index === -1) return false

    this.clients[index] = {
      ...this.clients[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    this.saveToStorage()
    return true
  }

  searchClients(query: string): Client[] {
    const lowercaseQuery = query.toLowerCase()
    return this.clients.filter(client =>
      client.firstName.toLowerCase().includes(lowercaseQuery) ||
      client.lastName.toLowerCase().includes(lowercaseQuery) ||
      client.email.toLowerCase().includes(lowercaseQuery) ||
      client.phone.includes(query)
    )
  }
}

class SocialMediaService {
  private messages: SocialMessage[] = []
  private conversations: SocialConversation[] = []
  private platformConnections: SocialPlatformConnection[] = []
  private initialized = false

  constructor() {
    if (typeof window !== "undefined") {
      this.loadFromStorage()
    }
  }

  private loadFromStorage() {
    try {
      const storedMessages = localStorage.getItem("social_messages_data")
      const storedConversations = localStorage.getItem("social_conversations_data")
      const storedConnections = localStorage.getItem("social_connections_data")
      
      if (storedMessages) {
        this.messages = JSON.parse(storedMessages)
      } else {
        this.messages = this.getDefaultMessages()
      }

      if (storedConversations) {
        this.conversations = JSON.parse(storedConversations)
      } else {
        this.conversations = this.getDefaultConversations()
      }

      if (storedConnections) {
        this.platformConnections = JSON.parse(storedConnections)
      } else {
        this.platformConnections = []
      }

      this.saveToStorage()
      this.initialized = true
    } catch (error) {
      console.error("Error loading social media data:", error)
      this.messages = this.getDefaultMessages()
      this.conversations = this.getDefaultConversations()
      this.platformConnections = []
      this.initialized = true
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem("social_messages_data", JSON.stringify(this.messages))
      localStorage.setItem("social_conversations_data", JSON.stringify(this.conversations))
      localStorage.setItem("social_connections_data", JSON.stringify(this.platformConnections))
    } catch (error) {
      console.error("Error saving social media data:", error)
    }
  }

  private getDefaultMessages(): SocialMessage[] {
    return [
      {
        id: "1",
        platform: "instagram",
        senderId: "user123",
        senderName: "Emma Wilson",
        senderProfilePicture: AVATAR_PLACEHOLDER,
        message: "Hi! I'm interested in your dermal filler services. Can you provide more information?",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isRead: false,
        isReplied: false,
        attachments: [],
        conversationId: "conv_1",
        messageType: "text",
        isFromPage: false,
      },
      {
        id: "2",
        platform: "facebook",
        senderId: "user456",
        senderName: "Jessica Brown",
        senderProfilePicture: AVATAR_PLACEHOLDER,
        message: "What are your available time slots for next week?",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        isRead: true,
        isReplied: true,
        replyMessage: "Hi Jessica! We have availability on Tuesday and Thursday. Would you like to schedule a consultation?",
        replyTimestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        attachments: [],
        conversationId: "conv_2",
        messageType: "text",
        isFromPage: false,
      }
    ]
  }

  private getDefaultConversations(): SocialConversation[] {
    return [
      {
        id: "conv_1",
        platform: "instagram",
        participantId: "user123",
        participantName: "Emma Wilson",
        participantProfilePicture: AVATAR_PLACEHOLDER,
        lastMessage: "Hi! I'm interested in your dermal filler services. Can you provide more information?",
        lastMessageTimestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        unreadCount: 1,
        isActive: true,
        messages: [],
      },
      {
        id: "conv_2",
        platform: "facebook",
        participantId: "user456",
        participantName: "Jessica Brown",
        participantProfilePicture: AVATAR_PLACEHOLDER,
        lastMessage: "What are your available time slots for next week?",
        lastMessageTimestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        unreadCount: 0,
        isActive: true,
        messages: [],
      }
    ]
  }

  getAllMessages(): SocialMessage[] {
    if (!this.initialized) this.loadFromStorage()
    return [...this.messages]
  }

  getUnreadMessages(): SocialMessage[] {
    return this.messages.filter(msg => !msg.isRead)
  }

  markAsRead(id: string): boolean {
    const index = this.messages.findIndex(msg => msg.id === id)
    if (index === -1) return false

    this.messages[index].isRead = true
    this.saveToStorage()
    return true
  }

  replyToMessage(id: string, reply: string): boolean {
    const index = this.messages.findIndex(msg => msg.id === id)
    if (index === -1) return false

    this.messages[index].isReplied = true
    this.messages[index].replyMessage = reply
    this.messages[index].replyTimestamp = new Date().toISOString()
    this.saveToStorage()
    return true
  }

  // Conversation Management Methods
  getAllConversations(): SocialConversation[] {
    if (!this.initialized) this.loadFromStorage()
    return this.conversations.sort((a, b) => 
      new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime()
    )
  }

  getConversationsByPlatform(platform: "facebook" | "instagram"): SocialConversation[] {
    return this.getAllConversations().filter(conv => conv.platform === platform)
  }

  getConversationById(conversationId: string): SocialConversation | undefined {
    if (!this.initialized) this.loadFromStorage()
    return this.conversations.find(conv => conv.id === conversationId)
  }

  getMessagesByConversation(conversationId: string): SocialMessage[] {
    if (!this.initialized) this.loadFromStorage()
    return this.messages
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }

  sendMessageToConversation(conversationId: string, message: string): boolean {
    if (!this.initialized) this.loadFromStorage()
    
    const conversation = this.conversations.find(conv => conv.id === conversationId)
    if (!conversation) return false

    const newMessage: SocialMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      platform: conversation.platform,
      senderId: "page",
      senderName: "Skin Essentials by HER",
      senderProfilePicture: "/logo.png",
      message,
      timestamp: new Date().toISOString(),
      isRead: true,
      isReplied: false,
      attachments: [],
      conversationId,
      messageType: "text",
      isFromPage: true,
    }

    this.messages.push(newMessage)
    
    // Update conversation last message
    conversation.lastMessage = message
    conversation.lastMessageTimestamp = newMessage.timestamp
    
    this.saveToStorage()
    return true
  }

  markConversationAsRead(conversationId: string): boolean {
    if (!this.initialized) this.loadFromStorage()
    
    const conversation = this.conversations.find(conv => conv.id === conversationId)
    if (conversation) {
      conversation.unreadCount = 0
      
      // Mark all messages in conversation as read
      this.messages
        .filter(msg => msg.conversationId === conversationId && !msg.isFromPage)
        .forEach(msg => msg.isRead = true)
      
      this.saveToStorage()
      return true
    }
    return false
  }

  // Platform Connection Methods
  getPlatformConnections(): SocialPlatformConnection[] {
    if (!this.initialized) this.loadFromStorage()
    return this.platformConnections
  }

  addPlatformConnection(connection: Omit<SocialPlatformConnection, 'id'>): boolean {
    if (!this.initialized) this.loadFromStorage()
    
    const newConnection: SocialPlatformConnection = {
      ...connection,
      id: `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }
    
    this.platformConnections.push(newConnection)
    this.saveToStorage()
    return true
  }

  removePlatformConnection(connectionId: string): boolean {
    if (!this.initialized) this.loadFromStorage()
    
    const index = this.platformConnections.findIndex(conn => conn.id === connectionId)
    if (index !== -1) {
      this.platformConnections.splice(index, 1)
      this.saveToStorage()
      return true
    }
    return false
  }

  updateConnectionStatus(connectionId: string, isConnected: boolean): boolean {
    if (!this.initialized) this.loadFromStorage()
    
    const connection = this.platformConnections.find(conn => conn.id === connectionId)
    if (connection) {
      connection.isConnected = isConnected
      this.saveToStorage()
      return true
    }
    return false
  }

  // API Integration Methods
  async syncMessagesFromPlatform(platform: "facebook" | "instagram"): Promise<boolean> {
    try {
      if (!this.initialized) this.loadFromStorage()
      
      const connections = this.platformConnections.filter(conn => 
        conn.platform === platform && conn.isConnected
      )

      if (connections.length === 0) {
        console.log(`No connected ${platform} accounts found`)
        return false
      }

      for (const connection of connections) {
        if (platform === 'facebook') {
          await this.syncFacebookMessages(connection)
        } else if (platform === 'instagram') {
          await this.syncInstagramMessages(connection)
        }
      }

      this.saveToStorage()
      return true
    } catch (error) {
      console.error(`Error syncing ${platform} messages:`, error)
      return false
    }
  }

  private async refreshFacebookTokenIfNeeded(connection: SocialPlatformConnection): Promise<boolean> {
    try {
      // First validate the current token
      const tokenValidation = await facebookAPI.validateAccessToken(connection.accessToken);
      
      if (tokenValidation.isValid) {
        return true; // Token is still valid
      }

      console.log(`Attempting to refresh Facebook token for page: ${connection.pageName}`);
      
      // Try to refresh the token if it's expired
      if (tokenValidation.error?.includes('expired')) {
        const refreshResult = await facebookAPI.refreshLongLivedToken(connection.accessToken);
        
        if (refreshResult.accessToken) {
          // Update the connection with the new token
          connection.accessToken = refreshResult.accessToken;
          console.log(`Successfully refreshed Facebook token for page: ${connection.pageName}`);
          return true;
        } else {
          console.error(`Failed to refresh Facebook token for page ${connection.pageName}:`, refreshResult.error);
        }
      }

      // If we can't refresh, mark as disconnected
      connection.isConnected = false;
      console.error(`Facebook token refresh failed for page ${connection.pageName}, marking as disconnected`);
      return false;
    } catch (error) {
      console.error(`Error refreshing Facebook token for page ${connection.pageName}:`, error);
      connection.isConnected = false;
      return false;
    }
  }

  private async syncFacebookMessages(connection: SocialPlatformConnection): Promise<void> {
    try {
      console.log(`Starting Facebook message sync for page: ${connection.pageName} (${connection.pageId})`);
      
      // Validate and refresh token if needed
      const tokenIsValid = await this.refreshFacebookTokenIfNeeded(connection);
      if (!tokenIsValid) {
        throw new Error(`Invalid Facebook access token for page ${connection.pageName}. Please reconnect the page.`);
      }

      console.log(`Token validation successful for page: ${connection.pageName}`);
      
      const conversations = await facebookAPI.getPageConversations(connection.accessToken, connection.pageId)
      console.log(`Retrieved ${conversations.length} conversations for page: ${connection.pageName}`);
      
      for (const fbConversation of conversations) {
        // Convert Facebook conversation to our format
        const existingConversation = this.conversations.find(c => 
          c.id === fbConversation.id && c.platform === 'facebook'
        )

        if (!existingConversation) {
          // Create new conversation
          const newConversation: SocialConversation = {
            id: fbConversation.id,
            platform: 'facebook',
            participantId: fbConversation.participants.data[0]?.id || '',
            participantName: fbConversation.participants.data[0]?.name || 'Unknown',
            participantProfilePicture: undefined,
            lastMessage: '',
            lastMessageTimestamp: fbConversation.updated_time,
            unreadCount: fbConversation.unread_count || 0,
            isActive: fbConversation.can_reply,
            messages: [],
            pageId: connection.pageId,
            pageName: connection.pageName
          }
          this.conversations.push(newConversation)
          console.log(`Created new conversation: ${fbConversation.id} with ${newConversation.participantName}`);
        }

        try {
          // Fetch messages for this conversation
          const fbMessages = await facebookAPI.getConversationMessages(connection.accessToken, fbConversation.id)
          console.log(`Retrieved ${fbMessages.length} messages for conversation: ${fbConversation.id}`);
          
          for (const fbMessage of fbMessages) {
            const existingMessage = this.messages.find(m => m.id === fbMessage.id)
            
            if (!existingMessage) {
              const newMessage: SocialMessage = {
                id: fbMessage.id,
                platform: 'facebook',
                senderId: fbMessage.from.id,
                senderName: fbMessage.from.name,
                senderProfilePicture: undefined,
                message: fbMessage.message || '',
                timestamp: fbMessage.created_time,
                isRead: false,
                isReplied: false,
                attachments: fbMessage.attachments?.data.map(att => att.file_url) || [],
                conversationId: fbConversation.id,
                messageType: fbMessage.attachments?.data.length ? 'image' : 'text',
                isFromPage: fbMessage.from.id === connection.pageId
              }
              this.messages.push(newMessage)
            }
          }
        } catch (messageError) {
          console.error(`Error fetching messages for conversation ${fbConversation.id}:`, messageError);
          // Continue with other conversations even if one fails
        }
      }

      // Update last sync timestamp
      connection.lastSyncTimestamp = new Date().toISOString()
      console.log(`Facebook message sync completed successfully for page: ${connection.pageName}`);
    } catch (error) {
      console.error(`Error syncing Facebook messages for page ${connection.pageName}:`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        pageId: connection.pageId,
        pageName: connection.pageName,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  private async syncInstagramMessages(connection: SocialPlatformConnection): Promise<void> {
    try {
      // Get Instagram Business Account ID
      const igAccount = await instagramAPI.getInstagramBusinessAccount(connection.accessToken, connection.pageId)
      
      if (!igAccount) {
        console.log('No Instagram Business Account found for this page')
        return
      }

      const conversations = await instagramAPI.getConversations(connection.accessToken, igAccount.id)
      
      for (const igConversation of conversations) {
        // Convert Instagram conversation to our format
        const existingConversation = this.conversations.find(c => 
          c.id === igConversation.id && c.platform === 'instagram'
        )

        if (!existingConversation) {
          const newConversation: SocialConversation = {
            id: igConversation.id,
            platform: 'instagram',
            participantId: igConversation.participants[0]?.id || '',
            participantName: igConversation.participants[0]?.username || 'Unknown',
            participantProfilePicture: igConversation.participants[0]?.profile_picture_url,
            lastMessage: '',
            lastMessageTimestamp: igConversation.updated_time,
            unreadCount: igConversation.unread_count || 0,
            isActive: true,
            messages: [],
            pageId: connection.pageId,
            pageName: connection.pageName
          }
          this.conversations.push(newConversation)
        }

        // Fetch messages for this conversation
        const igMessages = await instagramAPI.getConversationMessages(connection.accessToken, igConversation.id)
        
        for (const igMessage of igMessages) {
          const existingMessage = this.messages.find(m => m.id === igMessage.id)
          
          if (!existingMessage) {
            const newMessage: SocialMessage = {
              id: igMessage.id,
              platform: 'instagram',
              senderId: igMessage.from.id,
              senderName: igMessage.from.username,
              senderProfilePicture: igMessage.from.profile_picture_url,
              message: igMessage.text || '',
              timestamp: igMessage.created_time,
              isRead: false,
              isReplied: false,
              attachments: igMessage.attachments?.map(att => att.url) || [],
              conversationId: igConversation.id,
              messageType: igMessage.attachments?.length ? 'image' : 'text',
              isFromPage: igMessage.from.id === igAccount.id
            }
            this.messages.push(newMessage)
          }
        }
      }

      // Update last sync timestamp
      connection.lastSyncTimestamp = new Date().toISOString()
    } catch (error) {
      console.error('Error syncing Instagram messages:', error)
      throw error
    }
  }

  /**
   * Public method to save data to storage (for webhook handlers)
   */
  public saveData(): void {
    this.saveToStorage()
  }

  /**
   * Public method to add a conversation (for webhook handlers)
   */
  public addConversation(conversation: SocialConversation): void {
    this.conversations.push(conversation)
    this.saveToStorage()
  }

  /**
   * Public method to add a message to a conversation (for webhook handlers)
   */
  public addMessageToConversation(conversationId: string, message: SocialMessage): void {
    const conversation = this.conversations.find(c => c.id === conversationId)
    if (conversation) {
      conversation.messages.push(message)
      conversation.lastMessage = message.message || 'Media message'
      conversation.lastMessageTimestamp = message.timestamp
      if (!message.isFromPage) {
        conversation.unreadCount += 1
      }
      this.saveToStorage()
    }
  }

  async sendMessageViaPlatform(conversationId: string, message: string, platform: "facebook" | "instagram"): Promise<boolean> {
    try {
      if (!this.initialized) this.loadFromStorage()
      
      const conversation = this.conversations.find(c => c.id === conversationId)
      if (!conversation) {
        console.error('Conversation not found')
        return false
      }

      const connection = this.platformConnections.find(c => 
        c.platform === platform && c.pageId === conversation.pageId && c.isConnected
      )
      
      if (!connection) {
        console.error(`No connected ${platform} account found for this conversation`)
        return false
      }

      let result
      if (platform === 'facebook') {
        result = await facebookAPI.sendMessage(connection.accessToken, conversation.participantId, message)
      } else if (platform === 'instagram') {
        result = await instagramAPI.sendMessage(connection.accessToken, conversation.participantId, message)
      } else {
        return false
      }

      if (result?.message_id) {
        // Add the sent message to our local storage
        const sentMessage: SocialMessage = {
          id: result.message_id,
          platform: platform,
          senderId: connection.pageId,
          senderName: connection.pageName,
          message: message,
          timestamp: new Date().toISOString(),
          isRead: true,
          isReplied: false,
          attachments: [],
          conversationId: conversationId,
          messageType: 'text',
          isFromPage: true
        }
        
        this.messages.push(sentMessage)
        
        // Update conversation
        const conv = this.conversations.find(c => c.id === conversationId)
        if (conv) {
          conv.lastMessage = message
          conv.lastMessageTimestamp = sentMessage.timestamp
          conv.messages.push(sentMessage)
        }
        
        this.saveToStorage()
        return true
      }

      return false
    } catch (error) {
      console.error(`Error sending message via ${platform}:`, error)
      return false
    }
  }
}

// Export service instances
export const appointmentService = new AppointmentService()
export const paymentService = new PaymentService()
export const medicalRecordService = new MedicalRecordService()
export const clientService = new ClientService()
export const socialMediaService = new SocialMediaService()
const AVATAR_PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" rx="8" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-family="Arial" font-size="12">IMG</text></svg>'