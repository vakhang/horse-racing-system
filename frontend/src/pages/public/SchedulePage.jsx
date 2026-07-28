import React from 'react';
import { Typography, Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import Footer from '../../components/layout/Footer';

const { Title, Paragraph } = Typography;

const SchedulePage = () => {
    return (
        <div className="min-h-screen bg-[#001529] font-sans flex flex-col">
            {/* Dummy Header để test, bạn có thể thay thế bằng Header xịn sau này */}
            <div className="bg-[#001529]/95 backdrop-blur-md border-b border-white/10 px-6 lg:px-20 py-4 flex justify-between items-center shadow-md">
                <Link to="/" className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center font-black text-black">HR</div>
                    <span className="text-white font-black text-xl tracking-wider uppercase">HORSE RACE</span>
                </Link>
                <Link to="/" className="text-gray-300 hover:text-yellow-400">QUAY LẠI TRANG CHỦ</Link>
            </div>

            <div className="flex-grow max-w-7xl mx-auto w-full px-6 py-12">
                <Breadcrumb 
                    className="mb-8"
                    items={[
                        { title: <Link to="/"><HomeOutlined className="text-gray-400" /></Link> },
                        { title: <span className="text-yellow-500">SchedulePage</span> }
                    ]}
                />
                <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
                    <Title level={2} className="text-white mb-6 uppercase tracking-wider" style={{ color: 'white' }}>SchedulePage</Title>
                    <Paragraph className="text-gray-300 text-lg leading-relaxed mb-4" style={{ color: '#d1d5db' }}>
                        Đây là trang mẫu cho SchedulePage. Nội dung chi tiết sẽ được ban quản trị cập nhật trong thời gian sớm nhất.
                    </Paragraph>
                    <Paragraph className="text-gray-300 text-lg leading-relaxed" style={{ color: '#d1d5db' }}>
                        Cảm ơn bạn đã đồng hành cùng Horse Racing VN.
                    </Paragraph>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default SchedulePage;
