// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, DatePicker, Card, Typography, message, Divider, Tag, InputNumber } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const ProfilePage = () => {
    const { user, login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const token = localStorage.getItem('token') || user?.token;

    useEffect(() => {
        if (user) {
            const savedCV = JSON.parse(localStorage.getItem(`jockey_cv_${user.id}`) || '{}');
            form.setFieldsValue({
                username: user.username,
                email: user.email,
                phoneNumber: user.phoneNumber,
                dob: user.dob ? dayjs(user.dob) : null,
                weight: savedCV.weight || null,
                height: savedCV.height || null
            });
        }
    }, [user, form]);

    const handleUpdateProfile = async (values) => {
        setLoading(true);
        try {
            const updateData = {
                username: values.username,
                phoneNumber: values.phoneNumber,
                dob: values.dob ? values.dob.format('YYYY-MM-DD') : null,
            };

            const response = await axios.put(`http://localhost:8080/api/users/${user.id}`, updateData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Nếu là Jockey, lưu thêm CV vào máy để hiện lên Sàn môi giới
            if (user.role === 'JOCKEY') {
                localStorage.setItem(`jockey_cv_${user.id}`, JSON.stringify({
                    weight: values.weight,
                    height: values.height
                }));
            }

            const updatedUser = { ...user, ...response.data, token: token };
            login(updatedUser);
            message.success('Cập nhật hồ sơ thành công!');
        } catch (error) {
            message.error(error.response?.data?.error || 'Cập nhật thất bại!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <Title level={3} className="mb-6">Hồ Sơ Cá Nhân</Title>
            <Card className="shadow-md rounded-xl border-t-4 border-blue-500">
                <div className="flex items-center gap-4 mb-6 bg-blue-50 p-4 rounded-lg">
                    <SafetyCertificateOutlined className="text-3xl text-blue-500" />
                    <div>
                        <div className="text-lg font-bold">Trạng thái xác minh (KYC)</div>
                        {user?.status === 'APPROVED' ? (
                            <Text className="text-green-600 font-medium">Tài khoản đã được xác minh toàn diện. Bạn có thể sử dụng toàn bộ tính năng.</Text>
                        ) : (
                            <Text className="text-orange-500 font-medium">Đang chờ Admin phê duyệt hồ sơ của bạn.</Text>
                        )}
                    </div>
                </div>
                <Divider />

                <Form form={form} layout="vertical" onFinish={handleUpdateProfile} size="large">
                    <Form.Item label="Địa chỉ Email (Định danh đăng nhập)" name="email">
                        <Input prefix={<MailOutlined />} disabled className="bg-gray-100" />
                    </Form.Item>
                    <Form.Item label="Họ và Tên (Username)" name="username" rules={[{ required: true }]}>
                        <Input prefix={<UserOutlined />} placeholder="Nhập tên hiển thị của bạn" />
                    </Form.Item>
                    <Form.Item label="Số điện thoại liên hệ" name="phoneNumber" rules={[{ required: true }]}>
                        <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại của bạn" />
                    </Form.Item>
                    <Form.Item label="Ngày tháng năm sinh (Phải >= 21 tuổi)" name="dob" rules={[{ required: true }]}>
                        <DatePicker className="w-full" format="YYYY-MM-DD" />
                    </Form.Item>

                    {/* BẢN CV DÀNH RIÊNG CHO NÀI NGỰA */}
                    {user?.role === 'JOCKEY' && (
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mt-4 mb-4">
                            <Title level={5} className="text-purple-700 mb-4">Thông số Thể chất (Dành cho Nài ngựa)</Title>
                            <div className="flex gap-4">
                                <Form.Item label="Cân nặng (kg)" name="weight" className="w-full" rules={[{ required: true, message: 'Nhập cân nặng!' }]}>
                                    <InputNumber min={40} max={100} className="w-full" placeholder="VD: 55" />
                                </Form.Item>
                                <Form.Item label="Chiều cao (cm)" name="height" className="w-full" rules={[{ required: true, message: 'Nhập chiều cao!' }]}>
                                    <InputNumber min={140} max={200} className="w-full" placeholder="VD: 165" />
                                </Form.Item>
                            </div>
                            <Text className="text-gray-500 text-sm italic">* Thông số này sẽ được hiển thị trên Sàn giao dịch để Chủ ngựa cân nhắc ký hợp đồng.</Text>
                        </div>
                    )}

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} className="w-full mt-4 h-12 text-lg font-bold">LƯU THAY ĐỔI</Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default ProfilePage;