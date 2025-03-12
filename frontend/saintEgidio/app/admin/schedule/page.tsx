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
import { TimeSlot, Service, Location, LocationType, ServiceType } from "@/types/event"
import { TimeSlotForm } from "@/components/admin/time-slot-form"
import { TimeSlotCard } from "@/components/admin/time-slot-card"
import { TimeSlotTable } from "@/components/admin/time-slot-table"
import { ActivateTimeSlotModal } from "@/components/admin/activate-time-slot-modal"

interface FilterState {
  type: "all" | "single" | "recurring"
  status: "active" | "archived" | "all"
  searchQuery: string
  service: string
}

export default function SchedulePage() {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [filteredTimeSlots, setFilteredTimeSlots] = useState<TimeSlot[]>([])
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active")
  const [showFilters, setShowFilters] = useState(false)
  const [showActivateModal, setShowActivateModal] = useState(false)
  const [timeSlotToActivate, setTimeSlotToActivate] = useState<TimeSlot | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    type: "all",
    status: "all",
    searchQuery: "",
    service: "all",
  })
  const [availableServices, setAvailableServices] = useState<Service[]>([])

  // Мок-данные для мест
  const [locations] = useState<Location[]>([
    { id: "1", name: "Цветной", address: "Цветной бульвар, 25" },
    { id: "2", name: "Гиляровского", address: "ул. Гиляровского, 65" },
    { id: "3", name: "Ясная", address: "ул. Ясная, 10" },
  ])

  // Мок-данные для услуг
  const serviceOptions: Service[] = [
    {
      id: "s1",
      name: "Терапевт",
      type: "medical",
      defaultCapacity: 15,
      defaultBookingWindow: 14
    },
    {
      id: "s2",
      name: "Психолог",
      type: "psychology",
      defaultCapacity: 10,
      defaultBookingWindow: 7
    },
    {
      id: "s3",
      name: "Зимняя одежда",
      type: "clothing",
      defaultCapacity: 25,
      defaultBookingWindow: 14
    },
    {
      id: "s4",
      name: "Летняя одежда",
      type: "clothing",
      defaultCapacity: 25,
      defaultBookingWindow: 14
    },
    {
      id: "s5",
      name: "Консультация юриста",
      type: "legal",
      defaultCapacity: 20,
      defaultBookingWindow: 10
    }
  ]

  // Мок-данные для временных слотов
  useEffect(() => {
    const mockTimeSlots: TimeSlot[] = [
      {
        id: "1",
        title: "Медицинская консультация",
        type: "single",
        locationId: "1",
        location: "Цветной",
        capacity: 30,
        startDate: "2025-03-10T10:00:00",
        endDate: "2025-03-10T14:00:00",
        status: "active",
        services: [
          {
            serviceId: "s1",
            capacity: 15,
            bookingWindow: 14
          },
          {
            serviceId: "s2",
            capacity: 10,
            bookingWindow: 7
          }
        ]
      },
      {
        id: "2",
        title: "Выдача одежды",
        type: "single",
        locationId: "2",
        location: "Гиляровского",
        capacity: 50,
        startDate: "2025-03-15T14:00:00",
        endDate: "2025-03-15T18:00:00",
        status: "active",
        services: [
          {
            serviceId: "s3",
            capacity: 25,
            bookingWindow: 14
          },
          {
            serviceId: "s4",
            capacity: 25,
            bookingWindow: 14
          }
        ]
      },
      {
        id: "3",
        title: "Еженедельная продуктовая помощь",
        type: "recurring",
        locationId: "1",
        location: "Цветной",
        capacity: 100,
        startDate: "2025-04-20T11:00:00",
        endDate: "2025-04-20T15:00:00",
        status: "active",
        recurrence: {
          frequency: "weekly",
          interval: 1,
          endType: "never"
        },
        services: [
          {
            serviceId: "s5",
            capacity: 100,
            bookingWindow: 21
          }
        ]
      }
    ]

    setTimeSlots(mockTimeSlots)
  }, [])

  // Собираем все уникальные услуги из временных слотов для фильтра
  useEffect(() => {
    setAvailableServices(serviceOptions)
  }, [])

  // Обновление фильтров при изменении активной вкладки
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      status: activeTab === "active" ? "active" : "archived",
    }))
  }, [activeTab])

  // Фильтрация временных слотов
  useEffect(() => {
    let filtered = [...timeSlots]

    // Фильтр по статусу
    if (filters.status !== "all") {
      filtered = filtered.filter((slot) => slot.status === filters.status)
    }

    // Фильтр по типу временного слота
    if (filters.type !== "all") {
      filtered = filtered.filter((slot) => slot.type === filters.type)
    }

    // Фильтр по услуге
    if (filters.service !== "all") {
      filtered = filtered.filter((slot) =>
        slot.services.some((service) => {
          const serviceInfo = serviceOptions.find(s => s.id === service.serviceId)
          return serviceInfo?.name === filters.service
        })
      )
    }

    // Поиск
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(
        (slot) => slot.title.toLowerCase().includes(query) || slot.location.toLowerCase().includes(query)
      )
    }

    setFilteredTimeSlots(filtered)
  }, [timeSlots, filters])

  const handleCreateTimeSlot = () => {
    setSelectedTimeSlot(null)
    setIsEditing(false)
    setShowTimeSlotModal(true)
  }

  const handleEditTimeSlot = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot)
    setIsEditing(true)
    setShowTimeSlotModal(true)
  }

  const handleSaveTimeSlot = (timeSlot: TimeSlot) => {
    if (isEditing && selectedTimeSlot) {
      // Обновление существующего временного слота
      setTimeSlots((prev) => prev.map((slot) => (slot.id === selectedTimeSlot.id ? timeSlot : slot)))
    } else {
      // Создание нового временного слота
      const newTimeSlot = {
        ...timeSlot,
        id: `ts_${Date.now()}`,
        status: "active" as const,
      }
      setTimeSlots((prev) => [...prev, newTimeSlot])
    }
    setShowTimeSlotModal(false)
  }

  const handleDeleteTimeSlot = (timeSlotId: string) => {
    setTimeSlots((prev) => prev.filter((slot) => slot.id !== timeSlotId))
  }

  const handleArchiveTimeSlot = (timeSlotId: string) => {
    setTimeSlots((prev) => prev.map((slot) => (slot.id === timeSlotId ? { ...slot, status: "archived" } : slot)))
  }

  const handleActivateTimeSlot = (timeSlot: TimeSlot) => {
    if (timeSlot.type === "recurring") {
      // Для повторяющихся слотов - просто активируем
      setTimeSlots((prev) => prev.map((slot) => (slot.id === timeSlot.id ? { ...slot, status: "active" } : slot)))
    } else {
      // Для разовых слотов - открываем модальное окно для выбора новой даты
      setTimeSlotToActivate(timeSlot)
      setShowActivateModal(true)
    }
  }

  const handleConfirmActivation = (timeSlot: TimeSlot, newStartDate: string) => {
    const duration = new Date(timeSlot.endDate).getTime() - new Date(timeSlot.startDate).getTime()
    const newEndDate = new Date(new Date(newStartDate).getTime() + duration).toISOString()

    setTimeSlots((prev) => prev.map((slot) => (
      slot.id === timeSlot.id
        ? { ...slot, status: "active", startDate: newStartDate, endDate: newEndDate }
        : slot
    )))
    setShowActivateModal(false)
    setTimeSlotToActivate(null)
  }

  const clearFilters = () => {
    setFilters({
      type: "all",
      status: "all",
      searchQuery: "",
      service: "all",
    })
  }

  // Автоматическое архивирование прошедших разовых временных слотов
  useEffect(() => {
    const now = new Date()
    setTimeSlots((prev) =>
      prev.map((slot) => {
        if (slot.type === "single" && slot.status === "active") {
          if (!isAfter(new Date(slot.endDate), now)) {
            return { ...slot, status: "archived" }
          }
        }
        return slot
      }),
    )
  }, [])

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Управление расписанием</h1>
        <Button onClick={handleCreateTimeSlot} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Создать временной слот
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
                <label className="text-sm font-medium">Тип слота</label>
                <Select
                  value={filters.type}
                  onValueChange={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      type: value as "all" | "single" | "recurring",
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
                Активные временные слоты
                <Badge className="ml-2">{filteredTimeSlots.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredTimeSlots.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Нет активных временных слотов, соответствующих заданным критериям
                </div>
              ) : (
                <div className="hidden md:block">
                  <TimeSlotTable
                    timeSlots={filteredTimeSlots}
                    onEdit={handleEditTimeSlot}
                    onDelete={handleDeleteTimeSlot}
                    onArchive={handleArchiveTimeSlot}
                    isActive={true}
                    services={serviceOptions}
                  />
                </div>
              )}

              {/* Мобильное представление */}
              <div className="md:hidden">
                <div className="space-y-4">
                  {filteredTimeSlots.map((timeSlot) => (
                    <TimeSlotCard
                      key={timeSlot.id}
                      timeSlot={timeSlot}
                      onEdit={() => handleEditTimeSlot(timeSlot)}
                      onDelete={() => handleDeleteTimeSlot(timeSlot.id)}
                      onArchive={() => handleArchiveTimeSlot(timeSlot.id)}
                      isActive={true}
                      services={serviceOptions}
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
                Архивные временные слоты
                <Badge className="ml-2">{filteredTimeSlots.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredTimeSlots.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Нет архивных временных слотов, соответствующих заданным критериям
                </div>
              ) : (
                <div className="hidden md:block">
                  <TimeSlotTable
                    timeSlots={filteredTimeSlots}
                    onEdit={handleEditTimeSlot}
                    onDelete={handleDeleteTimeSlot}
                    onActivate={handleActivateTimeSlot}
                    isActive={false}
                    services={serviceOptions}
                  />
                </div>
              )}

              {/* Мобильное представление */}
              <div className="md:hidden">
                <div className="space-y-4">
                  {filteredTimeSlots.map((timeSlot) => (
                    <TimeSlotCard
                      key={timeSlot.id}
                      timeSlot={timeSlot}
                      onEdit={() => handleEditTimeSlot(timeSlot)}
                      onDelete={() => handleDeleteTimeSlot(timeSlot.id)}
                      onActivate={() => handleActivateTimeSlot(timeSlot)}
                      isActive={false}
                      services={serviceOptions}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Модальное окно создания/редактирования временного слота */}
      <Dialog open={showTimeSlotModal} onOpenChange={setShowTimeSlotModal}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Редактирование временного слота" : "Создание временного слота"}</DialogTitle>
          </DialogHeader>
          <TimeSlotForm
            timeSlot={selectedTimeSlot}
            locations={locations}
            availableServices={serviceOptions}
            onSave={handleSaveTimeSlot}
            onCancel={() => setShowTimeSlotModal(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Модальное окно активации разового временного слота */}
      {timeSlotToActivate && (
        <ActivateTimeSlotModal
          timeSlot={timeSlotToActivate}
          open={showActivateModal}
          onClose={() => {
            setShowActivateModal(false)
            setTimeSlotToActivate(null)
          }}
          onConfirm={handleConfirmActivation}
        />
      )}

      {/* Floating Action Button для мобильных устройств */}
      <div className="md:hidden fixed bottom-6 right-6 z-10">
        <Button
          onClick={handleCreateTimeSlot}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all bg-green-600 hover:bg-green-700"
        >
          <Plus className="h-6 w-6" />
          <span className="sr-only">Создать временной слот</span>
        </Button>
      </div>
    </div>
  )
}

