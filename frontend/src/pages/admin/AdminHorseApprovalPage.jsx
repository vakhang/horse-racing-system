import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, message, Card, Typography, Popconfirm, Tabs, Input, Row, Col, Modal, Image, Tooltip } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, SearchOutlined, ReloadOutlined, FileSearchOutlined } from '@ant-design/icons';
import api from "../../config/api.js";

const { Title, Text } = Typography;

const AdminHorseApprovalPage = () => {
    const [horses, setHorses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [activeTab, setActiveTab] = useState('PENDING');

    // State cho Modal xem hồ sơ ngựa
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentDocument, setCurrentDocument] = useState('');
    const [currentHorse, setCurrentHorse] = useState(null);

    // 1. Kéo toàn bộ danh sách Ngựa từ Backend
    const fetchHorses = async () => {
        setLoading(true);
        try {
            const response = await api.get('/horses');
            setHorses(response.data);
        } catch (error) {
            message.error('Lỗi khi kết nối đến Server để lấy danh sách ngựa! 🚨');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHorses();
    }, []);

    // 2. Hàm gọi API Cập nhật trạng thái
    const handleApproval = async (horseId, newStatus) => {
        try {
            await api.put(`/horses/${horseId}`, { status: newStatus });
            message.success(`Đã chuyển trạng thái chiến mã thành ${newStatus}! ✅`);
            fetchHorses();
        } catch (error) {
            message.error('Có lỗi xảy ra khi xử lý! ❌');
        }
    };

    // Mở Modal xem hồ sơ
    const showDocumentModal = (record) => {
        setCurrentHorse(record);
        setCurrentDocument(record.documentUrl);
        setIsModalVisible(true);
    };

    // 3. Logic Lọc dữ liệu theo Tab và Thanh Search
    const getFilteredData = () => {
        return horses.filter(horse => {
            const matchTab = horse.status === activeTab;
            const matchSearch =
                (horse.name && horse.name.toLowerCase().includes(searchText.toLowerCase())) ||
                (horse.ownerUsername && horse.ownerUsername.toLowerCase().includes(searchText.toLowerCase()));
            return matchTab && matchSearch;
        });
    };

    // 4. Cấu hình Cột
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
            title: 'Tên Chiến Mã 🐎',
            key: 'horseName',
            render: (_, record) => (
                <div className="flex flex-col">
                    <Text strong className="text-lg text-blue-700">{record.name}</Text>
                    <Text type="secondary" className="text-sm">Chủ: {record.ownerUsername}</Text>
                </div>
            ),
        },
        {
            title: 'Thông Tin Chi Tiết',
            key: 'details',
            render: (_, record) => (
                <Space direction="vertical" size="small">
                    <Text><Text strong>Tuổi:</Text> {record.age}</Text>
                    <Text><Text strong>Giống:</Text> {record.breed}</Text>
                    <Text><Text strong>Màu lông:</Text> {record.color}</Text>
                </Space>
            ),
        },
        {
            title: 'Giấy Tờ / Khám Sức Khỏe 🩺',
            key: 'document',
            align: 'center',
            render: (_, record) => (
                <Button
                    type="dashed"
                    icon={<EyeOutlined />}
                    onClick={() => showDocumentModal(record)}
                    className="hover:border-blue-500 hover:text-blue-500"
                >
                    Xem Hồ Sơ
                </Button>
            ),
        },
        {
            title: 'Hành Động ⚡',
            key: 'action',
            align: 'center',
            render: (_, record) => {
                if (activeTab !== 'PENDING') {
                    return <Text type="secondary">Đã xử lý</Text>;
                }
                return (
                    <Space size="middle">
                        <Popconfirm
                            title="Bạn chắc chắn muốn DUYỆT chiến mã này?"
                            onConfirm={() => handleApproval(record.id, 'APPROVED')}
                            okText="Duyệt"
                            cancelText="Hủy"
                        >
                            <Tooltip title="Duyệt cho phép thi đấu">
                                <Button type="primary" className="bg-green-500 hover:bg-green-600 border-none" icon={<CheckCircleOutlined />}>
                                    Duyệt
                                </Button>
                            </Tooltip>
                        </Popconfirm>

                        <Popconfirm
                            title="TỪ CHỐI hồ sơ chiến mã này?"
                            onConfirm={() => handleApproval(record.id, 'REJECTED')}
                            okText="Từ chối"
                            okButtonProps={{ danger: true }}
                            cancelText="Hủy"
                        >
                            <Tooltip title="Từ chối nếu hồ sơ không đạt yêu cầu">
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
        { key: 'PENDING', label: `Chờ Duyệt (${horses.filter(h => h.status === 'PENDING').length})` },
        { key: 'APPROVED', label: `Đã Duyệt (${horses.filter(h => h.status === 'APPROVED').length})` },
        { key: 'REJECTED', label: `Bị Từ Chối (${horses.filter(h => h.status === 'REJECTED').length})` },
    ];

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <Card className="shadow-xl rounded-2xl border-none">
                {/* Header */}
                <Row justify="space-between" align="middle" className="mb-6">
                    <Col>
                        <Title level={2} className="m-0 flex items-center gap-3 text-gray-800">
                            <FileSearchOutlined className="text-blue-600" />
                            Quản Lý Phê Duyệt Ngựa
                        </Title>
                        <Text className="text-gray-500 text-base">Kiểm tra hồ sơ và cấp phép thi đấu cho chiến mã 🏇</Text>
                    </Col>
                    <Col>
                        <Button type="primary" size="large" icon={<ReloadOutlined />} onClick={fetchHorses} loading={loading}>
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
                            placeholder="Tìm kiếm theo Tên ngựa hoặc Chủ ngựa..."
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
                    title={<span className="text-xl font-bold">Hồ sơ khám sức khỏe: {currentHorse?.name}</span>}
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
                        <Text className="mb-4 text-gray-500">Đang hiển thị tài liệu chứng nhận do Chủ ngựa cung cấp. 📋</Text>
                        <Image
                            width="100%"
                            style={{ maxHeight: '600px', objectFit: 'contain', borderRadius: '12px' }}
                            src={currentDocument}
                            alt="Horse Document"
                            fallback="https://via.placeholder.com/800x400?text=Khong+Tai+Duoc+Anh"
                        />
                    </div>
                </Modal>
            </Card>
        </div>
    );
};

export default AdminHorseApprovalPage;