// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, DatePicker, Card, Typography, message, Divider, Tag, InputNumber, Upload } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, SafetyCertificateOutlined, UploadOutlined } from '@ant-design/icons';
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
            form.setFieldsValue({
                username: user.username,
                email: user.email,
                phoneNumber: user.phoneNumber,
                dob: user.dob ? dayjs(user.dob) : null,
                weight: user.weight || null,
                height: user.height || null
            });
        }
    }, [user, form]);

    const normFile = (e) => {
        if (Array.isArray(e)) return e;
        return e?.fileList;
    };

    const handleUpdateProfile = async (values) => {
        setLoading(true);
        const formData = new FormData();
        formData.append('username', values.username);
        formData.append('phoneNumber', values.phoneNumber);
        if (values.dob) formData.append('dob', values.dob.format('YYYY-MM-DD'));

        // Append dữ liệu riêng của Nài Ngựa
        if (user.role === 'JOCKEY') {
            formData.append('weight', values.weight);
            formData.append('height', values.height);

            if (values.certFiles && values.certFiles.length > 0) {
                values.certFiles.forEach(f => formData.append('certFiles', f.originFileObj));
            }
            if (values.healthFiles && values.healthFiles.length > 0) {
                values.healthFiles.forEach(f => formData.append('healthFiles', f.originFileObj));
            }
        }

        try {
            // Không set Header Content-Type vì FormData sẽ tự sinh Boundary
            const response = await axios.put(`http://localhost:8080/api/users/${user.id}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

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
                    <Form.Item label="Ngày tháng năm sinh" name="dob" rules={[{ required: true }]}>
                        <DatePicker className="w-full" format="YYYY-MM-DD" />
                    </Form.Item>

                    {/* KHU VỰC DÀNH RIÊNG CHO NÀI NGỰA (MULTIPART & THÔNG SỐ) */}
                    {user?.role === 'JOCKEY' && (
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mt-4 mb-4">
                            <Title level={5} className="text-purple-700 mb-4">Thông số Thể chất & Bằng Cấp (Dành cho Nài ngựa)</Title>
                            <div className="flex gap-4">
                                <Form.Item label="Cân nặng (kg)" name="weight" className="w-full" rules={[{ required: true, message: 'Nhập cân nặng!' }]}>
                                    <InputNumber min={40} max={100} className="w-full" placeholder="VD: 55" />
                                </Form.Item>
                                <Form.Item label="Chiều cao (cm)" name="height" className="w-full" rules={[{ required: true, message: 'Nhập chiều cao!' }]}>
                                    <InputNumber min={140} max={200} className="w-full" placeholder="VD: 165" />
                                </Form.Item>
                            </div>
                            <div className="flex gap-4">
                                <Form.Item label="Chứng chỉ hành nghề" name="certFiles" valuePropName="fileList" getValueFromEvent={normFile} className="w-full" rules={[{ required: true }]}>
                                    <Upload multiple beforeUpload={() => false}><Button icon={<UploadOutlined />}>Tải lên Bằng Cấp</Button></Upload>
                                </Form.Item>
                                <Form.Item label="Giấy Khám Sức Khỏe" name="healthFiles" valuePropName="fileList" getValueFromEvent={normFile} className="w-full" rules={[{ required: true }]}>
                                    <Upload multiple beforeUpload={() => false}><Button icon={<UploadOutlined />}>Tải lên Sổ Khám Bệnh</Button></Upload>
                                </Form.Item>
                            </div>
                            <Text className="text-gray-500 text-sm italic">* Hồ sơ chứng chỉ sẽ được hiển thị công khai trên Sàn Giao Dịch.</Text>
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