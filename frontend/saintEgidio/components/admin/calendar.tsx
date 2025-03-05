"use client"

import { useState } from "react"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import "moment/locale/ru"
import "react-big-calendar/lib/css/react-big-calendar.css"

moment.locale("ru")
const localizer = momentLocalizer(moment)

interface Event {
  id: string
  title: string
  type: string
  start: Date
  end: Date
  capacity: number
  registered: number
  status: "open" | "full"
}

interface AdminCalendarProps {
  events: Event[]
  onEventSelect: (event: Event) => void
}

export function AdminCalendar({ events, onEventSelect }: AdminCalendarProps) {
  const [view, setView] = useState<"month" | "week" | "day">("month")

  const eventStyleGetter = (event: Event) => {
    let backgroundColor = "#10b981" // green for open events

    if (event.status === "full") {
      backgroundColor = "#ef4444" // red for full events
    }

    // Different colors based on event type
    if (event.type === "medical") {
      backgroundColor = event.status === "full" ? "#ef4444" : "#3b82f6" // blue
    } else if (event.type === "clothing") {
      backgroundColor = event.status === "full" ? "#ef4444" : "#10b981" // green
    } else if (event.type === "psychology") {
      backgroundColor = event.status === "full" ? "#ef4444" : "#8b5cf6" // purple
    } else if (event.type === "legal") {
      backgroundColor = event.status === "full" ? "#ef4444" : "#f59e0b" // amber
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        color: "white",
        border: "none",
        display: "block",
        opacity: 0.9,
      },
    }
  }

  const handleEventSelect = (event: Event) => {
    onEventSelect(event)
  }

  return (
    <div className="h-[600px]">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectEvent={handleEventSelect}
        style={{ height: "100%" }}
        eventPropGetter={eventStyleGetter}
        views={["month", "week", "day"]}
        view={view}
        onView={(view) => setView(view as "month" | "week" | "day")}
        messages={{
          today: "Сегодня",
          previous: "Назад",
          next: "Вперед",
          month: "Месяц",
          week: "Неделя",
          day: "День",
          agenda: "Повестка",
          date: "Дата",
          time: "Время",
          event: "Событие",
          noEventsInRange: "Нет событий в выбранном диапазоне",
        }}
      />
    </div>
  )
}

