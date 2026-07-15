import React, { useState } from 'react';
import { Form, Input, Button, DatePicker, Select, Typography, message, Row, Col, ConfigProvider, theme, Upload } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, CalendarOutlined, InboxOutlined, TrophyOutlined, FireOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import api from '../config/api.js';
import horseBg from '../assets/horseracing2.png';

const { Title, Text } = Typography;

const RegisterPage = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const disabledDate = (current) => {
        return current && current > dayjs().endOf('day');
    };

    // Hàm chuẩn hóa File List cho Form Antd
    const normFile = (e) => {
        if (Array.isArray(e)) return e;
        return e?.fileList;
    };

    const handleRegister = async (values) => {
        setLoading(true);
        const formData = new FormData();

        formData.append('username', values.username);
        formData.append('password', values.password);
        formData.append('email', values.email);
        formData.append('role', values.role);
        formData.append('dob', values.dob.format('YYYY-MM-DD'));

        // Append multiple KYC files
        if (values.kycFiles && values.kycFiles.length > 0) {
            values.kycFiles.forEach(file => {
                formData.append('kycFiles', file.originFileObj);
            });
        }

        try {
            const response = await api.post('/auth/register', formData);
            message.success(`Đăng ký thành công! ID tài khoản: ${response.data.id}`);
            message.info("Vui lòng đợi Admin duyệt KYC mới có thể đăng nhập.");
            navigate('/login');
        } catch (error) {
            if (error.response && error.response.data) {
                message.error(error.response.data.error || 'Có lỗi xảy ra!');
            } else {
                message.error('Không thể kết nối đến Server!');
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
                    backgroundImage: `url(${horseBg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                <div className="absolute inset-0 bg-gray-950/75 z-0"></div>

                <div className="z-10 w-full max-w-5xl bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-[0_0_50px_rgba(250,204,21,0.15)] flex overflow-hidden transition-all duration-500 hover:shadow-[0_0_60px_rgba(250,204,21,0.3)]">
                    <Row className="w-full m-0">
                        <Col xs={0} md={10} className="bg-black/40 p-10 flex flex-col items-center justify-center text-center border-r border-white/10">
                            <div className="animate-pulse">
                                <TrophyOutlined className="text-8xl text-yellow-400 mb-6 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]" />
                            </div>
                            <Title level={2} style={{ color: 'white', margin: 0, textTransform: 'uppercase', letterSpacing: '3px' }}>
                                HORSE RACE
                            </Title>
                            <Text className="text-yellow-400 font-medium tracking-widest text-xs uppercase flex items-center justify-center gap-1 mt-2 mb-8">
                                <FireOutlined /> Đẳng Cấp Thượng Lưu <FireOutlined />
                            </Text>
                            <Text className="text-gray-300 text-base mb-8 px-4">
                                Hệ thống cá cược và quản lý giải đua ngựa chuyên nghiệp hàng đầu. Vui lòng hoàn thành điền đầy đủ thông tin cá nhân để tham gia.<br/><br/>
                            </Text>
                            <div className="w-full px-6">
                                <Text className="text-gray-400">Đã có tài khoản?</Text><br/>
                                <Link to="/login">
                                    <Button type="button" className="w-full mt-6 bg-transparent border-2 border-yellow-500 text-yellow-500 font-bold text-base h-12 rounded-xl hover:bg-yellow-500 hover:text-black hover:shadow-[0_0_20px_rgba(234,179,8,0.6)] hover:-translate-y-1 transition-all duration-300" onClick={() => navigate('/login')}>
                                        ĐĂNG NHẬP NGAY
                                    </Button>
                                </Link>
                            </div>
                        </Col>

                        <Col xs={24} md={14} className="p-10">
                            <Title level={3} className="text-center mb-8 text-white uppercase tracking-wider">Tạo Tài Khoản Mới</Title>

                            <Form name="register" layout="vertical" onFinish={handleRegister} scrollToFirstError size="large">
                                <Row gutter={24}>
                                    <Col span={12}>
                                        <Form.Item name="username" label={<span className="text-gray-300">Tên đăng nhập</span>} rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}>
                                            <Input prefix={<UserOutlined className="text-gray-400" />} placeholder="Ví dụ: Khang" className="bg-black/50 border-gray-600 text-white hover:border-yellow-400 focus:border-yellow-400 rounded-xl" />
                                        </Form.Item>
                                        <Form.Item name="email" label={<span className="text-gray-300">Email</span>} rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}>
                                            <Input prefix={<MailOutlined className="text-gray-400" />} placeholder="khang@gmail.com" className="bg-black/50 border-gray-600 text-white hover:border-yellow-400 focus:border-yellow-400 rounded-xl" />
                                        </Form.Item>
                                        <Form.Item name="password" label={<span className="text-gray-300">Mật khẩu</span>} rules={[{ required: true, min: 6, message: 'Mật khẩu ít nhất 6 ký tự!' }]}>
                                            <Input.Password prefix={<LockOutlined className="text-gray-400" />} placeholder="••••••••" className="bg-black/50 border-gray-600 text-white hover:border-yellow-400 focus:border-yellow-400 rounded-xl" />
                                        </Form.Item>
                                    </Col>

                                    <Col span={12}>
                                        <Form.Item name="role" label={<span className="text-gray-300">Tham gia với tư cách</span>} rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]} initialValue="SPECTATOR">
                                            <Select popupClassName="bg-gray-800" className="[&>div]:bg-black/50 [&>div]:border-gray-600 [&>div]:rounded-xl [&>div]:text-white">
                                                <Select.Option value="SPECTATOR">Khán giả (Cá cược)</Select.Option>
                                                <Select.Option value="OWNER">Chủ ngựa</Select.Option>
                                                <Select.Option value="JOCKEY">Nài ngựa</Select.Option>
                                                <Select.Option value="REFEREE">Trọng tài</Select.Option>
                                            </Select>
                                        </Form.Item>
                                        <Form.Item name="dob" label={<span className="text-gray-300">Ngày sinh (&gt;= 21 tuổi)</span>} rules={[{ required: true, message: 'Vui lòng chọn ngày sinh!' }]}>
                                            <DatePicker className="w-full bg-black/50 border-gray-600 text-white hover:border-yellow-400 focus:border-yellow-400 rounded-xl" disabledDate={disabledDate} prefix={<CalendarOutlined className="text-gray-400" />} />
                                        </Form.Item>

                                        <Form.Item name="kycFiles" label={<span className="text-gray-300">Tải lên CCCD / Hộ Chiếu</span>} valuePropName="fileList" getValueFromEvent={normFile} rules={[{ required: true, message: 'Bắt buộc tải lên tài liệu xác minh KYC!' }]}>
                                            <Upload.Dragger multiple beforeUpload={() => false} className="bg-black/50 border-gray-600 text-white rounded-xl">
                                                <p className="ant-upload-drag-icon"><InboxOutlined className="text-yellow-400" /></p>
                                                <p className="ant-upload-text text-gray-300 text-sm">Kéo thả hoặc Click (Nhiều File)</p>
                                            </Upload.Dragger>
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Form.Item className="mt-6 mb-0">
                                    <Button type="primary" htmlType="submit" loading={loading} block className="h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 border-none text-black font-bold text-lg rounded-xl shadow-[0_4px_15px_rgba(250,204,21,0.5)] hover:scale-105 transition-transform duration-300 mt-2">
                                        {loading ? 'ĐANG XỬ LÝ...' : 'GỬI YÊU CẦU KYC'}
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Col>
                    </Row>
                </div>
            </div>
        </ConfigProvider>
    );
};

export default RegisterPage;