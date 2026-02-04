import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout } from '@/api/auth';
import { getToken, getTokenExpiry } from '@/api/client';
import type { User } from '@/types/entities';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, password: string, email?: string, displayName?: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check authentication status on mount
    useEffect(() => {
        const initAuth = () => {
            const token = getToken();
            const expiry = getTokenExpiry();

            if (token && expiry && Date.now() < expiry) {
                // Token exists and is valid
                // In a real app, we'd fetch user info from the API
                // For now, set a placeholder user
                setUser({ id: 'current-user', email: '', displayName: 'User' });
            } else {
                setUser(null);
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = async (username: string, password: string) => {
        setIsLoading(true);
        try {
            await apiLogin(username, password);
            // After successful login, set user
            setUser({ id: username, email: username, displayName: username });
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (username: string, password: string, email?: string, displayName?: string) => {
        setIsLoading(true);
        try {
            await apiRegister(username, password, email, displayName);
            // After successful registration, set user
            setUser({ id: username, email: email || username, displayName: displayName || username });
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        apiLogout();
        setUser(null);
    };

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
