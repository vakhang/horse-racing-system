import React from 'react';
import { Typography, Button, Dropdown } from 'antd';
import { LoginOutlined } from '@ant-design/icons';
import { useNavigate, Link, useLocation } from 'react-router-dom';

const { Text } = Typography;

const PublicHeader = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const getLinkClass = (path) => {
        return location.pathname === path 
            ? "text-yellow-400 font-bold border-b-2 border-yellow-400 pb-1" 
            : "text-gray-300 hover:text-yellow-400 font-semibold transition-colors";
    };

    const isSupportActive = ['/guide', '/faq', '/rules', '/terms', '/privacy'].includes(location.pathname);
    const supportLinkClass = isSupportActive 
        ? "text-yellow-400 font-bold border-b-2 border-yellow-400 pb-1 cursor-pointer"
        : "text-gray-300 hover:text-yellow-400 font-semibold transition-colors cursor-pointer";

    const supportMenuItems = [
        { key: '1', label: <Link to="/guide">Hướng dẫn Tân thủ & Nạp/Rút</Link> },
        { key: '2', label: <Link to="/faq">Câu hỏi thường gặp (FAQ)</Link> },
        { key: '3', label: <Link to="/rules">Thể lệ Đặt cược</Link> },
        { key: '4', label: <Link to="/terms">Điều khoản Sử dụng & Miễn trừ trách nhiệm</Link> },
        { key: '5', label: <Link to="/privacy">Chính sách Bảo mật & eKYC</Link> }
    ];

    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-[#001529]/95 backdrop-blur-md border-b border-white/10 px-6 lg:px-20 py-4 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => {
                if (window.location.pathname === '/') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                    navigate('/');
                }
            }}>
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center font-black text-black shadow-[0_0_15px_rgba(234,179,8,0.5)]">HR</div>
                <Text className="text-white font-black text-xl tracking-wider uppercase hidden md:block" style={{ color: 'white' }}>HORSE RACE</Text>
            </div>
            <div className="hidden lg:flex gap-8 items-center">
                <Link to="/" className={getLinkClass('/')}>TRANG CHỦ</Link>
                <Link to="/about" className={getLinkClass('/about')}>GIỚI THIỆU</Link>
                <Link to="/schedule" className={getLinkClass('/schedule')}>LỊCH ĐUA</Link>
                <Link to="/results" className={getLinkClass('/results')}>KẾT QUẢ</Link>
                
                <Dropdown menu={{ items: supportMenuItems }} placement="bottom">
                    <span className={supportLinkClass}>HỖ TRỢ</span>
                </Dropdown>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
                <Button 
                    type="text" 
                    icon={<LoginOutlined />}
                    style={{ color: 'white' }}
                    className="hover:scale-105 transition-transform hover:!text-yellow-400"
                    onClick={() => navigate('/login')}
                >
                    <span style={{ fontWeight: 900 }}>ĐĂNG NHẬP</span>
                </Button>
            </div>
        </div>
    );
};

export default PublicHeader;
