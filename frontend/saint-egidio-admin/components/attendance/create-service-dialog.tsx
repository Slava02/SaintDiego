"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { getAllServices } from "@/lib/api/services"
import type { ServiceType } from "@/lib/types"

interface SelectServiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectService: (service: ServiceType) => void
}

export function SelectServiceDialog({ open, onOpenChange, onSelectService }: SelectServiceDialogProps) {
  const [services, setServices] = useState<ServiceType[]>([])
  const [selectedServiceId, setSelectedServiceId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      fetchServices()
    }
  }, [open])

  const fetchServices = async () => {
    setIsLoading(true)
    try {
      const allServices = await getAllServices()
      // Фильтруем услуги, которые еще не настроены (registration_available === false)
      const availableServices = allServices.filter((service) => !service.registration_available)
      setServices(availableServices)
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список услуг",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = () => {
    if (!selectedServiceId) {
      toast({
        title: "Ошибка",
        description: "Выберите услугу из списка",
        variant: "destructive",
      })
      return
    }

    const selectedService = services.find((service) => service.id.toString() === selectedServiceId)
    if (selectedService) {
      onSelectService(selectedService)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Выбор услуги для настройки</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="rounded-md border p-4 text-center">
              <p className="text-muted-foreground">Все доступные услуги уже настроены</p>
            </div>
          ) : (
            <RadioGroup value={selectedServiceId} onValueChange={setSelectedServiceId}>
              <div className="space-y-2">
                {services.map((service) => (
                  <div key={service.id} className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value={service.id.toString()} id={`service-${service.id}`} />
                    <Label htmlFor={`service-${service.id}`} className="flex-1 cursor-pointer">
                      {service.name}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || services.length === 0 || !selectedServiceId}>
            Выбрать
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
