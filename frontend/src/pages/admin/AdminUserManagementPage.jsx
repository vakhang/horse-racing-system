import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, message, Card, Typography, Tabs, Row, Col, Modal, Image, Dropdown } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, ReloadOutlined, TeamOutlined, LockOutlined, UnlockOutlined, KeyOutlined } from '@ant-design/icons';
import api from "../../config/api.js";

const { Title, Text } = Typography;

const AdminUserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    // Tab State
    const [activeMainTab, setActiveMainTab] = useState('KYC');
    const [activeKycTab, setActiveKycTab] = useState('PENDING');
    const [activeRoleTab, setActiveRoleTab] = useState('ALL');

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentImage, setCurrentImage] = useState('');
    const [currentUser, setCurrentUser] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error) {
            message.error('Lỗi lấy danh sách tài khoản!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadData = async () => { await fetchUsers(); };
        loadData();
    }, []);

    const handleStatusChange = async (userId, newStatus) => {
        try {
            await api.put(`/users/${userId}`, { status: newStatus });
            message.success(`Cập nhật trạng thái thành công!`);
            await fetchUsers();
        } catch (error) {
            message.error('Có lỗi xảy ra!');
        }
    };

    const showKycModal = (record) => {
        setCurrentUser(record);
        setCurrentImage(record.kycDocumentUrl);
        setIsModalVisible(true);
    };

    const kycUsers = users.filter(u => u.status === activeKycTab);
    const kycColumns = [
        { title: 'Tài khoản', render: (_, r) => (<><Text strong>{r.username}</Text><br/><Text type="secondary">{r.email}</Text></>) },
        { title: 'Vai trò', dataIndex: 'role', render: role => <Tag color="blue">{role}</Tag> },
        { title: 'Ngày sinh', dataIndex: 'dob' },
        { title: 'Hồ sơ', render: (_, r) => <Button type="dashed" icon={<EyeOutlined />} onClick={() => showKycModal(r)}>Xem CCCD/Bằng</Button> },
        {
            title: 'Hành Động',
            render: (_, r) => {
                if (activeKycTab !== 'PENDING') return <Text type="secondary">Đã xử lý</Text>;
                return (
                    <Space>
                        <Button type="primary" className="bg-green-500" icon={<CheckCircleOutlined />} onClick={() => handleStatusChange(r.id, 'APPROVED')}>Duyệt</Button>
                        <Button danger icon={<CloseCircleOutlined />} onClick={() => handleStatusChange(r.id, 'REJECTED')}>Từ chối</Button>
                    </Space>
                )
            }
        }
    ];

    const activeUsers = users.filter(u => (u.status === 'APPROVED' || u.status === 'BANNED') && (activeRoleTab === 'ALL' || u.role === activeRoleTab));

    const getActionItems = (record) => {
        const items = [];
        if (record.status === 'APPROVED') {
            items.push({ key: 'BANNED', danger: true, icon: <LockOutlined />, label: 'Khóa Tài Khoản (Ban)' });
        } else {
            items.push({ key: 'APPROVED', icon: <UnlockOutlined className="text-green-500"/>, label: 'Mở Khóa (Unban)' });
        }
        items.push({ key: 'RESET_PASS', icon: <KeyOutlined />, label: 'Reset Mật Khẩu' });
        return items;
    };

    const activeColumns = [
        { title: 'Tài khoản', render: (_, r) => (<><Text strong>{r.username}</Text><br/><Text type="secondary">{r.email}</Text></>) },
        { title: 'Vai trò', dataIndex: 'role', render: role => <Tag color="blue">{role}</Tag> },
        { title: 'Số dư ví', dataIndex: 'balance', render: (val) => <Text className="font-bold text-green-600">{val ? val.toLocaleString() : 0} đ</Text> },
        { title: 'Trạng thái', dataIndex: 'status', render: s => <Tag color={s === 'APPROVED' ? 'green' : 'red'}>{s}</Tag> },
        { title: 'Thao tác', align: 'center', render: (_, r) => (
                <Dropdown menu={{ items: getActionItems(r), onClick: ({ key }) => handleStatusChange(r.id, key) }} trigger={['click']}>
                    <Button>Tùy chọn ⬇</Button>
                </Dropdown>
            )}
    ];

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <Card className="shadow-xl rounded-2xl border-none">
                <Row justify="space-between" align="middle" className="mb-6">
                    <Col>
                        <Title level={2} className="m-0 flex items-center gap-3 text-gray-800"><TeamOutlined className="text-blue-600" /> Quản Lý Người Dùng & KYC</Title>
                    </Col>
                    <Col><Button type="primary" size="large" icon={<ReloadOutlined />} onClick={fetchUsers} loading={loading}>Làm Mới</Button></Col>
                </Row>

                <Tabs activeKey={activeMainTab} onChange={setActiveMainTab} size="large" items={[
                    {
                        key: 'KYC',
                        label: `Phê Duyệt KYC`,
                        children: (
                            <>
                                <Tabs activeKey={activeKycTab} onChange={setActiveKycTab} type="card" items={[
                                    { key: 'PENDING', label: `Chờ Duyệt (${users.filter(u=>u.status==='PENDING').length})` },
                                    { key: 'APPROVED', label: `Đã Duyệt (${users.filter(u=>u.status==='APPROVED').length})` },
                                    { key: 'REJECTED', label: `Bị Từ Chối (${users.filter(u=>u.status==='REJECTED').length})` },
                                ]} />
                                <Table columns={kycColumns} dataSource={kycUsers} rowKey="id" loading={loading} />
                            </>
                        )
                    },
                    {
                        key: 'ACTIVE',
                        label: `Quản Lý Tài Khoản`,
                        children: (
                            <>
                                <Tabs activeKey={activeRoleTab} onChange={setActiveRoleTab} type="card" items={[
                                    { key: 'ALL', label: 'Tất cả' },
                                    { key: 'SPECTATOR', label: 'Khán giả' },
                                    { key: 'OWNER', label: 'Chủ ngựa' },
                                    { key: 'JOCKEY', label: 'Nài ngựa' },
                                    { key: 'REFEREE', label: 'Trọng tài' },
                                ]} />
                                <Table columns={activeColumns} dataSource={activeUsers} rowKey="id" loading={loading} />
                            </>
                        )
                    },
                ]} />

                <Modal title={<span className="text-xl font-bold">Hồ sơ KYC: {currentUser?.username}</span>} open={isModalVisible} onCancel={() => setIsModalVisible(false)} footer={null} width={800} centered>
                    <div className="flex flex-col items-center bg-gray-50 p-6 rounded-xl mt-4">
                        <Image width="100%" style={{ maxHeight: '600px', objectFit: 'contain' }} src={currentImage} fallback="https://via.placeholder.com/800?text=Loi+Anh" />
                    </div>
                </Modal>
            </Card>
        </div>
    );
};

export default AdminUserManagementPage;