"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export interface Step {
  id: string
  name: string
  description?: string
}

interface BookingStepIndicatorProps {
  steps: Step[]
  currentStep: string
  completedSteps: string[]
  className?: string
}

export function BookingStepIndicator({
  steps,
  currentStep,
  completedSteps,
  className
}: BookingStepIndicatorProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-center space-x-2 md:space-x-4">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep
          const isCompleted = completedSteps.includes(step.id)
          const isLast = index === steps.length - 1
          
          return (
            <div key={step.id} className="flex items-center">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div 
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200",
                    {
                      "bg-blue-600 text-white shadow-md": isActive && !isCompleted,
                      "bg-green-600 text-white shadow-md": isCompleted,
                      "bg-gray-200 text-gray-500": !isActive && !isCompleted
                    }
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" data-testid="check-icon" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span 
                  className={cn(
                    "mt-2 text-xs font-medium hidden md:block",
                    {
                      "text-blue-600": isActive && !isCompleted,
                      "text-green-600": isCompleted,
                      "text-gray-500": !isActive && !isCompleted
                    }
                  )}
                >
                  {step.name}
                </span>
              </div>
              
              {/* Connector Line */}
              {!isLast && (
                <div 
                  className={cn(
                    "w-12 md:w-20 h-0.5 mx-1",
                    {
                      "bg-blue-600": isCompleted,
                      "bg-gray-200": !isCompleted
                    }
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
      
      {/* Mobile Step Names */}
      <div className="flex items-center justify-center mt-2 md:hidden">
        {steps.map((step) => {
          const isActive = step.id === currentStep
          const isCompleted = completedSteps.includes(step.id)
          
          return (
            <div 
              key={`mobile-${step.id}`}
              className={cn(
                "text-xs font-medium px-2 text-center",
                {
                  "text-blue-600": isActive && !isCompleted,
                  "text-green-600": isCompleted,
                  "text-gray-500": !isActive && !isCompleted
                }
              )}
            >
              {step.name}
            </div>
          )
        })}
      </div>
    </div>
  )
}