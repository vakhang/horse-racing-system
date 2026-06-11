import React, { useState, useEffect } from 'react';
import { Layout, Dropdown, Avatar, Tag } from 'antd';
import { UserOutlined, LogoutOutlined, WalletOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const { Header: AntHeader } = Layout;

const Header = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth() || {};
    const [balance, setBalance] = useState(0);

    const token = user?.token || localStorage.getItem('token');

    // Tự động lấy số dư ví khi Header được load
    // Tự động lấy số dư ví khi Header được load
    useEffect(() => {
        const fetchWalletBalance = () => {
            if (user?.id && token) {
                axios.get(`http://localhost:8080/api/wallets/my-wallet?userId=${user.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                    .then(res => setBalance(res.data.balance))
                    .catch(err => console.error("Lỗi lấy ví trên Header:", err));
            }
        };

        // 1. Gọi lần đầu khi vừa vào web
        fetchWalletBalance();

        // 2. Lắng nghe tín hiệu 'update_balance' từ các trang khác để tải lại số dư
        window.addEventListener('update_balance', fetchWalletBalance);

        // Dọn dẹp bộ nhớ
        return () => window.removeEventListener('update_balance', fetchWalletBalance);
    }, [user, token]);

    const handleLogout = () => {
        if (logout) logout();
        localStorage.clear();
        navigate('/login');
    };

    const items = [
        {
            key: '1',
            icon: <UserOutlined />,
            label: 'Hồ sơ cá nhân',
            onClick: () => navigate('/profile'),
        },
        {
            key: '2',
            icon: <LogoutOutlined className="text-red-500" />,
            label: <span className="text-red-500 font-medium">Đăng xuất</span>,
            onClick: handleLogout,
        },
    ];

    return (
        <AntHeader className="sticky top-0 z-50 w-full px-6 flex justify-end items-center shadow-sm bg-[#001529]" style={{ height: 64 }}>
            <div className="flex items-center gap-4">

                {user?.status === 'APPROVED' ? (
                    <Tag color="success">KYC: APPROVED</Tag>
                ) : (
                    <Tag color="warning">KYC: PENDING</Tag>
                )}
                <Tag color="blue">{user?.role}</Tag>

                {/* ĐÃ SỬA: HIỂN THỊ SỐ DƯ VÍ THỰC TẾ Ở ĐÂY */}
                <div className="flex items-center gap-2 font-bold px-3 h-[32px] bg-black/30 rounded-lg border border-yellow-500/30" style={{ color: 'white' }}>
                    <WalletOutlined style={{ color: '#facc15', fontSize: '18px' }} />
                    <span className="text-yellow-400">{balance.toLocaleString()} VNĐ</span>
                </div>

                <Dropdown menu={{ items }} placement="bottomRight" trigger={['click']}>
                    <div className="cursor-pointer flex items-center gap-3 hover:bg-white/10 px-3 py-1 rounded-md transition duration-300">
                        <Avatar icon={<UserOutlined />} className="bg-blue-500 border-none" />
                        <span className="font-semibold" style={{ color: 'white' }}>
                            {user?.username || localStorage.getItem('username') || 'Người dùng'}
                        </span>
                    </div>
                </Dropdown>
            </div>
        </AntHeader>
    );
};

export default Header;