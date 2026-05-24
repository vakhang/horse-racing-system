import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, message, Card, Typography, Popconfirm, Tabs, Input, Row, Col, Modal, Image, Tooltip } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, SearchOutlined, ReloadOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import api from '../config/api.js';

const { Title, Text } = Typography;

const AdminKycApprovalPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [activeTab, setActiveTab] = useState('PENDING');

    // State cho Modal xem ảnh
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentImage, setCurrentImage] = useState('');
    const [currentUser, setCurrentUser] = useState(null);

    // 1. Kéo toàn bộ Users từ Backend (Khớp với getAllUsers trong UserServiceImpl)
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error) {
            message.error('Lỗi khi kết nối đến Server để lấy danh sách!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // 2. Hàm gọi API Update (Chỉ gửi đúng cái Status, vì BE của sếp đã check != null)
    const handleApproval = async (userId, newStatus) => {
        try {
            await api.put(`/users/${userId}`, { status: newStatus });

            message.success(`Đã chuyển trạng thái thành ${newStatus}!`);
            fetchUsers(); // Kéo lại data cho nóng
        } catch (error) {
            message.error('Có lỗi xảy ra khi xử lý!');
        }
    };

    // Mở Modal xem chi tiết
    const showKycModal = (record) => {
        setCurrentUser(record);
        setCurrentImage(record.kycDocumentUrl);
        setIsModalVisible(true);
    };

    // 3. Logic Lọc dữ liệu theo Tab và Thanh Search
    const getFilteredData = () => {
        return users.filter(user => {
            const matchTab = user.status === activeTab;
            const matchSearch =
                (user.username && user.username.toLowerCase().includes(searchText.toLowerCase())) ||
                (user.email && user.email.toLowerCase().includes(searchText.toLowerCase()));
            return matchTab && matchSearch;
        });
    };

    // 4. Cấu hình Cột (Bao ngầu)
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 70,
            align: 'center',
            render: (id) => <Text type="secondary">#{id}</Text>
        },
        {
            title: 'Tài khoản',
            key: 'account',
            render: (_, record) => (
                <div className="flex flex-col">
                    <Text strong className="text-lg">{record.username}</Text>
                    <Text type="secondary" className="text-sm">{record.email}</Text>
                </div>
            ),
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            width: 150,
            render: (role) => {
                let color = 'default';
                if (role === 'OWNER') color = 'gold';
                if (role === 'JOCKEY') color = 'blue';
                if (role === 'SPECTATOR') color = 'green';
                if (role === 'REFEREE') color = 'purple';
                return <Tag color={color} className="px-3 py-1 text-sm rounded-full font-bold">{role}</Tag>;
            },
        },
        {
            title: 'Ngày Sinh',
            dataIndex: 'dob',
            key: 'dob',
            width: 120,
        },
        {
            title: 'Xác minh KYC',
            key: 'kyc',
            align: 'center',
            render: (_, record) => (
                <Button
                    type="dashed"
                    icon={<EyeOutlined />}
                    onClick={() => showKycModal(record)}
                    className="hover:border-blue-500 hover:text-blue-500"
                >
                    Xem Hồ Sơ
                </Button>
            ),
        },
        {
            title: 'Hành Động',
            key: 'action',
            align: 'center',
            render: (_, record) => {
                if (activeTab !== 'PENDING') {
                    return <Text type="secondary">Đã xử lý</Text>;
                }
                return (
                    <Space size="middle">
                        <Popconfirm
                            title="Bạn chắc chắn muốn DUYỆT?"
                            onConfirm={() => handleApproval(record.id, 'APPROVED')}
                            okText="Duyệt"
                            cancelText="Hủy"
                        >
                            <Tooltip title="Duyệt hồ sơ hợp lệ">
                                <Button type="primary" className="bg-green-500 hover:bg-green-600 border-none" icon={<CheckCircleOutlined />}>
                                    Duyệt
                                </Button>
                            </Tooltip>
                        </Popconfirm>

                        <Popconfirm
                            title="TỪ CHỐI hồ sơ này?"
                            onConfirm={() => handleApproval(record.id, 'REJECTED')}
                            okText="Từ chối"
                            okButtonProps={{ danger: true }}
                            cancelText="Hủy"
                        >
                            <Tooltip title="Từ chối nếu hồ sơ sai phạm">
                                <Button danger icon={<CloseCircleOutlined />}>
                                    Từ chối
                                </Button>
                            </Tooltip>
                        </Popconfirm>
                    </Space>
                );
            },
        },
    ];

    // Cấu hình các Tabs
    const tabItems = [
        { key: 'PENDING', label: `Chờ Duyệt (${users.filter(u => u.status === 'PENDING').length})` },
        { key: 'APPROVED', label: `Đã Duyệt (${users.filter(u => u.status === 'APPROVED').length})` },
        { key: 'REJECTED', label: `Bị Từ Chối (${users.filter(u => u.status === 'REJECTED').length})` },
    ];

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <Card className="shadow-xl rounded-2xl border-none">
                {/* Header của Dashboard */}
                <Row justify="space-between" align="middle" className="mb-6">
                    <Col>
                        <Title level={2} className="m-0 flex items-center gap-3 text-gray-800">
                            <SafetyCertificateOutlined className="text-blue-600" />
                            Quản Lý Phê Duyệt KYC
                        </Title>
                        <Text className="text-gray-500 text-base">Hệ thống kiểm duyệt tài khoản tham gia cá cược đua ngựa</Text>
                    </Col>
                    <Col>
                        <Button type="primary" size="large" icon={<ReloadOutlined />} onClick={fetchUsers} loading={loading}>
                            Làm Mới
                        </Button>
                    </Col>
                </Row>

                {/* Thanh công cụ: Tabs và Search */}
                <Row justify="space-between" className="mb-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <Col span={16}>
                        <Tabs
                            activeKey={activeTab}
                            onChange={setActiveTab}
                            items={tabItems}
                            size="large"
                            className="font-medium"
                        />
                    </Col>
                    <Col span={8} className="flex items-center">
                        <Input
                            size="large"
                            placeholder="Tìm kiếm Username hoặc Email..."
                            prefix={<SearchOutlined className="text-gray-400" />}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                        />
                    </Col>
                </Row>

                {/* Bảng Dữ Liệu */}
                <Table
                    columns={columns}
                    dataSource={getFilteredData()}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 8, showSizeChanger: false }}
                    className="overflow-hidden rounded-xl border border-gray-200"
                />

                {/* Modal Xem Ảnh Trực Tiếp */}
                <Modal
                    title={<span className="text-xl font-bold">Hồ sơ KYC: {currentUser?.username}</span>}
                    open={isModalVisible}
                    onCancel={() => setIsModalVisible(false)}
                    footer={[
                        <Button key="close" onClick={() => setIsModalVisible(false)} size="large">
                            Đóng
                        </Button>
                    ]}
                    width={800}
                    centered
                >
                    <div className="flex flex-col items-center bg-gray-50 p-6 rounded-xl mt-4">
                        <Text className="mb-4 text-gray-500">Đang hiển thị tài liệu do người dùng cung cấp. Vui lòng kiểm tra kỹ trước khi duyệt.</Text>
                        {/* AntD Image có sẵn tính năng zoom, xoay ảnh */}
                        <Image
                            width="100%"
                            style={{ maxHeight: '600px', objectFit: 'contain', borderRadius: '12px' }}
                            src={currentImage}
                            alt="KYC Document"
                            fallback="https://via.placeholder.com/800x400?text=Khong+Tai+Duoc+Anh"
                        />
                    </div>
                </Modal>
            </Card>
        </div>
    );
};

export default AdminKycApprovalPage;