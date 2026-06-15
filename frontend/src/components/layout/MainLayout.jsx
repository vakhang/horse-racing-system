import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
// Import thêm icon cho Owner
import { HomeOutlined, HistoryOutlined, DollarOutlined, BankOutlined, FlagOutlined, AppstoreAddOutlined } from '@ant-design/icons';
import Header from './Header';

// Thêm hook lấy thông tin user đăng nhập
import { useAuth } from '../../context/AuthContext'; // Sếp chú ý đường dẫn xem đúng thư mục chưa nha

const { Content, Sider } = Layout;

const MainLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Lấy thông tin user để biết Role
    const { user } = useAuth();

    // 1. MENU CHUNG (Ai cũng thấy)
    const baseMenuItems = [
        { key: '/home', icon: <HomeOutlined />, label: 'Trang Chủ' },
    ];

    // 2. MENU DÀNH RIÊNG CHO KHÁN GIẢ (SPECTATOR)
    const spectatorMenuItems = [
        ...baseMenuItems,
        { key: '/dashboard', icon: <HistoryOutlined />, label: 'Ví của tôi' },
        { key: '/betting', icon: <DollarOutlined />, label: 'Cá Cược Ngay' },
        { key: '/wallet', icon: <BankOutlined />, label: 'Nạp / Rút Tiền' },
    ];

    // 3. MENU DÀNH RIÊNG CHO CHỦ NGỰA (OWNER)
    const ownerMenuItems = [
        ...baseMenuItems,
        { key: '/my-horses', icon: <AppstoreAddOutlined />, label: 'Quản Lý Ngựa' },
        { key: '/owner/races', icon: <FlagOutlined />, label: 'Đăng Ký Thi Đấu' },
    ];

    // Sếp có thể tạo sẵn menu cho JOCKEY ở đây luôn cho tiện về sau
    const jockeyMenuItems = [
        ...baseMenuItems,
        { key: '/jockey/invitations', icon: <FlagOutlined />, label: 'Lời Mời Thi Đấu' }, // Mẫu trước, tính sau
    ];

    // 4. QUYẾT ĐỊNH HIỂN THỊ MENU NÀO
    let currentMenuItems = spectatorMenuItems; // Mặc định là khán giả

    if (user?.role === 'OWNER') {
        currentMenuItems = ownerMenuItems;
    } else if (user?.role === 'JOCKEY') {
        currentMenuItems = jockeyMenuItems;
    }

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

                {/* TRUYỀN BIẾN currentMenuItems ĐÃ CHIA Ở TRÊN VÀO ĐÂY */}
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={currentMenuItems}
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