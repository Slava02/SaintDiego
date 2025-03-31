import { CreateTimeSlotRequest, TimeSlot, ApiError as ApiErrorType } from '@/types/api';
import { Service, Location } from '@/types/event';

const API_BASE_URL = 'http://localhost:8080/v1';

class ApiErrorClass extends Error {
    constructor(public code: string, message: string, public details: string) {
        super(message);
        this.name = 'ApiError';
    }
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error: ApiErrorType = await response.json();
        throw new ApiErrorClass(error.code, error.message, error.details);
    }
    return response.json();
}

// Функции для преобразования данных
function transformApiTimeSlot(apiTimeSlot: any): TimeSlot {
    return {
        id: String(apiTimeSlot.id),
        title: apiTimeSlot.title,
        type: apiTimeSlot.type,
        locationId: String(apiTimeSlot.locationId),
        location: '', // Будет заполнено позже из списка локаций
        capacity: apiTimeSlot.capacity,
        startDate: apiTimeSlot.startDate,
        endDate: apiTimeSlot.endDate,
        status: apiTimeSlot.status,
        services: apiTimeSlot.services.map((service: any) => ({
            serviceId: String(service.serviceTypeId),
            capacity: service.capacity,
            bookingWindow: service.bookingWindow,
            time: service.time,
        })),
        recurrence: apiTimeSlot.recurrence,
    };
}

function transformApiService(apiService: any): Service {
    return {
        id: String(apiService.id),
        name: apiService.name,
        type: 'other', // По умолчанию, так как в API нет типа
        defaultCapacity: 20, // Значения по умолчанию
        defaultBookingWindow: 30,
    };
}

function transformApiLocation(apiLocation: any): Location {
    return {
        id: String(apiLocation.id),
        name: apiLocation.name,
        address: apiLocation.address,
    };
}

interface ApiTimeSlot {
    id: number;
    title: string;
    type: 'single' | 'recurring';
    locationId: number;
    capacity: number;
    startDate: string;
    endDate: string;
    status: 'active' | 'archived';
    services: Array<{
        serviceTypeId: number;
        capacity: number;
        bookingWindow: number;
        time: string;
    }>;
    recurrence?: {
        frequency: 'daily' | 'weekly' | 'monthly';
        interval: number;
        endType: 'never' | 'date';
        endValue?: string;
    };
}

interface ApiService {
    id: number;
    name: string;
}

interface ApiLocation {
    id: number;
    name: string;
    address: string;
}

export const api = {
    async createTimeSlot(data: CreateTimeSlotRequest): Promise<TimeSlot> {
        const apiData = {
            ...data,
            locationId: Number(data.locationId),
            services: data.services.map(service => ({
                serviceTypeId: Number(service.serviceId),
                capacity: service.capacity,
                bookingWindow: service.bookingWindow,
                time: service.time,
            })),
        };

        const response = await fetch(`${API_BASE_URL}/timeSlots`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Здесь нужно будет добавить токен авторизации
                // 'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(apiData),
        });
        const apiTimeSlot = await handleResponse<ApiTimeSlot>(response);
        return transformApiTimeSlot(apiTimeSlot);
    },

    async getTimeSlots(params?: {
        status?: 'active' | 'archived';
        startDate?: string;
        endDate?: string;
    }): Promise<TimeSlot[]> {
        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.append('status', params.status);
        if (params?.startDate) queryParams.append('startDate', params.startDate);
        if (params?.endDate) queryParams.append('endDate', params.endDate);

        const response = await fetch(`${API_BASE_URL}/timeSlots?${queryParams}`, {
            headers: {
                // Здесь нужно будет добавить токен авторизации
                // 'Authorization': `Bearer ${token}`
            },
        });
        const apiTimeSlots = await handleResponse<ApiTimeSlot[]>(response);
        return apiTimeSlots.map(transformApiTimeSlot);
    },

    async getLocations(): Promise<Location[]> {
        const response = await fetch(`${API_BASE_URL}/locations`, {
            headers: {
                // Здесь нужно будет добавить токен авторизации
                // 'Authorization': `Bearer ${token}`
            },
        });
        const apiLocations = await handleResponse<ApiLocation[]>(response);
        return apiLocations.map(transformApiLocation);
    },

    async getServices(): Promise<Service[]> {
        const response = await fetch(`${API_BASE_URL}/services`, {
            headers: {
                // Здесь нужно будет добавить токен авторизации
                // 'Authorization': `Bearer ${token}`
            },
        });
        const apiServices = await handleResponse<ApiService[]>(response);
        return apiServices.map(transformApiService);
    },

    async archiveTimeSlot(id: string): Promise<TimeSlot> {
        const response = await fetch(`${API_BASE_URL}/timeSlots/${id}/archive`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${token}`
            },
        });
        const apiTimeSlot = await handleResponse<ApiTimeSlot>(response);
        return transformApiTimeSlot(apiTimeSlot);
    },

    async activateTimeSlot(id: string): Promise<TimeSlot> {
        const response = await fetch(`${API_BASE_URL}/timeSlots/${id}/activate`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${token}`
            },
        });
        const apiTimeSlot = await handleResponse<ApiTimeSlot>(response);
        return transformApiTimeSlot(apiTimeSlot);
    },

    async deleteTimeSlot(id: string): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/timeSlots/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${token}`
            },
        });
        await handleResponse<{ success: boolean }>(response);
    },
}; 