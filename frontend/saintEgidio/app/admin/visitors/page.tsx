"use client"

import { Label } from "@/components/ui/label"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ExternalLink, Edit, AlertTriangle, Trash2, MessageSquare } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
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

interface Visitor {
  id: string
  name: string
  surname: string
  cardNumber: string
  photo?: string
  dateOfBirth?: string
  group?: string
  phone?: string
  email?: string
  registrationDate?: Date
  registrationCenter?: string
  status?: "active" | "archived"
  events?: Array<{
    id: string
    title: string
    date: Date
    type: string
    status: "upcoming" | "attended" | "no-show"
  }>
}

interface Event {
  id: string
  title: string
  type: string
  date: Date
  participants: Array<{
    id: string
    name: string
    surname: string
    status: "attended" | "no-show" | "pending"
    comment: string
  }>
}

export default function VisitorsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Visitor[]>([])
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showEventParticipants, setShowEventParticipants] = useState(false)
  const [showParticipantModal, setShowParticipantModal] = useState(false)
  const [showNoShowDialog, setShowNoShowDialog] = useState(false)
  const [showCommentDialog, setShowCommentDialog] = useState(false)
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [noShowComment, setNoShowComment] = useState("")
  const [participantComment, setParticipantComment] = useState("")
  const [eventToAction, setEventToAction] = useState<string | null>(null)
  const [selectedEventData, setSelectedEventData] = useState<{
    id: string
    title: string
    date: Date
    type: string
    status: string
  } | null>(null)

  // Mock visitors data
  const mockVisitors: Visitor[] = [
    {
      id: "1",
      name: "Виктор",
      surname: "Толстихин",
      cardNumber: "001",
      photo: "/placeholder.svg?height=80&width=80",
      dateOfBirth: "15.05.1975",
      group: "Получатели продуктовой помощи",
      phone: "+7 (123) 456-78-90",
      email: "viktor@example.com",
      registrationDate: new Date(2023, 5, 10),
      registrationCenter: "Цветной",
      status: "active",
      events: [
        {
          id: "1",
          title: "Медицинская консультация",
          date: new Date(2025, 2, 10, 10, 0),
          type: "medical",
          status: "upcoming",
        },
        {
          id: "2",
          title: "Выдача одежды",
          date: new Date(2025, 2, 15, 14, 0),
          type: "clothing",
          status: "upcoming",
        },
        {
          id: "3",
          title: "Консультация психолога",
          date: new Date(2024, 11, 12, 12, 0),
          type: "psychology",
          status: "attended",
        },
      ],
    },
    {
      id: "2",
      name: "Анна",
      surname: "Петрова",
      cardNumber: "002",
      photo: "/placeholder.svg?height=80&width=80",
      dateOfBirth: "23.11.1982",
      group: "Временное жилье",
      phone: "+7 (987) 654-32-10",
      email: "anna@example.com",
      registrationDate: new Date(2023, 8, 15),
      registrationCenter: "Гиляровского",
      status: "active",
      events: [
        {
          id: "3",
          title: "Консультация психолога",
          date: new Date(2025, 2, 12, 12, 0),
          type: "psychology",
          status: "upcoming",
        },
        {
          id: "4",
          title: "Юридическая помощь",
          date: new Date(2024, 10, 5, 15, 0),
          type: "legal",
          status: "no-show",
        },
      ],
    },
    {
      id: "3",
      name: "Сергей",
      surname: "Иванов",
      cardNumber: "003",
      photo: "/placeholder.svg?height=80&width=80",
      dateOfBirth: "07.03.1968",
      group: "Получатели продуктовой помощи",
      phone: "+7 (555) 123-45-67",
      email: "",
      registrationDate: new Date(2024, 0, 20),
      registrationCenter: "Ясная",
      status: "archived",
      events: [],
    },
  ]

  // Mock events data
  const mockEvents: Event[] = [
    {
      id: "1",
      title: "Медицинская консультация",
      type: "medical",
      date: new Date(2025, 2, 10, 10, 0),
      participants: [
        {
          id: "1",
          name: "Виктор",
          surname: "Толстихин",
          status: "pending",
          comment: "",
        },
        {
          id: "4",
          name: "Елена",
          surname: "Смирнова",
          status: "pending",
          comment: "Нужна помощь с документами",
        },
      ],
    },
    {
      id: "3",
      title: "Консультация психолога",
      type: "psychology",
      date: new Date(2024, 11, 12, 12, 0),
      participants: [
        {
          id: "1",
          name: "Виктор",
          surname: "Толстихин",
          status: "attended",
          comment: "",
        },
        {
          id: "2",
          name: "Анна",
          surname: "Петрова",
          status: "no-show",
          comment: "Не пришла без предупреждения",
        },
      ],
    },
  ]

  const handleSearch = (query: string) => {
    setSearchQuery(query)

    if (query.length < 2) {
      setSearchResults([])
      setShowSearchDropdown(false)
      return
    }

    const filteredResults = mockVisitors.filter((visitor) => {
      const fullName = `${visitor.name} ${visitor.surname}`.toLowerCase()
      return (
        fullName.includes(query.toLowerCase()) ||
        visitor.cardNumber.includes(query) ||
        (visitor.phone && visitor.phone.includes(query))
      )
    })

    setSearchResults(filteredResults)
    setShowSearchDropdown(filteredResults.length > 0)
  }

  const handleSelectVisitor = (visitor: Visitor) => {
    setSelectedVisitor(visitor)
    setShowSearchDropdown(false)
  }

  const handleViewEventDetails = (eventId: string) => {
    const event = mockEvents.find((e) => e.id === eventId)
    if (event) {
      setSelectedEvent(event)
      setShowEventParticipants(true)
    }
  }

  const handleEditEvent = (event: any) => {
    setSelectedEventData(event)
    setShowParticipantModal(true)
    // Предзаполняем комментарий, если он есть
    if (event.comment) {
      setParticipantComment(event.comment)
    } else {
      setParticipantComment("")
    }
  }

  const handleMarkAsNoShow = () => {
    setShowNoShowDialog(true)
    setNoShowComment("")
  }

  const handleAddComment = () => {
    setShowCommentDialog(true)
  }

  const handleRemoveFromEvent = () => {
    setShowRemoveDialog(true)
  }

  const confirmNoShow = () => {
    if (selectedVisitor && selectedEventData) {
      // В реальном приложении здесь был бы API-запрос для обновления статуса
      console.log(`Отмечено как неявка: ${selectedEventData.id}, комментарий: ${noShowComment}`)

      // Обновляем локальное состояние для демонстрации
      setSelectedVisitor({
        ...selectedVisitor,
        events: selectedVisitor.events?.map((event) =>
          event.id === selectedEventData.id ? { ...event, status: "no-show" } : event,
        ),
      })

      setShowNoShowDialog(false)
      setShowParticipantModal(false)
    }
  }

  const confirmAddComment = () => {
    if (selectedVisitor && selectedEventData) {
      // В реальном приложении здесь был бы API-запрос для добавления комментария
      console.log(`Добавлен комментарий к мероприятию: ${selectedEventData.id}, комментарий: ${participantComment}`)

      setShowCommentDialog(false)
    }
  }

  const confirmRemove = () => {
    if (selectedVisitor && selectedEventData) {
      // В реальном приложении здесь был бы API-запрос для удаления участника
      console.log(`Удален из мероприятия: ${selectedEventData.id}`)

      // Обновляем локальное состояние для демонстрации
      setSelectedVisitor({
        ...selectedVisitor,
        events: selectedVisitor.events?.filter((event) => event.id !== selectedEventData.id),
      })

      setShowRemoveDialog(false)
      setShowParticipantModal(false)
    }
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "medical":
        return "bg-blue-100 text-blue-800"
      case "clothing":
        return "bg-green-100 text-green-800"
      case "psychology":
        return "bg-purple-100 text-purple-800"
      case "legal":
        return "bg-amber-100 text-amber-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Badge className="bg-yellow-100 text-yellow-800">Запланировано</Badge>
      case "attended":
        return <Badge className="bg-green-100 text-green-800">Посещено</Badge>
      case "no-show":
        return <Badge className="bg-red-100 text-red-800">Не явился</Badge>
      case "active":
        return <Badge className="bg-green-100 text-green-800">Активный</Badge>
      case "archived":
        return <Badge className="bg-gray-100 text-gray-800">Архивный</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Посетители</h1>

      <Card>
        <CardHeader>
          <CardTitle>Поиск посетителя</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="flex">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Введите имя, фамилию, номер карты или телефон..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              <Button className="ml-2">Поиск</Button>
            </div>

            <Popover open={showSearchDropdown} onOpenChange={setShowSearchDropdown}>
              <PopoverTrigger asChild>
                <div></div>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-full" align="start">
                <Command>
                  <CommandList>
                    <CommandEmpty>Ничего не найдено</CommandEmpty>
                    <CommandGroup>
                      {searchResults.map((visitor) => (
                        <CommandItem
                          key={visitor.id}
                          onSelect={() => handleSelectVisitor(visitor)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={visitor.photo || "/placeholder.svg"}
                                alt={`${visitor.name} ${visitor.surname}`}
                              />
                              <AvatarFallback>
                                {visitor.name.charAt(0)}
                                {visitor.surname.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {visitor.name} {visitor.surname}
                              </div>
                              <div className="text-sm text-muted-foreground">Карта №{visitor.cardNumber}</div>
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {searchResults.length > 0 && !showSearchDropdown && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((visitor) => (
                <Card
                  key={visitor.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleSelectVisitor(visitor)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={visitor.photo || "/placeholder.svg"}
                          alt={`${visitor.name} ${visitor.surname}`}
                        />
                        <AvatarFallback>
                          {visitor.name.charAt(0)}
                          {visitor.surname.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {visitor.name} {visitor.surname}
                        </div>
                        <div className="text-sm text-muted-foreground">Карта №{visitor.cardNumber}</div>
                        <div className="text-sm">{visitor.group}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedVisitor && (
        <Card>
          <CardHeader>
            <CardTitle>Информация о посетителе</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <div className="flex flex-col items-center">
                    <Avatar className="h-32 w-32 mb-4">
                      <AvatarImage
                        src={selectedVisitor.photo || "/placeholder.svg"}
                        alt={`${selectedVisitor.name} ${selectedVisitor.surname}`}
                      />
                      <AvatarFallback className="text-2xl">
                        {selectedVisitor.name.charAt(0)}
                        {selectedVisitor.surname.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-semibold text-center">
                      {selectedVisitor.name} {selectedVisitor.surname}
                    </h3>
                    <p className="text-muted-foreground text-center">Карта №{selectedVisitor.cardNumber}</p>
                    <div className="mt-2">{getStatusBadge(selectedVisitor.status || "active")}</div>
                  </div>
                </div>

                <div className="md:w-2/3 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Основная информация</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Дата рождения:</span>
                          <span className="font-medium">{selectedVisitor.dateOfBirth || "Не указано"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Группа:</span>
                          <Select defaultValue={selectedVisitor.group}>
                            <SelectTrigger className="w-[200px]">
                              <SelectValue placeholder="Выберите группу" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Получатели продуктовой помощи">
                                Получатели продуктовой помощи
                              </SelectItem>
                              <SelectItem value="Временное жилье">Временное жилье</SelectItem>
                              <SelectItem value="Медицинская помощь">Медицинская помощь</SelectItem>
                              <SelectItem value="Юридическая поддержка">Юридическая поддержка</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Дата регистрации:</span>
                          <span className="font-medium">
                            {selectedVisitor.registrationDate?.toLocaleDateString("ru-RU") || "Не указано"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Центр регистрации:</span>
                          <span className="font-medium">{selectedVisitor.registrationCenter || "Не указано"}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Контактная информация</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Телефон:</span>
                          <span className="font-medium">{selectedVisitor.phone || "Не указано"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span className="font-medium">{selectedVisitor.email || "Не указано"}</span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <Button variant="outline" className="w-full">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Открыть профиль в МКС
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Мероприятия посетителя</h3>

                <Tabs defaultValue="upcoming">
                  <TabsList>
                    <TabsTrigger value="upcoming">Предстоящие</TabsTrigger>
                    <TabsTrigger value="attended">Посещенные</TabsTrigger>
                  </TabsList>

                  <TabsContent value="upcoming">
                    {selectedVisitor.events &&
                    selectedVisitor.events.filter((e) => e.status === "upcoming").length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Дата</TableHead>
                            <TableHead>Мероприятие</TableHead>
                            <TableHead>Тип</TableHead>
                            <TableHead>Статус</TableHead>
                            <TableHead className="text-right">Действия</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedVisitor.events
                            .filter((event) => event.status === "upcoming")
                            .map((event) => (
                              <TableRow key={event.id}>
                                <TableCell>
                                  {event.date.toLocaleDateString("ru-RU")}{" "}
                                  {event.date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                                </TableCell>
                                <TableCell className="font-medium">{event.title}</TableCell>
                                <TableCell>
                                  <Badge className={getEventTypeColor(event.type)}>{event.type}</Badge>
                                </TableCell>
                                <TableCell>{getStatusBadge(event.status)}</TableCell>
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="sm" onClick={() => handleEditEvent(event)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Редактировать
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center p-6 border rounded-md text-muted-foreground">
                        У посетителя нет запланированных мероприятий
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="attended">
                    {selectedVisitor.events &&
                    selectedVisitor.events.filter((e) => e.status !== "upcoming").length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {selectedVisitor.events
                          .filter((event) => event.status !== "upcoming")
                          .map((event) => (
                            <Card key={event.id} className="text-muted-foreground">
                              <CardContent className="p-4">
                                <div className="space-y-2">
                                  <div className="flex justify-between items-start">
                                    <h4 className="font-medium text-foreground">{event.title}</h4>
                                    {getStatusBadge(event.status)}
                                  </div>
                                  <div className="text-sm">
                                    <p>Дата: {event.date.toLocaleDateString("ru-RU")}</p>
                                    <p>
                                      Время:{" "}
                                      {event.date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                                    </p>
                                  </div>
                                  <Badge className={getEventTypeColor(event.type)}>{event.type}</Badge>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center p-6 border rounded-md text-muted-foreground">
                        У посетителя нет посещенных мероприятий
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Модальное окно для просмотра участников мероприятия */}
      <Dialog open={showEventParticipants} onOpenChange={setShowEventParticipants}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Участники: {selectedEvent?.title} ({selectedEvent && new Date(selectedEvent.date).toLocaleDateString()})
            </DialogTitle>
          </DialogHeader>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Участник</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Комментарий</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedEvent?.participants.map((participant) => (
                <TableRow key={participant.id} className={participant.id === selectedVisitor?.id ? "bg-blue-50" : ""}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {participant.id === selectedVisitor?.id && <span className="text-blue-500">➔</span>}
                      <span className="font-medium">
                        {participant.name} {participant.surname}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select defaultValue={participant.status}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Ожидается</SelectItem>
                        <SelectItem value="attended">Присутствовал</SelectItem>
                        <SelectItem value="no-show">Не явился</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input defaultValue={participant.comment} placeholder="Добавить комментарий..." />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Сохранить
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>

      {/* Модальное окно для управления участником мероприятия */}
      <Dialog open={showParticipantModal} onOpenChange={setShowParticipantModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Управление регистрацией {selectedVisitor?.name} {selectedVisitor?.surname}
            </DialogTitle>
            <DialogDescription>
              {selectedEventData?.title} ({selectedEventData && new Date(selectedEventData.date).toLocaleDateString()})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex flex-col gap-3">
              <Button variant="outline" className="justify-start" onClick={handleMarkAsNoShow}>
                <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
                <span>Отметить как неявку</span>
              </Button>

              <Button variant="outline" className="justify-start" onClick={handleAddComment}>
                <MessageSquare className="h-4 w-4 mr-2 text-blue-500" />
                <span>Добавить комментарий</span>
              </Button>

              <Button variant="outline" className="justify-start" onClick={handleRemoveFromEvent}>
                <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                <span className="text-red-500">Удалить из мероприятия</span>
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowParticipantModal(false)}>
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог для отметки неявки */}
      <Dialog open={showNoShowDialog} onOpenChange={setShowNoShowDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Отметить как неявку</DialogTitle>
            <DialogDescription>
              Посетитель будет отмечен как не явившийся на мероприятие. Вы можете добавить комментарий с причиной
              неявки.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="no-show-comment">Комментарий (необязательно)</Label>
              <Input
                id="no-show-comment"
                placeholder="Укажите причину неявки..."
                value={noShowComment}
                onChange={(e) => setNoShowComment(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNoShowDialog(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={confirmNoShow}>
              Отметить как неявку
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог для добавления комментария */}
      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Добавить комментарий</DialogTitle>
            <DialogDescription>Добавьте комментарий к регистрации посетителя на мероприятие.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="participant-comment">Комментарий</Label>
              <Textarea
                id="participant-comment"
                placeholder="Введите комментарий..."
                value={participantComment}
                onChange={(e) => setParticipantComment(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCommentDialog(false)}>
              Отмена
            </Button>
            <Button onClick={confirmAddComment}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог для подтверждения удаления из мероприятия */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить из мероприятия</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить посетителя из этого мероприятия? Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove} className="bg-red-500 hover:bg-red-600">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

