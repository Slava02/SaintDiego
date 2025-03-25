import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { Calendar as CalendarIcon, Info, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { TimeSlot, Service, Location, Recurrence, TimeSlotService } from "@/types/event"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { ServiceConfig } from "./service-config"
import { api } from "@/lib/api"

interface TimeSlotFormProps {
    timeSlot?: TimeSlot | null
    locations: Location[]
    availableServices: Service[]
    onSave: (timeSlot: TimeSlot) => void
    onCancel: () => void
    onAddLocation?: (location: Location) => void
}

interface LocationModalProps {
    onSave: (location: Location) => void
    onClose: () => void
}

function LocationModal({ onSave, onClose }: LocationModalProps) {
    const [name, setName] = useState("")
    const [address, setAddress] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave({
            id: `loc_${Date.now()}`,
            name,
            address
        })
        onClose()
    }

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Добавить новое место</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Название</Label>
                    <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Введите название места"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="address">Адрес</Label>
                    <Input
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Введите адрес"
                        required
                    />
                </div>
                <div className="flex justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Отмена
                    </Button>
                    <Button type="submit">Сохранить</Button>
                </div>
            </form>
        </DialogContent>
    )
}

export function TimeSlotForm({ timeSlot, locations, availableServices, onSave, onCancel, onAddLocation }: TimeSlotFormProps) {
    // Основные состояния формы
    const [title, setTitle] = useState(timeSlot?.title || "")
    const [locationId, setLocationId] = useState<string>(timeSlot?.locationId || locations[0]?.id || "")
    const [capacity, setCapacity] = useState(timeSlot?.capacity.toString() || "20")
    const [startDate, setStartDate] = useState<Date | undefined>(timeSlot ? new Date(timeSlot.startDate) : new Date())
    const [endDate, setEndDate] = useState<Date | undefined>(timeSlot ? new Date(timeSlot.endDate) : new Date())
    const [startTime, setStartTime] = useState(timeSlot ? format(new Date(timeSlot.startDate), "HH:mm") : "10:00")
    const [endTime, setEndTime] = useState(timeSlot ? format(new Date(timeSlot.endDate), "HH:mm") : "11:00")
    const [type, setType] = useState<"single" | "recurring">(timeSlot?.type || "single")
    const [selectedServices, setSelectedServices] = useState<TimeSlotService[]>(timeSlot?.services || [])

    // Состояния для повторения
    const [recurrenceFrequency, setRecurrenceFrequency] = useState<"daily" | "weekly" | "monthly">(
        timeSlot?.recurrence?.frequency || "weekly"
    )
    const [recurrenceInterval, setRecurrenceInterval] = useState(
        timeSlot?.recurrence?.interval.toString() || "1"
    )
    const [recurrenceEndType, setRecurrenceEndType] = useState<"never" | "date">(
        timeSlot?.recurrence?.endType || "never"
    )
    const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | undefined>(
        timeSlot?.recurrence?.endValue ? new Date(timeSlot.recurrence.endValue) : undefined
    )

    // Состояния для модального окна добавления места
    const [showLocationModal, setShowLocationModal] = useState(false)
    const [newLocation, setNewLocation] = useState<Omit<Location, "id">>({
        name: "",
        address: "",
    })

    // Состояния для ошибок
    const [errors, setErrors] = useState<Record<string, string>>({})

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!title) {
            newErrors.title = "Название обязательно"
        }

        if (!locationId) {
            newErrors.location = "Место обязательно"
        }

        if (!capacity || parseInt(capacity) <= 0) {
            newErrors.capacity = "Вместимость должна быть больше 0"
        }

        if (!startDate) {
            newErrors.startDate = "Дата начала обязательна"
        }

        if (!endDate) {
            newErrors.endDate = "Дата окончания обязательна"
        }

        if (startDate && endDate && endDate <= startDate) {
            newErrors.endDate = "Дата окончания должна быть позже даты начала"
        }

        if (selectedServices.length === 0) {
            newErrors.services = "Добавьте хотя бы одну услугу"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSave = async () => {
        if (!validateForm()) return

        const startDateTime = new Date(startDate!)
        const [startHours, startMinutes] = startTime.split(":").map(Number)
        startDateTime.setHours(startHours, startMinutes)

        const endDateTime = new Date(endDate!)
        const [endHours, endMinutes] = endTime.split(":").map(Number)
        endDateTime.setHours(endHours, endMinutes)

        const selectedLocation = locations.find(loc => loc.id === locationId)
        if (!selectedLocation) {
            setErrors((prev) => ({
                ...prev,
                location: "Выбранное место не найдено"
            }))
            return
        }

        const newTimeSlot: TimeSlot = {
            id: timeSlot?.id || `ts_${Date.now()}`,
            title,
            type,
            locationId,
            location: selectedLocation.name,
            capacity: parseInt(capacity),
            startDate: startDateTime.toISOString(),
            endDate: endDateTime.toISOString(),
            status: timeSlot?.status || "active",
            services: selectedServices,
            ...(type === "recurring" && {
                recurrence: {
                    frequency: recurrenceFrequency,
                    interval: parseInt(recurrenceInterval),
                    endType: recurrenceEndType,
                    endValue: recurrenceEndType === "date" ? recurrenceEndDate?.toISOString() : undefined
                }
            })
        }

        try {
            if (timeSlot) {
                // TODO: Implement update endpoint
                onSave(newTimeSlot)
            } else {
                const createdTimeSlot = await api.createTimeSlot(newTimeSlot)
                onSave(createdTimeSlot)
            }
        } catch (error) {
            console.error('Failed to save time slot:', error)
            // TODO: Add proper error handling and user notification
        }
    }

    // Обработчик добавления нового места
    const handleAddLocation = () => {
        if (!validateForm()) return

        const location = {
            ...newLocation,
            id: `loc_${Date.now()}`
        }

        onAddLocation!(location)
        setLocationId(location.id)
        setShowLocationModal(false)
        setNewLocation({
            name: "",
            address: "",
        })
    }

    return (
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <div className="space-y-4">
                <div>
                    <Label htmlFor="title">Название</Label>
                    <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Введите название временного слота"
                        className={cn(errors.title && "border-red-500")}
                    />
                    {errors.title && (
                        <p className="text-sm text-red-500 mt-1">{errors.title}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="location">Место</Label>
                    <Select
                        value={locationId}
                        onValueChange={setLocationId}
                    >
                        <SelectTrigger className={cn(errors.location && "border-red-500")}>
                            <SelectValue placeholder="Выберите место" />
                        </SelectTrigger>
                        <SelectContent>
                            {locations.map((location) => (
                                <SelectItem key={location.id} value={location.id}>
                                    {location.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.location && (
                        <p className="text-sm text-red-500 mt-1">{errors.location}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="capacity">Вместимость</Label>
                    <Input
                        id="capacity"
                        type="number"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        min="1"
                        className={cn(errors.capacity && "border-red-500")}
                    />
                    {errors.capacity && (
                        <p className="text-sm text-red-500 mt-1">{errors.capacity}</p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Дата начала</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !startDate && "text-muted-foreground",
                                        errors.startDate && "border-red-500"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {startDate ? format(startDate, "PPP", { locale: ru }) : "Выберите дату"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={startDate}
                                    onSelect={setStartDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        {errors.startDate && (
                            <p className="text-sm text-red-500 mt-1">{errors.startDate}</p>
                        )}
                    </div>

                    <div>
                        <Label>Дата окончания</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !endDate && "text-muted-foreground",
                                        errors.endDate && "border-red-500"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {endDate ? format(endDate, "PPP", { locale: ru }) : "Выберите дату"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={endDate}
                                    onSelect={setEndDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        {errors.endDate && (
                            <p className="text-sm text-red-500 mt-1">{errors.endDate}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Время начала</Label>
                        <Input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                        />
                    </div>

                    <div>
                        <Label>Время окончания</Label>
                        <Input
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <Label>Тип</Label>
                    <RadioGroup
                        value={type}
                        onValueChange={(value: "single" | "recurring") => setType(value)}
                        className="flex space-x-4"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="single" id="single" />
                            <Label htmlFor="single">Одиночный</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="recurring" id="recurring" />
                            <Label htmlFor="recurring">Повторяющийся</Label>
                        </div>
                    </RadioGroup>
                </div>

                {type === "recurring" && (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <div>
                                    <Label>Частота повторения</Label>
                                    <Select
                                        value={recurrenceFrequency}
                                        onValueChange={(value: "daily" | "weekly" | "monthly") =>
                                            setRecurrenceFrequency(value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="daily">Ежедневно</SelectItem>
                                            <SelectItem value="weekly">Еженедельно</SelectItem>
                                            <SelectItem value="monthly">Ежемесячно</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>Интервал</Label>
                                    <Input
                                        type="number"
                                        value={recurrenceInterval}
                                        onChange={(e) => setRecurrenceInterval(e.target.value)}
                                        min="1"
                                    />
                                </div>

                                <div>
                                    <Label>Окончание повторения</Label>
                                    <RadioGroup
                                        value={recurrenceEndType}
                                        onValueChange={(value: "never" | "date") =>
                                            setRecurrenceEndType(value)
                                        }
                                        className="flex space-x-4"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="never" id="never" />
                                            <Label htmlFor="never">Бесконечно</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="date" id="date" />
                                            <Label htmlFor="date">До даты</Label>
                                        </div>
                                    </RadioGroup>

                                    {recurrenceEndType === "date" && (
                                        <div className="mt-2">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full justify-start text-left font-normal",
                                                            !recurrenceEndDate && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {recurrenceEndDate
                                                            ? format(recurrenceEndDate, "PPP", { locale: ru })
                                                            : "Выберите дату"}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={recurrenceEndDate}
                                                        onSelect={setRecurrenceEndDate}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div>
                    <Label>Услуги</Label>
                    <ServiceConfig
                        availableServices={availableServices}
                        selectedServices={selectedServices}
                        maxCapacity={parseInt(capacity) || 0}
                        onServicesChange={setSelectedServices}
                    />
                    {errors.services && (
                        <p className="text-sm text-red-500 mt-1">{errors.services}</p>
                    )}
                </div>
            </div>

            <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Отмена
                </Button>
                <Button type="submit" onClick={handleSave}>
                    Сохранить
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
        </form>
    )
} 