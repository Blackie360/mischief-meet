import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "MeetMischief - Smart Scheduling Made Simple",
  description:
    "Schedule meetings effortlessly with MeetMischief. Share your availability, let others book time with you, and manage your calendar seamlessly.",
  keywords: ["scheduling", "calendar", "meetings", "appointments", "booking"],
  authors: [{ name: "MeetMischief Team" }],
  openGraph: {
    title: "MeetMischief - Smart Scheduling Made Simple",
    description: "Schedule meetings effortlessly with MeetMischief",
    type: "website",
    url: process.env.NEXT_PUBLIC_APP_URL,
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-inter antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
