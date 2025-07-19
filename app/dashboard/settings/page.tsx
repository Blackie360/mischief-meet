"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { User, Globe, Clock, Save, RefreshCw } from "lucide-react"

const TIMEZONES = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Shanghai", label: "Shanghai (CST)" },
  { value: "Australia/Sydney", label: "Sydney (AEST)" },
]

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isDetectingTimezone, setIsDetectingTimezone] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    bio: "",
    timezone: "UTC",
    defaultDuration: 30,
    allowedDurations: [15, 30, 60],
  })

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || "",
        username: session.user.username || "",
        bio: session.user.bio || "",
        timezone: session.user.timezone || "UTC",
        defaultDuration: session.user.defaultDuration || 30,
        allowedDurations: session.user.allowedDurations || [15, 30, 60],
      })
    }
  }, [session])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }
  
  const detectUserTimezone = () => {
    setIsDetectingTimezone(true)
    try {
      // Get the user's timezone using Intl API
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      
      // Check if the detected timezone is in our list
      const isSupported = TIMEZONES.some(tz => tz.value === userTimezone)
      
      if (userTimezone && isSupported) {
        // Update the form data with the detected timezone
        setFormData(prev => ({ ...prev, timezone: userTimezone }))
        toast({
          title: "Timezone Detected",
          description: `Your timezone has been set to ${userTimezone}.`,
        })
      } else {
        // If timezone is not in our list, find the closest match or use UTC
        const fallbackTimezone = getFallbackTimezone(userTimezone)
        setFormData(prev => ({ ...prev, timezone: fallbackTimezone }))
        toast({
          title: "Timezone Detected",
          description: `Your timezone was detected as ${userTimezone}, using ${fallbackTimezone} from our supported list.`,
        })
      }
    } catch (error) {
      console.error("Error detecting timezone:", error)
      toast({
        title: "Error",
        description: "Failed to detect your timezone. Please select it manually.",
        variant: "destructive",
      })
    } finally {
      setIsDetectingTimezone(false)
    }
  }
  
  // Helper function to find the closest matching timezone from our list
  const getFallbackTimezone = (detectedTimezone: string) => {
    // Try to match by region
    const region = detectedTimezone.split('/')[0]
    const regionMatch = TIMEZONES.find(tz => tz.value.startsWith(region))
    
    if (regionMatch) return regionMatch.value
    
    // Default to UTC if no match
    return "UTC"
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        // Update the session with new data
        await update({
          ...session,
          user: {
            ...session?.user,
            ...formData,
          },
        })

        toast({
          title: "Success",
          description: "Your profile has been updated successfully.",
        })
      } else {
        throw new Error("Failed to update profile")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your profile and preferences.</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-purple-600" />
            Profile Information
          </CardTitle>
          <CardDescription>Update your public profile information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                placeholder="your-username"
              />
              <p className="text-xs text-gray-500">
                Your booking link: /{formData.username || "your-username"}
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              placeholder="Tell people a bit about yourself..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Meeting Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            Meeting Preferences
          </CardTitle>
          <CardDescription>Set your default meeting duration and preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="defaultDuration">Default Meeting Duration</Label>
            <Select 
              value={formData.defaultDuration?.toString() || "30"} 
              onValueChange={(value) => handleInputChange("defaultDuration", parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select default duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              This will be the default duration when people book meetings with you
            </p>
          </div>
          
          <div className="space-y-2">
            <Label>Available Duration Options</Label>
            <div className="grid grid-cols-2 gap-2">
              {[15, 30, 45, 60, 90, 120].map((duration) => (
                <div key={duration} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`duration-${duration}`}
                    checked={formData.allowedDurations?.includes(duration) || false}
                    onChange={(e) => {
                      const current = formData.allowedDurations || [15, 30, 60]
                      const updated = e.target.checked
                        ? [...current, duration]
                        : current.filter(d => d !== duration)
                      handleInputChange("allowedDurations", updated)
                    }}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor={`duration-${duration}`} className="text-sm">
                    {duration < 60 ? `${duration} min` : `${duration / 60}h`}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              Select which duration options guests can choose from
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Timezone Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-purple-600" />
            Timezone
          </CardTitle>
          <CardDescription>Set your timezone for accurate scheduling.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="timezone" className="text-sm font-medium">Timezone</Label>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={detectUserTimezone}
                disabled={isDetectingTimezone}
                className="flex items-center gap-1 text-xs"
              >
                <RefreshCw className={`w-3 h-3 ${isDetectingTimezone ? 'animate-spin' : ''}`} />
                {isDetectingTimezone ? 'Detecting...' : 'Auto-detect'}
              </Button>
            </div>
            <Select value={formData.timezone} onValueChange={(value) => handleInputChange("timezone", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your timezone" />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Your timezone is used to display meeting times correctly for you and your guests.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            Account Information
          </CardTitle>
          <CardDescription>Your account details and status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Email</Label>
              <p className="text-sm text-gray-900">{session?.user?.email}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Account Created</Label>
              <p className="text-sm text-gray-900">
                {session?.user?.createdAt 
                  ? new Date(session.user.createdAt).toLocaleDateString()
                  : "Recently"
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Toaster />
    </div>
  )
}