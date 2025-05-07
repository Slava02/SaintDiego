"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import type { TimeSlot } from "@/lib/types"
import { activateTimeSlot } from "@/lib/api/time-slots"

interface ActivateTimeSlotDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  timeSlot: TimeSlot
  onSuccess: () => void
}

export function ActivateTimeSlotDialog({ open, onOpenChange, timeSlot, onSuccess }: ActivateTimeSlotDialogProps) {
  const [newDate, setNewDate] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!newDate) {
      toast({
        title: "Ошибка",
        description: "Выберите новую дату",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const newDateTime = `${newDate}T00:00:00Z`
      await activateTimeSlot(timeSlot.id, newDateTime)
      onSuccess()
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось активировать временной слот",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Активировать временной слот</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="newDate" className="required">
              Новая дата
            </Label>
            <Input id="newDate" type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} required />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Активация..." : "Активировать"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
