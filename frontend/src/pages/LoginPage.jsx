import horseRacingBg from '../assets/horseracing.png';
import React, { useState } from 'react';
import { Form, Input, Button, Typography, message, ConfigProvider, theme, Modal } from 'antd';
import { MailOutlined, LockOutlined, TrophyOutlined, FireOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

const LoginPage = () => {
    const [loading, setLoading] = useState(false);
    const [isBanModalVisible, setIsBanModalVisible] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (values) => {
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:8080/api/auth/login', {
                email: values.email, // Backend sẽ dùng chuỗi này quét cả cột email và cột sdt
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

            if (errorMsg.includes('bị khóa')) {
                setIsBanModalVisible(true);
            } else {
                message.error(errorMsg || 'Đăng nhập thất bại!');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <ConfigProvider theme={{ algorithm: theme.darkAlgorithm, token: { colorPrimary: '#facc15' } }}>
            <div
                className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
                style={{
                    backgroundImage: `url(${horseRacingBg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                <div className="absolute inset-0 z-0 bg-black/60"></div>

                <div className="z-10 w-full max-w-md p-10 rounded-3xl shadow-[0_0_50px_rgba(250,204,21,0.15)] bg-black/40 backdrop-blur-md border border-white/10 transition-all hover:shadow-[0_0_60px_rgba(250,204,21,0.3)]">

                    <div className="text-center mb-10">
                        <TrophyOutlined className="text-6xl text-yellow-400 mb-4 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]" />
                        <Title level={2} className="m-0 text-white uppercase tracking-widest font-bold">
                            Horse Race
                        </Title>
                        <Text className="text-yellow-400 font-medium tracking-widest text-xs uppercase flex items-center justify-center gap-1 mt-2">
                            <FireOutlined /> Đẳng Cấp Thượng Lưu <FireOutlined />
                        </Text>
                    </div>

                    <Form name="login" layout="vertical" onFinish={handleLogin} size="large">
                        {/* Đã sửa Label thành Email hoặc SDT */}
                        <Form.Item name="email" rules={[{ required: true, message: 'Vui lòng nhập định danh đăng nhập!' }]}>
                            <Input
                                prefix={<MailOutlined className="text-gray-400" />}
                                placeholder="Nhập Email hoặc Số điện thoại..."
                                autoComplete="off"
                                className="bg-black/60 border-gray-600 text-white hover:border-yellow-400 focus:border-yellow-400 rounded-xl px-4 py-3"
                            />
                        </Form.Item>

                        <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
                            <Input.Password
                                prefix={<LockOutlined className="text-gray-400" />}
                                placeholder="Mật khẩu của bạn..."
                                autoComplete="current-password"
                                className="bg-black/60 border-gray-600 text-white hover:border-yellow-400 focus:border-yellow-400 rounded-xl px-4 py-3"
                            />
                        </Form.Item>

                        <Form.Item className="mt-8 mb-4">
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                block
                                className="h-14 bg-gradient-to-r from-yellow-500 to-yellow-600 border-none text-black font-bold text-lg rounded-xl shadow-[0_4px_15px_rgba(250,204,21,0.5)] hover:scale-105 transition-transform duration-300"
                            >
                                {loading ? 'ĐANG KẾT NỐI...' : 'ĐĂNG NHẬP HỆ THỐNG'}
                            </Button>
                        </Form.Item>
                    </Form>

                    <div className="text-center">
                        <Text className="text-gray-400">Chưa có tài khoản?</Text>{' '}
                        <Link to="/register" className="text-yellow-400 font-bold hover:text-white transition-colors">
                            Đăng Ký Ngay
                        </Link>
                    </div>
                </div>

                {/* MODAL THÔNG BÁO BANNED TÀI KHOẢN CAO CẤP */}
                <Modal
                    title={<span className="text-xl font-black text-red-500 uppercase">❌ Tài Khoản Bị Khóa</span>}
                    open={isBanModalVisible}
                    onCancel={() => setIsBanModalVisible(false)}
                    footer={[
                        <Button key="close" type="primary" danger size="large" onClick={() => setIsBanModalVisible(false)} className="font-bold rounded-lg px-8">
                            Đóng thông báo
                        </Button>
                    ]}
                    centered
                    className="custom-ban-modal"
                >
                    <div className="text-base text-gray-300 space-y-4 my-6">
                        <div className="bg-red-900/40 p-4 rounded-xl border border-red-500/50 text-red-200">
                            Tài khoản của bạn đã bị <b className="text-red-400">Quản trị viên (Admin) khóa</b> do nghi ngờ vi phạm quy định của hệ thống hoặc có hành vi gian lận trong quá trình tham gia.
                        </div>
                        <p>Nếu bạn cho rằng đây là sự nhầm lẫn, vui lòng liên hệ ngay với Ban Quản Trị qua các kênh dưới đây để được hỗ trợ mở lại tài khoản:</p>

                        <div className="bg-white/10 p-5 rounded-xl border border-white/20 shadow-inner space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">📞</span>
                                <div>
                                    <span className="text-xs font-bold uppercase block text-gray-400">Hotline / Zalo</span>
                                    <span className="text-lg font-bold text-blue-400">0971 966 715</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">📧</span>
                                <div>
                                    <span className="text-xs font-bold uppercase block text-gray-400">Email Hỗ Trợ</span>
                                    <span className="text-base font-bold text-gray-200">xuankhang2412@gmail.com</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🌐</span>
                                <div>
                                    <span className="text-xs font-bold uppercase block text-gray-400">Facebook Admin</span>
                                    <a href="https://www.facebook.com/grizzcute/" target="_blank" rel="noreferrer" className="text-base font-bold text-blue-400 hover:text-blue-300">
                                        Ngô Xuân Khang (Grizz)
                                    </a>
                                </div>
                            </div>
                        </div>
                        <p className="italic text-sm text-gray-500 text-center mt-4">
                            * Vui lòng cung cấp Email đăng ký khi liên hệ để được hỗ trợ nhanh nhất.
                        </p>
                    </div>
                </Modal>
            </div>
        </ConfigProvider>
    );
};

export default LoginPage;