// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Typography, Carousel, Card, Row, Col, Button, Tag, Spin } from 'antd';
import { FireOutlined, TrophyOutlined, GiftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api.js';
import dayjs from 'dayjs';
import { useAuth } from '../../context/AuthContext';
import horseRacingImg from '../../assets/horseracing.png';

const { Title, Text } = Typography;

const LandingPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);

    const banners = [
        "https://vinhomesvuyenhaiphong.com/uploads/024267aa-4d55-4979-8254-99201ce68083.jpeg",
        horseRacingImg,
        "https://thethaovanhoa.mediacdn.vn/372676912336973824/2026/2/8/anh-chinh-1-17705225062051088175091.jpg"
    ];

    useEffect(() => {
        const fetchTournaments = async () => {
            try {
                const response = await api.get('/tournaments');
                setTournaments(response.data.slice(0, 4));
            } catch (error) { console.error("Lá»—i táº£i giáº£i Ä‘áº¥u:", error); }
            finally { setLoading(false); }
        };
        fetchTournaments();
    }, []);

    const statusMap = {
        UPCOMING: { color: 'cyan', text: 'Sáº®P DIá»„N RA' },
        ONGOING: { color: 'red', text: 'ÄANG THI Äáº¤U (HOT)' },
        COMPLETED: { color: 'default', text: 'ÄĂƒ Káº¾T THĂC' }
    };

    return (
        <div className="max-w-6xl mx-auto pb-10">
            <div className="rounded-3xl overflow-hidden shadow-2xl mb-12 border-4 border-[#001529]">
                <Carousel autoplay effect="fade">
                    {banners.map((img, index) => (
                        <div key={index} className="relative h-[550px]">
                            <img src={img} alt={`Banner ${index}`} className="w-full h-full object-cover object-center" />
                            <div className="absolute inset-0 flex items-center p-10 md:p-16">
                                <div className="max-w-md bg-black/20 backdrop-blur-sm p-6 md:p-8 rounded-3xl border border-white/20 shadow-[0_0_30px_rgba(0,0,0,0.4)]">
                                    <Tag className="mb-4 px-4 py-1 font-black text-sm border-none bg-gradient-to-r from-yellow-500 to-yellow-300 uppercase shadow-md" style={{ color: 'black' }}>
                                        đŸ”¥ Sá»± kiá»‡n mĂ¹a hĂ¨ 2026
                                    </Tag>
                                    <Title level={1} className="m-0 text-4xl md:text-5xl font-black tracking-wider mb-2" style={{ color: 'white' }}>
                                        GIáº¢I ÄUA NGá»°A <br/><span className="text-yellow-400">HOĂ€NG GIA</span>
                                    </Title>
                                    <Text className="text-gray-100 text-base mt-3 block leading-relaxed" style={{ color: '#f3f4f6' }}>
                                        {user?.role === 'OWNER'
                                            ? 'Há»‡ thá»‘ng quáº£n lĂ½ chiáº¿n mĂ£ vĂ  Ä‘Äƒng kĂ½ giáº£i Ä‘áº¥u dĂ nh riĂªng cho Chá»§ Ngá»±a.'
                                            : user?.role === 'REFEREE'
                                                ? 'Há»‡ thá»‘ng giĂ¡m sĂ¡t, quáº£n lĂ½ vi pháº¡m vĂ  chá»‘t káº¿t quáº£ giáº£i Ä‘ua dĂ nh cho Trá»ng TĂ i.'
                                                : user?.role === 'JOCKEY'
                                                    ? 'Há»‡ thá»‘ng nháº­n lá»‹ch thi Ä‘áº¥u vĂ  quáº£n lĂ½ há»“ sÆ¡ dĂ nh cho NĂ i ngá»±a chuyĂªn nghiá»‡p.'
                                                    : 'Tráº£i nghiá»‡m cĂ¡ cÆ°á»£c thá»ƒ thao Ä‘áº³ng cáº¥p thÆ°á»£ng lÆ°u. Náº¡p rĂºt tá»± Ä‘á»™ng 24/7. ThÆ°á»Ÿng nĂ³ng 100,000 VNÄ cho tĂ¢n thá»§!'}
                                    </Text>
                                    <Button
                                        type="primary" size="large"
                                        className="mt-6 bg-gradient-to-r from-yellow-500 to-yellow-400 border-none text-black font-bold h-12 px-8 text-lg hover:scale-105 transition-transform"
                                        onClick={() => navigate(user?.role === 'OWNER' ? '/owner/races' : user?.role === 'REFEREE' ? '/referee/dashboard' : user?.role === 'JOCKEY' ? '/jockey/invitations' : '/betting')}
                                    >
                                        {user?.role === 'OWNER' ? 'ÄÄ‚NG KĂ NGá»°A THI Äáº¤U NGAY' : user?.role === 'REFEREE' ? 'ÄI Äáº¾N BĂ€N TRá»ŒNG TĂ€I' : user?.role === 'JOCKEY' ? 'XEM Lá»œI Má»œI THI Äáº¤U' : 'THAM GIA CÆ¯á»¢C NGAY'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </Carousel>
            </div>

            <div className="mb-10">
                <Title level={3} className="border-l-4 border-blue-500 pl-3 mb-6"><TrophyOutlined className="text-blue-500 mr-2"/> Lá»CH GIáº¢I Äáº¤U</Title>
                <Spin spinning={loading}>
                    <Row gutter={[24, 24]}>
                        {tournaments.length > 0 ? tournaments.map(tour => (
                            <Col xs={24} md={12} key={tour.id}>
                                <Card className="shadow-md hover:shadow-xl transition-shadow bg-gradient-to-br from-[#001529] to-blue-900 text-white rounded-xl border-none">
                                    <Tag color={statusMap[tour.status]?.color || 'default'} className="mb-2 font-bold">{statusMap[tour.status]?.text || tour.status}</Tag>
                                    <Title level={4} className="text-white mb-1">{tour.name}</Title>
                                    <Text className="text-blue-200 block mb-4">Thá»i gian: {dayjs(tour.startDate).format('DD/MM/YYYY')} - {dayjs(tour.endDate).format('DD/MM/YYYY')}</Text>
                                    <Button ghost onClick={() => navigate(user?.role === 'OWNER' ? '/owner/races' : user?.role === 'REFEREE' ? '/referee/dashboard' : '/betting')}>
                                        {user?.role === 'OWNER' ? 'ÄÄƒng kĂ½ ngay' : user?.role === 'REFEREE' ? 'GiĂ¡m sĂ¡t giáº£i' : 'KhĂ¡m phĂ¡ ngay'}
                                    </Button>
                                </Card>
                            </Col>
                        )) : (
                            <Col span={24}><Text className="text-gray-500">Hiá»‡n chÆ°a cĂ³ giáº£i Ä‘áº¥u nĂ o.</Text></Col>
                        )}
                    </Row>
                </Spin>
            </div>
        </div>
    );
};

export default LandingPage;
