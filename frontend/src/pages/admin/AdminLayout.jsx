import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Space, Typography } from 'antd';
import {
    MenuFoldOutlined, MenuUnfoldOutlined,
    SafetyCertificateOutlined, TrophyOutlined,
    LogoutOutlined, UserOutlined, SettingOutlined,
    FileSearchOutlined // Thêm icon này cho trang Duyệt Ngựa
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AdminLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // MENU DÀNH RIÊNG CHO ADMIN
    const menuItems = [
        {
            key: '/admin/kyc',
            icon: <SafetyCertificateOutlined />,
            label: 'Kiểm Duyệt KYC',
        },
        {
            key: '/admin/horses', // ĐÃ THÊM MENU DUYỆT NGỰA
            icon: <FileSearchOutlined />,
            label: 'Duyệt Chiến Mã',
        },
        {
            key: '/admin/tournaments',
            icon: <TrophyOutlined />,
            label: 'Giải Đấu & Chặng Đua',
        },
        // Chừa sẵn chỗ cho Kế toán
        // { key: '/admin/finance', icon: <DollarOutlined />, label: 'Kế Toán (Nạp/Rút)' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Layout className="min-h-screen font-sans">
            {/* SIDEBAR ADMIN - Tông màu đen quyền lực */}
            <Sider trigger={null} collapsible collapsed={collapsed} theme="dark" width={260} className="shadow-2xl z-20">
                <div className="h-16 m-4 flex items-center justify-center bg-gray-800 rounded-xl border border-gray-700 shadow-inner">
                    <SettingOutlined className="text-2xl text-red-500 animate-spin-slow" />
                    {!collapsed && <span className="ml-3 text-white font-black text-xl tracking-widest uppercase">ADMIN PANEL</span>}
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={({ key }) => navigate(key)}
                    className="text-base font-medium mt-4"
                />
            </Sider>

            <Layout className="bg-gray-200">
                {/* HEADER ADMIN */}
                <Header className="bg-white p-0 flex items-center justify-between shadow-sm px-6 h-16 z-10">
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        className="text-xl w-12 h-12 flex items-center justify-center hover:bg-gray-100 rounded-full transition-all"
                    />

                    <Space size="large" className="mr-4">
                        <div className="flex items-center gap-3 bg-red-50 px-4 py-1.5 rounded-full border border-red-100 hidden sm:flex">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                            <Text className="text-red-600 font-bold uppercase text-xs tracking-wider">Hệ Thống Đang Chạy</Text>
                        </div>

                        {/* Info Admin & Nút Đăng xuất */}
                        <Space className="cursor-pointer hover:bg-gray-50 p-1 pr-3 rounded-full border border-transparent hover:border-gray-200 transition-all">
                            <Avatar icon={<UserOutlined />} className="bg-blue-600 w-10 h-10 flex items-center justify-center" />
                            <div className="flex flex-col leading-tight hidden md:flex ml-1">
                                <Text strong className="text-gray-800 text-sm">{user?.username || 'Admin Tối Cao'}</Text>
                                <Text className="text-xs text-gray-500 font-medium">{user?.role || 'SYSTEM ADMIN'}</Text>
                            </div>
                            <Button type="text" danger icon={<LogoutOutlined />} onClick={handleLogout} className="ml-2 font-bold flex items-center">
                                THOÁT
                            </Button>
                        </Space>
                    </Space>
                </Header>

                {/* CONTENT ADMIN */}
                <Content className="m-0 p-0 overflow-auto">
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;