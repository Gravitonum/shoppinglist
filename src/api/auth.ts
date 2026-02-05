import apiClient, { AUTH_URL, setTokens, clearTokens } from './client';
import type { AuthResponse, RegisterRequest, ProfileAttribute } from '@/types/api';

// Register new user
export const register = async (
    username: string,
    password: string,
    email?: string,
    displayName?: string
): Promise<AuthResponse> => {
    const profile: ProfileAttribute[] = [];

    if (email) {
        profile.push({ attribute: 'email', value: email });
    }

    // Always include displayName, fallback to username if not provided
    const finalDisplayName = displayName || username;
    profile.push({ attribute: 'displayName', value: finalDisplayName });

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
export interface LoginRequest {
    login: string;
    password: string;
}
export const login = async (
    login: string,
    password: string
): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
        `${AUTH_URL}/token`,
        new URLSearchParams({
            grant_type: 'password',
            login: login,
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
