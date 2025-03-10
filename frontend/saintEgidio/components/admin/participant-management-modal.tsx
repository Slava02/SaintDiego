"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Edit, Trash2, MoreVertical, UserPlus, AlertTriangle, Check, X, Clock, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Event } from "@/types/event"

interface Service {
  id: string
  name: string
  time: string
  capacity: number
  bookingWindow: number
  registered: number
}

interface Participant {
  id: string
  name: string
  surname: string
  telegramId: string
  status: "attended" | "no-show" | "pending"
}

interface User {
  id: string
  name: string
  surname: string
  phone: string
  cardNumber: string
}

interface ParticipantManagementModalProps {
  event: Event
  open: boolean
  onClose: () => void
}

export function ParticipantManagementModal({ event, open, onClose }: ParticipantManagementModalProps) {
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: "1",
      name: "Виктор",
      surname: "Толстихин",
      telegramId: "@volunteer1",
      status: "attended",
    },
    {
      id: "2",
      name: "Анна",
      surname: "Петрова",
      telegramId: "@volunteer2",
      status: "no-show",
    },
    {
      id: "3",
      name: "Сергей",
      surname: "Иванов",
      telegramId: "@volunteer3",
      status: "pending",
    },
  ])
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])
  const [showAddParticipant, setShowAddParticipant] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [participantToDelete, setParticipantToDelete] = useState<string | null>(null)
  const [showCapacityWarning, setShowCapacityWarning] = useState(false)

  // Мок-данные для пользователей
  const mockUsers: User[] = [
    { id: "u1", name: "Виктор", surname: "Толстихин", phone: "+7 (123) 456-78-90", cardNumber: "001" },
    { id: "u2", name: "Анна", surname: "Петрова", phone: "+7 (987) 654-32-10", cardNumber: "002" },
    { id: "u3", name: "Сергей", surname: "Иванов", phone: "+7 (555) 123-45-67", cardNumber: "003" },
    { id: "u4", name: "Елена", surname: "Смирнова", phone: "+7 (111) 222-33-44", cardNumber: "004" },
    { id: "u5", name: "Алексей", surname: "Козлов", phone: "+7 (222) 333-44-55", cardNumber: "005" },
  ]

  // Загрузка участников при открытии модального окна
  useEffect(() => {
    if (event) {
      // В реальном приложении здесь был бы API-запрос
      // Мок-данные для демонстрации
      const mockParticipants: Participant[] = [
        {
          id: "p1",
          name: "Виктор",
          surname: "Толстихин",
          telegramId: "@volunteer1",
          status: "attended",
        },
        {
          id: "p2",
          name: "Анна",
          surname: "Петрова",
          telegramId: "@volunteer2",
          status: "no-show",
        },
        {
          id: "p3",
          name: "Сергей",
          surname: "Иванов",
          telegramId: "@volunteer3",
          status: "pending",
        },
      ]

      setParticipants(mockParticipants)
    }
  }, [event])

  // Поиск пользователей
  const handleSearch = (query: string) => {
    setSearchQuery(query)

    if (query.length < 2) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    const results = mockUsers.filter((user) => {
      const fullName = `${user.name} ${user.surname}`.toLowerCase()
      return fullName.includes(query.toLowerCase()) || user.phone.includes(query) || user.cardNumber.includes(query)
    })

    setSearchResults(results)
    setShowSearchResults(results.length > 0)
  }

  // Добавление участника
  const handleAddParticipant = () => {
    if (participants.length >= event.capacity) {
      setShowCapacityWarning(true)
      return
    }

    setShowAddParticipant(true)
  }

  // Обработка выбора пользователя из результатов поиска
  const handleUserSelect = (user: User) => {
    // Проверяем, не зарегистрирован ли уже этот пользователь
    if (participants.some(p => p.telegramId === user.phone)) {
      alert("Этот пользователь уже зарегистрирован на мероприятие")
      return
    }

    // Создаем нового участника
    const newParticipant: Participant = {
      id: `p${Date.now()}`,
      name: user.name,
      surname: user.surname,
      telegramId: user.phone,
      status: "pending"
    }

    // Добавляем участника в список
    setParticipants(prev => [...prev, newParticipant])

    // Закрываем модальное окно и очищаем поиск
    setShowAddParticipant(false)
    setSearchQuery("")
    setSearchResults([])
    setShowSearchResults(false)
  }

  // Удаление участника
  const handleDeleteParticipant = (participantId: string) => {
    setParticipantToDelete(participantId)
    setShowDeleteDialog(true)
  }

  const confirmDeleteParticipant = () => {
    if (participantToDelete) {
      setParticipants((prev) => prev.filter((p) => p.id !== participantToDelete))
      setShowDeleteDialog(false)
      setParticipantToDelete(null)
    }
  }

  // Выбор/снятие выбора со всех участников
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedParticipants(participants.map((p) => p.id))
    } else {
      setSelectedParticipants([])
    }
  }

  // Выбор/снятие выбора с одного участника
  const handleSelectParticipant = (participantId: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(participantId)
        ? prev.filter((id) => id !== participantId)
        : [...prev, participantId]
    )
  }

  // Групповое изменение статуса
  const handleStatusChange = (status: Participant["status"]) => {
    setParticipants((prev) =>
      prev.map((p) => (selectedParticipants.includes(p.id) ? { ...p, status } : p))
    )
  }

  // Получение цвета и текста для статуса
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "attended":
        return <Badge className="bg-green-100 text-green-800">Присутствовал</Badge>
      case "no-show":
        return <Badge className="bg-red-100 text-red-800">Не явился</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Ожидается</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Управление участниками - {event.title}</DialogTitle>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Участники:{" "}
                <span className={cn(
                  "font-medium",
                  participants.length >= event.capacity ? "text-red-600" : "text-green-600"
                )}>
                  {participants.length}/{event.capacity}
                </span>
              </span>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {participants.length >= event.capacity && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex items-center text-red-600">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <span>Достигнуто максимальное количество участников</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={selectedParticipants.length === participants.length}
                onCheckedChange={handleSelectAll}
              />
              <label htmlFor="select-all" className="text-sm font-medium">
                Выбрать всех
              </label>
            </div>

            {selectedParticipants.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  Выбрано: {selectedParticipants.length}
                </span>
                <Select onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Изменить статус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="attended">Присутствовал</SelectItem>
                    <SelectItem value="no-show">Не пришел</SelectItem>
                    <SelectItem value="pending">В ожидании</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>ID</TableHead>
                <TableHead>ФИО</TableHead>
                <TableHead>Волонтер (Telegram)</TableHead>
                <TableHead>Статус</TableHead>
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
                  <TableCell>{participant.telegramId}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        participant.status === "attended"
                          ? "bg-green-100 text-green-800"
                          : participant.status === "no-show"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      )}
                    >
                      {participant.status === "attended"
                        ? "Присутствовал"
                        : participant.status === "no-show"
                          ? "Не пришел"
                          : "В ожидании"}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Button
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:scale-110 transition-transform"
          onClick={handleAddParticipant}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </DialogContent>

      {/* Модальное окно добавления участника */}
      <Dialog open={showAddParticipant} onOpenChange={setShowAddParticipant}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Добавление участника</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Поиск по ФИО, ID или телефону</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Введите ФИО, ID или телефон..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>

              {showSearchResults && (
                <div className="border rounded-md mt-1">
                  <Command>
                    <CommandList>
                      <CommandEmpty>Ничего не найдено</CommandEmpty>
                      <CommandGroup>
                        {searchResults.map((user) => (
                          <CommandItem
                            key={user.id}
                            onSelect={() => handleUserSelect(user)}
                            className="cursor-pointer"
                          >
                            <div>
                              <div className="font-medium">
                                {user.name} {user.surname}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                ID: {user.id} | Карта №{user.cardNumber} | {user.phone}
                              </div>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddParticipant(false)}>
              Отмена
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Предупреждение о достижении максимальной вместимости */}
      <AlertDialog open={showCapacityWarning} onOpenChange={setShowCapacityWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Достигнуто максимальное количество участников
            </AlertDialogTitle>
            <AlertDialogDescription>
              Невозможно добавить нового участника, так как достигнуто максимальное количество участников для этого
              мероприятия.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Понятно</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Подтверждение удаления участника */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удаление участника</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить этого участника из мероприятия? Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteParticipant} className="bg-red-500 hover:bg-red-600">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}

