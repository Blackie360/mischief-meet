import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET /api/user/availability
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") || session.user.id

    // Check if the user is requesting their own availability or if they're an admin
    if (userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { availability: true }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ availability: user.availability || {} })
  } catch (error) {
    console.error("Error fetching availability:", error)
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    )
  }
}

// PUT /api/user/availability
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { availability } = await request.json()

    // Validate availability data
    if (!availability || typeof availability !== "object") {
      return NextResponse.json(
        { error: "Invalid availability data" },
        { status: 400 }
      )
    }

    // Update user's availability
    try {
      // First, get the current user to check if they exist
      const user = await prisma.user.findUnique({
        where: { id: session.user.id }
      })
      
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }
      
      // Use a direct SQL query to update the JSON field
      // This bypasses Prisma's type checking for the JSON field
      const jsonData = JSON.stringify(availability)
      
      // Use a raw SQL query with proper parameter binding
      await prisma.$queryRawUnsafe(
        `UPDATE "User" SET "availability" = $1::jsonb WHERE "id" = $2::uuid`,
        jsonData,
        session.user.id
      )
      
      // SYNC WITH AVAILABILITY TABLE
      // First, delete all existing availability records for this user
      await prisma.availability.deleteMany({
        where: { userId: session.user.id }
      })
      
      // Then, create new availability records based on the JSON data
      const availabilityRecords = []
      
      // Map day names to day of week numbers (0 = Sunday, 6 = Saturday)
      const dayMapping = {
        sunday: 0,
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6
      }
      
      // Process each day in the availability object
      for (const [day, dayData] of Object.entries(availability)) {
        // Skip if the day is not enabled
        if (!dayData.enabled) continue
        
        // Get the day of week number
        const dayOfWeek = dayMapping[day]
        
        // Process each time range for the day
        for (const range of dayData.timeRanges) {
          // Create a base date to set the time on (actual date doesn't matter, just the time)
          const baseDate = new Date('2000-01-01')
          
          // Parse start time
          const [startHour, startMinute] = range.start.split(':').map(Number)
          const startTime = new Date(baseDate)
          startTime.setHours(startHour, startMinute, 0, 0)
          
          // Parse end time
          const [endHour, endMinute] = range.end.split(':').map(Number)
          const endTime = new Date(baseDate)
          endTime.setHours(endHour, endMinute, 0, 0)
          
          // Add to records to be created
          availabilityRecords.push({
            userId: session.user.id,
            dayOfWeek,
            startTime,
            endTime
          })
        }
      }
      
      // Create all the new availability records
      if (availabilityRecords.length > 0) {
        await prisma.availability.createMany({
          data: availabilityRecords
        })
      }
      
    } catch (error) {
      console.error("Error updating availability:", error)
      return NextResponse.json(
        { error: "Failed to update availability in database" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating availability:", error)
    return NextResponse.json(
      { error: "Failed to update availability" },
      { status: 500 }
    )
  }
}