import { API_BASE_URL } from "@/lib/constants"
import type { ServiceType, GetServicesResponse, UpdateServiceRequest, CreateServiceRequest } from "@/lib/types"

// Получение списка услуг
export async function getServices(page = 1, perPage = 20, registrationAvailable?: boolean): Promise<GetServicesResponse> {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("Unauthorized")

  let url = `${API_BASE_URL}/services?page=${page}&per_page=${perPage}`
  if (registrationAvailable !== undefined) {
    url += `&registration_available=${registrationAvailable}`
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch services")
  }

  return response.json()
}

// Получение услуги по ID
export async function getService(id: number): Promise<ServiceType> {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("Unauthorized")

  const response = await fetch(`${API_BASE_URL}/services/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch service")
  }

  return response.json()
}

// Обновление услуги
export async function updateService(id: number, data: UpdateServiceRequest): Promise<ServiceType> {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("Unauthorized")

  const response = await fetch(`${API_BASE_URL}/services/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Failed to update service")
  }

  return response.json()
}

// Создание услуги (если API поддерживает)
export async function createService(data: CreateServiceRequest): Promise<ServiceType> {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("Unauthorized")

  const response = await fetch(`${API_BASE_URL}/services`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Failed to create service")
  }

  return response.json()
}

// Удаление услуги (если API поддерживает)
export async function deleteService(id: number): Promise<{ success: boolean }> {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("Unauthorized")

  const response = await fetch(`${API_BASE_URL}/services/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Failed to delete service")
  }

  return { success: true }
}
