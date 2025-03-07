"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Users } from "lucide-react"
import { format } from "date-fns"
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { Event, Service } from "@/types/event"

interface EventListProps {
    events: Event[]
    onEdit: (event: Event) => void
    onDelete: (eventId: string) => void
    onViewParticipants: (event: Event) => void
}

export function EventList({ events, onEdit, onDelete, onViewParticipants }: EventListProps) {
    const formatDate = (date: Date) => {
        try {
            return format(date, "dd.MM.yyyy HH:mm")
        } catch (error) {
            console.error("Error formatting date:", error)
            return "Некорректная дата"
        }
    }

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-gray-50">
                        <TableHead>Название</TableHead>
                        <TableHead>Дата и время</TableHead>
                        <TableHead>Место</TableHead>
                        <TableHead>Участники</TableHead>
                        <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {events.map((event) => {
                        const totalRegistered = event.services.reduce((sum, service) => sum + service.registered, 0)
                        const totalCapacity = event.services.reduce((sum, service) => sum + service.capacity, 0)
                        const isFull = totalRegistered >= totalCapacity

                        return (
                            <TableRow key={event.id} className="hover:bg-gray-50 transition-colors">
                                <TableCell className="font-medium">
                                    <div>
                                        {event.title}
                                        {event.type === "recurring" && (
                                            <div className="flex items-center text-xs text-blue-600 mt-1">
                                                <span>Повторяющееся мероприятие</span>
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>{formatDate(event.start)}</TableCell>
                                <TableCell>{event.place}</TableCell>
                                <TableCell className={cn(isFull ? "text-red-600 font-medium" : "")}>
                                    {totalRegistered}/{totalCapacity}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" size="sm" onClick={() => onViewParticipants(event)}>
                                            <Users className="h-4 w-4 mr-2" />
                                            Участники
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    Действия
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onEdit(event)}>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Редактировать
                                                </DropdownMenuItem>

                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem className="text-red-600">
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Удалить
                                                        </DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                {totalRegistered > 0 ? (
                                                                    <>
                                                                        На мероприятии зарегистрировано {totalRegistered} участников. Удалить его?
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        Это действие удалит мероприятие "{event.title}" и все связанные с ним данные. Это
                                                                        действие нельзя отменить.
                                                                    </>
                                                                )}
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => onDelete(event.id)}
                                                                className="bg-red-600 hover:bg-red-700"
                                                            >
                                                                Удалить
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
} 