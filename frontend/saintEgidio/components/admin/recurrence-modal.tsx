"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { useState, useEffect } from "react"
import { CalendarIcon, Info, AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface RecurrenceModalProps {
  bookingWindow?: number
  recurrence?: {
    type: string
    interval: number
    end: {
      type: string
      count?: number
      date?: Date
      indefinite?: boolean
    }
  }
  onSave: (recurrencePattern: any) => void
  onClose: () => void
  open: boolean
}

export function RecurrenceModal({ bookingWindow = 14, recurrence, onSave, onClose, open }: RecurrenceModalProps) {
  const [frequency, setFrequency] = useState(recurrence?.type || "weekly")
  const [interval, setInterval] = useState(recurrence?.interval || 1)
  const [endType, setEndType] = useState(
    recurrence?.end?.indefinite
      ? "indefinite"
      : recurrence?.end?.count
        ? "count"
        : recurrence?.end?.date
          ? "date"
          : "indefinite",
  )
  const [occurrences, setOccurrences] = useState(recurrence?.end?.count || 5)
  const [endDate, setEndDate] = useState<Date | undefined>(
    recurrence?.end?.date ? new Date(recurrence?.end?.date) : undefined,
  )
  const [bookingWindowDays, setBookingWindowDays] = useState(bookingWindow)
  const [bookingWindowError, setBookingWindowError] = useState<string | null>(null)

  // Проверка совместимости окна бронирования с типом повторения
  useEffect(() => {
    validateBookingWindow(bookingWindowDays)
  }, [bookingWindowDays])

  const validateBookingWindow = (days: number) => {
    if (frequency === "weekly" && days % 7 !== 0) {
      setBookingWindowError("Для еженедельных мероприятий окно бронирования должно быть кратно 7 дням")
      return false
    } else if (frequency === "monthly" && days < 28) {
      setBookingWindowError("Для ежемесячных мероприятий окно бронирования должно быть не менее 28 дней")
      return false
    } else {
      setBookingWindowError(null)
      return true
    }
  }

  const handleSave = () => {
    const recurrencePattern = {
      type: frequency,
      interval,
      end: {
        type: endType,
        count: endType === "count" ? occurrences : undefined,
        date: endType === "date" ? endDate : undefined,
        indefinite: endType === "indefinite",
      },
      bookingWindow: bookingWindowDays,
    }

    onSave(recurrencePattern)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto md:rounded-lg md:p-6 p-4 w-full md:w-auto">
        <DialogHeader className="md:mb-4 mb-2">
          <DialogTitle className="text-xl font-semibold">Настройка повторения</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label htmlFor="frequency">Частота повторения</Label>
            <Select id="frequency" value={frequency} onValueChange={setFrequency}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите частоту" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Ежедневно</SelectItem>
                <SelectItem value="weekly">Еженедельно</SelectItem>
                <SelectItem value="monthly">Ежемесячно</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="interval">Интервал</Label>
            <div className="flex items-center space-x-2">
              <span>Каждые</span>
              <Input
                id="interval"
                type="number"
                min="1"
                value={interval}
                onChange={(e) => setInterval(Number.parseInt(e.target.value) || 1)}
                className="w-16"
              />
              <span>{frequency === "daily" ? "дней" : frequency === "weekly" ? "недель" : "месяцев"}</span>
            </div>
          </div>

          {/* Booking Window - перемещено сюда из нижней части */}
          <div className="space-y-3">
            <div className="flex items-center">
              <Label htmlFor="booking-window" className="mr-2">
                Окно бронирования
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Максимальное количество дней, на которое пользователи могут записаться вперед.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-2">
              <Input
                id="booking-window"
                type="number"
                min="1"
                value={bookingWindowDays}
                onChange={(e) => setBookingWindowDays(Number.parseInt(e.target.value) || 1)}
                className={bookingWindowError ? "border-red-500" : ""}
              />
              <span>дней для предварительной записи</span>
              {bookingWindowError && (
                <div className="flex items-center text-red-500">
                  <AlertCircle className="h-4 w-4 mr-1" />
                </div>
              )}
            </div>
            {bookingWindowError && <p className="text-sm text-red-500">{bookingWindowError}</p>}
            <div className="text-sm text-muted-foreground">
              <p>
                Пример: Если мероприятие начинается 28 февраля с окном в 14 дней, регистрация будет доступна до 14
                марта.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Границы повторения</Label>
            <RadioGroup value={endType} onValueChange={setEndType}>
              <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50">
                <RadioGroupItem value="indefinite" id="indefinite" />
                <Label htmlFor="indefinite" className="cursor-pointer">
                  Повторять бессрочно
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50">
                <RadioGroupItem value="count" id="count" />
                <Label htmlFor="count" className="flex items-center cursor-pointer">
                  <span className="mr-2">Повторить</span>
                  <Input
                    type="number"
                    min="1"
                    value={occurrences}
                    onChange={(e) => setOccurrences(Number.parseInt(e.target.value) || 1)}
                    className="w-16 mx-2"
                    disabled={endType !== "count"}
                  />
                  <span>раз</span>
                </Label>
              </div>

              <div className="flex flex-col space-y-2 p-2 rounded-md hover:bg-gray-50">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="date" id="date" />
                  <Label htmlFor="date" className="cursor-pointer">
                    До даты
                  </Label>
                </div>
                {endType === "date" && (
                  <div className="ml-6">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP", { locale: ru }) : "Выберите дату"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter className="md:justify-end justify-between mt-6">
          <Button variant="outline" onClick={onClose} className="md:mr-2">
            Отмена
          </Button>
          <Button onClick={handleSave} className="bg-blue-500 hover:bg-blue-600">
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

