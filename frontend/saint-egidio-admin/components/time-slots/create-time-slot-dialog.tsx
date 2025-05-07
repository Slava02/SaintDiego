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
import type { CreateTimeSlotRequest, Location, ServiceType } from "@/lib/types"
import { createTimeSlot } from "@/lib/api/time-slots"
import { getLocations, createLocation } from "@/lib/api/locations"
import { getServices } from "@/lib/api/services"
import { TimeSlotServiceForm } from "./time-slot-service-form"
import { RecurrenceForm } from "./recurrence-form"
import { CreateLocationDialog } from "./create-location-dialog"

interface CreateTimeSlotDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateTimeSlotDialog({ open, onOpenChange, onSuccess }: CreateTimeSlotDialogProps) {
  const [title, setTitle] = useState("")
  const [type, setType] = useState<"single" | "recurring">("single")
  const [locationId, setLocationId] = useState<number | "">("")
  const [capacity, setCapacity] = useState("")
  const [startDate, setStartDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endDate, setEndDate] = useState("")
  const [endTime, setEndTime] = useState("")
  const [services, setServices] = useState<any[]>([{ id: Date.now() }])
  const [recurrence, setRecurrence] = useState({
    frequency: "weekly",
    interval: 1,
    endType: "never",
    endValue: "",
  })

  const [locations, setLocations] = useState<Location[]>([])
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateLocation, setShowCreateLocation] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      fetchLocationsAndServices()
    }
  }, [open])

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

    const formattedServices = validServices.map((service) => ({
      serviceTypeId: Number.parseInt(service.serviceTypeId),
      capacity: Number.parseInt(service.capacity),
      bookingWindow: Number.parseInt(service.bookingWindow),
      time: service.time,
    }))

    const startDateTime = `${startDate}T${startTime}:00Z`
    const endDateTime = `${endDate}T${endTime}:00Z`

    const timeSlotData: CreateTimeSlotRequest = {
      title,
      type,
      locationId: Number(locationId),
      capacity: Number(capacity),
      startDate: startDateTime,
      endDate: endDateTime,
      services: formattedServices,
    }

    if (type === "recurring") {
      timeSlotData.recurrence = {
        frequency: recurrence.frequency as any,
        interval: recurrence.interval,
        endType: recurrence.endType as any,
        endValue: recurrence.endValue || "",
      }
    }

    setIsLoading(true)
    try {
      await createTimeSlot(timeSlotData)
      onSuccess()
      resetForm()
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось создать временной слот",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setTitle("")
    setType("single")
    setLocationId("")
    setCapacity("")
    setStartDate("")
    setStartTime("")
    setEndDate("")
    setEndTime("")
    setServices([{ id: Date.now() }])
    setRecurrence({
      frequency: "weekly",
      interval: 1,
      endType: "never",
      endValue: "",
    })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Создание нового временного слота</DialogTitle>
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
                    <RadioGroupItem value="single" id="single" />
                    <Label htmlFor="single">Разовое</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="recurring" id="recurring" />
                    <Label htmlFor="recurring">Повторяющееся</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="required">
                    Дата события
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity" className="required">
                    Вместимость
                  </Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="Введите вместимость"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startTime" className="required">
                    Время начала
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime" className="required">
                    Время окончания
                  </Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="location" className="required">
                    Место проведения
                  </Label>
                  <Button variant="ghost" size="sm" onClick={() => setShowCreateLocation(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Добавить место
                  </Button>
                </div>
                <Select value={locationId.toString()} onValueChange={(value) => setLocationId(Number.parseInt(value))}>
                  <SelectTrigger>
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

              {type === "recurring" && <RecurrenceForm recurrence={recurrence} onChange={handleRecurrenceChange} />}

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
