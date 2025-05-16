"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Plus, X } from "lucide-react"
import type { Event, Participant } from "@/lib/types"
import { getEventParticipants, removeParticipantFromEvent } from "@/lib/api/events"
import { AddParticipantDialog } from "./add-participant-dialog"

interface ManageParticipantsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: Event
  onSuccess: () => void
}

export function ManageParticipantsDialog({ open, onOpenChange, event, onSuccess }: ManageParticipantsDialogProps) {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddParticipant, setShowAddParticipant] = useState(false)
  const { toast } = useToast()

  const fetchParticipants = async () => {
    setIsLoading(true)
    try {
      const response = await getEventParticipants(event.id)
      setParticipants(response.participants)
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список участников",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchParticipants()
    }
  }, [open, event.id])

  const handleRemoveParticipant = async (participantId: number) => {
    try {
      await removeParticipantFromEvent(event.id, participantId)
      setParticipants(participants.filter((p) => p.id !== participantId))
      toast({
        title: "Успех",
        description: "Участник успешно удален из мероприятия",
      })
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить участника",
        variant: "destructive",
      })
    }
  }

  const handleAddParticipantSuccess = () => {
    setShowAddParticipant(false)
    fetchParticipants()
    toast({
      title: "Успех",
      description: "Участник успешно добавлен к мероприятию",
    })
  }

  const getStatusBadge = (status?: string) => {
    if (!status) return null

    switch (status) {
      case "присутствовал":
        return <Badge className="bg-green-100 text-green-800">Присутствовал</Badge>
      case "не пришел":
        return <Badge className="bg-red-100 text-red-800">Не пришел</Badge>
      case "в ожидании":
        return <Badge className="bg-yellow-100 text-yellow-800">В ожидании</Badge>
      default:
        return null
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Управление участниками - {event.serviceName}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                Участники: {participants.length}/{event.capacity}
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={() => setShowAddParticipant(true)}
                disabled={participants.length >= event.capacity}
              >
                <Plus className="mr-2 h-4 w-4" />
                Добавить участника
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-12 w-full" />
                ))}
              </div>
            ) : participants.length === 0 ? (
              <div className="rounded-md border p-8 text-center">
                <p className="text-muted-foreground">Нет участников</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>ФИО</TableHead>
                    <TableHead>Волонтер (Telegram)</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participants.map((participant) => (
                    <TableRow key={participant.id}>
                      <TableCell className="font-medium">p{participant.id}</TableCell>
                      <TableCell>
                        {participant.last_name} {participant.first_name} {participant.middle_name}
                      </TableCell>
                      <TableCell>
                        {participant.volunteer_tg_login ? `@${participant.volunteer_tg_login}` : "—"}
                      </TableCell>
                      <TableCell>{getStatusBadge(participant.status)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveParticipant(participant.id)}>
                          <X className="h-4 w-4" />
                          <span className="sr-only">Удалить</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AddParticipantDialog
        open={showAddParticipant}
        onOpenChange={setShowAddParticipant}
        eventId={event.id}
        onSuccess={handleAddParticipantSuccess}
      />
    </>
  )
}
