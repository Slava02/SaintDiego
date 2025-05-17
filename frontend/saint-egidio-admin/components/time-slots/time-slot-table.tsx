"use client"

import { useState, useEffect } from "react"
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
import { MoreHorizontal, Trash, Edit, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import type { TimeSlot, Location } from "@/lib/types"
import { deleteTimeSlot } from "@/lib/api/time-slots"
import { getLocations } from "@/lib/api/locations"
import { EditTimeSlotDialog } from "./edit-time-slot-dialog"

interface TimeSlotTableProps {
  timeSlots: TimeSlot[]
  isLoading: boolean
  onActionComplete: () => void
}

export function TimeSlotTable({ timeSlots, isLoading, onActionComplete }: TimeSlotTableProps) {
  const [timeSlotToDelete, setTimeSlotToDelete] = useState<TimeSlot | null>(null)
  const [timeSlotToEdit, setTimeSlotToEdit] = useState<TimeSlot | null>(null)
  const [processingIds, setProcessingIds] = useState<number[]>([]) // Track items being processed
  const [locations, setLocations] = useState<Location[]>([])
  const { toast } = useToast()

  // Загрузка локаций при монтировании компонента
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const locationsData = await getLocations()
        setLocations(locationsData)
      } catch (error) {
        console.error("Error fetching locations:", error)
      }
    }

    fetchLocations()
  }, [])

  // Функция для получения названия локации по ID
  const getLocationName = (locationId: number) => {
    const location = locations.find((loc) => loc.id === locationId)
    return location ? location.name : `Место #${locationId}`
  }

  // Helper to mark an item as being processed
  const markAsProcessing = (id: number) => {
    setProcessingIds((prev) => [...prev, id])
  }

  // Helper to unmark an item as being processed
  const unmarkAsProcessing = (id: number) => {
    setProcessingIds((prev) => prev.filter((itemId) => itemId !== id))
  }

  // Check if an item is being processed
  const isProcessing = (id: number) => processingIds.includes(id)

  const handleDelete = async () => {
    if (!timeSlotToDelete) return

    const id = timeSlotToDelete.id
    markAsProcessing(id)

    try {
      // Close the dialog immediately for better UX
      setTimeSlotToDelete(null)

      // Show a loading toast
      const { update } = toast({
        title: "Удаление...",
        description: "Временной слот удаляется",
      })

      // Perform the actual deletion
      await deleteTimeSlot(id)

      // Optimistically update UI - refresh the data
      onActionComplete()

      // Update the toast to show success
      toast({
        title: "Успех",
        description: "Временной слот успешно удален",
      })
    } catch (error) {
      console.error("Error deleting time slot:", error)

      // Show error toast
      toast({
        title: "Ошибка",
        description: "Не удалось удалить временной слот. Попробуйте обновить страницу.",
        variant: "destructive",
      })

      // Refresh data to ensure UI is in sync with backend
      onActionComplete()
    } finally {
      unmarkAsProcessing(id)
    }
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
        <p className="text-muted-foreground">Нет временных слотов</p>
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
              <TableRow key={slot.id} className={isProcessing(slot.id) ? "opacity-50" : ""}>
                <TableCell className="font-medium">{slot.title}</TableCell>
                <TableCell>{slot.type === "single" ? "Разовое" : "Повторяющееся"}</TableCell>
                <TableCell>{getLocationName(slot.locationId)}</TableCell>
                <TableCell>{format(new Date(slot.startDate), "dd.MM.yyyy HH:mm", { locale: ru })}</TableCell>
                <TableCell>{slot.capacity}</TableCell>
                <TableCell>{slot.services.length}</TableCell>
                <TableCell className="text-right">
                  {isProcessing(slot.id) ? (
                    <Button variant="ghost" className="h-8 w-8 p-0" disabled>
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </Button>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Открыть меню</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setTimeSlotToEdit(slot)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Редактировать
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTimeSlotToDelete(slot)} className="text-red-600">
                          <Trash className="mr-2 h-4 w-4" />
                          Удалить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
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
              <p>Это действие нельзя отменить. Временной слот будет удален навсегда.</p>
              <p className="mt-2 font-semibold text-red-600">
                ВНИМАНИЕ! Будут удалены все события, связанные с этим временным слотом, включая те, на которые уже
                записаны люди.
              </p>
              <p className="mt-2">
                Пожалуйста, убедитесь, что на события этого временного слота нет активных записей, или предупредите всех
                записавшихся людей об отмене.
              </p>
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

      {/* Edit Time Slot Dialog */}
      {timeSlotToEdit && (
        <EditTimeSlotDialog
          open={!!timeSlotToEdit}
          onOpenChange={(open) => !open && setTimeSlotToEdit(null)}
          timeSlot={timeSlotToEdit}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  )
}
