import React from 'react';
import { Typography, Button } from 'antd';
import { LoginOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';

const { Text } = Typography;

const PublicHeader = () => {
    const navigate = useNavigate();

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
                <Link to="/" className="text-gray-300 hover:text-yellow-400 font-semibold transition-colors">TRANG CHỦ</Link>
                <Link to="/about" className="text-gray-300 hover:text-yellow-400 font-semibold transition-colors">GIỚI THIỆU</Link>
                <Link to="/schedule" className="text-gray-300 hover:text-yellow-400 font-semibold transition-colors">LỊCH ĐUA</Link>
                <Link to="/results" className="text-gray-300 hover:text-yellow-400 font-semibold transition-colors">KẾT QUẢ</Link>
                <Link to="/news" className="text-gray-300 hover:text-yellow-400 font-semibold transition-colors">TIN TỨC</Link>
                <Link to="/guide" className="text-gray-300 hover:text-yellow-400 font-semibold transition-colors">HƯỚNG DẪN</Link>
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
