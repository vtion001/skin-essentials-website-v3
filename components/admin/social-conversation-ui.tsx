"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  MessageCircle, 
  Send, 
  Facebook, 
  Instagram, 
  RefreshCw, 
  Settings,
  Calendar,
  Plus,
  Search,
  MoreVertical,
  Check,
  CheckCheck
} from "lucide-react"
import { SocialMessage, SocialConversation, SocialPlatformConnection } from "@/lib/admin-services"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { FacebookConnection } from "@/components/admin/facebook-connection"

interface SocialConversationUIProps {
  socialMediaService: any
}

export function SocialConversationUI({ socialMediaService }: SocialConversationUIProps) {
  const DEFAULT_POLL_MS = 5000
  const [conversations, setConversations] = useState<SocialConversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<SocialConversation | null>(null)
  const [messages, setMessages] = useState<SocialMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [platformConnections, setPlatformConnections] = useState<SocialPlatformConnection[]>([])
  const [activeTab, setActiveTab] = useState<"all" | "facebook" | "instagram">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [showDetails, setShowDetails] = useState(false)
  const [brokenAvatars, setBrokenAvatars] = useState<Record<string, boolean>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const autoTimer = useRef<NodeJS.Timeout | null>(null)
  const convoTimer = useRef<NodeJS.Timeout | null>(null)
  const refreshing = useRef(false)
  const formatTimestamp = (iso: string) => {
    const d = new Date(iso)
    const now = Date.now()
    const diff = Math.floor((now - d.getTime()) / 1000)
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m`
    if (diff < 86400) return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(d)
    return new Intl.DateTimeFormat('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }).format(d)
  }

  const getPollMs = () => {
    try {
      const raw = localStorage.getItem('sm_poll_ms')
      const n = raw ? parseInt(raw, 10) : DEFAULT_POLL_MS
      if (!Number.isFinite(n)) return DEFAULT_POLL_MS
      return Math.min(60000, Math.max(5000, n))
    } catch {
      return DEFAULT_POLL_MS
    }
  }

  useEffect(() => {
    loadConversations()
    loadPlatformConnections()
    setTimeout(() => { handleRefresh().catch(() => {}) }, 0)
    const onStorage = (e: StorageEvent) => {
      if (
        e.key === 'social_connections_data' ||
        e.key === 'facebook_connection' ||
        e.key === 'social_conversations_data' ||
        e.key === 'social_messages_data'
      ) {
        console.log('[SM_UI] storage change detected, reloading')
        loadPlatformConnections()
        loadConversations()
        if (selectedConversation) loadMessages(selectedConversation.id)
      }
    }
    window.addEventListener('storage', onStorage)
    const interval = setInterval(() => {
      loadPlatformConnections()
    }, 10000)
    const onVisible = () => { if (document.visibilityState === 'visible') handleRefresh().catch(() => {}) }
    const onFocus = () => handleRefresh().catch(() => {})
    const onOnline = () => handleRefresh().catch(() => {})
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onFocus)
    window.addEventListener('online', onOnline)
    return () => {
      window.removeEventListener('storage', onStorage)
      clearInterval(interval)
      if (autoTimer.current) clearInterval(autoTimer.current)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('online', onOnline)
    }
  }, [])

  useEffect(() => {
    if (autoTimer.current) {
      clearInterval(autoTimer.current)
      autoTimer.current = null
    }
    const pollMs = activeTab === 'facebook' ? 2000 : getPollMs()
    autoTimer.current = setInterval(async () => {
      if (refreshing.current) return
      if (document.visibilityState !== 'visible') return
      try {
        refreshing.current = true
        if (activeTab === 'facebook' || activeTab === 'all') {
          await socialMediaService.syncMessagesFromPlatform('facebook')
        }
        if (activeTab === 'instagram' || activeTab === 'all') {
          await socialMediaService.syncMessagesFromPlatform('instagram')
        }
        loadConversations()
        if (selectedConversation) loadMessages(selectedConversation.id)
      } finally {
        refreshing.current = false
      }
    }, pollMs)
    return () => { if (autoTimer.current) { clearInterval(autoTimer.current); autoTimer.current = null } }
  }, [activeTab])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id)
      if (convoTimer.current) clearInterval(convoTimer.current)
      const intervalMs = selectedConversation.platform === 'facebook' ? 1000 : 3000
      convoTimer.current = setInterval(async () => {
        const platform = selectedConversation.platform
        await socialMediaService.syncMessagesFromPlatform(platform)
        loadMessages(selectedConversation.id)
      }, intervalMs)
    } else {
      if (convoTimer.current) { clearInterval(convoTimer.current); convoTimer.current = null }
    }
    return () => { if (convoTimer.current) { clearInterval(convoTimer.current); convoTimer.current = null } }
  }, [selectedConversation])

  useEffect(() => {
    handleRefresh().catch(() => {})
  }, [activeTab])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadConversations = () => {
    const allConversations = socialMediaService.getAllConversations()
    setConversations(allConversations)
    console.log('[SM_UI] conversations loaded', allConversations.length)
    if (initialLoading) setTimeout(() => setInitialLoading(false), 300)
  }

  const loadMessages = (conversationId: string) => {
    const conversationMessages = socialMediaService.getMessagesByConversation(conversationId)
    setMessages(conversationMessages)
    console.log('[SM_UI] messages loaded', conversationId, conversationMessages.length)
  }

  const loadPlatformConnections = () => {
    const connections = socialMediaService.getPlatformConnections()
    setPlatformConnections(connections)
    console.log('[SM_UI] platform connections', connections.length)
  }

  const connectFacebook = async () => {
    try {
      const res = await fetch('/api/auth/facebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_login_url' })
      })
      const data = await res.json()
      if (data.loginUrl) window.location.href = data.loginUrl
    } catch {}
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    setIsLoading(true)
    try {
      const success = await socialMediaService.sendMessageViaPlatform(
        selectedConversation.id,
        newMessage,
        selectedConversation.platform
      )
      
      if (success) {
        setNewMessage("")
        loadMessages(selectedConversation.id)
        loadConversations()
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBookAppointment = () => {
    if (!selectedConversation) return
    try {
      const msgs = socialMediaService.getMessagesByConversation(selectedConversation.id) as SocialMessage[]
      const text = msgs.map(m => m.message).join(' ')
      const emailMatch = text.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/)
      const phoneMatch = text.match(/\+?\d[\d\s-]{6,}/)
      const name = selectedConversation.participantName
      const draft = {
        clientName: name,
        clientEmail: emailMatch ? emailMatch[0] : '',
        clientPhone: phoneMatch ? phoneMatch[0].replace(/\s+/g, '') : '',
        service: '',
        date: '',
        time: '',
        duration: 60,
        price: 0
      }
      localStorage.setItem('appointment_draft', JSON.stringify(draft))
      localStorage.setItem('appointment_conversation_id', selectedConversation.id)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('book_appointment'))
      }
    } catch {}
  }

  const handleConversationSelect = (conversation: SocialConversation) => {
    setSelectedConversation(conversation)
    socialMediaService.markConversationAsRead(conversation.id)
    loadConversations()
  }

  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      if (activeTab === "facebook" || activeTab === "all") {
        await socialMediaService.syncMessagesFromPlatform("facebook")
      }
      if (activeTab === "instagram" || activeTab === "all") {
        await socialMediaService.syncMessagesFromPlatform("instagram")
      }
      loadConversations()
      if (selectedConversation) {
        loadMessages(selectedConversation.id)
      }
    } catch (error) {
      console.error("Error refreshing messages:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredConversations = conversations.filter(conv => {
    const matchesTab = activeTab === "all" || conv.platform === activeTab
    const matchesSearch = searchQuery === "" || 
      conv.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    const isActivePage = conv.pageId
      ? platformConnections.some((c) => c.platform === conv.platform && c.pageId === conv.pageId && c.isConnected)
      : true
    return matchesTab && matchesSearch && isActivePage
  })

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      return "Just now"
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getPlatformIcon = (platform: string) => {
    return platform === "facebook" ? <Facebook className="h-4 w-4" /> : <Instagram className="h-4 w-4" />
  }

  const getPlatformColor = (platform: string) => {
    return platform === "facebook" ? "bg-blue-500" : "bg-pink-500"
  }

  const avatarUrlFor = (_id: string, provided?: string) => {
    return provided || ''
  }

  return (
    <div className="flex flex-col lg:flex-row w-full max-w-full h-[68vh] sm:h-[72vh] lg:h-[74vh] xl:h-[78vh] border rounded-xl overflow-hidden bg-gradient-to-br from-white to-white/60 shadow-sm">
      <div className="hidden sm:flex w-14 bg-white/80 backdrop-blur-sm border-r flex-col items-center gap-4 py-4">
        <div className="h-10 w-10 rounded-full bg-gray-100 grid place-items-center">
          <MessageCircle className="h-5 w-5 text-gray-700" />
        </div>
        <div className="h-10 w-10 rounded-full bg-gray-100 grid place-items-center">
          <Facebook className="h-5 w-5 text-blue-600" />
        </div>
        <div className="h-10 w-10 rounded-full bg-gray-100 grid place-items-center">
          <Instagram className="h-5 w-5 text-pink-500" />
        </div>
      </div>
      {/* Conversations Sidebar */}
      <div className="w-full lg:w-[360px] xl:w-[400px] lg:shrink-0 border-r bg-white/70 backdrop-blur-sm flex flex-col min-w-0 h-full">
        <div className="p-3 sm:p-4 border-b bg-white/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg tracking-tight">Conversations</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
              {platformConnections.filter((c) => c.platform === 'facebook').length === 0 && (
                <Button variant="outline" size="sm" onClick={connectFacebook}>
                  <Facebook className="h-4 w-4 mr-1" /> Connect
                </Button>
              )}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Channel Settings</DialogTitle>
                    <DialogDescription>Manage connected pages and visibility.</DialogDescription>
                  </DialogHeader>
                  <FacebookConnection />
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <div className="relative mb-3 sm:mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 sm:h-9"
              aria-label="Search conversations"
            />
          </div>
          
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="facebook">
                <Facebook className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="instagram">
                <Instagram className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0" role="list" aria-label="Conversation list">
          <div className="p-2">
            {initialLoading && filteredConversations.length === 0 ? (
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse p-3 rounded-lg bg-gray-100" />
                ))}
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                  selectedConversation?.id === conversation.id
                    ? "bg-blue-50 border border-blue-200"
                    : "bg-white hover:bg-gray-100"
                  }`}
                  onClick={() => handleConversationSelect(conversation)}
                  role="listitem"
                  aria-label={`${conversation.participantName} ${conversation.unreadCount ? 'unread ' + conversation.unreadCount : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden ring-2 ring-blue-100">
                        {!brokenAvatars[conversation.participantId] && avatarUrlFor(conversation.participantId, conversation.participantProfilePicture) ? (
                          <img 
                            src={avatarUrlFor(conversation.participantId, conversation.participantProfilePicture)} 
                            alt={`${conversation.participantName} avatar`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            onError={() => setBrokenAvatars(prev => ({ ...prev, [conversation.participantId]: true }))}
                          />
                        ) : (
                          <span className="text-sm font-semibold text-gray-700">
                            {conversation.participantName.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full ${getPlatformColor(conversation.platform)} flex items-center justify-center shadow-sm`}
                        aria-hidden="true">
                        {getPlatformIcon(conversation.platform)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm truncate">
                          {conversation.participantName}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {formatTime(conversation.lastMessageTimestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 truncate mt-1">
                        {conversation.lastMessage}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <Badge variant="destructive" className="mt-2 text-xs">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="w-full lg:flex-1 min-w-0 flex flex-col bg-white/70 backdrop-blur-sm h-full">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-3 sm:p-4 border-b bg-white/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden ring-2 ring-blue-100">
                      {!brokenAvatars[selectedConversation.participantId] && avatarUrlFor(selectedConversation.participantId, selectedConversation.participantProfilePicture) ? (
                        <img 
                          src={avatarUrlFor(selectedConversation.participantId, selectedConversation.participantProfilePicture)} 
                          alt={`${selectedConversation.participantName} avatar`}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          onError={() => setBrokenAvatars(prev => ({ ...prev, [selectedConversation.participantId]: true }))}
                        />
                      ) : (
                        <span className="text-sm font-semibold text-gray-700">
                          {selectedConversation.participantName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full ${getPlatformColor(selectedConversation.platform)} flex items-center justify-center shadow-sm`}
                      aria-hidden="true">
                      {getPlatformIcon(selectedConversation.platform)}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold tracking-tight">{selectedConversation.participantName}</h3>
                    <p className="text-sm text-gray-500 capitalize">{selectedConversation.platform}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowDetails(v => !v)}>
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" aria-label="Book appointment" onClick={handleBookAppointment}>
                    <Calendar className="h-4 w-4" />
                  </Button>
                  {selectedConversation && (
                    <Button
                      variant="outline"
                      size="sm"
                          onClick={() => {
                            try {
                              socialMediaService.createPotentialClientDraft(selectedConversation.id)
                              if (typeof window !== 'undefined') {
                                window.dispatchEvent(new CustomEvent('capture_client'))
                              }
                            } catch {}
                          }}
                      >
                        Capture Client
                      </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-3 sm:p-4 overflow-y-auto min-h-0" aria-live="polite" role="list">
              <div className="space-y-2 sm:space-y-3">
                {messages.map((message, idx) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isFromPage ? "justify-end" : "justify-start"}`}
                    role="listitem"
                  >
                    <div
                      className={`max-w-[60%] sm:max-w-[55%] lg:max-w-[45%] xl:max-w-[40%] break-words rounded-lg p-3 ${
                        message.isFromPage
                          ? "bg-blue-500 text-white motion-safe:transition-all motion-safe:hover:brightness-105"
                          : "bg-gray-100 text-gray-900 motion-safe:transition-all motion-safe:hover:shadow-sm"
                      }`}
                    >
                      <p className="text-sm leading-snug">{message.message || (message.messageType === 'image' ? 'Media message' : '')}</p>
                      {idx === 0 || new Date(message.timestamp).toDateString() !== new Date(messages[idx - 1].timestamp).toDateString() ? (
                        <div className="text-center text-xs text-gray-500 mt-2">
                          {new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date(message.timestamp))}
                        </div>
                      ) : null}
                      <div className={`flex items-center gap-1 mt-1 ${
                        message.isFromPage ? "justify-end" : "justify-start"
                      }`}>
                        <span className={`text-xs ${
                          message.isFromPage ? "text-blue-100" : "text-gray-500"
                        }`}>
                          {formatTimestamp(message.timestamp)}
                        </span>
                        {message.isFromPage && (
                          <div className="text-blue-100">
                            {message.isRead ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <div className="p-3 sm:p-4 border-t bg-white/80">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  disabled={isLoading}
                  aria-label="Message input"
                  className="h-10 sm:h-9"
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!newMessage.trim() || isLoading}
                  className="motion-safe:transition-all motion-safe:hover:scale-[1.02] min-h-10 sm:min-h-9"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-500">
                Choose a conversation from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
      <div className={`${showDetails ? 'hidden xl:block' : 'hidden'} w-full xl:w-80 xl:shrink-0 bg-white/80 backdrop-blur-sm border-l p-3 sm:p-4 space-y-4`}>
        <div className="flex items-center justify-between">
          <h4 className="font-semibold">Chat details</h4>
          <Button variant="outline" size="sm" onClick={() => setShowDetails(false)}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
        {selectedConversation && typeof window !== 'undefined' && localStorage.getItem('potential_conversation_id') === selectedConversation.id && (
          <div className="p-2 rounded-md bg-yellow-50 text-yellow-800 text-sm">Capturing potential client info</div>
        )}
        <div className="space-y-2">
          <div className="font-medium text-sm">Shared media</div>
          <div className="grid grid-cols-4 gap-2">
            {messages
              .flatMap(m => m.attachments)
              .filter(Boolean)
              .slice(0,8)
              .map((url, i) => (
                <div key={`${url}-${i}`} className="aspect-square rounded-md overflow-hidden">
                  <img src={url as string} alt="media" className="w-full h-full object-cover" loading="lazy" />
                </div>
              ))}
          </div>
        </div>
        <div className="space-y-2">
          <div className="font-medium text-sm">Shared files</div>
          <div className="space-y-1">
            {messages.filter(m => m.attachments.length > 0).slice(0,4).map((m) => (
              <div key={m.id} className="flex items-center justify-between text-sm">
                <div className="truncate max-w-[240px]">{m.attachments[0]}</div>
                <span className="text-gray-500 text-xs">{formatTime(m.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
