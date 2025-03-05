"use client"

import { useState, useEffect } from "react"
import { EventTable, EventFilters, type EventFiltersState } from "@/components/admin/event-table"
import { ParticipantTable } from "@/components/admin/participant-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EditEventModal } from "@/components/admin/edit-event-modal"
import { ExportModule } from "@/components/admin/export-module"

interface Event {
  id: string
  title: string
  type: string
  start: Date
  end: Date
  capacity: number
  registered: number
  status: "open" | "full"
}

interface Participant {
  id: string
  name: string
  surname: string
  phone: string
  status: "attended" | "no-show" | "pending"
  comment: string
}

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming")
  const [filters, setFilters] = useState<EventFiltersState>({
    dateRange: { from: undefined, to: undefined },
    eventType: "all",
    status: "all",
  })

  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showParticipants, setShowParticipants] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  // Mock participants data
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: "1",
      name: "Виктор",
      surname: "Толстихин",
      phone: "+7 (123) 456-78-90",
      status: "attended",
      comment: "",
    },
    {
      id: "2",
      name: "Анна",
      surname: "Петрова",
      phone: "+7 (987) 654-32-10",
      status: "no-show",
      comment: "Не пришла без предупреждения",
    },
    {
      id: "3",
      name: "Сергей",
      surname: "Иванов",
      phone: "+7 (555) 123-45-67",
      status: "pending",
      comment: "Нужна дополнительная помощь",
    },
  ])

  // Mock events data
  useEffect(() => {
    const mockEvents: Event[] = [
      {
        id: "1",
        title: "Медицинская консультация",
        type: "medical",
        start: new Date(2025, 2, 10, 10, 0),
        end: new Date(2025, 2, 10, 11, 0),
        capacity: 15,
        registered: 10,
        status: "open",
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
      },
      {
        id: "4",
        title: "Юридическая помощь (прошедшее)",
        type: "legal",
        start: new Date(2025, 1, 13, 15, 0),
        end: new Date(2025, 1, 13, 17, 0),
        capacity: 10,
        registered: 8,
        status: "open",
      },
    ]

    setEvents(mockEvents)
  }, [])

  // Filter events based on active tab and filters
  useEffect(() => {
    const now = new Date()

    const filtered = events.filter((event) => {
      // Filter by upcoming/past
      if (activeTab === "upcoming" && event.start < now) return false
      if (activeTab === "past" && event.start >= now) return false

      // Filter by event type
      if (filters.eventType !== "all" && event.type !== filters.eventType) return false

      // Filter by status
      if (filters.status !== "all" && event.status !== filters.status) return false

      // Filter by date range
      if (filters.dateRange.from && event.start < filters.dateRange.from) return false
      if (filters.dateRange.to && event.start > filters.dateRange.to) return false

      return true
    })

    setFilteredEvents(filtered)
  }, [events, activeTab, filters])

  const handleViewParticipants = (event: Event) => {
    setSelectedEvent(event)
    setShowParticipants(true)
  }

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event)
    setShowEditModal(true)
  }

  const handleDeleteEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId))
  }

  const handleEventUpdate = (updatedEvent: Event) => {
    setEvents((prev) => prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)))
    setShowEditModal(false)
  }

  const handleParticipantUpdate = (participant: Participant) => {
    setParticipants((prev) => prev.map((p) => (p.id === participant.id ? participant : p)))
  }

  const handleParticipantRemove = (participantId: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== participantId))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold">Управление мероприятиями</h1>
      </div>

      <Tabs
        defaultValue="upcoming"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "upcoming" | "past")}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="upcoming">Предстоящие мероприятия</TabsTrigger>
          <TabsTrigger value="past">Прошедшие мероприятия</TabsTrigger>
          <TabsTrigger value="export">Экспорт данных</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Фильтры</CardTitle>
            </CardHeader>
            <CardContent>
              <EventFilters filters={filters} onFiltersChange={setFilters} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Список мероприятий</CardTitle>
            </CardHeader>
            <CardContent>
              <EventTable
                events={filteredEvents}
                onViewParticipants={handleViewParticipants}
                onEditEvent={handleEditEvent}
                onDeleteEvent={handleDeleteEvent}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Фильтры</CardTitle>
            </CardHeader>
            <CardContent>
              <EventFilters filters={filters} onFiltersChange={setFilters} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Архив мероприятий</CardTitle>
            </CardHeader>
            <CardContent>
              <EventTable
                events={filteredEvents}
                onViewParticipants={handleViewParticipants}
                onEditEvent={handleEditEvent}
                onDeleteEvent={handleDeleteEvent}
                isPastEvents={activeTab === "past"}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="export" className="space-y-4">
          <ExportModule />
        </TabsContent>
      </Tabs>

      <Dialog open={showParticipants} onOpenChange={setShowParticipants}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Участники: {selectedEvent?.title} ({selectedEvent && new Date(selectedEvent.start).toLocaleDateString()})
            </DialogTitle>
          </DialogHeader>

          <ParticipantTable
            participants={participants}
            onUpdate={handleParticipantUpdate}
            onRemove={handleParticipantRemove}
          />
        </DialogContent>
      </Dialog>

      {showEditModal && selectedEvent && (
        <EditEventModal
          event={selectedEvent}
          onUpdate={handleEventUpdate}
          onDelete={handleDeleteEvent}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  )
}

