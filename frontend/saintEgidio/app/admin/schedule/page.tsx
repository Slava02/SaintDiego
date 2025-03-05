"use client"

import { useState } from "react"
import { AdminCalendar } from "@/components/admin/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Edit, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { EventForm } from "@/components/admin/event-form"
import { RecurrenceModal } from "@/components/admin/recurrence-modal"
import { EditEventModal } from "@/components/admin/edit-event-modal"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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

export default function SchedulePage() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showRecurrenceModal, setShowRecurrenceModal] = useState(false)
  const [showEventDetails, setShowEventDetails] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [createNewEvent, setCreateNewEvent] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [tempEvent, setTempEvent] = useState<Event | null>(null)

  // Mock events data
  const [events, setEvents] = useState<Event[]>([
    {
      id: "1",
      title: "Медицинская консультация",
      type: "medical",
      start: new Date(2025, 2, 10, 10, 0),
      end: new Date(2025, 2, 10, 11, 0),
      capacity: 15,
      registered: 10,
      status: "open",
      bookingWindow: 14,
      recurrence: {
        type: "weekly",
        interval: 1,
        end: {
          type: "indefinite",
          indefinite: true,
        },
      },
    },
    {
      id: "2",
      title: "Выдача одежды",
      type: "clothing",
      start: new Date(2025, 2, 11, 14, 0),
      end: new Date(2025, 2, 11, 16, 0),
      capacity: 20,
      registered: 20,
      status: "full",
      bookingWindow: 14,
    },
    {
      id: "3",
      title: "Консультация психолога",
      type: "psychology",
      start: new Date(2025, 2, 12, 12, 0),
      end: new Date(2025, 2, 12, 13, 0),
      capacity: 5,
      registered: 3,
      status: "open",
      bookingWindow: 14,
    },
    {
      id: "4",
      title: "Юридическая помощь",
      type: "legal",
      start: new Date(2025, 2, 13, 15, 0),
      end: new Date(2025, 2, 13, 17, 0),
      capacity: 10,
      registered: 8,
      status: "open",
      bookingWindow: 14,
    },
  ])

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event)
    setShowEventDetails(true)
    setCreateNewEvent(false)
  }

  const handleCreateEvent = () => {
    setSelectedEvent(null)
    setCreateNewEvent(true)
    setShowEventModal(true)
  }

  const handleEditEvent = () => {
    if (selectedEvent) {
      setShowEventDetails(false)
      setShowEditModal(true)
    }
  }

  const handleShowRecurrenceModal = () => {
    setShowRecurrenceModal(true)
  }

  const handleEventUpdate = (event: Event) => {
    setEvents((prev) => prev.map((e) => (e.id === event.id ? event : e)))
    setShowEditModal(false)
    setShowEventDetails(false)
  }

  const handleEventDelete = () => {
    if (selectedEvent) {
      setEvents((prev) => prev.filter((e) => e.id !== selectedEvent.id))
      setShowDeleteDialog(false)
      setShowEventDetails(false)
    }
  }

  const handleEventCreate = (event: Event) => {
    setTempEvent(event)

    if (event.recurrence) {
      setShowRecurrenceModal(true)
    } else {
      finalizeEventCreation(event)
    }
  }

  const finalizeEventCreation = (event: Event) => {
    setEvents((prev) => [...prev, { ...event, id: Date.now().toString() }])
    setShowEventModal(false)
    setShowRecurrenceModal(false)
    setTempEvent(null)
  }

  const handleRecurrenceSave = (recurrencePattern: any) => {
    if (tempEvent) {
      const updatedEvent = {
        ...tempEvent,
        recurrence: recurrencePattern,
        bookingWindow: recurrencePattern.bookingWindow || tempEvent.bookingWindow,
      }
      finalizeEventCreation(updatedEvent)
    } else if (selectedEvent && showEditModal) {
      // Обновление настроек повторения для существующего мероприятия
      const updatedEvent = {
        ...selectedEvent,
        recurrence: recurrencePattern,
        bookingWindow: recurrencePattern.bookingWindow || selectedEvent.bookingWindow,
      }
      handleEventUpdate(updatedEvent)
      setShowRecurrenceModal(false)
    }
  }

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case "medical":
        return "Медицинская помощь"
      case "clothing":
        return "Выдача одежды"
      case "psychology":
        return "Психологическая помощь"
      case "legal":
        return "Юридическая помощь"
      default:
        return type
    }
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "medical":
        return "bg-blue-100 text-blue-800"
      case "clothing":
        return "bg-green-100 text-green-800"
      case "psychology":
        return "bg-purple-100 text-purple-800"
      case "legal":
        return "bg-amber-100 text-amber-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRecurrenceLabel = (recurrence: any) => {
    if (!recurrence) return "Одиночное мероприятие"

    let label = ""

    switch (recurrence.type) {
      case "daily":
        label = `Ежедневно`
        break
      case "weekly":
        label = `Еженедельно`
        break
      case "monthly":
        label = `Ежемесячно`
        break
      default:
        label = recurrence.type
    }

    if (recurrence.interval > 1) {
      label += ` (каждые ${recurrence.interval} ${
        recurrence.type === "daily" ? "дней" : recurrence.type === "weekly" ? "недель" : "месяцев"
      })`
    }

    if (recurrence.end) {
      if (recurrence.end.indefinite) {
        label += ", бессрочно"
      } else if (recurrence.end.count) {
        label += `, ${recurrence.end.count} раз`
      } else if (recurrence.end.date) {
        label += `, до ${format(new Date(recurrence.end.date), "dd.MM.yyyy")}`
      }
    }

    return label
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Управление расписанием</h1>
      </div>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList>
          <TabsTrigger value="calendar">Календарь</TabsTrigger>
          <TabsTrigger value="daily">По дням</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Календарь мероприятий</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <AdminCalendar events={events} onEventSelect={handleEventSelect} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <CardTitle>Мероприятия по дням</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                Представление по дням находится в разработке
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-10">
        <Button
          onClick={handleCreateEvent}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all bg-blue-500 hover:bg-blue-600"
        >
          <Plus className="h-6 w-6" />
          <span className="sr-only">Создать мероприятие</span>
        </Button>
      </div>

      {/* Event Details Modal */}
      <Dialog open={showEventDetails} onOpenChange={setShowEventDetails}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Детали мероприятия</DialogTitle>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{selectedEvent.title}</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge className={getEventTypeColor(selectedEvent.type)}>
                    {getEventTypeLabel(selectedEvent.type)}
                  </Badge>
                  <Badge
                    className={
                      selectedEvent.status === "open" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }
                  >
                    {selectedEvent.status === "open" ? "Открыто" : "Заполнено"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Дата:</span>
                  <span className="font-medium">{format(selectedEvent.start, "dd.MM.yyyy", { locale: ru })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Время:</span>
                  <span className="font-medium">
                    {format(selectedEvent.start, "HH:mm")} - {format(selectedEvent.end, "HH:mm")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Вместимость:</span>
                  <span className="font-medium">
                    {selectedEvent.registered}/{selectedEvent.capacity}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Повторение:</span>
                  <span className="font-medium">{getRecurrenceLabel(selectedEvent.recurrence)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Окно бронирования:</span>
                  <span className="font-medium">{selectedEvent.bookingWindow || 14} дней</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button className="flex-1" onClick={handleEditEvent}>
                  <Edit className="h-4 w-4 mr-2" />
                  Редактировать
                </Button>
                <Button variant="destructive" className="flex-1" onClick={() => setShowDeleteDialog(true)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Удалить
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Event Creation Modal */}
      <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{createNewEvent ? "Создание мероприятия" : "Редактирование мероприятия"}</DialogTitle>
          </DialogHeader>

          <EventForm
            isCreating={createNewEvent}
            event={selectedEvent}
            onShowRecurrence={handleShowRecurrenceModal}
            onSubmit={createNewEvent ? handleEventCreate : handleEventUpdate}
            onCancel={() => setShowEventModal(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Event Edit Modal */}
      {selectedEvent && (
        <EditEventModal
          event={selectedEvent}
          onUpdate={handleEventUpdate}
          onDelete={handleEventDelete}
          onClose={() => setShowEditModal(false)}
          onShowRecurrence={handleShowRecurrenceModal}
          open={showEditModal}
        />
      )}

      {/* Recurrence Modal */}
      <RecurrenceModal
        bookingWindow={tempEvent?.bookingWindow || selectedEvent?.bookingWindow || 14}
        recurrence={tempEvent?.recurrence || selectedEvent?.recurrence}
        onSave={handleRecurrenceSave}
        onClose={() => setShowRecurrenceModal(false)}
        open={showRecurrenceModal}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить мероприятие</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить это мероприятие? Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleEventDelete} className="bg-red-500 hover:bg-red-600">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

