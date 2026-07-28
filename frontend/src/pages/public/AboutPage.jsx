import React from 'react';
import { Typography, Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import Footer from '../../components/layout/Footer';
import PublicHeader from '../../components/layout/PublicHeader';

const { Title, Paragraph } = Typography;

const AboutPage = () => {
    return (
        <div className="min-h-screen bg-[#001529] font-sans flex flex-col">
            <PublicHeader />

            <div className="flex-grow max-w-7xl mx-auto w-full px-6 py-12 pt-32">
                <Breadcrumb 
                    className="mb-8"
                    items={[
                        { title: <Link to="/"><HomeOutlined className="text-gray-400" /></Link> },
                        { title: <span className="text-yellow-500">Giới Thiệu</span> }
                    ]}
                />
                <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
                    <Title level={2} className="text-white mb-6 uppercase tracking-wider border-l-4 border-yellow-500 pl-4" style={{ color: 'white' }}>Giới thiệu về KKAN</Title>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <Paragraph className="text-gray-300 text-lg leading-relaxed text-justify" style={{ color: '#d1d5db' }}>
                                <strong className="text-white">Tổ chức Đua ngựa KKAN</strong> (được sáng lập và phát triển bởi nhóm kỹ sư phần mềm trẻ: Xuân Khang, Anh Khang, Trí Nguyên và Hoàng Anh) là một dự án nghiên cứu và phát triển công nghệ (R&D) thuộc bộ môn SWP tại Đại học FPT.
                            </Paragraph>
                            <Paragraph className="text-gray-300 text-lg leading-relaxed text-justify" style={{ color: '#d1d5db' }}>
                                Nhận thức rõ tính chất nhạy cảm và các quy định nghiêm ngặt của pháp luật Việt Nam, hệ thống của KKAN không phải là một website cá cược thương mại. Trái lại, mục tiêu cốt lõi của chúng tôi là xây dựng một <strong className="text-yellow-400">Môi trường thử nghiệm khép kín (Sandbox)</strong>, mô phỏng hoàn chỉnh kiến trúc của một "Phần mềm quản trị nội bộ dành cho doanh nghiệp đủ điều kiện kinh doanh đặt cược".
                            </Paragraph>
                        </div>
                        <div className="rounded-xl overflow-hidden shadow-2xl border border-white/10">
                            <img src="https://images.unsplash.com/photo-1598257006626-48b0c252070d?q=80&w=2070&auto=format&fit=crop" alt="Horse Racing" className="w-full h-full object-cover" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="order-2 md:order-1 rounded-xl overflow-hidden shadow-2xl border border-white/10">
                            <img src="https://hoangphucphoto.com/wp-content/uploads/2025/07/anh-dua-ngua-6.webp" alt="Horse Racing Event" className="w-full h-full object-cover" />
                        </div>
                        <div className="order-1 md:order-2">
                            <Paragraph className="text-gray-300 text-lg leading-relaxed text-justify mb-4" style={{ color: '#d1d5db' }}>
                                Hệ thống được thiết kế bám sát các tiêu chuẩn kỹ thuật và ranh giới pháp lý tại <strong className="text-white">Nghị định 06/2017/NĐ-CP</strong>. Toàn bộ dữ liệu người dùng, kết quả trận đấu và dòng tiền giao dịch trên nền tảng KKAN đều là <strong className="text-white">dữ liệu giả định (Mock Data & Virtual Currency)</strong>, tuyệt đối không sử dụng tiền thật.
                            </Paragraph>
                            <Paragraph className="text-gray-300 text-lg leading-relaxed text-justify" style={{ color: '#d1d5db' }}>
                                Chúng tôi tự hào mang đến một giải pháp công nghệ minh bạch, an toàn, sẵn sàng đáp ứng các tiêu chuẩn kiểm toán phần mềm khắt khe nhất.
                            </Paragraph>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default AboutPage;

