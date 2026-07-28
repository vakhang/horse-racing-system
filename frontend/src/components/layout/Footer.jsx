import React from 'react';
import { Row, Col, Typography, Space, Divider } from 'antd';
import { 
    SafetyCertificateOutlined, 
    BankOutlined, 
    CustomerServiceOutlined, 
    WarningOutlined,
    MailOutlined,
    PhoneOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

const Footer = () => {
    return (
        <div className="bg-[#001529] text-slate-200 py-12 px-6 lg:px-20 border-t border-gray-800 mt-auto">
            <div className="max-w-7xl mx-auto">
                <Row gutter={[48, 32]}>
                    {/* CỘT 1: THÔNG TIN DOANH NGHIỆP */}
                    <Col xs={24} sm={12} lg={6}>
                        <Title level={4} className="mb-6 uppercase tracking-wider text-sm border-b border-gray-700 pb-2 whitespace-nowrap" style={{ color: 'white' }}>
                            THÔNG TIN DOANH NGHIỆP
                        </Title>
                        <Space direction="vertical" size="middle" className="w-full">
                            <div>
                                <Text strong className="text-yellow-500 block mb-1" style={{ color: '#eab308' }}>TỔ CHỨC ĐUA NGỰA KKTA</Text>
                            </div>
                            <div className="text-sm">
                                <Text className="text-white block mb-1" style={{ color: 'white' }}>Giấy chứng nhận đủ điều kiện kinh doanh đặt cược do Bộ Tài chính cấp.</Text>
                                <Text className="text-white block" style={{ color: 'white' }}>Tuân thủ Nghị định 06/2017/NĐ-CP.</Text>
                            </div>
                            <div className="text-sm text-white">
                                <BankOutlined className="mr-2" />
                                Trường đua ngựa Sóc Sơn, Hà Nội, Việt Nam.
                            </div>
                            <Text className="text-white text-xs mt-4 block" style={{ color: 'white' }}>
                                © 2026 Horse Racing VN. Mọi quyền được bảo lưu.
                            </Text>
                        </Space>
                    </Col>

                    {/* CỘT 2: PHÁP LÝ & QUY ĐỊNH */}
                    <Col xs={24} sm={12} lg={6}>
                        <Title level={4} className="mb-6 uppercase tracking-wider text-sm border-b border-gray-700 pb-2 whitespace-nowrap" style={{ color: 'white' }}>
                            PHÁP LÝ & QUY ĐỊNH
                        </Title>
                        <Space direction="vertical" size="middle" className="w-full text-sm">
                            <Link to="/home" className="text-white hover:text-yellow-400 transition-colors block" style={{ color: 'white' }}>
                                Điều lệ Đua ngựa
                            </Link>
                            <Link to="/home" className="text-white hover:text-yellow-400 transition-colors block" style={{ color: 'white' }}>
                                Thể lệ Đặt cược
                            </Link>
                            <Link to="/home" className="text-white hover:text-yellow-400 transition-colors block" style={{ color: 'white' }}>
                                Chính sách Bảo mật & eKYC
                            </Link>
                            <Link to="/home" className="text-white hover:text-yellow-400 transition-colors block" style={{ color: 'white' }}>
                                Điều khoản Sử dụng & Miễn trừ
                            </Link>
                        </Space>
                    </Col>

                    {/* CỘT 3: HỖ TRỢ KHÁCH HÀNG */}
                    <Col xs={24} sm={12} lg={6}>
                        <Title level={4} className="mb-6 uppercase tracking-wider text-sm border-b border-gray-700 pb-2 whitespace-nowrap" style={{ color: 'white' }}>
                            HỖ TRỢ KHÁCH HÀNG
                        </Title>
                        <Space direction="vertical" size="middle" className="w-full text-sm">
                            <Link to="/home" className="text-white hover:text-yellow-400 transition-colors block" style={{ color: 'white' }}>
                                Hướng dẫn Tân thủ & Nạp/Rút
                            </Link>
                            <Link to="/home" className="text-white hover:text-yellow-400 transition-colors block" style={{ color: 'white' }}>
                                Câu hỏi thường gặp (FAQ)
                            </Link>
                            
                            <div className="mt-2 p-3 bg-white/5 rounded-lg border border-white/10">
                                <Text className="text-white block mb-2" style={{ color: 'white' }}>
                                    <CustomerServiceOutlined className="mr-2 text-yellow-500" /> Tổng đài CSKH (24/7)
                                </Text>
                                <Text strong className="text-lg text-white block mb-2" style={{ color: 'white' }}>+84 971 966 715</Text>
                                <Text className="text-white block" style={{ color: 'white' }}>
                                    <MailOutlined className="mr-2" /> xuankhang2412@gmail.com
                                </Text>
                            </div>
                        </Space>
                    </Col>

                    {/* CỘT 4: CÁ CƯỢC CÓ TRÁCH NHIỆM */}
                    <Col xs={24} sm={12} lg={6}>
                        <div className="bg-red-950/30 p-6 rounded-xl border border-red-900/50 h-full">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="bg-red-600 text-white w-10 h-8 rounded-full flex items-center justify-center font-black text-base shadow-[0_0_15px_rgba(220,38,38,0.5)] shrink-0">
                                    21+
                                </div>
                                <Title level={5} className="m-0 uppercase text-[12px] leading-tight" style={{ color: '#f87171' }}>
                                    CHỈ DÀNH CHO NGƯỜI TỪ ĐỦ 21 TUỔI TRỞ LÊN
                                </Title>
                            </div>
                            
                            <Text className="text-white block mb-4 text-sm leading-relaxed" style={{ color: 'white' }}>
                                <WarningOutlined className="text-yellow-500 mr-2" />
                                Hoạt động giải trí có thưởng luôn đi kèm rủi ro tài chính. Vui lòng tham gia có chừng mực và kiểm soát mức độ đặt cược phù hợp với khả năng thu nhập của bản thân.
                            </Text>

                            <Divider className="border-red-900/50 my-4" />
                            
                            <div className="text-sm">
                                <Text className="text-white block" style={{ color: 'white' }}>Tổng đài tư vấn:</Text>
                                <Text strong className="text-white block" style={{ color: 'white' }}>
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
