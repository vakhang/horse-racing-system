import axios from 'axios';
import { getToken } from '../utils/auth';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://horse-racing-system-production-492c.up.railway.app/api',
    headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }

    // 🎯 ĐIỂM CHỐT HẠ: NẾU LÀ FORMDATA (CHỨA FILE), TỰ ĐỘNG XOÁ CONTENT-TYPE
    // ĐỂ TRÌNH DUYỆT TỰ ĐỘNG GẮN CONTENT-TYPE KÈM BOUNDARY CHUẨN
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }

    return config;
});

export default api;