import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { List, LogOut } from "lucide-react"
import { Inter } from "next/font/google"
import "../globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Центр социальной поддержки",
  description: "Система администрирования центра социальной поддержки",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <header className="border-b">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
              <Link href="/admin" className="font-bold text-xl">
                Администрирование центра поддержки
              </Link>
              <div className="flex items-center space-x-4">
                <Link href="/">
                  <Button variant="outline" size="sm">
                    <LogOut className="h-4 w-4 mr-2" />
                    Выйти
                  </Button>
                </Link>
              </div>
            </div>
          </header>

          <div className="flex flex-col md:flex-row flex-1">
            <aside className="md:w-64 border-r bg-gray-50">
              <nav className="p-4 space-y-2">
                <Link href="/admin/schedule">
                  <Button variant="ghost" className="w-full justify-start">
                    <List className="h-4 w-4 mr-2" />
                    Расписание
                  </Button>
                </Link>
                <Link href="/admin/events">
                  <Button variant="ghost" className="w-full justify-start">
                    <List className="h-4 w-4 mr-2" />
                    Мероприятия
                  </Button>
                </Link>
              </nav>
            </aside>

            <main className="flex-1 p-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  )
}

