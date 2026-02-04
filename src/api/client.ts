import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { AuthResponse } from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const AUTH_URL = import.meta.env.VITE_AUTH_URL;

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Token management
const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const TOKEN_EXPIRY_KEY = 'token_expiry';

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const getRefreshToken = (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY);
export const getTokenExpiry = (): number | null => {
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    return expiry ? parseInt(expiry, 10) : null;
};

export const setTokens = (authResponse: AuthResponse): void => {
    localStorage.setItem(TOKEN_KEY, authResponse.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, authResponse.refresh_token);
    // Calculate expiry time (current time + expires_in seconds - 60s buffer)
    const expiryTime = Date.now() + (authResponse.expires_in - 60) * 1000;
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
};

export const clearTokens = (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
};

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
    refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token: string) => {
    refreshSubscribers.forEach((cb) => cb(token));
    refreshSubscribers = [];
};

// Refresh token function
const refreshAccessToken = async (): Promise<string> => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
        throw new Error('No refresh token available');
    }

    try {
        const response = await axios.put<AuthResponse>(
            `${API_BASE_URL}/auth/token`,
            new URLSearchParams({ refresh_token: refreshToken }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        setTokens(response.data);
        return response.data.access_token;
    } catch (error) {
        clearTokens();
        window.location.href = '/login';
        throw error;
    }
};

// Request interceptor: Add auth token and logging
apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        // Log request for debugging
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);

        const token = getToken();
        const expiry = getTokenExpiry();
        // ... (rest of the interceptor)

        // Check if token is about to expire
        if (token && expiry && Date.now() >= expiry) {
            if (!isRefreshing) {
                isRefreshing = true;
                try {
                    const newToken = await refreshAccessToken();
                    isRefreshing = false;
                    onTokenRefreshed(newToken);
                } catch (error) {
                    isRefreshing = false;
                    throw error;
                }
            }

            // Wait for token refresh if in progress
            return new Promise((resolve) => {
                subscribeTokenRefresh((newToken: string) => {
                    if (config.headers) {
                        config.headers.Authorization = `Bearer ${newToken}`;
                    }
                    resolve(config);
                });
            });
        }

        // Add current token
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 errors
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // If 401 and not already retried, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (!isRefreshing) {
                isRefreshing = true;
                try {
                    const newToken = await refreshAccessToken();
                    isRefreshing = false;
                    onTokenRefreshed(newToken);

                    // Retry original request with new token
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    }
                    return apiClient(originalRequest);
                } catch (refreshError) {
                    isRefreshing = false;
                    return Promise.reject(refreshError);
                }
            }

            // Wait for ongoing refresh
            return new Promise((resolve) => {
                subscribeTokenRefresh((newToken: string) => {
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    }
                    resolve(apiClient(originalRequest));
                });
            });
        }

        return Promise.reject(error);
    }
);

export default apiClient;
export { AUTH_URL };
