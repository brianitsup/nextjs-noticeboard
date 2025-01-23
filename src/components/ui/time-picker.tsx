"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ClockIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimePickerProps {
  date: Date | undefined
  onTimeChange: (date: Date) => void
  className?: string
}

export function TimePicker({ date, onTimeChange, className }: TimePickerProps) {
  const [hour, setHour] = React.useState<string>("")
  const [minute, setMinute] = React.useState<string>("")
  const [period, setPeriod] = React.useState<"AM" | "PM">("AM")
  const [isInitialized, setIsInitialized] = React.useState(false)

  // Generate hours (1-12)
  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"))
  // Generate minutes (00-55, step of 5)
  const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"))

  // Initialize time from date prop
  React.useEffect(() => {
    if (date && !isInitialized) {
      const hours = date.getHours()
      const minutes = date.getMinutes()
      const roundedMinutes = Math.round(minutes / 5) * 5
      
      let displayHour = hours % 12
      if (displayHour === 0) displayHour = 12
      
      setHour(String(displayHour).padStart(2, "0"))
      setMinute(String(roundedMinutes).padStart(2, "0"))
      setPeriod(hours >= 12 ? "PM" : "AM")
      setIsInitialized(true)
    }
  }, [date, isInitialized])

  // Handle time changes
  const handleTimeChange = React.useCallback((newHour?: string, newMinute?: string, newPeriod?: "AM" | "PM") => {
    if (!date) return

    const currentDate = new Date(date)
    let hourNum = parseInt(newHour || hour)
    const minuteNum = parseInt(newMinute || minute)
    const isPM = newPeriod ? newPeriod === "PM" : period === "PM"

    if (isPM && hourNum !== 12) hourNum += 12
    if (!isPM && hourNum === 12) hourNum = 0

    currentDate.setHours(hourNum, minuteNum)
    onTimeChange(currentDate)
  }, [date, hour, minute, period, onTimeChange])

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select
        value={hour}
        onValueChange={(value) => {
          setHour(value)
          handleTimeChange(value)
        }}
      >
        <SelectTrigger className="w-[70px]">
          <SelectValue placeholder="HH" />
        </SelectTrigger>
        <SelectContent>
          {hours.map((h) => (
            <SelectItem key={h} value={h}>
              {h}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <span className="text-muted-foreground">:</span>

      <Select
        value={minute}
        onValueChange={(value) => {
          setMinute(value)
          handleTimeChange(undefined, value)
        }}
      >
        <SelectTrigger className="w-[70px]">
          <SelectValue placeholder="MM" />
        </SelectTrigger>
        <SelectContent>
          {minutes.map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={period}
        onValueChange={(value: "AM" | "PM") => {
          setPeriod(value)
          handleTimeChange(undefined, undefined, value)
        }}
      >
        <SelectTrigger className="w-[70px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="AM">AM</SelectItem>
          <SelectItem value="PM">PM</SelectItem>
        </SelectContent>
      </Select>

      <ClockIcon className="h-4 w-4 text-muted-foreground" />
    </div>
  )
} 