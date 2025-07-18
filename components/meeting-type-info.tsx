"use client"

import { Clock, Calendar, Video } from "lucide-react"
import { cn } from "@/lib/utils"

interface MeetingTypeInfoProps {
  title: string
  duration: number
  description?: string
  className?: string
}

export function MeetingTypeInfo({
  title,
  duration,
  description,
  className
}: MeetingTypeInfoProps) {
  // Format duration for display
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (remainingMinutes === 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`
    }
    return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} min`
  }

  return (
    <div className={cn("bg-white rounded-xl p-6 border border-gray-200 shadow-sm", className)}>
      <div className="space-y-4">
        {/* Meeting Type Header */}
        <div className="flex items-center space-x-2">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Video className="h-5 w-5 text-purple-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        </div>
        
        {/* Duration */}
        <div className="flex items-center text-gray-600">
          <Clock className="h-4 w-4 mr-2" />
          <span>{formatDuration(duration)}</span>
        </div>
        
        {/* Description */}
        {description && (
          <div className="pt-3 border-t border-gray-100">
            <p className="text-gray-700 text-sm">{description}</p>
          </div>
        )}
        
        {/* Meeting Info */}
        <div className="bg-blue-50 rounded-lg p-4 text-sm">
          <div className="flex">
            <Calendar className="h-4 w-4 text-blue-600 mr-2 mt-0.5" />
            <div>
              <p className="text-blue-800 font-medium">Web conferencing details</p>
              <p className="text-blue-600 mt-1">
                A link to join this meeting will be provided after you schedule.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}