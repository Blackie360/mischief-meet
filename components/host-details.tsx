"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

interface HostDetailsProps {
  name: string
  avatarUrl: string
  bio?: string
  className?: string
}

export function HostDetails({
  name,
  avatarUrl,
  bio,
  className
}: HostDetailsProps) {
  return (
    <div className={cn("flex flex-col items-center text-center", className)}>
      {/* Host Avatar */}
      <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md mb-4">
        <Image
          src={avatarUrl}
          alt={`${name}'s profile picture`}
          fill
          className="object-cover"
          priority
        />
      </div>
      
      {/* Host Name */}
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{name}</h1>
      
      {/* Host Bio */}
      {bio && (
        <p className="text-gray-600 max-w-md mx-auto">{bio}</p>
      )}
    </div>
  )
}