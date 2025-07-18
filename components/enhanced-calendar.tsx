"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type EnhancedCalendarProps = React.ComponentProps<typeof DayPicker> & {
  availability?: Array<{
    day_of_week: number
    start_time: string
    end_time: string
  }>
}

export function EnhancedCalendar({
  className,
  classNames,
  showOutsideDays = true,
  availability = [],
  ...props
}: EnhancedCalendarProps) {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = React.useState<Date>(today)
  const [currentYear, setCurrentYear] = React.useState<number>(today.getFullYear())

  // Function to navigate to today
  const goToToday = () => {
    setCurrentMonth(today)
    setCurrentYear(today.getFullYear())
  }

  // Function to check if a date is available based on availability
  const isDateAvailable = (date: Date): boolean => {
    if (!date) return false;
    
    const dayOfWeek = date.getDay()
    const currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    return date >= currentDate && availability.some((a) => a.day_of_week === dayOfWeek)
  }

  // Generate month options
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // Generate year options (current year and next 5 years)
  const years = Array.from({ length: 6 }, (_, i) => today.getFullYear() + i);

  // Handle month change
  const handleMonthChange = (value: string) => {
    const newMonth = months.indexOf(value);
    const newDate = new Date(currentYear, newMonth, 1);
    setCurrentMonth(newDate);
  };

  // Handle year change
  const handleYearChange = (value: string) => {
    const newYear = parseInt(value);
    setCurrentYear(newYear);
    const newDate = new Date(newYear, currentMonth.getMonth(), 1);
    setCurrentMonth(newDate);
  };

  return (
    <div className="space-y-4">
      <div className="p-3 border-2 border-gray-100 rounded-xl shadow-sm bg-white">
        {/* Custom header with month/year dropdowns */}
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => {
              const prevMonth = new Date(currentMonth);
              prevMonth.setMonth(prevMonth.getMonth() - 1);
              setCurrentMonth(prevMonth);
              setCurrentYear(prevMonth.getFullYear());
            }}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <div className="flex space-x-2">
            <Select 
              value={months[currentMonth.getMonth()]} 
              onValueChange={handleMonthChange}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder={months[currentMonth.getMonth()]} />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>{month}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select 
              value={currentYear.toString()} 
              onValueChange={handleYearChange}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder={currentYear.toString()} />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <button 
            onClick={() => {
              const nextMonth = new Date(currentMonth);
              nextMonth.setMonth(nextMonth.getMonth() + 1);
              setCurrentMonth(nextMonth);
              setCurrentYear(nextMonth.getFullYear());
            }}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        
        {/* Days of week header */}
        <div className="grid grid-cols-7 mb-2">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {(() => {
            const daysInMonth = new Date(currentYear, currentMonth.getMonth() + 1, 0).getDate();
            const firstDayOfMonth = new Date(currentYear, currentMonth.getMonth(), 1).getDay();
            
            // Previous month's days
            const prevMonthDays = [];
            const prevMonth = new Date(currentYear, currentMonth.getMonth(), 0);
            const daysInPrevMonth = prevMonth.getDate();
            
            for (let i = firstDayOfMonth - 1; i >= 0; i--) {
              const day = daysInPrevMonth - i;
              const date = new Date(currentYear, currentMonth.getMonth() - 1, day);
              prevMonthDays.push(
                <button
                  key={`prev-${day}`}
                  disabled={!isDateAvailable(date)}
                  className={cn(
                    "h-10 w-full rounded-md flex items-center justify-center text-sm",
                    "text-gray-400 hover:bg-gray-100",
                    !isDateAvailable(date) && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => props.onSelect && props.onSelect(date)}
                >
                  {day}
                </button>
              );
            }
            
            // Current month's days
            const currentMonthDays = [];
            for (let day = 1; day <= daysInMonth; day++) {
              const date = new Date(currentYear, currentMonth.getMonth(), day);
              const isSelected = props.selected && 
                props.selected.getDate() === day && 
                props.selected.getMonth() === currentMonth.getMonth() &&
                props.selected.getFullYear() === currentYear;
              const isToday = 
                today.getDate() === day && 
                today.getMonth() === currentMonth.getMonth() &&
                today.getFullYear() === currentYear;
              
              currentMonthDays.push(
                <button
                  key={`current-${day}`}
                  disabled={!isDateAvailable(date)}
                  className={cn(
                    "h-10 w-full rounded-md flex items-center justify-center text-sm transition-colors",
                    isSelected && "bg-blue-600 text-white hover:bg-blue-700 shadow-md",
                    isToday && !isSelected && "ring-2 ring-blue-200",
                    isDateAvailable(date) && !isSelected && "hover:bg-blue-50 border border-blue-100 bg-blue-50",
                    !isDateAvailable(date) && "text-gray-300 cursor-not-allowed"
                  )}
                  onClick={() => props.onSelect && props.onSelect(date)}
                >
                  {day}
                  {isDateAvailable(date) && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full" />
                  )}
                </button>
              );
            }
            
            // Next month's days
            const nextMonthDays = [];
            const totalCells = 42; // 6 rows of 7 days
            const remainingCells = totalCells - (prevMonthDays.length + currentMonthDays.length);
            
            for (let day = 1; day <= remainingCells; day++) {
              const date = new Date(currentYear, currentMonth.getMonth() + 1, day);
              nextMonthDays.push(
                <button
                  key={`next-${day}`}
                  disabled={!isDateAvailable(date)}
                  className={cn(
                    "h-10 w-full rounded-md flex items-center justify-center text-sm",
                    "text-gray-400 hover:bg-gray-100",
                    !isDateAvailable(date) && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => props.onSelect && props.onSelect(date)}
                >
                  {day}
                </button>
              );
            }
            
            return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
          })()}
        </div>
      </div>
      
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