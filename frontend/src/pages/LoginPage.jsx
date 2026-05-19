import React, { useState } from 'react';
import { Form, Input, Button, Typography, message, Divider, ConfigProvider, theme } from 'antd';
import { MailOutlined, LockOutlined, TrophyOutlined, FireOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Hãy chắc chắn rằng AuthContext đã được định nghĩa

// Import ảnh trực tiếp từ thư mục assets
import horseRacingBg from '../assets/horseracing.png';

const { Title, Text } = Typography;

const LoginPage = () => {
    const [loading, setLoading] = useState(false);
    const { login } = useAuth(); // Hoặc bạn có thể tự implement logic login
    const navigate = useNavigate();

    const mockUsers = {
        admin: { username: 'Admin Xịn', role: 'ADMIN', balance: 0, status: 'APPROVED' },
        spec: { username: 'Khán Giả 1', role: 'SPECTATOR', balance: 100000, status: 'APPROVED' },
        owner: { username: 'Chủ Ngựa Thắng', role: 'OWNER', balance: 5000000, status: 'APPROVED' },
        jockey: { username: 'Nài Ngựa Phi', role: 'JOCKEY', balance: 0, status: 'PENDING' },
    };

    const handleLogin = (values) => {
        setLoading(true);
        setTimeout(() => {
            let userData = null;
            if (values.email === 'admin@gmail.com') userData = mockUsers.admin;
            else if (values.email === 'spec@gmail.com') userData = mockUsers.spec;
            else if (values.email === 'owner@gmail.com') userData = mockUsers.owner;
            else if (values.email === 'jockey@gmail.com') userData = mockUsers.jockey;

            if (userData) {
                login(userData);
                message.success(`Chào mừng ${userData.username} (${userData.role})!`);
                navigate('/');
            } else {
                message.error('Email hoặc mật khẩu không đúng!');
            }
            setLoading(false);
        }, 1500);
    };

    return (
        // Sử dụng Dark Mode của AntD và màu Primary vàng (#facc15)
        <ConfigProvider theme={{ algorithm: theme.darkAlgorithm, token: { colorPrimary: '#facc15' } }}>
            {/* Background đua ngựa cực chiến + Lớp phủ tối nhẹ (giảm mờ) */}
            <div
                className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
                style={{
                    backgroundImage: `url(${horseRacingBg})`, // Sử dụng ảnh local
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                {/* Lớp overlay TỐI NHẸ, KHÔNG MỜ NỀN */}
                {/* Bạn có thể điều chỉnh độ tối bằng cách thay đổi giá trị rgba(0,0,0,0.4) - 0.4 là 40% tối */}
                <div className="absolute inset-0 z-0" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}></div>

                {/* Form Glassmorphism trong suốt và SẮC NÉT hơn */}
                {/* Tui đã gỡ bỏ backdrop-blur-md để làm form rõ hơn */}
                <div className="z-10 w-full max-w-md border p-8 rounded-3xl shadow-lg"
                     style={{
                         backgroundColor: 'rgba(255, 255, 255, 0.05)', // Nền form trong suốt
                         borderColor: 'rgba(255, 255, 255, 0.15)', // Viền form mờ nhẹ
                         backdropFilter: 'blur(2px)' // Một chút mờ nhẹ cho cảm giác "kính", nhưng không quá nhiều
                     }}
                >
                    {/* Header với icon vàng nổi bật và animation nhẹ */}
                    <div className="text-center mb-8">
                        <TrophyOutlined className="text-6xl text-yellow-400 mb-3" style={{ textShadow: '0 0 10px rgba(250, 204, 21, 0.6)' }} />
                        <Title level={2} style={{ color: 'white', margin: 0, textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold' }}>
                            Horse Race
                        </Title>
                        <Text className="text-yellow-400 font-medium tracking-widest text-xs uppercase flex items-center justify-center gap-1 mt-2">
                            <FireOutlined /> Nền tảng cá cược đỉnh cao <FireOutlined />
                        </Text>
                    </div>

                    <Form name="login" layout="vertical" onFinish={handleLogin} size="large">
                        <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email!' }]}>
                            <Input
                                prefix={<MailOutlined className="text-gray-400" />}
                                placeholder="Nhập Email của bạn..."
                                className="bg-black/50 border-gray-600 text-white rounded-xl"
                            />
                        </Form.Item>

                        <Form.Item name="password" rules={[{ required: true, min: 6, message: 'Nhập mật khẩu (>6 ký tự)!' }]}>
                            <Input.Password
                                prefix={<LockOutlined className="text-gray-400" />}
                                placeholder="Nhập mật khẩu..."
                                className="bg-black/50 border-gray-600 text-white rounded-xl"
                            />
                        </Form.Item>

                        <Form.Item className="mt-6">
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                block
                                className="h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 border-none text-black font-bold text-lg rounded-xl shadow-[0_4px_15px_rgba(250,204,21,0.5)] hover:scale-105 transition-transform duration-300"
                            >
                                {loading ? 'ĐANG KẾT NỐI...' : 'THAM GIA NGAY'}
                            </Button>
                        </Form.Item>
                    </Form>

                    <div className="text-center mt-4">
                        <Text className="text-gray-300">Chưa có tài khoản?</Text>{' '}
                        <Link to="/register" className="text-yellow-400 font-bold hover:text-yellow-300 hover:underline">
                            Đăng Ký KYC
                        </Link>
                    </div>

                    <Divider style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)' }}>Tài khoản Test</Divider>

                    {/* Mock data được style lại sắc nét hơn */}
                    <div className="flex flex-wrap justify-center gap-2">
                        <span className="px-3 py-1 bg-green-500/20 text-green-300 border border-green-500/30 rounded-full text-xs font-mono">spec@gmail.com</span>
                        <span className="px-3 py-1 bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded-full text-xs font-mono">owner@gmail.com</span>
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full text-xs font-mono">admin@gmail.com</span>
                        <span className="px-3 py-1 bg-gray-500/20 text-gray-200 border border-gray-500/30 rounded-full text-xs font-mono">jockey@gmail.com</span>
                    </div>
                </div>
            </div>
        </ConfigProvider>
    );
};

export default LoginPage;