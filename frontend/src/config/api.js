import axios from 'axios';
import { getToken } from '../utils/auth'; // Import hàm lấy token của sếp

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    }
});

// INTERCEPTOR: Đứng gác ở cửa ra của Frontend, thò tay nhét Token vào mọi Request
api.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            // Nhét thẻ VIP vào Header
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;