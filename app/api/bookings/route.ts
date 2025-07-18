import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"
import { sendBookingConfirmation } from "@/lib/email"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const { hostId, selectedDate, selectedTime, duration, guestName, guestEmail, notes } = body

    // Validate required fields
    if (!hostId || !selectedDate || !selectedTime || !duration || !guestName || !guestEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(guestEmail)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }

    // Validate duration
    if (duration < 15 || duration > 240) {
      return NextResponse.json({ error: "Duration must be between 15 and 240 minutes" }, { status: 400 })
    }

    // Get host information
    const host = await prisma.user.findUnique({
      where: { id: hostId },
      select: {
        id: true,
        name: true,
        email: true,
        timezone: true,
      }
    })

    if (!host) {
      return NextResponse.json({ error: "Host not found" }, { status: 404 })
    }

    // Calculate end time based on duration
    const startDateTime = new Date(`1970-01-01T${selectedTime}`)
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000)

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        hostId: host.id,
        guestName,
        guestEmail,
        bookingDate: new Date(selectedDate),
        startTime: startDateTime,
        endTime: endDateTime,
        notes: notes || "",
        status: "confirmed",
      }
    })

    const bookingId = booking.id

    // Format date and time for emails
    const eventDate = new Date(selectedDate).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const eventTime = new Date(`${selectedDate}T${selectedTime}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })

    // Send confirmation emails (don't fail the booking if emails fail)
    try {
      // Send email to guest
      await sendBookingConfirmation({
        to: guestEmail,
        hostName: host.name || "Host",
        guestName,
        guestEmail,
        eventTitle: `Meeting with ${host.name || "Host"}`,
        eventDate,
        eventTime,
        duration,
        isHost: false,
      })

      // Send email to host
      await sendBookingConfirmation({
        to: host.email,
        hostName: host.name || "Host",
        guestName,
        guestEmail,
        eventTitle: `Meeting with ${guestName}`,
        eventDate,
        eventTime,
        duration,
        isHost: true,
      })
    } catch (emailError) {
      console.error("Failed to send confirmation emails:", emailError)
      // Continue with successful booking response even if emails fail
    }

    return NextResponse.json({
      success: true,
      bookingId,
      message: "Booking created successfully",
    })
  } catch (error) {
    console.error("Booking creation error:", error)
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const bookings = await prisma.booking.findMany({
      where: { hostId: session.user.id },
      select: {
        id: true,
        guestName: true,
        guestEmail: true,
        bookingDate: true,
        startTime: true,
        endTime: true,
        notes: true,
        status: true,
        createdAt: true,
      },
      orderBy: [
        { bookingDate: 'desc' },
        { startTime: 'desc' }
      ]
    })

    // Transform the data to match the expected format
    const transformedBookings = bookings.map(booking => ({
      id: booking.id,
      guest_name: booking.guestName,
      guest_email: booking.guestEmail,
      booking_date: booking.bookingDate.toISOString().split('T')[0],
      start_time: booking.startTime.toTimeString().slice(0, 5),
      end_time: booking.endTime.toTimeString().slice(0, 5),
      notes: booking.notes,
      status: booking.status,
      created_at: booking.createdAt.toISOString(),
    }))

    return NextResponse.json(transformedBookings)
  } catch (error) {
    console.error("Failed to fetch bookings:", error)
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
  }
}
