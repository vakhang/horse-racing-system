import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// [Chức năng rõ ràng]: Điểm khởi chạy React (Entry Point)
// [Tác dụng]: Nơi React lấy Component `<App />` và render vào thẻ `<div id="root">` trong file index.html.
// [Hướng dẫn sửa đổi]:
// - Logic: Thường không cần sửa, trừ khi muốn bọc thêm Provider toàn cục (như Redux Provider hoặc Theme Provider).

// 1. Nhập khẩu cái Phích cắm (AuthProvider)
import { AuthProvider } from './context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        {/* 2. Bọc toàn bộ App vào trong AuthProvider để cấp điện */}
        <AuthProvider>
            <App />
        </AuthProvider>
    </StrictMode>,
)