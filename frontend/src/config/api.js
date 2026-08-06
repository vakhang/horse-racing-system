import axios from 'axios';
import { getToken } from '../utils/auth';

// [Chức năng rõ ràng]: Cấu hình Axios gọi API (Frontend)
// [Tác dụng]: Định nghĩa URL gốc của Backend để Frontend gọi tới, không cần phải gõ lại link dài dòng ở mỗi file.
// [Hướng dẫn sửa đổi]:
// - Logic/Data: Nếu Backend thay đổi domain (chuyển nhà cung cấp) hoặc bạn chạy ở Localhost, hãy sửa đường link `baseURL` này thành `http://localhost:8080/api`.
const getBaseURL = () => {
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        return 'http://localhost:8085/api';
    }
    return 'https://horse-racing-system-production-492c.up.railway.app/api';
};

const api = axios.create({
    baseURL: getBaseURL(),
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