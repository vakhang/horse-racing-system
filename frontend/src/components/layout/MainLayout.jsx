// @ts-nocheck
import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    FileProtectOutlined, HomeOutlined, HistoryOutlined,
    DollarOutlined, BankOutlined, FlagOutlined,
    AppstoreAddOutlined, TeamOutlined
} from '@ant-design/icons';
import Header from './Header';
import { useAuth } from '../../context/AuthContext';

const { Content, Sider } = Layout;

const MainLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Lấy thông tin user để biết Role
    const { user } = useAuth();

    const baseMenuItems = [
        { key: '/home', icon: <HomeOutlined />, label: 'Trang Chủ' },
    ];

    const spectatorMenuItems = [
        ...baseMenuItems,
        { key: '/dashboard', icon: <HistoryOutlined />, label: 'Ví của tôi' },
        { key: '/betting', icon: <DollarOutlined />, label: 'Cá Cược Ngay' },
        { key: '/wallet', icon: <BankOutlined />, label: 'Nạp / Rút Tiền' },
    ];

    // MENU CẬP NHẬT MỚI: Đã gộp Thống kê doanh thu và Quản lý ví thành 1
    const ownerMenuItems = [
        ...baseMenuItems,
        { key: '/my-horses', icon: <AppstoreAddOutlined />, label: 'Quản Lý Chiến Mã' },
        { key: '/owner/races', icon: <FlagOutlined />, label: 'Đăng Ký Thi Đấu' },
        { key: '/owner/jockeys', icon: <TeamOutlined />, label: 'Thị Trường Nài Ngựa' },
        { key: '/wallet', icon: <BankOutlined />, label: 'Quản Lý Tài Chính' },
    ];

    const jockeyMenuItems = [
        ...baseMenuItems,
        { key: '/jockey/invitations', icon: <FlagOutlined />, label: 'Lời Mời Thi Đấu' },
        { key: '/dashboard', icon: <HistoryOutlined />, label: 'Thu Nhập Của Tôi' },
    ];

    const refereeMenuItems = [
        ...baseMenuItems,
        { key: '/referee/dashboard', icon: <FileProtectOutlined />, label: 'Bàn Trọng Tài' },
    ];

    let currentMenuItems = spectatorMenuItems;

    if (user?.role === 'OWNER') {
        currentMenuItems = ownerMenuItems;
    } else if (user?.role === 'JOCKEY') {
        currentMenuItems = jockeyMenuItems;
    } else if (user?.role === 'REFEREE') {
        currentMenuItems = refereeMenuItems;
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} theme="dark" style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100 }}>
                <div className="h-16 flex items-center justify-center text-white font-bold text-xl tracking-wider m-4 bg-white/10 rounded-lg cursor-pointer" onClick={() => navigate('/home')}>
                    {collapsed ? 'HR' : 'HORSE RACE'}
                </div>

                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={currentMenuItems}
                    onClick={(e) => navigate(e.key)}
                />
            </Sider>

            <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
                <Header />
                <Content className="m-6 p-6 bg-white rounded-lg shadow-sm overflow-initial">
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;