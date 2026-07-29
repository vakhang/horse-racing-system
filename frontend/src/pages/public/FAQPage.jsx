import React, { useState, useEffect } from 'react';
import { Typography, Spin, Collapse, Empty } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import Footer from '../../components/layout/Footer';
import PublicHeader from '../../components/layout/PublicHeader';
import api from '../../config/api';

const { Title, Paragraph } = Typography;

const FAQPage = () => {
    const [faqs, setFaqs] = useState([]);
    const [title, setTitle] = useState('CÂU HỎI THƯỜNG GẶP (FAQ)');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await api.get('/public/content/FAQ');
                const contentData = res.data.content;
                if (contentData) {
                    try {
                        const parsed = JSON.parse(contentData);
                        if (Array.isArray(parsed)) {
                            setFaqs(parsed);
                        } else {
                            setFaqs([]);
                        }
                    } catch (e) {
                        setFaqs([]);
                    }
                }
            } catch (error) {
                console.error("Failed to load terms", error);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    return (
        <div className="min-h-screen bg-[#001529] font-sans flex flex-col">
            <PublicHeader />

            <div className="flex-grow max-w-4xl mx-auto w-full px-6 py-12 pt-32">
                <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
                    <div className="text-center mb-10">
                        <Title level={1} className="text-3xl md:text-4xl font-black tracking-wide uppercase mb-2 inline-block" style={{ color: '#facc15', WebkitTextStroke: '1px #facc15', textShadow: '0 0 15px rgba(250,204,21,0.6)' }}>
                            {title}
                        </Title>
                        <Paragraph className="text-white text-lg" style={{ color: 'white' }}>
                            Tổng hợp các câu hỏi và giải đáp chi tiết dành cho khách hàng
                        </Paragraph>
                    </div>
                    
                    {loading ? (
                        <div className="flex justify-center p-12"><Spin size="large" /></div>
                    ) : faqs.length > 0 ? (
                        <Collapse
                            accordion
                            bordered={false}
                            expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} style={{ color: '#facc15', fontSize: '16px', marginTop: '4px' }} />}
                            className="bg-transparent"
                            items={faqs.map((faq, index) => ({
                                key: String(index),
                                label: (
                                    <span className="text-lg font-semibold text-white hover:text-yellow-400 transition-colors duration-200">
                                        {faq.question}
                                    </span>
                                ),
                                children: (
                                    <div className="pl-7 pr-4 py-2 border-l-2 border-yellow-400/50 ml-2">
                                        <Paragraph className="text-white text-base leading-relaxed mb-0 whitespace-pre-wrap" style={{ color: 'white' }}>
                                            {faq.answer}
                                        </Paragraph>
                                    </div>
                                ),
                                className: "mb-4 border border-white/10 rounded-xl bg-white/5 shadow-sm overflow-hidden"
                            }))}
                        />
                    ) : (
                        <Empty description={<span className="text-gray-400">Nội dung đang được cập nhật...</span>} />
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default FAQPage;
