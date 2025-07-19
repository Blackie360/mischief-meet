"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Clock, Save, X } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const DAYS_OF_WEEK = [
  { id: "monday", label: "Monday" },
  { id: "tuesday", label: "Tuesday" },
  { id: "wednesday", label: "Wednesday" },
  { id: "thursday", label: "Thursday" },
  { id: "friday", label: "Friday" },
  { id: "saturday", label: "Saturday" },
  { id: "sunday", label: "Sunday" },
]

const TIME_SLOTS = Array.from({ length: 24 * 4 }, (_, i) => {
  const hour = Math.floor(i / 4)
  const minute = (i % 4) * 15
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
})

interface TimeRange {
  start: string
  end: string
}

interface DayAvailability {
  enabled: boolean
  timeRanges: TimeRange[]
}

interface AvailabilitySettings {
  [key: string]: DayAvailability
}

const DEFAULT_AVAILABILITY: AvailabilitySettings = {
  monday: { enabled: true, timeRanges: [{ start: "09:00", end: "17:00" }] },
  tuesday: { enabled: true, timeRanges: [{ start: "09:00", end: "17:00" }] },
  wednesday: { enabled: true, timeRanges: [{ start: "09:00", end: "17:00" }] },
  thursday: { enabled: true, timeRanges: [{ start: "09:00", end: "17:00" }] },
  friday: { enabled: true, timeRanges: [{ start: "09:00", end: "17:00" }] },
  saturday: { enabled: false, timeRanges: [{ start: "09:00", end: "17:00" }] },
  sunday: { enabled: false, timeRanges: [{ start: "09:00", end: "17:00" }] },
}

export function AvailabilitySettings({ initialAvailability = null }) {
  // Ensure we have a complete availability object with all days
  const ensureCompleteAvailability = (availabilityData: any): AvailabilitySettings => {
    const result = { ...DEFAULT_AVAILABILITY };
    
    // If we have initial data, merge it with defaults
    if (availabilityData) {
      // For each day in the provided data, merge with defaults
      Object.keys(availabilityData).forEach(day => {
        if (result[day]) {
          result[day] = {
            ...result[day],
            ...availabilityData[day],
            // Ensure timeRanges exists
            timeRanges: availabilityData[day]?.timeRanges || result[day].timeRanges
          };
        }
      });
    }
    
    return result;
  };
  
  const [availability, setAvailability] = useState<AvailabilitySettings>(
    ensureCompleteAvailability(initialAvailability)
  )
  const [activeTab, setActiveTab] = useState("monday")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const formatTimeForDisplay = (time: string): string => {
    const [hours, minutes] = time.split(":").map(Number)
    const period = hours >= 12 ? "PM" : "AM"
    const displayHours = hours % 12 || 12
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`
  }

  const handleDayToggle = (day: string, enabled: boolean) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled,
      },
    }))
  }

  const handleTimeChange = (day: string, rangeIndex: number, field: "start" | "end", value: string) => {
    setAvailability(prev => {
      const updatedRanges = [...prev[day].timeRanges]
      updatedRanges[rangeIndex] = {
        ...updatedRanges[rangeIndex],
        [field]: value,
      }
      return {
        ...prev,
        [day]: {
          ...prev[day],
          timeRanges: updatedRanges,
        },
      }
    })
  }

  const addTimeRange = (day: string) => {
    setAvailability(prev => {
      const lastRange = prev[day].timeRanges[prev[day].timeRanges.length - 1]
      const newStart = lastRange.end
      let newEnd = TIME_SLOTS[TIME_SLOTS.indexOf(newStart) + 8] || "18:00" // Default to 2 hours later
      
      return {
        ...prev,
        [day]: {
          ...prev[day],
          timeRanges: [...prev[day].timeRanges, { start: newStart, end: newEnd }],
        },
      }
    })
  }

  const removeTimeRange = (day: string, rangeIndex: number) => {
    setAvailability(prev => {
      if (prev[day].timeRanges.length <= 1) {
        return prev // Don't remove the last time range
      }
      
      const updatedRanges = prev[day].timeRanges.filter((_, i) => i !== rangeIndex)
      return {
        ...prev,
        [day]: {
          ...prev[day],
          timeRanges: updatedRanges,
        },
      }
    })
  }

  const copyToAllDays = () => {
    const currentDaySettings = availability[activeTab]
    
    const updatedAvailability = { ...availability }
    DAYS_OF_WEEK.forEach(day => {
      if (day.id !== activeTab) {
        updatedAvailability[day.id] = {
          ...currentDaySettings,
          enabled: updatedAvailability[day.id].enabled, // Keep the enabled state
        }
      }
    })
    
    setAvailability(updatedAvailability)
    
    toast({
      title: "Time slots copied",
      description: `Applied ${activeTab}'s schedule to all other days.`,
    })
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/user/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Your availability has been updated successfully.",
        })
        
        // Redirect to dashboard after successful save
        router.push("/dashboard")
      } else {
        throw new Error("Failed to update availability")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update availability. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push("/dashboard")
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-600" />
          Set Your Availability
        </CardTitle>
        <CardDescription>Define when you're available for meetings.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Day selector tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-7 mb-4">
            {DAYS_OF_WEEK.map((day) => {
              const dayAvailability = availability[day.id] || { enabled: true, timeRanges: [] };
              return (
                <TabsTrigger 
                  key={day.id} 
                  value={day.id}
                  className={`relative ${!dayAvailability.enabled ? 'opacity-50' : ''}`}
                >
                  {day.label.substring(0, 3)}
                  {!dayAvailability.enabled && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-gray-400 rounded-full"></div>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {DAYS_OF_WEEK.map((day) => {
            const dayAvailability = availability[day.id] || { enabled: true, timeRanges: [{ start: "09:00", end: "17:00" }] };
            return (
              <TabsContent key={day.id} value={day.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`${day.id}-toggle`}
                      checked={dayAvailability.enabled}
                      onCheckedChange={(checked) => handleDayToggle(day.id, checked)}
                    />
                    <Label htmlFor={`${day.id}-toggle`} className="font-medium">
                      {dayAvailability.enabled ? "Available" : "Unavailable"}
                    </Label>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={copyToAllDays}
                    className="text-xs"
                  >
                    Copy to all days
                  </Button>
                </div>

                {dayAvailability.enabled && (
                  <div className="space-y-4">
                    {dayAvailability.timeRanges.map((range, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="grid grid-cols-2 gap-2 flex-1">
                          <div className="space-y-1">
                            <Label htmlFor={`${day.id}-start-${index}`} className="text-xs">Start Time</Label>
                            <select
                              id={`${day.id}-start-${index}`}
                              value={range.start}
                              onChange={(e) => handleTimeChange(day.id, index, "start", e.target.value)}
                              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                              disabled={!dayAvailability.enabled}
                            >
                              {TIME_SLOTS.map((time) => (
                                <option 
                                  key={time} 
                                  value={time}
                                  disabled={time >= range.end}
                                >
                                  {formatTimeForDisplay(time)}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor={`${day.id}-end-${index}`} className="text-xs">End Time</Label>
                            <select
                              id={`${day.id}-end-${index}`}
                              value={range.end}
                              onChange={(e) => handleTimeChange(day.id, index, "end", e.target.value)}
                              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                              disabled={!dayAvailability.enabled}
                            >
                              {TIME_SLOTS.map((time) => (
                                <option 
                                  key={time} 
                                  value={time}
                                  disabled={time <= range.start}
                                >
                                  {formatTimeForDisplay(time)}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        
                        {dayAvailability.timeRanges.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeTimeRange(day.id, index)}
                            className="h-9 w-9 rounded-full"
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Remove time range</span>
                          </Button>
                        )}
                      </div>
                    ))}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addTimeRange(day.id)}
                      className="mt-2"
                      disabled={!dayAvailability.enabled}
                    >
                      Add another time range
                    </Button>
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}