"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import type { Event, UpdateEventRequest } from "@/lib/types"
import { updateEvent } from "@/lib/api/events"

interface EditEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: Event
  onSuccess: () => void
}

export function EditEventDialog({ open, onOpenChange, event, onSuccess }: EditEventDialogProps) {
  const [name, setName] = useState(event.serviceName)
  const [capacity, setCapacity] = useState(event.capacity.toString())
  const [dateTime, setDateTime] = useState(() => {
    const date = new Date(event.datetime)
    return format(date, "yyyy-MM-dd'T'HH:mm")
  })
  const [location, setLocation] = useState(event.location?.name || "")
  const [type, setType] = useState("Разовое") // Hardcoded for now
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!capacity || !dateTime) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive",
      })
      return
    }

    const capacityNum = Number.parseInt(capacity, 10)
    if (isNaN(capacityNum) || capacityNum <= 0) {
      toast({
        title: "Ошибка",
        description: "Вместимость должна быть положительным числом",
        variant: "destructive",
      })
      return
    }

    if (capacityNum < event.participantsCount) {
      toast({
        title: "Ошибка",
        description: `Вместимость не может быть меньше текущего количества участников (${event.participantsCount})`,
        variant: "destructive",
      })
      return
    }

    const updateData: UpdateEventRequest = {
      capacity: capacityNum,
      datetime: new Date(dateTime).toISOString(),
    }

    setIsLoading(true)
    try {
      await updateEvent(event.id, updateData)
      onSuccess()
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить мероприятие",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = () => {
    // This will be handled by the parent component
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Редактирование мероприятия</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Название</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateTime">Дата и время</Label>
            <Input id="dateTime" type="datetime-local" value={dateTime} onChange={(e) => setDateTime(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Место</Label>
            <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Вместимость</Label>
            <Input
              id="capacity"
              type="number"
              min={event.participantsCount}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Тип</Label>
            <Input id="type" value={type} onChange={(e) => setType(e.target.value)} disabled />
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="destructive" onClick={handleDelete}>
            Удалить
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Сохранение..." : "Сохранить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
