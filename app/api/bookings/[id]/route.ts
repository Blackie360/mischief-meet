import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const bookingId = parseInt(params.id)

    if (isNaN(bookingId)) {
      return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 })
    }

    // Check if the booking exists and belongs to the user
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        hostId: session.user.id,
      },
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Update booking status to cancelled instead of deleting
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "cancelled" },
    })

    return NextResponse.json({
      success: true,
      message: "Booking cancelled successfully",
    })
  } catch (error) {
    console.error("Booking cancellation error:", error)
    return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const bookingId = parseInt(params.id)
    const body = await request.json()
    const { bookingDate, startTime, endTime, notes } = body

    if (isNaN(bookingId)) {
      return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 })
    }

    // Check if the booking exists and belongs to the user
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        hostId: session.user.id,
      },
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Update the booking
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        bookingDate: bookingDate ? new Date(bookingDate) : undefined,
        startTime: startTime ? new Date(`1970-01-01T${startTime}`) : undefined,
        endTime: endTime ? new Date(`1970-01-01T${endTime}`) : undefined,
        notes: notes !== undefined ? notes : undefined,
      },
    })

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message: "Booking updated successfully",
    })
  } catch (error) {
    console.error("Booking update error:", error)
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
  }
}