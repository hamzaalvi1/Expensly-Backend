import { API_URL } from "../constants/api";

export const withApiPrefix = (path: string) => {
    if (path === '/') return API_URL;

    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_URL}${normalizedPath}`;
}
