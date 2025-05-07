import { API_BASE_URL } from "@/lib/constants"

export interface LoginResponse {
  token: string
}

export async function login(login: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ login, password }),
  })

  if (!response.ok) {
    throw new Error("Login failed")
  }

  return response.json()
}
