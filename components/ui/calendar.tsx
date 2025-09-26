"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface CalendarProps {
  className?: string
  classNames?: {
    months?: string
    month?: string
    caption?: string
    caption_label?: string
    nav?: string
    nav_button?: string
    nav_button_previous?: string
    nav_button_next?: string
    table?: string
    head_row?: string
    head_cell?: string
    row?: string
    cell?: string
    day?: string
    day_selected?: string
    day_today?: string
    day_outside?: string
    day_disabled?: string
    day_range_middle?: string
    day_hidden?: string
  }
  showOutsideDays?: boolean
  selectedDate?: Date
  onDateSelect?: (date: Date) => void
  bookedDates?: Date[]
  availableTimeSlots?: string[]
}

const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
  ({ className, classNames, showOutsideDays = true, selectedDate, onDateSelect, bookedDates = [], ...props }, ref) => {
    const [currentMonth, setCurrentMonth] = React.useState(new Date())

    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()
    const today = new Date()

    const isDateBooked = (date: Date) => {
      return bookedDates.some(bookedDate => 
        bookedDate.toDateString() === date.toDateString()
      )
    }

    const isDateSelected = (date: Date) => {
      return selectedDate?.toDateString() === date.toDateString()
    }

    const isDateToday = (date: Date) => {
      return today.toDateString() === date.toDateString()
    }

    const isPastDate = (date: Date) => {
      return date < today
    }

    const handleDateClick = (day: number) => {
      const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      if (!isPastDate(clickedDate) && onDateSelect) {
        onDateSelect(clickedDate)
      }
    }

    const navigateMonth = (direction: 'prev' | 'next') => {
      setCurrentMonth(prev => {
        const newMonth = new Date(prev)
        if (direction === 'prev') {
          newMonth.setMonth(prev.getMonth() - 1)
        } else {
          newMonth.setMonth(prev.getMonth() + 1)
        }
        return newMonth
      })
    }

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ]

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    return (
      <div className={cn("p-3", className)} ref={ref} {...props}>
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before the first day of the month */}
          {Array.from({ length: firstDayOfMonth }, (_, i) => (
            <div key={`empty-${i}`} className="h-10" />
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
            const isBooked = isDateBooked(date)
            const isSelected = isDateSelected(date)
            const isToday = isDateToday(date)
            const isPast = isPastDate(date)

            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                disabled={isPast || isBooked}
                className={cn(
                  "h-10 w-10 text-sm rounded-md transition-colors",
                  "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500",
                  {
                    "bg-blue-500 text-white hover:bg-blue-600": isSelected,
                    "bg-red-100 text-red-500 cursor-not-allowed": isBooked,
                    "text-gray-400 cursor-not-allowed": isPast,
                    "bg-blue-100 text-blue-600": isToday && !isSelected,
                    "text-gray-900": !isPast && !isBooked && !isSelected && !isToday,
                  }
                )}
              >
                {day}
              </button>
            )
          })}
        </div>
      </div>
    )
  }
)

Calendar.displayName = "Calendar"

export { Calendar }