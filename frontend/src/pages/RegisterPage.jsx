import React, { useState } from 'react';
import { Form, Input, Button, DatePicker, Select, Upload, Card, Typography, message, Space, Row, Col } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, CalendarOutlined, IdcardOutlined, UploadOutlined, TrophyOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import api from '../config/api.js';

const { Title, Text } = Typography;

const RegisterPage = () => {
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState(null); // Lưu link ảnh CCCD giả
    const navigate = useNavigate();

    // Luồng KYC: Logic kiểm tra tuổi >= 21 (Cần import dayjs)
    const disabledDate = (current) => {
        // Không cho chọn những ngày trong tương lai
        return current && current > dayjs().endOf('day');
    };

    const handleRegister = async (values) => {
        setLoading(true);
        // Chuẩn bị dữ liệu gửi xuống Backend (Khớp 100% RegisterRequestDTO)
        const registerData = {
            username: values.username,
            password: values.password,
            email: values.email,
            role: values.role,
            dob: values.dob.format('YYYY-MM-DD'), // Format ngày cho BE đọc
            idCardUrl: values.idCardUrl // Link ảnh (Trong thực tế phải upload lên Cloudinary trước)
        };

        try {
            // Bắn xuống Backend Spring Boot ở cổng 8080 (Nhờ api.js)
            const response = await api.post('/auth/register', registerData);

            message.success(`Đăng ký thành công! ID tài khoản: ${response.data.id}`);
            message.info("Vui lòng đợi Admin duyệt KYC mới có thể đăng nhập.");
            navigate('/login'); // Chuyển về trang đăng nhập

        } catch (error) {
            // Hiển thị lỗi từ BE (Ví dụ: Trùng email hoặc Chưa đủ 21 tuổi)
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
        // Dùng Tailwind dàn trang giữa màn hình
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
            <Card bordered={false} className="shadow-2xl rounded-2xl p-6 w-full max-w-4xl bg-white">
                <Row gutter={32}>
                    {/* Cột trái: Giới thiệu dự án (Tăng độ "lung linh") */}
                    <Col span={10} className="bg-blue-600 rounded-xl p-8 flex flex-col items-center justify-center text-white text-center">
                        <TrophyOutlined className="text-7xl text-yellow-300 mb-6" />
                        <Title level={2} className="text-white">HORSE RACE</Title>
                        <Text className="text-white text-lg">Chào mừng bạn đến với hệ thống cá cược đua ngựa chuyên nghiệp.</Text>
                        <div className="mt-8">
                            <Text className="text-white opacity-80">Đã có tài khoản?</Text><br/>
                            <Link to="/login"><Button ghost className="mt-2">Đăng Nhập Ngay</Button></Link>
                        </div>
                    </Col>

                    {/* Cột phải: Form Đăng Ký */}
                    <Col span={14}>
                        <Title level={2} className="text-center mb-6">Đăng Ký Tài Khoản</Title>

                        <Form name="register" layout="vertical" onFinish={handleRegister} scrollToFirstError>
                            <Space size="large" className="w-full">
                                {/* Thông tin Tài Khoản */}
                                <div className="flex-1 space-y-4">
                                    <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}>
                                        <Input prefix={<UserOutlined />} placeholder="Ví dụ: Nguyên" />
                                    </Form.Item>

                                    <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}>
                                        <Input prefix={<MailOutlined />} placeholder="Ví dụ: khang@gmail.com" />
                                    </Form.Item>

                                    <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, min: 6, message: 'Mật khẩu ít nhất 6 ký tự!' }]}>
                                        <Input.Password prefix={<LockOutlined />} />
                                    </Form.Item>
                                </div>

                                {/* Thông tin KYC & Role */}
                                <div className="flex-1 space-y-4">
                                    {/* Tư duy quản lý 5 Role bằng AntD Select */}
                                    <Form.Item name="role" label="Bạn tham gia với tư cách" rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]} initialValue="SPECTATOR">
                                        <Select>
                                            <Select.Option value="SPECTATOR">Khán giả (Được cấp ví)</Select.Option>
                                            <Select.Option value="OWNER">Chủ ngựa (Được cấp ví)</Select.Option>
                                            <Select.Option value="JOCKEY">Nài ngựa (Được cấp ví)</Select.Option>
                                            <Select.Option value="REFEREE">Trọng tài</Select.Option>
                                        </Select>
                                    </Form.Item>

                                    {/* Luồng KYC: Chọn ngày sinh (Bắt buộc) */}
                                    <Form.Item name="dob" label="Ngày sinh (Phải >= 21 tuổi)" rules={[{ required: true, message: 'Vui lòng chọn ngày sinh!' }]}>
                                        <DatePicker className="w-full" disabledDate={disabledDate} prefix={<CalendarOutlined />} />
                                    </Form.Item>

                                    {/* Luồng KYC: Upload ảnh CCCD (Dùng input TEXT giả để làm FE trước) */}
                                    <Form.Item name="idCardUrl" label="Link ảnh CCCD/Passport" rules={[{ required: true, message: 'Vui lòng nhập link ảnh!' }]}>
                                        <Input prefix={<IdcardOutlined />} placeholder="Nhập URL ảnh giả" />
                                    </Form.Item>
                                </div>
                            </Space>

                            <Form.Item className="mt-8 text-center">
                                <Button type="primary" htmlType="submit" size="large" loading={loading} block>
                                    Đăng Ký KYC & Chờ Duyệt
                                </Button>
                            </Form.Item>
                        </Form>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default RegisterPage;