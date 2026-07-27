import React from 'react';
import { Typography, Row, Col, Button, Card } from 'antd';
import { 
    SafetyCertificateOutlined, 
    GlobalOutlined, 
    BankOutlined,
    LoginOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/layout/Footer';

const { Title, Text } = Typography;

const CorporateLandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#001529] font-sans flex flex-col">
            {/* HEADER / NAVIGATION BAR */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-[#001529]/95 backdrop-blur-md border-b border-white/10 px-6 lg:px-20 py-4 flex justify-between items-center shadow-md">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center font-black text-black shadow-[0_0_15px_rgba(234,179,8,0.5)]">HR</div>
                    <Text className="text-white font-black text-xl tracking-wider uppercase hidden md:block" style={{ color: 'white' }}>Horse Racing VN</Text>
                </div>
                <div className="hidden lg:flex gap-8 items-center">
                    <a href="#" className="text-gray-300 hover:text-yellow-400 font-semibold transition-colors">TRANG CHỦ</a>
                    <a href="#" className="text-gray-300 hover:text-yellow-400 font-semibold transition-colors">LỊCH ĐUA</a>
                    <a href="#" className="text-gray-300 hover:text-yellow-400 font-semibold transition-colors">KẾT QUẢ</a>
                    <a href="#" className="text-gray-300 hover:text-yellow-400 font-semibold transition-colors">TIN TỨC</a>
                    <a href="#" className="text-gray-300 hover:text-yellow-400 font-semibold transition-colors">HƯỚNG DẪN</a>
                </div>
                <Button 
                    type="primary" 
                    icon={<LoginOutlined />}
                    style={{ background: '#eab308', color: 'black', border: 'none' }}
                    className="font-bold shadow-lg hover:scale-105 transition-transform"
                    onClick={() => navigate('/login')}
                >
                    ĐĂNG NHẬP
                </Button>
            </div>

            {/* PHẦN 1: HERO BANNER */}
            <div className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden pt-20">
                <div 
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-30"
                    style={{ backgroundImage: 'url(https://vinhomesvuyenhaiphong.com/uploads/024267aa-4d55-4979-8254-99201ce68083.jpeg)' }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-b from-[#001529]/95 via-[#001529]/60 to-[#001529] z-10"></div>
                
                <div className="z-20 text-center px-4 max-w-5xl mx-auto">
                    <Title level={1} className="text-4xl md:text-6xl font-black text-white tracking-widest uppercase mb-4" style={{ color: 'white', textShadow: '0 4px 10px rgba(0,0,0,0.8)' }}>
                        CÔNG TY CỔ PHẦN CÁ CƯỢC ĐUA NGỰA HỢP PHÁP VIỆT NAM
                    </Title>
                    <Title level={3} className="text-xl md:text-2xl text-yellow-400 uppercase tracking-widest font-bold mb-6" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                        Đỉnh Cao Tốc Độ - Minh Bạch Giao Dịch - Tuân Thủ Pháp Luật
                    </Title>
                    <Text className="text-gray-100 text-lg md:text-xl block mb-12 max-w-3xl mx-auto leading-relaxed font-medium" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                        Nền tảng quản trị và vận hành giải trí có thưởng uy tín hàng đầu, được cấp phép và chịu sự giám sát chặt chẽ của các cơ quan quản lý Nhà nước.
                    </Text>
                    
                    <Button 
                        type="primary"
                        size="large"
                        style={{ background: 'linear-gradient(to right, #eab308, #facc15)', color: 'black', border: 'none' }}
                        className="font-black h-16 px-12 text-xl hover:scale-105 transition-transform shadow-[0_0_30px_rgba(234,179,8,0.5)] rounded-full mt-4"
                        onClick={() => navigate('/login')}
                    >
                        XEM LỊCH ĐUA & ĐẶT CƯỢC
                    </Button>
                </div>
            </div>

            {/* PHẦN 2: GIỚI THIỆU DOANH NGHIỆP & TÍNH PHÁP LÝ */}
            <div className="py-24 px-6 lg:px-20 bg-[#001529]">
                <div className="max-w-6xl mx-auto">
                    <Row gutter={[48, 48]} align="middle">
                        <Col xs={24} lg={12}>
                            <Title level={2} className="text-3xl font-bold border-l-4 border-yellow-500 pl-4 mb-6 text-white" style={{ color: 'white' }}>
                                Về Chúng Tôi
                            </Title>
                            <Text className="text-slate-300 text-lg leading-relaxed block mb-4 text-justify">
                                Chúng tôi tự hào là đơn vị tiên phong được cấp Giấy chứng nhận đủ điều kiện kinh doanh đặt cược đua ngựa tại Việt Nam. Với dự án đầu tư trường đua đạt chuẩn quốc tế cùng tổng vốn đầu tư tối thiểu 1.000 tỷ đồng, chúng tôi mang đến một môi trường giải trí chuyên nghiệp, đóng góp vào sự phát triển kinh tế và hỗ trợ cộng đồng.
                            </Text>
                            <Text className="text-slate-300 text-lg leading-relaxed block text-justify">
                                Hoạt động kinh doanh của chúng tôi tuân thủ nghiêm ngặt Nghị định 06/2017/NĐ-CP, đặt tính khách quan và sự bảo vệ quyền lợi người chơi lên hàng đầu.
                            </Text>
                        </Col>
                        <Col xs={24} lg={12}>
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-700 h-[400px]">
                                <img src="https://hoangphucphoto.com/wp-content/uploads/2025/07/anh-dua-ngua-6.webp" alt="Trường đua" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/30"></div>
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>

            {/* PHẦN 3: NỀN TẢNG CÔNG NGHỆ & SỰ MINH BẠCH */}
            <div className="py-24 px-6 lg:px-20 bg-gradient-to-b from-[#001529] to-[#000a14]">
                <div className="max-w-6xl mx-auto">
                    <Title level={2} className="text-3xl font-bold text-center mb-16 text-white uppercase tracking-wider" style={{ color: 'white' }}>
                        Nền Tảng Công Nghệ Hiện Đại
                    </Title>
                    
                    <Row gutter={[32, 32]}>
                        <Col xs={24} md={8}>
                            <Card className="h-full bg-[#1E293B] border border-slate-700 rounded-2xl hover:bg-slate-700 transition-colors shadow-lg">
                                <div className="text-center mb-6">
                                    <SafetyCertificateOutlined className="text-6xl text-white" />
                                </div>
                                <Title level={4} className="text-center text-white mb-4" style={{ color: 'white' }}>Bảo Mật Tuyệt Đối</Title>
                                <Text className="text-slate-300 text-base text-justify block">
                                    Hệ thống công nghệ, thiết bị kỹ thuật và phần mềm kinh doanh được đầu tư đồng bộ. Dữ liệu tham gia đặt cược được mã hóa và sao lưu trên máy chủ dự phòng, nghiêm cấm mọi can thiệp.
                                </Text>
                            </Card>
                        </Col>
                        <Col xs={24} md={8}>
                            <Card className="h-full bg-[#1E293B] border border-slate-700 rounded-2xl hover:bg-slate-700 transition-colors shadow-lg">
                                <div className="text-center mb-6">
                                    <GlobalOutlined className="text-6xl text-white" />
                                </div>
                                <Title level={4} className="text-center text-white mb-4" style={{ color: 'white' }}>Kết Quả Minh Bạch</Title>
                                <Text className="text-slate-300 text-base text-justify block">
                                    Mọi kết quả sự kiện đua ngựa đều được quyết định bởi Ban Trọng tài chuyên nghiệp và xác nhận độc lập bởi Hội đồng giám sát cuộc đua, loại bỏ hoàn toàn yếu tố gian lận.
                                </Text>
                            </Card>
                        </Col>
                        <Col xs={24} md={8}>
                            <Card className="h-full bg-[#1E293B] border border-slate-700 rounded-2xl hover:bg-slate-700 transition-colors shadow-lg">
                                <div className="text-center mb-6">
                                    <BankOutlined className="text-6xl text-white" />
                                </div>
                                <Title level={4} className="text-center text-white mb-4" style={{ color: 'white' }}>Giao Dịch Hợp Pháp</Title>
                                <Text className="text-slate-300 text-base text-justify block">
                                    Mọi giao dịch nạp, trả thưởng đều được thực hiện minh bạch bằng Việt Nam Đồng (VNĐ) thông qua hệ thống tài khoản tại các tổ chức tín dụng hợp pháp ở Việt Nam.
                                </Text>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>

            {/* PHẦN 5: TIN TỨC & THÔNG BÁO */}
            <div className="py-24 px-6 lg:px-20 bg-[#000a14]">
                <div className="max-w-4xl mx-auto">
                    <Title level={2} className="text-3xl font-bold border-l-4 border-blue-500 pl-4 mb-10 text-white" style={{ color: 'white' }}>
                        Tin Tức & Thông Báo Pháp Lý
                    </Title>
                    <div className="space-y-6">
                        <div className="bg-white/5 p-8 rounded-xl border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-white/10 transition-colors cursor-pointer">
                            <div>
                                <span className="border border-red-400 text-red-400 bg-transparent text-xs font-bold px-3 py-1 rounded-full mr-3">THÔNG BÁO</span>
                                <Text className="text-white text-lg hover:text-yellow-400 font-semibold" style={{ color: 'white' }}>Cập nhật Thể lệ đặt cược và Điều lệ đua mùa giải Mùa Hè 2026</Text>
                            </div>
                            <Text className="text-slate-400 font-bold mt-2 md:mt-0 whitespace-nowrap">27/07/2026</Text>
                        </div>
                        <div className="bg-white/5 p-8 rounded-xl border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-white/10 transition-colors cursor-pointer">
                            <div>
                                <span className="border border-blue-400 text-blue-400 bg-transparent text-xs font-bold px-3 py-1 rounded-full mr-3">HỆ THỐNG</span>
                                <Text className="text-white text-lg hover:text-yellow-400 font-semibold" style={{ color: 'white' }}>Lịch bảo trì hệ thống máy chủ định kỳ tháng 8</Text>
                            </div>
                            <Text className="text-slate-400 font-bold mt-2 md:mt-0 whitespace-nowrap">25/07/2026</Text>
                        </div>
                        <div className="bg-white/5 p-8 rounded-xl border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-white/10 transition-colors cursor-pointer">
                            <div>
                                <span className="border border-green-400 text-green-400 bg-transparent text-xs font-bold px-3 py-1 rounded-full mr-3">TIN TỨC</span>
                                <Text className="text-white text-lg hover:text-yellow-400 font-semibold" style={{ color: 'white' }}>Công bố danh sách Chiến mã và Nài ngựa xuất sắc nhất tháng qua</Text>
                            </div>
                            <Text className="text-slate-400 font-bold mt-2 md:mt-0 whitespace-nowrap">20/07/2026</Text>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default CorporateLandingPage;
