"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { AvailabilitySettings } from "@/components/availability-settings"
import { Toaster } from "@/components/ui/toaster"
import { Skeleton } from "@/components/ui/skeleton"

export default function AvailabilityPage() {
  const { data: session } = useSession()
  const [initialAvailability, setInitialAvailability] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAvailability = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/user/availability?userId=${session.user.id}`)
          if (response.ok) {
            const data = await response.json()
            setInitialAvailability(data.availability)
          }
        } catch (error) {
          console.error("Error fetching availability:", error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchAvailability()
  }, [session])

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Availability Settings</h1>
        <p className="text-gray-600 mt-2">Set your weekly schedule and when you're available for meetings.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <AvailabilitySettings initialAvailability={initialAvailability} />
      )}

      <Toaster />
    </div>
  )
}