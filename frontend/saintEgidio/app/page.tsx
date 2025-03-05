import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Выберите тип посетителя:</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="existing" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="existing">Зарегистрированный посетитель</TabsTrigger>
              <TabsTrigger value="new">Новый посетитель</TabsTrigger>
            </TabsList>
            <TabsContent value="existing" className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="card" className="text-sm font-medium">
                  Карта №
                </label>
                <Input id="card" placeholder="Введите номер карты" />
              </div>
              <div className="space-y-2">
                <label htmlFor="surname" className="text-sm font-medium">
                  или Фамилия
                </label>
                <Input id="surname" placeholder="Введите фамилию" />
              </div>
              <Link href="/profile" className="w-full block">
                <Button className="w-full bg-teal-500 hover:bg-teal-600">Найти посетителя</Button>
              </Link>
            </TabsContent>
            <TabsContent value="new">
              <Link href="/register" className="w-full block">
                <Button className="w-full bg-teal-500 hover:bg-teal-600">Новый посетитель</Button>
              </Link>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

