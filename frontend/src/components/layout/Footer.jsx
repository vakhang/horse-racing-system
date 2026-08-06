import React from 'react';
import { Row, Col, Typography, Space, Divider } from 'antd';
import { BankOutlined, CustomerServiceOutlined, WarningOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

// [Chức năng rõ ràng]: bet365 Footer Component
const Footer = () => {
    return (
        <div className="bg-[#141414] text-[#a0a0a0] py-12 px-6 lg:px-20 border-t-2 border-[#007355] mt-auto">
            <div className="max-w-7xl mx-auto">
                <Row gutter={[48, 32]}>
                    {/* CỘT 1: THÔNG TIN DOANH NGHIỆP */}
                    <Col xs={24} sm={12} lg={6}>
                        <Title level={4} className="mb-6 uppercase tracking-wider text-sm border-b border-[#2a2a2a] pb-2 whitespace-nowrap" style={{ color: '#fcc200' }}>
                            THÔNG TIN DOANH NGHIỆP
                        </Title>
                        <Space direction="vertical" size="middle" className="w-full">
                            <div>
                                <Link to="/about">
                                    <Text className="text-[#fcc200] font-bold mb-4 uppercase tracking-wider block text-base hover:text-white transition-colors" style={{ color: '#fcc200' }}>
                                        TỔ CHỨC ĐUA NGỰA KKAN (BET989 SYSTEM)
                                    </Text>
                                </Link>
                            </div>
                            <div className="text-sm">
                                <Text className="text-[#a0a0a0] block mb-1">Giấy chứng nhận đủ điều kiện kinh doanh đặt cược do Bộ Tài chính cấp.</Text>
                                <Text className="text-[#a0a0a0] block">Tuân thủ Nghị định 06/2017/NĐ-CP.</Text>
                            </div>
                            <div className="text-sm text-[#e0e0e0]">
                                <BankOutlined className="mr-2 text-[#00b37e]" />
                                Trường đua ngựa KKAN, HCM, Việt Nam
                            </div>
                            <Text className="text-gray-500 text-xs mt-4 block">
                                © 2026 bet989 Horse Racing System. All rights reserved.
                            </Text>
                        </Space>
                    </Col>

                    {/* CỘT 2: PHÁP LÝ & QUY ĐỊNH */}
                    <Col xs={24} sm={12} lg={6}>
                        <Title level={4} className="mb-6 uppercase tracking-wider text-sm border-b border-[#2a2a2a] pb-2 whitespace-nowrap" style={{ color: '#fcc200' }}>
                            PHÁP LÝ & QUY ĐỊNH
                        </Title>
                        <Space direction="vertical" size="middle" className="w-full text-sm">
                            <Link to="/race-rules" className="text-[#a0a0a0] hover:text-[#fcc200] transition-colors block">
                                Điều lệ Đua ngựa
                            </Link>
                            <Link to="/rules" className="text-[#a0a0a0] hover:text-[#fcc200] transition-colors block">
                                Thể lệ Đặt cược
                            </Link>
                            <Link to="/privacy" className="text-[#a0a0a0] hover:text-[#fcc200] transition-colors block">
                                Chính sách Bảo mật & eKYC
                            </Link>
                            <Link to="/terms" className="text-[#a0a0a0] hover:text-[#fcc200] transition-colors block">
                                Điều khoản Sử dụng & Miễn trừ
                            </Link>
                        </Space>
                    </Col>

                    {/* CỘT 3: HỖ TRỢ KHÁCH HÀNG */}
                    <Col xs={24} sm={12} lg={6}>
                        <Title level={4} className="mb-6 uppercase tracking-wider text-sm border-b border-[#2a2a2a] pb-2 whitespace-nowrap" style={{ color: '#fcc200' }}>
                            HỖ TRỢ KHÁCH HÀNG
                        </Title>
                        <Space direction="vertical" size="middle" className="w-full text-sm">
                            <Link to="/guide" className="text-[#a0a0a0] hover:text-[#fcc200] transition-colors block">
                                Hướng dẫn Tân thủ & Nạp/Rút
                            </Link>
                            <Link to="/faq" className="text-[#a0a0a0] hover:text-[#fcc200] transition-colors block">
                                Câu hỏi thường gặp (FAQ)
                            </Link>
                            
                            <div className="mt-2 p-3 bg-[#1e1e1e] rounded-lg border border-[#2c2c2c]">
                                <Text className="text-[#e0e0e0] block mb-2">
                                    <CustomerServiceOutlined className="mr-2 text-[#fcc200]" /> Tổng đài CSKH (24/7)
                                </Text>
                                <Text strong className="text-lg text-[#fcc200] block mb-2">
                                    <PhoneOutlined className="mr-2" />+84 971 966 715
                                </Text>
                                <Text className="text-[#a0a0a0] block">
                                    <MailOutlined className="mr-2 text-[#00b37e]" /> xuankhang2412@gmail.com
                                </Text>
                            </div>
                        </Space>
                    </Col>

                    {/* CỘT 4: CÁ CƯỢC CÓ TRÁCH NHIỆM */}
                    <Col xs={24} sm={12} lg={6}>
                        <div className="bg-[#1e1e1e] p-6 rounded-xl border border-red-900/30 h-full">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="bg-red-600 text-white w-10 h-8 rounded-full flex items-center justify-center font-black text-base shadow-md shrink-0">
                                    21+
                                </div>
                                <Title level={5} className="m-0 uppercase text-[12px] leading-tight" style={{ color: '#ff4d4f' }}>
                                    CHỈ DÀNH CHO NGƯỜI TỪ ĐỦ 21 TUỔI TRỞ LÊN
                                </Title>
                            </div>
                            
                            <Text className="text-[#a0a0a0] block mb-4 text-sm leading-relaxed">
                                <WarningOutlined className="text-[#fcc200] mr-2" />
                                Hoạt động giải trí có thưởng luôn đi kèm rủi ro tài chính. Vui lòng tham gia có chừng mực và kiểm soát mức độ đặt cược phù hợp với khả năng thu nhập của bản thân.
                            </Text>

                            <Divider className="border-[#333] my-4" />
                            
                            <div className="text-sm">
                                <Text className="text-[#a0a0a0] block">Tổng đài tư vấn:</Text>
                                <Text strong className="text-[#fcc200] block">
                                    <PhoneOutlined className="mr-2" /> +84 971 966 715
                                </Text>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default Footer;
