import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"
import { TimeSlot } from "@/types/event"

interface ActivateTimeSlotModalProps {
    timeSlot: TimeSlot
    open: boolean
    onClose: () => void
    onConfirm: (timeSlot: TimeSlot, newStartDate: string) => void
}

export function ActivateTimeSlotModal({
    timeSlot,
    open,
    onClose,
    onConfirm,
}: ActivateTimeSlotModalProps) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
    const [selectedTime, setSelectedTime] = useState(format(new Date(), "HH:mm"))

    const handleConfirm = () => {
        if (!selectedDate) return

        const [hours, minutes] = selectedTime.split(":").map(Number)
        const newStartDate = new Date(selectedDate)
        newStartDate.setHours(hours, minutes)

        onConfirm(timeSlot, newStartDate.toISOString())
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Активировать временной слот</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Выберите новую дату начала</Label>
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            initialFocus
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="startTime">Время начала</Label>
                        <Input
                            id="startTime"
                            type="time"
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex justify-end space-x-4">
                    <Button variant="outline" onClick={onClose}>
                        Отмена
                    </Button>
                    <Button onClick={handleConfirm}>Активировать</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
} 