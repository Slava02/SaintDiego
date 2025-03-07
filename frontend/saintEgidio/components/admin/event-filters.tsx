"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search, Users } from "lucide-react"
import { EventFiltersState } from "@/types/event"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"

interface EventFiltersProps {
    filters: EventFiltersState
    onFiltersChange: (filters: EventFiltersState) => void
}

export function EventFilters({ filters, onFiltersChange }: EventFiltersProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [showParticipantResults, setShowParticipantResults] = useState(false)

    // Мок-данные для участников
    const mockParticipants = [
        { id: "p1", name: "Виктор Толстихин" },
        { id: "p2", name: "Анна Петрова" },
        { id: "p3", name: "Сергей Иванов" },
        { id: "p4", name: "Елена Смирнова" },
        { id: "p5", name: "Алексей Козлов" },
    ]

    const [filteredParticipants, setFilteredParticipants] = useState(mockParticipants)

    const handleEventTypeChange = (eventType: EventFiltersState["eventType"]) => {
        onFiltersChange({ ...filters, eventType })
    }

    const handlePlaceChange = (place: EventFiltersState["place"]) => {
        onFiltersChange({ ...filters, place })
    }

    const handleParticipantSearch = (query: string) => {
        setSearchQuery(query)

        if (query.length < 2) {
            setFilteredParticipants([])
            setShowParticipantResults(false)
            return
        }

        const filtered = mockParticipants.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))

        setFilteredParticipants(filtered)
        setShowParticipantResults(filtered.length > 0)
    }

    const handleSelectParticipant = (participant: { id: string; name: string }) => {
        onFiltersChange({ ...filters, participant: participant.id })
        setSearchQuery(participant.name)
        setShowParticipantResults(false)
    }

    const clearParticipantFilter = () => {
        onFiltersChange({ ...filters, participant: "" })
        setSearchQuery("")
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label>Тип услуги:</Label>
                <Select value={filters.eventType} onValueChange={handleEventTypeChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Выберите тип услуги" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Все типы</SelectItem>
                        <SelectItem value="medical">Медицинская помощь</SelectItem>
                        <SelectItem value="clothing">Выдача одежды</SelectItem>
                        <SelectItem value="psychology">Консультация психолога</SelectItem>
                        <SelectItem value="legal">Юридическая помощь</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Место:</Label>
                <Select value={filters.place} onValueChange={handlePlaceChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Выберите место" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Все места</SelectItem>
                        <SelectItem value="Цветной">Цветной</SelectItem>
                        <SelectItem value="Гиляровского">Гиляровского</SelectItem>
                        <SelectItem value="Ясная">Ясная</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="md:col-span-2">
                <Label>Поиск по участнику:</Label>
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Найти мероприятия по участнику (ФИО, ID)"
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => handleParticipantSearch(e.target.value)}
                    />
                    {filters.participant && (
                        <button
                            className="absolute right-2 top-1.5 text-gray-500 hover:text-gray-700"
                            onClick={clearParticipantFilter}
                        >
                            ✕
                        </button>
                    )}
                </div>

                {showParticipantResults && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border">
                        <Command>
                            <CommandList>
                                <CommandEmpty>Ничего не найдено</CommandEmpty>
                                <CommandGroup>
                                    {filteredParticipants.map((participant) => (
                                        <CommandItem
                                            key={participant.id}
                                            onSelect={() => handleSelectParticipant(participant)}
                                            className="cursor-pointer"
                                        >
                                            <div className="flex items-center">
                                                <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                                                <span>{participant.name}</span>
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
    )
} 