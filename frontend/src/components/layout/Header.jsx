import React, { useState, useEffect } from 'react';
import { Layout, Dropdown, Avatar, Tag, Badge, Popover, List, Typography } from 'antd';
import { UserOutlined, LogoutOutlined, WalletOutlined, BellOutlined, NotificationOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import dayjs from 'dayjs';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const Header = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth() || {};
    const [balance, setBalance] = useState(0);
    const [notifications, setNotifications] = useState([]);

    const token = user?.token || localStorage.getItem('token');

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

        const generateNotifications = () => {
            let notifs = [];
            // 1. Thông báo trạng thái KYC
            if (user?.status === 'APPROVED') {
                notifs.push({ title: 'Tài khoản đã xác minh', desc: 'Bạn có thể sử dụng toàn bộ tính năng hệ thống.', color: 'green' });
            } else if (user?.status === 'PENDING') {
                notifs.push({ title: 'Chờ duyệt KYC', desc: 'Vui lòng đợi Admin kiểm tra hồ sơ của bạn.', color: 'orange' });
            }

            // 2. Lấy thông báo từ Admin (Lưu ở LocalStorage)
            const adminNews = JSON.parse(localStorage.getItem('admin_announcements') || '[]');
            adminNews.forEach(news => {
                notifs.push({ title: '📢 TIN TỪ BAN TỔ CHỨC', desc: news.content, color: 'blue', date: news.date });
            });

            setNotifications(notifs);
        };

        fetchWalletBalance();
        generateNotifications();
        window.addEventListener('update_balance', fetchWalletBalance);
        return () => window.removeEventListener('update_balance', fetchWalletBalance);
    }, [user, token]);

    const handleLogout = () => {
        if (logout) logout();
        localStorage.clear();
        navigate('/login');
    };

    const profileMenuItems = [
        { key: '1', icon: <UserOutlined />, label: 'Hồ sơ cá nhân', onClick: () => navigate('/profile') },
        { key: '2', icon: <LogoutOutlined className="text-red-500" />, label: <span className="text-red-500 font-medium">Đăng xuất</span>, onClick: handleLogout },
    ];

    const notificationContent = (
        <div className="w-80 max-h-96 overflow-y-auto">
            <List
                itemLayout="horizontal"
                dataSource={notifications}
                renderItem={item => (
                    <List.Item className="border-b last:border-b-0 hover:bg-gray-50 cursor-pointer px-4 py-3 transition-colors">
                        <List.Item.Meta
                            avatar={<Badge color={item.color} />}
                            title={<Text strong>{item.title}</Text>}
                            description={<Text type="secondary" className="text-xs">{item.desc} {item.date && <div className="mt-1 italic opacity-70">{dayjs(item.date).format('HH:mm DD/MM')}</div>}</Text>}
                        />
                    </List.Item>
                )}
                locale={{ emptyText: 'Không có thông báo mới' }}
            />
        </div>
    );

    return (
        <AntHeader className="sticky top-0 z-50 w-full px-6 flex justify-end items-center shadow-sm bg-[#001529]" style={{ height: 64 }}>
            <div className="flex items-center gap-5">
                <Tag color={user?.status === 'APPROVED' ? 'success' : 'warning'}>KYC: {user?.status}</Tag>
                <Tag color="blue">{user?.role}</Tag>

                <div className="flex items-center gap-2 font-bold px-3 h-[32px] bg-black/30 rounded-lg border border-yellow-500/30" style={{ color: 'white' }}>
                    <WalletOutlined style={{ color: '#facc15', fontSize: '18px' }} />
                    <span className="text-yellow-400">{balance.toLocaleString()} VNĐ</span>
                </div>

                {/* QUẢ CHUÔNG THÔNG BÁO ĐÃ ĐƯỢC ÉP CỨNG MÀU TRẮNG */}
                <Popover content={notificationContent} title={<span className="font-bold text-base"><NotificationOutlined /> Thông báo hệ thống</span>} trigger="click" placement="bottomRight">
                    <Badge count={notifications.length} overflowCount={9} className="cursor-pointer mt-1 mr-2 hover:opacity-80 transition-opacity">
                        <BellOutlined style={{ color: 'white', fontSize: '22px' }} />
                    </Badge>
                </Popover>

                <Dropdown menu={{ items: profileMenuItems }} placement="bottomRight" trigger={['click']}>
                    <div className="cursor-pointer flex items-center gap-3 hover:bg-white/10 px-3 py-1 rounded-md transition duration-300">
                        <Avatar icon={<UserOutlined />} className="bg-blue-500 border-none" />
                        <span className="font-semibold text-white">{user?.username || 'Người dùng'}</span>
                    </div>
                </Dropdown>
            </div>
        </AntHeader>
    );
};

export default Header;