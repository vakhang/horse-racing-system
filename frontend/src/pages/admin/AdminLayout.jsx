import React, { useState } from 'react';
import { Layout, Menu, Avatar, Space, Dropdown } from 'antd';
import { TrophyOutlined, LogoutOutlined, UserOutlined, SettingOutlined, FileSearchOutlined, TeamOutlined, DollarOutlined, NotificationOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";

const { Header, Sider, Content } = Layout;

// [Chức năng rõ ràng]: bet365 Admin Layout
const AdminLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { key: '/admin/users', icon: <TeamOutlined className="text-[#00b37e]" />, label: 'Quản Lý Tài Khoản' },
        { key: '/admin/finance', icon: <DollarOutlined className="text-[#fcc200]" />, label: 'Kế Toán & Dòng Tiền' },
        { key: '/admin/horses', icon: <FileSearchOutlined className="text-[#00b37e]" />, label: 'Quản Lý Chiến Mã' },
        { key: '/admin/tournaments', icon: <TrophyOutlined className="text-[#fcc200]" />, label: 'Giải Đấu & Chặng Đua' },
        { key: '/admin/news', icon: <NotificationOutlined className="text-[#00b37e]" />, label: 'Đăng Thông Báo' },
        { key: '/admin/content', icon: <EditOutlined className="text-[#fcc200]" />, label: 'Quản Lý Nội Dung' },
    ];

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    const profileMenuItems = [
        { key: '1', icon: <UserOutlined />, label: 'Hồ sơ cá nhân', onClick: () => navigate('/profile') },
        { key: '2', icon: <LogoutOutlined className="text-red-400" />, label: <span className="text-red-400 font-bold">Đăng xuất</span>, onClick: handleLogout },
    ];

    return (
        <Layout className="min-h-screen font-sans bg-[#121212]">
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={(val) => setCollapsed(val)}
                theme="dark"
                width={260}
                className="shadow-2xl z-20"
                style={{
                    backgroundColor: '#181818',
                    borderRight: '1px solid #282828',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100vh',
                    position: 'sticky',
                    top: 0
                }}
            >
                <div className="h-16 m-3 flex items-center justify-center bg-[#005c44] rounded-lg border border-[#007355] shadow-inner cursor-pointer" onClick={() => navigate('/admin/users')}>
                    <SettingOutlined className="text-2xl text-[#fcc200] animate-spin-slow" />
                    {!collapsed && <span className="ml-3 text-white font-black text-xl tracking-widest uppercase">ADMIN 989</span>}
                </div>
                <Menu theme="dark" mode="inline" selectedKeys={[location.pathname]} items={menuItems} onClick={({ key }) => navigate(key)} className="text-base font-medium mt-2" style={{ flex: 1, backgroundColor: '#181818' }} />
            </Sider>

            <Layout className="bg-[#121212]">
                <Header className="bg-[#005c44] p-0 flex items-center justify-end shadow-md px-6 h-16 z-10 border-b border-[#007355]">
                    <Space size="large" className="mr-4">
                        <div className="flex items-center gap-3 bg-black/30 px-4 py-1.5 rounded-full border border-[#fcc200]/40 hidden sm:flex">
                            <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00b37e] opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-[#00b37e]"></span></span>
                            <span style={{ color: '#fcc200' }} className="font-bold uppercase text-xs tracking-wider">Hệ Thống Admin Bet989 Active</span>
                        </div>

                        <Dropdown menu={{ items: profileMenuItems }} placement="bottomRight" trigger={['click']}>
                            <div className="cursor-pointer flex items-center gap-3 hover:bg-black/20 px-3 py-1.5 rounded-md transition duration-300 border border-white/10">
                                <Avatar icon={<UserOutlined />} className="bg-[#007355] text-white border-none" />
                                <div className="flex flex-col leading-tight hidden md:flex ml-1">
                                    <span className="font-semibold text-white text-sm">{user?.username || 'Admin Tối Cao'}</span>
                                    <span className="text-xs text-[#fcc200] font-medium">{user?.role || 'SYSTEM ADMIN'}</span>
                                </div>
                            </div>
                        </Dropdown>
                    </Space>
                </Header>
                <Content className="m-6 p-6 bg-[#1e1e1e] rounded-xl border border-[#2c2c2c] shadow-xl overflow-auto">{children}</Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;