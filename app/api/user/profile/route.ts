import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const { name, username, bio, timezone, defaultDuration, allowedDurations } = body

    // Validate required fields
    if (!name || !username) {
      return NextResponse.json({ error: "Name and username are required" }, { status: 400 })
    }

    // Validate duration settings
    if (defaultDuration && (defaultDuration < 15 || defaultDuration > 240)) {
      return NextResponse.json({ error: "Default duration must be between 15 and 240 minutes" }, { status: 400 })
    }

    // Check if username is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        username,
        NOT: {
          id: session.user.id
        }
      }
    })

    if (existingUser) {
      return NextResponse.json({ error: "Username is already taken" }, { status: 409 })
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        username,
        bio: bio || null,
        timezone: timezone || "UTC",
        defaultDuration: defaultDuration || 30,
        allowedDurations: allowedDurations || [15, 30, 60],
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        bio: true,
        timezone: true,
        defaultDuration: true,
        allowedDurations: true,
      }
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
    })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}