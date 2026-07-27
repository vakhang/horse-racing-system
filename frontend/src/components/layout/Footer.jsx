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
                        <Title level={4} className="mb-6 uppercase tracking-wider text-sm border-b border-gray-700 pb-2" style={{ color: 'white' }}>
                            THÔNG TIN DOANH NGHIỆP
                        </Title>
                        <Space direction="vertical" size="middle" className="w-full">
                            <div>
                                <Text strong className="text-yellow-500 block mb-1">CÔNG TY CỔ PHẦN CÁ CƯỢC ĐUA NGỰA HỢP PHÁP VIỆT NAM</Text>
                            </div>
                            <div className="text-sm">
                                <Text className="text-slate-300 block mb-1">Giấy chứng nhận đủ điều kiện kinh doanh đặt cược do Bộ Tài chính cấp.</Text>
                                <Text className="text-slate-300 block">Tuân thủ Nghị định 06/2017/NĐ-CP.</Text>
                            </div>
                            <div className="text-sm">
                                <BankOutlined className="mr-2" />
                                Trường đua ngựa Sóc Sơn, Hà Nội, Việt Nam.
                            </div>
                            <Text className="text-gray-500 text-xs mt-4 block">
                                © 2026 Horse Racing VN. Mọi quyền được bảo lưu.
                            </Text>
                        </Space>
                    </Col>

                    {/* CỘT 2: PHÁP LÝ & QUY ĐỊNH */}
                    <Col xs={24} sm={12} lg={6}>
                        <Title level={4} className="mb-6 uppercase tracking-wider text-sm border-b border-gray-700 pb-2" style={{ color: 'white' }}>
                            PHÁP LÝ & QUY ĐỊNH
                        </Title>
                        <Space direction="vertical" size="middle" className="w-full text-sm">
                            <Link to="/home" className="text-slate-300 hover:text-yellow-400 transition-colors block">
                                Điều lệ Đua ngựa (Đã được phê duyệt)
                            </Link>
                            <Link to="/home" className="text-slate-300 hover:text-yellow-400 transition-colors block">
                                Thể lệ Đặt cược (Đã đăng ký BTC)
                            </Link>
                            <Link to="/home" className="text-slate-300 hover:text-yellow-400 transition-colors block">
                                Chính sách Bảo mật & eKYC
                            </Link>
                            <Link to="/home" className="text-slate-300 hover:text-yellow-400 transition-colors block">
                                Điều khoản Sử dụng & Miễn trừ
                            </Link>
                            <div className="mt-2 text-xs text-gray-500 italic">
                                * Xem chi tiết tại mục Thông báo / Tin tức.
                            </div>
                        </Space>
                    </Col>

                    {/* CỘT 3: HỖ TRỢ KHÁCH HÀNG */}
                    <Col xs={24} sm={12} lg={6}>
                        <Title level={4} className="mb-6 uppercase tracking-wider text-sm border-b border-gray-700 pb-2" style={{ color: 'white' }}>
                            HỖ TRỢ KHÁCH HÀNG
                        </Title>
                        <Space direction="vertical" size="middle" className="w-full text-sm">
                            <Link to="/home" className="text-slate-300 hover:text-yellow-400 transition-colors block">
                                Hướng dẫn Tân thủ & Nạp/Rút
                            </Link>
                            <Link to="/home" className="text-slate-300 hover:text-yellow-400 transition-colors block">
                                Câu hỏi thường gặp (FAQ)
                            </Link>
                            
                            <div className="mt-2 p-3 bg-white/5 rounded-lg border border-white/10">
                                <Text className="text-slate-200 block mb-2">
                                    <CustomerServiceOutlined className="mr-2 text-yellow-500" /> Tổng đài CSKH (24/7)
                                </Text>
                                <Text strong className="text-lg text-white block mb-2">1900 8888</Text>
                                <Text className="text-slate-300 block">
                                    <MailOutlined className="mr-2" /> support@horse-racing.vn
                                </Text>
                            </div>
                            <Text className="text-xs text-gray-500 block">
                                * Mọi giao dịch 100% bằng VNĐ qua ngân hàng.
                            </Text>
                        </Space>
                    </Col>

                    {/* CỘT 4: CÁ CƯỢC CÓ TRÁCH NHIỆM */}
                    <Col xs={24} sm={12} lg={6}>
                        <div className="bg-red-950/30 p-6 rounded-xl border border-red-900/50 h-full">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-lg shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                                    21+
                                </div>
                                <Title level={5} className="m-0 uppercase text-sm" style={{ color: '#f87171' }}>
                                    CHỈ DÀNH CHO NGƯỜI TỪ ĐỦ 21 TUỔI TRỞ LÊN
                                </Title>
                            </div>
                            
                            <Text className="text-slate-200 block mb-4 text-sm leading-relaxed">
                                <WarningOutlined className="text-yellow-500 mr-2" />
                                Hoạt động giải trí có thưởng luôn đi kèm rủi ro tài chính. Vui lòng tham gia có chừng mực và kiểm soát mức độ đặt cược phù hợp với khả năng thu nhập của bản thân.
                            </Text>

                            <Divider className="border-red-900/50 my-4" />
                            
                            <div className="text-sm">
                                <Text className="text-slate-300 block mb-1">Hạn mức cược tuân thủ pháp luật:</Text>
                                <Text strong className="text-yellow-500 block text-base mb-3">Tối đa: 1.000.000 VNĐ / ngày</Text>
                                
                                <Text className="text-slate-300 block">Tổng đài tư vấn cờ bạc an toàn:</Text>
                                <Text strong className="text-white block">
                                    <PhoneOutlined className="mr-2" /> 1800 9999
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
