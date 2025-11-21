"use client"

import React, { useEffect, useMemo, useState } from "react"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { appointmentService, type Appointment } from "../../lib/services"
// Removed unused request helper; using native fetch

export default function AppointmentsPane() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<string>("all")
  const [service, setService] = useState<string>("all")
  const [page, setPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)

  useEffect(() => {
    const load = async () => {
      await appointmentService.fetchFromSupabase?.()
      setAppointments(appointmentService.getAllAppointments())
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    return appointments
      .filter(a => status === 'all' ? true : a.status === status)
      .filter(a => service === 'all' ? true : a.service === service)
      .filter(a => {
        if (!query.trim()) return true
        const q = query.toLowerCase()
        return (
          (a.clientName || '').toLowerCase().includes(q) ||
          (a.clientEmail || '').toLowerCase().includes(q) ||
          (a.clientPhone || '').toLowerCase().includes(q) ||
          (a.service || '').toLowerCase().includes(q)
        )
      })
      .sort((x, y) => new Date(y.date).getTime() - new Date(x.date).getTime())
  }, [appointments, query, status, service])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const curPage = Math.min(page, totalPages)
  const start = (curPage - 1) * pageSize
  const items = filtered.slice(start, start + pageSize)

  const handleDelete = async (id: string, subject: string) => {
    const ok = typeof window !== 'undefined' && window.confirm(`Delete ${subject}?`)
    if (!ok) return
    try {
      const res = await fetch(`/api/admin/appointments?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      if (res.ok) {
        await appointmentService.fetchFromSupabase?.()
        setAppointments(appointmentService.getAllAppointments())
      }
    } catch {}
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <div>
            <Label>Search</Label>
            <Input value={query} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setQuery(e.target.value); setPage(1) }} />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={status} onValueChange={(v: string) => { setStatus(v); setPage(1) }}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Service</Label>
            <Select value={service} onValueChange={(v: string) => { setService(v); setPage(1) }}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Thread Lifts - Nose Enhancement">Thread Lifts - Nose Enhancement</SelectItem>
                <SelectItem value="Dermal Fillers - Lip Enhancement">Dermal Fillers - Lip Enhancement</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Page Size</Label>
            <Select value={String(pageSize)} onValueChange={(v: string) => { setPageSize(parseInt(v)); setPage(1) }}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          {items.map(a => (
            <div key={a.id} className="flex items-center justify-between p-3 bg-white/60 rounded-md border">
              <div className="min-w-0">
                <div className="font-medium truncate">{a.clientName}</div>
                <div className="text-sm text-gray-600 truncate">{a.service}</div>
              </div>
              <div className="text-sm text-gray-600">{a.date} • {a.time}</div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => handleDelete(a.id, a.clientName || 'appointment')}>Delete</Button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-sm text-gray-600">No appointments found</div>
          )}
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Button variant="outline" onClick={() => setPage(Math.max(1, curPage - 1))}>Prev</Button>
          <div className="text-sm">Page {curPage} of {totalPages}</div>
          <Button variant="outline" onClick={() => setPage(Math.min(totalPages, curPage + 1))}>Next</Button>
        </div>
      </CardContent>
    </Card>
  )
}