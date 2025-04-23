import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

class ApiClient {
    private client: AxiosInstance;
    private refreshPromise: Promise<string> | null = null;

    constructor() {
        this.client = axios.create({
            baseURL: API_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Добавляем перехватчик запросов
        this.client.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Добавляем перехватчик ответов
        this.client.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

                // Если получили 401 и это не повторная попытка
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    // Если есть redirect в ответе, перенаправляем на страницу логина
                    if (error.response.data?.redirect) {
                        window.location.href = error.response.data.redirect;
                        return Promise.reject(error);
                    }

                    // Пробуем обновить токен
                    try {
                        const newToken = await this.refreshToken();
                        if (newToken) {
                            localStorage.setItem('token', newToken);
                            if (originalRequest.headers) {
                                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                            }
                            return this.client(originalRequest);
                        }
                    } catch (refreshError) {
                        // Если не удалось обновить токен, перенаправляем на логин
                        window.location.href = '/login';
                        return Promise.reject(refreshError);
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    private async refreshToken(): Promise<string | null> {
        if (this.refreshPromise) {
            return this.refreshPromise;
        }

        this.refreshPromise = new Promise(async (resolve, reject) => {
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    reject(new Error('No refresh token'));
                    return;
                }

                const response = await axios.post(`${API_URL}/api/v1/refresh`, null, {
                    headers: {
                        Authorization: `Bearer ${refreshToken}`,
                    },
                });

                resolve(response.data.token);
            } catch (error) {
                reject(error);
            } finally {
                this.refreshPromise = null;
            }
        });

        return this.refreshPromise;
    }

    // Методы для работы с API
    async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.get<T>(url, config);
        return response.data;
    }

    async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.post<T>(url, data, config);
        return response.data;
    }

    async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.put<T>(url, data, config);
        return response.data;
    }

    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.delete<T>(url, config);
        return response.data;
    }
}

export const api = new ApiClient(); 