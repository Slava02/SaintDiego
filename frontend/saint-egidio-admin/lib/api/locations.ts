import { API_BASE_URL } from "@/lib/constants"
import type { Location, CreateLocationRequest } from "@/lib/types"

// Get all locations
export async function getLocations(): Promise<Location[]> {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("Unauthorized")

  const response = await fetch(`${API_BASE_URL}/locations`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch locations")
  }

  return response.json()
}

// Create a location
export async function createLocation(data: CreateLocationRequest): Promise<Location> {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("Unauthorized")

  const response = await fetch(`${API_BASE_URL}/locations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Failed to create location")
  }

  return response.json()
}
