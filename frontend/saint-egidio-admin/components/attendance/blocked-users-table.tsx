"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Pagination } from "@/components/ui/pagination"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { getBlockedClients } from "@/lib/api/clients"
import type { Client } from "@/lib/types"
import { UnblockUserDialog } from "./unblock-user-dialog"

export function BlockedUsersTable() {
  const [blockedUsers, setBlockedUsers] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 10,
    total: 0,
    totalPages: 0,
  })
  const [userToUnblock, setUserToUnblock] = useState<Client | null>(null)
  const { toast } = useToast()

  const fetchBlockedUsers = async () => {
    setIsLoading(true)
    try {
      const response = await getBlockedClients(pagination.page, pagination.perPage)
      setBlockedUsers(response.clients)
      setPagination({
        page: response.page,
        perPage: response.per_page,
        total: response.total,
        totalPages: response.total_pages,
      })
    } catch (error) {
      console.error("Error fetching blocked users:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список заблокированных пользователей",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBlockedUsers()
  }, [pagination.page, pagination.perPage])

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const handleUnblockSuccess = () => {
    setUserToUnblock(null)
    fetchBlockedUsers()
    toast({
      title: "Успех",
      description: "Пользователь успешно разблокирован",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Заблокированные пользователи</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : blockedUsers.length === 0 ? (
          <div className="rounded-md border p-4 text-center">
            <p className="text-muted-foreground">Нет заблокированных пользователей</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ФИО</TableHead>
                    <TableHead>Дата блокировки</TableHead>
                    <TableHead>Причина</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blockedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        {user.last_name} {user.first_name} {user.middle_name}
                      </TableCell>
                      <TableCell>
                        {user.blocked_at ? format(new Date(user.blocked_at), "dd.MM.yyyy HH:mm", { locale: ru }) : "—"}
                      </TableCell>
                      <TableCell>{user.blocked_reason || "—"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => setUserToUnblock(user)}>
                          Разблокировать
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        )}
      </CardContent>

      {userToUnblock && (
        <UnblockUserDialog
          open={!!userToUnblock}
          onOpenChange={(open) => !open && setUserToUnblock(null)}
          user={userToUnblock}
          onSuccess={handleUnblockSuccess}
        />
      )}
    </Card>
  )
}
