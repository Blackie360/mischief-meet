import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const availability = await prisma.availability.findMany({
      where: { userId: session.user.id },
      select: {
        dayOfWeek: true,
        startTime: true,
        endTime: true,
      },
      orderBy: { dayOfWeek: 'asc' }
    })

    return NextResponse.json(availability)
  } catch (error) {
    console.error("Error fetching availability:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { availability } = await request.json()

    // Delete existing availability
    await prisma.availability.deleteMany({
      where: { userId: session.user.id }
    })

    // Insert new availability
    if (availability.length > 0) {
      await prisma.availability.createMany({
        data: availability.map((slot: any) => ({
          userId: session.user.id,
          dayOfWeek: slot.day_of_week,
          startTime: new Date(`1970-01-01T${slot.start_time}`),
          endTime: new Date(`1970-01-01T${slot.end_time}`),
        }))
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving availability:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
