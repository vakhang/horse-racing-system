import React, { useState, useEffect } from 'react';
import { Form, Input, Button, DatePicker, Card, Typography, message, Divider, Tag } from 'antd';
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
            // Nạp dữ liệu hiện tại vào form
            form.setFieldsValue({
                username: user.username,
                email: user.email,
                phoneNumber: user.phoneNumber, // Dữ liệu SĐT từ Backend
                dob: user.dob ? dayjs(user.dob) : null,
            });
        }
    }, [user, form]);

    const handleUpdateProfile = async (values) => {
        setLoading(true);
        try {
            const updateData = {
                username: values.username,
                phoneNumber: values.phoneNumber, // Gửi SĐT xuống Backend
                dob: values.dob ? values.dob.format('YYYY-MM-DD') : null,
            };

            const response = await axios.put(`http://localhost:8080/api/users/${user.id}`, updateData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Cập nhật lại Context sau khi sửa thành công
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
                            <Text className="text-green-600 font-medium">Tài khoản đã được xác minh toàn diện. Bạn có thể nạp/rút và đặt cược.</Text>
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

                    <Form.Item
                        label="Họ và Tên (Username)"
                        name="username"
                        rules={[{ required: true, message: 'Vui lòng không để trống tên!' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Nhập tên hiển thị của bạn" />
                    </Form.Item>

                    {/* TRƯỜNG SỐ ĐIỆN THOẠI MỚI */}
                    <Form.Item
                        label="Số điện thoại liên hệ"
                        name="phoneNumber"
                        rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                    >
                        <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại của bạn" />
                    </Form.Item>

                    <Form.Item
                        label="Ngày tháng năm sinh (Phải >= 21 tuổi)"
                        name="dob"
                        rules={[{ required: true, message: 'Vui lòng chọn ngày sinh!' }]}
                    >
                        <DatePicker className="w-full" format="YYYY-MM-DD" placeholder="Chọn ngày sinh" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} className="w-full mt-4 h-12 text-lg font-bold">
                            LƯU THAY ĐỔI
                        </Button>
                    </Form.Item>
                </Form>

                {/* NGÀY TẠO TÀI KHOẢN */}
                {user?.createdAt && (
                    <div className="mt-8 pt-4 border-t border-dashed text-center text-gray-400 text-sm">
                        <em>Tài khoản được tạo từ ngày: <span className="font-semibold text-gray-500">{dayjs(user.createdAt).format('DD/MM/YYYY lúc HH:mm')}</span></em>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default ProfilePage;