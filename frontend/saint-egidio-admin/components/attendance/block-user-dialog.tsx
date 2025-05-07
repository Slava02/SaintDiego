"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import type { Client, BlockClientRequest } from "@/lib/types"
import { blockClient } from "@/lib/api/clients"

interface BlockUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: Client
  onSuccess: () => void
}

export function BlockUserDialog({ open, onOpenChange, user, onSuccess }: BlockUserDialogProps) {
  const [reason, setReason] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast({
        title: "Ошибка",
        description: "Укажите причину блокировки",
        variant: "destructive",
      })
      return
    }

    const blockData: BlockClientRequest = {
      is_blocked: true,
      block_reason: reason.trim(),
    }

    setIsLoading(true)
    try {
      await blockClient(user.id, blockData)
      onSuccess()
      setReason("")
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось заблокировать пользователя",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Блокировка пользователя</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <p>
              Вы собираетесь заблокировать пользователя:{" "}
              <span className="font-medium">
                {user.last_name} {user.first_name} {user.middle_name}
              </span>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="block-reason" className="required">
              Причина блокировки
            </Label>
            <Textarea
              id="block-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Укажите причину блокировки"
              rows={3}
              required
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Блокировка..." : "Заблокировать"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
