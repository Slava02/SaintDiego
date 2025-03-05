import Link from "next/link"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, List, Users } from "lucide-react"

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Панель управления</h1>
      <p className="text-muted-foreground">Добро пожаловать в панель администрирования центра социальной поддержки.</p>

      <div className="grid gap-6 md:grid-cols-3">
        <Link href="/admin/schedule">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CalendarIcon className="h-8 w-8 text-blue-500" />
              <CardTitle className="mt-2">Расписание</CardTitle>
              <CardDescription>Управление календарем мероприятий</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/events">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <List className="h-8 w-8 text-green-500" />
              <CardTitle className="mt-2">Мероприятия</CardTitle>
              <CardDescription>Список мероприятий и участников</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/visitors">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <Users className="h-8 w-8 text-orange-500" />
              <CardTitle className="mt-2">Посетители</CardTitle>
              <CardDescription>Управление данными посетителей</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  )
}

