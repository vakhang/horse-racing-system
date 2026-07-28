import axios from 'axios';
import { getToken } from '../utils/auth';

const api = axios.create({
    // FIX: Bỏ qua biến môi trường bị cấu hình sai trên Vercel, dùng thẳng link gốc đáng tin cậy.
    baseURL: 'https://horse-racing-system-production-492c.up.railway.app/api',
    headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;