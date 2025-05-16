"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Pagination } from "@/components/ui/pagination"
import type { Event } from "@/lib/types"
// Импортируем новую функцию API и иконку для кнопки
import { deleteEvent, downloadEventParticipantsReport } from "@/lib/api/events"
import { MoreHorizontal, Trash, Edit, Users, Download } from "lucide-react"
import { EditEventDialog } from "./edit-event-dialog"
import { ManageParticipantsDialog } from "./manage-participants-dialog"

interface EventsTableProps {
  events: Event[]
  isLoading: boolean
  status: "upcoming" | "past"
  onActionComplete: () => void
  pagination: {
    page: number
    perPage: number
    total: number
    totalPages: number
  }
  onPageChange: (page: number) => void
}

export function EventsTable({
  events,
  isLoading,
  status,
  onActionComplete,
  pagination,
  onPageChange,
}: EventsTableProps) {
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null)
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null)
  const [eventToManageParticipants, setEventToManageParticipants] = useState<Event | null>(null)
  const { toast } = useToast()

  const handleDelete = async () => {
    if (!eventToDelete) return

    try {
      await deleteEvent(eventToDelete.id)
      toast({
        title: "Успех",
        description: "Мероприятие успешно удалено",
      })
      onActionComplete()
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить мероприятие",
        variant: "destructive",
      })
    } finally {
      setEventToDelete(null)
    }
  }

  const handleEditSuccess = () => {
    setEventToEdit(null)
    onActionComplete()
    toast({
      title: "Успех",
      description: "Мероприятие успешно обновлено",
    })
  }

  const handleManageParticipantsSuccess = () => {
    setEventToManageParticipants(null)
    onActionComplete()
    toast({
      title: "Успех",
      description: "Участники мероприятия успешно обновлены",
    })
  }

  // Добавляем функцию для скачивания отчета в компонент EventsTable
  const handleDownloadReport = async (event: Event) => {
    try {
      const blob = await downloadEventParticipantsReport(event.id)

      // Создаем ссылку для скачивания файла
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `participants-event-${event.id}.xlsx`
      document.body.appendChild(a)
      a.click()

      // Очищаем ресурсы
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Успех",
        description: "Отчет успешно скачан",
      })
    } catch (error) {
      toast({
        title: "Ошибка",
        description: (error as Error).message || "Не удалось скачать отчет",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Дата и время</TableHead>
                <TableHead>Место</TableHead>
                <TableHead>Участники</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-muted-foreground">
          {status === "upcoming" ? "Нет предстоящих мероприятий" : "Нет прошедших мероприятий"}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Дата и время</TableHead>
                <TableHead>Место</TableHead>
                <TableHead>Участники</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.serviceName}</TableCell>
                  <TableCell>{format(new Date(event.datetime), "dd.MM.yyyy HH:mm", { locale: ru })}</TableCell>
                  <TableCell>
                    {event.location ? (
                      <div>
                        <div>{event.location.name}</div>
                        <div className="text-sm text-muted-foreground">{event.location.address}</div>
                      </div>
                    ) : (
                      "Не указано"
                    )}
                  </TableCell>
                  <TableCell>
                    {event.participantsCount}/{event.capacity}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setEventToManageParticipants(event)}>
                        <Users className="h-4 w-4" />
                        <span className="sr-only md:not-sr-only md:ml-2">Участники</span>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDownloadReport(event)}>
                        <Download className="h-4 w-4" />
                        <span className="sr-only md:not-sr-only md:ml-2">Выгрузка</span>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Действия</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEventToEdit(event)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Редактировать
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEventToDelete(event)} className="text-red-600">
                            <Trash className="mr-2 h-4 w-4" />
                            Удалить
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {pagination.totalPages > 1 && (
          <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={onPageChange} />
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!eventToDelete} onOpenChange={(open) => !open && setEventToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Мероприятие будет удалено навсегда.
              {eventToDelete && eventToDelete.participantsCount > 0 && (
                <span className="mt-2 block font-semibold text-red-600">
                  Внимание! У этого мероприятия есть участники ({eventToDelete.participantsCount} чел.)
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Event Dialog */}
      {eventToEdit && (
        <EditEventDialog
          open={!!eventToEdit}
          onOpenChange={(open) => !open && setEventToEdit(null)}
          event={eventToEdit}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Manage Participants Dialog */}
      {eventToManageParticipants && (
        <ManageParticipantsDialog
          open={!!eventToManageParticipants}
          onOpenChange={(open) => !open && setEventToManageParticipants(null)}
          event={eventToManageParticipants}
          onSuccess={handleManageParticipantsSuccess}
        />
      )}
    </>
  )
}
