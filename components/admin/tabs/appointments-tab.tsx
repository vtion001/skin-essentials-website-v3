import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { 
  CalendarIcon, 
  Edit, 
  FileText, 
  Plus, 
  UserPlus 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  appointmentService, 
  type Appointment, 
  type Client, 
  type MedicalRecord 
} from '@/lib/admin-services'
import { maskName, maskEmail, maskPhone } from '@/lib/utils/privacy'

interface AppointmentsTabProps {
  appointments: Appointment[]
  clients: Client[]
  services: string[]
  privacyMode: boolean
  setPrivacyMode: (v: boolean | ((prev: boolean) => boolean)) => void
  openAppointmentModal: (apt?: Appointment) => void
  openMedicalRecordModal: (record?: MedicalRecord, clientId?: string) => void
  onQuickAddClient: (apt: Appointment) => void
  confirmTwice: (subject: string) => boolean
  onUpdateStatus: () => void
  
  // Filter states
  search: string
  setSearch: (v: string) => void
  statusFilter: string
  setStatusFilter: (v: string) => void
  serviceFilter: string
  setServiceFilter: (v: string) => void
  dateFrom: string
  setDateFrom: (v: string) => void
  dateTo: string
  setDateTo: (v: string) => void
  sort: string
  setSort: (v: string) => void
  page: number
  setPage: (v: number) => void
  pageSize: number
  selectedDate: Date | undefined
  setSelectedDate: (v: Date | undefined) => void
}

export function AppointmentsTab({
  appointments,
  clients,
  services,
  privacyMode,
  setPrivacyMode,
  openAppointmentModal,
  openMedicalRecordModal,
  onQuickAddClient,
  confirmTwice,
  onUpdateStatus,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  serviceFilter,
  setServiceFilter,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  sort,
  setSort,
  page,
  setPage,
  pageSize,
  selectedDate,
  setSelectedDate
}: AppointmentsTabProps) {
  // Removed local state in favor of props

  const filteredAppointments = useMemo(() => {
    const inRange = (d: string) => {
      if (!dateFrom && !dateTo) return true
      const t = new Date(d).getTime()
      const from = dateFrom ? new Date(dateFrom).getTime() : -Infinity
      const to = dateTo ? new Date(dateTo).getTime() : Infinity
      return t >= from && t <= to
    }

    return appointments
      .filter(a => inRange(a.date))
      .filter(a => statusFilter === 'all' ? true : a.status === statusFilter)
      .filter(a => serviceFilter === 'all' ? true : a.service === serviceFilter)
      .filter(a => {
        if (!search.trim()) return true
        const q = search.toLowerCase()
        return (
          a.clientName.toLowerCase().includes(q) ||
          a.clientEmail.toLowerCase().includes(q) ||
          a.clientPhone.toLowerCase().includes(q) ||
          a.service.toLowerCase().includes(q)
        )
      })
      .sort((x, y) => {
        if (sort === 'date_desc') return new Date(y.date).getTime() - new Date(x.date).getTime()
        if (sort === 'date_asc') return new Date(x.date).getTime() - new Date(y.date).getTime()
        if (sort === 'price_desc') return y.price - x.price
        if (sort === 'price_asc') return x.price - y.price
        return 0
      })
  }, [appointments, search, statusFilter, serviceFilter, dateFrom, dateTo, sort])

  const totalPages = Math.max(1, Math.ceil(filteredAppointments.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * pageSize
  const pageItems = filteredAppointments.slice(start, start + pageSize)

  const selectedDateStr = selectedDate 
    ? format(selectedDate, 'yyyy-MM-dd')
    : ''

  const appointmentsForSelectedDate = appointments.filter(apt => apt.date === selectedDateStr)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Booking Management</h2>
        <Button
          onClick={() => openAppointmentModal()}
          className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 text-white shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105 font-bold px-6 py-3 rounded-2xl"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Appointment
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="bg-white/60 backdrop-blur-sm border border-[#fbc6c5]/20">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={(date) => setSelectedDate(date)}
              bookedDates={appointments.map(apt => new Date(apt.date))}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Appointments List for Selected Date */}
        <div className="lg:col-span-2">
          <Card className="bg-white/60 backdrop-blur-sm border border-[#fbc6c5]/20">
            <CardHeader>
              <CardTitle>
                Appointments for {selectedDate ? format(selectedDate, 'PP') : 'Selected Date'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointmentsForSelectedDate.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 bg-white/50 rounded-lg border">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <p className="font-medium">{privacyMode ? maskName(appointment.clientName) : appointment.clientName}</p>
                          <p className="text-sm text-gray-600">{appointment.service}</p>
                          <p className="text-xs text-gray-500">
                            {appointment.time} • {appointment.duration} min • ₱{appointment.price}
                          </p>
                        </div>
                        <Badge className={
                          appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          appointment.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {appointment.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openAppointmentModal(appointment)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const client = clients.find(c => c.id === appointment.clientId)
                          if (client) openMedicalRecordModal(undefined, client.id)
                        }}
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {appointmentsForSelectedDate.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No appointments scheduled for this date
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="bg-white/60 backdrop-blur-sm border border-[#fbc6c5]/20">
        <CardHeader>
          <CardTitle>All Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 mb-4">
            <div className="lg:col-span-2">
              <Input
                placeholder="Search by client or service"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              />
            </div>
            <div>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no-show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={serviceFilter} onValueChange={(v) => { setServiceFilter(v); setPage(1) }}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  {services.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1) }} className="h-9" />
            </div>
            <div>
              <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1) }} className="h-9" />
            </div>
            <div>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date_desc">Date ↓</SelectItem>
                  <SelectItem value="date_asc">Date ↑</SelectItem>
                  <SelectItem value="price_desc">Price ↓</SelectItem>
                  <SelectItem value="price_asc">Price ↑</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-end">
              <Button variant="outline" className="h-9" onClick={() => setPrivacyMode(prev => !prev)}>{privacyMode ? 'Privacy On' : 'Privacy Off'}</Button>
            </div>
          </div>

          <div className="space-y-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map(a => (
                  <TableRow key={a.id} className="cursor-pointer" onClick={() => setSelectedDate(new Date(a.date + 'T00:00:00'))}>
                    <TableCell>
                      <div className="font-medium">{privacyMode ? maskName(a.clientName) : a.clientName}</div>
                      <div className="text-xs text-gray-500">{privacyMode ? maskEmail(a.clientEmail) : a.clientEmail} • {privacyMode ? maskPhone(a.clientPhone) : a.clientPhone}</div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{a.service}</TableCell>
                    <TableCell>{new Date(a.date).toLocaleDateString()}</TableCell>
                    <TableCell>{a.time}</TableCell>
                    <TableCell>
                      <Select
                        value={a.status}
                        onValueChange={(value) => {
                          appointmentService.updateAppointment(a.id, { status: value as any })
                          onUpdateStatus()
                        }}
                      >
                        <SelectTrigger onClick={(e) => e.stopPropagation()} className="w-40">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent onClick={(e) => e.stopPropagation()}>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="no-show">No Show</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{a.duration} min</TableCell>
                    <TableCell>₱{a.price.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onQuickAddClient(a) }}>
                          <UserPlus className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); openAppointmentModal(a) }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={async (e) => {
                          e.stopPropagation()
                          if (!confirmTwice(a.clientName || 'this appointment')) return
                          appointmentService.deleteAppointment(a.id)
                          onUpdateStatus()
                        }}>
                          <span className="text-red-500">×</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm">Page {page} of {totalPages}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
