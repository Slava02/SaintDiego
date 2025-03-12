import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Edit, Trash2, Archive, RefreshCw } from "lucide-react"
import { TimeSlot, Service } from "@/types/event"

interface TimeSlotTableProps {
    timeSlots: TimeSlot[]
    onEdit: (timeSlot: TimeSlot) => void
    onDelete: (timeSlotId: string) => void
    onArchive?: (timeSlotId: string) => void
    onActivate?: (timeSlot: TimeSlot) => void
    isActive: boolean
    services: Service[]
}

export function TimeSlotTable({
    timeSlots,
    onEdit,
    onDelete,
    onArchive,
    onActivate,
    isActive,
    services
}: TimeSlotTableProps) {
    const getServiceName = (serviceId: string) => {
        return services.find(s => s.id === serviceId)?.name || serviceId
    }

    const getRecurrenceText = (recurrence: NonNullable<TimeSlot['recurrence']>) => {
        const frequencyText = {
            daily: "Ежедневно",
            weekly: "Еженедельно",
            monthly: "Ежемесячно"
        }[recurrence.frequency]

        const intervalText = recurrence.interval > 1
            ? ` каждые ${recurrence.interval} ${recurrence.frequency === "daily" ? "дней" :
                recurrence.frequency === "weekly" ? "недель" :
                    "месяцев"
            }`
            : ""

        const endText = recurrence.endType === "never"
            ? "бессрочно"
            : recurrence.endValue
                ? `до ${format(new Date(recurrence.endValue), "PPP")}`
                : "бессрочно"

        return `${frequencyText}${intervalText} (${endText})`
    }

    return (
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
                    {timeSlots.map((timeSlot) => {
                        const startDate = new Date(timeSlot.startDate)
                        const endDate = new Date(timeSlot.endDate)

                        return (
                            <TableRow key={timeSlot.id}>
                                <TableCell className="font-medium">{timeSlot.title}</TableCell>
                                <TableCell>
                                    <Badge variant={timeSlot.type === "recurring" ? "secondary" : "default"}>
                                        {timeSlot.type === "recurring" ? "Повторяющийся" : "Разовый"}
                                    </Badge>
                                </TableCell>
                                <TableCell>{timeSlot.location}</TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <p className="text-sm">
                                            {format(startDate, "PPP")}
                                            {timeSlot.type === "recurring" && timeSlot.recurrence && (
                                                <span className="block text-xs text-muted-foreground">
                                                    {getRecurrenceText(timeSlot.recurrence)}
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {format(startDate, "HH:mm")} - {format(endDate, "HH:mm")}
                                        </p>
                                    </div>
                                </TableCell>
                                <TableCell>{timeSlot.capacity}</TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        {timeSlot.services.map((service) => (
                                            <div key={service.serviceId} className="text-sm">
                                                <p>{getServiceName(service.serviceId)}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Время: {service.time}, Вместимость: {service.capacity}, Окно: {service.bookingWindow} дней
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" size="sm" onClick={() => onEdit(timeSlot)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        {isActive ? (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onArchive?.(timeSlot.id)}
                                            >
                                                <Archive className="h-4 w-4" />
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onActivate?.(timeSlot)}
                                            >
                                                <RefreshCw className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onDelete(timeSlot.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
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