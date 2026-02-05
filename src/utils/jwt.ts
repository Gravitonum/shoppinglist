import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    username?: string;
    preferred_username?: string;
    nickname?: string;
    name?: string;
    email?: string;
    user?: string; // Custom field: "project@username"
    sub?: string;
    iat: number;
    exp: number;
    [key: string]: any; // Allow other properties
}

export const getUsernameFromToken = (token: string): string | null => {
    try {
        const decoded = jwtDecode<DecodedToken>(token);
        console.log('🔍 FULL JWT TOKEN PAYLOAD:', JSON.stringify(decoded, null, 2));

        // 1. Check custom "user" field (e.g. "shoppinglist@user1")
        if (decoded.user) {
            const parts = decoded.user.split('@');
            if (parts.length > 1) {
                // Return simple username from "project@username"
                return parts[parts.length - 1];
            }
            return decoded.user;
        }

        // 2. Try standard fields
        const possibleUsername =
            decoded.username ||
            decoded.preferred_username ||
            decoded.nickname ||
            decoded.email || // fallback to email if username missing
            decoded.name;

        // If we found a potential username that is NOT the sub (UUID-like), prefer it
        if (possibleUsername && possibleUsername !== decoded.sub) {
            return possibleUsername;
        }

        // 3. Fallback to sub if nothing else works, or return the found one
        return possibleUsername || decoded.sub || null;
    } catch (error) {
        console.error('Failed to decode token:', error);
        return null;
    }
};
