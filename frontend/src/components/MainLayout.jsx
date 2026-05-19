import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Space, Typography, Tag } from 'antd';
import {
    MenuFoldOutlined, MenuUnfoldOutlined, DashboardOutlined, UserOutlined,
    SafetyOutlined, TrophyOutlined, TeamOutlined, WalletOutlined, LogoutOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/App.css'; // Sẽ tạo file css này sau

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const MainLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Định nghĩa các Menu Item dựa trên Role (Tư duy quản lý 5 Role)
    const menuItems = [
        { key: '/', icon: <DashboardOutlined />, label: 'Bảng Điều Khiển' },

        // Chỉ hiện Menu "Cá Cược" cho Khán giả (Role Spectator)
        ...(user?.role === 'SPECTATOR' ? [
            { key: '/betting', icon: <WalletOutlined />, label: 'Cá Cược Ngay' }
        ] : []),

        // Chỉ hiện Menu "Quản Lý Ngựa" cho Chủ ngựa (Role Owner)
        ...(user?.role === 'OWNER' ? [
            { key: '/my-horses', icon: <TeamOutlined />, label: 'Trại Ngựa Của Tôi' }
        ] : []),

        // Chỉ hiện Menu "Duyệt KYC" cho Admin (Role Admin)
        ...(user?.role === 'ADMIN' ? [
            { key: '/admin/kyc', icon: <SafetyOutlined />, label: 'Duyệt Tài Khoản' }
        ] : []),

        { key: '/profile', icon: <UserOutlined />, label: 'Hồ Sơ Cá Nhân' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        // Dùng AntD Layout kết hợp Tailwind để chia khung
        <Layout className="min-h-screen">
            {/* 1. SIDEBAR BÊN TRÁI - Tái hiện như hình image_096868.jpg */}
            <Sider trigger={null} collapsible collapsed={collapsed} theme="dark">
                <div className="logo h-16 m-4 flex items-center justify-center bg-gray-700 rounded-lg">
                    <TrophyOutlined className="text-3xl text-yellow-400" />
                    {!collapsed && <span className="ml-2 text-white font-bold text-lg">HORSE RACE</span>}
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={({ key }) => navigate(key)}
                />
            </Sider>

            {/* 2. KHU VỰC NỘI DUNG CHÍNH */}
            <Layout>
                {/* HEADER BÊN TRÊN - Chứa thông tin User và Ví */}
                <Header className="bg-white p-0 flex items-center justify-between shadow-md px-4">
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        className="text-lg w-16 h-16"
                    />

                    <Space size="large">
                        {/* Hiện Ví và Trạng Thái KYC */}
                        {user && (
                            <>
                                <Tag color={user.status === 'APPROVED' ? 'green' : 'orange'}>
                                    KYC: {user.status}
                                </Tag>
                                <Space>
                                    <WalletOutlined className="text-xl text-blue-600" />
                                    <Text strong>{user.balance?.toLocaleString('vi-VN')} điểm</Text>
                                </Space>
                            </>
                        )}

                        {/* Dropdown thông tin User */}
                        <Space>
                            <Avatar icon={<UserOutlined />} src={user?.idCardUrl} />
                            <Text strong>{user?.username}</Text>
                            <Tag color="blue">{user?.role}</Tag>
                            <Button type="link" icon={<LogoutOutlined />} onClick={handleLogout}>Đăng xuất</Button>
                        </Space>
                    </Space>
                </Header>

                {/* NỘI DUNG TRANG (PAGE CONTENT) */}
                <Content className="m-6 p-6 bg-gray-50 rounded-lg">
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;