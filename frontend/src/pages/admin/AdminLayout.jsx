import React, { useState } from 'react';
import { Layout, Menu, Avatar, Space, Typography, Dropdown } from 'antd';
import {
    TrophyOutlined, LogoutOutlined, UserOutlined, SettingOutlined,
    FileSearchOutlined, TeamOutlined, DollarOutlined,
    MenuFoldOutlined, MenuUnfoldOutlined,
    NotificationOutlined, EditOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";

const { Header, Sider, Content } = Layout;

const AdminLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { key: '/admin/users', icon: <TeamOutlined />, label: 'Quản Lý Tài Khoản' },
        { key: '/admin/finance', icon: <DollarOutlined />, label: 'Kế Toán & Dòng Tiền' },
        { key: '/admin/horses', icon: <FileSearchOutlined />, label: 'Duyệt Chiến Mã' },
        { key: '/admin/tournaments', icon: <TrophyOutlined />, label: 'Giải Đấu & Chặng Đua' },
        { key: '/admin/news', icon: <NotificationOutlined />, label: 'Đăng Thông Báo' },
        { key: '/admin/content', icon: <EditOutlined />, label: 'Quản Lý Nội Dung CMS' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const profileMenuItems = [
        { key: '1', icon: <UserOutlined />, label: 'Hồ sơ cá nhân', onClick: () => navigate('/profile') },
        { key: '2', icon: <LogoutOutlined className="text-red-500" />, label: <span className="text-red-500 font-bold">Đăng xuất</span>, onClick: handleLogout },
    ];

    return (
        <Layout className="min-h-screen font-sans">
            {/* ĐÃ BỎ trigger={null} ĐỂ NÚT THU GỌN TỰ ĐỘNG XUẤT HIỆN Ở DƯỚI CÙNG SIDEBAR */}
            <Sider collapsible collapsed={collapsed} onCollapse={(val) => setCollapsed(val)} theme="dark" width={260} className="shadow-2xl z-20" style={{ background: '#001529', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, transform: 'translateZ(0)' }}>
                <div className="h-16 m-4 flex items-center justify-center bg-gray-800 rounded-xl border border-gray-700 shadow-inner cursor-pointer" onClick={() => navigate('/admin/users')}>
                    <SettingOutlined className="text-2xl text-red-500 animate-spin-slow" />
                    {!collapsed && <span className="ml-3 text-white font-black text-xl tracking-widest uppercase">ADMIN PANEL</span>}
                </div>
                <Menu theme="dark" mode="inline" selectedKeys={[location.pathname]} items={menuItems} onClick={({ key }) => navigate(key)} className="text-base font-medium mt-4" style={{ flex: 1, backgroundColor: '#001529' }} />
            </Sider>

            <Layout className="bg-gray-200">
                {/* HEADER ĐÃ ĐƯỢC LÀM SẠCH VÀ ÉP MÀU TRẮNG CHO CHỮ */}
                <Header className="bg-[#001529] p-0 flex items-center justify-end shadow-sm px-6 h-16 z-10">
                    <Space size="large" className="mr-4">
                        <div className="flex items-center gap-3 bg-red-500/20 px-4 py-1.5 rounded-full border border-red-500/50 hidden sm:flex">
                            <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>
                            {/* Ép cứng màu trắng bằng style={{ color: 'white' }} */}
                            <span style={{ color: 'white' }} className="font-bold uppercase text-xs tracking-wider">Hệ Thống Đang Chạy</span>
                        </div>

                        <Dropdown menu={{ items: profileMenuItems }} placement="bottomRight" trigger={['click']}>
                            <div className="cursor-pointer flex items-center gap-3 hover:bg-white/10 px-3 py-1 rounded-md transition duration-300">
                                <Avatar icon={<UserOutlined />} className="bg-blue-600 border-none" />
                                <div className="flex flex-col leading-tight hidden md:flex ml-1">
                                    <span className="font-semibold text-white text-sm">{user?.username || 'Admin Tối Cao'}</span>
                                    <span className="text-xs text-gray-400 font-medium">{user?.role || 'SYSTEM ADMIN'}</span>
                                </div>
                            </div>
                        </Dropdown>
                    </Space>
                </Header>
                <Content className="m-0 p-0 overflow-auto">{children}</Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;