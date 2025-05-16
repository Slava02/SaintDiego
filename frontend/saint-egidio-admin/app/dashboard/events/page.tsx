"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Filter, Download } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { EventsTable } from "@/components/events/events-table"
import { EventFilters } from "@/components/events/event-filters"
import { getEvents } from "@/lib/api/events"
import type { Event, EventFilters as EventFiltersType } from "@/lib/types"

export default function EventsPage() {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [pastEvents, setPastEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("upcoming")
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<EventFiltersType>({
    status: "upcoming",
  })
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 20,
    total: 0,
    totalPages: 0,
  })
  const { toast } = useToast()
  const router = useRouter()

  const fetchEvents = async () => {
    setIsLoading(true)
    try {
      // Fetch upcoming events
      const upcomingResponse = await getEvents({ ...filters, status: "upcoming" }, pagination.page, pagination.perPage)
      setUpcomingEvents(upcomingResponse.items)

      if (activeTab === "upcoming") {
        setPagination({
          page: upcomingResponse.page,
          perPage: upcomingResponse.per_page,
          total: upcomingResponse.total,
          totalPages: upcomingResponse.total_pages,
        })
      }

      // Fetch past events
      const pastResponse = await getEvents({ ...filters, status: "past" }, pagination.page, pagination.perPage)
      setPastEvents(pastResponse.items)

      if (activeTab === "past") {
        setPagination({
          page: pastResponse.page,
          perPage: pastResponse.per_page,
          total: pastResponse.total,
          totalPages: pastResponse.total_pages,
        })
      }
    } catch (error) {
      console.error("Error fetching events:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить мероприятия",
        variant: "destructive",
      })

      // If unauthorized, redirect to login
      if ((error as Error).message === "Unauthorized") {
        router.push("/login")
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [filters, pagination.page, pagination.perPage])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setFilters((prev) => ({ ...prev, status: value as "upcoming" | "past" }))
    setPagination((prev) => ({ ...prev, page: 1 })) // Reset to first page on tab change
  }

  const handleFilterChange = (newFilters: EventFiltersType) => {
    setFilters({ ...filters, ...newFilters })
    setPagination((prev) => ({ ...prev, page: 1 })) // Reset to first page on filter change
  }

  const handleActionComplete = () => {
    fetchEvents()
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Управление мероприятиями</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-2 h-4 w-4" />
            Фильтры
          </Button>
        </div>
      </div>

      {showFilters && (
        <EventFilters filters={filters} onFilterChange={handleFilterChange} onClose={() => setShowFilters(false)} />
      )}

      <Tabs defaultValue="upcoming" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">Предстоящие мероприятия</TabsTrigger>
          <TabsTrigger value="past">Прошедшие мероприятия</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <EventsTable
            events={upcomingEvents}
            isLoading={isLoading}
            status="upcoming"
            onActionComplete={handleActionComplete}
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </TabsContent>

        <TabsContent value="past">
          <EventsTable
            events={pastEvents}
            isLoading={isLoading}
            status="past"
            onActionComplete={handleActionComplete}
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
