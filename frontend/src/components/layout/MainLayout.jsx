import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    FileProtectOutlined, HomeOutlined, HistoryOutlined,
    DollarOutlined, BankOutlined, FlagOutlined,
    AppstoreAddOutlined, TeamOutlined, ExportOutlined,
    TrophyOutlined, RocketOutlined
} from '@ant-design/icons';
import Header from './Header';
import Footer from './Footer';
import { useAuth } from '../../context/AuthContext';

const { Content, Sider } = Layout;

// [Chức năng rõ ràng]: bet365 Sports Main Layout
const MainLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const baseMenuItems = [
        { key: '/home', icon: <HomeOutlined className="text-[#00b37e]" />, label: 'Trang Chủ Sports' },
    ];

    const spectatorMenuItems = [
        ...baseMenuItems,
        { key: '/betting', icon: <RocketOutlined className="text-[#fcc200]" />, label: 'Đua Ngựa Cá Cược' },
        {
            key: 'finance',
            icon: <BankOutlined className="text-[#00b37e]" />,
            label: 'Quản Lý Tài Chính',
            children: [
                { key: '/dashboard', icon: <HistoryOutlined />, label: 'Lịch Sử Vé Cược' },
                { key: '/wallet', icon: <ExportOutlined />, label: 'Giao Dịch Nạp / Rút' }
            ]
        }
    ];

    const ownerMenuItems = [
        ...baseMenuItems,
        { key: '/my-horses', icon: <AppstoreAddOutlined className="text-[#fcc200]" />, label: 'Quản Lý Chiến Mã' },
        { key: '/owner/races', icon: <FlagOutlined className="text-[#00b37e]" />, label: 'Đăng Ký Thi Đấu' },
        { key: '/owner/jockeys', icon: <TeamOutlined className="text-[#fcc200]" />, label: 'Thị Trường Nài Ngựa' },
        {
            key: 'finance',
            icon: <BankOutlined className="text-[#00b37e]" />,
            label: 'Quản Lý Tài Chính',
            children: [
                { key: '/dashboard', icon: <HistoryOutlined />, label: 'Lịch Sử Thu Nhập' },
                { key: '/wallet', icon: <ExportOutlined />, label: 'Yêu Cầu Rút Tiền' }
            ]
        }
    ];

    const jockeyMenuItems = [
        ...baseMenuItems,
        { key: '/jockey/invitations', icon: <FlagOutlined className="text-[#fcc200]" />, label: 'Lời Mời Thi Đấu' },
        {
            key: 'finance',
            icon: <BankOutlined className="text-[#00b37e]" />,
            label: 'Quản Lý Tài Chính',
            children: [
                { key: '/dashboard', icon: <HistoryOutlined />, label: 'Lịch Sử Thu Nhập' },
                { key: '/wallet', icon: <ExportOutlined />, label: 'Yêu Cầu Rút Tiền' }
            ]
        }
    ];

    const refereeMenuItems = [
        ...baseMenuItems,
        { key: '/referee/dashboard', icon: <FileProtectOutlined className="text-[#fcc200]" />, label: 'Bàn Trọng Tài' },
        {
            key: 'finance',
            icon: <BankOutlined className="text-[#00b37e]" />,
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
        <Layout style={{ minHeight: '100vh', backgroundColor: '#121212' }}>
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={(value) => setCollapsed(value)}
                theme="dark"
                width={260}
                style={{
                    overflow: 'auto',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    zIndex: 100,
                    backgroundColor: '#181818',
                    borderRight: '1px solid #282828'
                }}
            >
                {/* LOGO PARODY THEME BET989 */}
                <div
                    className="h-16 flex items-center justify-center m-3 bg-[#005c44] rounded-lg cursor-pointer border border-[#007355] shadow-lg transition-transform hover:scale-105"
                    onClick={() => navigate('/home')}
                >
                    {collapsed ? (
                        <span className="text-[#fcc200] font-black text-xl tracking-tighter">989</span>
                    ) : (
                        <div className="flex items-center gap-1.5 font-black text-xl tracking-wide">
                            <span className="text-white bg-[#004633] px-2 py-0.5 rounded text-base">bet</span>
                            <span className="text-[#fcc200] text-2xl tracking-tighter italic">989</span>
                            <span className="text-xs text-emerald-300 font-bold ml-1 uppercase">RACING</span>
                        </div>
                    )}
                </div>

                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={currentMenuItems}
                    onClick={(e) => navigate(e.key)}
                    className="font-medium text-sm mt-2"
                />
            </Sider>

            <Layout style={{ marginLeft: collapsed ? 80 : 260, transition: 'all 0.2s', backgroundColor: '#121212' }}>
                <Header />
                <Content className="m-6 p-6 bg-[#1e1e1e] rounded-xl border border-[#2c2c2c] shadow-xl overflow-initial">
                    {children}
                </Content>
                <Footer />
            </Layout>
        </Layout>
    );
};

export default MainLayout;