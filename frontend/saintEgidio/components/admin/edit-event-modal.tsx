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
import { ServiceManagement } from "./service-management"
import { Event, Service, Recurrence } from "@/types/event"
import { cn } from "@/lib/utils"

interface EditEventModalProps {
  event: Event
  onUpdate: (event: Event) => void
  onDelete: (eventId: string) => void
  onClose: () => void
  open: boolean
}

export function EditEventModal({ event, onUpdate, onDelete, onClose, open }: EditEventModalProps) {
  const [start, setStart] = useState<Date>(event.start)
  const [capacity, setCapacity] = useState(event.capacity)

  const handleUpdate = () => {
    const totalRegistered = event.services.reduce((sum, service) => sum + service.registered, 0)

    if (capacity < totalRegistered) {
      alert(`Невозможно установить вместимость меньше ${totalRegistered}, так как уже зарегистрировано ${totalRegistered} участников`)
      return
    }

    const updatedEvent: Event = {
      ...event,
      start,
      capacity,
    }

    onUpdate(updatedEvent)
  }

  const handleDelete = () => {
    const totalRegistered = event.services.reduce((sum, service) => sum + service.registered, 0)

    if (totalRegistered > 0) {
      alert(`Невозможно удалить мероприятие, так как на него зарегистрировано ${totalRegistered} участников`)
      return
    }

    onDelete(event.id)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редактирование мероприятия</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Название</Label>
            <Input value={event.title} disabled />
          </div>

          <div className="space-y-2">
            <Label>Дата и время</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !start && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {start ? format(start, "dd.MM.yyyy HH:mm") : <span>Выберите дату</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={start}
                  onSelect={(date) => date && setStart(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Место</Label>
            <Input value={event.place} disabled />
          </div>

          <div className="space-y-2">
            <Label>Вместимость</Label>
            <Input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              min={event.services.reduce((sum, service) => sum + service.registered, 0)}
            />
          </div>

          <div className="space-y-2">
            <Label>Тип</Label>
            <Input value={event.type === "recurring" ? "Повторяющееся" : "Разовое"} disabled />
          </div>
        </div>
        <DialogFooter>
          <Button variant="destructive" onClick={handleDelete}>
            Удалить
          </Button>
          <Button onClick={handleUpdate}>Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

