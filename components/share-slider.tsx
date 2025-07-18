"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Share2, Twitter, Facebook, Linkedin, MessageCircle, Send, ChevronRight, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"

interface ShareSliderProps {
  onShare: (platform: string) => void
}

const socialPlatforms = [
  {
    id: 'twitter',
    name: 'Twitter',
    icon: Twitter,
    color: 'text-blue-500',
    hoverColor: 'hover:bg-blue-50 hover:border-blue-300',
    bgGradient: 'from-blue-400 to-blue-600'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    color: 'text-blue-600',
    hoverColor: 'hover:bg-blue-50 hover:border-blue-600',
    bgGradient: 'from-blue-500 to-blue-700'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'text-blue-700',
    hoverColor: 'hover:bg-blue-50 hover:border-blue-700',
    bgGradient: 'from-blue-600 to-blue-800'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: MessageCircle,
    color: 'text-green-500',
    hoverColor: 'hover:bg-green-50 hover:border-green-500',
    bgGradient: 'from-green-400 to-green-600'
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: Send,
    color: 'text-blue-400',
    hoverColor: 'hover:bg-blue-50 hover:border-blue-400',
    bgGradient: 'from-blue-300 to-blue-500'
  }
]

export function ShareSlider({ onShare }: ShareSliderProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [hoveredPlatform, setHoveredPlatform] = useState<string | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  const toggleExpanded = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setIsExpanded(!isExpanded)
    
    // Reset animation state after transition
    setTimeout(() => {
      setIsAnimating(false)
    }, 500)
  }

  const handleShare = (platformId: string) => {
    onShare(platformId)
    
    // Add a subtle feedback animation
    const button = document.querySelector(`[data-platform="${platformId}"]`)
    if (button) {
      button.classList.add('animate-pulse')
      setTimeout(() => {
        button.classList.remove('animate-pulse')
      }, 600)
    }
    
    // Optional: collapse after sharing with delay
    setTimeout(() => {
      setIsExpanded(false)
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 500)
    }, 1000)
  }

  return (
    <div className="relative">
      {/* Main Share Button */}
      <div className="flex items-center gap-2">
        <Button
          onClick={toggleExpanded}
          className={cn(
            "relative overflow-hidden transition-all duration-300 ease-in-out",
            "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
            "text-white shadow-lg hover:shadow-xl",
            isExpanded ? "rounded-l-lg rounded-r-none" : "rounded-lg"
          )}
        >
          <div className="flex items-center gap-2">
            <Share2 className={cn(
              "w-4 h-4 transition-transform duration-300",
              isExpanded && "rotate-12"
            )} />
            <span className="font-medium">
              {isExpanded ? "Choose Platform" : "Share"}
            </span>
            <ChevronRight className={cn(
              "w-4 h-4 transition-transform duration-300",
              isExpanded && "rotate-180"
            )} />
          </div>
        </Button>

        {/* Sliding Social Media Options */}
        <div className={cn(
          "flex items-center transition-all duration-500 ease-in-out overflow-hidden",
          isExpanded ? "max-w-md opacity-100" : "max-w-0 opacity-0"
        )}>
          <div className="flex items-center gap-1 bg-white border border-l-0 rounded-r-lg shadow-lg p-1">
            {socialPlatforms.map((platform, index) => {
              const Icon = platform.icon
              return (
                <Button
                  key={platform.id}
                  data-platform={platform.id}
                  onClick={() => handleShare(platform.id)}
                  onMouseEnter={() => setHoveredPlatform(platform.id)}
                  onMouseLeave={() => setHoveredPlatform(null)}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "relative p-2 transition-all duration-200 transform",
                    platform.hoverColor,
                    "hover:scale-110 hover:-translate-y-1",
                    hoveredPlatform === platform.id && "shadow-md",
                    "group"
                  )}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: isExpanded ? 'slideInFromRight 0.3s ease-out forwards' : undefined
                  }}
                >
                  <Icon className={cn("w-4 h-4", platform.color)} />
                  
                  {/* Tooltip */}
                  {hoveredPlatform === platform.id && (
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 z-10">
                      <div className={cn(
                        "px-2 py-1 text-xs text-white rounded shadow-lg whitespace-nowrap",
                        "bg-gradient-to-r", platform.bgGradient
                      )}>
                        {platform.name}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-800"></div>
                      </div>
                    </div>
                  )}
                </Button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Animated Background Glow */}
      {isExpanded && (
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-200 to-pink-200 rounded-lg blur-xl opacity-30 animate-pulse"></div>
      )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(20px) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        
        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(4);
            opacity: 0;
          }
        }
        
        .ripple-effect {
          position: relative;
          overflow: hidden;
        }
        
        .ripple-effect::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }
        
        .ripple-effect:active::before {
          width: 300px;
          height: 300px;
        }
      `}</style>
    </div>
  )
}