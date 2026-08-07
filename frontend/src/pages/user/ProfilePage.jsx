import React, { useState, useEffect } from 'react';
import { Form, Input, Button, DatePicker, Card, Typography, message, Divider, Tag, InputNumber, Upload, Tabs, Table, Image } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, SafetyCertificateOutlined, UploadOutlined, HistoryOutlined, DollarOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api.js';

import dayjs from 'dayjs';

const { Title, Text } = Typography;

// [Chức năng rõ ràng]: Trang Hồ sơ Cá nhân & Lịch sử Hoạt động (Profile, Bets & Transactions)
// [Tác dụng]: Hiển thị thông tin cá nhân, hỗ trợ cập nhật KYC. Đối với Khán giả, hiển thị Tab Lịch sử cược và Lịch sử biến động ví.
const ProfilePage = () => {
    const { user, login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [isExcluding, setIsExcluding] = useState(false);

    // States cho Lịch sử Cược và Lịch sử Giao dịch
    const [myBets, setMyBets] = useState([]);
    const [loadingBets, setLoadingBets] = useState(false);
    const [myTransactions, setMyTransactions] = useState([]);
    const [loadingTransactions, setLoadingTransactions] = useState(false);

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
            if (user.role === 'SPECTATOR') {
                fetchMyBets();
                fetchMyTransactions();
            }
        }
    }, [user, form]);

    const fetchMyBets = async () => {
        if (!user?.id) return;
        setLoadingBets(true);
        try {
            const res = await api.get(`/users/my-bets?userId=${user.id}`);
            setMyBets(res.data || []);
        } catch (error) {
            console.error('Lỗi tải lịch sử cược:', error);
        } finally {
            setLoadingBets(false);
        }
    };

    const fetchMyTransactions = async () => {
        if (!user?.id) return;
        setLoadingTransactions(true);
        try {
            const res = await api.get(`/users/my-transactions?userId=${user.id}`);
            setMyTransactions(res.data || []);
        } catch (error) {
            console.error('Lỗi tải lịch sử giao dịch:', error);
        } finally {
            setLoadingTransactions(false);
        }
    };

    const normFile = (e) => {
        if (Array.isArray(e)) return e;
        return e?.fileList;
    };

    const handleUpdateProfile = async (values) => {
        setLoading(true);
        try {
            const formData = new FormData();
            if (values.username) formData.append('username', values.username);
            if (values.phoneNumber) formData.append('phoneNumber', values.phoneNumber);
            if (values.dob) formData.append('dob', values.dob.format('YYYY-MM-DD'));

            if (values.weight !== undefined && values.weight !== null && values.weight !== '') {
                formData.append('weight', String(values.weight));
            }
            if (values.height !== undefined && values.height !== null && values.height !== '') {
                formData.append('height', String(values.height));
            }

            const appendFiles = (fieldName, fileList) => {
                if (!fileList || !Array.isArray(fileList)) return;
                fileList.forEach(f => {
                    const fileObj = f.originFileObj || (f instanceof File ? f : null);
                    if (fileObj) {
                        formData.append(fieldName, fileObj);
                    }
                });
            };

            appendFiles('certFiles', values.certFiles);
            appendFiles('healthFiles', values.healthFiles);
            appendFiles('kycFiles', values.kycFiles);

            if (values.avatarFile && values.avatarFile.length > 0) {
                const fileObj = values.avatarFile[0].originFileObj || (values.avatarFile[0] instanceof File ? values.avatarFile[0] : null);
                if (fileObj) {
                    formData.append('avatarFile', fileObj);
                }
            }

            const response = await api.put(`/users/${user.id}`, formData);

            const updatedUser = { ...user, ...response.data, token: token };
            login(updatedUser);
            message.success('Cập nhật hồ sơ thành công! ✨');
        } catch (error) {
            console.error('Lỗi cập nhật profile:', error);
            message.error(error.response?.data?.error || error.response?.data?.message || 'Cập nhật thất bại!');
        } finally {
            setLoading(false);
        }
    };

    const handleSelfExclusion = async () => {
        if (!window.confirm("CẢNH BÁO: Tự nguyện cấm (Self-Exclusion) là một phần của chương trình Cá Cược Có Trách Nhiệm. Bạn sẽ BỊ KHÓA tài khoản ngay lập tức và không thể truy cập lại. Bạn có chắc chắn muốn TỰ CẤM mình không?")) return;
        
        setIsExcluding(true);
        try {
            await api.put(`/users/${user.id}/self-exclusion`, {}, {
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

    // Định nghĩa cột cho Bảng Lịch Sử Cược
    const betColumns = [
        { title: 'Mã Cược', dataIndex: 'id', key: 'id', render: id => <Text type="secondary">#{id}</Text> },
        { title: 'Chặng Đua', dataIndex: 'raceName', key: 'raceName', render: text => <Text strong className="text-blue-700">{text}</Text> },
        { title: 'Chiến Mã Chọn', dataIndex: 'horseName', key: 'horseName', render: text => <Text strong>{text}</Text> },
        { title: 'Số Tiền Cược', dataIndex: 'amount', key: 'amount', render: val => <Text className="font-bold text-red-600">{Number(val || 0).toLocaleString()} VNĐ</Text> },
        { title: 'Tỷ Lệ Chốt', dataIndex: 'odds', key: 'odds', render: val => <Tag color="blue">x{val || 1.0}</Tag> },
        {
            title: 'Trạng Thái & Kết Quả',
            dataIndex: 'status',
            key: 'status',
            render: (status, record) => {
                if (status === 'WIN') return <Tag color="green" className="font-bold">THẮNG (+{Number(record.payout || 0).toLocaleString()} đ)</Tag>;
                if (status === 'LOST') return <Tag color="red">THUA</Tag>;
                if (status === 'REFUNDED') return <Tag color="orange">HOÀN TIỀN</Tag>;
                return <Tag color="blue">ĐANG CHỜ KẾT QUẢ</Tag>;
            }
        },
        { title: 'Thời Gian Đặt', dataIndex: 'createdAt', key: 'createdAt', render: d => d ? dayjs(d).format('DD/MM/YYYY HH:mm') : '' }
    ];

    // Định nghĩa cột cho Bảng Biến Động Số Dư
    const transactionColumns = [
        { title: 'Mã GD', dataIndex: 'transactionCode', key: 'transactionCode', render: code => <Text copyable strong className="text-blue-600">{code || 'N/A'}</Text> },
        {
            title: 'Loại Giao Dịch',
            dataIndex: 'type',
            key: 'type',
            render: type => {
                const map = {
                    DEPOSIT: <Tag color="green">NẠP TIỀN</Tag>,
                    WITHDRAW: <Tag color="volcano">RÚT TIỀN</Tag>,
                    BET_PLACED: <Tag color="blue">ĐẶT CƯỢC</Tag>,
                    BET_WON: <Tag color="gold">THẮNG CƯỢC</Tag>,
                    REFUND: <Tag color="purple">HOÀN TIỀN</Tag>,
                    BONUS: <Tag color="green">KHUYẾN MÃI</Tag>
                };
                return map[type] || <Tag>{type}</Tag>;
            }
        },
        {
            title: 'Chiều Tiền',
            dataIndex: 'direction',
            key: 'direction',
            render: d => d === 'IN' ? <Tag color="green">+ TIỀN VÀO</Tag> : <Tag color="red">- TIỀN RA</Tag>
        },
        { title: 'Số Tiền', dataIndex: 'amount', key: 'amount', render: val => <Text strong className="text-base">{Number(val || 0).toLocaleString()} VNĐ</Text> },
        {
            title: 'Trạng Thái',
            dataIndex: 'status',
            key: 'status',
            render: status => {
                if (status === 'COMPLETED') return <Tag color="green">HOÀN TẤT</Tag>;
                if (status === 'PENDING') return <Tag color="orange">ĐANG XỬ LÝ</Tag>;
                if (status === 'REJECTED') return <Tag color="red">TỪ CHỐI</Tag>;
                return <Tag>{status}</Tag>;
            }
        },
        { title: 'Thời Gian', dataIndex: 'createdAt', key: 'createdAt', render: d => d ? dayjs(d).format('DD/MM/YYYY HH:mm') : '' }
    ];

    const ProfileFormView = () => (
        <Card className="shadow-2xl rounded-2xl border border-[#007355] bg-[#141f1c] text-white">
            <div className="flex items-center gap-4 mb-6 bg-[#007355]/20 p-4 rounded-xl border border-[#007355]/40">
                {user?.avatarUrl ? (
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#fcc200] flex-shrink-0">
                        <Image src={user.avatarUrl} alt="Avatar" width={64} height={64} className="object-cover" style={{ display: 'block' }} />
                    </div>
                ) : (
                    <SafetyCertificateOutlined className="text-4xl text-[#fcc200]" />
                )}
                <div>
                    <div className="text-lg font-bold text-[#fcc200]">Trạng thái xác minh (KYC)</div>
                    {user?.status === 'APPROVED' ? (
                        <Text className="text-green-400 font-medium">Tài khoản đã được xác minh toàn diện. Bạn có thể sử dụng toàn bộ tính năng.</Text>
                    ) : (
                        <Text className="text-yellow-400 font-medium">Đang chờ Admin phê duyệt hồ sơ của bạn.</Text>
                    )}
                </div>
            </div>
            <Divider className="border-gray-700" />

            <Form form={form} layout="vertical" onFinish={handleUpdateProfile} size="large">
                <Form.Item label={<span className="text-gray-300 font-semibold">Địa chỉ Email (Định danh đăng nhập)</span>} name="email">
                    <Input prefix={<MailOutlined className="text-gray-400" />} disabled className="!bg-[#0f1715] !text-gray-400 !border-gray-700" />
                </Form.Item>
                <Form.Item label={<span className="text-gray-200 font-semibold">Họ và Tên</span>} name="username" rules={[{ required: true }]}>
                    <Input prefix={<UserOutlined className="text-gray-400" />} placeholder="Nhập tên hiển thị của bạn" className="!bg-[#1c2926] !text-white !border-gray-700" />
                </Form.Item>
                <Form.Item label={<span className="text-gray-200 font-semibold">Số điện thoại liên hệ</span>} name="phoneNumber" rules={[{ required: true }]}>
                    <Input prefix={<PhoneOutlined className="text-gray-400" />} placeholder="Nhập số điện thoại của bạn" className="!bg-[#1c2926] !text-white !border-gray-700" />
                </Form.Item>
                <Form.Item label={<span className="text-gray-200 font-semibold">Ngày tháng năm sinh</span>} name="dob" rules={[{ required: true }]}>
                    <DatePicker className="w-full !bg-[#1c2926] !text-white !border-gray-700" format="YYYY-MM-DD" />
                </Form.Item>

                <Form.Item label={<span className="text-gray-200 font-semibold">Ảnh Đại Diện / Avatar</span>} name="avatarFile" valuePropName="fileList" getValueFromEvent={normFile} className="w-full">
                    <Upload maxCount={1} beforeUpload={() => false} listType="picture">
                        <Button icon={<UploadOutlined />} className="!bg-[#007355] !text-white !border-none hover:!bg-[#005e45]">Tải lên Avatar Mới</Button>
                    </Upload>
                </Form.Item>

                {/* KHU VỰC DÀNH RIÊNG CHO NÀI NGỰA */}
                {user?.role === 'JOCKEY' && (
                    <div className="bg-[#1c2725] p-5 rounded-xl border border-[#007355] mt-4 mb-4 shadow-md">
                        <Title level={5} className="!text-[#fcc200] mb-4 flex items-center gap-2">
                            🏆 Thông Số Thể Chất & Bằng Cấp (Dành cho Nài Ngựa)
                        </Title>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Form.Item label={<span className="text-gray-200 font-semibold">* Cân nặng (kg)</span>} name="weight" className="w-full" rules={[{ required: true, message: 'Nhập cân nặng!' }]}>
                                <InputNumber min={40} max={100} className="w-full !bg-[#131c1a] !text-white !border-gray-700" placeholder="VD: 55" />
                            </Form.Item>
                            <Form.Item label={<span className="text-gray-200 font-semibold">* Chiều cao (cm)</span>} name="height" className="w-full" rules={[{ required: true, message: 'Nhập chiều cao!' }]}>
                                <InputNumber min={140} max={200} className="w-full !bg-[#131c1a] !text-white !border-gray-700" placeholder="VD: 165" />
                            </Form.Item>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            <Form.Item label={<span className="text-gray-200 font-semibold">Chứng chỉ hành nghề (Nếu có cập nhật)</span>} name="certFiles" valuePropName="fileList" getValueFromEvent={normFile} className="w-full">
                                <Upload multiple beforeUpload={() => false}>
                                    <Button icon={<UploadOutlined />} className="!bg-[#007355] !text-white !border-none hover:!bg-[#005e45]">Tải lên Bằng Cấp Mới</Button>
                                </Upload>
                            </Form.Item>
                            <Form.Item label={<span className="text-gray-200 font-semibold">Giấy Khám Sức Khỏe (Nếu có cập nhật)</span>} name="healthFiles" valuePropName="fileList" getValueFromEvent={normFile} className="w-full">
                                <Upload multiple beforeUpload={() => false}>
                                    <Button icon={<UploadOutlined />} className="!bg-[#007355] !text-white !border-none hover:!bg-[#005e45]">Tải lên Sổ Khám Mới</Button>
                                </Upload>
                            </Form.Item>
                        </div>
                        <Text className="text-gray-400 text-xs italic block mt-1">* Hồ sơ chứng chỉ sẽ được hiển thị công khai trên Thị Trường Nài Ngựa.</Text>
                    </div>
                )}

                {/* KHU VỰC DÀNH RIÊNG CHO TRỌNG TÀI */}
                {user?.role === 'REFEREE' && (
                    <div className="bg-[#1c2725] p-5 rounded-xl border border-indigo-500/50 mt-4 mb-4 shadow-md">
                        <Title level={5} className="!text-indigo-400 mb-4">⚖️ Tài Liệu Cập Nhật (Dành cho Trọng Tài)</Title>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Form.Item label={<span className="text-gray-200 font-semibold">CCCD / Hộ Chiếu (Nếu làm lại)</span>} name="kycFiles" valuePropName="fileList" getValueFromEvent={normFile} className="w-full">
                                <Upload multiple beforeUpload={() => false}><Button icon={<UploadOutlined />} className="!bg-indigo-600 !text-white !border-none">Tải lên CCCD mới</Button></Upload>
                            </Form.Item>
                            <Form.Item label={<span className="text-gray-200 font-semibold">Chứng chỉ chuyên môn (Nếu có mới)</span>} name="certFiles" valuePropName="fileList" getValueFromEvent={normFile} className="w-full">
                                <Upload multiple beforeUpload={() => false}><Button icon={<UploadOutlined />} className="!bg-indigo-600 !text-white !border-none">Tải lên Chứng Chỉ mới</Button></Upload>
                            </Form.Item>
                        </div>
                    </div>
                )}

                {/* KHU VỰC DÀNH RIÊNG CHO CHỦ NGỰA */}
                {user?.role === 'OWNER' && (
                    <div className="bg-[#1c2725] p-5 rounded-xl border border-blue-500/50 mt-4 mb-4 shadow-md">
                        <Title level={5} className="!text-blue-400 mb-4">🐎 Hồ Sơ Yêu Cầu Bổ Sung (Dành cho Chủ Ngựa)</Title>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Form.Item label={<span className="text-gray-200 font-semibold">Ảnh Thực Tế & CN Nguồn Gốc Chiến Mã</span>} name="certFiles" valuePropName="fileList" getValueFromEvent={normFile} className="w-full">
                                <Upload multiple beforeUpload={() => false}><Button icon={<UploadOutlined />} className="!bg-blue-600 !text-white !border-none">Tải lên Ảnh & CN</Button></Upload>
                            </Form.Item>
                            <Form.Item label={<span className="text-gray-200 font-semibold">Sổ Tiêm Phòng/Khám Bệnh</span>} name="healthFiles" valuePropName="fileList" getValueFromEvent={normFile} className="w-full">
                                <Upload multiple beforeUpload={() => false}><Button icon={<UploadOutlined />} className="!bg-blue-600 !text-white !border-none">Tải lên Sổ Khám</Button></Upload>
                            </Form.Item>
                        </div>
                    </div>
                )}

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} className="w-full mt-4 h-12 text-lg font-bold !bg-[#fcc200] !text-black !border-none hover:!bg-[#e5b000]">LƯU THAY ĐỔI</Button>
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
    );

    return (
        <div className="max-w-5xl mx-auto p-4">
            <Title level={3} className="mb-6">Hồ Sơ Cá Nhân & Quản Lý Hoạt Động</Title>

            {user?.role === 'SPECTATOR' ? (
                <Tabs size="large" type="card" items={[
                    {
                        key: 'profile',
                        label: <span className="font-bold"><UserOutlined /> Thông Tin Cá Nhân</span>,
                        children: <ProfileFormView />
                    },
                    {
                        key: 'bets',
                        label: <span className="font-bold"><HistoryOutlined /> Lịch Sử Đặt Cược ({myBets.length})</span>,
                        children: (
                            <Card className="shadow-md rounded-xl border border-gray-200">
                                <Table
                                    columns={betColumns}
                                    dataSource={myBets}
                                    rowKey="id"
                                    loading={loadingBets}
                                    pagination={{ pageSize: 10 }}
                                    locale={{ emptyText: 'Bạn chưa thực hiện lệnh cược nào.' }}
                                />
                            </Card>
                        )
                    },
                    {
                        key: 'transactions',
                        label: <span className="font-bold"><DollarOutlined /> Biến Động Số Dư ({myTransactions.length})</span>,
                        children: (
                            <Card className="shadow-md rounded-xl border border-gray-200">
                                <Table
                                    columns={transactionColumns}
                                    dataSource={myTransactions}
                                    rowKey="id"
                                    loading={loadingTransactions}
                                    pagination={{ pageSize: 10 }}
                                    locale={{ emptyText: 'Chưa có lịch sử biến động số dư nào.' }}
                                />
                            </Card>
                        )
                    }
                ]} />
            ) : (
                <ProfileFormView />
            )}
        </div>
    );
};

export default ProfilePage;