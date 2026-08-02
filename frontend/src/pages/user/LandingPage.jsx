// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Typography, Carousel, Card, Row, Col, Button, Tag, Spin, Select } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api.js';
import dayjs from 'dayjs';
import { useAuth } from '../../context/AuthContext';
import horseRacingImg from '../../assets/anhgioithieu1.png';

const { Title, Text } = Typography;

// [Chức năng rõ ràng]: Trang Chủ sau Đăng nhập
// [Tác dụng]: Tổng hợp thông tin nhanh (Widget) như số dư ví, chặng đua nổi bật sắp diễn ra, lịch sử cá cược gần nhất.
// [Hướng dẫn sửa đổi]:
// - UI: Thay đổi bố cục Grid (Lưới) để chứa được nhiều Widget hơn.
const LandingPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    const banners = [
        "https://vinhomesvuyenhaiphong.com/uploads/024267aa-4d55-4979-8254-99201ce68083.jpeg",
        horseRacingImg,
        "https://thethaovanhoa.mediacdn.vn/372676912336973824/2026/2/8/anh-chinh-1-17705225062051088175091.jpg"
    ];

    useEffect(() => {
        const fetchTournaments = async () => {
            try {
                const response = await api.get('/tournaments');
                setTournaments(response.data);
            } catch (error) { console.error("Lỗi tải giải đấu:", error); }
            finally { setLoading(false); }
        };
        fetchTournaments();
    }, []);

    const statusMap = {
        UPCOMING: { color: 'cyan', text: 'SẮP DIỄN RA' },
        ONGOING: { color: 'green', text: 'ĐANG DIỄN RA' },
        COMPLETED: { color: 'default', text: 'ĐÃ KẾT THÚC' },
        POSTPONED: { color: 'warning', text: 'ĐÃ DỜI LỊCH' },
        CANCELED: { color: 'error', text: 'ĐÃ HỦY' }
    };

    const sortOrder = { ONGOING: 1, UPCOMING: 2, COMPLETED: 3, POSTPONED: 4, CANCELED: 5 };
    const sortedTournaments = [...tournaments].sort((a, b) => (sortOrder[a.status] || 99) - (sortOrder[b.status] || 99));
    const filteredTournaments = filter === 'ALL' ? sortedTournaments : sortedTournaments.filter(t => t.status === filter);

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
                                        🔥 Sự kiện mùa hè 2026
                                    </Tag>
                                    <Title level={1} className="m-0 text-4xl md:text-5xl font-black tracking-wider mb-2" style={{ color: 'white' }}>
                                        GIẢI ĐUA NGỰA <br/><span className="text-yellow-400">HOÀNG GIA</span>
                                    </Title>
                                    <Text className="text-gray-100 text-base mt-3 block leading-relaxed" style={{ color: '#f3f4f6' }}>
                                        {user?.role === 'OWNER'
                                            ? 'Hệ thống quản lý chiến mã và đăng ký giải đấu dành riêng cho Chủ Ngựa.'
                                            : user?.role === 'REFEREE'
                                                ? 'Hệ thống giám sát, quản lý vi phạm và chốt kết quả giải đua dành cho Trọng Tài.'
                                                : user?.role === 'JOCKEY'
                                                    ? 'Hệ thống nhận lịch thi đấu và quản lý hồ sơ dành cho Nài ngựa chuyên nghiệp.'
                                                    : 'Trải nghiệm cá cược thể thao đẳng cấp thượng lưu. Nạp rút tự động 24/7. Thưởng nóng 100,000 VNĐ cho tân thủ!'}
                                    </Text>
                                    <Button
                                        type="primary" size="large"
                                        className="mt-6 bg-gradient-to-r from-yellow-500 to-yellow-400 border-none text-black font-bold h-12 px-8 text-lg hover:scale-105 transition-transform"
                                        onClick={() => navigate(user?.role === 'OWNER' ? '/owner/races' : user?.role === 'REFEREE' ? '/referee/dashboard' : user?.role === 'JOCKEY' ? '/jockey/invitations' : '/betting')}
                                    >
                                        {user?.role === 'OWNER' ? 'ĐĂNG KÝ NGỰA THI ĐẤU NGAY' : user?.role === 'REFEREE' ? 'ĐI ĐẾN BÀN TRỌNG TÀI' : user?.role === 'JOCKEY' ? 'XEM LỜI MỜI THI ĐẤU' : 'THAM GIA CƯỢC NGAY'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </Carousel>
            </div>

            <div className="mb-10">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                    <Title level={3} className="border-l-4 border-blue-500 pl-3 m-0"><TrophyOutlined className="text-blue-500 mr-2"/> LỊCH GIẢI ĐẤU</Title>
                    <Select value={filter} onChange={setFilter} className="w-full md:w-64 mt-4 md:mt-0" size="large">
                        <Select.Option value="ALL">Tất Cả Trạng Thái</Select.Option>
                        <Select.Option value="ONGOING">Đang Diễn Ra</Select.Option>
                        <Select.Option value="UPCOMING">Sắp Diễn Ra</Select.Option>
                        <Select.Option value="COMPLETED">Đã Kết Thúc</Select.Option>
                        <Select.Option value="POSTPONED">Đã Dời Lịch</Select.Option>
                        <Select.Option value="CANCELED">Đã Hủy</Select.Option>
                    </Select>
                </div>
                <Spin spinning={loading}>
                    <Row gutter={[24, 24]}>
                        {filteredTournaments.length > 0 ? filteredTournaments.map(tour => (
                            <Col xs={24} md={12} key={tour.id}>
                                <Card className="shadow-md hover:shadow-xl transition-shadow bg-gradient-to-br from-[#001529] to-blue-900 text-white rounded-xl border-none h-full flex flex-col">
                                    <Tag color={statusMap[tour.status]?.color || 'default'} className="mb-2 font-bold">{statusMap[tour.status]?.text || tour.status}</Tag>
                                    <Title level={4} className="text-white mb-1">{tour.name}</Title>
                                    <Text className="text-blue-200 block mb-2">Thời gian: {dayjs(tour.startDate).format('DD/MM/YYYY')} - {dayjs(tour.endDate).format('DD/MM/YYYY')}</Text>
                                    {(tour.status === 'CANCELED' || tour.status === 'POSTPONED') && tour.reason && (
                                        <div className="bg-white/10 p-3 rounded-lg mb-4 mt-2 border border-white/20">
                                            <Text className="text-white block italic text-sm"><strong className="text-yellow-400">Lý do:</strong> {tour.reason}</Text>
                                        </div>
                                    )}
                                    <div className="mt-auto pt-4">
                                        {(tour.status !== 'CANCELED' && tour.status !== 'POSTPONED' && tour.status !== 'COMPLETED') ? (
                                            <Button type="primary" size="large" className="bg-gradient-to-r from-yellow-500 to-yellow-400 border-none text-black font-bold px-6" onClick={() => navigate(user?.role === 'OWNER' ? '/owner/races' : user?.role === 'REFEREE' ? '/referee/dashboard' : user?.role === 'JOCKEY' ? '/jockey/invitations' : '/betting')}>
                                                {user?.role === 'OWNER' ? 'Đăng ký ngay' : user?.role === 'REFEREE' ? 'Giám sát giải' : user?.role === 'JOCKEY' ? 'Xem lời mời' : 'Khám phá ngay'}
                                            </Button>
                                        ) : (
                                            <Button disabled size="large" className="font-bold px-6 bg-gray-500 text-gray-300 border-none">
                                                {tour.status === 'COMPLETED' ? 'Đã Kết Thúc' : 'Không Thể Đăng Ký'}
                                            </Button>
                                        )}
                                    </div>
                                </Card>
                            </Col>
                        )) : (
                            <Col span={24}><Text className="text-gray-500">Hiện chưa có giải đấu nào phù hợp với bộ lọc.</Text></Col>
                        )}
                    </Row>
                </Spin>
            </div>
        </div>
    );
};

export default LandingPage;