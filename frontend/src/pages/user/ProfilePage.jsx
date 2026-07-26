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
    const [isExcluding, setIsExcluding] = useState(false);

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

        if (user.role === 'JOCKEY') {
            formData.append('weight', values.weight);
            formData.append('height', values.height);
        }

        // Tích hợp logic xử lý File cho cả 3 Role: JOCKEY, OWNER, REFEREE
        if (user.role === 'JOCKEY' || user.role === 'OWNER' || user.role === 'REFEREE') {
            if (values.certFiles && values.certFiles.length > 0) {
                values.certFiles.forEach(f => formData.append('certFiles', f.originFileObj));
            }
            if (values.healthFiles && values.healthFiles.length > 0) {
                values.healthFiles.forEach(f => formData.append('healthFiles', f.originFileObj));
            }
            if (values.kycFiles && values.kycFiles.length > 0) {
                values.kycFiles.forEach(f => formData.append('kycFiles', f.originFileObj));
            }
        }

        try {
            const response = await axios.put(`https://horse-racing-system-production-492c.up.railway.app/api/users/${user.id}`, formData, {
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

    const handleSelfExclusion = async () => {
        if (!window.confirm("CẢNH BÁO: Tự nguyện cấm (Self-Exclusion) là một phần của chương trình Cá Cược Có Trách Nhiệm. Bạn sẽ BỊ KHÓA tài khoản ngay lập tức và không thể truy cập lại. Bạn có chắc chắn muốn TỰ CẤM mình không?")) return;
        
        setIsExcluding(true);
        try {
            await axios.put(`https://horse-racing-system-production-492c.up.railway.app/api/users/${user.id}/self-exclusion`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            message.success('Tài khoản của bạn đã được khóa theo yêu cầu tự nguyện cấm.');
            setTimeout(() => {
                login(null);
                window.location.href = '/login';
            }, 2000);
        } catch (error) {
            message.error('Lỗi hệ thống!');
            setIsExcluding(false);
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
                    <Form.Item label="Họ và Tên" name="username" rules={[{ required: true }]}>
                        <Input prefix={<UserOutlined />} placeholder="Nhập tên hiển thị của bạn" />
                    </Form.Item>
                    <Form.Item label="Số điện thoại liên hệ" name="phoneNumber" rules={[{ required: true }]}>
                        <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại của bạn" />
                    </Form.Item>
                    <Form.Item label="Ngày tháng năm sinh" name="dob" rules={[{ required: true }]}>
                        <DatePicker className="w-full" format="YYYY-MM-DD" />
                    </Form.Item>

                    {/* KHU VỰC DÀNH RIÊNG CHO NÀI NGỰA */}
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

                    {/* KHU VỰC DÀNH RIÊNG CHO TRỌNG TÀI */}
                    {user?.role === 'REFEREE' && (
                        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 mt-4 mb-4">
                            <Title level={5} className="text-indigo-700 mb-4">Tài Liệu Bắt Buộc (Dành cho Trọng Tài)</Title>
                            <div className="flex gap-4">
                                <Form.Item label="CCCD / Hộ Chiếu" name="kycFiles" valuePropName="fileList" getValueFromEvent={normFile} className="w-full" rules={[{ required: true }]}>
                                    <Upload multiple beforeUpload={() => false}><Button icon={<UploadOutlined />}>Tải lên CCCD</Button></Upload>
                                </Form.Item>
                                <Form.Item label="Chứng chỉ chuyên môn" name="certFiles" valuePropName="fileList" getValueFromEvent={normFile} className="w-full" rules={[{ required: true }]}>
                                    <Upload multiple beforeUpload={() => false}><Button icon={<UploadOutlined />}>Tải lên Chứng Chỉ</Button></Upload>
                                </Form.Item>
                            </div>
                        </div>
                    )}

                    {/* KHU VỰC DÀNH RIÊNG CHO CHỦ NGỰA */}
                    {user?.role === 'OWNER' && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4 mb-4">
                            <Title level={5} className="text-blue-700 mb-4">Hồ Sơ Yêu Cầu Bổ Sung (Dành cho Chủ Ngựa)</Title>
                            <div className="flex gap-4">
                                <Form.Item label="Ảnh Thực Tế & CN Nguồn Gốc Chiến Mã" name="certFiles" valuePropName="fileList" getValueFromEvent={normFile} className="w-full">
                                    <Upload multiple beforeUpload={() => false}><Button icon={<UploadOutlined />}>Tải lên Ảnh & CN</Button></Upload>
                                </Form.Item>
                                <Form.Item label="Sổ Tiêm Phòng/Khám Bệnh" name="healthFiles" valuePropName="fileList" getValueFromEvent={normFile} className="w-full">
                                    <Upload multiple beforeUpload={() => false}><Button icon={<UploadOutlined />}>Tải lên Sổ Khám</Button></Upload>
                                </Form.Item>
                            </div>
                        </div>
                    )}

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} className="w-full mt-4 h-12 text-lg font-bold">LƯU THAY ĐỔI</Button>
                    </Form.Item>
                </Form>
                
                {user?.role === 'SPECTATOR' && (
                    <div className="mt-8 pt-6 border-t border-red-200">
                        <Title level={4} className="text-red-600 mb-2">Chương Trình Cá Cược Có Trách Nhiệm (Responsible Gambling)</Title>
                        <Text className="block mb-4 text-gray-600">Nếu bạn cảm thấy mất kiểm soát và muốn ngừng chơi, hãy sử dụng tính năng tự cấm. Tính năng này sẽ KHÓA TÀI KHOẢN của bạn và bạn sẽ không thể tham gia hệ thống cho đến khi liên hệ Admin.</Text>
                        <Button danger type="primary" loading={isExcluding} onClick={handleSelfExclusion} className="h-10 px-8 font-bold">TỰ NGUYỆN CẤM (SELF-EXCLUSION)</Button>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default ProfilePage;