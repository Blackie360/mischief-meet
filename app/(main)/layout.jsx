"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, BarChart, Users, Clock } from "lucide-react";
import { BarLoader } from "react-spinners";
import { useUser } from "@clerk/nextjs";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/meetings", label: "Meetings", icon: Users },
  { href: "/availability", label: "Availability", icon: Clock },
];

export default function AppLayout({ children }) {
  const pathname = usePathname();
  const { isLoaded } = useUser();

  return (
    <>
      {!isLoaded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <BarLoader width={"100%"} color="#8b5cf6" />
        </div>
      )}
      <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 md:flex-row">
        {/* Sidebar for medium screens and up */}
        <aside className="hidden md:block w-72 bg-white/80 backdrop-blur-sm border-r border-slate-200/60 shadow-xl">
          <div className="p-6">
            <div className="mb-8">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Mischief Meet
              </h1>
              <p className="text-sm text-slate-500 mt-1">Your scheduling hub</p>
            </div>
            <nav>
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center px-4 py-3 text-slate-700 rounded-xl transition-all duration-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:shadow-md ${
                        pathname === item.href 
                          ? "bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 shadow-md border border-purple-200/50" 
                          : "hover:text-purple-700"
                      }`}
                    >
                      <item.icon className={`w-5 h-5 mr-3 transition-colors duration-200 ${
                        pathname === item.href ? "text-purple-600" : "text-slate-500"
                      }`} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <header className="mb-8">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-800 via-purple-700 to-blue-700 bg-clip-text text-transparent">
              {navItems.find((item) => item.href === pathname)?.label || "Dashboard"}
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mt-3"></div>
          </header>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {/* Bottom tabs for small screens */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md shadow-2xl border-t border-slate-200/60">
          <ul className="flex justify-around py-3">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-200 ${
                    pathname === item.href 
                      ? "text-purple-600 bg-purple-50 shadow-md" 
                      : "text-slate-600 hover:text-purple-600 hover:bg-slate-50"
                  }`}
                >
                  <item.icon className={`w-6 h-6 mb-1 transition-colors duration-200 ${
                    pathname === item.href ? "text-purple-600" : "text-slate-500"
                  }`} />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
