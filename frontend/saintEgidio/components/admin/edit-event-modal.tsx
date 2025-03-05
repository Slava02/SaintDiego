"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { CalendarIcon, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"

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

interface EditEventModalProps {
  event: Event
  onUpdate: (event: Event) => void
  onDelete: (eventId: string) => void
  onClose: () => void
  onShowRecurrence: () => void
  open: boolean
}

export function EditEventModal({ event, onUpdate, onDelete, onClose, onShowRecurrence, open }: EditEventModalProps) {
  const [title, setTitle] = useState(event.title)
  const [type, setType] = useState(event.type)
  const [date, setDate] = useState<Date>(event.start)
  const [startTime, setStartTime] = useState(format(event.start, "HH:mm"))
  const [endTime, setEndTime] = useState(format(event.end, "HH:mm"))
  const [capacity, setCapacity] = useState(event.capacity)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isRecurring, setIsRecurring] = useState(!!event.recurrence)
  const [bookingWindow, setBookingWindow] = useState(event.bookingWindow || 14)

  const handleUpdate = () => {
    if (!date || !startTime || !endTime) return

    // Parse times
    const [startHour, startMinute] = startTime.split(":").map(Number)
    const [endHour, endMinute] = endTime.split(":").map(Number)

    const startDate = new Date(date)
    startDate.setHours(startHour, startMinute)

    const endDate = new Date(date)
    endDate.setHours(endHour, endMinute)

    const updatedEvent: Event = {
      ...event,
      title,
      type,
      start: startDate,
      end: endDate,
      capacity,
      status: event.registered >= capacity ? "full" : "open",
      bookingWindow: bookingWindow,
    }

    if (isRecurring) {
      if (event.recurrence) {
        // Сохраняем существующие настройки повторения
        updatedEvent.recurrence = event.recurrence
      } else {
        // Создаем новые настройки повторения
        onShowRecurrence()
        return
      }
    } else {
      updatedEvent.recurrence = undefined
    }

    onUpdate(updatedEvent)
  }

  const handleDelete = () => {
    onDelete(event.id)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto md:rounded-lg md:p-6 p-4 w-full md:w-auto">
        <DialogHeader className="md:mb-4 mb-2">
          <DialogTitle className="text-xl font-semibold">Редактирование мероприятия</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Название мероприятия</Label>
            <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-type">Тип мероприятия</Label>
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
            <Label htmlFor="edit-date">Дата</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: ru }) : "Выберите дату"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-startTime">Время начала</Label>
              <Input id="edit-startTime" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-endTime">Время окончания</Label>
              <Input id="edit-endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-capacity">Вместимость</Label>
            <Input
              id="edit-capacity"
              type="number"
              min={event.registered}
              value={capacity}
              onChange={(e) => setCapacity(Number.parseInt(e.target.value))}
            />
            {capacity < event.registered && (
              <p className="text-sm text-red-500">
                Вместимость не может быть меньше количества зарегистрированных участников ({event.registered})
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="edit-recurring"
              checked={isRecurring}
              onCheckedChange={(checked) => setIsRecurring(checked === true)}
            />
            <Label htmlFor="edit-recurring" className="cursor-pointer">
              Повторяющееся мероприятие
            </Label>
          </div>

          {/* Поле Booking Window скрыто для неповторяющихся событий */}
          {isRecurring && !event.recurrence && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Настройки повторения и окно бронирования будут доступны после сохранения.
              </p>
            </div>
          )}

          {isRecurring && event.recurrence && (
            <div className="bg-muted p-3 rounded-md">
              <h4 className="font-medium mb-1">Текущие настройки повторения:</h4>
              <p className="text-sm">
                Тип:{" "}
                {event.recurrence.type === "daily"
                  ? "Ежедневно"
                  : event.recurrence.type === "weekly"
                    ? "Еженедельно"
                    : event.recurrence.type === "monthly"
                      ? "Ежемесячно"
                      : event.recurrence.type}
              </p>
              <p className="text-sm">
                Интервал: каждые {event.recurrence.interval}{" "}
                {event.recurrence.type === "daily" ? "дней" : event.recurrence.type === "weekly" ? "недель" : "месяцев"}
              </p>
              <p className="text-sm">
                Окончание:{" "}
                {event.recurrence.end.indefinite
                  ? "Бессрочно"
                  : event.recurrence.end.count
                    ? `После ${event.recurrence.end.count} повторений`
                    : event.recurrence.end.date
                      ? `До ${format(new Date(event.recurrence.end.date), "dd.MM.yyyy")}`
                      : "Не указано"}
              </p>
              <Button variant="outline" size="sm" className="mt-2" onClick={onShowRecurrence}>
                Изменить настройки повторения
              </Button>
            </div>
          )}

          <div className="pt-2">
            <div className="bg-muted p-2 rounded-md">
              <p className="text-sm">
                Зарегистрировано: {event.registered} из {event.capacity}
              </p>
              <p className="text-sm">Статус: {event.status === "open" ? "Открыто" : "Заполнено"}</p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Удалить
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                <AlertDialogDescription>
                  Это действие удалит мероприятие и все связанные с ним записи участников. Это действие нельзя отменить.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                  Удалить
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <div>
            <Button variant="outline" onClick={onClose} className="mr-2">
              Отмена
            </Button>
            <Button onClick={handleUpdate}>Сохранить</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

