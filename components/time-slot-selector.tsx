"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Clock, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TimeSlotSelectorProps {
  availableSlots: string[]
  selectedTime: string
  onTimeSelect: (time: string) => void
  hostTimezone: string
  className?: string
}

export function TimeSlotSelector({
  availableSlots,
  selectedTime,
  onTimeSelect,
  hostTimezone,
  className
}: TimeSlotSelectorProps) {
  const [visitorTimezone, setVisitorTimezone] = useState<string>("")
  const [hoveredTime, setHoveredTime] = useState<string | null>(null)

  // Get visitor's timezone on component mount
  useEffect(() => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      setVisitorTimezone(timezone)
    } catch (error) {
      console.error("Error getting timezone:", error)
      setVisitorTimezone("Unknown")
    }
  }, [])

  // Format time for display (e.g., "09:30" to "9:30 AM")
  const formatTimeForDisplay = (time: string): string => {
    const [hours, minutes] = time.split(":").map(Number)
    const period = hours >= 12 ? "PM" : "AM"
    const displayHours = hours % 12 || 12
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`
  }

  // Check if timezones are different
  const isDifferentTimezone = hostTimezone !== visitorTimezone

  if (availableSlots.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="bg-gray-100 rounded-full p-3 mb-4">
            <Clock className="h-6 w-6 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No available times</h3>
          <p className="text-gray-600 text-sm max-w-xs">
            There are no available time slots for this date. Please select another date.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Timezone information */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center text-gray-600">
          <Clock className="h-4 w-4 mr-1" />
          <span>Host timezone: <span className="font-medium">{hostTimezone}</span></span>
        </div>
        
        {isDifferentTimezone && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center text-blue-600 cursor-help">
                  <span className="font-medium mr-1">Your timezone: {visitorTimezone}</span>
                  <Info className="h-4 w-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Times are shown in the host's timezone</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Time slots grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {availableSlots.map((time) => (
          <Button
            key={time}
            variant="outline"
            size="lg"
            onClick={() => onTimeSelect(time)}
            onMouseEnter={() => setHoveredTime(time)}
            onMouseLeave={() => setHoveredTime(null)}
            className={cn(
              "h-14 relative transition-all duration-200 border-2",
              {
                "bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300": 
                  hoveredTime === time && selectedTime !== time,
                "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700 shadow-md": 
                  selectedTime === time,
                "hover:border-blue-200 hover:bg-blue-50": 
                  hoveredTime !== time && selectedTime !== time
              }
            )}
          >
            <span className="text-base font-medium">{formatTimeForDisplay(time)}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}