import { API_BASE_URL } from "@/lib/constants"
import type {
  Event,
  EventFilters,
  GetEventsResponse,
  UpdateEventRequest,
  GetParticipantsResponse,
  AddParticipantToEventRequest,
} from "@/lib/types"

// Helper function to safely parse JSON
async function safeJsonParse(response: Response) {
  // Check if response has content
  const contentType = response.headers.get("content-type")
  const hasJsonContent = contentType && contentType.includes("application/json")

  // If no content or empty response, return empty object
  if (response.status === 204 || !hasJsonContent) {
    return {}
  }

  // Try to parse as JSON, fallback to empty object if it fails
  try {
    const text = await response.text()
    return text ? JSON.parse(text) : {}
  } catch (error) {
    console.error("Failed to parse JSON response:", error)
    return {}
  }
}

// Получение списка мероприятий
export async function getEvents(filters?: EventFilters, page = 1, perPage = 20): Promise<GetEventsResponse> {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("Unauthorized")

  let url = `${API_BASE_URL}/events?page=${page}&per_page=${perPage}`

  if (filters) {
    const params = new URLSearchParams()

    if (filters.status) params.append("status", filters.status)
    if (filters.service_id) params.append("service_id", filters.service_id.toString())
    if (filters.location_id) params.append("location_id", filters.location_id.toString())
    if (filters.participant_id) params.append("participant_id", filters.participant_id.toString())
    if (filters.from_date) params.append("from_date", filters.from_date)
    if (filters.to_date) params.append("to_date", filters.to_date)
    if (filters.open_for_registration) params.append("open_for_registration", filters.open_for_registration.toString())

    if (params.toString()) {
      url += `&${params.toString()}`
    }
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("Failed to fetch events")
  }

  return (await safeJsonParse(response)) as GetEventsResponse
}

// Получение мероприятия по ID
export async function getEvent(id: number): Promise<Event> {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("Unauthorized")

  const response = await fetch(`${API_BASE_URL}/events/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("Failed to fetch event")
  }

  return (await safeJsonParse(response)) as Event
}

// Обновление мероприятия
export async function updateEvent(id: number, data: UpdateEventRequest): Promise<Event> {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("Unauthorized")

  const response = await fetch(`${API_BASE_URL}/events/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    cache: "no-store",
  })

  if (!response.ok) {
    const errorData = await safeJsonParse(response)
    throw new Error(errorData.message || "Failed to update event")
  }

  return (await safeJsonParse(response)) as Event
}

// Удаление мероприятия
export async function deleteEvent(id: number): Promise<{ success: boolean }> {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("Unauthorized")

  try {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    // If the response is 404, the item might be already deleted
    if (response.status === 404) {
      console.log("Event not found, might be already deleted:", id)
      return { success: true }
    }

    if (!response.ok) {
      const errorData = await safeJsonParse(response)
      throw new Error(errorData.message || "Failed to delete event")
    }

    return { success: true }
  } catch (error) {
    console.error("Error in deleteEvent:", error)
    throw error
  }
}

// Получение участников мероприятия
export async function getEventParticipants(id: number, page = 1, perPage = 20): Promise<GetParticipantsResponse> {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("Unauthorized")

  const response = await fetch(`${API_BASE_URL}/events/${id}/participants?page=${page}&per_page=${perPage}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("Failed to fetch event participants")
  }

  return (await safeJsonParse(response)) as GetParticipantsResponse
}

// Добавление участника к мероприятию
export async function addParticipantToEvent(
  eventId: number,
  data: AddParticipantToEventRequest,
): Promise<{ success: boolean }> {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("Unauthorized")

  const response = await fetch(`${API_BASE_URL}/events/${eventId}/participants`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    cache: "no-store",
  })

  if (!response.ok) {
    const errorData = await safeJsonParse(response)
    throw new Error(errorData.message || "Failed to add participant to event")
  }

  return { success: true }
}

// Удаление участника из мероприятия
export async function removeParticipantFromEvent(
  eventId: number,
  participantId: number,
): Promise<{ success: boolean }> {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("Unauthorized")

  try {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/participants/${participantId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    // If the response is 404, the participant might be already removed
    if (response.status === 404) {
      console.log("Participant not found, might be already removed:", participantId)
      return { success: true }
    }

    if (!response.ok) {
      const errorData = await safeJsonParse(response)
      throw new Error(errorData.message || "Failed to remove participant from event")
    }

    return { success: true }
  } catch (error) {
    console.error("Error in removeParticipantFromEvent:", error)
    throw error
  }
}

// Скачивание отчета по участникам события
export async function downloadEventParticipantsReport(eventId: number): Promise<Blob> {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("Unauthorized")

  const response = await fetch(`${API_BASE_URL}/events/${eventId}/participants/report`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Отчет не найден")
    }
    throw new Error("Не удалось скачать отчет")
  }

  return response.blob()
}
