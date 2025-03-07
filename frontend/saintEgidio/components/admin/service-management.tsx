"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Service } from "@/types/event"
import { Plus, Trash2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ServiceManagementProps {
    services: Service[]
    maxEventCapacity: number
    onServicesChange: (services: Service[]) => void
}

// Список доступных услуг
const AVAILABLE_SERVICES = [
    { id: "medical", name: "Медицинская помощь" },
    { id: "clothing", name: "Выдача одежды" },
    { id: "psychology", name: "Психологическая помощь" },
    { id: "legal", name: "Юридическая помощь" },
]

export function ServiceManagement({ services, maxEventCapacity, onServicesChange }: ServiceManagementProps) {
    const [error, setError] = useState<string | null>(null)

    const handleAddService = () => {
        const newService: Service = {
            id: `service-${Date.now()}`,
            name: "",
            time: "",
            capacity: 0,
            bookingWindow: 14,
            registered: 0,
            type: "medical",
        }
        onServicesChange([...services, newService])
    }

    const handleRemoveService = (serviceId: string) => {
        onServicesChange(services.filter((s) => s.id !== serviceId))
    }

    const handleServiceChange = (serviceId: string, field: keyof Service, value: any) => {
        const updatedServices = services.map((service) => {
            if (service.id === serviceId) {
                const updatedService = { ...service, [field]: value }

                // Проверяем, не превышает ли вместимость услуги максимальную вместимость события
                if (field === "capacity" && value > maxEventCapacity) {
                    setError(`Вместимость услуги не может превышать максимальную вместимость события (${maxEventCapacity})`)
                    return service
                }

                // Проверяем, не превышает ли суммарная вместимость всех услуг максимальную вместимость события
                const totalCapacity = updatedServices.reduce((sum, s) => {
                    if (s.id === serviceId) return sum + value
                    return sum + s.capacity
                }, 0)

                if (totalCapacity > maxEventCapacity) {
                    setError(`Суммарная вместимость всех услуг не может превышать максимальную вместимость события (${maxEventCapacity})`)
                    return service
                }

                setError(null)
                return updatedService
            }
            return service
        })

        onServicesChange(updatedServices)
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Услуги</h3>
                <Button onClick={handleAddService} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить услугу
                </Button>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="space-y-4">
                {services.map((service) => (
                    <div key={service.id} className="p-4 border rounded-lg space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2 flex-1">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Тип услуги</Label>
                                        <Select
                                            value={service.type}
                                            onValueChange={(value) => handleServiceChange(service.id, "type", value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {AVAILABLE_SERVICES.map((availableService) => (
                                                    <SelectItem key={availableService.id} value={availableService.id}>
                                                        {availableService.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label>Время</Label>
                                        <Input
                                            type="time"
                                            value={service.time}
                                            onChange={(e) => handleServiceChange(service.id, "time", e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Вместимость</Label>
                                        <Input
                                            type="number"
                                            min={service.registered}
                                            max={maxEventCapacity}
                                            value={service.capacity}
                                            onChange={(e) => handleServiceChange(service.id, "capacity", parseInt(e.target.value))}
                                        />
                                    </div>

                                    <div>
                                        <Label>Окно бронирования (дней)</Label>
                                        <Input
                                            type="number"
                                            min={1}
                                            value={service.bookingWindow}
                                            onChange={(e) => handleServiceChange(service.id, "bookingWindow", parseInt(e.target.value))}
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveService(service.id)}
                                className="ml-4"
                            >
                                <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            Зарегистрировано: {service.registered} из {service.capacity}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
} 