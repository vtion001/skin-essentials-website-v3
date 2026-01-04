"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, UserPlus, Edit, FileText, Trash2, AlertCircle, RefreshCw } from "lucide-react"
import { type Client } from "@/lib/admin-services"
import { maskName, maskEmail, maskPhone, maskAddress } from "@/lib/utils/privacy"

interface ClientsTabProps {
  clients: Client[]
  searchQuery: string
  setSearchQuery: (v: string) => void
  statusFilter: string
  setStatusFilter: (v: string) => void
  sourceFilter: string
  setSourceFilter: (v: string) => void
  sort: string
  setSort: (v: string) => void
  privacyMode: boolean
  openClientModal: (client?: Client) => void
  openMedicalRecordModal: (record?: any, clientId?: string) => void
  onRefresh: () => Promise<void>
  showNotification: (type: "success" | "error", message: string) => void
}

export function ClientsTab({
  clients,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  sourceFilter,
  setSourceFilter,
  sort,
  setSort,
  privacyMode,
  openClientModal,
  openMedicalRecordModal,
  onRefresh,
  showNotification,
}: ClientsTabProps) {
  const [confirmClient, setConfirmClient] = useState<Client | null>(null)
  const [confirmDeleting, setConfirmDeleting] = useState(false)

  const handleDeleteClient = async () => {
    if (!confirmClient) return
    setConfirmDeleting(true)
    try {
      const res = await fetch('/api/admin/clients', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: confirmClient.id })
      })
      if (res.ok) {
        await onRefresh()
        showNotification('success', 'Client deleted')
        setConfirmClient(null)
      } else {
        showNotification('error', 'Failed to delete client')
      }
    } catch {
      showNotification('error', 'Failed to delete client')
    } finally {
      setConfirmDeleting(false)
    }
  }

  const filteredClients = clients
    .filter(client =>
      searchQuery === '' ||
      client.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.phone || '').includes(searchQuery)
    )
    .filter(c => statusFilter === 'all' ? true : c.status === statusFilter)
    .filter(c => sourceFilter === 'all' ? true : c.source === sourceFilter)
    .sort((a, b) => {
      if (sort === 'name_asc') return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
      if (sort === 'name_desc') return `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`)
      if (sort === 'spent_desc') return (b.totalSpent || 0) - (a.totalSpent || 0)
      if (sort === 'last_visit_desc') return new Date(b.lastVisit || 0).getTime() - new Date(a.lastVisit || 0).getTime()
      return 0
    })

  return (
    <>
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

      <div className="flex flex-wrap gap-3 mb-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="h-9"><SelectValue placeholder="Source" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="website">Website</SelectItem>
            <SelectItem value="facebook">Facebook</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="tiktok">TikTok</SelectItem>
            <SelectItem value="referral">Referral</SelectItem>
            <SelectItem value="walk_in">Walk-in</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="h-9"><SelectValue placeholder="Sort" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="name_asc">Name (A→Z)</SelectItem>
            <SelectItem value="name_desc">Name (Z→A)</SelectItem>
            <SelectItem value="spent_desc">Total Spent (High→Low)</SelectItem>
            <SelectItem value="last_visit_desc">Last Visit (Newest)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-white/60 backdrop-blur-sm border border-white/70 shadow-2xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[700px]">
              <TableHeader className="bg-[#FDFCFB]">
                <TableRow className="border-b border-[#E2D1C3]/20 hover:bg-transparent">
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B] py-5">Name</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]">Email</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]">Phone</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]">Status</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]">Total Spent</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]">Last Visit</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]">Source</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id} className="group border-b border-[#E2D1C3]/10 hover:bg-[#FDFCFB] transition-colors cursor-default">
                    <TableCell className="py-4">
                      <div className="font-bold text-[#1A1A1A] tracking-tight">
                        {client.firstName === "[Unavailable]" ? (
                          <Badge variant="outline" className="text-[10px] bg-red-50 text-red-600 border-red-100 py-0.5 normal-case">Secure Name Locked</Badge>
                        ) : (
                          privacyMode ? maskName(`${client.firstName} ${client.lastName}`) : `${client.firstName} ${client.lastName}`
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[220px]">
                      {client.email === "[Unavailable]" ? (
                        <Badge variant="outline" className="text-[9px] bg-amber-50 text-amber-600 border-amber-100 py-0.5 normal-case">Secure Email Locked</Badge>
                      ) : (
                        <div className="text-[11px] font-bold text-[#1A1A1A] truncate">{privacyMode ? maskEmail(client.email) : client.email}</div>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[160px]">
                      {client.phone === "[Unavailable]" ? (
                        <Badge variant="outline" className="text-[9px] bg-amber-50 text-amber-600 border-amber-100 py-0.5 normal-case">Secure Phone Locked</Badge>
                      ) : (
                        <div className="text-[11px] font-bold text-[#1A1A1A] truncate">{privacyMode ? maskPhone(client.phone) : client.phone}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-[10px] font-bold uppercase tracking-widest py-0.5 px-3 rounded-full border shadow-none ${client.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        client.status === 'inactive' ? 'bg-gray-50 text-gray-600 border-gray-100' :
                          'bg-rose-50 text-rose-600 border-rose-100'
                        }`}>
                        {client.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-[#1A1A1A]">₱{client.totalSpent.toLocaleString()}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-[11px] font-bold text-[#1A1A1A]">{client.lastVisit ? new Date(client.lastVisit).toLocaleDateString() : '-'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-[10px] text-[#8B735B] font-bold uppercase tracking-widest">{client.source.replace('_', ' ')}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-lg text-[#8B735B] hover:bg-[#E2D1C3]/20"
                          onClick={() => openClientModal(client)}
                          aria-label="Edit client"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-lg text-[#8B735B] hover:bg-[#E2D1C3]/20"
                          onClick={() => openMedicalRecordModal(undefined, client.id)}
                          aria-label="Open medical records"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-lg text-rose-400 hover:bg-rose-50 hover:text-rose-600"
                          onClick={() => setConfirmClient(client)}
                          aria-label="Delete client"
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
        </CardContent>
      </Card>

      <Dialog open={!!confirmClient} onOpenChange={(open) => { if (!open && !confirmDeleting) setConfirmClient(null) }}>
        <DialogContent className="max-w-md bg-white/80 backdrop-blur-sm border border-rose-200/60 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              Delete Client
            </DialogTitle>
          </DialogHeader>
          {confirmClient && (
            <div className="space-y-3 text-sm text-gray-700">
              <p>Are you sure you want to delete this client? This action cannot be undone.</p>
              <div className="rounded-lg border bg-white/70 p-3">
                <div className="font-medium">{confirmClient.firstName} {confirmClient.lastName}</div>
                {confirmClient.email && <div className="text-gray-600">{privacyMode ? maskEmail(confirmClient.email) : confirmClient.email}</div>}
                {confirmClient.phone && <div className="text-gray-600">{privacyMode ? maskPhone(confirmClient.phone) : confirmClient.phone}</div>}
                {confirmClient.address && <div className="text-gray-600">{privacyMode ? maskAddress(confirmClient.address) : confirmClient.address}</div>}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setConfirmClient(null)} disabled={confirmDeleting}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleDeleteClient}
            >
              {confirmDeleting ? (
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
    </>
  )
}
