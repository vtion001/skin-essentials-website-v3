"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart3, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function SmsAnalytics() {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [stats, setStats] = useState({
        total: 0,
        sent: 0,
        failed: 0,
        today: 0,
        last7Days: 0
    })
    const [loading, setLoading] = useState(false)
    const supabase = createClientComponentClient()

    const fetchStats = async () => {
        setLoading(true)
        try {
            // Fetch all logs with context 'sms_log' from 'error_logs'
            // In a production app, we would have a dedicated 'sms_logs' table.
            // Using 'error_logs' as a proxy for now based on implementation.

            // 1. Get total count
            const { count: totalCount } = await supabase
                .from('error_logs')
                .select('*', { count: 'exact', head: true })
                .eq('context', 'sms_log')

            // 2. Get today's count
            const startOfDay = new Date()
            startOfDay.setHours(0, 0, 0, 0)

            const { count: todayCount } = await supabase
                .from('error_logs')
                .select('*', { count: 'exact', head: true })
                .eq('context', 'sms_log')
                .gte('created_at', startOfDay.toISOString())

            // 3. Get specific date count if selected
            let selectedDateCount = 0
            if (date) {
                const dayStart = new Date(date)
                dayStart.setHours(0, 0, 0, 0)
                const dayEnd = new Date(date)
                dayEnd.setHours(23, 59, 59, 999)

                const { count } = await supabase
                    .from('error_logs')
                    .select('*', { count: 'exact', head: true })
                    .eq('context', 'sms_log')
                    .gte('created_at', dayStart.toISOString())
                    .lte('created_at', dayEnd.toISOString())

                selectedDateCount = count || 0
            }

            setStats({
                total: totalCount || 0,
                sent: totalCount || 0, // Assuming all logged are 'sent' for now
                failed: 0,
                today: todayCount || 0,
                last7Days: selectedDateCount // Repurposing this field for "Selected Date"
            })

        } catch (e) {
            console.error("Failed to fetch SMS stats", e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStats()
    }, [date])

    return (
        <Card className="border-white/60 bg-white/70 backdrop-blur-xl shadow-xl rounded-3xl mt-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-600" />
                    SMS Analytics
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-medium text-gray-500">Overview</h4>
                            <Button variant="ghost" size="sm" onClick={fetchStats} disabled={loading}>
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                                <p className="text-xs text-emerald-600 font-medium uppercase tracking-wider">Total Sent</p>
                                <p className="text-3xl font-bold text-emerald-900 mt-1">{stats.total}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                                <p className="text-xs text-blue-600 font-medium uppercase tracking-wider">Today</p>
                                <p className="text-3xl font-bold text-blue-900 mt-1">{stats.today}</p>
                            </div>
                        </div>

                        {date && (
                            <div className="mt-6 p-4 rounded-2xl bg-gray-50 border border-gray-200">
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                                    {format(date, 'MMM d, yyyy')}
                                </p>
                                <div className="flex items-end gap-2 mt-1">
                                    <p className="text-4xl font-bold text-gray-900">{stats.last7Days}</p>
                                    <p className="text-sm text-gray-500 mb-1">messages sent</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-center border-l border-dashed border-gray-200 pl-8">
                        <Calendar
                            selectedDate={date}
                            onDateSelect={(d) => setDate(d)}
                            className="rounded-md border shadow-sm bg-white"
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
