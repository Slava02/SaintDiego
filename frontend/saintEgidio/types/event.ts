export type ServiceType = "medical" | "psychology" | "clothing" | "food" | "legal" | "other"
export type LocationType = 'Цветной' | 'Гиляровского' | 'Ясная'

export interface Service {
    id: string
    name: string
    type: ServiceType
    defaultCapacity: number
    defaultBookingWindow: number
    description?: string
}

export interface TimeSlotService {
    serviceId: string
    capacity: number
    bookingWindow: number
    time: string
}

export interface Recurrence {
    frequency: "daily" | "weekly" | "monthly"
    interval: number
    endType: "never" | "date"
    endValue?: string
}

export interface TimeSlot {
    id: string
    title: string
    type: "single" | "recurring"
    locationId: string
    location: string
    capacity: number
    startDate: string
    endDate: string
    status: "active" | "archived"
    services: TimeSlotService[]
    recurrence?: Recurrence
}

export interface Event {
    id: string
    timeSlotId: string
    serviceId: string
    title: string
    date: string
    capacity: number
    registeredCount: number
    status: 'active' | 'cancelled' | 'completed'
    location: LocationType
    type: ServiceType
}

export interface Participant {
    id: string
    visitorId: string
    eventId: string
    name: string
    surname: string
    status: 'attended' | 'no-show' | 'pending'
    telegramId: string
    createdAt: string
}

export interface Location {
    id: string
    name: string
    address: string
}

export interface FilterState {
    serviceType: ServiceType | 'all'
    location: LocationType | 'all'
    status: 'active' | 'archived' | 'all'
    dateRange?: {
        from: string
        to: string
    }
}

export interface DashboardStats {
    totalTimeSlots: number
    totalEvents: number
    totalParticipants: number
    attendanceRate: number
    eventsByService: Record<ServiceType, number>
    participantsByStatus: Record<string, number>
}

export interface EventFiltersState {
    eventType: "all" | "medical" | "clothing" | "psychology" | "legal"
    place: "all" | "Цветной" | "Гиляровского" | "Ясная"
    participant: string
} 