import React, { useState, useEffect } from 'react';
import { Layout, Dropdown, Avatar, Tag, Badge, Popover, List, Typography } from 'antd';
import { UserOutlined, LogoutOutlined, WalletOutlined, BellOutlined, NotificationOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import api from '../../config/api';
import dayjs from 'dayjs';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const Header = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth() || {};
    const [balance, setBalance] = useState(0);
    const [notifications, setNotifications] = useState([]);

    // FIX LỖI 1: Tên key trong AuthContext lưu là 'accessToken' chứ không phải 'token'
    const token = user?.token || localStorage.getItem('accessToken');

    useEffect(() => {
        const fetchWalletBalance = () => {
            if (user?.id && token) {
                api.get(`/wallets/my-wallet?userId=${user.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                    .then(res => {
                        // Bọc cực kỳ an toàn để tránh bị Null
                        setBalance(res.data?.balance || 0);
                    })
                    .catch(err => console.error("Lỗi lấy ví trên Header:", err));
            }
        };

        const fetchAnnouncements = async () => {
            if (user?.id && token) {
                try {
                    const res = await api.get('/admin/announcements', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    const allNews = res.data;
                    const validNews = allNews.filter(news => {
                        // Lọc theo Role
                        const roles = news.targetRoles ? news.targetRoles.split(',') : [];
                        const roleMatch = roles.length === 0 || roles.includes(user.role);
                        
                        // Lọc theo Status
                        const statuses = news.targetStatuses ? news.targetStatuses.split(',') : [];
                        const statusMatch = statuses.length === 0 || statuses.includes(user.status);
                        
                        return roleMatch && statusMatch;
                    });
                    
                    return validNews;
                } catch (err) {
                    console.error("Lỗi lấy thông báo hệ thống:", err);
                    return [];
                }
            }
            return [];
        };

        const generateNotifications = async () => {
            let notifs = [];

            if (user?.status === 'APPROVED') {
                notifs.push({ title: 'Tài khoản đã xác minh', desc: 'Bạn có thể sử dụng toàn bộ tính năng hệ thống.', color: 'green' });
            } else if (user?.status === 'PENDING') {
                notifs.push({ title: 'Chờ duyệt KYC', desc: 'Vui lòng đợi Admin kiểm tra hồ sơ của bạn.', color: 'orange' });
            }

            // Lấy thông báo từ Database
            const systemNews = await fetchAnnouncements();
            systemNews.forEach(news => {
                let dateStr = news.createdAt;
                if (Array.isArray(dateStr)) {
                    dateStr = new Date(dateStr[0], dateStr[1] - 1, dateStr[2], dateStr[3] || 0, dateStr[4] || 0, dateStr[5] || 0);
                }
                notifs.push({ 
                    title: `📢 TIN TỪ BAN TỔ CHỨC`, 
                    desc: news.content, 
                    color: 'blue', 
                    date: dateStr
                });
            });

            if (user?.id) {
                try {
                    const personalNewsStr = localStorage.getItem(`user_notifications_${user.id}`);
                    const personalNews = personalNewsStr ? JSON.parse(personalNewsStr) : [];
                    if (Array.isArray(personalNews)) {
                        personalNews.forEach(news => {
                            notifs.push({ title: news.title, desc: news.desc, color: news.color, date: news.date });
                        });
                    }
                } catch (e) { console.error("Lỗi parse thông báo cá nhân", e); }
            }

            notifs.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
            setNotifications(notifs);
        };

        fetchWalletBalance();
        generateNotifications();

        window.addEventListener('update_balance', fetchWalletBalance);
        window.addEventListener('update_notifications', generateNotifications);

        return () => {
            window.removeEventListener('update_balance', fetchWalletBalance);
            window.removeEventListener('update_notifications', generateNotifications);
        };
    }, [user, token]);

    const handleLogout = () => {
        if (logout) logout();
        localStorage.clear();
        window.location.href = '/login';
    };

    const profileMenuItems = [
        { key: '1', icon: <UserOutlined />, label: 'Hồ sơ cá nhân', onClick: () => navigate('/profile') },
        { key: '2', icon: <LogoutOutlined className="text-red-500" />, label: <span className="text-red-500 font-medium">Đăng xuất</span>, onClick: handleLogout },
    ];

    const notificationContent = (
        <div className="w-80 max-h-96 overflow-y-auto bg-white rounded-lg">
            <List
                itemLayout="horizontal"
                dataSource={notifications}
                renderItem={item => (
                    <List.Item className="border-b last:border-b-0 hover:bg-gray-100 cursor-pointer px-4 py-3 transition-colors bg-white">
                        <List.Item.Meta
                            avatar={<Badge color={item.color} />}
                            title={<span className="font-bold text-gray-800">{item.title}</span>}
                            description={
                                <span className="text-xs text-gray-600 block mt-1">
                                    {item.desc}
                                    {item.date && <div className="mt-1 italic text-gray-400">{dayjs(item.date).format('HH:mm DD/MM')}</div>}
                                </span>
                            }
                        />
                    </List.Item>
                )}
                locale={{ emptyText: <span className="text-gray-500">Không có thông báo mới</span> }}
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
                    {/* FIX LỖI 3: Tránh lỗi Crash toLocaleString nếu balance undefined */}
                    <span className="text-yellow-400">{(balance || 0).toLocaleString()} VNĐ</span>
                </div>

                <Popover content={notificationContent} title={<span className="font-bold text-base text-gray-800"><NotificationOutlined /> Thông báo hệ thống</span>} trigger="click" placement="bottomRight">
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