import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout } from '@/api/auth';
import { getToken, getTokenExpiry } from '@/api/client';
import { getUsernameFromToken } from '@/utils/jwt';
import { appUsersAPI } from '@/api/entities';
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

    const fetchUserByUsername = async (username: string): Promise<User | null> => {
        try {
            const users = await appUsersAPI.getAll({ username });
            if (users && users.length > 0) {
                return users[0];
            }
            return null;
        } catch (error) {
            console.error('Failed to fetch user by username:', error);
            return null;
        }
    };

    // Check authentication status on mount
    useEffect(() => {
        const initAuth = async () => {
            const token = getToken();
            const expiry = getTokenExpiry();

            if (token && expiry && Date.now() < expiry) {
                const username = getUsernameFromToken(token);
                if (username) {
                    const gravibaseUser = await fetchUserByUsername(username);
                    if (gravibaseUser) {
                        setUser(gravibaseUser);
                    } else {
                        // Fallback if user not found in AppUser entity yet
                        setUser({ id: username, username, email: '', displayName: 'User' });
                    }
                } else {
                    setUser({ id: 'current-user', username: 'current-user', email: '', displayName: 'User' });
                }
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
            // After successful login, fetch the actual user record
            const gravibaseUser = await fetchUserByUsername(username);
            if (gravibaseUser) {
                setUser(gravibaseUser);
            } else {
                setUser({ id: username, username: username, email: username, displayName: username });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (username: string, password: string, email?: string, displayName?: string) => {
        setIsLoading(true);
        try {
            await apiRegister(username, password, email, displayName);

            // Get token and extract the "official" username
            const token = getToken();
            let finalUsername = username;
            if (token) {
                const extracted = getUsernameFromToken(token);
                if (extracted) {
                    finalUsername = extracted;
                }
            }

            // Create AppUser entity record in GraviBase
            let createdUser: User | null = null;
            try {
                createdUser = await appUsersAPI.create({
                    username: finalUsername,
                    email: email,
                    displayName: displayName || finalUsername
                });
            } catch (entityError) {
                console.error('Failed to create AppUser entity record:', entityError);
            }

            // After successful registration and entity creation, set user
            if (createdUser) {
                setUser(createdUser);
            } else {
                setUser({
                    id: finalUsername,
                    username: finalUsername,
                    email: email || finalUsername,
                    displayName: displayName || finalUsername
                });
            }
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

    console.log('AuthProvider: current user state:', user);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
