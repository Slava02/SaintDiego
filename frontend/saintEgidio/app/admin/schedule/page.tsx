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
import { TimeSlot, Service, Location, TimeSlotService } from "@/types/event"
import { TimeSlotForm } from "@/components/admin/time-slot-form"
import { TimeSlotCard } from "@/components/admin/time-slot-card"
import { TimeSlotTable } from "@/components/admin/time-slot-table"
import { ActivateTimeSlotModal } from "@/components/admin/activate-time-slot-modal"
import { useTimeSlots } from "@/hooks/useTimeSlots"
import { api } from "@/lib/api"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ru } from 'date-fns/locale'

interface FilterState {
  type: "all" | "single" | "recurring"
  status: "active" | "archived" | "all"
  searchQuery: string
  service: string
}

export default function SchedulePage() {
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
  const queryClient = useQueryClient()

  // Получаем данные с сервера
  const { timeSlots, isLoading, error, createTimeSlot, isCreating } = useTimeSlots({
    status: activeTab,
  })

  // Получаем список локаций
  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => api.getLocations(),
  })

  // Получаем список услуг
  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => api.getServices(),
  })

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
        slot.services.some((service: TimeSlotService) => {
          const serviceInfo = services.find(s => s.id === service.serviceId)
          return serviceInfo?.name === filters.service
        })
      )
    }

    // Поиск
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(
        (slot) => slot.title.toLowerCase().includes(query)
      )
    }

    setFilteredTimeSlots(filtered)
  }, [timeSlots, filters, services])

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

  const handleSaveTimeSlot = async (timeSlot: TimeSlot) => {
    try {
      if (isEditing && selectedTimeSlot) {
        // TODO: Добавить метод обновления в API
        // await api.updateTimeSlot(selectedTimeSlot.id, timeSlot)
      } else {
        await createTimeSlot(timeSlot)
      }
      setShowTimeSlotModal(false)
    } catch (error) {
      console.error('Error saving time slot:', error)
      // TODO: Добавить обработку ошибок
    }
  }

  const handleDeleteTimeSlot = async (timeSlotId: string) => {
    try {
      // TODO: Добавить метод удаления в API
      // await api.deleteTimeSlot(timeSlotId)
    } catch (error) {
      console.error('Error deleting time slot:', error)
      // TODO: Добавить обработку ошибок
    }
  }

  const handleArchiveTimeSlot = async (timeSlotId: string) => {
    try {
      // TODO: Добавить метод архивации в API
      // await api.archiveTimeSlot(timeSlotId)
    } catch (error) {
      console.error('Error archiving time slot:', error)
      // TODO: Добавить обработку ошибок
    }
  }

  const handleActivateTimeSlot = (timeSlot: TimeSlot) => {
    setTimeSlotToActivate(timeSlot)
    setShowActivateModal(true)
  }

  const handleConfirmActivation = async (timeSlot: TimeSlot, newStartDate: string) => {
    try {
      // TODO: Добавить метод активации в API
      // await api.activateTimeSlot(timeSlot.id, newStartDate)
      setShowActivateModal(false)
    } catch (error) {
      console.error('Error activating time slot:', error)
      // TODO: Добавить обработку ошибок
    }
  }

  const clearFilters = () => {
    setFilters({
      type: "all",
      status: activeTab === "active" ? "active" : "archived",
      searchQuery: "",
      service: "all",
    })
  }

  if (isLoading) {
    return <div>Загрузка...</div>
  }

  if (error) {
    return <div>Ошибка загрузки данных</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Расписание</h1>
        <Button onClick={handleCreateTimeSlot}>
          <Plus className="h-4 w-4 mr-2" />
          Создать временной слот
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Список временных слотов</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4 mr-2" />
                Фильтры
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showFilters && (
            <div className="mb-4 space-y-4">
              <div className="flex items-center space-x-4">
                <Input
                  placeholder="Поиск..."
                  value={filters.searchQuery}
                  onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
                  className="max-w-sm"
                />
                <Select
                  value={filters.type}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, type: value as FilterState["type"] }))}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Тип слота" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все типы</SelectItem>
                    <SelectItem value="single">Одиночный</SelectItem>
                    <SelectItem value="recurring">Повторяющийся</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.service}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, service: value }))}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Услуга" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все услуги</SelectItem>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.name}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={clearFilters}>
                  Сбросить
                </Button>
              </div>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "active" | "archived")}>
            <TabsList>
              <TabsTrigger value="active">Активные</TabsTrigger>
              <TabsTrigger value="archived">Архивные</TabsTrigger>
            </TabsList>
            <TabsContent value="active">
              <TimeSlotTable
                timeSlots={filteredTimeSlots}
                onEdit={handleEditTimeSlot}
                onDelete={handleDeleteTimeSlot}
                onArchive={handleArchiveTimeSlot}
                isActive={true}
                services={services}
              />
            </TabsContent>
            <TabsContent value="archived">
              <TimeSlotTable
                timeSlots={filteredTimeSlots}
                onEdit={handleEditTimeSlot}
                onDelete={handleDeleteTimeSlot}
                onActivate={handleActivateTimeSlot}
                isActive={false}
                services={services}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={showTimeSlotModal} onOpenChange={setShowTimeSlotModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Редактирование временного слота" : "Создание временного слота"}
            </DialogTitle>
          </DialogHeader>
          <TimeSlotForm
            timeSlot={selectedTimeSlot}
            locations={locations}
            availableServices={services}
            onSave={handleSaveTimeSlot}
            onCancel={() => setShowTimeSlotModal(false)}
          />
        </DialogContent>
      </Dialog>

      {timeSlotToActivate && (
        <ActivateTimeSlotModal
          open={showActivateModal}
          onClose={() => setShowActivateModal(false)}
          timeSlot={timeSlotToActivate}
          onConfirm={handleConfirmActivation}
        />
      )}
    </div>
  )
}

