"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Service, TimeSlotService } from "@/types/event"

interface ServiceConfigProps {
    availableServices: Service[]
    selectedServices: TimeSlotService[]
    maxCapacity: number
    onServicesChange: (services: TimeSlotService[]) => void
}

interface ServiceConfigModalProps {
    service: Service
    selectedService?: TimeSlotService
    onSave: (service: TimeSlotService) => void
    onClose: () => void
}

function ServiceConfigModal({ service, selectedService, onSave, onClose }: ServiceConfigModalProps) {
    const [capacity, setCapacity] = useState(selectedService?.capacity || service.defaultCapacity || 1)
    const [bookingWindow, setBookingWindow] = useState(selectedService?.bookingWindow || service.defaultBookingWindow || 7)
    const [time, setTime] = useState(selectedService?.time || "10:00-11:00")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave({
            serviceId: service.id,
            capacity,
            bookingWindow,
            time
        })
    }

    return (
        <Dialog open onOpenChange={() => onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Настройка услуги: {service.name}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="time">
                            Время <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            placeholder="Например: 10:00-12:00"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="capacity">
                            Вместимость <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="capacity"
                            type="number"
                            min={1}
                            value={capacity}
                            onChange={(e) => setCapacity(parseInt(e.target.value))}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bookingWindow">
                            Окно бронирования (дней) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="bookingWindow"
                            type="number"
                            min={1}
                            value={bookingWindow}
                            onChange={(e) => setBookingWindow(parseInt(e.target.value))}
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Отмена
                        </Button>
                        <Button type="submit">Сохранить</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export function ServiceConfig({ availableServices, selectedServices, maxCapacity, onServicesChange }: ServiceConfigProps) {
    const [showServiceModal, setShowServiceModal] = useState(false)
    const [selectedService, setSelectedService] = useState<Service | null>(null)
    const [serviceForConfig, setServiceForConfig] = useState<TimeSlotService | undefined>(undefined)

    const handleServiceSelect = (serviceId: string) => {
        const service = availableServices.find(s => s.id === serviceId)
        if (service) {
            setSelectedService(service)
            setShowServiceModal(true)
        }
    }

    const handleSaveServiceConfig = (service: TimeSlotService) => {
        const existingCapacity = selectedServices
            .filter(s => s.serviceId !== service.serviceId)
            .reduce((sum, s) => sum + s.capacity, 0)
        const totalCapacity = existingCapacity + service.capacity

        if (totalCapacity > maxCapacity) {
            alert(`Общая вместимость услуг (${totalCapacity}) не может превышать вместимость мероприятия (${maxCapacity})`)
            return
        }

        const updatedServices = selectedServices.some(s => s.serviceId === service.serviceId)
            ? selectedServices.map(s => s.serviceId === service.serviceId ? service : s)
            : [...selectedServices, service]

        onServicesChange(updatedServices)
        setShowServiceModal(false)
        setSelectedService(null)
        setServiceForConfig(undefined)
    }

    const handleConfigureService = (service: TimeSlotService) => {
        setServiceForConfig(service)
        setSelectedService(availableServices.find(s => s.id === service.serviceId) || null)
        setShowServiceModal(true)
    }

    const handleRemoveService = (serviceId: string) => {
        onServicesChange(selectedServices.filter(s => s.serviceId !== serviceId))
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Select onValueChange={handleServiceSelect}>
                    <SelectTrigger>
                        <SelectValue placeholder="Выберите услугу" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableServices
                            .filter(service => !selectedServices.some(s => s.serviceId === service.id))
                            .map(service => (
                                <SelectItem key={service.id} value={service.id}>
                                    {service.name}
                                </SelectItem>
                            ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                {selectedServices.map(service => {
                    const serviceInfo = availableServices.find(s => s.id === service.serviceId)
                    return (
                        <div key={service.serviceId} className="flex items-center justify-between p-2 border rounded">
                            <div>
                                <p className="font-medium">{serviceInfo?.name}</p>
                                <p className="text-sm text-gray-500">
                                    Время: {service.time} | Вместимость: {service.capacity} |
                                    Окно бронирования: {service.bookingWindow} дней
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleConfigureService(service)}>
                                    Настроить
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => handleRemoveService(service.serviceId)}>
                                    Удалить
                                </Button>
                            </div>
                        </div>
                    )
                })}
            </div>

            {showServiceModal && selectedService && (
                <ServiceConfigModal
                    service={selectedService}
                    selectedService={serviceForConfig}
                    onSave={handleSaveServiceConfig}
                    onClose={() => {
                        setShowServiceModal(false)
                        setSelectedService(null)
                        setServiceForConfig(undefined)
                    }}
                />
            )}
        </div>
    )
} 