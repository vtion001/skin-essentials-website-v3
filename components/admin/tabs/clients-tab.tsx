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
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">Name</TableHead>
                  <TableHead scope="col">Email</TableHead>
                  <TableHead scope="col">Phone</TableHead>
                  <TableHead scope="col">Status</TableHead>
                  <TableHead scope="col">Total Spent</TableHead>
                  <TableHead scope="col">Last Visit</TableHead>
                  <TableHead scope="col">Source</TableHead>
                  <TableHead scope="col" className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{privacyMode ? maskName(`${client.firstName} ${client.lastName}`) : `${client.firstName} ${client.lastName}`}</TableCell>
                    <TableCell className="truncate max-w-[220px]">{privacyMode ? maskEmail(client.email) : client.email}</TableCell>
                    <TableCell className="truncate max-w-[160px]">{privacyMode ? maskPhone(client.phone) : client.phone}</TableCell>
                    <TableCell>
                      <Badge className={
                        client.status === 'active' ? 'bg-green-100 text-green-800' :
                        client.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {client.status}
                      </Badge>
                    </TableCell>
                    <TableCell>₱{client.totalSpent.toLocaleString()}</TableCell>
                    <TableCell>{client.lastVisit ? new Date(client.lastVisit).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>{client.source.replace('_', ' ')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => openClientModal(client)} aria-label="Edit client">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openMedicalRecordModal(undefined, client.id)} aria-label="Open medical records">
                          <FileText className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setConfirmClient(client)} aria-label="Delete client">
                          <Trash2 className="w-4 h-4" />
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
