"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Archive, RefreshCw, RotateCw, Users } from "lucide-react"
import { format } from "date-fns"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { useState } from "react"

interface Event {
  id: string
  title: string
  date: Date | null
  location: string
  maxParticipants: number
  registeredParticipants: number
  status: "active" | "archived"
  type: "single" | "recurring"
  recurrence?: {
    frequency: "daily" | "weekly" | "monthly"
    endDate?: Date
    infinite: boolean
  }
  services: Service[]
}

interface Service {
  id: string
  name: string
  time: string
  capacity: number
  bookingWindow: number
  registeredParticipants: number
}

export interface EventFiltersState {
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
  eventType: "all" | "medical" | "clothing" | "psychology" | "legal" | string
  status: "active" | "archived" | "open" | "full" | string
  participant: string
}

interface EventTableProps {
  events: Event[]
  onEdit: (event: Event) => void
  onDelete: (eventId: string) => void
  onArchive?: (eventId: string) => void
  onActivate?: (event: Event) => void
  onViewParticipants?: (event: Event) => void
  isPastEvents?: boolean
  isActive: boolean
}

export function EventTable({
  events,
  onEdit,
  onDelete,
  onArchive,
  onActivate,
  onViewParticipants,
  isPastEvents,
  isActive,
}: EventTableProps) {
  const getRecurrenceText = (recurrence?: Event["recurrence"]) => {
    if (!recurrence) return ""

    switch (recurrence.frequency) {
      case "daily":
        return "Ежедневно"
      case "weekly":
        return "Еженедельно"
      case "monthly":
        return "Ежемесячно"
      default:
        return ""
    }
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-gray-50">
            <TableHead>Название</TableHead>
            <TableHead>Тип</TableHead>
            <TableHead>Место</TableHead>
            <TableHead>Участники</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => {
            const isArchived = event.status === "archived"
            const isFull = event.registeredParticipants >= event.maxParticipants
            const isRecurring = event.type === "recurring"

            return (
              <TableRow
                key={event.id}
                className={cn("hover:bg-gray-50 transition-colors", isArchived ? "bg-gray-100" : "")}
              >
                <TableCell className="font-medium">
                  <div>
                    {event.title}
                    {isRecurring && (
                      <div className="flex items-center text-xs text-blue-600 mt-1">
                        <RotateCw className="h-3 w-3 mr-1" />
                        <span>{getRecurrenceText(event.recurrence)}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {isRecurring ? (
                    <Badge className="bg-blue-100 text-blue-800">Повторяющееся</Badge>
                  ) : (
                    <Badge className="bg-purple-100 text-purple-800">Разовое</Badge>
                  )}
                </TableCell>
                <TableCell>{event.location}</TableCell>
                <TableCell className={cn(isFull ? "text-red-600 font-medium" : "")}>
                  {event.registeredParticipants}/{event.maxParticipants}
                </TableCell>
                <TableCell>
                  <Badge className={cn(isArchived ? "bg-gray-200 text-gray-700" : "bg-green-100 text-green-800")}>
                    {isArchived ? "Архив" : "Активно"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {onViewParticipants && (
                      <Button variant="outline" size="sm" onClick={() => onViewParticipants(event)}>
                        <Users className="h-4 w-4 mr-2" />
                        Участники
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          Действия
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {(!isArchived || isActive) && (
                          <DropdownMenuItem onClick={() => onEdit(event)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Редактировать
                          </DropdownMenuItem>
                        )}

                        {isActive && onArchive && (
                          <DropdownMenuItem onClick={() => onArchive(event.id)}>
                            <Archive className="h-4 w-4 mr-2" />В архив
                          </DropdownMenuItem>
                        )}

                        {!isActive && onActivate && (
                          <DropdownMenuItem onClick={() => onActivate(event)}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Активировать
                          </DropdownMenuItem>
                        )}

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Удалить
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                              <AlertDialogDescription>
                                {event.registeredParticipants > 0 ? (
                                  <>
                                    На мероприятии зарегистрировано {event.registeredParticipants} участников. Удалить
                                    его?
                                  </>
                                ) : (
                                  <>
                                    Это действие удалит событие "{event.title}" и все связанные с ним данные. Это
                                    действие нельзя отменить.
                                  </>
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Отмена</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDelete(event.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Удалить
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

interface EventFiltersProps {
  filters: EventFiltersState
  onFiltersChange: (filters: EventFiltersState) => void
}

export function EventFilters({ filters, onFiltersChange }: EventFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showParticipantResults, setShowParticipantResults] = useState(false)

  // Мок-данные для участников
  const mockParticipants = [
    { id: "p1", name: "Виктор Толстихин" },
    { id: "p2", name: "Анна Петрова" },
    { id: "p3", name: "Сергей Иванов" },
    { id: "p4", name: "Елена Смирнова" },
    { id: "p5", name: "Алексей Козлов" },
  ]

  const [filteredParticipants, setFilteredParticipants] = useState(mockParticipants)

  const handleDateRangeChange = (dateRange: EventFiltersState["dateRange"]) => {
    onFiltersChange({ ...filters, dateRange })
  }

  const handleEventTypeChange = (eventType: EventFiltersState["eventType"]) => {
    onFiltersChange({ ...filters, eventType })
  }

  const handleStatusChange = (status: EventFiltersState["status"]) => {
    onFiltersChange({ ...filters, status })
  }

  const handleParticipantSearch = (query: string) => {
    setSearchQuery(query)

    if (query.length < 2) {
      setFilteredParticipants([])
      setShowParticipantResults(false)
      return
    }

    const filtered = mockParticipants.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))

    setFilteredParticipants(filtered)
    setShowParticipantResults(filtered.length > 0)
  }

  const handleSelectParticipant = (participant: { id: string; name: string }) => {
    onFiltersChange({ ...filters, participant: participant.id })
    setSearchQuery(participant.name)
    setShowParticipantResults(false)
  }

  const clearParticipantFilter = () => {
    onFiltersChange({ ...filters, participant: "" })
    setSearchQuery("")
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Диапазон дат:</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left">
              <CalendarComponent className="mr-2 h-4 w-4" />
              {filters.dateRange.from
                ? filters.dateRange.to
                  ? `${format(filters.dateRange.from, "dd.MM.yyyy")} - ${format(filters.dateRange.to, "dd.MM.yyyy")}`
                  : `С ${format(filters.dateRange.from, "dd.MM.yyyy")}`
                : filters.dateRange.to
                  ? `По ${format(filters.dateRange.to, "dd.MM.yyyy")}`
                  : "Выберите даты"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <CalendarComponent
              mode="range"
              selected={{
                from: filters.dateRange.from,
                to: filters.dateRange.to,
              }}
              onSelect={(range) => handleDateRangeChange({ from: range?.from, to: range?.to })}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Тип события:</label>
        <select
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={filters.eventType}
          onChange={(e) => handleEventTypeChange(e.target.value)}
        >
          <option value="all">Все типы</option>
          <option value="medical">Медицинская помощь</option>
          <option value="clothing">Выдача одежды</option>
          <option value="psychology">Консультация психолога</option>
          <option value="legal">Юридическая помощь</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Статус:</label>
        <select
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={filters.status}
          onChange={(e) => handleStatusChange(e.target.value)}
        >
          <option value="all">Все статусы</option>
          <option value="active">Активные</option>
          <option value="archived">Архивные</option>
        </select>
      </div>

      <div className="md:col-span-3">
        <label className="block text-sm font-medium text-gray-700">Поиск по участнику:</label>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Найти мероприятия по участнику (ФИО, ID)"
            className="pl-8"
            value={searchQuery}
            onChange={(e) => handleParticipantSearch(e.target.value)}
          />
          {filters.participant && (
            <Button variant="ghost" size="sm" className="absolute right-2 top-1.5" onClick={clearParticipantFilter}>
              ✕
            </Button>
          )}
        </div>

        {showParticipantResults && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border">
            <Command>
              <CommandList>
                <CommandEmpty>Ничего не найдено</CommandEmpty>
                <CommandGroup>
                  {filteredParticipants.map((participant) => (
                    <CommandItem
                      key={participant.id}
                      onSelect={() => handleSelectParticipant(participant)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{participant.name}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        )}
      </div>
    </div>
  )
}

