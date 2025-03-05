"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Calendar } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface Participant {
  id: string
  name: string
  surname: string
  cardNumber: string
  events?: Array<{
    id: string
    title: string
    date: Date
    type: string
  }>
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Participant[]>([])
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null)

  // Mock participants data
  const mockParticipants: Participant[] = [
    {
      id: "1",
      name: "Виктор",
      surname: "Толстихин",
      cardNumber: "001",
      events: [
        {
          id: "1",
          title: "Медицинская консультация",
          date: new Date(2025, 2, 10, 10, 0),
          type: "medical",
        },
        {
          id: "2",
          title: "Выдача одежды",
          date: new Date(2025, 2, 15, 14, 0),
          type: "clothing",
        },
      ],
    },
    {
      id: "2",
      name: "Анна",
      surname: "Петрова",
      cardNumber: "002",
      events: [
        {
          id: "3",
          title: "Консультация психолога",
          date: new Date(2025, 2, 12, 12, 0),
          type: "psychology",
        },
      ],
    },
    {
      id: "3",
      name: "Сергей",
      surname: "Иванов",
      cardNumber: "003",
      events: [],
    },
  ]

  const handleSearch = (query: string) => {
    setSearchQuery(query)

    if (query.length < 2) {
      setSearchResults([])
      setShowSearchDropdown(false)
      return
    }

    const filteredResults = mockParticipants.filter((participant) => {
      const fullName = `${participant.name} ${participant.surname}`.toLowerCase()
      return fullName.includes(query.toLowerCase()) || participant.cardNumber.includes(query)
    })

    setSearchResults(filteredResults)
    setShowSearchDropdown(filteredResults.length > 0)
  }

  const handleSelectParticipant = (participant: Participant) => {
    setSelectedParticipant(participant)
    setShowSearchDropdown(false)
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "medical":
        return "bg-blue-100 text-blue-800"
      case "clothing":
        return "bg-green-100 text-green-800"
      case "psychology":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Поиск посетителей</h1>

      <Card>
        <CardHeader>
          <CardTitle>Поиск по имени или номеру карты</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="flex">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Введите имя, фамилию или номер карты..."
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
                      {searchResults.map((participant) => (
                        <CommandItem
                          key={participant.id}
                          onSelect={() => handleSelectParticipant(participant)}
                          className="cursor-pointer"
                        >
                          <div>
                            <div className="font-medium">
                              {participant.name} {participant.surname}
                            </div>
                            <div className="text-sm text-muted-foreground">Карта №{participant.cardNumber}</div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {selectedParticipant && (
        <Card>
          <CardHeader>
            <CardTitle>Информация о посетителе</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Личные данные</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Имя:</span>
                      <span className="font-medium">{selectedParticipant.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Фамилия:</span>
                      <span className="font-medium">{selectedParticipant.surname}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Номер карты:</span>
                      <span className="font-medium">{selectedParticipant.cardNumber}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Действия</h3>
                  <div className="space-y-2">
                    <Link href={`/profile?id=${selectedParticipant.id}`}>
                      <Button variant="outline" className="w-full justify-start">
                        Просмотр профиля
                      </Button>
                    </Link>
                    <Link href={`/admin/users/edit/${selectedParticipant.id}`}>
                      <Button variant="outline" className="w-full justify-start">
                        Редактировать данные
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Мероприятия посетителя</h3>

                {selectedParticipant.events && selectedParticipant.events.length > 0 ? (
                  <div className="space-y-4">
                    {selectedParticipant.events.map((event) => (
                      <div key={event.id} className="border rounded-md p-3 flex justify-between items-center">
                        <div>
                          <div className="font-medium">{event.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {event.date.toLocaleString("ru-RU", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <Badge className={`mt-1 ${getEventTypeColor(event.type)}`}>{event.type}</Badge>
                        </div>
                        <Link href={`/admin/events?eventId=${event.id}`}>
                          <Button size="sm" variant="ghost">
                            <Calendar className="h-4 w-4 mr-2" />
                            Подробнее
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6 border rounded-md text-muted-foreground">
                    У посетителя нет запланированных мероприятий
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

