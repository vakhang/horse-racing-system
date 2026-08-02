// [Chức năng rõ ràng]: Hàm Tiện ích (Utility) Xác thực
// [Tác dụng]: Cung cấp các hàm dùng chung để lưu, xóa và lấy Token từ LocalStorage.
// [Hướng dẫn sửa đổi]:
// - Logic: Sửa lại hàm này nếu dự án chuyển sang dùng Cookie thay vì LocalStorage để chống XSS.

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