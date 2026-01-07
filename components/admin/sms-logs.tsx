"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FileText, RefreshCw, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

interface SmsLogEntry {
    id: number
    message: string
    context: string
    created_at: string
    meta: {
        phone: string
        status?: string
        response?: any
    }
}

export function SmsLogs() {
    const [logs, setLogs] = useState<SmsLogEntry[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const fetchLogs = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/admin/sms/logs')
            const data = await res.json()
            if (data.logs) {
                setLogs(data.logs)
            }
        } catch (error) {
            console.error("Failed to fetch SMS logs", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchLogs()
    }, [])

    return (
        <Card className="border-white/60 bg-white/70 backdrop-blur-xl shadow-xl rounded-3xl mt-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    SMS Activity Logs
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={fetchLogs} disabled={isLoading}>
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
            </CardHeader>
            <CardContent>
                <div className="rounded-2xl border border-gray-100 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow>
                                <TableHead className="w-[180px]">Timestamp</TableHead>
                                <TableHead className="w-[140px]">Recipient</TableHead>
                                <TableHead>Message</TableHead>
                                <TableHead className="w-[100px]">Context</TableHead>
                                <TableHead className="w-[100px] text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        No SMS logs found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.map((log) => (
                                    <TableRow key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                        <TableCell className="text-xs text-gray-500 font-medium">
                                            {format(new Date(log.created_at), "MMM d, yyyy h:mm a")}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                                                    <Smartphone className="w-3 h-3 text-emerald-600" />
                                                </div>
                                                <span className="text-xs font-mono text-gray-700">{log.meta?.phone || "Unknown"}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <p className="text-xs text-gray-600 line-clamp-2 max-w-[400px]" title={log.message}>
                                                {log.message}
                                            </p>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-[10px] uppercase font-bold text-gray-500 border-gray-200">
                                                {log.context.replace('sms_', '')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge 
                                                className={`text-[10px] uppercase font-bold border-none px-2 ${
                                                    log.meta?.status === 'success' || !log.meta?.status 
                                                    ? 'bg-emerald-100 text-emerald-700' 
                                                    : 'bg-red-100 text-red-700'
                                                }`}
                                            >
                                                {log.meta?.status || 'Sent'}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
