
import React from "react"
import { motion } from "framer-motion"
import {
  Calendar as CalendarIcon,
  CreditCard,
  Users,
  Settings,
  MessageSquare,
  DollarSign,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { Appointment, Payment, Client, Staff, SocialMessage } from "@/lib/admin-services"

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
  const stats = [
    { 
      title: "Today's Appointments", 
      value: appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length,
      icon: CalendarIcon,
      color: 'blue',
      gradient: 'from-blue-600 to-cyan-600'
    },
    { 
      title: "Pending Payments", 
      value: payments.filter(p => p.status === 'pending').length,
      icon: CreditCard,
      color: 'purple',
      gradient: 'from-purple-600 to-pink-600'
    },
    { 
      title: "Total Clients", 
      value: clients.length,
      icon: Users,
      color: 'green',
      gradient: 'from-green-600 to-emerald-600'
    },
    { 
      title: "Active Staff", 
      value: staff.filter(s => s.status === 'active').length,
      icon: Settings,
      color: 'orange',
      gradient: 'from-orange-600 to-amber-600'
    },
    { 
      title: "Social Messages", 
      value: socialMessages.filter(m => !m.isReplied).length,
      icon: MessageSquare,
      color: 'indigo',
      gradient: 'from-indigo-600 to-purple-600'
    },
    { 
      title: "Monthly Revenue", 
      value: `₱${payments.filter(p => p.status === 'completed' && new Date(p.createdAt).getMonth() === new Date().getMonth()).reduce((sum, p) => sum + p.amount, 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'fuchsia',
      gradient: 'from-fuchsia-600 to-violet-600'
    }
  ]

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + index * 0.1 }}
          whileHover={{ scale: 1.03, y: -2 }}
          className="transform-gpu"
        >
          <Card className={`bg-gradient-to-br from-${stat.color}-50/40 via-white/50 to-${stat.color}-50/30 backdrop-blur-xl border border-${stat.color}-200/50 shadow-2xl shadow-${stat.color}-500/10 transition-all duration-500 hover:shadow-${stat.color}-500/20`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium text-${stat.color}-600/80 mb-1`}>{stat.title}</p>
                  <motion.p 
                    className={`text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
                  >
                    {stat.value}
                  </motion.p>
                </div>
                <motion.div 
                  className={`p-3 bg-gradient-to-br ${stat.gradient} rounded-2xl shadow-lg shadow-${stat.color}-500/30`}
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}
