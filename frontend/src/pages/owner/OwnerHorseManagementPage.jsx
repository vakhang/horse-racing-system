import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, message, Card, Typography, Modal, Form, Input, InputNumber, Popconfirm, Row, Col, Progress, Upload } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, AppstoreAddOutlined, HistoryOutlined, UploadOutlined } from '@ant-design/icons';
import api from "../../config/api.js";
import { useAuth } from '../../context/AuthContext';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const RenderFilesStatus = ({ urls }) => {
    if (!urls || urls.length === 0) return <Tag color="red" className="m-0">Chưa nộp</Tag>;
    return <Tag color="green">Đã nộp ({urls.length} tệp)</Tag>;
};

const OwnerHorseManagementPage = () => {
    const { user } = useAuth();
    const currentOwnerId = user?.id;

    const [horses, setHorses] = useState([]);
    const [loading, setLoading] = useState(false);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);
    const [selectedHorseHistory, setSelectedHorseHistory] = useState(null);
    const [editingHorseId, setEditingHorseId] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        if (currentOwnerId) fetchMyHorses();
    }, [currentOwnerId]);

    const fetchMyHorses = async () => {
        setLoading(true);
        try {
            const response = await api.get('/horses', { params: { ownerId: currentOwnerId } });
            setHorses(response.data);
        } catch (error) { message.error('Không thể tải danh sách ngựa!'); }
        finally { setLoading(false); }
    };

    const normFile = (e) => {
        if (Array.isArray(e)) return e;
        return e?.fileList;
    };

    const handleSaveHorse = async (values) => {
        try {
            const formData = new FormData();
            formData.append('ownerId', currentOwnerId);
            formData.append('name', values.name);
            formData.append('age', values.age);
            formData.append('breed', values.breed);
            formData.append('color', values.color);

            if (values.realImageFiles && values.realImageFiles.length > 0) {
                values.realImageFiles.forEach(f => formData.append('realImageFiles', f.originFileObj));
            }
            if (values.certFiles && values.certFiles.length > 0) {
                values.certFiles.forEach(f => formData.append('certFiles', f.originFileObj));
            }
            if (values.vetRecordFiles && values.vetRecordFiles.length > 0) {
                values.vetRecordFiles.forEach(f => formData.append('vetRecordFiles', f.originFileObj));
            }

            if (editingHorseId) {
                await api.put(`/horses/${editingHorseId}`, formData);
                message.success('Cập nhật thông tin ngựa thành công!');
            } else {
                await api.post('/horses', formData);
                message.success('Gửi hồ sơ chiến mã thành công! Đang chờ Admin duyệt.');
            }
            setIsModalVisible(false);
            form.resetFields();
            fetchMyHorses();
        } catch (error) { message.error('Có lỗi xảy ra khi lưu thông tin!'); }
    };

    const handleDelete = async (horseId) => {
        try {
            await api.delete(`/horses/${horseId}`);
            message.success('Đã xóa chiến mã khỏi chuồng!');
            fetchMyHorses();
        } catch (error) { message.error('Không thể xóa ngựa này (có thể ngựa đang tham gia giải đấu).'); }
    };

    const openModal = (record = null) => {
        if (record) { setEditingHorseId(record.id); form.setFieldsValue(record); }
        else { setEditingHorseId(null); form.resetFields(); }
        setIsModalVisible(true);
    };

    const openHistory = (horse) => {
        let mockHistory = [];
        const total = horse.totalRaces || 0;
        const wins = horse.winRaces || 0;

        for(let i = 0; i < total; i++) {
            mockHistory.push({
                id: i,
                date: dayjs().subtract(i * 7 + 2, 'day').format('DD/MM/YYYY'),
                tournament: i < wins ? 'Siêu Cúp Hoàng Gia' : 'Cúp Giao Hữu Mùa Hè',
                rank: i < wins ? 1 : Math.floor(Math.random() * 5) + 2,
                prize: i < wins ? '50,000,000 VNĐ' : '0 VNĐ'
            });
        }
        setSelectedHorseHistory({ horse, data: mockHistory });
        setIsHistoryVisible(true);
    };

    const columns = [
        { title: 'Tên Chiến Mã', dataIndex: 'name', key: 'name', render: text => <Text strong className="text-blue-700 text-lg">{text}</Text> },
        { title: 'Thông Số', render: (_, r) => (
                <Space direction="vertical" size="small">
                    <Text>Tuổi: {r.age} | Giống: {r.breed}</Text>
                    <Text>Win Rate: <Text strong type="success">{r.winRate ? r.winRate.toFixed(1) : 0}%</Text> ({r.winRaces || 0}/{r.totalRaces || 0} Trận)</Text>
                </Space>
            )},
        { title: 'Thể Lực', render: (_, r) => {
                const lastRaced = localStorage.getItem(`horse_last_raced_${r.id}`);
                let stamina = 100;
                if (lastRaced) {
                    const hoursPassed = dayjs().diff(dayjs(lastRaced), 'hour');
                    stamina = Math.min(100, Math.max(20, hoursPassed * 2));
                }
                return <Progress percent={stamina} size="small" status={stamina < 50 ? 'exception' : 'active'} format={p => `${p}%`} />;
            }},
        { title: 'Sổ Khám Bệnh', render: (_, r) => <RenderFilesStatus urls={r.vetRecordUrls} /> },
        { title: 'Trạng Thái', dataIndex: 'status', render: s => s === 'APPROVED' ? <Tag color="green">ĐÃ DUYỆT</Tag> : (s === 'REJECTED' ? <Tag color="red">TỪ CHỐI</Tag> : <Tag color="orange">CHỜ XỬ LÝ</Tag>) },
        {
            title: 'Thao Tác', align: 'right', render: (_, record) => (
                <Space>
                    <Button size="small" icon={<HistoryOutlined />} onClick={() => openHistory(record)}>Lịch sử</Button>
                    <Button size="small" icon={<EditOutlined />} onClick={() => openModal(record)}>Sửa</Button>
                    <Popconfirm title="Xóa ngựa này?" onConfirm={() => handleDelete(record.id)} okText="Xóa" okButtonProps={{ danger: true }} cancelText="Hủy">
                        <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const historyColumns = [
        { title: 'Ngày Đua', dataIndex: 'date' },
        { title: 'Giải Đấu', dataIndex: 'tournament', render: t => <Text strong>{t}</Text> },
        { title: 'Thứ Hạng', dataIndex: 'rank', render: r => r === 1 ? <Tag color="gold" className="font-bold">TOP 1 🏆</Tag> : <Tag>Hạng {r}</Tag> },
        { title: 'Tiền Thưởng', dataIndex: 'prize', render: p => <Text type="success" strong>{p}</Text> },
    ];

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <Card className="shadow-xl rounded-2xl border-none">
                <Row justify="space-between" align="middle" className="mb-6">
                    <Col>
                        <Title level={2} className="m-0 flex items-center gap-3"><AppstoreAddOutlined className="text-blue-500"/> Quản Lý Chiến Mã</Title>
                        <Text type="secondary">Theo dõi thể lực, lịch sử thi đấu và cập nhật hồ sơ ngựa</Text>
                    </Col>
                    <Col><Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => openModal()}>Thêm Ngựa Mới</Button></Col>
                </Row>
                <Table columns={columns} dataSource={horses} rowKey="id" loading={loading} className="overflow-hidden rounded-xl border border-gray-200" />
            </Card>

            <Modal title={<span className="text-xl">{editingHorseId ? 'Cập Nhật Hồ Sơ' : 'Khai Báo Chiến Mã Mới'}</span>} open={isModalVisible} onCancel={() => setIsModalVisible(false)} footer={null} centered>
                <Form form={form} layout="vertical" onFinish={handleSaveHorse} className="mt-4">
                    <Form.Item name="name" label={<Text strong>Tên Ngựa</Text>} rules={[{ required: true, message: 'Vui lòng nhập tên chiến mã!' }]}><Input size="large" /></Form.Item>
                    <Row gutter={16}>
                        <Col span={12}><Form.Item name="age" label={<Text strong>Tuổi</Text>} rules={[{ required: true, message: 'Vui lòng nhập tuổi ngựa!' }]}><InputNumber className="w-full" size="large" /></Form.Item></Col>
                        <Col span={12}><Form.Item name="color" label={<Text strong>Màu Lông</Text>} rules={[{ required: true, message: 'Vui lòng nhập màu lông!' }]}><Input size="large" /></Form.Item></Col>
                    </Row>
                    <Form.Item name="breed" label={<Text strong>Giống Ngựa</Text>} rules={[{ required: true, message: 'Vui lòng nhập giống ngựa!' }]}><Input size="large" /></Form.Item>

                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 mb-4">
                        <Title level={5} className="text-blue-700">Tài Liệu Đính Kèm (Upload)</Title>

                        <Form.Item name="realImageFiles" label="Ảnh Thực Tế Chiến Mã" valuePropName="fileList" getValueFromEvent={normFile} rules={[{ required: !editingHorseId, message: 'Bắt buộc tải lên ảnh thực tế chiến mã!' }]}>
                            <Upload multiple beforeUpload={() => false} listType="picture"><Button icon={<UploadOutlined />}>Tải Lên Ảnh</Button></Upload>
                        </Form.Item>

                        <Form.Item name="certFiles" label="Giấy Chứng Nhận Nguồn Gốc" valuePropName="fileList" getValueFromEvent={normFile} rules={[{ required: !editingHorseId, message: 'Bắt buộc tải lên giấy chứng nhận!' }]}>
                            <Upload multiple beforeUpload={() => false}><Button icon={<UploadOutlined />}>Tải Lên Giấy Tờ</Button></Upload>
                        </Form.Item>

                        <Form.Item name="vetRecordFiles" label="Sổ Tiêm Phòng/Khám Bệnh" valuePropName="fileList" getValueFromEvent={normFile} rules={[{ required: !editingHorseId, message: 'Bắt buộc tải lên sổ y tế!' }]}>
                            <Upload multiple beforeUpload={() => false}><Button icon={<UploadOutlined />}>Tải Lên Hồ Sơ Thú Y</Button></Upload>
                        </Form.Item>
                    </div>

                    <Button type="primary" htmlType="submit" size="large" block className="mt-4 bg-blue-600 hover:bg-blue-700">
                        {editingHorseId ? 'LƯU CẬP NHẬT' : 'GỬI HỒ SƠ DUYỆT CHIẾN MÃ'}
                    </Button>
                </Form>
            </Modal>

            <Modal title={<span className="text-xl font-bold">Lịch Sử Thi Đấu: <span className="text-blue-600">{selectedHorseHistory?.horse?.name}</span></span>} open={isHistoryVisible} onCancel={() => setIsHistoryVisible(false)} footer={null} width={700} centered>
                {selectedHorseHistory?.data?.length > 0 ? (
                    <Table columns={historyColumns} dataSource={selectedHorseHistory.data} rowKey="id" pagination={false} className="mt-4" />
                ) : (
                    <div className="text-center py-10"><Text className="text-gray-500">Chiến mã này chưa tham gia giải đấu nào.</Text></div>
                )}
            </Modal>
        </div>
    );
};

export default OwnerHorseManagementPage;