export interface CreateTimeSlotRequest {
  title: string
  type: "single" | "recurring"
  locationId: number
  capacity: number
  startDate: string
  endDate: string
  services: any[]
  recurrence?: any
}

export interface TimeSlot {
  id: number
  title: string
  type: "single" | "recurring"
  locationId: number
  capacity: number
  startDate: string
  endDate: string
  status: "active" | "archived"
  services: TimeSlotService[]
  recurrence?: Recurrence
}

export interface TimeSlotService {
  timeSlotId?: number
  serviceTypeId: number
  capacity: number
  bookingWindow: number
  time: string
}

export interface Recurrence {
  frequency: "daily" | "weekly" | "monthly" | "yearly"
  interval: number
  endType: "never" | "count" | "date"
  endValue?: string
}

export interface TimeSlotFilters {
  status?: "active" | "archived"
  startDate?: string
  endDate?: string
}

export interface Location {
  id: number
  name: string
  address: string
}

export interface CreateLocationRequest {
  name: string
  address: string
}

export interface Participant {
  id: number
  first_name: string
  middle_name: string
  last_name: string
  volunteer_tg_login?: string
  volunteer_tg?: number
  status?: string
}

export interface AddParticipantToEventRequest {
  participant_id: number
  volunteer_id: number
}

export interface Event {
  id: number
  serviceName: string
  datetime: string
  location: Location
  capacity: number
  participantsCount: number
  timeSlotServiceId: number
  serviceTypeId: number
}

export interface UpdateEventRequest {
  capacity: number
  datetime: string
}

export interface EventFilters {
  status?: "upcoming" | "past"
  service_id?: number
  location_id?: number
  participant_id?: number
  from_date?: string
  to_date?: string
  open_for_registration?: boolean
}

export interface GetEventsResponse {
  items: Event[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface GetParticipantsResponse {
  participants: Participant[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface GetServicesResponse {
  items: ServiceType[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

// Обновленный тип ServiceType
export interface ServiceType {
  id: number
  name: string
  min_period_days: number
  registration_available: boolean
}

// Client entity based on OpenAPI
export interface Client {
  id: number
  first_name: string
  middle_name: string
  last_name: string
  is_homeless?: boolean
  photo_name?: string
  birth_date?: string
  gender?: number
  is_new: boolean
  is_blocked?: boolean
  blocked_at?: string
  blocked_reason?: string
}

export interface GetClientsResponse {
  clients: Client[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface BlockClientRequest {
  is_blocked: boolean
  block_reason?: string
}


export interface UpdateServiceRequest {
  min_period_days: number
  registration_available: boolean
}
