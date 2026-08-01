import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, message, Card, Typography, Modal, Form, Select, Row, Col, Alert, Tabs } from 'antd';
import { FlagOutlined, UserAddOutlined, SendOutlined, HistoryOutlined } from '@ant-design/icons';
import api from "../../config/api.js";
import dayjs from 'dayjs';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const OwnerRaceRegistrationPage = () => {
    const { user } = useAuth();
    const currentOwnerId = user?.id;

    const [races, setRaces] = useState([]);
    const [myHorses, setMyHorses] = useState([]);
    const [jockeys, setJockeys] = useState([]);
    const [loading, setLoading] = useState(false);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedRace, setSelectedRace] = useState(null);
    const [form] = Form.useForm();

    const [currentRaceRegistrations, setCurrentRaceRegistrations] = useState([]);
    const [invitations, setInvitations] = useState([]);

    const fetchAvailableRaces = async () => {
        setLoading(true);
        try {
            const response = await api.get('/races');
            // Chỉ lấy các chặng đua đang trong trạng thái ĐĂNG KÝ
            setRaces(response.data.filter(race => race.status === 'REGISTRATION'));
        } catch (error) { message.error('Không thể tải danh sách chặng đua!'); }
        finally { setLoading(false); }
    };

    const fetchInvitations = async () => {
        if (!currentOwnerId) return;
        try {
            const response = await api.get(`/invitations?ownerId=${currentOwnerId}`);
            setInvitations(response.data);
        } catch (error) {
            console.error('Lỗi tải danh sách lời mời:', error);
        }
    };

    useEffect(() => {
        fetchAvailableRaces();
        if (currentOwnerId) {
            fetchMyApprovedHorses(currentOwnerId);
            fetchInvitations();
        }
        fetchJockeys();
    }, [currentOwnerId]);

    const fetchMyApprovedHorses = async (ownerId) => {
        try {
            const response = await api.get('/horses', { params: { ownerId: ownerId } });
            setMyHorses(response.data.filter(horse => horse.status === 'APPROVED'));
        } catch (error) { console.error(error); }
    };

    const fetchJockeys = async () => {
        try {
            const response = await api.get('/users');
            const validJockeys = response.data.filter(u => 
                u.role === 'JOCKEY' && 
                u.weight != null && 
                u.height != null && 
                u.certDocumentUrls && u.certDocumentUrls.length > 0 && 
                u.healthDocumentUrls && u.healthDocumentUrls.length > 0
            );
            setJockeys(validJockeys);
        } catch (error) { console.error('Lỗi tải nài ngựa:', error); }
    };

    const fetchRaceRegistrations = async (raceId) => {
        try {
            const response = await api.get(`/registrations?raceId=${raceId}`);
            setCurrentRaceRegistrations(response.data);
        } catch (error) {
            console.error('Lỗi tải danh sách đăng ký:', error);
            setCurrentRaceRegistrations([]);
        }
    };

    const handleRegisterAndInvite = async (values) => {
        try {
            const regPayload = { raceId: selectedRace.id, horseId: values.horseId, ownerId: currentOwnerId };
            const regResponse = await api.post('/registrations', regPayload);

            const invitePayload = { registrationId: regResponse.data.id, jockeyId: values.jockeyId };
            await api.post('/invitations', invitePayload);

            message.success('Đã gửi đơn đăng ký và lời mời cho Nài ngựa thành công! 🏇');
            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            message.error(error.response?.data?.error || 'Có lỗi xảy ra khi xử lý!');
        }
    };

    const openInviteModal = (race) => {
        setSelectedRace(race);
        form.resetFields();
        fetchRaceRegistrations(race.id);
        setIsModalVisible(true);
    };

    const handleCancelInvitation = async (invitationId) => {
        try {
            await api.put(`/invitations/${invitationId}/cancel`);
            message.success('Đã hủy lời mời!');
            fetchInvitations();
        } catch (error) {
            message.error(error.response?.data?.error || 'Lỗi khi hủy lời mời');
        }
    };

    const [isReinviteModalVisible, setIsReinviteModalVisible] = useState(false);
    const [selectedRegistrationId, setSelectedRegistrationId] = useState(null);

    const openReinviteModal = (invitation) => {
        setSelectedRegistrationId(invitation.registrationId);
        form.resetFields();
        setIsReinviteModalVisible(true);
    };

    const handleReinvite = async (values) => {
        try {
            const invitePayload = { registrationId: selectedRegistrationId, jockeyId: values.jockeyId };
            await api.post('/invitations', invitePayload);
            message.success('Đã gửi lời mời mới cho Nài ngựa!');
            setIsReinviteModalVisible(false);
            fetchInvitations();
        } catch (error) {
            message.error(error.response?.data?.error || 'Có lỗi xảy ra khi xử lý!');
        }
    };

    const historyColumns = [
        { title: 'Tên Chiến Mã', dataIndex: 'horseName', render: text => <Text strong>{text}</Text> },
        { title: 'Chặng Đua', dataIndex: 'raceName' },
        { title: 'Nài Ngựa Được Mời', dataIndex: 'jockeyUsername' },
        { title: 'Trạng Thái', dataIndex: 'status', render: s => {
                if (s === 'PENDING') return <Tag color="orange">CHỜ XÁC NHẬN</Tag>;
                if (s === 'ACCEPTED') return <Tag color="green">ĐÃ ĐỒNG Ý</Tag>;
                if (s === 'REJECTED') return <Tag color="red">BỊ TỪ CHỐI</Tag>;
                if (s === 'CANCELED') return <Tag color="default">ĐÃ HỦY</Tag>;
                return <Tag>{s}</Tag>;
            }
        },
        {
            title: 'Hành Động', align: 'right', render: (_, record) => {
                if (record.status === 'PENDING') {
                    return <Button danger onClick={() => handleCancelInvitation(record.id)}>❌ Hủy Lời Mời</Button>;
                }
                if (record.status === 'REJECTED' || record.status === 'CANCELED') {
                    return <Button type="dashed" onClick={() => openReinviteModal(record)}>🔄 Mời Nài Khác</Button>;
                }
                return null;
            }
        }
    ];

    const columns = [
        { title: 'Tên Giải Đấu', dataIndex: 'tournamentName', render: text => <Text strong className="text-blue-700">{text}</Text> },
        { title: 'Tên Chặng', dataIndex: 'name' },
        { title: 'Giờ Xuất Phát', dataIndex: 'raceTime', render: v => <Text strong>{dayjs(v).format('DD/MM/YYYY HH:mm')}</Text> },
        { title: 'Trạng Thái', dataIndex: 'status', render: s => {
                if (s === 'REGISTRATION') return <Tag color="orange">ĐĂNG KÝ THI ĐẤU</Tag>;
                if (s === 'BETTING') return <Tag color="blue">NHẬN ĐẶT CƯỢC</Tag>;
                if (s === 'LOCK_SESSION') return <Tag color="gray">KHÓA NHẬN CƯỢC</Tag>;
                if (s === 'RUNNING') return <Tag color="red" className="animate-pulse">ĐANG THI ĐẤU</Tag>;
                if (s === 'COMPLETED') return <Tag color="green">ĐÃ KẾT THÚC</Tag>;
                if (s === 'CANCELED') return <Tag color="default">ĐÃ HỦY</Tag>;
                return <Tag>{s}</Tag>;
            }
        },
        {
            title: 'Thao Tác', align: 'right', render: (_, record) => (
                <Button type="primary" icon={<UserAddOutlined />} onClick={() => openInviteModal(record)}>Đăng ký & Gửi Lời Mời</Button>
            )
        }
    ];

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <Card className="shadow-xl rounded-2xl border-none">
                <Tabs defaultActiveKey="1" size="large">
                    <TabPane tab={<span className="font-bold text-lg"><FlagOutlined /> Đăng Ký Thi Đấu</span>} key="1">
                        <Row justify="space-between" align="middle" className="mb-4 mt-2">
                            <Col>
                                <Title level={3} className="m-0 text-red-500">Chặng Đua Sắp Diễn Ra</Title>
                                <Text type="secondary">Chọn giải và bắt cặp Nài ngựa cho chiến mã của bạn</Text>
                            </Col>
                        </Row>
                        <Table columns={columns} dataSource={races} rowKey="id" loading={loading} className="border border-gray-200" />
                    </TabPane>
                    <TabPane tab={<span className="font-bold text-lg"><HistoryOutlined /> Lịch Sử Lời Mời</span>} key="2">
                        <Row justify="space-between" align="middle" className="mb-4 mt-2">
                            <Col>
                                <Title level={3} className="m-0 text-blue-600">Trạng Thái Thỏa Thuận</Title>
                                <Text type="secondary">Theo dõi trạng thái các lời mời nài ngựa và xử lý khi bị từ chối</Text>
                            </Col>
                        </Row>
                        <Table columns={historyColumns} dataSource={invitations} rowKey="id" loading={loading} className="border border-gray-200" />
                    </TabPane>
                </Tabs>
            </Card>

            <Modal title={<span className="text-xl">Đăng ký: <span className="text-blue-600">{selectedRace?.name}</span></span>} open={isModalVisible} onCancel={() => setIsModalVisible(false)} footer={null} centered>
                <Form form={form} layout="vertical" onFinish={handleRegisterAndInvite}>
                    <Form.Item name="horseId" label={<Text strong>Chọn Chiến Mã</Text>} rules={[{ required: true }]}>
                        <Select placeholder="-- Chọn ngựa --" size="large">
                            {myHorses.map(horse => {
                                const isAlreadyRegistered = currentRaceRegistrations.some(reg => reg.horseId === horse.id);
                                return (
                                    <Option key={horse.id} value={horse.id} disabled={isAlreadyRegistered}>
                                        {horse.name} {isAlreadyRegistered ? <span className="text-red-500 font-bold ml-2">(Đã được chọn để thi đấu)</span> : <span className="text-green-600 ml-2">(Sẵn sàng)</span>}
                                    </Option>
                                );
                            })}
                        </Select>
                    </Form.Item>

                    <Form.Item name="jockeyId" label={<Text strong>Hợp Đồng Nài Ngựa Theo Chặng</Text>} rules={[{ required: true }]}>
                        <Select placeholder="-- Tìm và chọn nài ngựa --" size="large" showSearch optionFilterProp="children">
                            {jockeys.map(jockey => (
                                <Option key={jockey.id} value={jockey.id}>
                                    <div className="flex justify-between w-full">
                                        <Text strong>{jockey.username}</Text>
                                        <Text type="secondary">⚖️ {jockey.weight}kg | 📏 {jockey.height}cm</Text>
                                    </div>
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Button type="primary" htmlType="submit" size="large" block icon={<SendOutlined />} className="bg-blue-600 hover:bg-blue-700">CHỐT DANH SÁCH & GỬI LỜI MỜI</Button>
                </Form>
            </Modal>

            <Modal title={<span className="text-xl text-blue-600">🔄 Mời Nài Ngựa Thay Thế</span>} open={isReinviteModalVisible} onCancel={() => setIsReinviteModalVisible(false)} footer={null} centered>
                <Alert message="Lưu ý" description="Bạn đang gửi lời mời thay thế cho nài ngựa khác trên cùng đơn đăng ký cũ." type="info" showIcon className="mb-4" />
                <Form form={form} layout="vertical" onFinish={handleReinvite}>
                    <Form.Item name="jockeyId" label={<Text strong>Chọn Nài Ngựa Mới</Text>} rules={[{ required: true, message: 'Vui lòng chọn nài ngựa!' }]}>
                        <Select placeholder="-- Tìm và chọn nài ngựa --" size="large" showSearch optionFilterProp="children">
                            {jockeys.map(jockey => (
                                <Option key={jockey.id} value={jockey.id}>
                                    <div className="flex justify-between w-full">
                                        <Text strong>{jockey.username}</Text>
                                        <Text type="secondary">⚖️ {jockey.weight}kg | 📏 {jockey.height}cm</Text>
                                    </div>
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Button type="primary" htmlType="submit" size="large" block icon={<SendOutlined />} className="bg-blue-600 hover:bg-blue-700">GỬI LỜI MỜI</Button>
                </Form>
            </Modal>
        </div>
    );
};

export default OwnerRaceRegistrationPage;