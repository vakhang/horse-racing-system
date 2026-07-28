import React, { useState, useEffect } from 'react';
import { Typography, Spin } from 'antd';
import Footer from '../../components/layout/Footer';
import PublicHeader from '../../components/layout/PublicHeader';
import api from '../../config/api';

const { Title } = Typography;

const RulesPage = () => {
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('THỂ LỆ ĐẶT CƯỢC');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await api.get('/public/content/RULES');
                setContent(res.data.content);

            } catch (error) {
                console.error("Failed to load rules", error);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    return (
        <div className="min-h-screen bg-[#001529] font-sans flex flex-col">
            <PublicHeader />

            <div className="flex-grow max-w-7xl mx-auto w-full px-6 py-12 pt-32">
                <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
                    <div className="text-center mb-12">
                        <Title level={1} className="text-4xl md:text-5xl font-black tracking-widest uppercase mb-4 inline-block" style={{ color: '#facc15', WebkitTextStroke: '2px #facc15', textShadow: '0 0 15px rgba(250,204,21,0.6)' }}>
                            {title}
                        </Title>
                    </div>
                    {loading ? (
                        <div className="flex justify-center p-12"><Spin size="large" /></div>
                    ) : (
                        <div 
                            className="text-gray-300 text-lg leading-relaxed content-html-container" 
                            style={{ color: '#d1d5db' }}
                            dangerouslySetInnerHTML={{ __html: content || 'Nội dung đang được cập nhật...' }} 
                        />
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default RulesPage;
