import React, { useState } from 'react';
import { Form, Input, Button, Typography, message, ConfigProvider, theme, Modal } from 'antd';
import { MailOutlined, LockOutlined, TrophyOutlined, ArrowLeftOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

// [Chức năng rõ ràng]: Trang Đăng Nhập Chuẩn bet989 Racing System
const LoginPage = () => {
    const [loading, setLoading] = useState(false);
    const [isBanModalVisible, setIsBanModalVisible] = useState(false);
    const [banReason, setBanReason] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (values) => {
        setLoading(true);
        try {
            const response = await api.post('/auth/login', {
                email: values.email, // Backend hỗ trợ tìm cả email và số điện thoại
                password: values.password
            });

            login(response.data);

            if (response.data.role === 'ADMIN') {
                navigate('/admin/users');
            } else {
                navigate('/');
            }
        } catch (error) {
            const errorMsg = error.response?.data?.error || error.response?.data || '';

            if (errorMsg.includes('BANNED:')) {
                setBanReason(errorMsg.replace('BANNED:', ''));
                setIsBanModalVisible(true);
            } else if (errorMsg.includes('REJECTED:')) {
                setBanReason(errorMsg.replace('REJECTED:', ''));
                setIsBanModalVisible(true);
            } else {
                message.error(errorMsg || 'Đăng nhập thất bại!');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <ConfigProvider theme={{ algorithm: theme.darkAlgorithm, token: { colorPrimary: '#007355' } }}>
            <div className="min-h-screen flex items-center justify-center p-6 relative bg-gradient-to-br from-[#0a1510] via-[#121212] to-[#0a1510] text-white">
                {/* Visual Glow Background Elements */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#007355]/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#ffdf1b]/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="z-10 w-full max-w-md p-8 md:p-10 rounded-3xl bg-[#162a22]/80 backdrop-blur-xl border border-[#007355]/50 shadow-[0_0_50px_rgba(0,115,85,0.25)] transition-all hover:shadow-[0_0_60px_rgba(0,115,85,0.4)]">

                    {/* BRANDING LOGO HEADER */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center mb-3">
                            <div className="bg-[#007355] text-white font-black text-2xl tracking-wider px-4 py-1.5 rounded-lg border border-[#00ffb3] shadow-[0_0_15px_rgba(0,255,179,0.3)]">
                                bet <span className="px-2 py-0.5 rounded font-black text-xl inline-block" style={{ backgroundColor: '#ffdf1b', color: '#000000' }}>989</span> RACING
                            </div>
                        </div>
                        <Title level={3} className="m-0 text-white font-bold tracking-wide">
                            ĐẮNG NHẬP HỆ THỐNG
                        </Title>
                        <Text className="text-gray-400 text-xs uppercase tracking-widest block mt-1">
                            Hệ Thống Đặt Cược Đua Ngựa Chuyên Nghiệp
                        </Text>
                    </div>

                    <Form name="login" layout="vertical" onFinish={handleLogin} size="large">
                        <Form.Item
                            name="email"
                            label={<Text className="text-gray-300 font-semibold">Email hoặc Số điện thoại</Text>}
                            rules={[{ required: true, message: 'Vui lòng nhập Email hoặc SĐT đăng nhập!' }]}
                        >
                            <Input
                                prefix={<MailOutlined className="text-[#00ffb3]" />}
                                placeholder="Nhập Email hoặc SĐT..."
                                autoComplete="username"
                                className="bg-[#121212] border-gray-700 text-white hover:border-[#007355] focus:border-[#00ffb3] rounded-xl px-4 py-3"
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label={<Text className="text-gray-300 font-semibold">Mật khẩu bảo mật</Text>}
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                        >
                            <Input.Password
                                prefix={<LockOutlined className="text-[#00ffb3]" />}
                                placeholder="Mật khẩu của bạn..."
                                autoComplete="current-password"
                                className="bg-[#121212] border-gray-700 text-white hover:border-[#007355] focus:border-[#00ffb3] rounded-xl px-4 py-3"
                            />
                        </Form.Item>

                        <Form.Item className="mt-6 mb-4">
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                block
                                style={{ backgroundColor: '#007355', color: '#ffffff', fontWeight: 'bold' }}
                                className="h-13 border-none text-white font-bold text-lg rounded-xl shadow-[0_0_20px_rgba(0,115,85,0.5)] hover:bg-[#005740] hover:scale-[1.02] transition-all duration-300"
                            >
                                {loading ? 'ĐANG KẾT NỐI...' : 'ĐĂNG NHẬP BET989'}
                            </Button>
                        </Form.Item>
                    </Form>

                    <div className="text-center mt-6 pt-4 border-t border-gray-800">
                        <Text className="text-gray-400 text-sm">Chưa có tài khoản?</Text>{' '}
                        <Link to="/register" className="text-[#00ffb3] font-bold hover:text-yellow-400 transition-colors text-sm">
                            Đăng Ký Ngay
                        </Link>
                        <div className="mt-4">
                            <Link to="/" className="text-gray-400 hover:text-white transition-colors text-xs flex items-center justify-center gap-1">
                                <ArrowLeftOutlined /> Quay về Trang chủ
                            </Link>
                        </div>
                    </div>
                </div>

                {/* MODAL THÔNG BÁO BANNED / REJECTED TÀI KHOẢN */}
                <Modal
                    title={<span className="text-xl font-bold text-red-500 uppercase flex items-center gap-2"><SafetyCertificateOutlined /> TRUY CẬP BỊ TỪ CHỐI</span>}
                    open={isBanModalVisible}
                    onCancel={() => setIsBanModalVisible(false)}
                    footer={[
                        <Button key="close" type="primary" danger size="large" onClick={() => setIsBanModalVisible(false)} className="font-bold rounded-lg px-8">
                            Đóng thông báo
                        </Button>
                    ]}
                    centered
                >
                    <div className="text-base text-gray-300 space-y-4 my-4">
                        <div className="bg-red-950/60 p-4 rounded-xl border border-red-500/50 text-red-200">
                            {banReason || "Tài khoản của bạn đã bị Quản trị viên (Admin) khóa do nghi ngờ vi phạm quy định của hệ thống hoặc chưa được phê duyệt KYC."}
                        </div>
                        <p>Vui lòng liên hệ với Ban Quản Trị qua các kênh hỗ trợ để được kiểm tra:</p>

                        <div className="bg-[#121212] p-4 rounded-xl border border-gray-800 space-y-3">
                            <div className="flex items-center gap-3">
                                <span className="text-xl">📞</span>
                                <div>
                                    <span className="text-xs font-bold uppercase block text-gray-400">Hotline / Zalo</span>
                                    <span className="text-base font-bold text-emerald-400">0971 966 715</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xl">📧</span>
                                <div>
                                    <span className="text-xs font-bold uppercase block text-gray-400">Email Hỗ Trợ</span>
                                    <span className="text-sm font-bold text-gray-200">xuankhang2412@gmail.com</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
            </div>
        </ConfigProvider>
    );
};

export default LoginPage;