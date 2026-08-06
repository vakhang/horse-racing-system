import React, { useState, useEffect } from 'react';
import { Layout, Dropdown, Avatar, Tag, Badge, Popover, List } from 'antd';
import { UserOutlined, LogoutOutlined, WalletOutlined, BellOutlined, NotificationOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import api from '../../config/api';
import dayjs from 'dayjs';

const { Header: AntHeader } = Layout;

// [Chức năng rõ ràng]: Header bet989 Sports Theme
const Header = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth() || {};
    const [balance, setBalance] = useState(0);
    const [notifications, setNotifications] = useState([]);

    const token = user?.token || localStorage.getItem('accessToken');

    useEffect(() => {
        const fetchWalletBalance = () => {
            if (user?.id && token) {
                api.get(`/wallets/my-wallet?userId=${user.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                    .then(res => {
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
                        const roles = news.targetRoles ? news.targetRoles.split(',') : [];
                        const roleMatch = roles.length === 0 || roles.includes(user.role);
                        
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
            let currentUser = user;

            if (user?.id && token) {
                try {
                    const userRes = await api.get(`/users/${user.id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    currentUser = userRes.data;
                } catch (err) {
                    console.error("Lỗi lấy thông tin user real-time:", err);
                }
            }

            if (currentUser?.status === 'APPROVED') {
                notifs.push({ title: 'Tài khoản đã xác minh', desc: 'Bạn có thể sử dụng toàn bộ tính năng hệ thống.', color: 'green' });
            } else if (currentUser?.status === 'PENDING') {
                notifs.push({ title: 'Chờ duyệt KYC', desc: 'Vui lòng đợi Admin kiểm tra hồ sơ của bạn.', color: 'orange' });
            } else if (currentUser?.status === 'BANNED' || currentUser?.status === 'REJECTED') {
                notifs.push({ title: 'Tài khoản có vấn đề', desc: currentUser.banReason || 'Vui lòng liên hệ Admin.', color: 'red' });
            }

            if (currentUser?.banReason && currentUser.status !== 'BANNED' && currentUser.status !== 'REJECTED') {
                notifs.push({ title: '⚠️ Lời Nhắc Từ Admin', desc: currentUser.banReason, color: 'red' });
            }

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
        { key: '2', icon: <LogoutOutlined className="text-red-400" />, label: <span className="text-red-400 font-medium">Đăng xuất</span>, onClick: handleLogout },
    ];

    const notificationContent = (
        <div className="w-80 max-h-96 overflow-y-auto bg-[#1e1e1e] rounded-lg border border-[#333]">
            <List
                itemLayout="horizontal"
                dataSource={notifications}
                renderItem={item => (
                    <List.Item className="border-b border-[#2a2a2a] last:border-b-0 hover:bg-[#262626] cursor-pointer px-4 py-3 transition-colors bg-[#1e1e1e]">
                        <List.Item.Meta
                            avatar={<Badge color={item.color} />}
                            title={<span className="font-bold text-[#e0e0e0]">{item.title}</span>}
                            description={
                                <span className="text-xs text-[#a0a0a0] block mt-1">
                                    {item.desc}
                                    {item.date && <div className="mt-1 italic text-gray-500">{dayjs(item.date).format('HH:mm DD/MM')}</div>}
                                </span>
                            }
                        />
                    </List.Item>
                )}
                locale={{ emptyText: <span className="text-gray-400">Không có thông báo mới</span> }}
            />
        </div>
    );

    return (
        <AntHeader className="sticky top-0 z-50 w-full px-6 flex justify-end items-center shadow-md bg-[#005c44] border-b border-[#007355]" style={{ height: 64 }}>
            <div className="flex items-center gap-5">
                <Tag color={user?.status === 'APPROVED' ? 'success' : 'warning'}>KYC: {user?.status}</Tag>
                <Tag color="cyan" className="font-bold">{user?.role}</Tag>

                <div className="flex items-center gap-2 font-bold px-3.5 h-[36px] bg-black/40 rounded-lg border border-[#fcc200]/40 shadow-inner">
                    <WalletOutlined style={{ color: '#fcc200', fontSize: '18px' }} />
                    <span className="text-[#fcc200] text-base tracking-wide">{(balance || 0).toLocaleString()} VNĐ</span>
                </div>

                <Popover content={notificationContent} title={<span className="font-bold text-base text-[#fcc200]"><NotificationOutlined /> Thông báo hệ thống</span>} trigger="click" placement="bottomRight">
                    <Badge count={notifications.length} overflowCount={9} className="cursor-pointer mt-1 mr-2 hover:opacity-80 transition-opacity">
                        <BellOutlined style={{ color: '#e0e0e0', fontSize: '22px' }} />
                    </Badge>
                </Popover>

                <Dropdown menu={{ items: profileMenuItems }} placement="bottomRight" trigger={['click']}>
                    <div className="cursor-pointer flex items-center gap-3 hover:bg-black/20 px-3 py-1.5 rounded-md transition duration-300 border border-white/10">
                        <Avatar icon={<UserOutlined />} className="bg-[#007355] text-white border-none" />
                        <span className="font-semibold text-white">{user?.username || 'Người dùng'}</span>
                    </div>
                </Dropdown>
            </div>
        </AntHeader>
    );
};

export default Header;