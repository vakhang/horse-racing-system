import React from 'react';
import { Typography, Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import Footer from '../../components/layout/Footer';
import PublicHeader from '../../components/layout/PublicHeader';

const { Title, Paragraph } = Typography;

const ResultsPage = () => {
    return (
        <div className="min-h-screen bg-[#001529] font-sans flex flex-col">
            <PublicHeader />

            <div className="flex-grow max-w-7xl mx-auto w-full px-6 py-12 pt-32">
                <Breadcrumb 
                    className="mb-8"
                    items={[
                        { title: <Link to="/"><HomeOutlined className="text-gray-400" /></Link> },
                        { title: <span className="text-yellow-500">ResultsPage</span> }
                    ]}
                />
                <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
                    <div className="text-center mb-12"><Title level={1} className="text-4xl md:text-5xl font-black tracking-widest uppercase mb-4 inline-block" style={{ color: '#facc15', WebkitTextStroke: '2px #facc15', textShadow: '0 0 15px rgba(250,204,21,0.6)' }}>KẾT QUẢ</Title></div>
                    <Paragraph className="text-gray-300 text-lg leading-relaxed mb-4" style={{ color: '#d1d5db' }}>
                        Đây là trang mẫu cho Kết quả. Nội dung chi tiết sẽ được ban quản trị cập nhật trong thời gian sớm nhất.
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

export default ResultsPage;


