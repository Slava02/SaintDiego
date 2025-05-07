"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { getClients } from "@/lib/api/clients"
import type { Client } from "@/lib/types"
import { BlockUserDialog } from "./block-user-dialog"

export function UserBlockingSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<Client[]>([])
  const [userToBlock, setUserToBlock] = useState<Client | null>(null)
  const { toast } = useToast()

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const response = await getClients(1, 10, searchQuery.trim())
      setSearchResults(response.clients)
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось выполнить поиск пользователей",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleBlockSuccess = () => {
    setUserToBlock(null)
    setSearchResults((prev) =>
      prev.map((user) =>
        user.id === userToBlock?.id ? { ...user, is_blocked: true } : user
      )
    )
    toast({
      title: "Успех",
      description: "Пользователь успешно заблокирован",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Поиск пользователей</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по ФИО или ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
              {isSearching ? "Поиск..." : "Поиск"}
            </Button>
          </div>

          {isSearching ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : searchResults.length === 0 ? (
            <div className="rounded-md border p-4 text-center">
              <p className="text-muted-foreground">
                {searchQuery ? "Пользователи не найдены" : "Введите запрос для поиска пользователей"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>ФИО</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchResults.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>{client.id}</TableCell>
                      <TableCell>
                        {client.last_name} {client.first_name} {client.middle_name}
                      </TableCell>
                      <TableCell>
                        {client.is_blocked ? (
                          <span className="text-red-600">Заблокирован</span>
                        ) : (
                          <span className="text-green-600">Активен</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {!client.is_blocked && (
                          <Button variant="destructive" size="sm" onClick={() => setUserToBlock(client)}>
                            Заблокировать
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>

      {userToBlock && (
        <BlockUserDialog
          open={!!userToBlock}
          onOpenChange={(open) => !open && setUserToBlock(null)}
          user={userToBlock}
          onSuccess={handleBlockSuccess}
        />
      )}
    </Card>
  )
}
