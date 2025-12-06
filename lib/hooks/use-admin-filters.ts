import { useState } from 'react'

export function useAdminFilters() {
  // Appointment filters
  const [appointmentsSearch, setAppointmentsSearch] = useState("")
  const [appointmentsStatusFilter, setAppointmentsStatusFilter] = useState<string>("all")
  const [appointmentsServiceFilter, setAppointmentsServiceFilter] = useState<string>("all")
  const [appointmentsDateFrom, setAppointmentsDateFrom] = useState<string>("")
  const [appointmentsDateTo, setAppointmentsDateTo] = useState<string>("")
  const [appointmentsSort, setAppointmentsSort] = useState<string>("date_desc")
  const [appointmentsPage, setAppointmentsPage] = useState<number>(1)
  const [appointmentsPageSize, setAppointmentsPageSize] = useState<number>(10)

  // Client filters
  const [clientsStatusFilter, setClientsStatusFilter] = useState<string>("all")
  const [clientsSourceFilter, setClientsSourceFilter] = useState<string>("all")
  const [clientsSort, setClientsSort] = useState<string>("name_asc")

  // Payment filters
  const [paymentSearch, setPaymentSearch] = useState("")
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all")
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all")
  const [paymentDateFrom, setPaymentDateFrom] = useState<string>("")
  const [paymentDateTo, setPaymentDateTo] = useState<string>("")
  const [paymentSort, setPaymentSort] = useState<string>("date_desc")
  const [paymentPage, setPaymentPage] = useState<number>(1)
  const [paymentPageSize, setPaymentPageSize] = useState<number>(10)

  // Staff filters
  const [staffSearch, setStaffSearch] = useState("")
  const [staffPositionFilter, setStaffPositionFilter] = useState<string>("all")
  const [staffStatusFilter, setStaffStatusFilter] = useState<string>("all")
  const [staffTotalsFilter, setStaffTotalsFilter] = useState<string>("all")

  // Influencer filters
  const [influencerSearch, setInfluencerSearch] = useState("")
  const [influencerPlatformFilter, setInfluencerPlatformFilter] = useState<string>('all')
  const [influencerStatusFilter, setInfluencerStatusFilter] = useState<string>('all')

  // General
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  
  // Analytics
  const [analyticsDateFrom, setAnalyticsDateFrom] = useState<string>("")
  const [analyticsDateTo, setAnalyticsDateTo] = useState<string>("")

  return {
    appointments: {
      search: appointmentsSearch, setSearch: setAppointmentsSearch,
      statusFilter: appointmentsStatusFilter, setStatusFilter: setAppointmentsStatusFilter,
      serviceFilter: appointmentsServiceFilter, setServiceFilter: setAppointmentsServiceFilter,
      dateFrom: appointmentsDateFrom, setDateFrom: setAppointmentsDateFrom,
      dateTo: appointmentsDateTo, setDateTo: setAppointmentsDateTo,
      sort: appointmentsSort, setSort: setAppointmentsSort,
      page: appointmentsPage, setPage: setAppointmentsPage,
      pageSize: appointmentsPageSize, setPageSize: setAppointmentsPageSize,
    },
    clients: {
      statusFilter: clientsStatusFilter, setStatusFilter: setClientsStatusFilter,
      sourceFilter: clientsSourceFilter, setSourceFilter: setClientsSourceFilter,
      sort: clientsSort, setSort: setClientsSort,
    },
    payments: {
      search: paymentSearch, setSearch: setPaymentSearch,
      methodFilter: paymentMethodFilter, setMethodFilter: setPaymentMethodFilter,
      statusFilter: paymentStatusFilter, setStatusFilter: setPaymentStatusFilter,
      dateFrom: paymentDateFrom, setDateFrom: setPaymentDateFrom,
      dateTo: paymentDateTo, setDateTo: setPaymentDateTo,
      sort: paymentSort, setSort: setPaymentSort,
      page: paymentPage, setPage: setPaymentPage,
      pageSize: paymentPageSize, setPageSize: setPaymentPageSize,
    },
    staff: {
      search: staffSearch, setSearch: setStaffSearch,
      positionFilter: staffPositionFilter, setPositionFilter: setStaffPositionFilter,
      statusFilter: staffStatusFilter, setStatusFilter: setStaffStatusFilter,
      totalsFilter: staffTotalsFilter, setTotalsFilter: setStaffTotalsFilter,
    },
    influencers: {
      search: influencerSearch, setSearch: setInfluencerSearch,
      platformFilter: influencerPlatformFilter, setPlatformFilter: setInfluencerPlatformFilter,
      statusFilter: influencerStatusFilter, setStatusFilter: setInfluencerStatusFilter,
    },
    general: {
      searchQuery, setSearchQuery,
      filterStatus, setFilterStatus,
      selectedDate, setSelectedDate,
    },
    analytics: {
      dateFrom: analyticsDateFrom, setDateFrom: setAnalyticsDateFrom,
      dateTo: analyticsDateTo, setDateTo: setAnalyticsDateTo,
    }
  }
}
