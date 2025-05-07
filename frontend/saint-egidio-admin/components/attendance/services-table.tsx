"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { PlusCircle, Edit, Trash } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Pagination } from "@/components/ui/pagination"
import { getServices } from "@/lib/api/services"
import type { ServiceType } from "@/lib/types"
import { EditServiceDialog } from "./edit-service-dialog"
import { ConfigureServiceDialog } from "./configure-service-dialog"
import { SelectServiceDialog } from "./select-service-dialog"

export function ServicesTable() {
  const [services, setServices] = useState<ServiceType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 20,
    total: 0,
    totalPages: 0,
  })
  const [serviceToEdit, setServiceToEdit] = useState<ServiceType | null>(null)
  const [showSelectDialog, setShowSelectDialog] = useState(false)
  const [serviceToConfig, setServiceToConfig] = useState<ServiceType | null>(null)
  const { toast } = useToast()

  const fetchServices = async () => {
    setIsLoading(true)
    try {
      const response = await getServices(pagination.page, pagination.perPage, true)
      setServices(response.items)
      setPagination({
        page: response.page,
        perPage: response.per_page,
        total: response.total,
        totalPages: response.total_pages,
      })
    } catch (error) {
      console.error("Error fetching services:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список услуг",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [pagination.page, pagination.perPage])

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const handleEditSuccess = () => {
    setServiceToEdit(null)
    fetchServices()
    toast({
      title: "Успех",
      description: "Услуга успешно обновлена",
    })
  }

  const handleSelectService = (service: ServiceType) => {
    setShowSelectDialog(false)
    setServiceToConfig(service)
  }

  const handleConfigSuccess = () => {
    setServiceToConfig(null)
    fetchServices()
    toast({
      title: "Успех",
      description: "Услуга успешно настроена",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-xl font-semibold">Настройки услуг</h2>
        <Button onClick={() => setShowSelectDialog(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Настроить услугу
        </Button>
      </div>

      <div className="rounded-md border">
        {isLoading ? (
          <div className="p-4">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          </div>
        ) : services.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Нет доступных услуг</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название услуги</TableHead>
                <TableHead>Ограничение (дней)</TableHead>
                <TableHead>Регистрация доступна</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>{service.min_period_days}</TableCell>
                  <TableCell>
                    {service.registration_available ? (
                      <Badge className="bg-green-100 text-green-800">Да</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800">Нет</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => setServiceToEdit(service)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Редактировать</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={handlePageChange} />
      )}

      {serviceToEdit && (
        <EditServiceDialog
          open={!!serviceToEdit}
          onOpenChange={(open) => !open && setServiceToEdit(null)}
          service={serviceToEdit}
          onSuccess={handleEditSuccess}
        />
      )}

      {serviceToConfig && (
        <ConfigureServiceDialog
          open={!!serviceToConfig}
          onOpenChange={(open) => !open && setServiceToConfig(null)}
          service={serviceToConfig}
          onSuccess={handleConfigSuccess}
        />
      )}

      <SelectServiceDialog
        open={showSelectDialog}
        onOpenChange={setShowSelectDialog}
        onSelectService={handleSelectService}
      />
    </div>
  )
}
