"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format, addDays } from "date-fns"
import { ru } from "date-fns/locale"

interface Event {
  id: string
  title: string
  type: string
  start: Date
  end: Date
  capacity: number
  registered: number
  status: "open" | "full"
  bookingWindow?: number
  recurrence?: {
    type: string
    interval: number
    end: {
      type: string
      date?: Date
      count?: number
      indefinite?: boolean
    }
  }
}

interface EventFormProps {
  isCreating: boolean
  event: Event | null
  onShowRecurrence: () => void
  onSubmit: (event: Event) => void
  onCancel: () => void
}

export function EventForm({ isCreating, event, onShowRecurrence, onSubmit, onCancel }: EventFormProps) {
  const [title, setTitle] = useState("")
  const [type, setType] = useState("medical")
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [capacity, setCapacity] = useState(10)
  const [isRecurring, setIsRecurring] = useState(false)
  const [bookingWindow, setBookingWindow] = useState<number>(14)

  useEffect(() => {
    if (event && !isCreating) {
      setTitle(event.title)
      setType(event.type)
      setDate(event.start)
      setStartTime(format(event.start, "HH:mm"))
      setEndTime(format(event.end, "HH:mm"))
      setCapacity(event.capacity)
      setBookingWindow(event.bookingWindow || 14)
      setIsRecurring(!!event.recurrence)
    } else {
      // Default values for new event
      const today = new Date()
      setTitle("")
      setType("medical")
      setDate(today)
      setStartTime("10:00")
      setEndTime("11:00")
      setCapacity(10)
      setIsRecurring(false)
      setBookingWindow(14)
    }
  }, [event, isCreating])

  const calculateNextRegistrationDate = () => {
    if (!date) return null

    const today = new Date()
    const eventDate = new Date(date)

    // Если мероприятие повторяющееся, рассчитываем следующую доступную дату регистрации
    if (isRecurring) {
      // Находим ближайшую будущую дату мероприятия
      let nextEventDate = eventDate
      while (nextEventDate < today) {
        // Для простоты примера добавляем 7 дней (еженедельное повторение)
        // В реальном приложении здесь должна быть логика на основе recurrence.type и recurrence.interval
        nextEventDate = addDays(nextEventDate, 7)
      }

      // Рассчитываем дату окончания регистрации для этого экземпляра
      return addDays(today, bookingWindow)
    } else {
      // Для одиночного мероприятия - за день до начала
      return new Date(eventDate.getTime() - 24 * 60 * 60 * 1000)
    }
  }

  const handleSubmit = () => {
    if (!date || !startTime || !endTime) return

    // Parse times
    const [startHour, startMinute] = startTime.split(":").map(Number)
    const [endHour, endMinute] = endTime.split(":").map(Number)

    const startDate = new Date(date)
    startDate.setHours(startHour, startMinute)

    const endDate = new Date(date)
    endDate.setHours(endHour, endMinute)

    const updatedEvent: Event = {
      id: event?.id || "temp-id",
      title,
      type,
      start: startDate,
      end: endDate,
      capacity,
      registered: event?.registered || 0,
      status: event?.registered >= capacity ? "full" : "open",
      bookingWindow: bookingWindow,
      recurrence: isRecurring ? event?.recurrence : undefined,
    }

    if (isRecurring) {
      onShowRecurrence()
    } else {
      onSubmit(updatedEvent)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Название мероприятия</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Введите название мероприятия"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Тип мероприятия</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите тип мероприятия" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="medical">Медицинская помощь</SelectItem>
            <SelectItem value="clothing">Выдача одежды</SelectItem>
            <SelectItem value="psychology">Психологическая помощь</SelectItem>
            <SelectItem value="legal">Юридическая помощь</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Дата</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP", { locale: ru }) : "Выберите дату"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startTime">Время начала</Label>
          <Input id="startTime" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endTime">Время окончания</Label>
          <Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="capacity">Вместимость</Label>
        <Input
          id="capacity"
          type="number"
          min="1"
          value={capacity}
          onChange={(e) => setCapacity(Number.parseInt(e.target.value))}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="recurring"
          checked={isRecurring}
          onCheckedChange={(checked) => setIsRecurring(checked === true)}
        />
        <Label htmlFor="recurring" className="cursor-pointer">
          Повторяющееся мероприятие
        </Label>
      </div>

      {isRecurring && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Настройки повторения и окно бронирования будут доступны на следующем шаге.
          </p>
        </div>
      )}

      <div className="flex md:justify-end justify-between space-x-2 pt-2">
        <Button variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!title || !date || !startTime || !endTime}
          className="bg-blue-500 hover:bg-blue-600"
        >
          {isCreating ? "Создать" : "Сохранить"}
        </Button>
      </div>
    </div>
  )
}

