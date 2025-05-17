import { API_BASE_URL } from "@/lib/constants"
import type { TimeSlot, CreateTimeSlotRequest, TimeSlotFilters } from "@/lib/types"


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

// Get all time slots
export async function getTimeSlots(filters?: TimeSlotFilters): Promise<TimeSlot[]> {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("Unauthorized")

  let url = `${API_BASE_URL}/timeSlots`

  if (filters) {
    const params = new URLSearchParams()
    if (filters.startDate) params.append("startDate", filters.startDate)
    if (filters.endDate) params.append("endDate", filters.endDate)

    if (params.toString()) {
      url += `?${params.toString()}`
    }
  }

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("Failed to fetch time slots")
    }

    return (await safeJsonParse(response)) || []
  } catch (error) {
    console.error("Error in getTimeSlots:", error)
    throw error
  }
}

// Create a time slot
export async function createTimeSlot(data: CreateTimeSlotRequest): Promise<TimeSlot> {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("Unauthorized")

  console.log("Отправляемые данные:", JSON.stringify(data, null, 2))

  const response = await fetch(`${API_BASE_URL}/timeSlots`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",

    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await safeJsonParse(response)
    console.error("Ошибка создания временного слота:", errorData)
    throw new Error(errorData.message || "Failed to create time slot")
  }

  return await safeJsonParse(response)
}

// Update a time slot
export async function updateTimeSlot(id: number, data: TimeSlot): Promise<TimeSlot> {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("Unauthorized")

  console.log("Отправляемые данные при обновлении:", JSON.stringify(data, null, 2))

  const response = await fetch(`${API_BASE_URL}/timeSlots/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await safeJsonParse(response)
    console.error("Ошибка обновления временного слота:", errorData)
    throw new Error(errorData.message || "Failed to update time slot")
  }

  return await safeJsonParse(response)
}




// Delete a time slot
export async function deleteTimeSlot(id: number): Promise<{ success: boolean }> {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("Unauthorized")

  try {
    const response = await fetch(`${API_BASE_URL}/timeSlots/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    // If the response is 404, the item might have been already deleted
    if (response.status === 404) {
      console.log("Time slot not found, might be already deleted:", id)
      return { success: true }
    }

    if (!response.ok) {
      const errorData = await safeJsonParse(response)
      throw new Error(errorData.message || "Failed to delete time slot")
    }

    return { success: true }
  } catch (error) {
    console.error("Error in deleteTimeSlot:", error)
    throw error
  }
}
