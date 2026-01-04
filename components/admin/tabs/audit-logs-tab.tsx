"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, RefreshCw, Shield, AlertCircle, CheckCircle } from "lucide-react"
import { format } from "date-fns"

interface AuditLog {
    id: string
    timestamp: string
    user_id: string
    action: string
    resource: string
    resource_id?: string
    status: string
    details?: any
    ip_address?: string
}

export function AuditLogsTab() {
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    const fetchLogs = async () => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/admin/audit-logs?limit=100')
            const data = await response.json()
            if (data.logs) {
                setLogs(data.logs)
            }
        } catch (error) {
            console.error("Failed to fetch audit logs", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchLogs()
    }, [])

    const filteredLogs = logs.filter(log =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.resource_id && log.resource_id.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'SUCCESS':
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-2 py-0.5 rounded-full text-[10px] font-bold"><CheckCircle className="w-3 h-3 mr-1" /> SUCCESS</Badge>
            case 'FAILURE':
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none px-2 py-0.5 rounded-full text-[10px] font-bold"><AlertCircle className="w-3 h-3 mr-1" /> FAILURE</Badge>
            default:
                return <Badge variant="outline" className="text-[10px] font-bold px-2 py-0.5 rounded-full">{status}</Badge>
        }
    }

    const getActionColor = (action: string) => {
        switch (action) {
            case 'CREATE': return 'text-blue-600';
            case 'UPDATE': return 'text-amber-600';
            case 'DELETE': return 'text-red-600';
            case 'READ': return 'text-slate-600';
            case 'LOGIN': return 'text-purple-600';
            default: return 'text-slate-600';
        }
    }

    return (
        <div className="space-y-6">
            <Card className="border-[#0F2922]/10 shadow-xl bg-white/50 backdrop-blur-md rounded-3xl overflow-hidden">
                <CardHeader className="border-b border-[#0F2922]/5 bg-white/30 px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-[#0F2922] flex items-center justify-center shadow-lg transform -rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                <Shield className="w-6 h-6 text-[#E2D1C3]" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold text-[#0F2922]">HIPAA Audit Trail</CardTitle>
                                <p className="text-sm text-[#0F2922]/60">Comprehensive log of Protected Health Information (PHI) access</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0F2922]/30" />
                                <Input
                                    placeholder="Filter by action, resource, user..."
                                    className="pl-10 h-10 rounded-full border-[#0F2922]/10 bg-white/50 focus:bg-white transition-all text-xs"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={fetchLogs}
                                className="rounded-full border-[#0F2922]/10 hover:bg-[#0F2922]/5"
                                disabled={isLoading}
                            >
                                <RefreshCw className={`w-4 h-4 text-[#0F2922]/60 ${isLoading ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-[#0F2922]/5">
                                <TableRow className="hover:bg-transparent border-[#0F2922]/5">
                                    <TableHead className="py-4 px-8 text-[10px] font-bold uppercase tracking-widest text-[#0F2922]/40">Timestamp</TableHead>
                                    <TableHead className="py-4 text-[10px] font-bold uppercase tracking-widest text-[#0F2922]/40">User</TableHead>
                                    <TableHead className="py-4 text-[10px] font-bold uppercase tracking-widest text-[#0F2922]/40">Action</TableHead>
                                    <TableHead className="py-4 text-[10px] font-bold uppercase tracking-widest text-[#0F2922]/40">Resource</TableHead>
                                    <TableHead className="py-4 text-[10px] font-bold uppercase tracking-widest text-[#0F2922]/40">ID</TableHead>
                                    <TableHead className="py-4 text-[10px] font-bold uppercase tracking-widest text-[#0F2922]/40">Status</TableHead>
                                    <TableHead className="py-4 pr-8 text-[10px] font-bold uppercase tracking-widest text-[#0F2922]/40 text-right">IP Address</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLogs.length > 0 ? (
                                    filteredLogs.map((log) => (
                                        <TableRow key={log.id} className="group hover:bg-[#0F2922]/[0.02] border-[#0F2922]/5 transition-colors">
                                            <TableCell className="py-4 px-8">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-semibold text-[#0F2922]">
                                                        {format(new Date(log.timestamp), 'MMM dd, yyyy')}
                                                    </span>
                                                    <span className="text-[10px] text-[#0F2922]/40">
                                                        {format(new Date(log.timestamp), 'HH:mm:ss')}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <code className="text-[10px] bg-[#0F2922]/5 px-2 py-0.5 rounded-md text-[#0F2922]/70">
                                                    {log.user_id.slice(0, 8)}...
                                                </code>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${getActionColor(log.action)}`}>
                                                    {log.action}
                                                </span>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <span className="text-xs font-medium text-[#0F2922]/80">{log.resource}</span>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <span className="text-[10px] text-[#0F2922]/50 font-mono">{log.resource_id || "-"}</span>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                {getStatusBadge(log.status)}
                                            </TableCell>
                                            <TableCell className="py-4 pr-8 text-right">
                                                <span className="text-[10px] text-[#0F2922]/40 font-mono">{log.ip_address || "-"}</span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-48 text-center text-[#0F2922]/40 text-xs italic">
                                            No audit logs found matching your criteria.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <div className="bg-[#0F2922]/5 rounded-2xl p-6 border border-[#0F2922]/10 flex items-start gap-4">
                <Shield className="w-5 h-5 text-[#0F2922]/60 mt-0.5" />
                <div className="space-y-1">
                    <p className="text-xs font-bold text-[#0F2922]">Compliance Notice</p>
                    <p className="text-[10px] text-[#0F2922]/60 leading-relaxed">
                        These logs are immutable and stored in a secure table. In accordance with the HIPAA Security Rule 164.312(b),
                        all access to Protected Health Information (PHI) is monitored and recorded. Unauthorized access or
                        tampering with audit logs is a violations of federal law.
                    </p>
                </div>
            </div>
        </div>
    )
}
