"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { PlusCircle } from "lucide-react"
import type { TimeSlot, TimeSlotService, Location, ServiceType, Recurrence } from "@/lib/types"
import { updateTimeSlot } from "@/lib/api/time-slots"
import { getLocations, createLocation } from "@/lib/api/locations"
import { getServices } from "@/lib/api/services"
import { TimeSlotServiceForm } from "./time-slot-service-form"
import { RecurrenceForm } from "./recurrence-form"
import { CreateLocationDialog } from "./create-location-dialog"

interface EditTimeSlotDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  timeSlot: TimeSlot
  onSuccess: () => void
}

export function EditTimeSlotDialog({ open, onOpenChange, timeSlot, onSuccess }: EditTimeSlotDialogProps) {
  const [title, setTitle] = useState(timeSlot.title)
  const [type, setType] = useState<"single" | "recurring">(timeSlot.type)
  const [locationId, setLocationId] = useState<number>(timeSlot.locationId)
  const [capacity, setCapacity] = useState(timeSlot.capacity.toString())

  // Поля для даты и времени
  const [startDate, setStartDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endDate, setEndDate] = useState("")
  const [endTime, setEndTime] = useState("")

  const [services, setServices] = useState<any[]>([])
  const [recurrence, setRecurrence] = useState(
    timeSlot.recurrence || {
      frequency: "weekly",
      interval: 1,
      endType: "never",
      endValue: "",
    },
  )

  const [locations, setLocations] = useState<Location[]>([])
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateLocation, setShowCreateLocation] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      fetchLocationsAndServices()
      initializeFormData()
    }
  }, [open, timeSlot])

  const initializeFormData = () => {
    // Format dates
    const startDateTime = new Date(timeSlot.startDate)
    const endDateTime = new Date(timeSlot.endDate)

    setStartDate(startDateTime.toISOString().split("T")[0])
    setStartTime(startDateTime.toISOString().split("T")[1].substring(0, 5))
    setEndDate(endDateTime.toISOString().split("T")[0])
    setEndTime(endDateTime.toISOString().split("T")[1].substring(0, 5))

    // Format services
    const formattedServices = timeSlot.services.map((service) => ({
      id: service.timeSlotId || Date.now(),
      serviceTypeId: service.serviceTypeId,
      capacity: service.capacity,
      bookingWindow: service.bookingWindow,
      time: new Date(service.time).toISOString().split("T")[1].substring(0, 5),
    }))

    setServices(formattedServices.length > 0 ? formattedServices : [{ id: Date.now() }])
  }

  const fetchLocationsAndServices = async () => {
    try {
      const [locationsData, servicesData] = await Promise.all([getLocations(), getServices()])
      setLocations(locationsData)
      setServiceTypes(servicesData.items)
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные",
        variant: "destructive",
      })
    }
  }

  const handleAddService = () => {
    setServices([...services, { id: Date.now() }])
  }

  const handleRemoveService = (id: number) => {
    setServices(services.filter((service) => service.id !== id))
  }

  const handleServiceChange = (id: number, data: any) => {
    setServices(services.map((service) => (service.id === id ? { ...service, ...data } : service)))
  }

  const handleRecurrenceChange = (data: any) => {
    setRecurrence({ ...recurrence, ...data })
  }

  const handleCreateLocation = async (data: { name: string; address: string }) => {
    try {
      const newLocation = await createLocation(data)
      setLocations([...locations, newLocation])
      setLocationId(newLocation.id)
      setShowCreateLocation(false)
      toast({
        title: "Успех",
        description: "Локация успешно создана",
      })
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось создать локацию",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async () => {
    if (!title || !locationId || !capacity || !startDate || !startTime || !endDate || !endTime) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive",
      })
      return
    }

    // Validate services
    const validServices = services.filter(
      (service) => service.serviceTypeId && service.capacity && service.bookingWindow && service.time,
    )

    if (validServices.length === 0) {
      toast({
        title: "Ошибка",
        description: "Добавьте хотя бы одну услугу",
        variant: "destructive",
      })
      return
    }

    // Форматируем даты и время в ISO формат
    const startDateTime = new Date(`${startDate}T${startTime}:00`)
    const endDateTime = new Date(`${endDate}T${endTime}:00`)

    // Проверяем, что endDate после startDate
    if (endDateTime <= startDateTime) {
      toast({
        title: "Ошибка",
        description: "Дата и время окончания должны быть после даты и времени начала",
        variant: "destructive",
      })
      return
    }

    // Форматируем услуги
    const formattedServices: TimeSlotService[] = validServices.map((service) => {
      // Создаем дату для услуги на основе даты начала временного слота
      const serviceDate = new Date(`${startDate}T00:00:00`)
      const [hours, minutes] = service.time.split(":")
      serviceDate.setHours(Number.parseInt(hours), Number.parseInt(minutes), 0, 0)

      return {
        timeSlotId: timeSlot.id, // Добавляем timeSlotId для каждой услуги
        serviceTypeId: Number.parseInt(service.serviceTypeId),
        capacity: Number.parseInt(service.capacity),
        bookingWindow: Number.parseInt(service.bookingWindow),
        time: serviceDate.toISOString(),
      }
    })

    // Создаем полный объект TimeSlot для обновления
    const updatedTimeSlot: TimeSlot = {
      id: timeSlot.id, // Важно: сохраняем id временного слота
      title,
      type,
      locationId: Number(locationId),
      capacity: Number(capacity),
      startDate: startDateTime.toISOString(),
      endDate: endDateTime.toISOString(),
      status: timeSlot.status, // Сохраняем текущий статус
      services: formattedServices,
    }

    if (type === "recurring") {
      let endValue = recurrence.endValue

      if (recurrence.endType === "date" && recurrence.endValue) {
        // Если тип окончания - дата, форматируем её
        const endDate = new Date(recurrence.endValue)
        endValue = endDate.toISOString()
      }

      updatedTimeSlot.recurrence = {
        frequency: recurrence.frequency as "daily" | "weekly" | "monthly" | "yearly",
        interval: recurrence.interval,
        endType: recurrence.endType as "never" | "count" | "date",
        endValue: endValue,
      }
    }

    setIsLoading(true)
    try {
      await updateTimeSlot(timeSlot.id, updatedTimeSlot)
      onSuccess()
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить временной слот",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактирование временного слота</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="required">
                  Название события
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Введите название"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="required">Тип события</Label>
                <RadioGroup
                  value={type}
                  onValueChange={(value) => setType(value as "single" | "recurring")}
                  className="flex flex-row space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="single" id="edit-single" />
                    <Label htmlFor="edit-single">Разовое</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="recurring" id="edit-recurring" />
                    <Label htmlFor="edit-recurring">Повторяющееся</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Обновленные поля для даты и времени начала */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Начало события</Label>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-startDate" className="required">
                      Дата начала
                    </Label>
                    <Input
                      id="edit-startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-startTime" className="required">
                      Время начала
                    </Label>
                    <Input
                      id="edit-startTime"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Обновленные поля для даты и времени окончания */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Окончание события</Label>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-endDate" className="required">
                      Дата окончания
                    </Label>
                    <Input
                      id="edit-endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate} // Не позволяем выбрать дату раньше даты начала
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-endTime" className="required">
                      Время окончания
                    </Label>
                    <Input
                      id="edit-endTime"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-capacity" className="required">
                  Вместимость
                </Label>
                <Input
                  id="edit-capacity"
                  type="number"
                  min="1"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="Введите вместимость"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-location" className="required">
                    Место проведения
                  </Label>
                  <Button variant="ghost" size="sm" onClick={() => setShowCreateLocation(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Добавить место
                  </Button>
                </div>
                <Select value={locationId.toString()} onValueChange={(value) => setLocationId(Number.parseInt(value))}>
                  <SelectTrigger id="edit-location">
                    <SelectValue placeholder="Выберите место" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id.toString()}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {type === "recurring" && (
                <RecurrenceForm
                  recurrence={{
                    ...recurrence,
                    endValue: recurrence.endValue ?? "",
                  }}
                  onChange={handleRecurrenceChange}
                />
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="required">Услуги</Label>
                  <Button variant="outline" size="sm" onClick={handleAddService}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Добавить услугу
                  </Button>
                </div>

                {services.map((service, index) => (
                  <TimeSlotServiceForm
                    key={service.id}
                    service={service}
                    serviceTypes={serviceTypes}
                    onChange={(data) => handleServiceChange(service.id, data)}
                    onRemove={() => handleRemoveService(service.id)}
                    canRemove={services.length > 1}
                    index={index + 1}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Сохранение..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CreateLocationDialog
        open={showCreateLocation}
        onOpenChange={setShowCreateLocation}
        onSubmit={handleCreateLocation}
      />
    </>
  )
}
