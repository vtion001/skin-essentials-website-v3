"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Download, Trash2 } from "lucide-react"
import { type Payment, type Client } from "@/lib/admin-services"

interface PaymentsTabProps {
  payments: Payment[]
  clients: Client[]
  search: string
  setSearch: (v: string) => void
  methodFilter: string
  setMethodFilter: (v: string) => void
  statusFilter: string
  setStatusFilter: (v: string) => void
  dateFrom: string
  setDateFrom: (v: string) => void
  dateTo: string
  setDateTo: (v: string) => void
  sort: string
  setSort: (v: string) => void
  page: number
  setPage: (v: number) => void
  pageSize: number
  setPageSize: (v: number) => void
  openPaymentModal: (payment?: Payment) => void
  refreshPayments: () => Promise<void>
  showNotification: (type: "success" | "error", message: string) => void
}

export function PaymentsTab({
  payments,
  clients,
  search,
  setSearch,
  methodFilter,
  setMethodFilter,
  statusFilter,
  setStatusFilter,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  sort,
  setSort,
  page,
  setPage,
  pageSize,
  setPageSize,
  openPaymentModal,
  refreshPayments,
  showNotification,
}: PaymentsTabProps) {

  const confirmTwice = (subject: string) => {
    if (typeof window === 'undefined') return false
    if (!window.confirm(`Are you sure you want to delete ${subject}?`)) return false
    if (!window.confirm(`Please confirm deletion of ${subject}. This action cannot be undone.`)) return false
    return true
  }

  const handleDeletePayment = async (payment: Payment) => {
    if (!confirmTwice('this payment')) return
    try {
      const res = await fetch('/api/admin/payments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: payment.id })
      })
      if (res.ok) {
        await refreshPayments()
        showNotification('success', 'Payment deleted')
      } else {
        showNotification('error', 'Failed to delete payment')
      }
    } catch {
      showNotification('error', 'Failed to delete payment')
    }
  }

  const inRange = (iso: string) => {
    if (!dateFrom && !dateTo) return true
    const t = new Date(iso).getTime()
    const from = dateFrom ? new Date(dateFrom).getTime() : -Infinity
    const to = dateTo ? new Date(dateTo).getTime() : Infinity
    return t >= from && t <= to
  }

  const filtered = payments
    .filter(p => inRange(p.createdAt))
    .filter(p => methodFilter === 'all' ? true : p.method === methodFilter)
    .filter(p => statusFilter === 'all' ? true : p.status === statusFilter)
    .filter(p => {
      const q = search.trim().toLowerCase()
      if (!q) return true
      const client = clients.find(c => c.id === p.clientId)
      const name = client ? `${client.firstName} ${client.lastName}`.toLowerCase() : ''
      return name.includes(q) || (p.transactionId || '').toLowerCase().includes(q)
    })
    .sort((a, b) => {
      if (sort === 'date_desc') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (sort === 'date_asc') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      if (sort === 'amount_desc') return b.amount - a.amount
      if (sort === 'amount_asc') return a.amount - b.amount
      return 0
    })

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.max(1, Math.min(page, totalPages))
  const start = (currentPage - 1) * pageSize
  const pageItems = filtered.slice(start, start + pageSize)

  return (
    <>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by client or transaction"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-10"
          />
        </div>
        <Select value={methodFilter} onValueChange={(v) => { setMethodFilter(v); setPage(1) }}>
          <SelectTrigger className="h-9"><SelectValue placeholder="Method" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="gcash">GCash</SelectItem>
            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="card">Card</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
          <SelectTrigger className="h-9"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1) }} className="h-9" />
        <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1) }} className="h-9" />
        <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1) }}>
          <SelectTrigger className="h-9"><SelectValue placeholder="Sort" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="date_desc">Date ↓</SelectItem>
            <SelectItem value="date_asc">Date ↑</SelectItem>
            <SelectItem value="amount_desc">Amount ↓</SelectItem>
            <SelectItem value="amount_asc">Amount ↑</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-white/60 backdrop-blur-sm border border-[#fbc6c5]/20">
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-3">
            <Table>
              <TableHeader className="bg-[#FDFCFB]">
                <TableRow className="border-b border-[#E2D1C3]/20 hover:bg-transparent">
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B] py-5">Client</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]">Amount</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]">Method</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]">Status</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]">Date</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map((payment) => {
                  const client = clients.find(c => c.id === payment.clientId)
                  return (
                    <TableRow key={payment.id} className="group border-b border-[#E2D1C3]/10 hover:bg-[#FDFCFB] transition-colors cursor-default">
                      <TableCell className="py-4">
                        <div className="font-bold text-[#1A1A1A] tracking-tight">{client ? `${client.firstName} ${client.lastName}` : 'Unknown Client'}</div>
                        <div className="text-[10px] text-[#8B735B] font-medium tracking-tight uppercase mt-0.5">{client?.email || ''}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-[#1A1A1A]">₱{payment.amount.toLocaleString()}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-tight">{payment.method.replace('_', ' ')}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] font-bold uppercase tracking-widest py-0.5 px-3 rounded-full border shadow-none ${payment.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            payment.status === 'pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                              payment.status === 'failed' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                'bg-gray-50 text-gray-600 border-gray-100'
                          }`}>
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-[11px] font-bold text-[#1A1A1A]">{new Date(payment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 justify-end">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-lg text-[#8B735B] hover:bg-[#E2D1C3]/20"
                            onClick={() => openPaymentModal(payment)}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          {payment.receiptUrl && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 rounded-lg text-[#8B735B] hover:bg-[#E2D1C3]/20"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-lg text-rose-400 hover:bg-rose-50 hover:text-rose-600"
                            onClick={() => handleDeletePayment(payment)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {pageItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8B735B]/40">No payments found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between pt-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]/60">Page {currentPage} of {totalPages}</div>
              <div className="flex items-center gap-3">
                <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(parseInt(v)); setPage(1) }}>
                  <SelectTrigger className="w-24 h-8 text-[10px] font-bold uppercase tracking-widest text-[#8B735B] border-[#E2D1C3]/20 bg-white/50"><SelectValue placeholder="Rows" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 Rows</SelectItem>
                    <SelectItem value="25">25 Rows</SelectItem>
                    <SelectItem value="50">50 Rows</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-[10px] font-bold uppercase tracking-widest text-[#8B735B] border-[#E2D1C3]/20 hover:bg-[#FDFCFB]"
                    onClick={() => setPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-[10px] font-bold uppercase tracking-widest text-[#8B735B] border-[#E2D1C3]/20 hover:bg-[#FDFCFB]"
                    onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
