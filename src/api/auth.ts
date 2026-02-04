import apiClient, { AUTH_URL, setTokens, clearTokens } from './client';
import type { AuthResponse, RegisterRequest } from '@/types/api';

// Register new user
export const register = async (
    username: string,
    password: string,
    email?: string,
    displayName?: string
): Promise<AuthResponse> => {
    const profile: Record<string, string> = {};

    if (email) {
        profile.email = email;
    }
    if (displayName) {
        profile.displayName = displayName;
    }

    const requestData: RegisterRequest = {
        username,
        flow: 'password',
        value: password,
        profile,
    };

    const response = await apiClient.post<AuthResponse>(
        `${AUTH_URL}/users`,
        requestData
    );

    setTokens(response.data);
    return response.data;
};

// Login user
export const login = async (
    username: string,
    password: string
): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
        `${AUTH_URL}/token`,
        new URLSearchParams({
            login: username,
            password: password,
        }),
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }
    );

    setTokens(response.data);
    return response.data;
};

// Logout user
export const logout = (): void => {
    clearTokens();
};

// Get current user info (from token)
export const getCurrentUser = async () => {
    // Since GraviBase doesn't seem to have a /me endpoint,
    // we'll need to extract user info from the token or implement differently
    // For now, return a placeholder
    return apiClient.get('/api/User'); // This will need proper implementation
};
