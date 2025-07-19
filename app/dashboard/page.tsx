"use client"

import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, Settings, User, Link as LinkIcon } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { data: session } = useSession()
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {session?.user?.name || "there"}!</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              Set Your Availability
            </CardTitle>
            <CardDescription>Define when you're available for meetings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Configure your weekly schedule and let people book meetings during your available hours.
            </p>
            <Button asChild className="w-full">
              <Link href="/dashboard/availability">Manage Availability</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-purple-600" />
              Your Booking Link
            </CardTitle>
            <CardDescription>Share your personal booking page</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Share this link with others so they can book meetings with you.
            </p>
            <div className="flex items-center space-x-2">
              <div className="bg-gray-100 p-2 rounded-md text-sm flex-1 truncate">
                {`${typeof window !== 'undefined' ? window.location.origin : ''}/`}{session?.user?.username || "your-username"}
              </div>
              <Button variant="outline" size="icon" onClick={() => {
                navigator.clipboard.writeText(`${typeof window !== 'undefined' ? window.location.origin : ''}/${session?.user?.username || "your-username"}`)
              }}>
                <LinkIcon className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-600" />
              Account Settings
            </CardTitle>
            <CardDescription>Manage your profile and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Update your profile information, timezone, and meeting preferences.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/settings">Edit Settings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}