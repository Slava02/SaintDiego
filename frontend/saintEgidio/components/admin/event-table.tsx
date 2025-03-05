"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreHorizontal, CalendarIcon, Users, Edit, Trash } from "lucide-react"
import { ru } from "date-fns/locale"
import { format } from "date-fns"

export interface Event {
  id: string
  title: string
  type: string
  start: Date
  end: Date
  capacity: number
  registered: number
  status: "open" | "full"
}

// Добавляем новый параметр isPastEvents в интерфейс EventTableProps
export interface EventTableProps {
  events: Event[]
  onViewParticipants: (event: Event) => void
  onEditEvent: (event: Event) => void
  onDeleteEvent: (eventId: string) => void
  isPastEvents?: boolean
}

export interface EventFiltersState {
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
  eventType: string
  status: string
}

// Обновляем функцию EventTable, чтобы она принимала параметр isPastEvents
export function EventTable({
  events,
  onViewParticipants,
  onEditEvent,
  onDeleteEvent,
  isPastEvents = false,
}: EventTableProps) {
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

  return (
    <div>
      {events.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Нет мероприятий, соответствующих заданным критериям
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Название</TableHead>
              <TableHead>Тип</TableHead>
              <TableHead>Дата/Время</TableHead>
              <TableHead>Вместимость</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              // Обновляем стиль строки таблицы для прошедших мероприятий
              <TableRow key={event.id} className={isPastEvents ? "bg-gray-100 opacity-80" : ""}>
                <TableCell className="font-medium">{event.title}</TableCell>
                <TableCell>{getEventTypeLabel(event.type)}</TableCell>
                <TableCell>
                  {format(event.start, "dd.MM.yyyy HH:mm")} - {format(event.end, "HH:mm")}
                </TableCell>
                <TableCell>
                  {event.registered}/{event.capacity}
                </TableCell>
                <TableCell>
                  <Badge
                    className={event.status === "open" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                  >
                    {event.status === "open" ? "Открыто" : "Заполнено"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewParticipants(event)}>
                        <Users className="h-4 w-4 mr-2" />
                        Участники
                      </DropdownMenuItem>
                      {!isPastEvents && (
                        <DropdownMenuItem onClick={() => onEditEvent(event)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Редактировать
                        </DropdownMenuItem>
                      )}
                      {!isPastEvents && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={() => onDeleteEvent(event.id)}>
                            <Trash className="h-4 w-4 mr-2" />
                            Удалить
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

export function EventFilters({
  filters,
  onFiltersChange,
}: {
  filters: EventFiltersState
  onFiltersChange: (filters: EventFiltersState) => void
}) {
  const handleDateRangeChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    onFiltersChange({
      ...filters,
      dateRange: range,
    })
  }

  const handleTypeChange = (eventType: string) => {
    onFiltersChange({
      ...filters,
      eventType,
    })
  }

  const handleStatusChange = (status: string) => {
    onFiltersChange({
      ...filters,
      status,
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      dateRange: { from: undefined, to: undefined },
      eventType: "all",
      status: "all",
    })
  }

  return (
    <div className="grid md:grid-cols-4 gap-4">
      <div className="space-y-2">
        <Label>Диапазон дат</Label>
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
              onSelect={handleDateRangeChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label>Тип мероприятия</Label>
        <Select value={filters.eventType} onValueChange={handleTypeChange}>
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
        <Label>Статус</Label>
        <Select value={filters.status} onValueChange={handleStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="Все статусы" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="open">Открыто</SelectItem>
            <SelectItem value="full">Заполнено</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-end">
        <Button variant="ghost" onClick={clearFilters} className="w-full">
          Сбросить фильтры
        </Button>
      </div>
    </div>
  )
}

