"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, FileSpreadsheet, Printer, Eye } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface ExportFilters {
  eventType: string
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
  participantStatus: string
  registrationDate: {
    from: Date | undefined
    to: Date | undefined
  }
}

interface ExportFields {
  eventType: boolean
  eventDate: boolean
  participantName: boolean
  participantPhone: boolean
  participantStatus: boolean
  participantComment: boolean
}

interface Event {
  id: string
  title: string
  type: string
  start: Date
  end: Date
  capacity: number
  registered: number
  status: "open" | "full"
}

interface Participant {
  id: string
  name: string
  surname: string
  phone: string
  status: "attended" | "no-show" | "pending"
  comment: string
  registrationDate: Date
  event: Event
}

export function ExportModule() {
  const [filters, setFilters] = useState<ExportFilters>({
    eventType: "all",
    dateRange: { from: undefined, to: undefined },
    participantStatus: "all",
    registrationDate: { from: undefined, to: undefined },
  })

  const [fields, setFields] = useState<ExportFields>({
    eventType: true,
    eventDate: true,
    participantName: true,
    participantPhone: true,
    participantStatus: true,
    participantComment: true,
  })

  const [showPreview, setShowPreview] = useState(false)

  // Mock data for preview
  const mockParticipants: Participant[] = [
    {
      id: "1",
      name: "Виктор",
      surname: "Толстихин",
      phone: "+7 (123) 456-78-90",
      status: "attended",
      comment: "",
      registrationDate: new Date(2025, 1, 15),
      event: {
        id: "1",
        title: "Медицинская консультация",
        type: "medical",
        start: new Date(2025, 2, 10, 10, 0),
        end: new Date(2025, 2, 10, 11, 0),
        capacity: 15,
        registered: 10,
        status: "open",
      },
    },
    {
      id: "2",
      name: "Анна",
      surname: "Петрова",
      phone: "+7 (987) 654-32-10",
      status: "no-show",
      comment: "Не пришла без предупреждения",
      registrationDate: new Date(2025, 1, 20),
      event: {
        id: "2",
        title: "Выдача одежды",
        type: "clothing",
        start: new Date(2025, 2, 11, 14, 0),
        end: new Date(2025, 2, 11, 16, 0),
        capacity: 20,
        registered: 20,
        status: "full",
      },
    },
    {
      id: "3",
      name: "Сергей",
      surname: "Иванов",
      phone: "+7 (555) 123-45-67",
      status: "pending",
      comment: "Нужна дополнительная помощь",
      registrationDate: new Date(2025, 2, 1),
      event: {
        id: "3",
        title: "Консультация психолога",
        type: "psychology",
        start: new Date(2025, 2, 12, 12, 0),
        end: new Date(2025, 2, 12, 13, 0),
        capacity: 5,
        registered: 3,
        status: "open",
      },
    },
  ]

  const handleFilterChange = (key: keyof ExportFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleFieldToggle = (field: keyof ExportFields) => {
    setFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const handleGeneratePreview = () => {
    setShowPreview(true)
  }

  const handleExportToExcel = () => {
    // In a real app, this would generate and download an Excel file
    alert("Экспорт в Excel: функция будет реализована в следующей версии")
  }

  const handlePrintList = () => {
    // In a real app, this would open a print-friendly view
    alert("Печать списка: функция будет реализована в следующей версии")
  }

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case "medical":
        return "Медицинская помощь"
      case "clothing":
        return "Выдача одежды"
      case "psychology":
        return "Психологическая помощь"
      case "legal":
        return "Юридическая помощь"
      default:
        return type
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "attended":
        return "Присутствовал"
      case "no-show":
        return "Не явился"
      case "pending":
        return "Ожидается"
      default:
        return status
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "attended":
        return "bg-green-100 text-green-800"
      case "no-show":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100"
    }
  }

  // Filter participants based on current filters
  const filteredParticipants = mockParticipants.filter((participant) => {
    // Filter by event type
    if (filters.eventType !== "all" && participant.event.type !== filters.eventType) {
      return false
    }

    // Filter by event date range
    if (filters.dateRange.from && participant.event.start < filters.dateRange.from) {
      return false
    }
    if (filters.dateRange.to && participant.event.start > filters.dateRange.to) {
      return false
    }

    // Filter by participant status
    if (filters.participantStatus !== "all" && participant.status !== filters.participantStatus) {
      return false
    }

    // Filter by registration date range
    if (filters.registrationDate.from && participant.registrationDate < filters.registrationDate.from) {
      return false
    }
    if (filters.registrationDate.to && participant.registrationDate > filters.registrationDate.to) {
      return false
    }

    return true
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Фильтры экспорта</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Тип мероприятия</Label>
              <Select value={filters.eventType} onValueChange={(value) => handleFilterChange("eventType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Все типы" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все типы</SelectItem>
                  <SelectItem value="medical">Медицинская помощь</SelectItem>
                  <SelectItem value="clothing">Выдача одежды</SelectItem>
                  <SelectItem value="psychology">Психологическая помощь</SelectItem>
                  <SelectItem value="legal">Юридическая помощь</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Статус участника</Label>
              <Select
                value={filters.participantStatus}
                onValueChange={(value) => handleFilterChange("participantStatus", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Все статусы" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="attended">Присутствовал</SelectItem>
                  <SelectItem value="no-show">Не явился</SelectItem>
                  <SelectItem value="pending">Ожидается</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Период мероприятий</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange.from ? (
                      filters.dateRange.to ? (
                        <>
                          {format(filters.dateRange.from, "P", { locale: ru })} -{" "}
                          {format(filters.dateRange.to, "P", { locale: ru })}
                        </>
                      ) : (
                        format(filters.dateRange.from, "P", { locale: ru })
                      )
                    ) : (
                      "Выберите даты"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    locale={ru}
                    mode="range"
                    selected={{
                      from: filters.dateRange.from,
                      to: filters.dateRange.to,
                    }}
                    onSelect={(range) => handleFilterChange("dateRange", range)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Период регистрации</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.registrationDate.from ? (
                      filters.registrationDate.to ? (
                        <>
                          {format(filters.registrationDate.from, "P", { locale: ru })} -{" "}
                          {format(filters.registrationDate.to, "P", { locale: ru })}
                        </>
                      ) : (
                        format(filters.registrationDate.from, "P", { locale: ru })
                      )
                    ) : (
                      "Выберите даты"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    locale={ru}
                    mode="range"
                    selected={{
                      from: filters.registrationDate.from,
                      to: filters.registrationDate.to,
                    }}
                    onSelect={(range) => handleFilterChange("registrationDate", range)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Настройка полей экспорта</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="field-event-type"
                checked={fields.eventType}
                onCheckedChange={() => handleFieldToggle("eventType")}
              />
              <Label htmlFor="field-event-type">Тип мероприятия</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="field-event-date"
                checked={fields.eventDate}
                onCheckedChange={() => handleFieldToggle("eventDate")}
              />
              <Label htmlFor="field-event-date">Дата мероприятия</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="field-participant-name"
                checked={fields.participantName}
                onCheckedChange={() => handleFieldToggle("participantName")}
              />
              <Label htmlFor="field-participant-name">Имя участника</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="field-participant-phone"
                checked={fields.participantPhone}
                onCheckedChange={() => handleFieldToggle("participantPhone")}
              />
              <Label htmlFor="field-participant-phone">Телефон</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="field-participant-status"
                checked={fields.participantStatus}
                onCheckedChange={() => handleFieldToggle("participantStatus")}
              />
              <Label htmlFor="field-participant-status">Статус</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="field-participant-comment"
                checked={fields.participantComment}
                onCheckedChange={() => handleFieldToggle("participantComment")}
              />
              <Label htmlFor="field-participant-comment">Комментарий</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col md:flex-row gap-4">
        <Button onClick={handleGeneratePreview} className="flex-1">
          <Eye className="h-4 w-4 mr-2" />
          Предварительный просмотр
        </Button>
        <Button onClick={handleExportToExcel} className="flex-1">
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Экспорт в Excel
        </Button>
        <Button onClick={handlePrintList} className="flex-1">
          <Printer className="h-4 w-4 mr-2" />
          Печать списка
        </Button>
      </div>

      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle>Предварительный просмотр ({filteredParticipants.length} записей)</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredParticipants.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                Нет данных, соответствующих заданным критериям
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    {fields.eventType && <TableHead>Тип мероприятия</TableHead>}
                    {fields.eventDate && <TableHead>Дата мероприятия</TableHead>}
                    {fields.participantName && <TableHead>Участник</TableHead>}
                    {fields.participantPhone && <TableHead>Телефон</TableHead>}
                    {fields.participantStatus && <TableHead>Статус</TableHead>}
                    {fields.participantComment && <TableHead>Комментарий</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParticipants.map((participant) => (
                    <TableRow key={participant.id}>
                      {fields.eventType && <TableCell>{getEventTypeLabel(participant.event.type)}</TableCell>}
                      {fields.eventDate && <TableCell>{format(participant.event.start, "dd.MM.yyyy HH:mm")}</TableCell>}
                      {fields.participantName && (
                        <TableCell>
                          {participant.name} {participant.surname}
                        </TableCell>
                      )}
                      {fields.participantPhone && <TableCell>{participant.phone}</TableCell>}
                      {fields.participantStatus && (
                        <TableCell>
                          <Badge className={getStatusBadgeClass(participant.status)}>
                            {getStatusLabel(participant.status)}
                          </Badge>
                        </TableCell>
                      )}
                      {fields.participantComment && <TableCell>{participant.comment || "-"}</TableCell>}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

