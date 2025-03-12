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
    const [location, setLocation] = useState<string>(timeSlot?.locationId || locations[0]?.id || "")
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
    const [recurrenceInterval, setRecurrenceInterval] = useState(timeSlot?.recurrence?.interval.toString() || "1")
    const [isInfiniteRecurrence, setIsInfiniteRecurrence] = useState(timeSlot?.recurrence?.endType === "never")
    const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | undefined>(
        timeSlot?.recurrence?.endValue ? new Date(timeSlot.recurrence.endValue) : undefined
    )

    // Состояние для модального окна добавления места
    const [showLocationModal, setShowLocationModal] = useState(false)
    const [newLocation, setNewLocation] = useState<Omit<Location, "id">>({
        name: "",
        address: "",
    })

    // Состояния для валидации
    const [errors, setErrors] = useState<{
        title?: string
        location?: string
        date?: string
        capacity?: string
        services?: string
        newLocationName?: string
    }>({})

    // Валидация формы
    const validateForm = () => {
        const newErrors: {
            title?: string
            location?: string
            date?: string
            capacity?: string
            services?: string
        } = {}

        if (!title.trim()) {
            newErrors.title = "Название временного слота обязательно"
        }

        if (!location) {
            newErrors.location = "Выберите место проведения"
        }

        if (!startDate || !endDate) {
            newErrors.date = "Выберите дату начала и окончания"
        }

        if (parseInt(capacity) <= 0) {
            newErrors.capacity = "Вместимость должна быть больше 0"
        }

        if (selectedServices.length === 0) {
            newErrors.services = "Добавьте хотя бы одну услугу"
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

    // Обработчик сохранения временного слота
    const handleSave = () => {
        if (!validateForm()) return

        const startDateTime = new Date(startDate!)
        const [startHours, startMinutes] = startTime.split(":").map(Number)
        startDateTime.setHours(startHours, startMinutes)

        const endDateTime = new Date(endDate!)
        const [endHours, endMinutes] = endTime.split(":").map(Number)
        endDateTime.setHours(endHours, endMinutes)

        if (endDateTime <= startDateTime) {
            setErrors((prev) => ({
                ...prev,
                date: "Время окончания должно быть позже времени начала"
            }))
            return
        }

        const selectedLocation = locations.find(loc => loc.id === location)
        if (!selectedLocation) {
            setErrors((prev) => ({
                ...prev,
                location: "Выбранное место не найдено"
            }))
            return
        }

        let recurrence: Recurrence | undefined
        if (type === "recurring") {
            recurrence = {
                frequency: recurrenceFrequency,
                interval: parseInt(recurrenceInterval),
                endType: isInfiniteRecurrence ? "never" : "date",
                endValue: isInfiniteRecurrence ? undefined : recurrenceEndDate?.toISOString()
            }
        }

        const newTimeSlot: TimeSlot = {
            id: timeSlot?.id || `ts_${Date.now()}`,
            title,
            type,
            locationId: location,
            location: selectedLocation.name,
            capacity: parseInt(capacity),
            startDate: startDateTime.toISOString(),
            endDate: endDateTime.toISOString(),
            status: timeSlot?.status || "active",
            services: selectedServices,
            ...(type === "recurring" && { recurrence })
        }

        onSave(newTimeSlot)
    }

    // Обработчик добавления нового места
    const handleAddLocation = () => {
        if (!validateNewLocation()) return

        const location = {
            ...newLocation,
            id: `loc_${Date.now()}`
        }

        onAddLocation!(location)
        setLocation(location.id)
        setShowLocationModal(false)
        setNewLocation({
            name: "",
            address: "",
        })
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="title">
                    Название <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Введите название временного слота"
                    className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
            </div>

            <div className="space-y-2">
                <Label>Тип временного слота</Label>
                <RadioGroup value={type} onValueChange={(value) => setType(value as "single" | "recurring")}>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="single" id="single" />
                        <Label htmlFor="single">Разовый</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="recurring" id="recurring" />
                        <Label htmlFor="recurring">Повторяющийся</Label>
                    </div>
                </RadioGroup>
            </div>

            {type === "recurring" && (
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
                        <Label htmlFor="recurrenceInterval">Интервал повторения</Label>
                        <Input
                            id="recurrenceInterval"
                            type="number"
                            min="1"
                            value={recurrenceInterval}
                            onChange={(e) => setRecurrenceInterval(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="isInfiniteRecurrence"
                            checked={isInfiniteRecurrence}
                            onCheckedChange={setIsInfiniteRecurrence}
                        />
                        <Label htmlFor="isInfiniteRecurrence">Повторять бесконечно</Label>
                    </div>

                    {!isInfiniteRecurrence && (
                        <div className="space-y-2">
                            <Label>Дата окончания повторения</Label>
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
                                        {recurrenceEndDate ? format(recurrenceEndDate, "PPP", { locale: ru }) : "Выберите дату"}
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
                    <Label>
                        Дата начала <span className="text-red-500">*</span>
                    </Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !startDate && "text-muted-foreground",
                                    errors.date ? "border-red-500" : ""
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
                                disabled={(date) => date < new Date()}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="startTime">
                        Время начала <span className="text-red-500">*</span>
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
                    <Label>
                        Дата окончания <span className="text-red-500">*</span>
                    </Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !endDate && "text-muted-foreground",
                                    errors.date ? "border-red-500" : ""
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
                                disabled={(date) => date < new Date()}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="endTime">
                        Время окончания <span className="text-red-500">*</span>
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
                <div className="flex justify-between items-center">
                    <Label htmlFor="location">
                        Место проведения <span className="text-red-500">*</span>
                    </Label>
                    {onAddLocation && (
                        <Button variant="outline" size="sm" onClick={() => setShowLocationModal(true)}>
                            <Plus className="h-4 w-4 mr-1" />
                            Добавить место
                        </Button>
                    )}
                </div>
                <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className={errors.location ? "border-red-500" : ""}>
                        <SelectValue placeholder="Выберите место проведения" />
                    </SelectTrigger>
                    <SelectContent>
                        {locations.map((loc) => (
                            <SelectItem key={loc.id} value={loc.id}>
                                {loc.name} {loc.address ? `- ${loc.address}` : ""}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
            </div>

            <div className="space-y-2">
                <div className="flex items-center space-x-2">
                    <Label htmlFor="capacity">
                        Общая вместимость <span className="text-red-500">*</span>
                    </Label>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Максимальное количество участников для всех услуг</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <Input
                    id="capacity"
                    type="number"
                    min="1"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className={errors.capacity ? "border-red-500" : ""}
                />
                {errors.capacity && <p className="text-sm text-red-500">{errors.capacity}</p>}
            </div>

            <div className="space-y-2">
                <Label>
                    Услуги <span className="text-red-500">*</span>
                </Label>
                <ServiceConfig
                    availableServices={availableServices}
                    selectedServices={selectedServices}
                    maxCapacity={parseInt(capacity) || 0}
                    onServicesChange={setSelectedServices}
                />
                {errors.services && <p className="text-sm text-red-500">{errors.services}</p>}
            </div>

            <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Отмена
                </Button>
                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                    {timeSlot ? "Сохранить изменения" : "Создать временной слот"}
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
        </div>
    )
} 