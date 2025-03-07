export interface Service {
    id: string
    name: string
    time: string
    capacity: number
    bookingWindow: number
    registered: number
    type: "medical" | "clothing" | "psychology" | "legal"
}

export interface Recurrence {
    type: "daily" | "weekly" | "monthly"
    interval: number
    end?: Date
}

export interface Event {
    id: string
    title: string
    type: "single" | "recurring"
    start: Date
    place: string
    capacity: number
    status: "active" | "archived"
    services: Service[]
    recurrence?: Recurrence
}

export interface EventFiltersState {
    eventType: "all" | "medical" | "clothing" | "psychology" | "legal"
    place: "all" | "Цветной" | "Гиляровского" | "Ясная"
    participant: string
} 