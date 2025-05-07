"use client"

import { useState } from "react"
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
import { MoreHorizontal, Archive, Trash, Edit, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import type { TimeSlot } from "@/lib/types"
import { archiveTimeSlot, deleteTimeSlot } from "@/lib/api/time-slots"
import { EditTimeSlotDialog } from "./edit-time-slot-dialog"
import { ActivateTimeSlotDialog } from "./activate-time-slot-dialog"

interface TimeSlotTableProps {
  timeSlots: TimeSlot[]
  isLoading: boolean
  status: "active" | "archived"
  onActionComplete: () => void
}

export function TimeSlotTable({ timeSlots, isLoading, status, onActionComplete }: TimeSlotTableProps) {
  const [timeSlotToDelete, setTimeSlotToDelete] = useState<TimeSlot | null>(null)
  const [timeSlotToArchive, setTimeSlotToArchive] = useState<TimeSlot | null>(null)
  const [timeSlotToActivate, setTimeSlotToActivate] = useState<TimeSlot | null>(null)
  const [timeSlotToEdit, setTimeSlotToEdit] = useState<TimeSlot | null>(null)
  const { toast } = useToast()

  const handleDelete = async () => {
    if (!timeSlotToDelete) return

    try {
      await deleteTimeSlot(timeSlotToDelete.id)
      toast({
        title: "Успех",
        description: "Временной слот успешно удален",
      })
      onActionComplete()
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить временной слот",
        variant: "destructive",
      })
    } finally {
      setTimeSlotToDelete(null)
    }
  }

  const handleArchive = async () => {
    if (!timeSlotToArchive) return

    try {
      await archiveTimeSlot(timeSlotToArchive.id)
      toast({
        title: "Успех",
        description: "Временной слот успешно архивирован",
      })
      onActionComplete()
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось архивировать временной слот",
        variant: "destructive",
      })
    } finally {
      setTimeSlotToArchive(null)
    }
  }

  const handleActivateSuccess = () => {
    setTimeSlotToActivate(null)
    onActionComplete()
    toast({
      title: "Успех",
      description: "Временной слот успешно активирован",
    })
  }

  const handleEditSuccess = () => {
    setTimeSlotToEdit(null)
    onActionComplete()
    toast({
      title: "Успех",
      description: "Временной слот успешно обновлен",
    })
  }

  if (isLoading) {
    return <div className="flex justify-center p-4">Загрузка...</div>
  }

  if (timeSlots.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-muted-foreground">
          {status === "active" ? "Нет активных временных слотов" : "Нет архивных временных слотов"}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Название</TableHead>
              <TableHead>Тип</TableHead>
              <TableHead>Место</TableHead>
              <TableHead>Дата и время</TableHead>
              <TableHead>Вместимость</TableHead>
              <TableHead>Услуги</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {timeSlots.map((slot) => (
              <TableRow key={slot.id}>
                <TableCell className="font-medium">{slot.title}</TableCell>
                <TableCell>{slot.type === "single" ? "Разовое" : "Повторяющееся"}</TableCell>
                <TableCell>{slot.locationId}</TableCell>
                <TableCell>{format(new Date(slot.startDate), "dd.MM.yyyy HH:mm", { locale: ru })}</TableCell>
                <TableCell>{slot.capacity}</TableCell>
                <TableCell>{slot.services.length}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Открыть меню</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {status === "active" ? (
                        <>
                          <DropdownMenuItem onClick={() => setTimeSlotToEdit(slot)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Редактировать
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setTimeSlotToArchive(slot)}>
                            <Archive className="mr-2 h-4 w-4" />
                            Архивировать
                          </DropdownMenuItem>
                        </>
                      ) : (
                        <DropdownMenuItem onClick={() => setTimeSlotToActivate(slot)}>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Активировать
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => setTimeSlotToDelete(slot)} className="text-red-600">
                        <Trash className="mr-2 h-4 w-4" />
                        Удалить
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!timeSlotToDelete} onOpenChange={(open) => !open && setTimeSlotToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Временной слот будет удален навсегда.
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

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={!!timeSlotToArchive} onOpenChange={(open) => !open && setTimeSlotToArchive(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Архивировать временной слот?</AlertDialogTitle>
            <AlertDialogDescription>
              Временной слот будет перемещен в архив и не будет отображаться в активных слотах.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive}>Архивировать</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Time Slot Dialog */}
      {timeSlotToEdit && (
        <EditTimeSlotDialog
          open={!!timeSlotToEdit}
          onOpenChange={(open) => !open && setTimeSlotToEdit(null)}
          timeSlot={timeSlotToEdit}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Activate Time Slot Dialog */}
      {timeSlotToActivate && (
        <ActivateTimeSlotDialog
          open={!!timeSlotToActivate}
          onOpenChange={(open) => !open && setTimeSlotToActivate(null)}
          timeSlot={timeSlotToActivate}
          onSuccess={handleActivateSuccess}
        />
      )}
    </>
  )
}
