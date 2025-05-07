import type { Participant } from "@/lib/types"
import { getClients } from "./clients"

// Поиск участников по строке (имя, фамилия или ID)
export async function searchParticipants(query: string): Promise<Participant[]> {
  try {
    const response = await getClients(1, 10, query)

    // Преобразуем Client[] в Participant[]
    const participants: Participant[] = response.clients.map((client) => ({
      id: client.id,
      first_name: client.first_name,
      middle_name: client.middle_name,
      last_name: client.last_name,
      // Другие поля могут быть undefined
    }))

    return participants
  } catch (error) {
    console.error("Error searching participants:", error)
    return []
  }
}
