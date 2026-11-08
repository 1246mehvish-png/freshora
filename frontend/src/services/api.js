import axios from 'axios';

// On Vercel the frontend and backend are separate services. The frontend is a
// static Vite build, so it reaches the backend through the relative "/api"
// path, which the top-level rewrite in vercel.json routes to the backend
// service. Locally, the Vite proxy in vite.config.js forwards "/api" to
// http://localhost:5000. VITE_API_URL can override the base URL for split
// deployments.
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
