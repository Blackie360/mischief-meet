"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { EnhancedCalendar } from "@/components/enhanced-calendar"
import { TimeSlotSelector } from "@/components/time-slot-selector"
import { BookingStepIndicator } from "@/components/booking-step-indicator"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface BookingFormProps {
  hostId: string
  hostName: string
  availability: Array<{
    day_of_week: number
    start_time: string
    end_time: string
  }>
  timezone: string
  defaultDuration?: number
  allowedDurations?: number[]
}

export function BookingForm({ 
  hostId, 
  hostName, 
  availability, 
  timezone, 
  defaultDuration = 30, 
  allowedDurations = [15, 30, 60] 
}: BookingFormProps) {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [selectedDuration, setSelectedDuration] = useState<number>(defaultDuration)
  const [guestName, setGuestName] = useState("")
  const [guestEmail, setGuestEmail] = useState("")
  const [emailError, setEmailError] = useState("")
  const [nameError, setNameError] = useState("")
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isBooked, setIsBooked] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const { toast } = useToast()

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  
  const getAvailableSlots = (date: Date) => {
    const dayOfWeek = date.getDay()
    const dayAvailability = availability.find((a) => a.day_of_week === dayOfWeek)

    if (!dayAvailability) return []

    const slots = []
    const start = new Date(`2000-01-01T${dayAvailability.start_time}`)
    const end = new Date(`2000-01-01T${dayAvailability.end_time}`)

    while (start < end) {
      slots.push(start.toTimeString().slice(0, 5))
      start.setMinutes(start.getMinutes() + 30) // 30-minute slots
    }

    return slots
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDate || !selectedTime) return

    // Validate email before submission
    if (!validateEmail(guestEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address to receive your confirmation.",
        variant: "destructive",
      })
      return
    }

    // Validate required fields
    if (!guestName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name to complete the booking.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostId,
          guestName,
          guestEmail,
          bookingDate: selectedDate.toISOString().split("T")[0],
          startTime: selectedTime,
          endTime: getEndTime(selectedTime),
          duration: selectedDuration,
          notes,
        }),
      })

      if (response.ok) {
        setIsBooked(true)
        setIsDetailsDialogOpen(false)
        toast({
          title: "Booking confirmed!",
          description: "You'll receive a confirmation email shortly.",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Booking failed",
          description: error.error || "Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/
    if (!email) {
      setEmailError("Email is required")
      return false
    }
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address")
      return false
    }
    setEmailError("")
    return true
  }

  const validateName = (name: string) => {
    if (!name.trim()) {
      setNameError("Name is required")
      return false
    }
    if (name.trim().length < 2) {
      setNameError("Name must be at least 2 characters")
      return false
    }
    setNameError("")
    return true
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value
    setGuestEmail(email)
    if (email) {
      validateEmail(email)
    } else {
      setEmailError("")
    }
  }
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setGuestName(name)
    if (name) {
      validateName(name)
    } else {
      setNameError("")
    }
  }

  const getEndTime = (startTime: string) => {
    const [hours, minutes] = startTime.split(":").map(Number)
    const endDate = new Date(2000, 0, 1, hours, minutes + selectedDuration)
    return endDate.toTimeString().slice(0, 5)
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (remainingMinutes === 0) {
      return `${hours}h`
    }
    return `${hours}h ${remainingMinutes}m`
  }

  const isDateAvailable = (date: Date) => {
    const dayOfWeek = date.getDay()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return date >= today && availability.some((a) => a.day_of_week === dayOfWeek)
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    setIsDetailsDialogOpen(true)
  }

  if (isBooked) {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="bg-green-50 rounded-2xl p-8 border border-green-200 shadow-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-green-800 mb-3">Booking Confirmed!</h3>
          <p className="text-green-700 mb-6">
            Your meeting with {hostName} has been scheduled. You'll receive a confirmation email shortly.
          </p>
          
          {/* Booking Summary */}
          <div className="bg-white rounded-xl p-5 mb-6 border border-green-200 shadow-sm">
            <h4 className="text-lg font-semibold text-green-800 mb-3">Booking Details</h4>
            <div className="space-y-3 text-left">
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-3 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium text-gray-900">
                    {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-3 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">Time ({timezone})</p>
                  <p className="font-medium text-gray-900">{selectedTime} - {getEndTime(selectedTime)}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-3 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-medium text-gray-900">{formatDuration(selectedDuration)}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-3 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">Meeting Link</p>
                  <p className="font-medium text-blue-600">Will be sent to your email</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => window.location.reload()}
              className="bg-green-600 hover:bg-green-700"
            >
              Book another meeting
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => window.location.href = "/"}
              className="border-green-600 text-green-700 hover:bg-green-50"
            >
              Return to homepage
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Step Indicator */}
      <BookingStepIndicator
        steps={[
          { id: 'date', name: 'Date' },
          { id: 'time', name: 'Time' },
          { id: 'details', name: 'Details' }
        ]}
        currentStep={
          !selectedDate ? 'date' : 
          !selectedTime ? 'time' : 
          'details'
        }
        completedSteps={[
          ...(selectedDate ? ['date'] : []),
          ...(selectedTime ? ['time'] : []),
          ...(guestName && guestEmail ? ['details'] : [])
        ]}
        className="mb-8"
      />

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Date Selection */}
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Select a date
            </h3>
            <p className="text-gray-600 text-sm mb-4">Choose your preferred meeting date</p>
          </div>
          <div className="flex justify-center">
            <EnhancedCalendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => !isDateAvailable(date)}
              availability={availability}
            />
          </div>
        </div>

        {/* Time Selection */}
        <div className="space-y-6">
          {selectedDate && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Available times
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <TimeSlotSelector
                  availableSlots={getAvailableSlots(selectedDate)}
                  selectedTime={selectedTime}
                  onTimeSelect={handleTimeSelect}
                  hostTimezone={timezone}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-[550px] max-h-[90vh] p-4 sm:p-6 rounded-lg overflow-y-auto bg-white">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Your details
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Tell us about yourself
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-5">
              {/* Name Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center">
                    Your name
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                </div>
                <div className="relative">
                  <Input 
                    id="name" 
                    value={guestName} 
                    onChange={handleNameChange} 
                    required 
                    className={`mt-1 h-12 pl-10 border-2 transition-all ${
                      nameError 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'focus:border-blue-500'
                    }`}
                    placeholder="Enter your full name"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                {nameError && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {nameError}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center">
                    Email address
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                </div>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={guestEmail}
                    onChange={handleEmailChange}
                    required
                    className={`mt-1 h-12 pl-10 border-2 transition-all ${
                      emailError 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'focus:border-blue-500'
                    }`}
                    placeholder="your.email@example.com"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                {emailError && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {emailError}
                  </p>
                )}
              </div>

              {/* Duration Selection */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <Label htmlFor="duration" className="text-sm font-medium text-gray-700 mb-2 block">Meeting duration</Label>
                <div className="grid grid-cols-3 gap-2">
                  {allowedDurations.map((duration) => (
                    <Button
                      key={duration}
                      type="button"
                      variant={selectedDuration === duration ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedDuration(duration)}
                      className={`h-11 text-sm transition-all ${
                        selectedDuration === duration 
                          ? 'bg-purple-600 hover:bg-purple-700 text-white border-purple-600' 
                          : 'hover:border-purple-300 hover:bg-purple-50 border-2'
                      }`}
                    >
                      {formatDuration(duration)}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center mt-3 text-blue-600 text-sm">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>
                    {selectedTime} - {selectedTime ? getEndTime(selectedTime) : '--:--'}
                  </p>
                </div>
              </div>

              {/* Notes Field */}
              <div>
                <Label htmlFor="notes" className="text-sm font-medium text-gray-700 mb-1 block">Additional notes</Label>
                <div className="relative">
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Anything you'd like to share about the meeting?"
                    className="min-h-[100px] resize-none border-2 focus:border-blue-500 pl-10 pt-3 transition-all"
                  />
                  <div className="absolute left-3 top-3 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Summary */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 mt-6">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Booking Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium text-gray-900">
                    {selectedDate?.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium text-gray-900">{selectedTime} - {selectedTime ? getEndTime(selectedTime) : '--:--'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium text-gray-900">{formatDuration(selectedDuration)}</span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Booking...
                  </div>
                ) : (
                  "Confirm booking"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}