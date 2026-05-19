import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
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