import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Edit, Trash2, Archive, RefreshCw } from "lucide-react"
import { TimeSlot, Service } from "@/types/event"

interface TimeSlotCardProps {
    timeSlot: TimeSlot
    onEdit: () => void
    onDelete: () => void
    onArchive?: () => void
    onActivate?: () => void
    isActive: boolean
    services: Service[]
}

export function TimeSlotCard({
    timeSlot,
    onEdit,
    onDelete,
    onArchive,
    onActivate,
    isActive,
    services
}: TimeSlotCardProps) {
    const startDate = new Date(timeSlot.startDate)
    const endDate = new Date(timeSlot.endDate)

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
        <Card>
            <CardContent className="pt-6">
                <div className="space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-semibold text-lg">{timeSlot.title}</h3>
                            <p className="text-sm text-muted-foreground">{timeSlot.location}</p>
                        </div>
                        <div className="flex gap-2">
                            <Badge variant={timeSlot.type === "recurring" ? "secondary" : "default"}>
                                {timeSlot.type === "recurring" ? "Повторяющийся" : "Разовый"}
                            </Badge>
                            <Badge variant={isActive ? "default" : "secondary"}>
                                {isActive ? "Активный" : "Архивный"}
                            </Badge>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <p className="text-muted-foreground">Дата начала</p>
                                <p>{format(startDate, "PPP")}</p>
                                <p>{format(startDate, "HH:mm")}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Дата окончания</p>
                                <p>{format(endDate, "PPP")}</p>
                                <p>{format(endDate, "HH:mm")}</p>
                            </div>
                        </div>

                        {timeSlot.type === "recurring" && timeSlot.recurrence && (
                            <div className="text-sm">
                                <p className="text-muted-foreground">Повторение</p>
                                <p>{getRecurrenceText(timeSlot.recurrence)}</p>
                            </div>
                        )}

                        <div>
                            <p className="text-sm text-muted-foreground">Общая вместимость</p>
                            <p className="text-sm">{timeSlot.capacity} человек</p>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Услуги</p>
                            <div className="space-y-2">
                                {timeSlot.services.map((service) => (
                                    <div key={service.serviceId} className="text-sm">
                                        <p className="font-medium">{getServiceName(service.serviceId)}</p>
                                        <div className="grid grid-cols-2 gap-2 pl-4">
                                            <p>Вместимость: {service.capacity}</p>
                                            <p>Окно бронирования: {service.bookingWindow} дней</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={onEdit}>
                    <Edit className="h-4 w-4" />
                </Button>
                {isActive ? (
                    <Button variant="outline" size="sm" onClick={onArchive}>
                        <Archive className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button variant="outline" size="sm" onClick={onActivate}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                )}
                <Button variant="outline" size="sm" onClick={onDelete}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    )
} 