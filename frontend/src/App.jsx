import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme, Spin } from 'antd';
import { useAuth } from './context/AuthContext';

// Import Layout của 2 phe
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './pages/admin/AdminLayout';

// Sử dụng React.lazy để load trang
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const WalletPage = lazy(() => import('./pages/user/WalletPage'));
const LandingPage = lazy(() => import('./pages/user/LandingPage'));
const ProfilePage = lazy(() => import('./pages/user/ProfilePage'));
const BettingPage = lazy(() => import('./pages/user/BettingPage'));

// --- ĐÃ SỬA ĐƯỜNG DẪN 2 TRANG ADMIN VÀO ĐÚNG THƯ MỤC ---
const AdminKycApprovalPage = lazy(() => import('./pages/admin/AdminKycApprovalPage'));
const AdminTournamentPage = lazy(() => import('./pages/admin/AdminTournamentPage'));

// 1. COMPONENT BẢO VỆ ROUTE CHUNG
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="flex h-screen items-center justify-center"><Spin size="large"/></div>;
    if (!user) return <Navigate to="/login" />;
    return children;
};

// 2. TRẠM KIỂM SOÁT GIAO THÔNG
const RootRedirect = () => {
    const { user, loading } = useAuth();
    if (loading) return <div className="flex h-screen items-center justify-center"><Spin size="large"/></div>;
    if (!user) return <Navigate to="/login" />;

    // Nếu là Admin thì đá thẳng vào trang duyệt KYC
    if (user.role === 'ADMIN') return <Navigate to="/admin/kyc" replace />;

    // Các role khác thì cho ra trang chủ
    return <Navigate to="/home" replace />;
};

function App() {
    return (
        <ConfigProvider
            theme={{
                algorithm: theme.defaultAlgorithm,
                token: {
                    colorPrimary: '#1677ff',
                    borderRadius: 8,
                },
                components: {
                    Layout: {
                        colorBgSider: '#001529',
                    },
                    Menu: {
                        darkItemColor: 'rgba(255, 255, 255, 0.85)',
                    },
                },
            }}
        >
            <Router>
                <Suspense fallback={<div className="flex h-screen items-center justify-center"><Spin size="large"/></div>}>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />

                        {/* Khi user gõ localhost:3000/ sẽ chạy qua Trạm kiểm soát */}
                        <Route path="/" element={<RootRedirect />} />

                        {/* ========================================================= */}
                        {/* NHÓM 1: CÁC TRANG CỦA KHÁN GIẢ (Bọc bằng MainLayout)      */}
                        {/* ========================================================= */}
                        <Route path="/home" element={<ProtectedRoute><MainLayout><LandingPage /></MainLayout></ProtectedRoute>} />
                        <Route path="/dashboard" element={<ProtectedRoute><MainLayout><HomePage /></MainLayout></ProtectedRoute>} />
                        <Route path="/betting" element={<ProtectedRoute><MainLayout><BettingPage /></MainLayout></ProtectedRoute>} />
                        <Route path="/wallet" element={<ProtectedRoute><MainLayout><WalletPage /></MainLayout></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><MainLayout><ProfilePage /></MainLayout></ProtectedRoute>} />
                        <Route path="/my-horses" element={<ProtectedRoute><MainLayout><h1>Quản Lý Ngựa</h1></MainLayout></ProtectedRoute>} />

                        {/* ========================================================= */}
                        {/* NHÓM 2: CÁC TRANG CỦA ADMIN (Bọc bằng AdminLayout)        */}
                        {/* ========================================================= */}
                        <Route path="/admin/kyc" element={
                            <ProtectedRoute>
                                <AdminLayout>
                                    <AdminKycApprovalPage />
                                </AdminLayout>
                            </ProtectedRoute>
                        } />

                        <Route path="/admin/tournaments" element={
                            <ProtectedRoute>
                                <AdminLayout>
                                    <AdminTournamentPage />
                                </AdminLayout>
                            </ProtectedRoute>
                        } />

                        {/* Bắt các link sai tự động đá về Home */}
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </Suspense>
            </Router>
        </ConfigProvider>
    );
}

export default App;