import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    username: string;
    sub: string;
    iat: number;
    exp: number;
}

export const getUsernameFromToken = (token: string): string | null => {
    try {
        const decoded = jwtDecode<DecodedToken>(token);
        return decoded.username || decoded.sub || null;
    } catch (error) {
        console.error('Failed to decode token:', error);
        return null;
    }
};
