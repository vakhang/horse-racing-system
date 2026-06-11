import React from 'react';
import { Typography, Carousel, Card, Row, Col, Button, Tag } from 'antd';
import { FireOutlined, TrophyOutlined, GiftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const LandingPage = () => {
    const navigate = useNavigate();

    // Bạn có thể thay link ảnh thật vào đây sau khi nhờ Gemini vẽ
    const banners = [
        "https://vinhomesvuyenhaiphong.com/uploads/024267aa-4d55-4979-8254-99201ce68083.jpeg", // Hình trường đua
        "https://hoangphucphoto.com/wp-content/uploads/2025/07/anh-dua-ngua-6.webp", // Hình Casino/Vàng
        "https://thethaovanhoa.mediacdn.vn/372676912336973824/2026/2/8/anh-chinh-1-17705225062051088175091.jpg"  // Hình cúp vô địch
    ];

    return (
        <div className="max-w-6xl mx-auto pb-10">
            {/* CAROUSEL BANNER */}
            <div className="rounded-3xl overflow-hidden shadow-2xl mb-12 border-4 border-[#001529]">
                <Carousel autoplay effect="fade">
                    {banners.map((img, index) => (
                        // 1. TĂNG CHIỀU CAO TỪ 400px LÊN 550px ĐỂ ẢNH ĐỠ BỊ CẮT
                        <div key={index} className="relative h-[550px]">
                            <img src={img} alt={`Banner ${index}`} className="w-full h-full object-cover object-center" />

                            <div className="absolute inset-0 flex items-center p-10 md:p-16">
                                {/* 2. HIỆU ỨNG KÍNH MỜ (GLASSMORPHISM) LÀM NỀN CHO CHỮ */}
                                <div className="max-w-md bg-black/20 backdrop-blur-sm p-6 md:p-8 rounded-3xl border border-white/20 shadow-[0_0_30px_rgba(0,0,0,0.4)]">

                                    <Tag className="mb-4 px-4 py-1 font-black text-sm border-none bg-gradient-to-r from-yellow-500 to-yellow-300 uppercase shadow-md" style={{ color: 'black' }}>
                                        🔥 Sự kiện mùa hè 2026
                                    </Tag>

                                    <Title level={1} className="m-0 text-4xl md:text-5xl font-black tracking-wider mb-2" style={{ color: 'white' }}>
                                        GIẢI ĐUA NGỰA <br/><span className="text-yellow-400">HOÀNG GIA</span>
                                    </Title>

                                    <Text className="text-gray-100 text-base mt-3 block leading-relaxed" style={{ color: '#f3f4f6' }}>
                                        Trải nghiệm cá cược thể thao đẳng cấp thượng lưu. Nạp rút tự động 24/7. Thưởng nóng 100,000 VNĐ cho tân thủ!
                                    </Text>

                                    <Button
                                        type="primary" size="large"
                                        className="mt-6 bg-gradient-to-r from-yellow-500 to-yellow-400 border-none text-black font-bold h-12 px-8 text-lg hover:scale-105 transition-transform"
                                        onClick={() => navigate('/betting')}
                                    >
                                        THAM GIA CƯỢC NGAY
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </Carousel>
            </div>

            {/* CÁC GIẢI ĐẤU NỔI BẬT */}
            <div className="mb-10">
                <Title level={3} className="border-l-4 border-blue-500 pl-3 mb-6"><TrophyOutlined className="text-blue-500 mr-2"/> GIẢI ĐẤU NỔI BẬT</Title>
                <Row gutter={[24, 24]}>
                    <Col xs={24} md={12}>
                        <Card className="shadow-md hover:shadow-xl transition-shadow bg-gradient-to-br from-[#001529] to-blue-900 text-white rounded-xl border-none">
                            <Tag color="red" className="mb-2 font-bold">HOT</Tag>
                            <Title level={4} className="text-white mb-1">Cúp FPT Mùa Hè 2026</Title>
                            <Text className="text-blue-200 block mb-4">Tổng giải thưởng lên đến 1,000,000,000 VNĐ</Text>
                            <Button ghost onClick={() => navigate('/betting')}>Xem tỷ lệ cược</Button>
                        </Card>
                    </Col>
                    <Col xs={24} md={12}>
                        <Card className="shadow-md hover:shadow-xl transition-shadow bg-gradient-to-br from-[#141414] to-gray-800 text-white rounded-xl border-none">
                            <Tag color="cyan" className="mb-2 font-bold">SẮP DIỄN RA</Tag>
                            <Title level={4} className="text-yellow-400 mb-1">Super League Champions</Title>
                            <Text className="text-gray-400 block mb-4">Đấu trường danh giá dành cho các chiến mã hạng A</Text>
                            <Button ghost onClick={() => navigate('/betting')}>Khám phá ngay</Button>
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* KHUYẾN MÃI (Giống PDF LongFu88) */}
            <div>
                <Title level={3} className="border-l-4 border-yellow-500 pl-3 mb-6"><GiftOutlined className="text-yellow-500 mr-2"/> KHUYẾN MÃI ĐỘC QUYỀN</Title>
                <Row gutter={[24, 24]}>
                    {[
                        { title: 'Tặng 100,000 VNĐ Tân Thủ', desc: 'Nhận ngay 100,000 VNĐ khi tạo tài khoản', color: 'border-t-red-500' },
                        { title: 'Hoàn Trả Thể Thao', desc: 'Hoàn trả tự động mỗi ngày không giới hạn', color: 'border-t-blue-500' },
                        { title: 'Thưởng VIP Đặc Quyền', desc: 'Nhận quà sinh nhật, chỗ ngồi và dịch vụ VIP', color: 'border-t-yellow-500' },
                    ].map((promo, idx) => (
                        <Col xs={24} md={8} key={idx}>
                            <Card className={`shadow-sm rounded-xl border-t-4 ${promo.color} text-center hover:-translate-y-2 transition-transform duration-300`}>
                                <Title level={5} className="mb-2">{promo.title}</Title>
                                <Text className="text-gray-500">{promo.desc}</Text>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        </div>
    );
};

export default LandingPage;