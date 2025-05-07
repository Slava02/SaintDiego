"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import type { TimeSlotFilters as TimeSlotFiltersType } from "@/lib/types"

interface TimeSlotFiltersProps {
  filters: TimeSlotFiltersType
  onFilterChange: (filters: TimeSlotFiltersType) => void
  onClose: () => void
}

export function TimeSlotFilters({ filters, onFilterChange, onClose }: TimeSlotFiltersProps) {
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")

  useEffect(() => {
    if (filters.startDate) {
      setStartDate(filters.startDate.split("T")[0])
    }
    if (filters.endDate) {
      setEndDate(filters.endDate.split("T")[0])
    }
  }, [filters])

  const handleApplyFilters = () => {
    const newFilters: TimeSlotFiltersType = {
      ...filters,
    }

    if (startDate) {
      newFilters.startDate = `${startDate}T00:00:00Z`
    } else {
      delete newFilters.startDate
    }

    if (endDate) {
      newFilters.endDate = `${endDate}T23:59:59Z`
    } else {
      delete newFilters.endDate
    }

    onFilterChange(newFilters)
  }

  const handleResetFilters = () => {
    setStartDate("")
    setEndDate("")
    onFilterChange({ status: filters.status })
  }

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Фильтры</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="startDate">Дата начала</Label>
            <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">Дата окончания</Label>
            <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleResetFilters}>
          Сбросить
        </Button>
        <Button onClick={handleApplyFilters}>Применить</Button>
      </CardFooter>
    </Card>
  )
}
