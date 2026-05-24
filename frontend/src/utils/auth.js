// Lưu chìa khóa vào kho trình duyệt (LocalStorage)
export const setToken = (token) => {
    localStorage.setItem('accessToken', token);
};

// Lấy chìa khóa ra để gọi API
export const getToken = () => {
    return localStorage.getItem('accessToken');
};

// Đăng xuất: Vứt chìa khóa đi
export const removeToken = () => {
    localStorage.removeItem('accessToken');
};

// Tool format tiền tệ Việt Nam (VD: 100000 -> 100.000 VNĐ) - Sắp tới làm ví tiền sếp sẽ rất cần
export const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};