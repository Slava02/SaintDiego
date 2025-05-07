"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Calendar, Users, LogOut, CalendarDays, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/login")
  }

  if (!isClient) {
    return null
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 border-r bg-white">
        <div className="flex h-16 items-center border-b px-4">
          <h1 className="text-lg font-bold">
            Администрирование
            <br />
            центра поддержки
          </h1>
        </div>
        <nav className="space-y-1 p-2">
          <Link href="/dashboard/time-slots">
            <Button variant="ghost" className="w-full justify-start">
              <Calendar className="mr-2 h-5 w-5" />
              Расписание
            </Button>
          </Link>
          <Link href="/dashboard/events">
            <Button variant="ghost" className="w-full justify-start">
              <CalendarDays className="mr-2 h-5 w-5" />
              Мероприятия
            </Button>
          </Link>
          <Link href="/dashboard/attendance">
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="mr-2 h-5 w-5" />
              Настройки посещаемости
            </Button>
          </Link>
        </nav>
        <div className="absolute bottom-0 w-64 border-t p-4">
          <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="mr-2 h-5 w-5" />
            Выйти
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
