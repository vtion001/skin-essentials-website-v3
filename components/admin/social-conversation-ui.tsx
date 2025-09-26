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
  Plus,
  Search,
  MoreVertical,
  Check,
  CheckCheck
} from "lucide-react"
import { SocialMessage, SocialConversation, SocialPlatformConnection } from "@/lib/admin-services"

interface SocialConversationUIProps {
  socialMediaService: any
}

export function SocialConversationUI({ socialMediaService }: SocialConversationUIProps) {
  const [conversations, setConversations] = useState<SocialConversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<SocialConversation | null>(null)
  const [messages, setMessages] = useState<SocialMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [platformConnections, setPlatformConnections] = useState<SocialPlatformConnection[]>([])
  const [activeTab, setActiveTab] = useState<"all" | "facebook" | "instagram">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadConversations()
    loadPlatformConnections()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id)
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadConversations = () => {
    const allConversations = socialMediaService.getAllConversations()
    setConversations(allConversations)
  }

  const loadMessages = (conversationId: string) => {
    const conversationMessages = socialMediaService.getMessagesByConversation(conversationId)
    setMessages(conversationMessages)
  }

  const loadPlatformConnections = () => {
    const connections = socialMediaService.getPlatformConnections()
    setPlatformConnections(connections)
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
    return matchesTab && matchesSearch
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

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden">
      {/* Conversations Sidebar */}
      <div className="w-1/3 border-r bg-gray-50">
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Conversations</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
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

        <div className="h-[calc(100%-200px)] overflow-y-auto">
          <div className="p-2">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                  selectedConversation?.id === conversation.id
                    ? "bg-blue-100 border-blue-200"
                    : "bg-white hover:bg-gray-100"
                }`}
                onClick={() => handleConversationSelect(conversation)}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {conversation.participantProfilePicture ? (
                        <img 
                          src={conversation.participantProfilePicture} 
                          alt={conversation.participantName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-600">
                          {conversation.participantName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full ${getPlatformColor(conversation.platform)} flex items-center justify-center`}>
                      {getPlatformIcon(conversation.platform)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm truncate">
                        {conversation.participantName}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {formatTime(conversation.lastMessageTimestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate mt-1">
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
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {selectedConversation.participantProfilePicture ? (
                        <img 
                          src={selectedConversation.participantProfilePicture} 
                          alt={selectedConversation.participantName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-600">
                          {selectedConversation.participantName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full ${getPlatformColor(selectedConversation.platform)} flex items-center justify-center`}>
                      {getPlatformIcon(selectedConversation.platform)}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedConversation.participantName}</h3>
                    <p className="text-sm text-gray-500 capitalize">{selectedConversation.platform}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isFromPage ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.isFromPage
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <div className={`flex items-center gap-1 mt-1 ${
                        message.isFromPage ? "justify-end" : "justify-start"
                      }`}>
                        <span className={`text-xs ${
                          message.isFromPage ? "text-blue-100" : "text-gray-500"
                        }`}>
                          {formatTime(message.timestamp)}
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
            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  disabled={isLoading}
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!newMessage.trim() || isLoading}
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
    </div>
  )
}