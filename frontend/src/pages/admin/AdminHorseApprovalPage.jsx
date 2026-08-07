import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, message, Card, Typography, Popconfirm, Tabs, Input, Row, Col, Tooltip } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, SearchOutlined, ReloadOutlined, FileSearchOutlined } from '@ant-design/icons';
import api from "../../config/api.js";

const { Title, Text } = Typography;

// [Chức năng rõ ràng]: Trang Duyệt Ngựa (Admin)
// [Tác dụng]: Danh sách các chú ngựa do Chủ ngựa mới tạo (Trạng thái PENDING). Admin có thể xem giấy khai sinh, hồ sơ thú y và bấm Duyệt/Từ chối.
// [Hướng dẫn sửa đổi]:
// - Logic: Bổ sung input nhập lý do từ chối (Reject Reason) khi bấm nút Từ chối.
const RenderFilesStatus = ({ urls }) => {
    if (!urls || urls.length === 0) return <Tag color="red" className="m-0">Chưa bổ sung</Tag>;
    return <Tag color="green">Đã nộp ({urls.length} tệp)</Tag>;
};

const AdminHorseApprovalPage = () => {
    const [horses, setHorses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [activeTab, setActiveTab] = useState('PENDING');

    const fetchHorses = async () => {
        setLoading(true);
        try {
            const response = await api.get('/horses');
            setHorses(response.data);
        } catch (error) {
            message.error('Lỗi lấy danh sách ngựa!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHorses();
    }, []);

    const handleApproval = async (horseId, newStatus) => {
        setLoading(true);
        try {
            // FIX 415: API Backend Update Ngựa yêu cầu FormData (multipart/form-data)
            const formData = new FormData();
            formData.append('status', newStatus);

            await api.put(`/horses/${horseId}`, formData);
            const msg = newStatus === 'APPROVED' ? 'Đã duyệt chiến mã thành công' : 'Đã từ chối duyệt chiến mã';
            message.success(msg);
            await fetchHorses();
        } catch (error) {
            message.error('Có lỗi xảy ra khi xử lý!');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateHorse = async (horseId, data) => {
        setLoading(true);
        try {
            const formData = new FormData();
            Object.keys(data).forEach(key => formData.append(key, data[key]));
            await api.put(`/horses/${horseId}`, formData);
            message.success('Đã cập nhật thông tin thành công!');
            await fetchHorses();
        } catch (error) {
            message.error('Lỗi khi cập nhật thông tin!');
        } finally {
            setLoading(false);
        }
    };

    const getFilteredData = () => {
        const filtered = horses.filter(horse => {
            const matchTab = (horse.status || 'PENDING') === activeTab;
            const searchLower = searchText.trim().toLowerCase();
            const matchSearch = !searchLower ||
                (horse.name && horse.name.toLowerCase().includes(searchLower)) ||
                (horse.ownerUsername && horse.ownerUsername.toLowerCase().includes(searchLower));
            return matchTab && matchSearch;
        });

        return filtered.sort((a, b) => {
            const aIsPending = (a.status || 'PENDING') === 'PENDING' ? 0 : 1;
            const bIsPending = (b.status || 'PENDING') === 'PENDING' ? 0 : 1;
            if (aIsPending !== bIsPending) {
                return aIsPending - bIsPending;
            }
            return (a.name || '').localeCompare(b.name || '', 'vi', { sensitivity: 'base' });
        });
    };

    const columns = [
        {
            title: 'Mã Nhận Dạng',
            key: 'microchipCode',
            render: (_, record) => (
                <Text strong className={record.microchipCode ? "text-green-600" : "text-red-500"}>
                    {record.microchipCode || 'CHƯA CÓ'}
                </Text>
            )
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
            title: 'Cấp Chạy & Rating 🏆',
            key: 'classRating',
            render: (_, record) => {
                const classLevel = record.classLevel || 3;
                const rating = record.rating || 60;
                const classColor = classLevel === 1 ? 'gold' : classLevel === 2 ? 'purple' : classLevel === 3 ? 'green' : classLevel === 4 ? 'blue' : 'default';
                return (
                    <Space direction="vertical" size="small">
                        <Tag color={classColor} className="font-bold text-sm px-2.5 py-0.5 border">
                            Cấp {classLevel} (Class {classLevel})
                        </Tag>
                        <Tag color="cyan" className="font-bold text-xs px-2 py-0.5">
                            ⚡ Rating: {rating} Điểm
                        </Tag>
                    </Space>
                );
            }
        },
        {
            title: 'Đặc Điểm',
            key: 'details',
            render: (_, record) => (
                <Space direction="vertical" size="small">
                    <Text>Tuổi: {record.age} | Giống: {record.breed}</Text>
                    <Text>Màu lông: {record.color}</Text>
                </Space>
            ),
        },
        {
            title: 'Tình Trạng Nộp Hồ Sơ',
            key: 'document',
            render: (_, record) => (
                <div className="flex flex-col gap-1">
                    <div><Text className="text-xs text-gray-500">Ảnh Thực Tế:</Text> <RenderFilesStatus urls={record.realImageUrls} /></div>
                    <div><Text className="text-xs text-gray-500">Giấy Chứng Nhận:</Text> <RenderFilesStatus urls={record.certDocumentUrls} /></div>
                    <div><Text className="text-xs text-gray-500">Sổ Khám Sức Khỏe:</Text> <RenderFilesStatus urls={record.vetRecordUrls} /></div>
                </div>
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
                        <Popconfirm title="Bạn chắc chắn muốn DUYỆT chiến mã này?" onConfirm={() => handleApproval(record.id, 'APPROVED')} okText="Duyệt" cancelText="Hủy">
                            <Tooltip title="Duyệt cho phép thi đấu">
                                <Button type="primary" className="bg-green-500 hover:bg-green-600 border-none" icon={<CheckCircleOutlined />} disabled={loading}>Duyệt</Button>
                            </Tooltip>
                        </Popconfirm>

                        <Popconfirm title="TỪ CHỐI hồ sơ chiến mã này?" onConfirm={() => handleApproval(record.id, 'REJECTED')} okText="Từ chối" okButtonProps={{ danger: true }} cancelText="Hủy">
                            <Tooltip title="Từ chối nếu hồ sơ không đạt yêu cầu">
                                <Button danger icon={<CloseCircleOutlined />} disabled={loading}>Từ chối</Button>
                            </Tooltip>
                        </Popconfirm>
                    </Space>
                );
            },
        },
    ];

    const tabItems = [
        { key: 'PENDING', label: `Chờ Duyệt (${horses.filter(h => h.status === 'PENDING').length})` },
        { key: 'APPROVED', label: `Đã Duyệt (${horses.filter(h => h.status === 'APPROVED').length})` },
        { key: 'REJECTED', label: `Bị Từ Chối (${horses.filter(h => h.status === 'REJECTED').length})` },
    ];

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <Card className="shadow-xl rounded-2xl border-none">
                <Row justify="space-between" align="middle" className="mb-6">
                    <Col>
                        <Title level={2} className="m-0 flex items-center gap-3 text-gray-800">
                            <FileSearchOutlined className="text-blue-600" /> Quản Lý Chiến Mã
                        </Title>
                        <Text className="text-gray-500 text-base">Hồ sơ cấp phép thi đấu, theo dõi sức khỏe và thẻ Microchip 🏇</Text>
                    </Col>
                    <Col>
                        <Button type="primary" size="large" icon={<ReloadOutlined />} onClick={fetchHorses} loading={loading}>
                            Làm Mới
                        </Button>
                    </Col>
                </Row>

                <Row justify="space-between" className="mb-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <Col span={16}>
                        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} size="large" className="font-medium" />
                    </Col>
                    <Col span={8} className="flex items-center">
                        <Input size="large" placeholder="Tìm kiếm theo Tên ngựa hoặc Chủ ngựa..." prefix={<SearchOutlined className="text-gray-400" />} onChange={(e) => setSearchText(e.target.value)} allowClear />
                    </Col>
                </Row>

                <Table columns={columns} dataSource={getFilteredData()} rowKey="id" loading={loading} pagination={{ pageSize: 8, showSizeChanger: false }} className="overflow-hidden rounded-xl border border-gray-200" />
            </Card>
        </div>
    );
};

export default AdminHorseApprovalPage;