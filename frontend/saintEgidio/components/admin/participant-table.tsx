"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Pencil, Save, X, UserMinus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Checkbox } from "@/components/ui/checkbox"

export interface Participant {
  id: string
  name: string
  surname: string
  phone: string
  status: "attended" | "no-show" | "pending"
  comment: string
}

export interface ParticipantTableProps {
  participants: Participant[]
  onUpdate: (participant: Participant) => void
  onRemove: (participantId: string) => void
}

export function ParticipantTable({ participants, onUpdate, onRemove }: ParticipantTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<Participant>>({})
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])

  const handleEditStart = (participant: Participant) => {
    setEditingId(participant.id)
    setEditValues({ ...participant })
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditValues({})
  }

  const handleEditSave = () => {
    if (editingId && editValues.name && editValues.surname) {
      const updatedParticipant = participants.find((p) => p.id === editingId)

      if (updatedParticipant) {
        onUpdate({
          ...updatedParticipant,
          ...editValues,
        } as Participant)
      }
    }

    setEditingId(null)
    setEditValues({})
  }

  const handleInputChange = (field: keyof Participant, value: string) => {
    setEditValues({
      ...editValues,
      [field]: value,
    })
  }

  const handleStatusChange = (participantId: string, status: "attended" | "no-show" | "pending") => {
    const participant = participants.find((p) => p.id === participantId)

    if (participant) {
      onUpdate({
        ...participant,
        status,
      })
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

  const handleSelectParticipant = (participantId: string) => {
    if (selectedParticipants.includes(participantId)) {
      setSelectedParticipants(selectedParticipants.filter((id) => id !== participantId))
    } else {
      setSelectedParticipants([...selectedParticipants, participantId])
    }
  }

  return (
    <div>
      {participants.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">Нет участников для этого мероприятия</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>ID</TableHead>
              <TableHead>ФИО</TableHead>
              <TableHead>Телефон</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Комментарий</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants.map((participant) => (
              <TableRow key={participant.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedParticipants.includes(participant.id)}
                    onCheckedChange={() => handleSelectParticipant(participant.id)}
                  />
                </TableCell>
                <TableCell className="font-mono text-sm">{participant.id}</TableCell>
                <TableCell>
                  {participant.name} {participant.surname}
                </TableCell>
                <TableCell>{participant.phone}</TableCell>
                <TableCell>
                  {editingId === participant.id ? (
                    <Select
                      value={editValues.status || participant.status}
                      onValueChange={(value) =>
                        handleInputChange("status", value as "attended" | "no-show" | "pending")
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="attended">Присутствовал</SelectItem>
                        <SelectItem value="no-show">Не явился</SelectItem>
                        <SelectItem value="pending">Ожидается</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusBadgeClass(participant.status)}>
                        {getStatusLabel(participant.status)}
                      </Badge>
                      {participant.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(participant.id, "no-show")}
                        >
                          Отметить как неявку
                        </Button>
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {editingId === participant.id ? (
                    <Input
                      value={editValues.comment || ""}
                      onChange={(e) => handleInputChange("comment", e.target.value)}
                    />
                  ) : (
                    participant.comment || "-"
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {editingId === participant.id ? (
                    <div className="flex justify-end space-x-1">
                      <Button variant="ghost" size="icon" onClick={handleEditCancel}>
                        <X className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={handleEditSave}>
                        <Save className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-end space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEditStart(participant)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <UserMinus className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Удаление участника</AlertDialogTitle>
                            <AlertDialogDescription>
                              Вы уверены, что хотите удалить участника
                              {participant.name} {participant.surname}? Это действие нельзя отменить.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onRemove(participant.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Удалить
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

