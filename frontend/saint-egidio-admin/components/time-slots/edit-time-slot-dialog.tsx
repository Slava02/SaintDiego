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
import type { TimeSlot, CreateTimeSlotRequest, Location, ServiceType } from "@/lib/types"
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

export function EditTimeSlotDialog({
  open,
  onOpenChange,
  timeSlot,
  onSuccess
}: EditTimeSlotDialogProps) {
  const [title, setTitle] = useState(timeSlot.title)
  const [type, setType] = useState<'single' | 'recurring'>(timeSlot.type)
  const [locationId, setLocationId] = useState<number>(timeSlot.locationId)
  const [capacity, setCapacity] = useState(timeSlot.capacity.toString())
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')
  const [services, setServices] = useState<any[]>([])
  const [recurrence, setRecurrence] = useState(timeSlot.recurrence || {
    frequency: 'weekly',
    interval: 1,
    endType: 'never',
    endValue: ''
  })

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

    setStartDate(startDateTime.toISOString().split('T')[0])
    setStartTime(startDateTime.toISOString().split('T')[1].substring(0, 5))
    setEndDate(endDateTime.toISOString().split('T')[0])
    setEndTime(endDateTime.toISOString().split('T')[1].substring(0, 5))

    // Format services
    const formattedServices = timeSlot.services.map(service => ({
      id: service.id || Date.now(),
      serviceTypeId: service.serviceTypeId,
      capacity: service.capacity,
      bookingWindow: service.bookingWindow,
      time: new Date(service.time).toISOString().split('T')[1].substring(0, 5)
    }))

    setServices(formattedServices.length > 0 ? formattedServices : [{ id: Date.now() }])
  }

  const fetchLocationsAndServices = async () => {
    try {
      const [locationsData, servicesData] = await Promise.all([
        getLocations(),
        getServices()
      ])
      setLocations(locationsData)
      setServiceTypes(servicesData.items)
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить данные',
        variant: 'destructive',
      })
    }
  }

  const handleAddService = () => {
    setServices([...services, { id: Date.now() }])
  }

  const handleRemoveService = (id: number) => {
    setServices(services.filter(service => service.id !== id))
  }

  const handleServiceChange = (id: number, data: any) => {
    setServices(services.map(service =>
      service.id === id ? { ...service, ...data } : service
    ))
  }

  const handleRecurrenceChange = (data: any) => {
    setRecurrence({ ...recurrence, ...data })
  }

  const handleCreateLocation = async (data: { name: string, address: string }) => {
    try {
      const newLocation = await createLocation(data)
      setLocations([...locations, newLocation])
      setLocationId(newLocation.id)
      setShowCreateLocation(false)
      toast({
        title: 'Успех',
        description: 'Локация успешно создана',
      })
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать локацию',
        variant: 'destructive',
      })
    }
  }

  const handleSubmit = async () => {
    if (!title || !locationId || !capacity || !startDate || !startTime || !endDate || !endTime) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive',
      })
      return
    }

    // Validate services
    const validServices = services.filter(service =>
      service.serviceTypeId && service.capacity && service.bookingWindow && service.time
    )

    if (validServices.length === 0) {
      toast({
        title: 'Ошибка',
        description: 'Добавьте хотя бы одну услугу',
        variant: 'destructive',
      })
      return
    }

    const formattedServices = validServices.map(service => {
      const serviceDate = new Date(startDate)
      const [hours, minutes] = service.time.split(':')
      serviceDate.setHours(Number.parseInt(hours), Number.parseInt(minutes), 0, 0)

      return {
        serviceTypeId: Number.parseInt(service.serviceTypeId),
        capacity: Number.parseInt(service.capacity),
        bookingWindow: Number.parseInt(service.bookingWindow),
        time: serviceDate.toISOString()
      }
    })

    const startDateTime = `${startDate}T${startTime}:00Z`
    const endDateTime = `${endDate}T${endTime}:00Z`

    const timeSlotData: CreateTimeSlotRequest = {
      title,
      type,
      locationId: Number(locationId),
      capacity: Number(capacity),
      startDate: startDateTime,
      endDate: endDateTime,
      services: formattedServices
    }

    if (type === 'recurring') {
      timeSlotData.recurrence = {
        frequency: recurrence.frequency as any,
        interval: recurrence.interval,
        endType: recurrence.endType as any,
        endValue: recurrence.endValue || ''
      }
    }

    setIsLoading(true)
    try {
      await updateTimeSlot(timeSlot.id, timeSlotData)
      onSuccess()
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить временной слот',
        variant: 'destructive',
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
                <Label htmlFor="title" className="required">Название события</Label>
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
                  onValueChange={(value) => setType(value as 'single' | 'recurring')}
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

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-startDate" className="required">Дата события</Label>
                  <Input
                    id="edit-startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-capacity" className="required">Вместимость</Label>
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
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-startTime" className="required">Время начала</Label>
                  <Input
                    id="edit-startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-endTime" className="required">Время окончания</Label>
                  <Input
                    id="edit-endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-location" className="required">Место проведения</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCreateLocation(true)}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Добавить место
                  </Button>
                </div>
                <Select
                  value={locationId.toString()}
                  onValueChange={(value) => setLocationId(Number.parseInt(value))}
                >
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

              {type === 'recurring' && (
                <RecurrenceForm
                  recurrence={recurrence}
                  onChange={handleRecurrenceChange}
                />
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="required">Услуги</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddService}
                  >
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
              {isLoading ? 'Сохранение...' : 'Сохранить'}
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
