"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { InputMask } from "@react-input/mask"
import { TimeSlot } from "@/components/time-slot"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: "Имя должно содержать не менее 2 символов",
  }),
  lastName: z.string().min(2, {
    message: "Фамилия должна содержать не менее 2 символов",
  }),
  phone: z.string().optional(),
  comment: z.string().optional(),
})

export default function RegisterPage() {
  const router = useRouter()
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [time, setTime] = useState<string | undefined>(undefined)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      comment: "",
    },
  })

  // Mock available dates (current month with some dates available)
  const today = new Date()
  const availableDates = [
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5),
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + 9),
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + 12),
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + 16),
  ]

  // Mock time slots
  const timeSlots = ["10:00", "11:00", "14:30", "16:00", "18:00"]

  const isDateAvailable = (date: Date) => {
    return availableDates.some(
      (d) =>
        d.getDate() === date.getDate() && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear(),
    )
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ru-RU", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (date && time) {
      setShowConfirmation(true)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span>Назад</span>
        </Link>
      </div>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Регистрация нового посетителя</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Запись на регистрацию</h3>

              <div className="border rounded-md p-4">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => !isDateAvailable(date)}
                  modifiers={{
                    available: availableDates,
                  }}
                  modifiersClassNames={{
                    available: "bg-green-100 text-green-900 hover:bg-green-200",
                  }}
                />
              </div>

              {date && (
                <div className="space-y-2">
                  <h4 className="font-medium">Доступное время на {formatDate(date)}:</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((slot) => (
                      <TimeSlot key={slot} time={slot} selected={time === slot} onClick={() => setTime(slot)} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Имя</FormLabel>
                      <FormControl>
                        <Input placeholder="Введите имя" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Фамилия</FormLabel>
                      <FormControl>
                        <Input placeholder="Введите фамилию" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Телефон (необязательно)</FormLabel>
                      <FormControl>
                        <InputMask
                          component={Input}
                          mask="+7 (___) ___-__-__"
                          replacement={{ _: /\d/ }}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="+7 (___) ___-__-__"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="comment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Комментарий (необязательно)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Особые потребности или дополнительная информация"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600"
                  disabled={!date || !time}
                >
                  Записаться на регистрацию
                </Button>
              </form>
            </Form>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Запись подтверждена</DialogTitle>
            <DialogDescription>
              Вы записаны на регистрацию на {date && formatDate(date)} в {time}.
              {form.getValues("comment") && (
                <>
                  <br />
                  <br />
                  <strong>Комментарий:</strong> {form.getValues("comment")}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Link href="/profile" className="w-full sm:w-auto">
              <Button className="w-full">Вернуться в профиль</Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

