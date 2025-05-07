"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Filter } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { TimeSlotTable } from "@/components/time-slots/time-slot-table"
import { TimeSlotFilters } from "@/components/time-slots/time-slot-filters"
import { CreateTimeSlotDialog } from "@/components/time-slots/create-time-slot-dialog"
import { getTimeSlots } from "@/lib/api/time-slots"
import type { TimeSlot, TimeSlotFilters as TimeSlotFiltersType } from "@/lib/types"

export default function TimeSlotsPage() {
  const [activeTimeSlots, setActiveTimeSlots] = useState<TimeSlot[]>([])
  const [archivedTimeSlots, setArchivedTimeSlots] = useState<TimeSlot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("active")
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<TimeSlotFiltersType>({
    status: "active",
  })
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const fetchTimeSlots = async () => {
    setIsLoading(true)
    try {
      // Fetch active time slots
      const activeSlots = await getTimeSlots({ status: "active", ...filters })
      setActiveTimeSlots(activeSlots)

      // Fetch archived time slots
      const archivedSlots = await getTimeSlots({ status: "archived", ...filters })
      setArchivedTimeSlots(archivedSlots)
    } catch (error) {
      console.error("Error fetching time slots:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить временные слоты",
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
    fetchTimeSlots()
  }, [filters])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setFilters((prev) => ({ ...prev, status: value as "active" | "archived" }))
  }

  const handleCreateSuccess = () => {
    setShowCreateDialog(false)
    fetchTimeSlots()
    toast({
      title: "Успех",
      description: "Временной слот успешно создан",
    })
  }

  const handleFilterChange = (newFilters: TimeSlotFiltersType) => {
    setFilters({ ...filters, ...newFilters })
  }

  const handleActionComplete = () => {
    fetchTimeSlots()
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Расписание</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-2 h-4 w-4" />
            Фильтры
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Создать временной слот
          </Button>
        </div>
      </div>

      {showFilters && (
        <TimeSlotFilters filters={filters} onFilterChange={handleFilterChange} onClose={() => setShowFilters(false)} />
      )}

      <Tabs defaultValue="active" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-4">
          <TabsTrigger value="active">Активные</TabsTrigger>
          <TabsTrigger value="archived">Архивные</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <TimeSlotTable
            timeSlots={activeTimeSlots}
            isLoading={isLoading}
            status="active"
            onActionComplete={handleActionComplete}
          />
        </TabsContent>

        <TabsContent value="archived">
          <TimeSlotTable
            timeSlots={archivedTimeSlots}
            isLoading={isLoading}
            status="archived"
            onActionComplete={handleActionComplete}
          />
        </TabsContent>
      </Tabs>

      <CreateTimeSlotDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleCreateSuccess}
      />
    </div>
  )
}
