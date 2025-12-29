"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Loader2, Trash2, CalendarClock, RefreshCw } from "lucide-react"
import { format } from "date-fns"

interface ScheduledMessage {
    id: number
    phone_number: string
    message: string
    scheduled_at: string // ISO string
    status: string
    created_at: string
}

export function ScheduledSmsList() {
    const [messages, setMessages] = useState<ScheduledMessage[]>([])
    const [loading, setLoading] = useState(false)
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [error, setError] = useState<string | null>(null)

    const fetchMessages = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/admin/sms/scheduled')
            const j = await res.json()
            if (j.ok) {
                // sort by scheduled_at asc
                const sorted = (j.data || []).sort((a: any, b: any) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
                setMessages(sorted)
            } else {
                // If API fails (e.g. endpoint doesn't exist), we handle gracefully
                setError("Could not fetch scheduled messages. Provider might not support listing.")
            }
        } catch (e) {
            setError("Failed to load messages.")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to cancel this scheduled message?")) return
        setDeletingId(id)
        try {
            const res = await fetch(`/api/admin/sms/scheduled?id=${id}`, { method: 'DELETE' })
            const j = await res.json()
            if (j.ok) {
                setMessages(prev => prev.filter(m => m.id !== id))
            } else {
                alert("Failed to delete: " + JSON.stringify(j.error))
            }
        } catch {
            alert("Failed to delete message")
        } finally {
            setDeletingId(null)
        }
    }

    useEffect(() => {
        fetchMessages()
    }, [])

    return (
        <Card className="border-white/60 bg-white/70 backdrop-blur-xl shadow-xl rounded-3xl mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <CalendarClock className="w-5 h-5 text-indigo-600" />
                    Scheduled Reminders
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={fetchMessages} disabled={loading}>
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
            </CardHeader>
            <CardContent>
                {error ? (
                    <div className="text-sm text-red-500 bg-red-50 p-4 rounded-xl border border-red-100">
                        {error}
                    </div>
                ) : (
                    <ScrollArea className="h-[300px] pr-4">
                        {loading && messages.length === 0 ? (
                            <div className="flex justify-center p-8">
                                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                            </div>
                        ) : messages.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-8">No scheduled messages found.</p>
                        ) : (
                            <div className="space-y-3">
                                {messages.map((msg) => (
                                    <div key={msg.id} className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col gap-2 relative group hover:shadow-md transition-all">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-100">
                                                        {format(new Date(msg.scheduled_at), 'MMM d, yyyy h:mm a')}
                                                    </Badge>
                                                    <span className={`text-[10px] uppercase font-bold tracking-wider ${msg.status === 'scheduled' ? 'text-emerald-600' : 'text-gray-500'
                                                        }`}>
                                                        {msg.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-semibold text-gray-900">{msg.phone_number}</p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleDelete(msg.id)}
                                                disabled={deletingId === msg.id}
                                            >
                                                {deletingId === msg.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                            </Button>
                                        </div>
                                        <p className="text-xs text-gray-600 line-clamp-2 bg-gray-50 p-2 rounded-lg">
                                            {msg.message}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    )
}
