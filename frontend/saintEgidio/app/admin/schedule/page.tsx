"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Search, Filter, Calendar } from "lucide-react"
import { format, isAfter } from "date-fns"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EventForm } from "@/components/admin/event-form"
import { EventCard } from "@/components/admin/event-card"
import { EventTable } from "@/components/admin/event-table"
import { ActivateEventModal } from "@/components/admin/activate-event-modal"

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

interface Location {
  id: string
  name: string
  address: string
  description?: string
}

interface FilterState {
  eventType: "all" | "single" | "recurring"
  status: "active" | "archived" | "all"
  searchQuery: string
  service: string
}

export default function SchedulePage() {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active")
  const [showFilters, setShowFilters] = useState(false)
  const [showActivateModal, setShowActivateModal] = useState(false)
  const [eventToActivate, setEventToActivate] = useState<Event | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    eventType: "all",
    status: "all",
    searchQuery: "",
    service: "all",
  })
  const [availableServices, setAvailableServices] = useState<{ id: string; name: string }[]>([])

  // Мок-данные для мест
  const [locations, setLocations] = useState<Location[]>([
    { id: "1", name: "Цветной", address: "Цветной бульвар, 25", description: "Основной центр" },
    { id: "2", name: "Гиляровского", address: "ул. Гиляровского, 65", description: "Филиал №1" },
    { id: "3", name: "Ясная", address: "ул. Ясная, 10", description: "Филиал №2" },
  ])

  // Мок-данные для услуг
  const serviceOptions = [
    { id: "s1", name: "Терапевт", defaultCapacity: 15, defaultBookingWindow: 14 },
    { id: "s2", name: "Психолог", defaultCapacity: 10, defaultBookingWindow: 7 },
    { id: "s3", name: "Зимняя одежда", defaultCapacity: 25, defaultBookingWindow: 14 },
    { id: "s4", name: "Летняя одежда", defaultCapacity: 25, defaultBookingWindow: 14 },
    { id: "s5", name: "Консультация юриста", defaultCapacity: 20, defaultBookingWindow: 10 },
    { id: "s6", name: "Продуктовые наборы", defaultCapacity: 100, defaultBookingWindow: 21 },
  ]

  // Мок-данные для событий
  useEffect(() => {
    const mockEvents: Event[] = [
      {
        id: "1",
        title: "Медицинская консультация",
        date: new Date(2025, 2, 10, 10, 0),
        location: "Цветной",
        maxParticipants: 30,
        registeredParticipants: 12,
        status: "active",
        type: "single",
        services: [
          {
            id: "1-1",
            name: "Терапевт",
            time: "10:00-12:00",
            capacity: 15,
            bookingWindow: 14,
            registeredParticipants: 8,
          },
          {
            id: "1-2",
            name: "Психолог",
            time: "12:00-14:00",
            capacity: 10,
            bookingWindow: 7,
            registeredParticipants: 4,
          },
        ],
      },
      {
        id: "2",
        title: "Выдача одежды",
        date: new Date(2025, 2, 15, 14, 0),
        location: "Гиляровского",
        maxParticipants: 50,
        registeredParticipants: 50,
        status: "active",
        type: "single",
        services: [
          {
            id: "2-1",
            name: "Зимняя одежда",
            time: "14:00-16:00",
            capacity: 25,
            bookingWindow: 14,
            registeredParticipants: 25,
          },
          {
            id: "2-2",
            name: "Летняя одежда",
            time: "16:00-18:00",
            capacity: 25,
            bookingWindow: 14,
            registeredParticipants: 25,
          },
        ],
      },
      {
        id: "3",
        title: "Юридическая помощь",
        date: new Date(2024, 11, 5, 9, 0),
        location: "Ясная",
        maxParticipants: 20,
        registeredParticipants: 15,
        status: "archived",
        type: "single",
        services: [
          {
            id: "3-1",
            name: "Консультация юриста",
            time: "09:00-13:00",
            capacity: 20,
            bookingWindow: 10,
            registeredParticipants: 15,
          },
        ],
      },
      {
        id: "4",
        title: "Еженедельная продуктовая помощь",
        date: new Date(2025, 3, 20, 11, 0),
        location: "Цветной",
        maxParticipants: 100,
        registeredParticipants: 45,
        status: "active",
        type: "recurring",
        recurrence: {
          frequency: "weekly",
          infinite: true,
        },
        services: [
          {
            id: "4-1",
            name: "Продуктовые наборы",
            time: "11:00-15:00",
            capacity: 100,
            bookingWindow: 21,
            registeredParticipants: 45,
          },
        ],
      },
      {
        id: "5",
        title: "Ежемесячная консультация психолога",
        date: new Date(2025, 2, 5, 13, 0),
        location: "Гиляровского",
        maxParticipants: 15,
        registeredParticipants: 8,
        status: "active",
        type: "recurring",
        recurrence: {
          frequency: "monthly",
          endDate: new Date(2025, 8, 5),
          infinite: false,
        },
        services: [
          {
            id: "5-1",
            name: "Психолог",
            time: "13:00-17:00",
            capacity: 15,
            bookingWindow: 14,
            registeredParticipants: 8,
          },
        ],
      },
      {
        id: "6",
        title: "Архивное разовое событие",
        date: new Date(2024, 1, 15, 10, 0),
        location: "Цветной",
        maxParticipants: 25,
        registeredParticipants: 20,
        status: "archived",
        type: "single",
        services: [
          {
            id: "6-1",
            name: "Терапевт",
            time: "10:00-12:00",
            capacity: 15,
            bookingWindow: 14,
            registeredParticipants: 12,
          },
          {
            id: "6-2",
            name: "Консультация юриста",
            time: "12:00-14:00",
            capacity: 10,
            bookingWindow: 7,
            registeredParticipants: 8,
          },
        ],
      },
      {
        id: "7",
        title: "Архивное повторяющееся событие",
        date: new Date(2024, 2, 1, 14, 0),
        location: "Ясная",
        maxParticipants: 40,
        registeredParticipants: 35,
        status: "archived",
        type: "recurring",
        recurrence: {
          frequency: "weekly",
          endDate: new Date(2024, 5, 1),
          infinite: false,
        },
        services: [
          {
            id: "7-1",
            name: "Продуктовые наборы",
            time: "14:00-16:00",
            capacity: 40,
            bookingWindow: 14,
            registeredParticipants: 35,
          },
        ],
      },
    ]

    setEvents(mockEvents)
  }, [])

  // Собираем все уникальные услуги из событий для фильтра
  useEffect(() => {
    const services = new Set<string>()
    events.forEach((event) => {
      event.services.forEach((service) => {
        services.add(service.name)
      })
    })

    const servicesList = Array.from(services).map((name, index) => ({
      id: `service-${index}`,
      name,
    }))

    setAvailableServices(servicesList)
  }, [events])

  // Обновление фильтров при изменении активной вкладки
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      status: activeTab === "active" ? "active" : "archived",
    }))
  }, [activeTab])

  // Фильтрация событий
  useEffect(() => {
    let filtered = [...events]

    // Фильтр по статусу
    if (filters.status !== "all") {
      filtered = filtered.filter((event) => event.status === filters.status)
    }

    // Фильтр по типу события
    if (filters.eventType !== "all") {
      filtered = filtered.filter((event) => event.type === filters.eventType)
    }

    // Фильтр по услуге
    if (filters.service !== "all") {
      filtered = filtered.filter((event) => event.services.some((service) => service.name === filters.service))
    }

    // Поиск
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(
        (event) => event.title.toLowerCase().includes(query) || event.location.toLowerCase().includes(query),
      )
    }

    setFilteredEvents(filtered)
  }, [events, filters])

  const handleCreateEvent = () => {
    setSelectedEvent(null)
    setIsEditing(false)
    setShowEventModal(true)
  }

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event)
    setIsEditing(true)
    setShowEventModal(true)
  }

  const handleSaveEvent = (event: Event) => {
    if (isEditing && selectedEvent) {
      // Обновление существующего события
      setEvents((prev) => prev.map((e) => (e.id === selectedEvent.id ? event : e)))
    } else {
      // Создание нового события
      const newEvent = {
        ...event,
        id: Date.now().toString(),
        status: "active" as const,
      }
      setEvents((prev) => [...prev, newEvent])
    }
    setShowEventModal(false)
  }

  const handleDeleteEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== eventId))
  }

  const handleArchiveEvent = (eventId: string) => {
    setEvents((prev) => prev.map((event) => (event.id === eventId ? { ...event, status: "archived" } : event)))
  }

  const handleActivateEvent = (event: Event) => {
    if (event.type === "recurring") {
      // Для повторяющихся событий - просто активируем
      setEvents((prev) => prev.map((e) => (e.id === event.id ? { ...e, status: "active" } : e)))
    } else {
      // Для разовых событий - открываем модальное окно для выбора новой даты
      setEventToActivate(event)
      setShowActivateModal(true)
    }
  }

  const handleConfirmActivation = (event: Event, newDate: Date) => {
    setEvents((prev) => prev.map((e) => (e.id === event.id ? { ...e, status: "active", date: newDate } : e)))
    setShowActivateModal(false)
    setEventToActivate(null)
  }

  const handleAddLocation = (location: Omit<Location, "id">) => {
    const newLocation = {
      ...location,
      id: `loc-${Date.now()}`,
    }
    setLocations((prev) => [...prev, newLocation])
    return newLocation
  }

  const clearFilters = () => {
    setFilters({
      eventType: "all",
      status: "all",
      searchQuery: "",
      service: "all",
    })
  }

  // Автоматическое архивирование прошедших разовых событий
  useEffect(() => {
    const now = new Date()
    setEvents((prev) =>
      prev.map((event) => {
        if (event.type === "single" && event.date && event.status === "active") {
          if (!isAfter(event.date, now)) {
            return { ...event, status: "archived" }
          }
        }
        return event
      }),
    )
  }, [])

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Управление расписанием</h1>
        <Button onClick={handleCreateEvent} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Создать событие
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по названию или месту..."
            className="pl-8"
            value={filters.searchQuery}
            onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className={showFilters ? "bg-secondary" : ""}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Тип события</label>
                <Select
                  value={filters.eventType}
                  onValueChange={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      eventType: value as "all" | "single" | "recurring",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Все типы" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все типы</SelectItem>
                    <SelectItem value="single">Разовые</SelectItem>
                    <SelectItem value="recurring">Повторяющиеся</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Услуга</label>
                <Select
                  value={filters.service}
                  onValueChange={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      service: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Все услуги" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все услуги</SelectItem>
                    {availableServices.map((service) => (
                      <SelectItem key={service.id} value={service.name}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-3 flex justify-end">
                <Button variant="ghost" onClick={clearFilters}>
                  Сбросить фильтры
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs
        defaultValue="active"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "active" | "archived")}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="active">Активные</TabsTrigger>
          <TabsTrigger value="archived">Архивные</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>
                Активные события
                <Badge className="ml-2">{filteredEvents.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredEvents.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Нет активных событий, соответствующих заданным критериям
                </div>
              ) : (
                <div className="hidden md:block">
                  <EventTable
                    events={filteredEvents}
                    onEdit={handleEditEvent}
                    onDelete={handleDeleteEvent}
                    onArchive={handleArchiveEvent}
                    isActive={true}
                  />
                </div>
              )}

              {/* Мобильное представление */}
              <div className="md:hidden">
                <div className="space-y-4">
                  {filteredEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onEdit={() => handleEditEvent(event)}
                      onDelete={() => handleDeleteEvent(event.id)}
                      onArchive={() => handleArchiveEvent(event.id)}
                      isActive={true}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="archived">
          <Card>
            <CardHeader>
              <CardTitle>
                Архивные события
                <Badge className="ml-2">{filteredEvents.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredEvents.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Нет архивных событий, соответствующих заданным критериям
                </div>
              ) : (
                <div className="hidden md:block">
                  <EventTable
                    events={filteredEvents}
                    onEdit={handleEditEvent}
                    onDelete={handleDeleteEvent}
                    onActivate={handleActivateEvent}
                    isActive={false}
                  />
                </div>
              )}

              {/* Мобильное представление */}
              <div className="md:hidden">
                <div className="space-y-4">
                  {filteredEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onEdit={() => handleEditEvent(event)}
                      onDelete={() => handleDeleteEvent(event.id)}
                      onActivate={() => handleActivateEvent(event)}
                      isActive={false}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Модальное окно создания/редактирования события */}
      <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Редактирование события" : "Создание события"}</DialogTitle>
          </DialogHeader>
          <EventForm
            event={selectedEvent}
            locations={locations}
            availableServices={serviceOptions}
            onSave={handleSaveEvent}
            onCancel={() => setShowEventModal(false)}
            onAddLocation={handleAddLocation}
          />
        </DialogContent>
      </Dialog>

      {/* Модальное окно активации разового события */}
      {eventToActivate && (
        <ActivateEventModal
          event={eventToActivate}
          open={showActivateModal}
          onClose={() => {
            setShowActivateModal(false)
            setEventToActivate(null)
          }}
          onConfirm={handleConfirmActivation}
        />
      )}

      {/* Floating Action Button для мобильных устройств */}
      <div className="md:hidden fixed bottom-6 right-6 z-10">
        <Button
          onClick={handleCreateEvent}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all bg-green-600 hover:bg-green-700"
        >
          <Plus className="h-6 w-6" />
          <span className="sr-only">Создать событие</span>
        </Button>
      </div>
    </div>
  )
}

