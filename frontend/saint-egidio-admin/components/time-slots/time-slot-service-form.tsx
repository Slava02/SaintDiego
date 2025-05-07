"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash } from "lucide-react"
import type { ServiceType } from "@/lib/types"

interface TimeSlotServiceFormProps {
  service: any
  serviceTypes: ServiceType[]
  onChange: (data: any) => void
  onRemove: () => void
  canRemove: boolean
  index: number
}

export function TimeSlotServiceForm({
  service,
  serviceTypes,
  onChange,
  onRemove,
  canRemove,
  index,
}: TimeSlotServiceFormProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Услуга {index}</CardTitle>
        {canRemove && (
          <Button variant="ghost" size="sm" onClick={onRemove} className="text-red-500 hover:text-red-700">
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`service-type-${service.id}`} className="required">
            Название
          </Label>
          <Select
            value={service.serviceTypeId?.toString() || ""}
            onValueChange={(value) => onChange({ serviceTypeId: value })}
          >
            <SelectTrigger id={`service-type-${service.id}`}>
              <SelectValue placeholder="Выберите услугу" />
            </SelectTrigger>
            <SelectContent>
              {serviceTypes.map((type) => (
                <SelectItem key={type.id} value={type.id.toString()}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`service-capacity-${service.id}`} className="required">
            Вместимость
          </Label>
          <Input
            id={`service-capacity-${service.id}`}
            type="number"
            min="1"
            value={service.capacity || ""}
            onChange={(e) => onChange({ capacity: e.target.value })}
            placeholder="Введите вместимость"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`service-window-${service.id}`} className="required">
            Окно бронирования (дней)
          </Label>
          <Input
            id={`service-window-${service.id}`}
            type="number"
            min="1"
            value={service.bookingWindow || ""}
            onChange={(e) => onChange({ bookingWindow: e.target.value })}
            placeholder="Введите окно бронирования"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`service-time-${service.id}`} className="required">
            Время
          </Label>
          <Input
            id={`service-time-${service.id}`}
            type="time"
            value={service.time || ""}
            onChange={(e) => onChange({ time: e.target.value })}
            placeholder="ЧЧ:ММ"
          />
          <p className="text-xs text-muted-foreground">Укажите время начала услуги в формате ЧЧ:ММ</p>
        </div>
      </CardContent>
    </Card>
  )
}
