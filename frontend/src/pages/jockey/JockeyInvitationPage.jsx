import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, message, Card, Typography, Popconfirm, Row, Col } from 'antd';
import { FlagOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import api from "../../config/api.js";
import { useAuth } from '../../context/AuthContext';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const JockeyInvitationPage = () => {
    const { user } = useAuth();
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.id) fetchMyInvitations();
    }, [user?.id]);

    const fetchMyInvitations = async () => {
        setLoading(true);
        try {
            // Yêu cầu Backend phải có API này
            const response = await api.get('/invitations', { params: { jockeyId: user.id } });
            setInvitations(response.data);
        } catch (error) {
            message.error('Không thể tải danh sách lời mời!');
        } finally {
            setLoading(false);
        }
    };

    const handleRespond = async (invitationId, action) => {
        try {
            await api.put(`/invitations/${invitationId}/${action}`);
            message.success(action === 'accept' ? 'Đã NHẬN lời mời thi đấu!' : 'Đã TỪ CHỐI lời mời thi đấu!');
            fetchMyInvitations();
        } catch (error) {
            message.error(error.response?.data?.message || error.response?.data || 'Có lỗi xảy ra!');
        }
    };

    const statusMap = {
        PENDING: <Tag color="orange">Đang Chờ</Tag>,
        ACCEPTED: <Tag color="green">Đã Nhận Lệnh</Tag>,
        REJECTED: <Tag color="red">Đã Từ Chối</Tag>,
        CANCELED: <Tag color="default">Đã Hủy</Tag>
    };

    const columns = [
        { title: 'Chặng Đua', dataIndex: 'raceName', key: 'raceName', render: t => <Text strong className="text-blue-700">{t}</Text> },
        { title: 'Chiến Mã Điều Khiển', dataIndex: 'horseName', key: 'horseName', render: t => <Text strong>{t}</Text> },
        { title: 'Thời Gian Mời', dataIndex: 'invitedAt', render: v => dayjs(v).format('DD/MM/YYYY HH:mm') },
        { title: 'Trạng Thái', dataIndex: 'status', render: s => statusMap[s] },
        {
            title: 'Quyết Định',
            key: 'action',
            align: 'right',
            render: (_, record) => {
                if (record.status !== 'PENDING') return <Text type="secondary">Đã xử lý lúc {dayjs(record.respondedAt).format('HH:mm DD/MM')}</Text>;
                return (
                    <Space>
                        <Popconfirm title="Chắc chắn NHẬN chặng này?" onConfirm={() => handleRespond(record.id, 'accept')} okText="Nhận" cancelText="Hủy">
                            <Button type="primary" className="bg-green-500 hover:bg-green-600 border-none" icon={<CheckCircleOutlined />}>Đồng Ý</Button>
                        </Popconfirm>
                        <Popconfirm title="Từ chối lời mời này?" onConfirm={() => handleRespond(record.id, 'reject')} okText="Từ chối" okButtonProps={{ danger: true }} cancelText="Hủy">
                            <Button danger icon={<CloseCircleOutlined />}>Từ Chối</Button>
                        </Popconfirm>
                    </Space>
                );
            }
        }
    ];

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <Card className="shadow-xl rounded-2xl border-none">
                <Row justify="space-between" align="middle" className="mb-6">
                    <Col>
                        <Title level={2} className="m-0 flex items-center gap-3">
                            <FlagOutlined className="text-blue-600" /> Quản Lý Lời Mời Thi Đấu
                        </Title>
                        <Text type="secondary">Xét duyệt các yêu cầu thuê cưỡi chiến mã từ Chủ ngựa</Text>
                    </Col>
                </Row>
                <Table columns={columns} dataSource={invitations} rowKey="id" loading={loading} className="border border-gray-200 rounded-xl overflow-hidden" />
            </Card>
        </div>
    );
};

export default JockeyInvitationPage;