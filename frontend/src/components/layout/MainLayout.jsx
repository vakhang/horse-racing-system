import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { DashboardOutlined, DollarOutlined, UserOutlined } from '@ant-design/icons';
import Header from './Header';

const { Content, Sider } = Layout;

const MainLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // SỬA LỖI MENU: Đổi key của Hồ Sơ Cá Nhân thành "/profile"
    const menuItems = [
        { key: '/', icon: <DashboardOutlined />, label: 'Bảng Điều Khiển' },
        { key: '/betting', icon: <DollarOutlined />, label: 'Cá Cược Ngay' },
        { key: '/profile', icon: <UserOutlined />, label: 'Hồ Sơ Cá Nhân' },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* THÊM position: 'fixed' ĐỂ CỐ ĐỊNH SIDEBAR */}
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={(value) => setCollapsed(value)}
                theme="dark"
                style={{
                    overflow: 'auto',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    zIndex: 100 // Đảm bảo luôn nằm trên
                }}
            >
                <div className="h-16 flex items-center justify-center text-white font-bold text-xl tracking-wider m-4 bg-white/10 rounded-lg cursor-pointer" onClick={() => navigate('/')}>
                    {collapsed ? 'HR' : 'HORSE RACE'}
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={(e) => navigate(e.key)}
                />
            </Sider>

            {/* ĐẨY GIAO DIỆN SANG PHẢI (margin-left) ĐỂ KHÔNG BỊ SIDEBAR ĐÈ LÊN */}
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