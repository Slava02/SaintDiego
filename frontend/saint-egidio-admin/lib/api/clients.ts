import { API_BASE_URL } from "@/lib/constants"
import type { Client, GetClientsResponse, BlockClientRequest } from "@/lib/types"

// Получение списка клиентов
export async function getClients(page = 1, perPage = 20, search?: string): Promise<GetClientsResponse> {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("Unauthorized")

  let url = `${API_BASE_URL}/clients?page=${page}&per_page=${perPage}`
  if (search) {
    url += `&search=${encodeURIComponent(search)}`
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch clients")
  }

  return response.json()
}

// Получение клиента по ID
export async function getClient(id: number): Promise<Client> {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("Unauthorized")

  const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch client")
  }

  return response.json()
}

// Блокировка/разблокировка клиента
export async function blockClient(id: number, data: BlockClientRequest): Promise<Client> {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("Unauthorized")

  const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Failed to update client")
  }

  return response.json()
}

// Получение заблокированных клиентов
export async function getBlockedClients(page = 1, perPage = 20): Promise<GetClientsResponse> {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("Unauthorized")

  const response = await fetch(`${API_BASE_URL}/clients?page=${page}&per_page=${perPage}&is_blocked=true`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch blocked clients")
  }

  return response.json()
}
