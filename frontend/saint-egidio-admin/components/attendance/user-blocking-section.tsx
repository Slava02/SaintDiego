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
import { getClient } from "@/lib/api/clients"
import type { Client } from "@/lib/types"
import { BlockUserDialog } from "./block-user-dialog"

export function UserBlockingSection() {
  const [clientId, setClientId] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResult, setSearchResult] = useState<Client | null>(null)
  const [userToBlock, setUserToBlock] = useState<Client | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSearch = async () => {
    if (!clientId.trim()) return

    const id = Number.parseInt(clientId.trim(), 10)
    if (isNaN(id)) {
      setError("ID должен быть числом")
      return
    }

    setIsSearching(true)
    setError(null)
    try {
      const client = await getClient(id)
      setSearchResult(client)
    } catch (error) {
      if ((error as Error).message === "Client not found") {
        setError("Клиент с указанным ID не найден")
      } else {
        toast({
          title: "Ошибка",
          description: "Не удалось выполнить поиск клиента",
          variant: "destructive",
        })
      }
      setSearchResult(null)
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
    // Обновляем результат поиска
    if (searchResult) {
      handleSearch()
    }
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
                placeholder="Введите ID клиента"
                type="number"
                value={clientId}
                onChange={(e) => {
                  setClientId(e.target.value)
                  setError(null)
                }}
                onKeyDown={handleKeyDown}
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching || !clientId.trim()}>
              {isSearching ? "Поиск..." : "Поиск"}
            </Button>
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-center text-red-800">
              <p>{error}</p>
            </div>
          )}

          {isSearching ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
            </div>
          ) : searchResult ? (
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
                  <TableRow>
                    <TableCell>{searchResult.id}</TableCell>
                    <TableCell>
                      {searchResult.last_name} {searchResult.first_name} {searchResult.middle_name}
                    </TableCell>
                    <TableCell>
                      {searchResult.is_blocked ? (
                        <span className="text-red-600">Заблокирован</span>
                      ) : (
                        <span className="text-green-600">Активен</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {!searchResult.is_blocked && (
                        <Button variant="destructive" size="sm" onClick={() => setUserToBlock(searchResult)}>
                          Заблокировать
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          ) : clientId && !error ? (
            <div className="rounded-md border p-4 text-center">
              <p className="text-muted-foreground">Введите ID клиента и нажмите "Поиск"</p>
            </div>
          ) : null}
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
