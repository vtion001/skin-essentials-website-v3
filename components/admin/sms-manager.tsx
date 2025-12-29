"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, Settings, Clock, FileText, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { SmsAnalytics } from "./sms-analytics"
import { ScheduledSmsList } from "./scheduled-sms-list"

interface SmsStatus {
    configured: boolean
    sender?: string
    provider?: string
    status?: string
    balance?: string
}

interface SmsManagerProps {
    smsStatus: SmsStatus | null
    refreshSmsStatus: () => void
    showNotification: (type: "success" | "error", message: string) => void
}

const SMS_TEMPLATES = {
    "reminder": "Hello {name}, this is a gentle reminder for your appointment with Skin Essentials on {date} at {time}. See you soon!",
    "followup": "Hi {name}, checking in on your results! How is your skin feeling after the treatment? Let us know if you have any questions.",
    "promo": "Hi {name}! We have a special offer just for you. Visit us this week to get 10% off your next treatment.",
    "confirm": "Hi {name}, your appointment on {date} at {time} is confirmed. Reply YES to acknowledge."
}

export function SmsManager({ smsStatus, refreshSmsStatus, showNotification }: SmsManagerProps) {
    const [smsForm, setSmsForm] = useState<{ to: string; message: string }>({ to: '', message: '' })
    const [reminderConfig, setReminderConfig] = useState({
        dayBefore: true,
        threeHoursBefore: true,
        oneHourBefore: false
    })
    const [scanLogs, setScanLogs] = useState<string[]>([])
    const [isScanning, setIsScanning] = useState(false)
    const [showScanLogs, setShowScanLogs] = useState(false)

    return (
        <div className="space-y-6">
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
                            <Input value={smsStatus?.sender || 'SEMAPHORE'} disabled />
                            <p className="text-xs text-gray-500 mt-2">Uses {smsStatus?.provider || 'Semaphore'} SMS provider</p>
                        </div>
                        <div>
                            <Label>Status</Label>
                            <div className="flex items-center gap-3">
                                <Badge className={smsStatus?.configured ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                                    {smsStatus?.status || (smsStatus?.configured ? 'Active' : 'Not Configured')}
                                </Badge>
                                {smsStatus?.balance && (
                                    <Badge variant="outline" className="text-gray-600">
                                        Credits: {smsStatus.balance}
                                    </Badge>
                                )}
                                <Button variant="secondary" onClick={refreshSmsStatus}>Refresh</Button>
                            </div>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <Label>Recipient Phone</Label>
                            <Input
                                value={smsForm.to}
                                onChange={(e) => setSmsForm(prev => ({ ...prev, to: e.target.value }))}
                                placeholder="e.g. +63XXXXXXXXXX"
                            />
                        </div>
                        <div className="space-y-3 md:col-span-1">
                            <div className="flex justify-between items-center mb-2">
                                <Label>Message</Label>
                                <Select onValueChange={(val) => setSmsForm(prev => ({ ...prev, message: SMS_TEMPLATES[val as keyof typeof SMS_TEMPLATES] || '' }))}>
                                    <SelectTrigger className="h-7 w-[130px] text-xs">
                                        <SelectValue placeholder="Use Template" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="reminder">Reminder</SelectItem>
                                        <SelectItem value="followup">Follow-up</SelectItem>
                                        <SelectItem value="promo">Promo</SelectItem>
                                        <SelectItem value="confirm">Confirmation</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Textarea
                                value={smsForm.message}
                                onChange={(e) => setSmsForm(prev => ({ ...prev, message: e.target.value }))}
                                placeholder="Type your message"
                                className="min-h-[100px]"
                            />
                            {smsForm.message && (
                                <div className="mt-2 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground border border-border/50">
                                    <span className="font-semibold block mb-1">Preview:</span>
                                    {smsForm.message
                                        .replace(/{name}/g, "Juan Dela Cruz")
                                        .replace(/{date}/g, new Date().toLocaleDateString())
                                        .replace(/{time}/g, "10:00 AM")
                                        .replace(/{service}/g, "Facial Treatment")
                                    }
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            onClick={async () => {
                                console.log('Sending SMS...', { to: smsForm.to, message: smsForm.message })
                                try {
                                    const to = String(smsForm.to || '').trim()
                                    const message = String(smsForm.message || '').trim()

                                    if (!to || !message) {
                                        console.log('Missing to or message')
                                        showNotification('error', 'Please enter phone and message');
                                        return
                                    }

                                    const res = await fetch('/api/sms', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ to, message })
                                    })

                                    const j = await res.json()
                                    console.log('SMS Response:', j)
                                    showNotification(j?.ok ? 'success' : 'error', j?.ok ? 'SMS sent' : (j?.error || 'Failed to send'))
                                } catch (e) {
                                    console.error('SMS Send Error:', e)
                                    showNotification('error', 'Failed to send')
                                }
                            }}
                            className="bg-[#0F2922] hover:bg-[#0F2922]/90 text-white shadow-2xl shadow-[#0F2922]/30 hover:shadow-[#0F2922]/40 transition-all duration-300 hover:scale-105 font-bold px-6 py-3 rounded-2xl"
                        >
                            Send SMS
                        </Button>
                        <Button
                            type="button"
                            disabled={isScanning}
                            onClick={async () => {
                                setIsScanning(true)
                                try {
                                    const res = await fetch('/api/automation/sms-reminders', {
                                        method: 'POST',
                                        headers: {
                                            'x-automation-secret': String(process.env.NEXT_PUBLIC_SMS_AUTOMATION_SECRET || ''),
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({ config: reminderConfig })
                                    })
                                    const j = await res.json()

                                    if (j.logs && Array.isArray(j.logs)) {
                                        setScanLogs(j.logs)
                                        setShowScanLogs(true)
                                    }

                                    showNotification(j?.ok ? 'success' : 'error', j?.ok ? `Reminders sent: ${j?.sent || 0}` : (j?.error || 'Failed to run'))
                                } catch {
                                    showNotification('error', 'Failed to run automation')
                                } finally {
                                    setIsScanning(false)
                                }
                            }}
                            variant="outline"
                        >
                            {isScanning ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {isScanning ? 'Scanning...' : 'Run Reminder Scan'}
                        </Button>
                    </div>

                    {/* Automation Configuration */}
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2 mb-4">
                            <Settings className="w-4 h-4 text-gray-500" />
                            <h4 className="text-sm font-semibold text-gray-700">Automation Configuration</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center justify-between p-3 rounded-lg border bg-gray-50/50">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-indigo-500" />
                                    <Label className="text-sm cursor-pointer" htmlFor="conf-24h">24 Hours Before</Label>
                                </div>
                                <Switch
                                    id="conf-24h"
                                    checked={reminderConfig.dayBefore}
                                    onCheckedChange={(c) => setReminderConfig(prev => ({ ...prev, dayBefore: c }))}
                                />
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg border bg-gray-50/50">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-indigo-500" />
                                    <Label className="text-sm cursor-pointer" htmlFor="conf-3h">3 Hours Before</Label>
                                </div>
                                <Switch
                                    id="conf-3h"
                                    checked={reminderConfig.threeHoursBefore}
                                    onCheckedChange={(c) => setReminderConfig(prev => ({ ...prev, threeHoursBefore: c }))}
                                />
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg border bg-gray-50/50">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-indigo-500" />
                                    <Label className="text-sm cursor-pointer" htmlFor="conf-1h">1 Hour Before</Label>
                                </div>
                                <Switch
                                    id="conf-1h"
                                    checked={reminderConfig.oneHourBefore}
                                    onCheckedChange={(c) => setReminderConfig(prev => ({ ...prev, oneHourBefore: c }))}
                                />
                            </div>
                        </div>
                    </div>

                    <Dialog open={showScanLogs} onOpenChange={setShowScanLogs}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Reminder Scan Results</DialogTitle>
                                <DialogDescription>
                                    Details of the appointment scan and reminder operations.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="mt-4 max-h-[300px] overflow-y-auto space-y-1 p-4 bg-muted/50 rounded-lg text-xs font-mono border">
                                {scanLogs.length === 0 ? (
                                    <p className="text-muted-foreground">No logs available.</p>
                                ) : (
                                    scanLogs.map((log, i) => (
                                        <div key={i} className={log.includes("->") ? "ml-4 text-emerald-600 font-bold" : "text-gray-600"}>
                                            {log}
                                        </div>
                                    ))
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>
            <SmsAnalytics />
            <ScheduledSmsList />
        </div >
    )
}
