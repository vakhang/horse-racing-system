import React from 'react';
import { Typography, Button, Dropdown, ConfigProvider } from 'antd';
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

    const isSupportActive = ['/guide', '/faq', '/rules', '/race-rules', '/terms', '/privacy'].includes(location.pathname);
    const supportLinkClass = isSupportActive 
        ? "text-yellow-400 font-bold border-b-2 border-yellow-400 pb-1 cursor-pointer"
        : "text-gray-300 hover:text-yellow-400 font-semibold transition-colors cursor-pointer";

    const getDropdownItemClass = (path) => {
        return location.pathname === path
            ? "text-yellow-400 font-bold block w-full"
            : "text-gray-200 hover:text-yellow-400 font-semibold block w-full transition-colors";
    };

    const supportMenuItems = [
        { key: '1', label: <Link to="/guide" className={getDropdownItemClass('/guide')}>Hướng dẫn Tân thủ & Nạp/Rút</Link> },
        { key: '2', label: <Link to="/faq" className={getDropdownItemClass('/faq')}>Câu hỏi thường gặp (FAQ)</Link> },
        { key: '3', label: <Link to="/rules" className={getDropdownItemClass('/rules')}>Thể lệ Đặt cược</Link> },
        { key: '4', label: <Link to="/race-rules" className={getDropdownItemClass('/race-rules')}>Điều lệ Đua ngựa</Link> },
        { key: '5', label: <Link to="/terms" className={getDropdownItemClass('/terms')}>Điều khoản Sử dụng & Miễn trừ</Link> },
        { key: '6', label: <Link to="/privacy" className={getDropdownItemClass('/privacy')}>Chính sách Bảo mật & eKYC</Link> }
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
                
                <ConfigProvider
                    theme={{
                        components: {
                            Dropdown: {
                                colorBgElevated: '#001529',
                                controlItemBgHover: 'rgba(255, 255, 255, 0.1)',
                                paddingBlock: 8,
                            },
                            Menu: {
                                colorBgContainer: '#001529',
                                colorItemBgHover: 'rgba(255, 255, 255, 0.1)',
                            }
                        }
                    }}
                >
                    <Dropdown menu={{ items: supportMenuItems, className: 'border border-white/20 shadow-lg' }} placement="bottom">
                        <span className={supportLinkClass}>HỖ TRỢ</span>
                    </Dropdown>
                </ConfigProvider>
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
