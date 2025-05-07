"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ServicesTable } from "@/components/attendance/services-table"
import { BlockedUsersTable } from "@/components/attendance/blocked-users-table"
import { UserBlockingSection } from "@/components/attendance/user-blocking-section"

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState("services")

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-2xl font-bold">Управление посещаемостью</h1>

      <Tabs defaultValue="services" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="services">Настройки услуг</TabsTrigger>
          <TabsTrigger value="blocking">Блокировка пользователей</TabsTrigger>
        </TabsList>

        <TabsContent value="services">
          <ServicesTable />
        </TabsContent>

        <TabsContent value="blocking">
          <div className="space-y-8">
            <UserBlockingSection />
            <BlockedUsersTable />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
