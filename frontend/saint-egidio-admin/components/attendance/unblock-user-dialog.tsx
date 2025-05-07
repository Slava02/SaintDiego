"use client"

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
import { useToast } from "@/components/ui/use-toast"
import { useState } from "react"
import type { Client, BlockClientRequest } from "@/lib/types"
import { blockClient } from "@/lib/api/clients"

interface UnblockUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: Client
  onSuccess: () => void
}

export function UnblockUserDialog({ open, onOpenChange, user, onSuccess }: UnblockUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleUnblock = async () => {
    const unblockData: BlockClientRequest = {
      is_blocked: false,
    }

    setIsLoading(true)
    try {
      await blockClient(user.id, unblockData)
      onSuccess()
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось разблокировать пользователя",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Разблокировать пользователя?</AlertDialogTitle>
          <AlertDialogDescription>
            Вы собираетесь разблокировать пользователя:{" "}
            <span className="font-medium">
              {user.last_name} {user.first_name} {user.middle_name}
            </span>
            <br />
            После разблокировки пользователь сможет снова регистрироваться на мероприятия.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction onClick={handleUnblock} disabled={isLoading}>
            {isLoading ? "Разблокировка..." : "Разблокировать"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
