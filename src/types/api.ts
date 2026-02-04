// API Request and Response Types

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
}

export interface RegisterRequest {
    username: string;
    flow: 'password';
    value: string; // password
    profile: Record<string, string>;
}

export interface LoginRequest {
    login: string;
    password: string;
}

export interface RefreshTokenRequest {
    refresh_token: string;
}

export interface ApiError {
    message: string;
    status?: number;
    errors?: Record<string, string[]>;
}

// Generic API list response
export interface ApiListResponse<T> {
    data: T[];
    total?: number;
}

// Generic API single item response
export interface ApiResponse<T> {
    data: T;
}
