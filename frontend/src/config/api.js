import axios from 'axios';
import { getToken } from '../utils/auth';

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use((config) => {
    const token = getToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }

    return config;
});

export default api;