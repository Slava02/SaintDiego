"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ServiceCard } from "@/components/service-card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Users, MoreVertical, AlertTriangle, MessageSquare, UserMinus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { ParticipantTable } from "@/components/admin/participant-table"
import { useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

export default function ProfilePage() {
  const [showParticipants, setShowParticipants] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [showParticipantModal, setShowParticipantModal] = useState(false)
  const [showNoShowDialog, setShowNoShowDialog] = useState(false)
  const [showCommentDialog, setShowCommentDialog] = useState(false)
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [noShowComment, setNoShowComment] = useState("")
  const [participantComment, setParticipantComment] = useState("")

  // Мок-данные для мероприятий пользователя
  const [userEvents, setUserEvents] = useState([
    {
      id: "1",
      title: "Медицинская консультация",
      type: "medical",
      date: new Date(2025, 2, 10, 10, 0),
      status: "upcoming",
      location: "Цветной",
      comment: "",
    },
    {
      id: "2",
      title: "Выдача одежды",
      type: "clothing",
      date: new Date(2025, 2, 15, 14, 0),
      status: "upcoming",
      location: "Гиляровского",
      comment: "",
    },
    {
      id: "3",
      title: "Консультация психолога",
      type: "psychology",
      date: new Date(2024, 11, 12, 12, 0),
      status: "attended",
      location: "Цветной",
      comment: "Успешно проведена консультация",
    },
    {
      id: "4",
      title: "Юридическая помощь",
      type: "legal",
      date: new Date(2024, 10, 5, 15, 0),
      status: "no-show",
      location: "Ясная",
      comment: "Не явился без предупреждения",
    },
  ])

  // Мок-данные для участников мероприятия
  const mockParticipants = [
    {
      id: "1",
      name: "Виктор",
      surname: "Толстихин",
      phone: "+7 (123) 456-78-90",
      status: "attended",
      comment: "",
    },
    {
      id: "2",
      name: "Анна",
      surname: "Петрова",
      phone: "+7 (987) 654-32-10",
      status: "no-show",
      comment: "Не пришла без предупреждения",
    },
    {
      id: "3",
      name: "Сергей",
      surname: "Иванов",
      phone: "+7 (555) 123-45-67",
      status: "pending",
      comment: "Нужна дополнительная помощь",
    },
  ]

  const handleViewParticipants = (event: any) => {
    setSelectedEvent(event)
    setShowParticipants(true)
  }

  const handleEventAction = (event: any) => {
    setSelectedEvent(event)
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
    if (selectedEvent) {
      // Обновляем локальное состояние для демонстрации
      setUserEvents(
        userEvents.map((event) =>
          event.id === selectedEvent.id ? { ...event, status: "no-show", comment: noShowComment } : event,
        ),
      )

      setShowNoShowDialog(false)
      setShowParticipantModal(false)
    }
  }

  const confirmAddComment = () => {
    if (selectedEvent) {
      // Обновляем локальное состояние для демонстрации
      setUserEvents(
        userEvents.map((event) => (event.id === selectedEvent.id ? { ...event, comment: participantComment } : event)),
      )

      setShowCommentDialog(false)
      setShowParticipantModal(false)
    }
  }

  const confirmRemove = () => {
    if (selectedEvent) {
      // Обновляем локальное состояние для демонстрации
      setUserEvents(userEvents.filter((event) => event.id !== selectedEvent.id))

      setShowRemoveDialog(false)
      setShowParticipantModal(false)
    }
  }

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case "medical":
        return "Медицинская помощь"
      case "clothing":
        return "Выдача одежды"
      case "psychology":
        return "Психологическая помощь"
      case "legal":
        return "Юридическая помощь"
      default:
        return type
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
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span>Назад</span>
        </Link>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Фото посетителя" />
              <AvatarFallback>ВТ</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">Толстихин Виктор Иванович</h1>
              <p className="text-muted-foreground">Карта № 1</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="history" className="w-full">
        <TabsList className="w-full max-w-md mb-6">
          <TabsTrigger value="history" className="flex-1">
            История записей
          </TabsTrigger>
          <TabsTrigger value="services" className="flex-1">
            Доступные услуги
          </TabsTrigger>
          <TabsTrigger value="my-events" className="flex-1">
            Мои мероприятия
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>История записей</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Дата</TableHead>
                    <TableHead>Услуга</TableHead>
                    <TableHead>Статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>2024-03-14 18:00:00</TableCell>
                    <TableCell>Стирка (Цветной)</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                        Запланировано
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2023-09-03 13:00:00</TableCell>
                    <TableCell>Стирка (Гиляровского)</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                        Выполнено
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2023-01-26 19:00:00</TableCell>
                    <TableCell>Просто прийти (Цветной)</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                        Выполнено
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2023-01-27 14:30:00</TableCell>
                    <TableCell>Кормежка (Ясная)</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                        Выполнено
                      </Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <ServiceCard
              title="Стирка (Цветной)"
              description="1 раз в 3 недели"
              image="/placeholder.svg?height=200&width=300"
              href="/booking/1"
            />
            <ServiceCard
              title="Просто прийти (Цветной)"
              description="Указывайте в комментах, если что-то особенное (интернет, стрижка, пр)"
              image="/placeholder.svg?height=200&width=300"
              href="/booking/2"
            />
            <ServiceCard
              title="Одежда (Гиляровского)"
              description="В комментариях указать, в чем конкретно нуждаетесь. Гарантировать наличие не можем!"
              image="/placeholder.svg?height=200&width=300"
              href="/booking/3"
            />
          </div>
        </TabsContent>

        <TabsContent value="my-events">
          <Card>
            <CardHeader>
              <CardTitle>Предстоящие мероприятия</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Дата</TableHead>
                    <TableHead>Мероприятие</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Место</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userEvents
                    .filter((event) => event.status === "upcoming")
                    .map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          {event.date.toLocaleDateString("ru-RU")}{" "}
                          {event.date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                        </TableCell>
                        <TableCell className="font-medium">{event.title}</TableCell>
                        <TableCell>
                          <Badge className={getEventTypeColor(event.type)}>{getEventTypeLabel(event.type)}</Badge>
                        </TableCell>
                        <TableCell>{event.location}</TableCell>
                        <TableCell>{getStatusBadge(event.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end items-center space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => handleViewParticipants(event)}>
                              <Users className="h-4 w-4 mr-2" />
                              Участники
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedEvent(event)
                                    handleMarkAsNoShow()
                                  }}
                                >
                                  <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                                  <span className="text-red-500">Отметить как неявку</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedEvent(event)
                                    setParticipantComment(event.comment || "")
                                    handleAddComment()
                                  }}
                                >
                                  <MessageSquare className="h-4 w-4 mr-2 text-amber-500" />
                                  <span>Добавить комментарий</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedEvent(event)
                                    handleRemoveFromEvent()
                                  }}
                                >
                                  <UserMinus className="h-4 w-4 mr-2 text-gray-500" />
                                  <span>Отменить запись</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  {userEvents.filter((event) => event.status === "upcoming").length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                        Нет предстоящих мероприятий
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Прошедшие мероприятия</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Заменяем таблицу на карточки для прошедших мероприятий */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {userEvents
                  .filter((event) => event.status !== "upcoming")
                  .map((event) => (
                    <Card key={event.id} className="bg-gray-100 opacity-80">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-foreground">{event.title}</h4>
                            {getStatusBadge(event.status)}
                          </div>
                          <div className="text-sm">
                            <p>Дата: {event.date.toLocaleDateString("ru-RU")}</p>
                            <p>
                              Время: {event.date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                            <p>Место: {event.location}</p>
                          </div>
                          <Badge className={getEventTypeColor(event.type)}>{getEventTypeLabel(event.type)}</Badge>
                          {event.comment && (
                            <p className="text-sm mt-2 border-t pt-2">
                              <span className="font-medium">Комментарий:</span> {event.comment}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                {userEvents.filter((event) => event.status !== "upcoming").length === 0 && (
                  <div className="col-span-full text-center py-4 text-muted-foreground border rounded-md">
                    Нет прошедших мероприятий
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Модальное окно для просмотра участников мероприятия */}
      <Dialog open={showParticipants} onOpenChange={setShowParticipants}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Участники: {selectedEvent?.title} ({selectedEvent && new Date(selectedEvent.date).toLocaleDateString()})
            </DialogTitle>
          </DialogHeader>

          <ParticipantTable participants={mockParticipants} onUpdate={() => {}} onRemove={() => {}} />
        </DialogContent>
      </Dialog>

      {/* Диалог для отметки неявки */}
      <Dialog open={showNoShowDialog} onOpenChange={setShowNoShowDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Отметить как неявку</DialogTitle>
            <DialogDescription>
              Вы будете отмечены как не явившийся на мероприятие. Вы можете добавить комментарий с причиной неявки.
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
            <DialogDescription>Добавьте комментарий к вашей записи на мероприятие.</DialogDescription>
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

      {/* Диалог для подтверждения отмены записи */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Отменить запись</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите отменить запись на это мероприятие? Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove} className="bg-red-500 hover:bg-red-600">
              Отменить запись
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

