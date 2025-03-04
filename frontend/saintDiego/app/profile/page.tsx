import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ServiceCard } from "@/components/service-card"
import { ChevronLeft } from "lucide-react"

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span>Назад</span>
        </Link>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Фото посетителя" />
              <AvatarFallback>ВТ</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">Толстихин Виктор Иванович</h1>
              <p className="text-muted-foreground">Карта № 1</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="history" className="w-full">
        <TabsList className="w-full max-w-md mb-6">
          <TabsTrigger value="history" className="flex-1">
            История записей
          </TabsTrigger>
          <TabsTrigger value="services" className="flex-1">
            Доступные услуги
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>История записей</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Дата</TableHead>
                    <TableHead>Услуга</TableHead>
                    <TableHead>Статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>2024-03-14 18:00:00</TableCell>
                    <TableCell>Стирка (Цветной)</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                        Запланировано
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2023-09-03 13:00:00</TableCell>
                    <TableCell>Стирка (Гиляровского)</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                        Выполнено
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2023-01-26 19:00:00</TableCell>
                    <TableCell>Просто прийти (Цветной)</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                        Выполнено
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2023-01-27 14:30:00</TableCell>
                    <TableCell>Кормежка (Ясная)</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                        Выполнено
                      </Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <ServiceCard
              title="Стирка (Цветной)"
              description="1 раз в 3 недели"
              image="/placeholder.svg?height=200&width=300"
              href="/booking/1"
            />
            <ServiceCard
              title="Просто прийти (Цветной)"
              description="Указывайте в комментах, если что-то особенное (интернет, стрижка, пр)"
              image="/placeholder.svg?height=200&width=300"
              href="/booking/2"
            />
            <ServiceCard
              title="Одежда (Гиляровского)"
              description="В комментариях указать, в чем конкретно нуждаетесь. Гарантировать наличие не можем!"
              image="/placeholder.svg?height=200&width=300"
              href="/booking/3"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

