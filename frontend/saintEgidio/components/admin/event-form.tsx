"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TimePickerDemo } from "@/components/time-picker"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { CalendarIcon, Info, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

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

interface AvailableService {
  id: string
  name: string
  defaultCapacity: number
  defaultBookingWindow: number
}

interface EventFormProps {
  event: Event | null
  locations: Location[]
  availableServices: AvailableService[]
  onSave: (event: Event) => void
  onCancel: () => void
  onAddLocation: (location: Omit<Location, "id">) => Location
}

export function EventForm({ event, locations, availableServices, onSave, onCancel, onAddLocation }: EventFormProps) {
  const [title, setTitle] = useState("")
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [time, setTime] = useState<string>("10:00")
  const [location, setLocation] = useState("")
  const [maxParticipants, setMaxParticipants] = useState(20)
  const [services, setServices] = useState<Service[]>([])
  const [eventType, setEventType] = useState<"single" | "recurring">("single")
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<"daily" | "weekly" | "monthly">("weekly")
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | undefined>(undefined)
  const [recurrenceInfinite, setRecurrenceInfinite] = useState(true)

  // Состояние для модального окна добавления места
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [newLocation, setNewLocation] = useState<Omit<Location, "id">>({
    name: "",
    address: "",
    description: "",
  })

  // Состояние для модального окна добавления услуги
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [selectedService, setSelectedService] = useState<string>("")
  const [serviceTime, setServiceTime] = useState<string>("10:00-11:00")
  const [serviceCapacity, setServiceCapacity] = useState<number>(10)
  const [serviceBookingWindow, setServiceBookingWindow] = useState<number>(14)
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null)

  // Валидация
  const [errors, setErrors] = useState<{
    title?: string
    location?: string
    date?: string
    maxParticipants?: string
    services?: string
    newLocationName?: string
  }>({})

  // Инициализация формы при редактировании
  useEffect(() => {
    if (event) {
      setTitle(event.title)
      setDate(event.date || undefined)
      if (event.date) {
        setTime(format(event.date, "HH:mm"))
      }
      setLocation(event.location)
      setMaxParticipants(event.maxParticipants)
      setServices(event.services)
      setEventType(event.type)

      if (event.recurrence) {
        setRecurrenceFrequency(event.recurrence.frequency)
        setRecurrenceEndDate(event.recurrence.endDate)
        setRecurrenceInfinite(event.recurrence.infinite)
      }
    } else {
      // Значения по умолчанию для нового события
      setTitle("")
      setDate(new Date())
      setTime("10:00")
      setLocation("")
      setMaxParticipants(20)
      setServices([])
      setEventType("single")
      setRecurrenceFrequency("weekly")
      setRecurrenceEndDate(undefined)
      setRecurrenceInfinite(true)
    }
  }, [event])

  // Проверка на превышение максимального количества участников
  const validateServices = () => {
    const totalCapacity = services.reduce((sum, service) => sum + service.capacity, 0)
    return totalCapacity <= maxParticipants
  }

  // Валидация формы
  const validateForm = () => {
    const newErrors: {
      title?: string
      location?: string
      date?: string
      maxParticipants?: string
      services?: string
    } = {}

    if (!title.trim()) {
      newErrors.title = "Название события обязательно"
    }

    if (!location) {
      newErrors.location = "Выберите место проведения"
    }

    if (eventType === "single" && !date) {
      newErrors.date = "Дата обязательна для разового события"
    }

    if (maxParticipants <= 0) {
      newErrors.maxParticipants = "Количество участников должно быть больше 0"
    }

    if (services.length === 0) {
      newErrors.services = "Добавьте хотя бы одну услугу"
    } else if (!validateServices()) {
      newErrors.services = "Суммарная вместимость услуг превышает максимальное количество участников"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Валидация нового места
  const validateNewLocation = () => {
    const newErrors: { newLocationName?: string } = {}

    if (!newLocation.name.trim()) {
      newErrors.newLocationName = "Название места обязательно"
    }

    setErrors((prev) => ({ ...prev, ...newErrors }))
    return !newErrors.newLocationName
  }

  // Обработчик сохранения события
  const handleSave = () => {
    if (!validateForm()) return

    let eventDate: Date | null = null

    if (eventType === "single" && date) {
      // Создание объекта даты с выбранным временем для разового события
      const [hours, minutes] = time.split(":").map(Number)
      eventDate = new Date(date)
      eventDate.setHours(hours, minutes)
    } else if (eventType === "recurring" && date) {
      // Для повторяющегося события дата - это дата первого события
      const [hours, minutes] = time.split(":").map(Number)
      eventDate = new Date(date)
      eventDate.setHours(hours, minutes)
    }

    const updatedEvent: Event = {
      id: event?.id || "temp-id",
      title,
      date: eventDate,
      location,
      maxParticipants,
      registeredParticipants: event?.registeredParticipants || 0,
      status: event?.status || "active",
      type: eventType,
      services,
    }

    if (eventType === "recurring") {
      updatedEvent.recurrence = {
        frequency: recurrenceFrequency,
        endDate: recurrenceInfinite ? undefined : recurrenceEndDate,
        infinite: recurrenceInfinite,
      }
    }

    onSave(updatedEvent)
  }

  // Обработчик добавления нового места
  const handleAddLocation = () => {
    if (!validateNewLocation()) return

    const addedLocation = onAddLocation(newLocation)

    // Устанавливаем новое место как выбранное
    setLocation(addedLocation.name)

    // Закрываем модальное окно
    setShowLocationModal(false)

    // Сбрасываем форму
    setNewLocation({
      name: "",
      address: "",
      description: "",
    })
  }

  // Обработчик добавления/редактирования услуги
  const handleSaveService = () => {
    if (!selectedService || !serviceTime) return

    const selectedServiceData = availableServices.find((s) => s.id === selectedService)
    if (!selectedServiceData) return

    if (editingServiceId) {
      // Редактирование существующей услуги
      setServices((prev) =>
        prev.map((service) =>
          service.id === editingServiceId
            ? {
                ...service,
                name: selectedServiceData.name,
                time: serviceTime,
                capacity: serviceCapacity,
                bookingWindow: serviceBookingWindow,
              }
            : service,
        ),
      )
    } else {
      // Добавление новой услуги
      const newService: Service = {
        id: Date.now().toString(),
        name: selectedServiceData.name,
        time: serviceTime,
        capacity: serviceCapacity,
        bookingWindow: serviceBookingWindow,
        registeredParticipants: 0,
      }
      setServices((prev) => [...prev, newService])
    }

    // Закрываем модальное окно и сбрасываем форму
    setShowServiceModal(false)
    setSelectedService("")
    setServiceTime("10:00-11:00")
    setServiceCapacity(10)
    setServiceBookingWindow(14)
    setEditingServiceId(null)
  }

  // Обработчик редактирования услуги
  const handleEditService = (service: Service) => {
    const serviceData = availableServices.find((s) => s.name === service.name)
    if (serviceData) {
      setSelectedService(serviceData.id)
    }
    setServiceTime(service.time)
    setServiceCapacity(service.capacity)
    setServiceBookingWindow(service.bookingWindow)
    setEditingServiceId(service.id)
    setShowServiceModal(true)
  }

  // Обработчик удаления услуги
  const handleDeleteService = (serviceId: string) => {
    setServices((prev) => prev.filter((service) => service.id !== serviceId))
  }

  // Обработчик выбора услуги
  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId)
    const selectedServiceData = availableServices.find((s) => s.id === serviceId)
    if (selectedServiceData) {
      setServiceCapacity(selectedServiceData.defaultCapacity)
      setServiceBookingWindow(selectedServiceData.defaultBookingWindow)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">
          Название события <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Введите название события"
          className={errors.title ? "border-red-500" : ""}
        />
        {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
      </div>

      <div className="space-y-2">
        <Label>Тип события</Label>
        <RadioGroup value={eventType} onValueChange={(value) => setEventType(value as "single" | "recurring")}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="single" id="single" />
            <Label htmlFor="single">Разовое</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="recurring" id="recurring" />
            <Label htmlFor="recurring">Повторяющееся</Label>
          </div>
        </RadioGroup>
      </div>

      {eventType === "recurring" && (
        <div className="space-y-4 border p-4 rounded-md bg-gray-50">
          <div className="space-y-2">
            <Label htmlFor="recurrenceFrequency">Частота повторения</Label>
            <Select
              value={recurrenceFrequency}
              onValueChange={(value) => setRecurrenceFrequency(value as "daily" | "weekly" | "monthly")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите частоту" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Ежедневно</SelectItem>
                <SelectItem value="weekly">Еженедельно</SelectItem>
                <SelectItem value="monthly">Ежемесячно</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="recurrenceInfinite"
                checked={recurrenceInfinite}
                onCheckedChange={(checked) => setRecurrenceInfinite(checked === true)}
              />
              <Label htmlFor="recurrenceInfinite">Повторять бесконечно</Label>
            </div>
          </div>

          {!recurrenceInfinite && (
            <div className="space-y-2">
              <Label htmlFor="recurrenceEndDate">Дата окончания</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !recurrenceEndDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {recurrenceEndDate ? format(recurrenceEndDate, "PPP", { locale: ru }) : "Выберите дату окончания"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={recurrenceEndDate}
                    onSelect={setRecurrenceEndDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">
            {eventType === "single" ? "Дата события" : "Дата первого события"} <span className="text-red-500">*</span>
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground",
                  errors.date ? "border-red-500" : "",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP", { locale: ru }) : "Выберите дату"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                disabled={(date) => date < new Date()}
              />
            </PopoverContent>
          </Popover>
          {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="time">
            Время <span className="text-red-500">*</span>
          </Label>
          <TimePickerDemo value={time} onChange={setTime} />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="location">
            Место проведения <span className="text-red-500">*</span>
          </Label>
          <Button variant="outline" size="sm" onClick={() => setShowLocationModal(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Добавить место
          </Button>
        </div>
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger className={errors.location ? "border-red-500" : ""}>
            <SelectValue placeholder="Выберите место проведения" />
          </SelectTrigger>
          <SelectContent>
            {locations.map((loc) => (
              <SelectItem key={loc.id} value={loc.name}>
                {loc.name} {loc.address ? `- ${loc.address}` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxParticipants">
          Максимальное количество участников <span className="text-red-500">*</span>
        </Label>
        <Input
          id="maxParticipants"
          type="number"
          min="1"
          value={maxParticipants}
          onChange={(e) => setMaxParticipants(Number.parseInt(e.target.value) || 0)}
          className={errors.maxParticipants ? "border-red-500" : ""}
        />
        {errors.maxParticipants && <p className="text-sm text-red-500">{errors.maxParticipants}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>
            Услуги <span className="text-red-500">*</span>
          </Label>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedService("")
              setServiceTime("10:00-11:00")
              setServiceCapacity(10)
              setServiceBookingWindow(14)
              setEditingServiceId(null)
              setShowServiceModal(true)
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Добавить услугу
          </Button>
        </div>

        {services.length > 0 ? (
          <div className="space-y-2">
            {services.map((service) => (
              <Card key={service.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{service.name}</h4>
                      <div className="text-sm text-muted-foreground">
                        <div>Время: {service.time}</div>
                        <div>
                          Вместимость: {service.registeredParticipants}/{service.capacity}
                        </div>
                        <div>Окно бронирования: {service.bookingWindow} дней</div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEditService(service)}>
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M11.8536 1.14645C11.6583 0.951184 11.3417 0.951184 11.1465 1.14645L3.71455 8.57836C3.62459 8.66832 3.55263 8.77461 3.50251 8.89155L2.04044 12.303C1.9599 12.491 2.00189 12.709 2.14646 12.8536C2.29103 12.9981 2.50905 13.0401 2.69697 12.9596L6.10847 11.4975C6.2254 11.4474 6.33168 11.3754 6.42164 11.2855L13.8536 3.85355C14.0488 3.65829 14.0488 3.34171 13.8536 3.14645L11.8536 1.14645ZM4.42161 9.28547L11.5 2.20711L12.7929 3.5L5.71455 10.5784L4.21924 11.2192L3.78081 10.7808L4.42161 9.28547Z"
                            fill="currentColor"
                            fillRule="evenodd"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteService(service.id)}>
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 15 15"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-red-500"
                        >
                          <path
                            d="M5.5 1C5.22386 1 5 1.22386 5 1.5C5 1.77614 5.22386 2 5.5 2H9.5C9.77614 2 10 1.77614 10 1.5C10 1.22386 9.77614 1 9.5 1H5.5ZM3 3.5C3 3.22386 3.22386 3 3.5 3H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H3.5C3.22386 4 3 3.77614 3 3.5ZM3.5 5C3.22386 5 3 5.22386 3 5.5C3 5.77614 3.22386 6 3.5 6H4V12C4 12.5523 4.44772 13 5 13H10C10.5523 13 11 12.5523 11 12V6H11.5C11.7761 6 12 5.77614 12 5.5C12 5.22386 11.7761 5 11.5 5H3.5ZM5 6H10V12H5V6Z"
                            fill="currentColor"
                            fillRule="evenodd"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center p-4 border rounded-md text-muted-foreground">Нет добавленных услуг</div>
        )}

        {errors.services && <p className="text-sm text-red-500">{errors.services}</p>}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
          {event ? "Сохранить изменения" : "Создать событие"}
        </Button>
      </div>

      {/* Модальное окно добавления места */}
      <Dialog open={showLocationModal} onOpenChange={setShowLocationModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Добавление нового места</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="locationName">
                Название <span className="text-red-500">*</span>
              </Label>
              <Input
                id="locationName"
                value={newLocation.name}
                onChange={(e) => setNewLocation((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Введите название места"
                className={errors.newLocationName ? "border-red-500" : ""}
              />
              {errors.newLocationName && <p className="text-sm text-red-500">{errors.newLocationName}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="locationAddress">Адрес</Label>
              <Input
                id="locationAddress"
                value={newLocation.address}
                onChange={(e) => setNewLocation((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="Введите адрес (необязательно)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="locationDescription">Описание</Label>
              <Textarea
                id="locationDescription"
                value={newLocation.description || ""}
                onChange={(e) => setNewLocation((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Введите описание (необязательно)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLocationModal(false)}>
              Отмена
            </Button>
            <Button onClick={handleAddLocation} className="bg-green-600 hover:bg-green-700">
              Добавить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Модальное окно добавления/редактирования услуги */}
      <Dialog open={showServiceModal} onOpenChange={setShowServiceModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingServiceId ? "Редактирование услуги" : "Добавление услуги"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="serviceName">
                Услуга <span className="text-red-500">*</span>
              </Label>
              <Select value={selectedService} onValueChange={handleServiceSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите услугу" />
                </SelectTrigger>
                <SelectContent>
                  {availableServices.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="serviceTime">
                Время оказания <span className="text-red-500">*</span>
              </Label>
              <Input
                id="serviceTime"
                value={serviceTime}
                onChange={(e) => setServiceTime(e.target.value)}
                placeholder="Например: 10:00-12:00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serviceCapacity">
                Вместимость <span className="text-red-500">*</span>
              </Label>
              <Input
                id="serviceCapacity"
                type="number"
                min="1"
                max={maxParticipants}
                value={serviceCapacity}
                onChange={(e) => setServiceCapacity(Number.parseInt(e.target.value) || 0)}
              />
              {serviceCapacity > maxParticipants && (
                <p className="text-sm text-red-500">
                  Вместимость услуги не может превышать максимальное количество участников события ({maxParticipants})
                </p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="serviceBookingWindow" className="mr-2">
                  Окно бронирования <span className="text-red-500">*</span>
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>На сколько дней вперед можно записаться на эту услугу?</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="serviceBookingWindow"
                type="number"
                min="1"
                value={serviceBookingWindow}
                onChange={(e) => setServiceBookingWindow(Number.parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowServiceModal(false)}>
              Отмена
            </Button>
            <Button
              onClick={handleSaveService}
              disabled={!selectedService || !serviceTime || serviceCapacity <= 0 || serviceCapacity > maxParticipants}
              className="bg-green-600 hover:bg-green-700"
            >
              {editingServiceId ? "Сохранить" : "Добавить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

