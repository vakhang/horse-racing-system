import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme, Spin } from 'antd';
import { useAuth } from './context/AuthContext';
import MainLayout from './components/MainLayout';

// Sử dụng React.lazy để load trang khi cần thiết (Tối ưu công nghệ React)
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));

// Component bảo vệ Route (Chỉ cho user đã đăng nhập vào)
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="flex h-screen items-center justify-center"><Spin size="large"/></div>;
    if (!user) return <Navigate to="/login" />;
    return <MainLayout>{children}</MainLayout>;
};

function App() {
    return (
        // 1. CẤU HÌNH THEME ANTD (Màu xanh chủ đạo, lung linh)
        <ConfigProvider
            theme={{
                algorithm: theme.defaultAlgorithm, // Bật chế độ sáng mặc định cho Content
                token: {
                    colorPrimary: '#1677ff', // Màu xanh chủ đạo
                    borderRadius: 8, // Bo góc lung linh
                },
                components: {
                    Layout: {
                        colorBgSider: '#001529', // Sidebar màu tối giống hình
                    },
                    Menu: {
                        darkItemColor: 'rgba(255, 255, 255, 0.85)', // Chữ menu dark
                    },
                },
            }}
        >
            {/* 2. CẤU HÌNH ROUTER (Modern React) */}
            <Router>
                <Suspense fallback={<div className="flex h-screen items-center justify-center"><Spin size="large"/></div>}>
                    <Routes>
                        {/* Route công khai */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />

                        {/* Route bảo vệ (Cần đăng nhập) */}
                        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />

                        {/* Sẽ tạo thêm các trang này sau dựa trên 5 Role */}
                        <Route path="/betting" element={<ProtectedRoute><h1>Trang Cá Cược</h1></ProtectedRoute>} />
                        <Route path="/my-horses" element={<ProtectedRoute><h1>Quản Lý Ngựa</h1></ProtectedRoute>} />
                        <Route path="/admin/kyc" element={<ProtectedRoute><h1>Duyệt KYC</h1></ProtectedRoute>} />

                        {/* Bắt các link sai về Home */}
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </Suspense>
            </Router>
        </ConfigProvider>
    );
}

export default App;