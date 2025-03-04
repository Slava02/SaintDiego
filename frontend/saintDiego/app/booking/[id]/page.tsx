"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { ChevronLeft } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TimeSlot } from "@/components/time-slot"

export default function BookingPage({ params }: { params: { id: string } }) {
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [time, setTime] = useState<string | undefined>(undefined)
  const [comment, setComment] = useState("")
  const [showConfirmation, setShowConfirmation] = useState(false)

  // Mock service data based on ID
  const services = {
    "1": "Стирка (Цветной)",
    "2": "Просто прийти (Цветной)",
    "3": "Одежда (Гиляровского)",
  }

  const serviceName = services[params.id as keyof typeof services] || "Услуга"

  // Mock available dates (current month with some dates available)
  const today = new Date()
  const availableDates = [
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5),
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + 9),
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + 12),
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + 16),
  ]

  // Mock time slots
  const timeSlots = ["10:00", "11:00", "14:30", "16:00", "18:00"]

  const isDateAvailable = (date: Date) => {
    return availableDates.some(
      (d) =>
        d.getDate() === date.getDate() && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear(),
    )
  }

  const handleSubmit = () => {
    if (date && time) {
      setShowConfirmation(true)
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ru-RU", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link
          href="/profile"
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span>Назад к профилю</span>
        </Link>
      </div>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Запись посетителя</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{serviceName}</h3>

              <div className="border rounded-md p-4">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => !isDateAvailable(date)}
                  modifiers={{
                    available: availableDates,
                  }}
                  modifiersClassNames={{
                    available: "bg-green-100 text-green-900 hover:bg-green-200",
                  }}
                />
              </div>

              {date && (
                <div className="space-y-2">
                  <h4 className="font-medium">Доступное время на {formatDate(date)}:</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((slot) => (
                      <TimeSlot key={slot} time={slot} selected={time === slot} onClick={() => setTime(slot)} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium">
                  Имя
                </label>
                <Input id="firstName" value="Виктор" readOnly />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium">
                  Фамилия
                </label>
                <Input id="lastName" value="Толстихин" readOnly />
              </div>
              <div className="space-y-2">
                <label htmlFor="comment" className="text-sm font-medium">
                  Комментарий
                </label>
                <Textarea
                  id="comment"
                  placeholder="Укажите дополнительную информацию, если необходимо"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <Button onClick={handleSubmit} disabled={!date || !time} className="w-full bg-blue-500 hover:bg-blue-600">
                Записать
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Запись подтверждена</DialogTitle>
            <DialogDescription>
              Вы записаны на услугу "{serviceName}" на {date && formatDate(date)} в {time}.
              {comment && (
                <>
                  <br />
                  <br />
                  <strong>Комментарий:</strong> {comment}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Link href="/profile" className="w-full sm:w-auto">
              <Button className="w-full">Вернуться в профиль</Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

