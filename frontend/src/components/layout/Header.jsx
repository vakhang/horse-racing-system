import React from 'react';
import { Layout, Dropdown, Avatar, Tag } from 'antd';
import { UserOutlined, LogoutOutlined, WalletOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const { Header: AntHeader } = Layout;

const Header = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth() || {};

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
        <AntHeader className="px-6 flex justify-end items-center shadow-sm bg-[#001529]" style={{ height: 64 }}>
            <div className="flex items-center gap-4">

                {/* 1. Tag Role và trạng thái KYC */}
                {user?.status === 'APPROVED' ? (
                    <Tag color="success">KYC: APPROVED</Tag>
                ) : (
                    <Tag color="warning">KYC: PENDING</Tag>
                )}
                <Tag color="blue">{user?.role}</Tag>

                {/* 2. CÁI VÍ & ĐIỂM (ÉP MÀU TRẮNG TRỰC TIẾP) */}
                <div className="flex items-center gap-1 font-medium px-2" style={{ color: 'white' }}>
                    <WalletOutlined style={{ color: '#facc15', fontSize: '18px' }} />
                    <span>điểm</span>
                </div>

                {/* 3. Dropdown Avatar & Tên User */}
                <Dropdown menu={{ items }} placement="bottomRight" trigger={['click']}>
                    <div className="cursor-pointer flex items-center gap-3 hover:bg-white/10 px-3 py-1 rounded-md transition duration-300">
                        <Avatar icon={<UserOutlined />} className="bg-blue-500 border-none" />

                        {/* ÉP MÀU TRẮNG CHO TÊN USER TRỰC TIẾP */}
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