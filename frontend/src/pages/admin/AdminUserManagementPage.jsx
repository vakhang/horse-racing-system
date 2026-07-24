// TÊN FILE: D:\SWP\horse-racing-system\frontend\src\pages\admin\AdminUserManagementPage.jsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, message, Card, Typography, Tabs, Row, Col, Modal, Dropdown, Radio, Input, Select } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined, TeamOutlined, LockOutlined, UnlockOutlined, BellOutlined, FilterOutlined } from '@ant-design/icons';
import api from "../../config/api.js";

const { Title, Text } = Typography;

const RenderFilesStatus = ({ urls }) => {
    if (!urls || urls.length === 0) return <Tag color="red" className="m-0">Chưa bổ sung</Tag>;
    return <Tag color="green">Đã nộp ({urls.length} tệp)</Tag>;
};

const AdminUserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeMainTab, setActiveMainTab] = useState('SPECTATOR');

    const [filterStatus, setFilterStatus] = useState('ALL');

    const [isNotifyModalVisible, setIsNotifyModalVisible] = useState(false);
    const [notifyUser, setNotifyUser] = useState(null);
    const [notifyType, setNotifyType] = useState('AUTO');
    const [customMessage, setCustomMessage] = useState('');

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
        fetchUsers();
    }, []);

    const handleStatusChange = async (userId, newStatus) => {
        try {
            await api.put(`/users/${userId}/status`, { status: newStatus });
            message.success(`Cập nhật trạng thái thành công!`);
            fetchUsers();
        } catch (error) {
            message.error('Có lỗi xảy ra!');
        }
    };

    const openNotifyModal = (user) => {
        setNotifyUser(user);
        setNotifyType('AUTO');
        setCustomMessage('');
        setIsNotifyModalVisible(true);
    };

    const handleSendNotification = () => {
        let messageContent = '';
        if (notifyType === 'AUTO') {
            messageContent = `Kính gửi ${notifyUser?.username}, tài khoản của bạn hiện đang thiếu một số thông tin/giấy tờ quan trọng. Vui lòng cập nhật bổ sung hồ sơ để Ban Tổ Chức tiến hành phê duyệt sớm nhất.`;
        } else {
            messageContent = customMessage;
        }

        if (!messageContent.trim()) {
            return message.warning('Vui lòng nhập nội dung thông báo!');
        }

        const storageKey = `user_notifications_${notifyUser.id}`;
        const existingNotifs = JSON.parse(localStorage.getItem(storageKey) || '[]');

        const newNotif = {
            id: Date.now(),
            title: '⚠️ Nhắc nhở từ Ban Tổ Chức',
            desc: messageContent,
            color: 'red',
            date: new Date().toISOString()
        };

        localStorage.setItem(storageKey, JSON.stringify([newNotif, ...existingNotifs]));

        message.success(`Đã gửi thông báo In-app thành công tới: ${notifyUser.username}`);
        setIsNotifyModalVisible(false);
    };

    const getActionItems = (record) => {
        const items = [];
        if (record.status === 'PENDING') {
            items.push({ key: 'APPROVED', icon: <CheckCircleOutlined className="text-green-500" />, label: 'Duyệt Hồ Sơ' });
            items.push({ key: 'REJECTED', danger: true, icon: <CloseCircleOutlined />, label: 'Từ Chối KYC' });
        } else {
            if (record.status === 'APPROVED' || record.status === 'RED_FLAG') {
                items.push({ key: 'BANNED', danger: true, icon: <LockOutlined />, label: 'Khóa Tài Khoản (Ban)' });
                if (record.status === 'APPROVED') {
                    items.push({ key: 'RED_FLAG', danger: true, icon: <CloseCircleOutlined />, label: 'Cảnh Báo (Red Flag)' });
                } else {
                    items.push({ key: 'APPROVED', icon: <CheckCircleOutlined className="text-green-500" />, label: 'Gỡ Cảnh Báo' });
                }
            } else {
                items.push({ key: 'APPROVED', icon: <UnlockOutlined className="text-green-500" />, label: 'Mở Khóa (Unban / Hủy Tự Cấm)' });
            }
        }
        return items;
    };

    const isFullDocs = (u) => {
        if (u.role === 'JOCKEY') {
            return u.kycDocumentUrls?.length > 0 && u.certDocumentUrls?.length > 0 && u.healthDocumentUrls?.length > 0 && u.weight && u.height;
        }
        if (u.role === 'REFEREE') {
            return u.kycDocumentUrls?.length > 0 && u.certDocumentUrls?.length > 0;
        }
        if (u.role === 'OWNER') {
            return u.kycDocumentUrls?.length > 0 && u.certDocumentUrls?.length > 0 && u.healthDocumentUrls?.length > 0;
        }
        return u.kycDocumentUrls?.length > 0;
    };

    const getFilteredUsers = (role) => {
        let list = users.filter(u => u.role === role);

        if (filterStatus === 'APPROVED') {
            list = list.filter(u => u.status === 'APPROVED');
        } else if (filterStatus === 'PENDING') {
            list = list.filter(u => u.status === 'PENDING');
        } else if (filterStatus === 'BANNED') {
            list = list.filter(u => u.status === 'BANNED');
        } else if (filterStatus === 'RED_FLAG') {
            list = list.filter(u => u.status === 'RED_FLAG');
        } else if (filterStatus === 'SELF_EXCLUSION') {
            list = list.filter(u => u.status === 'SELF_EXCLUSION');
        } else if (filterStatus === 'FULL_DOCS') {
            list = list.filter(u => u.status === 'APPROVED' && isFullDocs(u));
        } else if (filterStatus === 'MISSING_DOCS') {
            list = list.filter(u => !isFullDocs(u));
        }

        return list;
    };

    // Đếm tổng số lượng User đang chờ duyệt trên toàn hệ thống
    const pendingCount = users.filter(u => u.status === 'PENDING').length;

    const spectatorColumns = [
        { title: 'Tài khoản', render: (_, r) => (<><Text strong>{r.username}</Text><br /><Text type="secondary">{r.email}</Text></>) },
        { title: 'Ngày sinh', dataIndex: 'dob' },
        { title: 'Trạng Thái Nộp CCCD', render: (_, r) => <RenderFilesStatus urls={r.kycDocumentUrls} /> },
        { title: 'Trạng thái', dataIndex: 'status', render: s => <Tag color={s === 'APPROVED' ? 'green' : (s === 'BANNED' ? 'red' : 'orange')}>{s}</Tag> },
        {
            title: 'Hành Động', align: 'center', render: (_, r) => (
                <Space direction="vertical">
                    <Dropdown menu={{ items: getActionItems(r), onClick: ({ key }) => handleStatusChange(r.id, key) }} trigger={['click']}>
                        <Button size="small" block>Tùy chọn ⬇</Button>
                    </Dropdown>
                    <Button size="small" type="dashed" icon={<BellOutlined />} onClick={() => openNotifyModal(r)}>Nhắc Nhở</Button>
                </Space>
            )
        }
    ];

    const ownerColumns = [
        { title: 'Chủ Ngựa', render: (_, r) => (<><Text strong>{r.username}</Text><br /><Text type="secondary">{r.email}</Text></>) },
        { title: 'Hồ Sơ Giấy Tờ', render: (_, r) => (
                <div className="flex flex-col gap-1">
                    <div><Text className="text-xs text-gray-500">CCCD/Hộ chiếu:</Text> <RenderFilesStatus urls={r.kycDocumentUrls} /></div>
                    <div><Text className="text-xs text-gray-500">Ảnh & Giấy CN Nguồn Gốc:</Text> <RenderFilesStatus urls={r.certDocumentUrls} /></div>
                    <div><Text className="text-xs text-gray-500">Sổ Tiêm Phòng/Khám Bệnh:</Text> <RenderFilesStatus urls={r.healthDocumentUrls} /></div>
                </div>
            )},
        { title: 'Trạng thái', dataIndex: 'status', render: s => <Tag color={s === 'APPROVED' ? 'green' : (s === 'BANNED' ? 'red' : 'orange')}>{s}</Tag> },
        {
            title: 'Hành Động', align: 'center', render: (_, r) => (
                <Space direction="vertical">
                    <Dropdown menu={{ items: getActionItems(r), onClick: ({ key }) => handleStatusChange(r.id, key) }} trigger={['click']}>
                        <Button size="small" block>Tùy chọn ⬇</Button>
                    </Dropdown>
                    <Button size="small" type="dashed" icon={<BellOutlined />} onClick={() => openNotifyModal(r)}>Nhắc Nhở</Button>
                </Space>
            )
        }
    ];

    const jockeyColumns = [
        { title: 'Nài Ngựa', render: (_, r) => (<><Text strong>{r.username}</Text><br /><Text type="secondary">{r.email}</Text></>) },
        { title: 'Thể Chất', render: (_, r) => (<><Text>Nặng: {r.weight ? `${r.weight}kg` : <Tag color="red">Thiếu</Tag>}</Text><br/><Text>Cao: {r.height ? `${r.height}cm` : <Tag color="red">Thiếu</Tag>}</Text></>) },
        { title: 'Hồ Sơ Giấy Tờ', render: (_, r) => (
                <div className="flex flex-col gap-1">
                    <div><Text className="text-xs text-gray-500">CCCD:</Text> <RenderFilesStatus urls={r.kycDocumentUrls} /></div>
                    <div><Text className="text-xs text-gray-500">Bằng Cấp:</Text> <RenderFilesStatus urls={r.certDocumentUrls} /></div>
                    <div><Text className="text-xs text-gray-500">Sức Khỏe:</Text> <RenderFilesStatus urls={r.healthDocumentUrls} /></div>
                </div>
            )},
        { title: 'Trạng thái', dataIndex: 'status', render: s => <Tag color={s === 'APPROVED' ? 'green' : (s === 'BANNED' ? 'red' : 'orange')}>{s}</Tag> },
        {
            title: 'Hành Động', align: 'center', render: (_, r) => (
                <Space direction="vertical">
                    <Dropdown menu={{ items: getActionItems(r), onClick: ({ key }) => handleStatusChange(r.id, key) }} trigger={['click']}>
                        <Button size="small" block>Tùy chọn ⬇</Button>
                    </Dropdown>
                    <Button size="small" type="dashed" danger icon={<BellOutlined />} onClick={() => openNotifyModal(r)}>Nhắc Nhở</Button>
                </Space>
            )
        }
    ];

    const refereeColumns = [
        { title: 'Trọng Tài', render: (_, r) => (<><Text strong>{r.username}</Text><br /><Text type="secondary">{r.email}</Text></>) },
        { title: 'Hồ Sơ Giấy Tờ', render: (_, r) => (
                <div className="flex flex-col gap-1">
                    <div><Text className="text-xs text-gray-500">CCCD / Hộ Chiếu:</Text> <RenderFilesStatus urls={r.kycDocumentUrls} /></div>
                    <div><Text className="text-xs text-gray-500">Chứng Chỉ Chuyên Môn:</Text> <RenderFilesStatus urls={r.certDocumentUrls} /></div>
                </div>
            )},
        { title: 'Trạng thái', dataIndex: 'status', render: s => <Tag color={s === 'APPROVED' ? 'green' : (s === 'BANNED' ? 'red' : 'orange')}>{s}</Tag> },
        {
            title: 'Hành Động', align: 'center', render: (_, r) => (
                <Space direction="vertical">
                    <Dropdown menu={{ items: getActionItems(r), onClick: ({ key }) => handleStatusChange(r.id, key) }} trigger={['click']}>
                        <Button size="small" block>Tùy chọn ⬇</Button>
                    </Dropdown>
                    <Button size="small" type="dashed" icon={<BellOutlined />} onClick={() => openNotifyModal(r)}>Nhắc Nhở</Button>
                </Space>
            )
        }
    ];

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <Card className="shadow-xl rounded-2xl border-none">
                <Row justify="space-between" align="middle" className="mb-6">
                    <Col>
                        <Title level={2} className="m-0 flex items-center gap-3 text-gray-800"><TeamOutlined className="text-blue-600" /> Quản Lý Tài Khoản</Title>
                    </Col>
                    <Col className="flex gap-4">
                        <div className="flex items-center bg-gray-50 px-3 py-1 rounded-lg border border-gray-200">
                            <FilterOutlined className="text-gray-500 mr-2" />
                            <Select
                                value={filterStatus}
                                onChange={setFilterStatus}
                                bordered={false}
                                className="w-56 font-medium"
                                options={[
                                    { value: 'ALL', label: 'Tất cả trạng thái' },
                                    { value: 'PENDING', label: `⏳ Chưa duyệt (${pendingCount})` },
                                    { value: 'APPROVED', label: '🟢 Đang hoạt động' },
                                    { value: 'RED_FLAG', label: '🚩 Cảnh báo (Red Flag)' },
                                    { value: 'FULL_DOCS', label: '✅ Đã nộp (Đủ hồ sơ)' },
                                    { value: 'MISSING_DOCS', label: '⚠️ Thiếu hồ sơ' },
                                    { value: 'SELF_EXCLUSION', label: '🛑 Tự nguyện cấm' },
                                    { value: 'BANNED', label: '🔴 Bị khóa (Banned)' },
                                ]}
                            />
                        </div>
                        <Button type="primary" size="large" icon={<ReloadOutlined />} onClick={fetchUsers} loading={loading}>Làm Mới</Button>
                    </Col>
                </Row>

                <Tabs activeKey={activeMainTab} onChange={setActiveMainTab} size="large" type="card" items={[
                    {
                        key: 'SPECTATOR',
                        label: `Quản Lý Khán Giả (${getFilteredUsers('SPECTATOR').length})`,
                        children: <Table columns={spectatorColumns} dataSource={getFilteredUsers('SPECTATOR')} rowKey="id" loading={loading} />
                    },
                    {
                        key: 'OWNER',
                        label: `Quản Lý Chủ Ngựa (${getFilteredUsers('OWNER').length})`,
                        children: <Table columns={ownerColumns} dataSource={getFilteredUsers('OWNER')} rowKey="id" loading={loading} />
                    },
                    {
                        key: 'JOCKEY',
                        label: `Quản Lý Nài Ngựa (${getFilteredUsers('JOCKEY').length})`,
                        children: <Table columns={jockeyColumns} dataSource={getFilteredUsers('JOCKEY')} rowKey="id" loading={loading} />
                    },
                    {
                        key: 'REFEREE',
                        label: `Quản Lý Trọng Tài (${getFilteredUsers('REFEREE').length})`,
                        children: <Table columns={refereeColumns} dataSource={getFilteredUsers('REFEREE')} rowKey="id" loading={loading} />
                    }
                ]} />
            </Card>

            <Modal
                title={<span className="text-xl">🔔 Gửi Thông Báo Cho: <Text type="danger">{notifyUser?.username}</Text></span>}
                open={isNotifyModalVisible}
                onCancel={() => setIsNotifyModalVisible(false)}
                footer={[
                    <Button key="cancel" onClick={() => setIsNotifyModalVisible(false)}>Hủy</Button>,
                    <Button key="send" type="primary" className="bg-blue-600" onClick={handleSendNotification}>Gửi Thông Báo</Button>
                ]}
                centered
            >
                <div className="mt-4">
                    <Radio.Group onChange={(e) => setNotifyType(e.target.value)} value={notifyType} className="mb-4">
                        <Radio value="AUTO">Tự động nhắc nhở thiếu hồ sơ</Radio>
                        <Radio value="CUSTOM">Nhập nội dung tùy chỉnh</Radio>
                    </Radio.Group>

                    {notifyType === 'AUTO' ? (
                        <div className="bg-gray-100 p-4 rounded-lg text-gray-600 italic">
                            "Kính gửi {notifyUser?.username}, tài khoản của bạn hiện đang thiếu một số thông tin/giấy tờ quan trọng. Vui lòng cập nhật bổ sung hồ sơ để Ban Tổ Chức tiến hành phê duyệt sớm nhất."
                        </div>
                    ) : (
                        <Input.TextArea
                            rows={4}
                            placeholder="Nhập nội dung bạn muốn gửi tới người dùng này..."
                            value={customMessage}
                            onChange={(e) => setCustomMessage(e.target.value)}
                        />
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default AdminUserManagementPage;