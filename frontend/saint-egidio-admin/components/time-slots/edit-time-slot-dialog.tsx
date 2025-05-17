"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { PlusCircle, Lock, AlertTriangle } from "lucide-react"
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
import type { TimeSlot, TimeSlotService, Location, ServiceType } from "@/lib/types"
import { updateTimeSlot } from "@/lib/api/time-slots"
import { getLocations, createLocation } from "@/lib/api/locations"
import { getServices } from "@/lib/api/services"
import { TimeSlotServiceForm } from "./time-slot-service-form"
import { CreateLocationDialog } from "./create-location-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

  // Разделяем существующие и новые услуги
  const [existingServices, setExistingServices] = useState<TimeSlotService[]>([])
  const [newServices, setNewServices] = useState<any[]>([])

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

  // Состояние для предупреждения при изменении времени услуги
  const [timeWarningVisible, setTimeWarningVisible] = useState(false)
  const [serviceBeingEdited, setServiceBeingEdited] = useState<any>(null)
  const [newServiceTime, setNewServiceTime] = useState("")

  // Состояние для валидации времени услуг
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      fetchLocationsAndServices()
      initializeFormData()
    }
  }, [open, timeSlot])

  // Функция для конвертации UTC в московское время (UTC+3)
  const convertToMoscowTime = (utcDate: Date): Date => {
    const moscowDate = new Date(utcDate)
    moscowDate.setHours(moscowDate.getHours() + 3)
    return moscowDate
  }

  // Функция для конвертации московского времени в UTC
  const convertToUTC = (moscowDate: Date): Date => {
    const utcDate = new Date(moscowDate)
    utcDate.setHours(utcDate.getHours() - 3)
    return utcDate
  }

  const initializeFormData = () => {
    // Конвертируем UTC даты в московское время
    const startDateTime = convertToMoscowTime(new Date(timeSlot.startDate))
    const endDateTime = convertToMoscowTime(new Date(timeSlot.endDate))

    setStartDate(startDateTime.toISOString().split("T")[0])
    setStartTime(startDateTime.toISOString().split("T")[1].substring(0, 5))
    setEndDate(endDateTime.toISOString().split("T")[0])
    setEndTime(endDateTime.toISOString().split("T")[1].substring(0, 5))

    // Сохраняем существующие услуги
    setExistingServices([...timeSlot.services])

    // Сбрасываем новые услуги
    setNewServices([])
    setValidationErrors({})
  }

  const fetchLocationsAndServices = async () => {
    try {
      const [locationsData, servicesData] = await Promise.all([getLocations(), getServices(1, 10, true)])
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
    setNewServices([...newServices, { id: Date.now() }])
  }

  const handleRemoveService = (id: number) => {
    setNewServices(newServices.filter((service) => service.id !== id))

    // Удаляем ошибки валидации для удаленной услуги
    const newErrors = { ...validationErrors }
    delete newErrors[`service-${id}`]
    setValidationErrors(newErrors)
  }

  const handleServiceChange = (id: number, data: any) => {
    setNewServices(newServices.map((service) => (service.id === id ? { ...service, ...data } : service)))

    // Если изменилось время, проверяем его валидность
    if (data.time) {
      validateServiceTime(id, data.time)
    }
  }

  // Функция для валидации времени новой услуги
  const validateServiceTime = (serviceId: number, serviceTime: string) => {
    if (!serviceTime || !startDate || !startTime || !endDate || !endTime) return

    // Создаем объекты Date для времени услуги и временного слота
    const [hours, minutes] = serviceTime.split(":")

    // Создаем дату услуги в московском времени
    const serviceDateTime = new Date(`${startDate}T${serviceTime}:00`)

    // Создаем даты начала и конца таймслота в московском времени
    const slotStartDateTime = new Date(`${startDate}T${startTime}:00`)
    const slotEndDateTime = new Date(`${endDate}T${endTime}:00`)

    // Проверяем, что время услуги находится в пределах временного слота
    const isValid = serviceDateTime >= slotStartDateTime && serviceDateTime <= slotEndDateTime

    // Обновляем ошибки валидации
    const newErrors = { ...validationErrors }
    if (!isValid) {
      newErrors[`service-${serviceId}`] = "Время услуги должно быть в пределах временного слота"
    } else {
      delete newErrors[`service-${serviceId}`]
    }

    setValidationErrors(newErrors)
  }

  // Функция для обработки изменения времени существующей услуги
  const handleExistingServiceTimeChange = (service: TimeSlotService, newTime: string) => {
    setServiceBeingEdited(service)
    setNewServiceTime(newTime)
    setTimeWarningVisible(true)
  }

  // Функция для подтверждения изменения времени
  const confirmTimeChange = () => {
    if (serviceBeingEdited && newServiceTime) {
      // Обновляем время в существующей услуге
      setExistingServices(
        existingServices.map((service) =>
          service === serviceBeingEdited
            ? { ...service, time: createTimeString(service.time, newServiceTime) }
            : service,
        ),
      )
      setTimeWarningVisible(false)
    }
  }

  // Функция для создания строки времени с сохранением даты
  const createTimeString = (originalTimeString: string, newTimeValue: string) => {
    // Получаем оригинальную дату в UTC
    const originalDate = new Date(originalTimeString)

    // Парсим новое время (в московском времени)
    const [hours, minutes] = newTimeValue.split(":")

    // Создаем новую дату в московском времени
    const moscowDate = convertToMoscowTime(originalDate)
    moscowDate.setHours(Number.parseInt(hours, 10), Number.parseInt(minutes, 10))

    // Конвертируем обратно в UTC для сохранения
    const utcDate = convertToUTC(moscowDate)

    return utcDate.toISOString()
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

    // Проверяем наличие ошибок валидации
    if (Object.keys(validationErrors).length > 0) {
      toast({
        title: "Ошибка",
        description: "Исправьте ошибки валидации времени услуг",
        variant: "destructive",
      })
      return
    }

    // Validate new services
    const validNewServices = newServices.filter(
      (service) => service.serviceTypeId && service.capacity && service.bookingWindow && service.time,
    )

    // Форматируем даты и время в ISO формат (конвертируем из московского времени в UTC)
    const moscowStartDateTime = new Date(`${startDate}T${startTime}:00`)
    const moscowEndDateTime = new Date(`${endDate}T${endTime}:00`)

    // Проверяем, что endDate после startDate
    if (moscowEndDateTime <= moscowStartDateTime) {
      toast({
        title: "Ошибка",
        description: "Дата и время окончания должны быть после даты и времени начала",
        variant: "destructive",
      })
      return
    }

    // Форматируем новые услуги
    const formattedNewServices: TimeSlotService[] = validNewServices.map((service) => {
      // Создаем дату для услуги на основе даты начала временного слота и времени услуги (в московском времени)
      const [hours, minutes] = service.time.split(":")

      // Используем дату в формате "0000-01-01" и время, введенное пользователем, без конвертации в UTC
      const moscowServiceDate = new Date(`${startDate}T${service.time}:00`)
      const serviceTime = moscowServiceDate.toISOString()

      return {
        timeSlotId: timeSlot.id, // Добавляем timeSlotId для каждой услуги
        serviceTypeId: Number.parseInt(service.serviceTypeId),
        capacity: Number.parseInt(service.capacity),
        bookingWindow: Number.parseInt(service.bookingWindow),
        time: serviceTime,
      }
    })

    // Объединяем существующие и новые услуги
    const allServices = [...existingServices, ...formattedNewServices]

    // Создаем полный объект TimeSlot для обновления
    const updatedTimeSlot: TimeSlot = {
      id: timeSlot.id, // Важно: сохраняем id временного слота
      title,
      type,
      locationId: Number(locationId),
      capacity: Number(capacity),
      startDate: moscowStartDateTime.toISOString(),
      endDate: moscowEndDateTime.toISOString(),
      services: allServices,
      recurrence: timeSlot.recurrence, // Сохраняем оригинальные настройки повторения
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

  // Функция для отображения времени услуги в читаемом формате (московское время)
  const formatServiceTime = (timeString: string) => {
    const utcDate = new Date(timeString)
    const moscowDate = convertToMoscowTime(utcDate)
    return moscowDate.toISOString().split("T")[1].substring(0, 5)
  }

  // Функция для получения названия услуги по ID
  const getServiceTypeName = (serviceTypeId: number) => {
    const serviceType = serviceTypes.find((type) => type.id === serviceTypeId)
    return serviceType ? serviceType.name : `Услуга #${serviceTypeId}`
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
                  disabled
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="single" id="edit-single" disabled />
                    <Label htmlFor="edit-single" className="opacity-70">
                      Разовое
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="recurring" id="edit-recurring" disabled />
                    <Label htmlFor="edit-recurring" className="opacity-70">
                      Повторяющееся
                    </Label>
                  </div>
                </RadioGroup>
                <p className="text-xs text-muted-foreground">Тип события нельзя изменить после создания</p>
              </div>

              {/* Обновленные поля для даты и времени начала (московское время) */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Начало события </Label>
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

              {/* Обновленные поля для даты и времени окончания (московское время) */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Окончание события </Label>
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

              {/* Отображение настроек повторения в режиме только для чтения */}
              {type === "recurring" && (
                <Card className="border-muted bg-muted/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center space-x-2 text-sm font-medium">
                      <span>Настройки повторения</span>
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">(нельзя изменить)</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-2 md:grid-cols-2 text-sm">
                    <div>
                      <span className="font-medium">Частота:</span>{" "}
                      {recurrence.frequency === "daily"
                        ? "Ежедневно"
                        : recurrence.frequency === "weekly"
                          ? "Еженедельно"
                          : recurrence.frequency === "monthly"
                            ? "Ежемесячно"
                            : "Ежегодно"}
                    </div>
                    <div>
                      <span className="font-medium">Интервал:</span> {recurrence.interval}
                    </div>
                    <div>
                      <span className="font-medium">Окончание:</span>{" "}
                      {recurrence.endType === "never"
                        ? "Никогда"
                        : recurrence.endType === "count"
                          ? `После ${recurrence.endValue} повторений`
                          : `До ${new Date(recurrence.endValue || "").toLocaleDateString()}`}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Существующие услуги (с ограниченными возможностями редактирования) */}
              {existingServices.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Label className="text-base font-medium">Существующие услуги </Label>
                    <span className="text-xs text-muted-foreground">(тип услуги нельзя изменить)</span>
                  </div>

                  <div className="space-y-2">
                    {existingServices.map((service, index) => (
                      <Card key={`existing-${index}`}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">
                            Услуга {index + 1}: {getServiceTypeName(service.serviceTypeId)}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor={`service-type-${index}`}>Название</Label>
                            <Input
                              id={`service-type-${index}`}
                              value={getServiceTypeName(service.serviceTypeId)}
                              disabled
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`service-capacity-${index}`}>Вместимость</Label>
                            <Input
                              id={`service-capacity-${index}`}
                              type="number"
                              min="1"
                              value={service.capacity}
                              onChange={(e) => {
                                const newServices = [...existingServices]
                                newServices[index] = {
                                  ...service,
                                  capacity: Number.parseInt(e.target.value),
                                }
                                setExistingServices(newServices)
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`service-window-${index}`}>Окно бронирования (дней)</Label>
                            <Input
                              id={`service-window-${index}`}
                              type="number"
                              min="1"
                              value={service.bookingWindow}
                              onChange={(e) => {
                                const newServices = [...existingServices]
                                newServices[index] = {
                                  ...service,
                                  bookingWindow: Number.parseInt(e.target.value),
                                }
                                setExistingServices(newServices)
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`service-time-${index}`}>Время</Label>
                            <Input
                              id={`service-time-${index}`}
                              type="time"
                              value={formatServiceTime(service.time)}
                              onChange={(e) => handleExistingServiceTimeChange(service, e.target.value)}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Новые услуги (можно редактировать) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Добавить новые услуги </Label>
                  <Button variant="outline" size="sm" onClick={handleAddService}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Добавить услугу
                  </Button>
                </div>

                {newServices.length === 0 ? (
                  <div className="rounded-md border border-dashed p-4 text-center text-muted-foreground">
                    Нажмите кнопку "Добавить услугу", чтобы добавить новую услугу к временному слоту
                  </div>
                ) : (
                  newServices.map((service, index) => (
                    <div key={service.id}>
                      <TimeSlotServiceForm
                        service={service}
                        serviceTypes={serviceTypes}
                        onChange={(data) => handleServiceChange(service.id, data)}
                        onRemove={() => handleRemoveService(service.id)}
                        canRemove={true}
                        index={index + 1}
                      />
                      {validationErrors[`service-${service.id}`] && (
                        <div className="mt-1 flex items-center text-red-500 text-sm">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          {validationErrors[`service-${service.id}`]}
                        </div>
                      )}
                    </div>
                  ))
                )}
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

      {/* Диалог предупреждения при изменении времени услуги */}
      <AlertDialog open={timeWarningVisible} onOpenChange={setTimeWarningVisible}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Внимание! Изменение времени услуги</AlertDialogTitle>
            <AlertDialogDescription>
              <p>
                Изменение времени услуги повлияет на все события, связанные с этой услугой. Все существующие записи на
                эту услугу будут перенесены на новое время.
              </p>
              <p className="mt-2 font-semibold text-amber-600">
                Пожалуйста, убедитесь, что все записавшиеся люди знают об изменении времени.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={confirmTimeChange}>Подтвердить изменение</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
