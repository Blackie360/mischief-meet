"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

const DAYS = [
  { id: 0, name: "Sunday", short: "Sun" },
  { id: 1, name: "Monday", short: "Mon" },
  { id: 2, name: "Tuesday", short: "Tue" },
  { id: 3, name: "Wednesday", short: "Wed" },
  { id: 4, name: "Thursday", short: "Thu" },
  { id: 5, name: "Friday", short: "Fri" },
  { id: 6, name: "Saturday", short: "Sat" },
]

interface AvailabilitySlot {
  day_of_week: number
  start_time: string
  end_time: string
  enabled: boolean
}

export default function AvailabilityPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [availability, setAvailability] = useState<AvailabilitySlot[]>(
    DAYS.map((day) => ({
      day_of_week: day.id,
      start_time: "09:00",
      end_time: "17:00",
      enabled: day.id >= 1 && day.id <= 5, // Monday to Friday by default
    })),
  )
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (session?.user?.id) {
      fetchAvailability()
    }
  }, [session])

  const fetchAvailability = async () => {
    try {
      const response = await fetch("/api/availability")
      if (response.ok) {
        const data = await response.json()
        if (data.length > 0) {
          const availabilityMap = new Map(data.map((slot: any) => [slot.day_of_week, slot]))
          setAvailability((prev) =>
            prev.map((slot) => {
              const existing = availabilityMap.get(slot.day_of_week)
              return existing ? { ...existing, enabled: true } : { ...slot, enabled: false }
            }),
          )
        }
      }
    } catch (error) {
      console.error("Error fetching availability:", error)
    }
  }

  const handleAvailabilityChange = (dayId: number, field: string, value: any) => {
    setAvailability((prev) => prev.map((slot) => (slot.day_of_week === dayId ? { ...slot, [field]: value } : slot)))
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability: availability.filter((slot) => slot.enabled) }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Your availability has been updated.",
        })
      } else {
        throw new Error("Failed to save availability")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save availability. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Set Your Availability</h1>
        <p className="text-gray-600 mt-2">Choose when you're available for bookings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
          <CardDescription>Set your available hours for each day of the week.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {DAYS.map((day) => {
            const slot = availability.find((s) => s.day_of_week === day.id)!
            return (
              <div key={day.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${day.id}`}
                    checked={slot.enabled}
                    onCheckedChange={(checked) => handleAvailabilityChange(day.id, "enabled", checked)}
                  />
                  <Label htmlFor={`day-${day.id}`} className="w-20">
                    {day.name}
                  </Label>
                </div>

                {slot.enabled && (
                  <div className="flex items-center space-x-2 flex-1">
                    <Input
                      type="time"
                      value={slot.start_time}
                      onChange={(e) => handleAvailabilityChange(day.id, "start_time", e.target.value)}
                      className="w-32"
                    />
                    <span className="text-gray-500">to</span>
                    <Input
                      type="time"
                      value={slot.end_time}
                      onChange={(e) => handleAvailabilityChange(day.id, "end_time", e.target.value)}
                      className="w-32"
                    />
                  </div>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Availability"}
        </Button>
      </div>

      <Toaster />
    </div>
  )
}
