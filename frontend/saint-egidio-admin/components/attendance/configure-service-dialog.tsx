"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import type { ServiceType, UpdateServiceRequest } from "@/lib/types"
import { updateService } from "@/lib/api/services"

interface ConfigureServiceDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    service: ServiceType
    onSuccess: () => void
}

export function ConfigureServiceDialog({ open, onOpenChange, service, onSuccess }: ConfigureServiceDialogProps) {
    const [minPeriodDays, setMinPeriodDays] = useState("14") // Значение по умолчанию
    const [registrationAvailable, setRegistrationAvailable] = useState(true) // По умолчанию включено
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const handleSubmit = async () => {
        const minPeriodDaysNum = Number.parseInt(minPeriodDays, 10)
        if (isNaN(minPeriodDaysNum) || minPeriodDaysNum < 0) {
            toast({
                title: "Ошибка",
                description: "Ограничение должно быть положительным числом",
                variant: "destructive",
            })
            return
        }

        const updateData: UpdateServiceRequest = {
            min_period_days: minPeriodDaysNum,
            registration_available: registrationAvailable,
        }

        setIsLoading(true)
        try {
            await updateService(service.id, updateData)
            onSuccess()
        } catch (error) {
            toast({
                title: "Ошибка",
                description: "Не удалось настроить услугу",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Настройка услуги</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="service-name">Название услуги</Label>
                        <Input id="service-name" value={service.name} disabled />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="min-period-days" className="required">
                            Минимальный период между регистрациями (дней)
                        </Label>
                        <Input
                            id="min-period-days"
                            type="number"
                            min="0"
                            value={minPeriodDays}
                            onChange={(e) => setMinPeriodDays(e.target.value)}
                            required
                        />
                        <p className="text-sm text-muted-foreground">
                            Укажите минимальное количество дней между регистрациями на эту услугу
                        </p>
                    </div>

                    <div className="flex items-center justify-between space-y-0">
                        <Label htmlFor="registration-available">Регистрация доступна</Label>
                        <Switch
                            id="registration-available"
                            checked={registrationAvailable}
                            onCheckedChange={setRegistrationAvailable}
                        />
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
    )
}
