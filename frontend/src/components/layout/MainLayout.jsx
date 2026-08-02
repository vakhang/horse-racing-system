import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    FileProtectOutlined, HomeOutlined, HistoryOutlined,
    DollarOutlined, BankOutlined, FlagOutlined,
    AppstoreAddOutlined, TeamOutlined, ExportOutlined
} from '@ant-design/icons';
import Header from './Header';
import Footer from './Footer';
import { useAuth } from '../../context/AuthContext';

const { Content, Sider } = Layout;

// [Chức năng rõ ràng]: Component Khung Giao diện chung (Layout)
// [Tác dụng]: Bao bọc tất cả các trang bên trong. Gắn `Header` ở trên, `Footer` ở dưới và thẻ `<Outlet>` để render ruột của trang (React Router).
// [Hướng dẫn sửa đổi]:
// - UI: Thêm Sidebar (thanh bên) vào layout này nếu muốn đổi thiết kế.
const MainLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const baseMenuItems = [
        { key: '/home', icon: <HomeOutlined />, label: 'Trang Chủ' },
    ];

    const spectatorMenuItems = [
        ...baseMenuItems,
        { key: '/betting', icon: <DollarOutlined />, label: 'Cá Cược Ngay' },
        {
            key: 'finance',
            icon: <BankOutlined />,
            label: 'Quản Lý Tài Chính',
            children: [
                { key: '/dashboard', icon: <HistoryOutlined />, label: 'Lịch Sử Giao Dịch' },
                { key: '/wallet', icon: <ExportOutlined />, label: 'Giao Dịch Nạp / Rút' }
            ]
        }
    ];

    const ownerMenuItems = [
        ...baseMenuItems,
        { key: '/my-horses', icon: <AppstoreAddOutlined />, label: 'Quản Lý Chiến Mã' },
        { key: '/owner/races', icon: <FlagOutlined />, label: 'Đăng Ký Thi Đấu' },
        { key: '/owner/jockeys', icon: <TeamOutlined />, label: 'Thị Trường Nài Ngựa' },
        {
            key: 'finance',
            icon: <BankOutlined />,
            label: 'Quản Lý Tài Chính',
            children: [
                { key: '/dashboard', icon: <HistoryOutlined />, label: 'Lịch Sử Thu Nhập' },
                { key: '/wallet', icon: <ExportOutlined />, label: 'Yêu Cầu Rút Tiền' }
            ]
        }
    ];

    const jockeyMenuItems = [
        ...baseMenuItems,
        { key: '/jockey/invitations', icon: <FlagOutlined />, label: 'Lời Mời Thi Đấu' },
        {
            key: 'finance',
            icon: <BankOutlined />,
            label: 'Quản Lý Tài Chính',
            children: [
                { key: '/dashboard', icon: <HistoryOutlined />, label: 'Lịch Sử Thu Nhập' },
                { key: '/wallet', icon: <ExportOutlined />, label: 'Yêu Cầu Rút Tiền' }
            ]
        }
    ];

    const refereeMenuItems = [
        ...baseMenuItems,
        { key: '/referee/dashboard', icon: <FileProtectOutlined />, label: 'Bàn Trọng Tài' },
        {
            key: 'finance',
            icon: <BankOutlined />,
            label: 'Quản Lý Tài Chính',
            children: [
                { key: '/dashboard', icon: <HistoryOutlined />, label: 'Lịch Sử Thu Nhập' },
                { key: '/wallet', icon: <ExportOutlined />, label: 'Yêu Cầu Rút Tiền' }
            ]
        }
    ];

    let currentMenuItems = spectatorMenuItems;
    if (user?.role === 'OWNER') currentMenuItems = ownerMenuItems;
    else if (user?.role === 'JOCKEY') currentMenuItems = jockeyMenuItems;
    else if (user?.role === 'REFEREE') currentMenuItems = refereeMenuItems;

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} theme="dark" width={260} style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100 }}>
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

            <Layout style={{ marginLeft: collapsed ? 80 : 260, transition: 'all 0.2s' }}>
                <Header />
                <Content className="m-6 p-6 bg-white rounded-lg shadow-sm overflow-initial">
                    {children}
                </Content>
                <Footer />
            </Layout>
        </Layout>
    );
};

export default MainLayout;