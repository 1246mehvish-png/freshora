import axios from 'axios';

// In production the frontend is served by the backend on the same origin,
// so a relative "/api" base URL works for both. In local dev, Vite proxies
// "/api" to http://localhost:5000 (see vite.config.js).
const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('freshora_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Normalize errors and handle 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token invalid/expired - clear session
            const isAuthCall = error.config?.url?.includes('/auth/login');
            if (!isAuthCallInline(error) && !isAuthCall) {
                localStorage.removeItem('freshora_token');
                localStorage.removeItem('freshora_user');
            }
        }
        const message =
            error.response?.data?.message || error.message || 'Something went wrong. Please try again.';
        return Promise.reject({ ...error, message });
    }
);

function isAuthCallInline(error) {
    return error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
}

export default api;
