"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export type EnhancedCalendarProps = React.ComponentProps<typeof DayPicker> & {
  availability?: Array<{
    day_of_week: number
    start_time: string
    end_time: string
  }>
}

function EnhancedCalendar({
  className,
  classNames,
  showOutsideDays = true,
  availability = [],
  ...props
}: EnhancedCalendarProps) {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = React.useState<Date>(today)
  const [hoveredDate, setHoveredDate] = React.useState<Date | null>(null)

  // Function to navigate to today
  const goToToday = () => {
    setCurrentMonth(today)
    if (props.onMonthChange) {
      props.onMonthChange(today)
    }
  }

  // Function to check if a date is available based on availability
  const isDateAvailable = (date: Date) => {
    const dayOfWeek = date.getDay()
    const currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    return date >= currentDate && availability.some((a) => a.day_of_week === dayOfWeek)
  }
  
  // Get day name for the given date (e.g., "Mon", "Tue")
  const getDayName = (date: Date): string => {
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  }

  // Custom day rendering to add hover effects and availability indicators
  const renderDay = (day: Date, modifiers: Record<string, boolean>) => {
    const isAvailable = isDateAvailable(day)
    const isSelected = modifiers.selected
    const isToday = modifiers.today
    const isOutside = modifiers.outside
    const isDisabled = modifiers.disabled

    // Don't render anything for hidden days
    if (modifiers.hidden) return <div />

    // Base classes for the day
    const baseClasses = cn(
      "h-10 w-10 rounded-md flex items-center justify-center text-sm transition-all duration-200",
      {
        // Selected state
        "bg-blue-600 text-white font-medium shadow-md": isSelected,
        
        // Available state (not selected)
        "bg-blue-50 border border-blue-100 hover:bg-blue-100 hover:border-blue-300": isAvailable && !isSelected,
        
        // Today state
        "ring-2 ring-blue-200": isToday && !isSelected,
        
        // Disabled state
        "text-gray-300 bg-transparent border-transparent cursor-not-allowed": isDisabled,
        
        // Outside month
        "text-gray-400 opacity-50": isOutside && !isSelected,
        
        // Default state (not available, not selected, not today)
        "text-gray-700 hover:bg-gray-100": !isAvailable && !isSelected && !isDisabled && !isOutside,
      }
    )

    return (
      <div
        className={baseClasses}
        onMouseEnter={() => isAvailable && setHoveredDate(day)}
        onMouseLeave={() => setHoveredDate(null)}
      >
        {format(day, "d")}
        {isAvailable && !isSelected && (
          <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full" />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn("p-3 border-2 border-gray-100 rounded-xl shadow-sm bg-white", className)}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center px-10",
          caption_label: "text-base font-semibold text-gray-900",
          nav: "space-x-1 flex items-center",
          nav_button: cn(
            "h-9 w-9 bg-transparent p-0 rounded-full hover:bg-blue-50 flex items-center justify-center transition-colors",
            "text-gray-600 hover:text-blue-600 border border-gray-200 hover:border-blue-300"
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell:
            "text-gray-600 rounded-md w-10 font-medium text-[0.9rem] py-2",
          row: "flex w-full mt-2",
          cell: cn(
            "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 rounded-md transition-colors",
          ),
          day: cn(
            "h-10 w-10 p-0 font-normal aria-selected:opacity-100 rounded-md transition-colors",
          ),
          day_range_end: "day-range-end",
          day_selected:
            "bg-blue-600 text-white hover:bg-blue-700 hover:text-white focus:bg-blue-700 focus:text-white shadow-md",
          day_today: "ring-2 ring-blue-200",
          day_outside:
            "day-outside text-gray-400 opacity-50",
          day_disabled: "text-gray-300 opacity-50 hover:bg-transparent cursor-not-allowed",
          day_range_middle:
            "aria-selected:bg-blue-50 aria-selected:text-gray-900",
          day_hidden: "invisible",
          ...classNames,
        }}
        components={{
          IconLeft: () => <ChevronLeft className="h-5 w-5" />,
          IconRight: () => <ChevronRight className="h-5 w-5" />,
          Day: ({ date, displayMonth, ...dayProps }) => {
            const isAvailable = isDateAvailable(date);
            const isDisabled = dayProps.disabled;
            
            if (isDisabled) {
              return renderDay(date, { ...dayProps.modifiers, disabled: true });
            }
            
            if (!isAvailable) {
              return (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="h-10 w-10 flex items-center justify-center">
                        {renderDay(date, { ...dayProps.modifiers, disabled: true })}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Not available</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            }
            
            return renderDay(date, dayProps.modifiers);
          }
        }}
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        modifiers={{
          available: (date) => isDateAvailable(date),
          hovered: (date) => hoveredDate !== null && date.getTime() === hoveredDate.getTime(),
        }}
        modifiersStyles={{
          available: {
            border: '1px solid #dbeafe',
            backgroundColor: '#f0f9ff',
          },
          hovered: {
            backgroundColor: '#bfdbfe',
            border: '1px solid #93c5fd',
          }
        }}
        disabled={(date) => !isDateAvailable(date)}
        {...props}
      />
      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={goToToday}
          className="flex items-center text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 transition-colors"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          Today
        </Button>
      </div>
    </div>
  )
}
EnhancedCalendar.displayName = "EnhancedCalendar"

export { EnhancedCalendar }