"use client"

import type React from "react"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, Settings, User, BarChart3, LogOut } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return // Still loading
    if (!session) router.push("/auth/signin")
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                MeetMischief
              </span>
            </Link>

            <nav className="hidden md:flex space-x-8">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-purple-600 transition-colors flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                href="/dashboard/availability"
                className="text-gray-600 hover:text-purple-600 transition-colors flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Availability
              </Link>
              <Link
                href="/dashboard/settings"
                className="text-gray-600 hover:text-purple-600 transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Button asChild variant="outline" size="sm">
                <Link href={`/${session.user?.username}`} target="_blank">
                  <User className="w-4 h-4 mr-2" />
                  View Public Page
                </Link>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 py-4">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-purple-600 transition-colors flex items-center gap-2 text-sm"
            >
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              href="/dashboard/availability"
              className="text-gray-600 hover:text-purple-600 transition-colors flex items-center gap-2 text-sm"
            >
              <Calendar className="w-4 h-4" />
              Availability
            </Link>
            <Link
              href="/dashboard/settings"
              className="text-gray-600 hover:text-purple-600 transition-colors flex items-center gap-2 text-sm"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  )
}
