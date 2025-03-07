"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { TimePickerDemo } from "@/components/time-picker"

interface Event {
  id: string
  title: string
  date: Date | null
  location: string
  maxParticipants: number
  registeredParticipants: number
  status: "active" | "archived"
  type: "single" | "recurring"
  recurrence?: {
    frequency: "daily" | "weekly" | "monthly"
    endDate?: Date
    infinite: boolean
  }
  services: Service[]
}

interface Service {
  id: string
  name: string
  time: string
  capacity: number
  bookingWindow: number
  registeredParticipants: number
}

interface ActivateEventModalProps {
  event: Event
  open: boolean
  onClose: () => void
  onConfirm: (event: Event, newDate: Date) => void
}

export function ActivateEventModal({ event, open, onClose, onConfirm }: ActivateEventModalProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [time, setTime] = useState<string>(event.date ? format(event.date, "HH:mm") : "10:00")
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = () => {
    if (!date) {
      setError("Выберите дату")
      return
    }

    // Проверяем, что выбранная дата не в прошлом
    const now = new Date()
    const selectedDate = new Date(date)
    const [hours, minutes] = time.split(":").map(Number)
    selectedDate.setHours(hours, minutes)

    if (selectedDate < now) {
      setError("Дата должна быть в будущем")
      return
    }

    // Если все проверки пройдены, вызываем onConfirm
    onConfirm(event, selectedDate)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Активация события</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p>Для активации разового события "{event.title}" необходимо выбрать новую дату проведения.</p>

          <div className="space-y-2">
            <Label htmlFor="date">
              Дата <span className="text-red-500">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: ru }) : "Выберите дату"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">
              Время <span className="text-red-500">*</span>
            </Label>
            <TimePickerDemo value={time} onChange={setTime} />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleConfirm} className="bg-green-600 hover:bg-green-700">
            Активировать
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

