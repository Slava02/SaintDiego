"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface RecurrenceFormProps {
  recurrence: {
    frequency: string
    interval: number
    endType: string
    endValue: string
  }
  onChange: (data: any) => void
}

export function RecurrenceForm({ recurrence, onChange }: RecurrenceFormProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Настройки повторения</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="frequency" className="required">
            Частота
          </Label>
          <Select value={recurrence.frequency} onValueChange={(value) => onChange({ frequency: value })}>
            <SelectTrigger id="frequency">
              <SelectValue placeholder="Выберите частоту" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Ежедневно</SelectItem>
              <SelectItem value="weekly">Еженедельно</SelectItem>
              <SelectItem value="monthly">Ежемесячно</SelectItem>
              <SelectItem value="yearly">Ежегодно</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="interval" className="required">
            Интервал
          </Label>
          <Input
            id="interval"
            type="number"
            min="1"
            value={recurrence.interval}
            onChange={(e) => onChange({ interval: Number.parseInt(e.target.value) || 1 })}
            placeholder="Введите интервал"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endType" className="required">
            Окончание
          </Label>
          <Select value={recurrence.endType} onValueChange={(value) => onChange({ endType: value })}>
            <SelectTrigger id="endType">
              <SelectValue placeholder="Выберите тип окончания" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="never">Никогда</SelectItem>
              <SelectItem value="count">После количества повторений</SelectItem>
              <SelectItem value="until">До даты</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {recurrence.endType === "count" && (
          <div className="space-y-2">
            <Label htmlFor="endCount" className="required">
              Количество повторений
            </Label>
            <Input
              id="endCount"
              type="number"
              min="1"
              value={recurrence.endValue}
              onChange={(e) => onChange({ endValue: e.target.value })}
              placeholder="Введите количество"
            />
          </div>
        )}

        {recurrence.endType === "until" && (
          <div className="space-y-2">
            <Label htmlFor="endDate" className="required">
              Дата окончания
            </Label>
            <Input
              id="endDate"
              type="date"
              value={recurrence.endValue}
              onChange={(e) => onChange({ endValue: e.target.value })}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
