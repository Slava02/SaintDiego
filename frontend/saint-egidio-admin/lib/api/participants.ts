import { API_BASE_URL } from "@/lib/constants"
import type { Participant } from "@/lib/types"

// Поиск участников
export async function searchParticipants(query: string): Promise<Participant[]> {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("Unauthorized")

  const response = await fetch(`${API_BASE_URL}/clients?search=${encodeURIComponent(query)}&page=1&per_page=10`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error("Failed to search participants")
  }

  const data = await response.json()
  return data.clients || []
}
