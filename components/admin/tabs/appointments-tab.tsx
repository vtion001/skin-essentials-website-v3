import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import {
  CalendarIcon,
  Edit,
  FileText,
  Plus,
  UserPlus,
  Trash2
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
                  <div key={appointment.id} className="group flex items-center justify-between p-5 bg-[#FDFCFB]/50 hover:bg-[#FDFCFB] rounded-2xl border border-[#E2D1C3]/20 transition-all duration-300">
                    <div className="flex-1">
                      <div className="flex items-center gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <p className="font-bold text-[#1A1A1A] tracking-tight">{privacyMode ? maskName(appointment.clientName) : appointment.clientName}</p>
                            <Badge className={`text-[10px] font-bold uppercase tracking-widest py-0.5 px-3 rounded-full border shadow-none ${appointment.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                appointment.status === 'confirmed' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                  appointment.status === 'scheduled' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                    'bg-rose-50 text-rose-600 border-rose-100'
                              }`}>
                              {appointment.status}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-[#8B735B] font-bold uppercase tracking-widest mb-2">{appointment.service}</p>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#1A1A1A]/60">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#8B735B]/30" />
                              {appointment.time}
                            </div>
                            <div className="text-[11px] font-bold text-[#1A1A1A]/60">{appointment.duration} min</div>
                            <div className="text-[11px] font-bold text-[#8B735B]">₱{appointment.price.toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-4">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 rounded-xl text-[#8B735B] hover:bg-[#E2D1C3]/20 transition-colors"
                        onClick={() => openAppointmentModal(appointment)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 rounded-xl text-[#8B735B] hover:bg-[#E2D1C3]/20 transition-colors"
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
              <TableHeader className="bg-[#FDFCFB]">
                <TableRow className="border-b border-[#E2D1C3]/20 hover:bg-transparent">
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B] py-5">Client</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]">Service</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]">Date</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]">Time</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]">Status</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]">Duration</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]">Price</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map(a => (
                  <TableRow key={a.id} className="group border-b border-[#E2D1C3]/10 hover:bg-[#FDFCFB] transition-colors cursor-default" onClick={() => setSelectedDate(new Date(a.date + 'T00:00:00'))}>
                    <TableCell className="py-4">
                      <div className="font-bold text-[#1A1A1A] tracking-tight">{privacyMode ? maskName(a.clientName) : a.clientName}</div>
                      <div className="text-[10px] text-[#8B735B] font-medium tracking-tight uppercase mt-0.5">{privacyMode ? maskEmail(a.clientEmail) : a.clientEmail} • {privacyMode ? maskPhone(a.clientPhone) : a.clientPhone}</div>
                    </TableCell>
                    <TableCell className="max-w-[12rem]">
                      <div className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-tight truncate">{a.service}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-[11px] font-bold text-[#1A1A1A]">{new Date(a.date).toLocaleDateString()}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-[11px] font-bold text-[#1A1A1A]">{a.time}</div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={a.status}
                        onValueChange={(value) => {
                          appointmentService.updateAppointment(a.id, { status: value as any })
                          onUpdateStatus()
                        }}
                      >
                        <SelectTrigger
                          onClick={(e) => e.stopPropagation()}
                          className={`w-[120px] h-7 text-[9px] font-bold uppercase tracking-wider rounded-full border shadow-none ${a.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            a.status === 'confirmed' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                              a.status === 'scheduled' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                'bg-rose-50 text-rose-600 border-rose-100'
                            }`}
                        >
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent onClick={(e) => e.stopPropagation()} className="border-[#E2D1C3]/20">
                          <SelectItem value="scheduled" className="text-[10px] font-bold uppercase">Scheduled</SelectItem>
                          <SelectItem value="confirmed" className="text-[10px] font-bold uppercase">Confirmed</SelectItem>
                          <SelectItem value="completed" className="text-[10px] font-bold uppercase">Completed</SelectItem>
                          <SelectItem value="cancelled" className="text-[10px] font-bold uppercase text-rose-600">Cancelled</SelectItem>
                          <SelectItem value="no-show" className="text-[10px] font-bold uppercase text-rose-600">No Show</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="text-[11px] font-bold text-[#1A1A1A]">{a.duration} min</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-[11px] font-bold text-[#1A1A1A]">₱{a.price.toLocaleString()}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-lg text-emerald-600 hover:bg-emerald-50"
                          onClick={(e) => { e.stopPropagation(); onQuickAddClient(a) }}
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-lg text-[#8B735B] hover:bg-[#E2D1C3]/20"
                          onClick={(e) => { e.stopPropagation(); openAppointmentModal(a) }}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-lg text-rose-400 hover:bg-rose-50 hover:text-rose-600"
                          onClick={async (e) => {
                            e.stopPropagation()
                            if (!confirmTwice(a.clientName || 'this appointment')) return
                            appointmentService.deleteAppointment(a.id)
                            onUpdateStatus()
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between pt-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]/60">Page {page} of {totalPages}</div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-[10px] font-bold uppercase tracking-widest text-[#8B735B] border-[#E2D1C3]/20 hover:bg-[#FDFCFB]"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-[10px] font-bold uppercase tracking-widest text-[#8B735B] border-[#E2D1C3]/20 hover:bg-[#FDFCFB]"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
