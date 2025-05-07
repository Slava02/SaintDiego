import { API_BASE_URL } from "@/lib/constants"
import type { TimeSlot, CreateTimeSlotRequest, TimeSlotFilters } from "@/lib/types"

// Get all time slots
export async function getTimeSlots(filters?: TimeSlotFilters): Promise<TimeSlot[]> {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("Unauthorized")

  let url = `${API_BASE_URL}/timeSlots`

  if (filters) {
    const params = new URLSearchParams()
    if (filters.status) params.append("status", filters.status)
    if (filters.startDate) params.append("startDate", filters.startDate)
    if (filters.endDate) params.append("endDate", filters.endDate)

    if (params.toString()) {
      url += `?${params.toString()}`
    }
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch time slots")
  }

  return response.json()
}

// Create a time slot
export async function createTimeSlot(data: CreateTimeSlotRequest): Promise<TimeSlot> {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("Unauthorized")

  const response = await fetch(`${API_BASE_URL}/timeSlots`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Failed to create time slot")
  }

  return response.json()
}

// Update a time slot
export async function updateTimeSlot(id: number, data: CreateTimeSlotRequest): Promise<TimeSlot> {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("Unauthorized")

  const response = await fetch(`${API_BASE_URL}/timeSlots/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Failed to update time slot")
  }

  return response.json()
}

// Archive a time slot
export async function archiveTimeSlot(id: number): Promise<TimeSlot> {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("Unauthorized")

  const response = await fetch(`${API_BASE_URL}/timeSlots/${id}/archive`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Failed to archive time slot")
  }

  return response.json()
}

// Activate a time slot
export async function activateTimeSlot(id: number, newDate: string): Promise<TimeSlot> {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("Unauthorized")

  const response = await fetch(`${API_BASE_URL}/timeSlots/${id}/activate`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ newDate }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Failed to activate time slot")
  }

  return response.json()
}

// Delete a time slot
export async function deleteTimeSlot(id: number): Promise<{ success: boolean }> {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("Unauthorized")

  const response = await fetch(`${API_BASE_URL}/timeSlots/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Failed to delete time slot")
  }

  return response.json()
}
