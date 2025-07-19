"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Calendar, Clock, Settings, User, Home, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      name: "Availability",
      href: "/dashboard/availability",
      icon: Clock,
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-full bg-white shadow-md"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
          <div className="fixed inset-y-0 left-0 flex flex-col w-64 max-w-xs bg-white shadow-xl">
            <div className="flex items-center justify-between h-16 px-6 border-b">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  MeetMischief
                </span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto py-4 px-3">
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-lg",
                      pathname === item.href
                        ? "bg-purple-100 text-purple-700"
                        : "text-gray-700 hover:bg-purple-50 hover:text-purple-700"
                    )}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="p-4 border-t">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium">
                  {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || "U"}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
                  <p className="text-xs text-gray-500">{session?.user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar for desktop */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white lg:pt-5 lg:pb-4">
        <div className="flex items-center justify-center h-16 px-6">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              MeetMischief
            </span>
          </Link>
        </div>
        <div className="flex-1 flex flex-col overflow-y-auto pt-6">
          <nav className="flex-1 px-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-lg",
                  pathname === item.href
                    ? "bg-purple-100 text-purple-700"
                    : "text-gray-700 hover:bg-purple-50 hover:text-purple-700"
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium">
              {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || "U"}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
              <p className="text-xs text-gray-500">{session?.user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <main className="flex-1 pb-8 pt-16 lg:pt-8">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}