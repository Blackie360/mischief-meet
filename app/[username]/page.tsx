import { notFound } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import { BookingForm } from "@/components/booking-form"
import { HostDetails } from "@/components/host-details"
import { MeetingTypeInfo } from "@/components/meeting-type-info"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { Metadata } from "next"

const prisma = new PrismaClient()

interface Props {
  params: { username: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = params

  const userData = await prisma.user.findUnique({
    where: { username },
    select: {
      name: true,
      bio: true,
    }
  })

  if (!userData) {
    return {
      title: "User Not Found - MeetMischief",
      description: "The requested user profile could not be found.",
    }
  }

  const title = `Book a meeting with ${userData.name || username} - MeetMischief`
  const description = userData.bio || `Schedule a meeting with ${userData.name || username} using MeetMischief. Choose your preferred date and time from their available slots.`
  const url = `${process.env.NEXT_PUBLIC_APP_URL || 'https://meetmischief.com'}/${username}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url,
      siteName: "MeetMischief",
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://meetmischief.com'}/api/og?username=${username}&name=${encodeURIComponent(userData.name || username)}`,
          width: 1200,
          height: 630,
          alt: `Book a meeting with ${userData.name || username}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${process.env.NEXT_PUBLIC_APP_URL || 'https://meetmischief.com'}/api/og?username=${username}&name=${encodeURIComponent(userData.name || username)}`],
    },
  }
}

export default async function PublicBookingPage({ params }: Props) {
  const { username } = params

  // Get user details
  const userData = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      timezone: true,
      defaultDuration: true,
      allowedDurations: true,
      image: true,
    }
  })

  if (!userData) {
    notFound()
  }

  // Get availability
  const availabilityData = await prisma.availability.findMany({
    where: { userId: userData.id },
    select: {
      dayOfWeek: true,
      startTime: true,
      endTime: true,
    },
    orderBy: { dayOfWeek: 'asc' }
  })

  // Transform availability data to match expected format
  const availability = availabilityData.map(item => ({
    day_of_week: item.dayOfWeek,
    start_time: item.startTime.toTimeString().slice(0, 5),
    end_time: item.endTime.toTimeString().slice(0, 5),
  }))

  // Default meeting title and description if not provided
  const meetingTitle = `${userData.defaultDuration} minutes meeting with ${userData.name || username}`
  const meetingDescription = userData.bio || `Schedule time with ${userData.name || username}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Main Booking Section - Two Column Layout */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="lg:grid lg:grid-cols-12">
            {/* Left Column - Host Information */}
            <div className="lg:col-span-4 bg-gradient-to-b from-gray-50 to-white border-r border-gray-100">
              <div className="p-8 lg:p-10 h-full flex flex-col">
                {/* Logo/Brand Section */}
                <div className="mb-8">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                      {userData.name?.charAt(0) || username.charAt(0)}
                    </div>
                    <h3 className="ml-3 font-semibold text-gray-800">
                      {userData.name || username}
                    </h3>
                  </div>
                </div>

                {/* Host Details */}
                <HostDetails
                  name={userData.name || username}
                  avatarUrl={userData.image || "/placeholder-user.jpg"}
                  bio={userData.bio}
                  className="mb-6"
                />

                {/* Meeting Type Info */}
                <MeetingTypeInfo
                  title={meetingTitle}
                  duration={userData.defaultDuration || 30}
                  description={meetingDescription}
                  className="mt-6"
                />

                {/* Spacer for mobile layout */}
                <div className="hidden lg:block mt-auto pt-8 border-t border-gray-100">
                  <p className="text-xs text-gray-500">Powered by MeetMischief</p>
                </div>
              </div>
            </div>

            {/* Right Column - Booking Form */}
            <div className="lg:col-span-8">
              <div className="p-8 lg:p-10">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Select Date & Time
                </h2>

                <BookingForm
                  hostId={userData.id}
                  hostName={userData.name || userData.email || 'Host'}
                  availability={availability}
                  timezone={userData.timezone || 'UTC'}
                  defaultDuration={userData.defaultDuration || 30}
                  allowedDurations={userData.allowedDurations || [15, 30, 60]}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Only visible on mobile */}
        <div className="lg:hidden text-center mt-12 text-gray-500">
          <p className="text-sm">Powered by MeetMischief</p>
        </div>
      </div>
    </div>
  )
}
