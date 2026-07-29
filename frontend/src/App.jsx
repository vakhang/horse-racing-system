import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
const CorporateLandingPage = lazy(() => import('./pages/CorporateLandingPage'));
const ProfilePage = lazy(() => import('./pages/user/ProfilePage'));
const BettingPage = lazy(() => import('./pages/user/BettingPage'));
const JockeyInvitationPage = lazy(() => import('./pages/jockey/JockeyInvitationPage'));
const RefereeDashboardPage = lazy(() => import('./pages/referee/RefereeDashboardPage'));
const AdminUserManagementPage = lazy(() => import('./pages/admin/AdminUserManagementPage'));
const AdminFinancePage = lazy(() => import('./pages/admin/AdminFinancePage'));
const OwnerJockeyDirectoryPage = lazy(() => import('./pages/owner/OwnerJockeyDirectoryPage'));
const AdminNewsPage = lazy(() => import('./pages/admin/AdminNewsPage'));
const AdminContentPage = lazy(() => import('./pages/admin/AdminContentPage'));

// Các trang Public (Dành cho khách chưa đăng nhập)
const AboutPage = lazy(() => import('./pages/public/AboutPage'));
const SchedulePage = lazy(() => import('./pages/public/SchedulePage'));
const ResultsPage = lazy(() => import('./pages/public/ResultsPage'));
const NewsPage = lazy(() => import('./pages/public/NewsPage'));
const GuidePage = lazy(() => import('./pages/public/GuidePage'));
const TermsPage = lazy(() => import('./pages/public/TermsPage'));
const RulesPage = lazy(() => import('./pages/public/RulesPage'));
const RaceRulesPage = lazy(() => import('./pages/public/RaceRulesPage'));
const PrivacyPage = lazy(() => import('./pages/public/PrivacyPage'));
const FAQPage = lazy(() => import('./pages/public/FAQPage'));

// Các trang của Admin
const AdminKycApprovalPage = lazy(() => import('./pages/admin/AdminKycApprovalPage'));
const AdminTournamentPage = lazy(() => import('./pages/admin/AdminTournamentPage'));
// --- ĐÃ THÊM: IMPORT COMPONENT DUYỆT NGỰA ---
const AdminHorseApprovalPage = lazy(() => import('./pages/admin/AdminHorseApprovalPage'));

// Các trang của Owner
const OwnerRaceRegistrationPage = lazy(() => import('./pages/owner/OwnerRaceRegistrationPage'));
const OwnerHorseManagementPage = lazy(() => import('./pages/owner/OwnerHorseManagementPage'));

// 0. COMPONENT CUỘN LÊN ĐẦU TRANG
const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
};

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
    if (!user) return <CorporateLandingPage />;

    // Phân luồng đăng nhập
    if (user.role === 'ADMIN') return <Navigate to="/admin/kyc" replace />;
    if (user.role === 'OWNER') return <Navigate to="/my-horses" replace />;
    if (user.role === 'JOCKEY') return <Navigate to="/jockey/invitations" replace />;
    if (user.role === 'REFEREE') return <Navigate to="/referee/dashboard" replace />;
    if (user.role === 'ADMIN') return <Navigate to="/admin/users" replace />;

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
                <ScrollToTop />
                <Suspense fallback={<div className="flex h-screen items-center justify-center"><Spin size="large"/></div>}>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />

                        <Route path="/" element={<RootRedirect />} />

                        {/* NHÓM PUBLIC: Các trang không yêu cầu đăng nhập */}
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/schedule" element={<SchedulePage />} />
                        <Route path="/results" element={<ResultsPage />} />
                        <Route path="/news" element={<NewsPage />} />
                        <Route path="/guide" element={<GuidePage />} />
                        <Route path="/terms" element={<TermsPage />} />
                        <Route path="/rules" element={<RulesPage />} />
                        <Route path="/race-rules" element={<RaceRulesPage />} />
                        <Route path="/privacy" element={<PrivacyPage />} />
                        <Route path="/faq" element={<FAQPage />} />

                        {/* ========================================================= */}
                        {/* NHÓM 1: CÁC TRANG CỦA KHÁN GIẢ & CHỦ NGỰA (Bọc bằng MainLayout) */}
                        {/* ========================================================= */}
                        <Route path="/home" element={<ProtectedRoute><MainLayout><LandingPage /></MainLayout></ProtectedRoute>} />
                        <Route path="/dashboard" element={<ProtectedRoute><MainLayout><HomePage /></MainLayout></ProtectedRoute>} />
                        <Route path="/betting" element={<ProtectedRoute><MainLayout><BettingPage /></MainLayout></ProtectedRoute>} />
                        <Route path="/wallet" element={<ProtectedRoute><MainLayout><WalletPage /></MainLayout></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><MainLayout><ProfilePage /></MainLayout></ProtectedRoute>} />
                        <Route path="/admin/users" element={
                            <ProtectedRoute><AdminLayout><AdminUserManagementPage /></AdminLayout></ProtectedRoute>
                        } />
                        <Route path="/admin/finance" element={
                            <ProtectedRoute><AdminLayout><AdminFinancePage /></AdminLayout></ProtectedRoute>
                        } />
                        <Route path="/my-horses" element={
                            <ProtectedRoute>
                                <MainLayout>
                                    <OwnerHorseManagementPage />
                                </MainLayout>
                            </ProtectedRoute>
                        } />

                        <Route path="/owner/races" element={
                            <ProtectedRoute>
                                <MainLayout>
                                    <OwnerRaceRegistrationPage />
                                </MainLayout>
                            </ProtectedRoute>
                        } />

                        {/* --- TRANG CỦA NÀI NGỰA & TRỌNG TÀI --- */}
                        <Route path="/jockey/invitations" element={
                            <ProtectedRoute><MainLayout><JockeyInvitationPage /></MainLayout></ProtectedRoute>
                        } />

                        <Route path="/referee/dashboard" element={
                            <ProtectedRoute><MainLayout><RefereeDashboardPage /></MainLayout></ProtectedRoute>
                        } />
                        {/* Nhóm của OWNER */}
                        <Route path="/owner/jockeys" element={<ProtectedRoute><MainLayout><OwnerJockeyDirectoryPage /></MainLayout></ProtectedRoute>} />

                        {/* Nhóm của ADMIN */}
                        <Route path="/admin/news" element={<ProtectedRoute><AdminLayout><AdminNewsPage /></AdminLayout></ProtectedRoute>} />
                        <Route path="/admin/content" element={<ProtectedRoute><AdminLayout><AdminContentPage /></AdminLayout></ProtectedRoute>} />

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

                        {/* --- ĐÃ SỬA: GẮN ROUTE DUYỆT NGỰA VÀO ĐÂY --- */}
                        <Route path="/admin/horses" element={
                            <ProtectedRoute>
                                <AdminLayout>
                                    <AdminHorseApprovalPage />
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

                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </Suspense>
            </Router>
        </ConfigProvider>
    );
}

export default App;