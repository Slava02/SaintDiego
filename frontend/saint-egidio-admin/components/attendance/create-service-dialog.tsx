"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import type { CreateServiceRequest } from "@/lib/types"
import { createService } from "@/lib/api/services"

interface CreateServiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateServiceDialog({ open, onOpenChange, onSuccess }: CreateServiceDialogProps) {
  const [name, setName] = useState("")
  const [minPeriodDays, setMinPeriodDays] = useState("14")
  const [registrationAvailable, setRegistrationAvailable] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({
        title: "Ошибка",
        description: "Название услуги не может быть пустым",
        variant: "destructive",
      })
      return
    }

    const minPeriodDaysNum = Number.parseInt(minPeriodDays, 10)
    if (isNaN(minPeriodDaysNum) || minPeriodDaysNum < 0) {
      toast({
        title: "Ошибка",
        description: "Ограничение должно быть положительным числом",
        variant: "destructive",
      })
      return
    }

    const createData: CreateServiceRequest = {
      name: name.trim(),
      min_period_days: minPeriodDaysNum,
      registration_available: registrationAvailable,
    }

    setIsLoading(true)
    try {
      await createService(createData)
      onSuccess()
      resetForm()
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось создать услугу",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setName("")
    setMinPeriodDays("14")
    setRegistrationAvailable(true)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) resetForm()
        onOpenChange(open)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Добавление новой услуги</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="service-name" className="required">
              Название услуги
            </Label>
            <Input
              id="service-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите название услуги"
              required
            />
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
            {isLoading ? "Создание..." : "Создать"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
