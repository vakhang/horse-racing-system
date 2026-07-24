import React, { useState, useEffect } from 'react';
import { Card, Typography, Input, Button, Table, message, Checkbox, Select, Upload, Tag, Row, Col } from 'antd';
import { NotificationOutlined, SendOutlined, UploadOutlined, LinkOutlined, ClockCircleOutlined, UserOutlined, GlobalOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../config/api.js';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ROLE_OPTIONS = [
    { label: 'Khán giả', value: 'SPECTATOR' },
    { label: 'Chủ ngựa', value: 'OWNER' },
    { label: 'Nài ngựa', value: 'JOCKEY' },
    { label: 'Trọng tài', value: 'REFEREE' },
];

const STATUS_OPTIONS = [
    { label: 'Đang chờ (PENDING)', value: 'PENDING' },
    { label: 'Đã duyệt (APPROVED)', value: 'APPROVED' },
    { label: 'Bị khóa (BANNED)', value: 'BANNED' },
];

const CATEGORIES = {
    SYSTEM: { label: 'Hệ thống / Bảo trì', color: 'blue' },
    LEGAL: { label: 'Pháp lý / Thể lệ', color: 'red' },
    NEWS: { label: 'Tin tức / Sự kiện', color: 'green' },
    WARNING: { label: 'Cảnh báo', color: 'orange' },
};

const AdminNewsPage = () => {
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('SYSTEM');
    const [targetRoles, setTargetRoles] = useState([]);
    const [targetStatuses, setTargetStatuses] = useState([]);
    const [fileList, setFileList] = useState([]);
    const [loading, setLoading] = useState(false);

    const [newsList, setNewsList] = useState([]);
    const [loadingList, setLoadingList] = useState(false);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        setLoadingList(true);
        try {
            const res = await api.get('/admin/announcements');
            setNewsList(res.data);
        } catch (error) {
            message.error('Lỗi khi tải lịch sử thông báo!');
        } finally {
            setLoadingList(false);
        }
    };

    const formatDateTime = (dateVal) => {
        if (!dateVal) return '';
        if (Array.isArray(dateVal)) {
            // Spring Boot trả về mảng [YYYY, MM, DD, HH, mm, ss]
            return dayjs(new Date(dateVal[0], dateVal[1] - 1, dateVal[2], dateVal[3] || 0, dateVal[4] || 0, dateVal[5] || 0)).format('HH:mm:ss - DD/MM/YYYY');
        }
        return dayjs(dateVal).format('HH:mm:ss - DD/MM/YYYY');
    };

    const handlePost = async () => {
        if (!content.trim()) return message.warning('Vui lòng nhập nội dung!');
        if (category === 'LEGAL' && fileList.length === 0) {
            return message.warning('Thông báo Pháp lý bắt buộc phải đính kèm văn bản định dạng PDF!');
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('content', content);
        formData.append('category', category);

        targetRoles.forEach(role => formData.append('targetRoles', role));
        targetStatuses.forEach(status => formData.append('targetStatuses', status));

        if (fileList.length > 0) {
            formData.append('file', fileList[0].originFileObj);
        }

        try {
            await api.post('/admin/announcements', formData);
            message.success('Đã phát sóng thông báo thành công!');

            // Reset form
            setContent('');
            setCategory('SYSTEM');
            setTargetRoles([]);
            setTargetStatuses([]);
            setFileList([]);

            // Reload list
            fetchAnnouncements();
        } catch (error) {
            message.error(error.response?.data || 'Lỗi khi gửi thông báo!');
        } finally {
            setLoading(false);
        }
    };

    const uploadProps = {
        onRemove: () => { setFileList([]); },
        beforeUpload: (file) => {
            setFileList([file]);
            return false;
        },
        fileList,
        maxCount: 1,
    };

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <div className="max-w-5xl mx-auto">
                <Card className="shadow-xl rounded-2xl border-none mb-6">
                    <Title level={3} className="mb-4"><NotificationOutlined className="text-blue-500 mr-2" /> Đăng Thông Báo Hệ Thống</Title>

                    <Row gutter={24} className="mb-4">
                        <Col span={8}>
                            <div className="mb-2 font-semibold">Loại Thông Báo:</div>
                            <Select value={category} onChange={setCategory} className="w-full" size="large">
                                {Object.keys(CATEGORIES).map(key => (
                                    <Option key={key} value={key}>{CATEGORIES[key].label}</Option>
                                ))}
                            </Select>
                        </Col>
                        <Col span={8}>
                            <div className="mb-2 font-semibold">Tệp đính kèm (Quyết định/Văn bản PDF):</div>
                            <Upload {...uploadProps}>
                                <Button icon={<UploadOutlined />}>Chọn File đính kèm</Button>
                            </Upload>
                        </Col>
                    </Row>

                    <Row gutter={24} className="mb-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <Col span={12}>
                            <div className="mb-2 font-semibold">Gửi đến nhóm đối tượng (Bỏ trống = Gửi tất cả):</div>
                            <Checkbox.Group options={ROLE_OPTIONS} value={targetRoles} onChange={setTargetRoles} />
                        </Col>
                        <Col span={12}>
                            <div className="mb-2 font-semibold">Lọc theo trạng thái tài khoản:</div>
                            <Checkbox.Group options={STATUS_OPTIONS} value={targetStatuses} onChange={setTargetStatuses} />
                        </Col>
                    </Row>

                    <TextArea
                        rows={5}
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        placeholder="Nhập nội dung chi tiết cần thông báo..."
                        className="text-lg p-4 rounded-xl mt-2"
                    />

                    <div className="mt-6 flex justify-end">
                        <Button
                            type="primary"
                            size="large"
                            icon={<SendOutlined />}
                            onClick={handlePost}
                            loading={loading}
                            className="bg-blue-600 font-bold px-10 h-12 text-lg shadow-lg hover:shadow-xl transition-all"
                        >
                            PHÁT SÓNG LỆNH
                        </Button>
                    </div>
                </Card>

                <Card className="shadow-sm rounded-xl">
                    <Title level={4} className="mb-4">Lịch Sử Thông Báo</Title>
                    <Table
                        columns={[
                            {
                                title: 'Thời Gian & Admin',
                                key: 'time',
                                width: '25%',
                                render: (_, record) => (
                                    <div className="text-xs text-gray-500">
                                        <div className="font-semibold text-gray-800 mb-1">
                                            <ClockCircleOutlined /> {formatDateTime(record.createdAt)}
                                        </div>
                                        <div><UserOutlined /> Admin ID: {record.createdBy}</div>
                                        <div><GlobalOutlined /> IP: {record.adminIp}</div>
                                    </div>
                                )
                            },
                            {
                                title: 'Loại & Phân Vùng',
                                key: 'category',
                                width: '25%',
                                render: (_, record) => (
                                    <div>
                                        <Tag color={CATEGORIES[record.category]?.color || 'default'} className="mb-2 text-xs">
                                            {CATEGORIES[record.category]?.label || record.category}
                                        </Tag>
                                        <div className="text-xs text-gray-500 mt-1">
                                            <span className="font-semibold">Role: </span>
                                            {record.targetRoles ? record.targetRoles.split(',').join(', ') : 'TẤT CẢ'}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            <span className="font-semibold">Status: </span>
                                            {record.targetStatuses ? record.targetStatuses.split(',').join(', ') : 'TẤT CẢ'}
                                        </div>
                                    </div>
                                )
                            },
                            {
                                title: 'Nội Dung Thông Báo',
                                key: 'content',
                                width: '40%',
                                render: (_, record) => (
                                    <div>
                                        <div className="text-sm font-medium text-gray-800 mb-2 whitespace-pre-wrap">{record.content}</div>
                                        {record.attachmentUrl && (
                                            <a href={record.attachmentUrl} target="_blank" rel="noreferrer" className="text-blue-600 text-xs font-medium bg-blue-50 px-2 py-1 rounded border border-blue-200 inline-block mt-1">
                                                <LinkOutlined /> Xem đính kèm
                                            </a>
                                        )}
                                    </div>
                                )
                            },
                            {
                                title: 'Tiếp Cận',
                                key: 'success',
                                width: '10%',
                                render: (_, record) => (
                                    <span className="font-semibold text-green-600">{record.successCount}</span>
                                )
                            }
                        ]}
                        dataSource={newsList}
                        loading={loadingList}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                        locale={{ emptyText: 'Chưa có thông báo nào được phát đi.' }}
                        bordered
                    />
                </Card>
            </div>
        </div>
    );
};

export default AdminNewsPage;
