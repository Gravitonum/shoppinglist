import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ru';

dayjs.extend(relativeTime);
dayjs.locale('ru');

// Format date to localized string
export const formatDate = (date: string | Date, format = 'DD.MM.YYYY HH:mm'): string => {
    return dayjs(date).format(format);
};

// Format date relative to now (e.g., "2 hours ago")
export const formatRelativeTime = (date: string | Date): string => {
    return dayjs(date).fromNow();
};

// Debounce function for search inputs
export const debounce = <T extends (...args: unknown[]) => unknown>(
    func: T,
    delay: number
): ((...args: Parameters<T>) => void) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

// Parse JWT token (basic implementation)
export const parseJWT = (token: string): { exp?: number;[key: string]: unknown } => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Failed to parse JWT:', error);
        return {};
    }
};

// Check if token is expired
export const isTokenExpired = (token: string): boolean => {
    const decoded = parseJWT(token);
    if (!decoded.exp) return true;
    return Date.now() >= decoded.exp * 1000;
};
