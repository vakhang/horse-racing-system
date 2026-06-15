import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, message, Card, Typography, Modal, Form, Input, InputNumber, Popconfirm, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, AppstoreAddOutlined } from '@ant-design/icons';
import api from "../../config/api.js";
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

const OwnerHorseManagementPage = () => {
    const { user } = useAuth();
    const currentOwnerId = user?.id;

    const [horses, setHorses] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modal state
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingHorseId, setEditingHorseId] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        if (currentOwnerId) {
            fetchMyHorses();
        }
    }, [currentOwnerId]);

    // LẤY DANH SÁCH NGỰA CỦA CHỦ
    const fetchMyHorses = async () => {
        setLoading(true);
        try {
            const response = await api.get('/horses', {
                params: { ownerId: currentOwnerId }
            });
            setHorses(response.data);
        } catch (error) {
            message.error('Không thể tải danh sách ngựa!');
        } finally {
            setLoading(false);
        }
    };

    // THÊM HOẶC CẬP NHẬT NGỰA
    const handleSaveHorse = async (values) => {
        try {
            // Payload đẩy lên Backend (Khớp với HorseRequestDTO sếp đưa)
            const payload = {
                ownerId: currentOwnerId,
                name: values.name,
                age: values.age,
                breed: values.breed,
                color: values.color,
                documentUrl: values.documentUrl,
                // Không truyền status để Backend tự set mặc định là PENDING
            };

            if (editingHorseId) {
                await api.put(`/horses/${editingHorseId}`, payload);
                message.success('Cập nhật thông tin ngựa thành công!');
            } else {
                await api.post('/horses', payload);
                message.success('Thêm ngựa mới thành công! Đang chờ Admin duyệt. 🐴');
            }

            setIsModalVisible(false);
            form.resetFields();
            fetchMyHorses();
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin!');
        }
    };

    // XÓA NGỰA
    const handleDelete = async (horseId) => {
        try {
            await api.delete(`/horses/${horseId}`);
            message.success('Đã xóa chiến mã khỏi chuồng!');
            fetchMyHorses();
        } catch (error) {
            message.error('Không thể xóa ngựa này (có thể ngựa đang tham gia giải đấu).');
        }
    };

    // MỞ MODAL THÊM/SỬA
    const openModal = (record = null) => {
        if (record) {
            setEditingHorseId(record.id);
            form.setFieldsValue(record);
        } else {
            setEditingHorseId(null);
            form.resetFields();
        }
        setIsModalVisible(true);
    };

    // TÔ MÀU TRẠNG THÁI
    const getStatusTag = (status) => {
        switch (status) {
            case 'APPROVED': return <Tag color="green">Đã Duyệt</Tag>;
            case 'REJECTED': return <Tag color="red">Từ Chối</Tag>;
            default: return <Tag color="orange">Chờ Duyệt</Tag>;
        }
    };

    const columns = [
        { title: 'Tên Chiến Mã', dataIndex: 'name', key: 'name', render: text => <Text strong>{text}</Text> },
        { title: 'Tuổi', dataIndex: 'age', key: 'age' },
        { title: 'Giống', dataIndex: 'breed', key: 'breed' },
        { title: 'Màu Lông', dataIndex: 'color', key: 'color' },
        { title: 'Trạng Thái', dataIndex: 'status', key: 'status', render: status => getStatusTag(status) },
        {
            title: 'Thao Tác',
            key: 'action',
            align: 'right',
            render: (_, record) => (
                <Space>
                    <Button size="small" icon={<EditOutlined />} onClick={() => openModal(record)}>Sửa</Button>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa ngựa này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <Card className="shadow-xl rounded-2xl border-none">
                <Row justify="space-between" align="middle" className="mb-6">
                    <Col>
                        <Title level={2} className="m-0 flex items-center gap-3">
                            <AppstoreAddOutlined className="text-blue-500"/> Quản Lý Chiến Mã
                        </Title>
                        <Text type="secondary">Thêm và cập nhật hồ sơ ngựa để Admin xét duyệt thi đấu</Text>
                    </Col>
                    <Col>
                        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => openModal()}>
                            Thêm Ngựa Mới
                        </Button>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={horses}
                    rowKey="id"
                    loading={loading}
                    className="overflow-hidden rounded-xl border border-gray-200"
                />
            </Card>

            <Modal
                title={<span className="text-xl">{editingHorseId ? 'Cập Nhật Thông Tin Ngựa' : 'Thêm Chiến Mã Mới'}</span>}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                centered
            >
                <Form form={form} layout="vertical" onFinish={handleSaveHorse} className="mt-4">
                    <Form.Item name="name" label={<Text strong>Tên Ngựa</Text>} rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
                        <Input placeholder="VD: Xích Thố..." size="large" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="age" label={<Text strong>Tuổi</Text>} rules={[{ required: true, message: 'Vui lòng nhập tuổi!' }]}>
                                <InputNumber min={1} max={30} className="w-full" size="large" placeholder="VD: 5" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="color" label={<Text strong>Màu Lông</Text>} rules={[{ required: true, message: 'Vui lòng nhập màu lông!' }]}>
                                <Input placeholder="VD: Nâu đỏ" size="large" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="breed" label={<Text strong>Giống Ngựa</Text>} rules={[{ required: true, message: 'Vui lòng nhập giống ngựa!' }]}>
                        <Input placeholder="VD: Ngựa Ả Rập" size="large" />
                    </Form.Item>

                    <Form.Item name="documentUrl" label={<Text strong>Đường dẫn Hồ sơ/Giấy tờ (Link Google Drive/Ảnh)</Text>}>
                        <Input placeholder="Nhập link tài liệu chứng minh sức khỏe..." size="large" />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" size="large" block className="mt-4 bg-blue-600 hover:bg-blue-700">
                        {editingHorseId ? 'LƯU CẬP NHẬT' : 'THÊM VÀO CHUỒNG'}
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};

export default OwnerHorseManagementPage;