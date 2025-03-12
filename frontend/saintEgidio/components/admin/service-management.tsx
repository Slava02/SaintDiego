"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Service, TimeSlotService } from "@/types/event"

interface ServiceManagementProps {
    availableServices: Service[]
    selectedServices: TimeSlotService[]
    maxCapacity: number
    onServicesChange: (services: TimeSlotService[]) => void
    onConfigureService: (service: Service) => void
}

export function ServiceManagement({
    availableServices,
    selectedServices,
    maxCapacity,
    onServicesChange,
    onConfigureService
}: ServiceManagementProps) {
    const [error, setError] = useState<string | null>(null)

    const handleRemoveService = (serviceId: string) => {
        onServicesChange(selectedServices.filter(s => s.serviceId !== serviceId))
        setError(null)
    }

    const validateCapacity = (services: TimeSlotService[]): boolean => {
        const totalCapacity = services.reduce((sum, service) => sum + service.capacity, 0)
        if (totalCapacity > maxCapacity) {
            setError(`Суммарная вместимость всех услуг (${totalCapacity}) не может превышать общую вместимость (${maxCapacity})`)
            return false
        }
        setError(null)
        return true
    }

    const getServiceDetails = (serviceId: string) => {
        const service = availableServices.find(s => s.id === serviceId)
        const selectedService = selectedServices.find(s => s.serviceId === serviceId)
        return { service, selectedService }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Услуги</h3>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="space-y-4">
                {availableServices.map((service) => {
                    const { selectedService } = getServiceDetails(service.id)
                    const isSelected = !!selectedService

                    return (
                        <div key={service.id} className="p-4 border rounded-lg space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="space-y-2 flex-1">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Label className="text-base font-medium">{service.name}</Label>
                                            {isSelected && (
                                                <span className="text-sm text-muted-foreground">
                                                    (Тип: {service.type})
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {isSelected ? (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => onConfigureService(service)}
                                                    >
                                                        Настроить
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleRemoveService(service.id)}
                                                        className="text-red-500 hover:text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => onConfigureService(service)}
                                                >
                                                    Добавить
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {isSelected && (
                                        <div className="grid grid-cols-2 gap-4 mt-4 text-sm text-muted-foreground">
                                            <div>
                                                Вместимость: {selectedService.capacity}
                                                {selectedService.capacity === service.defaultCapacity && (
                                                    <span className="text-xs"> (по умолчанию)</span>
                                                )}
                                            </div>
                                            <div>
                                                Окно бронирования: {selectedService.bookingWindow} дней
                                                {selectedService.bookingWindow === service.defaultBookingWindow && (
                                                    <span className="text-xs"> (по умолчанию)</span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
} 