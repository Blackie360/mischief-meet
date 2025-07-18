"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, LinkIcon, Plus, Share2, Twitter, Facebook, Linkedin, MessageCircle, Send, RefreshCw, Download } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { ShareSlider } from "@/components/share-slider"

interface Booking {
  id: number
  guest_name: string
  guest_email: string
  booking_date: string
  start_time: string
  end_time: string
  notes: string
  status: string
  created_at: string
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      fetchBookings()
    }
  }, [session])

  const fetchBookings = async () => {
    try {
      const response = await fetch(`/api/bookings?userId=${session?.user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      }
    } catch (error) {
      console.error("Error fetching bookings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const upcomingBookings = bookings.filter((booking) => {
    const bookingDateTime = new Date(`${booking.booking_date}T${booking.start_time}`)
    return bookingDateTime > new Date() && booking.status === "confirmed"
  })

  const pastBookings = bookings.filter((booking) => {
    const bookingDateTime = new Date(`${booking.booking_date}T${booking.start_time}`)
    return bookingDateTime <= new Date() || booking.status !== "confirmed"
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const copyBookingLink = async () => {
    const link = `${window.location.origin}/${session?.user?.username}`
    try {
      await navigator.clipboard.writeText(link)
      toast({
        title: "Success!",
        description: "Booking link copied to clipboard",
      })
    } catch (error) {
      console.error("Failed to copy link:", error)
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = link
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      toast({
        title: "Success!",
        description: "Booking link copied to clipboard",
      })
    }
  }

  const shareToSocialMedia = (platform: string) => {
    const link = `${window.location.origin}/${session?.user?.username}`
    const text = `Book a meeting with me using MeetMischief!`
    
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " " + link)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`
    }
    
    window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400')
  }

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm("Are you sure you want to cancel this booking?")) {
      return
    }

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Booking cancelled successfully",
        })
        fetchBookings() // Refresh the bookings list
      } else {
        throw new Error("Failed to cancel booking")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel booking. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleRescheduleBooking = (bookingId: number) => {
    toast({
      title: "Reschedule Feature",
      description: "Reschedule functionality coming soon! For now, please cancel and create a new booking.",
    })
  }

  const handleRefreshData = async () => {
    setIsLoading(true)
    await fetchBookings()
    toast({
      title: "Refreshed!",
      description: "Dashboard data has been updated",
    })
  }

  const handleExportBookings = () => {
    const csvContent = [
      ["Guest Name", "Email", "Date", "Start Time", "End Time", "Status", "Notes"],
      ...bookings.map(booking => [
        booking.guest_name,
        booking.guest_email,
        booking.booking_date,
        booking.start_time,
        booking.end_time,
        booking.status,
        booking.notes || ""
      ])
    ].map(row => row.map(field => `"${field}"`).join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    toast({
      title: "Export Complete!",
      description: "Your bookings have been exported to CSV",
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {session?.user?.name || "there"}! 🎭</h1>
          <p className="text-gray-600 mt-2">Ready to cause some scheduling mischief?</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={handleRefreshData} variant="outline" className="flex items-center gap-2 bg-transparent">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button onClick={handleExportBookings} variant="outline" className="flex items-center gap-2 bg-transparent">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button onClick={copyBookingLink} variant="outline" className="flex items-center gap-2 bg-transparent">
            <LinkIcon className="w-4 h-4" />
            Copy Link
          </Button>
          <Button
            asChild
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Link href="/dashboard/availability" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Set Availability
            </Link>
          </Button>
        </div>
      </div>

      {/* Share Your Booking Link */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-purple-600" />
            Share Your Booking Link
          </CardTitle>
          <CardDescription>Let others know they can book time with you</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* URL Display with Copy Button */}
            <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors">
              <code className="flex-1 text-sm text-gray-700 font-mono">
                {typeof window !== 'undefined' ? `${window.location.origin}/${session?.user?.username}` : `/${session?.user?.username}`}
              </code>
              <Button 
                onClick={copyBookingLink} 
                size="sm" 
                variant="outline"
                className="hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-all duration-200"
              >
                <LinkIcon className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Sliding Share Button */}
            <ShareSlider 
              onShare={shareToSocialMedia}
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
            <p className="text-xs opacity-90">All time bookings</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Upcoming</CardTitle>
            <Clock className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingBookings.length}</div>
            <p className="text-xs opacity-90">Meetings scheduled</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">This Month</CardTitle>
            <Users className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                bookings.filter((booking) => {
                  const bookingDate = new Date(booking.booking_date)
                  const now = new Date()
                  return bookingDate.getMonth() === now.getMonth() && bookingDate.getFullYear() === now.getFullYear()
                }).length
              }
            </div>
            <p className="text-xs opacity-90">Monthly bookings</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Bookings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Upcoming Meetings
          </CardTitle>
          <CardDescription>Your scheduled meetings for the coming days</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingBookings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No upcoming meetings scheduled</p>
              <Button asChild variant="outline">
                <Link href="/dashboard/availability">Set Your Availability</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingBookings.slice(0, 5).map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{booking.guest_name}</h3>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Confirmed
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{booking.guest_email}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(booking.booking_date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                      </span>
                    </div>
                    {booking.notes && <p className="text-sm text-gray-600 mt-2 italic">"{booking.notes}"</p>}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancelBooking(booking.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRescheduleBooking(booking.id)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      Reschedule
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {pastBookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-600" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your past meetings and activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pastBookings.slice(0, 3).map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-700">{booking.guest_name}</h3>
                      <Badge variant="outline" className="text-gray-600">
                        Completed
                      </Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(booking.booking_date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      <Toaster />
    </div>
  )
}
