"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface TimePickerProps {
  value: string
  onChange: (time: string) => void
  className?: string
}

export function TimePickerDemo({ value, onChange, className }: TimePickerProps) {
  const minuteRef = React.useRef<HTMLInputElement>(null)
  const hourRef = React.useRef<HTMLInputElement>(null)

  const [hour, setHour] = React.useState<string>(() => {
    return value ? value.split(":")[0] : "10"
  })

  const [minute, setMinute] = React.useState<string>(() => {
    return value ? value.split(":")[1] : "00"
  })

  React.useEffect(() => {
    if (value) {
      const [h, m] = value.split(":")
      setHour(h)
      setMinute(m)
    }
  }, [value])

  const handleHourChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newHour = event.target.value
    if (newHour === "" || (Number.parseInt(newHour) >= 0 && Number.parseInt(newHour) < 24)) {
      setHour(newHour)
      if (newHour.length === 2) {
        minuteRef.current?.focus()
      }

      if (newHour && minute) {
        onChange(`${newHour.padStart(2, "0")}:${minute}`)
      }
    }
  }

  const handleMinuteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newMinute = event.target.value
    if (newMinute === "" || (Number.parseInt(newMinute) >= 0 && Number.parseInt(newMinute) < 60)) {
      setMinute(newMinute)

      if (hour && newMinute) {
        onChange(`${hour.padStart(2, "0")}:${newMinute.padStart(2, "0")}`)
      }
    }
  }

  const handleHourBlur = () => {
    if (hour) {
      const formattedHour = hour.padStart(2, "0")
      setHour(formattedHour)
      onChange(`${formattedHour}:${minute.padStart(2, "0")}`)
    }
  }

  const handleMinuteBlur = () => {
    if (minute) {
      const formattedMinute = minute.padStart(2, "0")
      setMinute(formattedMinute)
      onChange(`${hour.padStart(2, "0")}:${formattedMinute}`)
    }
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className="grid gap-1 text-center">
        <Input
          ref={hourRef}
          id="hours"
          className="w-16 text-center"
          value={hour}
          onChange={handleHourChange}
          onBlur={handleHourBlur}
          placeholder="00"
          maxLength={2}
        />
      </div>
      <div className="text-xl">:</div>
      <div className="grid gap-1 text-center">
        <Input
          ref={minuteRef}
          id="minutes"
          className="w-16 text-center"
          value={minute}
          onChange={handleMinuteChange}
          onBlur={handleMinuteBlur}
          placeholder="00"
          maxLength={2}
        />
      </div>
      <Clock className="h-4 w-4 text-muted-foreground" />
    </div>
  )
}

