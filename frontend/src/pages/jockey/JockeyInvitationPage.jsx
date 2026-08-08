import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, message, Card, Typography, Popconfirm, Row, Col, Tabs, Modal, Form, Input, Select, Alert } from 'antd';
import { FlagOutlined, CheckCircleOutlined, CloseCircleOutlined, CalendarOutlined, FileExclamationOutlined, SendOutlined } from '@ant-design/icons';
import api from "../../config/api.js";
import { useAuth } from '../../context/AuthContext';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

// [Chức năng rõ ràng]: Portal Quản lý Thi đấu & Lời mời dành cho Nài Ngựa (Jockey)
// [Tác dụng]:
// 1. Quản lý lời mời thi đấu (Chấp nhận / Từ chối). Hệ thống tự động kiểm tra trùng giờ.
// 2. Theo dõi lịch trình thi đấu cá nhân và kết quả thứ hạng các chặng đua đã tham gia.
// 3. Nộp đơn Kháng cáo nếu không đồng ý với kết quả do Trọng tài công bố.
const JockeyInvitationPage = () => {
    const { user } = useAuth();
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(false);

    // States cho Kháng cáo
    const [appeals, setAppeals] = useState([]);
    const [isAppealModalOpen, setIsAppealModalOpen] = useState(false);
    const [appealForm] = Form.useForm();
    const [submittingAppeal, setSubmittingAppeal] = useState(false);

    useEffect(() => {
        if (user?.id) {
            fetchMyInvitations();
            fetchMyAppeals();
        }
    }, [user?.id]);

    const fetchMyInvitations = async () => {
        setLoading(true);
        try {
            const response = await api.get('/invitations', { params: { jockeyId: user.id } });
            setInvitations(response.data || []);
        } catch (error) {
            message.error('Không thể tải danh sách lời mời!');
        } finally {
            setLoading(false);
        }
    };

    const fetchMyAppeals = async () => {
        try {
            const savedAppeals = JSON.parse(localStorage.getItem(`jockey_appeals_${user.id}`) || '[]');
            setAppeals(savedAppeals);
        } catch (error) {
            console.error('Lỗi tải danh sách kháng cáo:', error);
        }
    };

    const handleRespond = async (invitationId, action) => {
        try {
            await api.put(`/invitations/${invitationId}/${action}`);
            message.success(action === 'accept' ? 'Đã NHẬN lời mời thi đấu thành công!' : 'Đã TỪ CHỐI lời mời thi đấu!');
            fetchMyInvitations();
        } catch (error) {
            const errData = error.response?.data;
            const errorMsg = errData?.error || errData?.message || (typeof errData === 'string' ? errData : 'Có lỗi xảy ra!');
            message.error(errorMsg);
        }
    };

    const handleCreateAppeal = async (values) => {
        setSubmittingAppeal(true);
        try {
            const selectedInv = invitations.find(i => i.id === values.invitationId);
            const newAppeal = {
                id: Date.now(),
                jockeyId: user.id,
                jockeyName: user.username,
                tournamentName: selectedInv?.tournamentName || 'Giải đấu',
                raceName: selectedInv?.raceName || 'Chặng đua',
                horseName: selectedInv?.horseName || 'Chiến mã',
                reason: values.reason,
                evidence: values.evidence || 'Không có',
                status: 'PENDING',
                createdAt: new Date().toISOString()
            };

            const existing = JSON.parse(localStorage.getItem('all_system_appeals') || '[]');
            existing.push(newAppeal);
            localStorage.setItem('all_system_appeals', JSON.stringify(existing));

            const mySaved = JSON.parse(localStorage.getItem(`jockey_appeals_${user.id}`) || '[]');
            mySaved.push(newAppeal);
            localStorage.setItem(`jockey_appeals_${user.id}`, JSON.stringify(mySaved));

            setAppeals(mySaved);
            message.success('Đã nộp đơn kháng cáo! Admin và Ban tổ chức sẽ kiểm duyệt.');
            setIsAppealModalOpen(false);
            appealForm.resetFields();
        } catch (error) {
            message.error('Lỗi gửi đơn kháng cáo!');
        } finally {
            setSubmittingAppeal(false);
        }
    };

    const statusMap = {
        PENDING: <Tag color="orange">CHỜ XỬ LÝ</Tag>,
        ACCEPTED: <Tag color="green">ĐÃ ĐỒNG Ý</Tag>,
        REJECTED: <Tag color="red">TỪ CHỐI</Tag>,
        CANCELED: <Tag color="default">ĐÃ HỦY</Tag>
    };

    // 1. Cột bảng Lời mời
    const invitationColumns = [
        { title: 'Giải Đấu', dataIndex: 'tournamentName', key: 'tournamentName', render: t => <Text strong className="text-yellow-500">{t}</Text> },
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
                        <Popconfirm title="Chắc chắn NHẬN chặng này? (Hệ thống sẽ kiểm tra trùng lịch)" onConfirm={() => handleRespond(record.id, 'accept')} okText="Nhận" cancelText="Hủy">
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

    // 2. Cột bảng Lịch thi đấu cá nhân đã nhận lời
    const acceptedInvitations = invitations.filter(i => i.status === 'ACCEPTED');
    const scheduleColumns = [
        { title: 'Giải Đấu', dataIndex: 'tournamentName', render: t => <Text strong className="text-yellow-500">{t}</Text> },
        { title: 'Chặng Đua', dataIndex: 'raceName', render: t => <Text strong className="text-blue-700">{t}</Text> },
        { title: 'Chiến Mã Cưỡi', dataIndex: 'horseName', render: t => <Text strong>{t}</Text> },
        { title: 'Giờ Thi Đấu', dataIndex: 'invitedAt', render: v => dayjs(v).format('DD/MM/YYYY HH:mm') },
        { title: 'Trạng Thái Chặng', render: () => <Tag color="blue">SẴN SÀNG THI ĐẤU</Tag> },
        {
            title: 'Thù Lao & Giải Thưởng',
            render: () => <Text className="text-gray-500 italic">Nhận trực tiếp ngoài thực tế từ Chủ ngựa / BTC</Text>
        }
    ];

    // 3. Cột bảng Kháng cáo
    const appealColumns = [
        { title: 'Mã Đơn', dataIndex: 'id', render: id => <Text type="secondary">#{id}</Text> },
        { title: 'Giải Đấu', dataIndex: 'tournamentName', render: t => <Text strong className="text-yellow-500">{t}</Text> },
        { title: 'Chặng Đua', dataIndex: 'raceName', render: t => <Text strong>{t}</Text> },
        { title: 'Chiến Mã', dataIndex: 'horseName' },
        { title: 'Lý Do Kháng Cáo', dataIndex: 'reason' },
        {
            title: 'Trạng Thái',
            dataIndex: 'status',
            render: s => s === 'APPROVED' ? <Tag color="green">ĐÃ CHẤP NHẬN (ĐIỀU CHỈNH KQ)</Tag> : s === 'REJECTED' ? <Tag color="red">ĐÃ BÁC BỎ</Tag> : <Tag color="orange">ĐANG XEM XÉT</Tag>
        },
        { title: 'Thời Gian Gửi', dataIndex: 'createdAt', render: d => dayjs(d).format('DD/MM/YYYY HH:mm') }
    ];

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <Card className="shadow-xl rounded-2xl border-none">
                <Row justify="space-between" align="middle" className="mb-6">
                    <Col>
                        <Title level={2} className="m-0 flex items-center gap-3">
                            <FlagOutlined className="text-blue-600" /> Portal Nài Ngựa (Jockey)
                        </Title>
                        <Text type="secondary">Quản lý lời mời cưỡi ngựa, lịch thi đấu cá nhân và gửi đơn kháng cáo kết quả</Text>
                    </Col>
                    <Col>
                        <Button type="primary" danger icon={<FileExclamationOutlined />} onClick={() => setIsAppealModalOpen(true)} className="font-bold">
                            NỘP ĐƠN KHÁNG CÁO
                        </Button>
                    </Col>
                </Row>

                <Tabs size="large" items={[
                    {
                        key: '1',
                        label: <span className="font-bold"><FlagOutlined /> Quản Lý Lời Mời ({invitations.filter(i => i.status === 'PENDING').length})</span>,
                        children: <Table columns={invitationColumns} dataSource={invitations} rowKey="id" loading={loading} className="border border-gray-200 rounded-xl overflow-hidden" />
                    },
                    {
                        key: '2',
                        label: <span className="font-bold"><CalendarOutlined /> Lịch Trình Thi Đấu Cá Nhân ({acceptedInvitations.length})</span>,
                        children: <Table columns={scheduleColumns} dataSource={acceptedInvitations} rowKey="id" className="border border-gray-200 rounded-xl overflow-hidden" locale={{ emptyText: 'Bạn chưa chấp nhận chặng đua nào.' }} />
                    },
                    {
                        key: '3',
                        label: <span className="font-bold"><FileExclamationOutlined /> Nhật Ký Kháng Cáo ({appeals.length})</span>,
                        children: <Table columns={appealColumns} dataSource={appeals} rowKey="id" className="border border-gray-200 rounded-xl overflow-hidden" locale={{ emptyText: 'Chưa có đơn kháng cáo nào.' }} />
                    }
                ]} />
            </Card>

            {/* MODAL NỘP ĐƠN KHÁNG CÁO */}
            <Modal
                title={<span className="text-xl text-red-600 font-bold"><FileExclamationOutlined /> Gửi Đơn Kháng Cáo Kết Quả Thi Đấu</span>}
                open={isAppealModalOpen}
                onCancel={() => setIsAppealModalOpen(false)}
                footer={null}
                centered
            >
                <Alert message="Quy định Kháng cáo" description="Đơn kháng cáo của bạn sẽ được chuyển thẳng tới Ban Trọng Tài và Admin xem xét. Hãy nêu rõ lý do và sự cố diễn ra trên đường đua." type="warning" showIcon className="mb-4" />
                
                <Form form={appealForm} layout="vertical" onFinish={handleCreateAppeal}>
                    <Form.Item name="invitationId" label={<Text strong>Chọn Chặng Đua Cần Kháng Cáo</Text>} rules={[{ required: true, message: 'Vui lòng chọn chặng đua!' }]}>
                        <Select placeholder="-- Chọn chặng đua bạn đã tham gia --" size="large">
                            {acceptedInvitations.map(inv => (
                                <Select.Option key={inv.id} value={inv.id}>
                                    {inv.raceName} (Chiến mã: {inv.horseName})
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="reason" label={<Text strong>Lý Do Kháng Cáo</Text>} rules={[{ required: true, message: 'Vui lòng điền chi tiết lý do!' }]}>
                        <Input.TextArea rows={4} placeholder="Mô tả sự cố (VD: Ngựa đối thủ chèn ép phạm quy, sai sót tính thời gian về đích...)" />
                    </Form.Item>

                    <Form.Item name="evidence" label={<Text strong>Bằng Chứng Kèm Theo (Ghi chú / Link video / ảnh)</Text>}>
                        <Input placeholder="Ghi chú thời điểm xảy ra sự cố trên camera vạch đích..." />
                    </Form.Item>

                    <Button type="primary" danger htmlType="submit" size="large" block loading={submittingAppeal} icon={<SendOutlined />} className="font-bold h-12">
                        GỬI ĐƠN KHÁNG CÁO LÊN BTC
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};

export default JockeyInvitationPage;