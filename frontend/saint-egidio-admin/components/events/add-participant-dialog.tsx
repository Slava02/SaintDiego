"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Search } from "lucide-react"
import type { Participant, AddParticipantToEventRequest } from "@/lib/types"
import { searchParticipants } from "@/lib/api/participants"
import { addParticipantToEvent } from "@/lib/api/events"

interface AddParticipantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: number
  onSuccess: () => void
}

export function AddParticipantDialog({ open, onOpenChange, eventId, onSuccess }: AddParticipantDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Participant[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      setSearchQuery("")
      setSearchResults([])
    }
  }, [open])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const results = await searchParticipants(searchQuery)
      setSearchResults(results)
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось выполнить поиск участников",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleAddParticipant = async (participant: Participant) => {
    setIsAdding(true)
    try {
      const data: AddParticipantToEventRequest = {
        participant_id: participant.id,
        volunteer_id: participant.volunteer_tg || 0, // Fallback to 0 if not available
      }

      await addParticipantToEvent(eventId, data)
      onSuccess()
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить участника к мероприятию",
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Добавление участника</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по ФИО, ID или телефону"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
              {isSearching ? "Поиск..." : "Поиск"}
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="max-h-60 overflow-y-auto rounded-md border">
              {searchResults.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between border-b p-3 last:border-0 hover:bg-gray-50"
                >
                  <div>
                    <div className="font-medium">
                      {participant.last_name} {participant.first_name} {participant.middle_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ID: {participant.id} | Карта №{participant.id.toString().padStart(3, "0")} |
                      {participant.volunteer_tg_login
                        ? ` +7 (${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 90) + 10}-${Math.floor(Math.random() * 90) + 10}`
                        : " Нет телефона"}
                    </div>
                  </div>
                  <Button size="sm" onClick={() => handleAddParticipant(participant)} disabled={isAdding}>
                    Выбрать
                  </Button>
                </div>
              ))}
            </div>
          )}

          {searchQuery && !isSearching && searchResults.length === 0 && (
            <div className="rounded-md border p-4 text-center">
              <p className="text-muted-foreground">Участники не найдены</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
