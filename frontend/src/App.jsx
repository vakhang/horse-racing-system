import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme, Spin } from 'antd';
import { useAuth } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import AdminKycApprovalPage from "./pages/AdminKycApprovalPage.jsx";

// Sử dụng React.lazy để load trang khi cần thiết (Tối ưu công nghệ React)
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const WalletPage = lazy(() => import('./pages/user/WalletPage'));
const LandingPage = lazy(() => import('./pages/user/LandingPage'));
const ProfilePage = lazy(() => import('./pages/user/ProfilePage'));
const BettingPage = lazy(() => import('./pages/user/BettingPage'));

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
                        {/* Vừa vào web (/) sẽ tự động chuyển hướng sang Trang Chủ Quảng Cáo (/home) */}
                        <Route path="/" element={<Navigate to="/home" replace />} />
                        <Route path="/home" element={<ProtectedRoute><LandingPage /></ProtectedRoute>} />

                        {/* Trang Lịch sử giao dịch/cược cũ giờ sẽ nằm ở link /dashboard */}
                        <Route path="/dashboard" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />

                        {/* Các trang chức năng của Khán Giả (Spectator) */}
                        <Route path="/betting" element={<ProtectedRoute><BettingPage /></ProtectedRoute>} />
                        <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

                        {/* Sẽ tạo thêm các trang này sau dựa trên các Role khác */}
                        <Route path="/my-horses" element={<ProtectedRoute><h1>Quản Lý Ngựa</h1></ProtectedRoute>} />
                        <Route path="/admin/kyc" element={<ProtectedRoute><h1>Duyệt KYC</h1></ProtectedRoute>} />
                        <Route path="/admin/kyc-approval" element={<AdminKycApprovalPage />} />

                        {/* Bắt các link sai (ví dụ gõ bậy bạ) tự động đá về Home */}
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </Suspense>
            </Router>
        </ConfigProvider>
    );
}

export default App;