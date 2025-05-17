"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PlusCircle, Filter } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { TimeSlotTable } from "@/components/time-slots/time-slot-table"
import { TimeSlotFilters } from "@/components/time-slots/time-slot-filters"
import { CreateTimeSlotDialog } from "@/components/time-slots/create-time-slot-dialog"
import { getTimeSlots } from "@/lib/api/time-slots"
import type { TimeSlot, TimeSlotFilters as TimeSlotFiltersType } from "@/lib/types"

export default function TimeSlotsPage() {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<TimeSlotFiltersType>({})
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const fetchTimeSlots = async () => {
    setIsLoading(true)
    try {
      console.log("Fetching time slots with filters:", filters)

      // Fetch all time slots
      const slots = await getTimeSlots(filters)
      setTimeSlots(slots)
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

  const handleCreateSuccess = () => {
    setShowCreateDialog(false)
    fetchTimeSlots()
    toast({
      title: "Успех",
      description: "Временной слот успешно создан",
    })
  }

  const handleFilterChange = (newFilters: TimeSlotFiltersType) => {
    console.log("Filter change:", newFilters)

    // Apply new filters
    setFilters({ ...newFilters })

    // Force a data refresh
    setTimeout(() => {
      fetchTimeSlots()
    }, 0)
  }

  const handleActionComplete = () => {
    // Add a delay before refreshing to allow backend to complete the operation
    setTimeout(() => {
      fetchTimeSlots()
    }, 500)
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

      <TimeSlotTable timeSlots={timeSlots} isLoading={isLoading} onActionComplete={handleActionComplete} />

      <CreateTimeSlotDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleCreateSuccess}
      />
    </div>
  )
}
