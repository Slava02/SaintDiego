"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, RotateCw, Edit, Trash2, Archive, RefreshCw } from "lucide-react"
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

interface EventCardProps {
  event: Event
  onEdit: () => void
  onDelete: () => void
  onArchive?: () => void
  onActivate?: () => void
  isActive: boolean
}

export function EventCard({ event, onEdit, onDelete, onArchive, onActivate, isActive }: EventCardProps) {
  const isArchived = event.status === "archived"
  const isFull = event.registeredParticipants >= event.maxParticipants
  const isRecurring = event.type === "recurring"

  // Функция для форматирования частоты повторения
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
    <Card
      className={cn(
        "transition-all hover:shadow-md",
        isArchived ? "bg-gray-100" : "",
        isActive ? "border-l-4 border-l-green-500" : "border-l-4 border-l-gray-400",
        isFull ? "border-red-200" : "",
      )}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className={cn("font-semibold text-lg", isArchived ? "text-gray-600" : "text-green-700")}>
            {event.title}
          </h3>
          <Badge className={cn(isArchived ? "bg-gray-200 text-gray-700" : "bg-green-100 text-green-800")}>
            {isArchived ? "Архив" : "Активно"}
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <Badge className={isRecurring ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}>
              {isRecurring ? "Повторяющееся" : "Разовое"}
            </Badge>

            {isRecurring && (
              <span className="ml-2 flex items-center text-blue-600">
                <RotateCw className="h-3 w-3 mr-1" />
                {getRecurrenceText(event.recurrence)}
              </span>
            )}
          </div>

          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-gray-500" />
            <span>{event.location}</span>
          </div>

          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2 text-gray-500" />
            <span className={cn(isFull ? "text-red-600 font-medium" : "")}>
              {event.registeredParticipants}/{event.maxParticipants}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-end gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span className="ml-2">Действия</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(!isArchived || isActive) && (
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Редактировать
              </DropdownMenuItem>
            )}

            {isActive && onArchive && (
              <DropdownMenuItem onClick={onArchive}>
                <Archive className="h-4 w-4 mr-2" />В архив
              </DropdownMenuItem>
            )}

            {!isActive && onActivate && (
              <DropdownMenuItem onClick={onActivate}>
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
                    Это действие удалит событие "{event.title}" и все связанные с ним данные. Это действие нельзя
                    отменить.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700">
                    Удалить
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  )
}

