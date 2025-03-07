"use client"

import { useState, useEffect } from "react"
import { EventList } from "@/components/admin/event-list"
import { EventFilters } from "@/components/admin/event-filters"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EditEventModal } from "@/components/admin/edit-event-modal"
import { ExportModule } from "@/components/admin/export-module"
import { ParticipantManagementModal } from "@/components/admin/participant-management-modal"
import { Badge } from "@/components/ui/badge"
import { Event, EventFiltersState } from "@/types/event"

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming")
  const [filters, setFilters] = useState<EventFiltersState>({
    eventType: "all",
    place: "all",
    participant: "",
  })
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showParticipants, setShowParticipants] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  // Mock events data
  useEffect(() => {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const nextWeek = new Date(now)
    nextWeek.setDate(nextWeek.getDate() + 7)

    const mockEvents: Event[] = [
      {
        id: "1",
        title: "Медицинская консультация",
        type: "single",
        start: tomorrow,
        place: "Цветной",
        capacity: 15,
        status: "active",
        services: [
          {
            id: "1-1",
            name: "Терапевт",
            time: "10:00-12:00",
            capacity: 10,
            bookingWindow: 14,
            registered: 5,
            type: "medical"
          }
        ]
      },
      {
        id: "2",
        title: "Выдача одежды",
        type: "recurring",
        start: nextWeek,
        place: "Гиляровского",
        capacity: 20,
        status: "active",
        services: [
          {
            id: "2-1",
            name: "Зимняя одежда",
            time: "14:00-16:00",
            capacity: 10,
            bookingWindow: 14,
            registered: 8,
            type: "clothing"
          },
          {
            id: "2-2",
            name: "Летняя одежда",
            time: "16:00-18:00",
            capacity: 10,
            bookingWindow: 14,
            registered: 6,
            type: "clothing"
          }
        ],
        recurrence: {
          type: "weekly",
          interval: 1
        }
      }
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
      if (filters.eventType !== "all" && !event.services.some(service => service.type === filters.eventType)) return false

      // Filter by place
      if (filters.place !== "all" && event.place !== filters.place) return false

      // Filter by participant
      if (filters.participant) {
        // In a real app, this would check if the participant is registered for this event
        // For this example, we'll just filter based on the event ID
        if (event.id !== "1" && event.id !== "3") return false
      }

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
              <CardTitle>
                Список мероприятий
                <Badge className="ml-2">{filteredEvents.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EventList
                events={filteredEvents}
                onViewParticipants={handleViewParticipants}
                onEdit={handleEditEvent}
                onDelete={handleDeleteEvent}
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
              <CardTitle>
                Архив мероприятий
                <Badge className="ml-2">{filteredEvents.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EventList
                events={filteredEvents}
                onViewParticipants={handleViewParticipants}
                onEdit={handleEditEvent}
                onDelete={handleDeleteEvent}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="export" className="space-y-4">
          <ExportModule />
        </TabsContent>
      </Tabs>

      {/* Модальное окно управления участниками */}
      {selectedEvent && (
        <ParticipantManagementModal
          event={selectedEvent}
          open={showParticipants}
          onClose={() => setShowParticipants(false)}
        />
      )}

      {/* Модальное окно редактирования события */}
      {showEditModal && selectedEvent && (
        <EditEventModal
          event={selectedEvent}
          onUpdate={handleEventUpdate}
          onDelete={handleDeleteEvent}
          onClose={() => setShowEditModal(false)}
          open={showEditModal}
        />
      )}
    </div>
  )
}

