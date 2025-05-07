console.log('[DEBUG] process.env.NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/v1";
console.log('[DEBUG] API_BASE_URL:', API_BASE_URL); 