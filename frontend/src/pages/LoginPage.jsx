import React, { useState } from 'react';
import { Form, Input, Button, Typography, message, Divider, ConfigProvider, theme } from 'antd';
import { MailOutlined, LockOutlined, TrophyOutlined, FireOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';

// Import các công cụ cần thiết
import api from '../config/api';
import { setToken } from '../utils/auth';
import { useAuth } from '../context/AuthContext'; // ĐÃ THÊM CONTEXT VÀO ĐÂY

import horseRacingBg from '../assets/horseracing.png';

const { Title, Text } = Typography;

const LoginPage = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth(); // KÉO HÀM LOGIN RA ĐỂ ĐÁNH THỨC HỆ THỐNG

    // HÀM CALL API THẬT XUỐNG SPRING BOOT
    const handleLogin = async (values) => {
        setLoading(true);
        try {
            // Chọt thẳng xuống API Spring Boot
            const response = await api.post('/auth/login', {
                email: values.email,
                password: values.password
            });

            // Lấy thông tin User trả về
            const userData = response.data;

            // Lưu Token
            setToken(userData.id.toString());
            localStorage.setItem('currentUser', JSON.stringify(userData));

            // BÁO CÁO CHO HỆ THỐNG BIẾT LÀ ĐÃ ĐĂNG NHẬP (Chốt chặn quan trọng)
            login(userData);

            // Bắn pháo hoa chào mừng
            message.success(`Chào mừng ${userData.username} trở lại trường đua!`);

            // Đá thẳng về trang Home
            navigate('/');

        } catch (error) {
            if (error.response && error.response.data) {
                message.error(error.response.data);
            } else {
                message.error('Máy chủ đang ngủ gật. Vui lòng thử lại sau!');
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
                        <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}>
                            <Input
                                prefix={<MailOutlined className="text-gray-400" />}
                                placeholder="Email đã đăng ký..."
                                className="bg-black/60 border-gray-600 text-white hover:border-yellow-400 focus:border-yellow-400 rounded-xl px-4 py-3"
                            />
                        </Form.Item>

                        <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
                            <Input.Password
                                prefix={<LockOutlined className="text-gray-400" />}
                                placeholder="Mật khẩu của bạn..."
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
            </div>
        </ConfigProvider>
    );
};

export default LoginPage;