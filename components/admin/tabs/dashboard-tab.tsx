import React, { useMemo } from "react"
import { motion } from "framer-motion"
import {
  Calendar as CalendarIcon,
  CreditCard,
  Users,
  Settings,
  MessageSquare,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  type LucideIcon,
  Activity,
  BarChart3,
  Clock,
  Edit,
  FileText
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Appointment, Payment, Client, Staff, SocialMessage } from "@/lib/admin-services"
import { cn } from "@/lib/utils"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface DashboardTabProps {
  appointments: Appointment[]
  payments: Payment[]
  clients: Client[]
  staff: Staff[]
  socialMessages: SocialMessage[]
}

export function DashboardTab({
  appointments,
  payments,
  clients,
  staff,
  socialMessages,
}: DashboardTabProps) {
  
  // --- Data Calculations ---
  const stats = useMemo(() => {
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    
    const currentMonth = now.getMonth()
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const currentYear = now.getFullYear()
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

    // 1. Revenue
    const currentMonthRevenue = payments
      .filter(p => p.status === 'completed' && new Date(p.createdAt).getMonth() === currentMonth && new Date(p.createdAt).getFullYear() === currentYear)
      .reduce((sum, p) => sum + p.amount, 0)
    
    const lastMonthRevenue = payments
      .filter(p => p.status === 'completed' && new Date(p.createdAt).getMonth() === lastMonth && new Date(p.createdAt).getFullYear() === lastMonthYear)
      .reduce((sum, p) => sum + p.amount, 0)

    const revenueGrowth = lastMonthRevenue === 0 ? 100 : ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100

    // 2. Appointments
    const todayAppts = appointments.filter(a => a.date === todayStr).length
    const yesterdayAppts = appointments.filter(a => a.date === yesterdayStr).length
    const apptGrowth = yesterdayAppts === 0 ? (todayAppts > 0 ? 100 : 0) : ((todayAppts - yesterdayAppts) / yesterdayAppts) * 100

    // 3. Clients
    const totalClients = clients.length
    const newClientsThisMonth = clients.filter(c => new Date(c.createdAt).getMonth() === currentMonth && new Date(c.createdAt).getFullYear() === currentYear).length
    
    return [
      {
        title: "Total Revenue",
        value: `₱${currentMonthRevenue.toLocaleString()}`,
        subValue: "This Month",
        trend: revenueGrowth,
        trendLabel: "vs last month",
        icon: DollarSign,
        type: "primary",
      },
      {
        title: "Today's Appointments",
        value: todayAppts,
        subValue: "Scheduled",
        trend: apptGrowth,
        trendLabel: "vs yesterday",
        icon: CalendarIcon,
        type: "primary",
      },
      {
        title: "Total Clients",
        value: totalClients,
        subValue: `+${newClientsThisMonth} new this month`,
        icon: Users,
        type: "secondary",
      },
      {
        title: "Pending Payments",
        value: payments.filter(p => p.status === 'pending').length,
        subValue: "Requires attention",
        icon: CreditCard,
        type: "alert",
      },
      {
        title: "Unread Messages",
        value: socialMessages.filter(m => !m.isReplied).length,
        subValue: "Social Media",
        icon: MessageSquare,
        type: "alert",
      },
      {
        title: "Active Staff",
        value: staff.filter(s => s.status === 'active').length,
        subValue: "Currently on duty",
        icon: Settings,
        type: "secondary",
      },
    ]
  }, [appointments, payments, clients, staff, socialMessages])

  // --- Chart Data Preparation ---
  const revenueData = useMemo(() => {
    return payments.slice(-15).map(p => ({
      amount: p.amount,
      createdAt: p.createdAt
    }))
  }, [payments])

  const appointmentStatusData = useMemo(() => {
    return [
      { name: 'Completed', value: appointments.filter(a => a.status === 'completed').length, color: '#d09d80' }, // Tan
      { name: 'Scheduled', value: appointments.filter(a => a.status === 'scheduled').length, color: '#fbc6c5' }, // Rose
      { name: 'Confirmed', value: appointments.filter(a => a.status === 'confirmed').length, color: '#57534e' }, // Stone-600
      { name: 'Cancelled', value: appointments.filter(a => a.status === 'cancelled').length, color: '#e5e5e5' }, // Stone-200
    ]
  }, [appointments])

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-serif text-stone-800">Overview</h2>
          <p className="text-stone-500 text-sm">Welcome back to your dashboard.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-stone-500 bg-white px-3 py-1.5 rounded-full border border-stone-100 shadow-sm">
           <Activity className="w-4 h-4 text-[#d09d80]" />
           <span>Live Updates</span>
        </div>
      </div>

      {/* KPI Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {stats.map((stat, idx) => (
          <StatCard 
            key={stat.title}
            {...stat}
            className={idx === 0 ? "md:col-span-2 lg:col-span-2" : ""}
          />
        ))}
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Trend Chart */}
        <Card className="border-stone-100 shadow-sm bg-white hover:shadow-md transition-shadow duration-300">
          <CardHeader className="border-b border-stone-50 p-6">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-stone-500 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#d09d80]" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-10 h-[350px] min-h-[350px] min-w-0">
            <ResponsiveContainer width="100%" height="100%" minHeight={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d09d80" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#d09d80" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="createdAt" hide />
                <YAxis hide />
                <ReTooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e7e5e4',
                    borderRadius: '12px',
                    color: '#57534e',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value: number) => [`₱${value.toLocaleString()}`, "Revenue"]}
                />
                <Area type="monotone" dataKey="amount" stroke="#d09d80" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Appointment Status Pie Chart */}
        <Card className="border-stone-100 shadow-sm bg-white hover:shadow-md transition-shadow duration-300">
          <CardHeader className="border-b border-stone-50 p-6">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-stone-500 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#d09d80]" />
              Clinical Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 h-[350px] min-h-[350px] min-w-0 flex items-center justify-between">
            <div className="h-full w-2/3 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                <PieChart>
                  <Pie
                    data={appointmentStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {appointmentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <ReTooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e7e5e4',
                      borderRadius: '12px',
                      color: '#57534e',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-4 pr-4 w-1/3">
              {appointmentStatusData.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Booking Agenda */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-800">Agenda</h3>
            <span className="text-[10px] font-bold text-[#d09d80] bg-[#fbc6c5]/20 px-3 py-1 rounded-full uppercase tracking-widest">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
          <div className="space-y-4">
            {appointments
              .filter(apt => apt.date === new Date().toISOString().split('T')[0])
              .sort((a, b) => a.time.localeCompare(b.time))
              .slice(0, 5)
              .map((appointment) => (
                <div key={appointment.id} className="group flex items-center gap-5 p-4 bg-white border border-stone-100 rounded-2xl hover:border-[#d09d80]/40 transition-all shadow-sm hover:shadow-md">
                  <div className="text-center min-w-[50px]">
                    <p className="text-[10px] font-bold text-stone-400 uppercase">{appointment.time.split(' ')[1]}</p>
                    <p className="text-sm font-bold text-stone-800">{appointment.time.split(' ')[0]}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-stone-800 truncate">{appointment.clientName}</p>
                    <p className="text-[10px] font-bold text-[#d09d80] uppercase truncate">{appointment.service}</p>
                  </div>
                  <div className={cn("w-1.5 h-1.5 rounded-full", 
                    appointment.status === 'completed' ? 'bg-[#d09d80]' : 'bg-[#fbc6c5]'
                  )} />
                </div>
              ))}
             {appointments.filter(apt => apt.date === new Date().toISOString().split('T')[0]).length === 0 && (
                <div className="text-center py-8 text-stone-400 text-sm">No appointments today</div>
             )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {/* Summary / Branding Card */}
          <div className="relative h-full min-h-[300px] bg-white border border-stone-100 rounded-[32px] p-10 overflow-hidden group shadow-sm hover:shadow-md transition-all">
            <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-[#fbc6c5]/10 blur-[80px] rounded-full group-hover:bg-[#fbc6c5]/20 transition-all duration-1000" />
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                <span className="inline-block bg-stone-900 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
                  Admin Portal
                </span>
                <h2 className="text-4xl font-serif font-bold text-stone-800 tracking-tight leading-tight">
                  Elevating <br />
                  <span className="text-[#d09d80]">The Standard.</span>
                </h2>
                <p className="text-stone-500 text-sm mt-6 max-w-sm font-medium leading-relaxed">
                  Real-time insights into system health, financial growth, and clinical excellence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  subValue?: string
  trend?: number
  trendLabel?: string
  icon: LucideIcon
  type?: "primary" | "secondary" | "alert"
  className?: string
}

function StatCard({ title, value, subValue, trend, trendLabel, icon: Icon, type = "secondary", className }: StatCardProps) {
  const isPositive = trend !== undefined && trend >= 0
  const isAlert = type === "alert" && Number(value) > 0

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
      className={cn("h-full", className)}
    >
      <Card className={cn(
        "h-full border transition-all duration-300 group relative overflow-hidden",
        "bg-white hover:shadow-lg hover:-translate-y-1",
        type === "primary" ? "border-stone-200 shadow-md" : "border-stone-100 shadow-sm"
      )}>
        {/* Background decoration for primary cards */}
        {type === "primary" && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#fbc6c5]/10 to-transparent rounded-bl-full -mr-8 -mt-8 pointer-events-none" />
        )}
        
        <CardContent className="p-6 flex flex-col justify-between h-full relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div className={cn(
              "p-2.5 rounded-xl transition-colors duration-300",
              type === "primary" ? "bg-[#d09d80]/10 text-[#d09d80]" : 
              isAlert ? "bg-red-50 text-red-500" : "bg-stone-50 text-stone-500"
            )}>
              <Icon className="w-5 h-5" />
            </div>
            
            {/* View Details Arrow (Hidden by default, shows on group hover) */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
               <ArrowRight className="w-4 h-4 text-stone-400" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between">
               <h3 className={cn(
                 "font-bold font-serif tracking-tight text-stone-800",
                 type === "primary" ? "text-3xl" : "text-2xl"
               )}>
                {value}
              </h3>
              
              {trend !== undefined && (
                <div className={cn(
                  "flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
                  isPositive ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50"
                )}>
                  {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{Math.abs(trend).toFixed(0)}%</span>
                </div>
              )}
            </div>

            <div className="mt-1 flex items-center justify-between text-sm">
              <span className="text-stone-500 font-medium">{title}</span>
              <span className="text-stone-400 text-xs">
                 {trendLabel || subValue}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}