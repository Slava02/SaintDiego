"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"
import { getLocations } from "@/lib/api/locations"
import { getServices } from "@/lib/api/services"
import type { EventFilters as EventFiltersType, Location, ServiceType } from "@/lib/types"

interface EventFiltersProps {
  filters: EventFiltersType
  onFilterChange: (filters: EventFiltersType) => void
  onClose: () => void
}

export function EventFilters({ filters, onFilterChange, onClose }: EventFiltersProps) {
  const [locations, setLocations] = useState<Location[]>([])
  const [services, setServices] = useState<ServiceType[]>([])
  const [participantSearch, setParticipantSearch] = useState("")
  const [fromDate, setFromDate] = useState<string>("")
  const [toDate, setToDate] = useState<string>("")
  const [selectedService, setSelectedService] = useState<string>("")
  const [selectedLocation, setSelectedLocation] = useState<string>("")

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [locationsData, servicesData] = await Promise.all([getLocations(), getServices()])
        setLocations(locationsData)
        setServices(servicesData.items)
      } catch (error) {
        console.error("Error fetching filter data:", error)
      }
    }

    fetchFilterData()

    // Initialize form values from filters
    if (filters.from_date) {
      setFromDate(filters.from_date.split("T")[0])
    }
    if (filters.to_date) {
      setToDate(filters.to_date.split("T")[0])
    }
    if (filters.service_id) {
      setSelectedService(filters.service_id.toString())
    }
    if (filters.location_id) {
      setSelectedLocation(filters.location_id.toString())
    }
  }, [filters])

  const handleApplyFilters = () => {
    const newFilters: EventFiltersType = {
      ...filters,
    }

    if (fromDate) {
      newFilters.from_date = `${fromDate}T00:00:00Z`
    } else {
      delete newFilters.from_date
    }

    if (toDate) {
      newFilters.to_date = `${toDate}T23:59:59Z`
    } else {
      delete newFilters.to_date
    }

    if (selectedService) {
      newFilters.service_id = Number(selectedService)
    } else {
      delete newFilters.service_id
    }

    if (selectedLocation) {
      newFilters.location_id = Number(selectedLocation)
    } else {
      delete newFilters.location_id
    }

    // Добавляем participant_id, если введено значение
    if (participantSearch && !isNaN(Number(participantSearch))) {
      newFilters.participant_id = Number(participantSearch)
    } else {
      delete newFilters.participant_id
    }

    onFilterChange(newFilters)
  }

  const handleResetFilters = () => {
    setFromDate("")
    setToDate("")
    setSelectedService("")
    setSelectedLocation("")
    setParticipantSearch("")
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
            <Label htmlFor="serviceType">Тип услуги:</Label>
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger id="serviceType">
                <SelectValue placeholder="Все типы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все типы</SelectItem>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id.toString()}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Место:</Label>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger id="location">
                <SelectValue placeholder="Все места" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все места</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id.toString()}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fromDate">Дата с:</Label>
            <Input id="fromDate" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="toDate">Дата по:</Label>
            <Input id="toDate" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="participantSearch">Поиск по участнику:</Label>
            <Input
              id="participantSearch"
              type="number"
              min={1}
              placeholder="Найти мероприятия по участнику (ID)"
              value={participantSearch}
              onChange={(e) => setParticipantSearch(e.target.value)}
            />
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
