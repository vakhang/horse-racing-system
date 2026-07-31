import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, message, Card, Typography, Modal, Form, Select, Row, Col, Alert } from 'antd';
import { FlagOutlined, UserAddOutlined, SendOutlined } from '@ant-design/icons';
import api from "../../config/api.js";
import dayjs from 'dayjs';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;
const { Option } = Select;

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

    useEffect(() => {
        fetchAvailableRaces();
        if (currentOwnerId) fetchMyApprovedHorses(currentOwnerId);
        fetchJockeys();
    }, [currentOwnerId]);

    const fetchAvailableRaces = async () => {
        setLoading(true);
        try {
            const response = await api.get('/races');
            // Chỉ lấy các chặng đua đang trong trạng thái ĐĂNG KÝ
            setRaces(response.data.filter(race => race.status === 'REGISTRATION'));
        } catch (error) { message.error('Không thể tải danh sách chặng đua!'); }
        finally { setLoading(false); }
    };

    const fetchMyApprovedHorses = async (ownerId) => {
        try {
            const response = await api.get('/horses', { params: { ownerId: ownerId } });
            setMyHorses(response.data.filter(horse => horse.status === 'APPROVED'));
        } catch (error) { console.error(error); }
    };

    const fetchJockeys = async () => {
        try {
            const response = await api.get('/users');
            const onlyJockeys = response.data.filter(u => u.role === 'JOCKEY');
            const jockeysWithStats = onlyJockeys.map(j => ({
                ...j,
                weight: Math.floor(Math.random() * (65 - 55 + 1) + 55) + 'kg',
                winRate: Math.floor(Math.random() * (80 - 40 + 1) + 40) + '%'
            }));
            setJockeys(jockeysWithStats);
        } catch (error) { console.error('Lỗi tải nài ngựa:', error); }
    };

    const handleRegisterAndInvite = async (values) => {
        try {
            const regPayload = { raceId: selectedRace.id, horseId: values.horseId, ownerId: currentOwnerId };
            const regResponse = await api.post('/registrations', regPayload);

            const invitePayload = { registrationId: regResponse.data.id, jockeyId: values.jockeyId };
            await api.post('/invitations', invitePayload);

            // THUẬT TOÁN ĐÁNH DẤU THỂ LỰC VÀO MÁY
            localStorage.setItem(`horse_last_raced_${values.horseId}`, selectedRace.raceTime);

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
        setIsModalVisible(true);
    };

    // KIỂM TRA THỂ LỰC (FATIGUE CHECK)
    const checkFatigue = (horseId, targetRaceTime) => {
        const lastRaced = localStorage.getItem(`horse_last_raced_${horseId}`);
        if (!lastRaced) return { isTired: false };
        const hoursDiff = Math.abs(dayjs(targetRaceTime).diff(dayjs(lastRaced), 'hour'));
        return { isTired: hoursDiff < 24, hours: hoursDiff }; // Nghỉ dưới 24 tiếng là mệt
    };

    const columns = [
        { title: 'Tên Giải Đấu', dataIndex: 'tournamentName', render: text => <Text strong className="text-blue-700">{text}</Text> },
        { title: 'Tên Chặng', dataIndex: 'name' },
        { title: 'Giờ Xuất Phát', dataIndex: 'raceTime', render: v => <Text strong>{dayjs(v).format('DD/MM/YYYY HH:mm')}</Text> },
        { title: 'Trạng Thái', dataIndex: 'status', render: s => <Tag color="orange">{s}</Tag> },
        {
            title: 'Thao Tác', align: 'right', render: (_, record) => (
                <Button type="primary" icon={<UserAddOutlined />} onClick={() => openInviteModal(record)}>Đăng ký & Gửi Lời Mời</Button>
            )
        }
    ];

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <Card className="shadow-xl rounded-2xl border-none">
                <Row justify="space-between" align="middle" className="mb-6">
                    <Col>
                        <Title level={2} className="m-0 flex items-center gap-3"><FlagOutlined className="text-red-500"/> Chặng Đua Sắp Diễn Ra</Title>
                        <Text type="secondary">Chọn giải và bắt cặp Nài ngựa cho chiến mã của bạn</Text>
                    </Col>
                </Row>
                <Table columns={columns} dataSource={races} rowKey="id" loading={loading} className="border border-gray-200" />
            </Card>

            <Modal title={<span className="text-xl">Đăng ký: <span className="text-blue-600">{selectedRace?.name}</span></span>} open={isModalVisible} onCancel={() => setIsModalVisible(false)} footer={null} centered>
                <Alert message="Luật thi đấu" description="Chiến mã cần được nghỉ ngơi ít nhất 24 giờ giữa 2 chặng đua để đảm bảo an toàn." type="info" showIcon className="mb-4" />
                <Form form={form} layout="vertical" onFinish={handleRegisterAndInvite}>
                    <Form.Item name="horseId" label={<Text strong>Chọn Chiến Mã Đạt Thể Lực</Text>} rules={[{ required: true }]}>
                        <Select placeholder="-- Chọn ngựa --" size="large">
                            {myHorses.map(horse => {
                                const fatigue = checkFatigue(horse.id, selectedRace?.raceTime);
                                return (
                                    <Option key={horse.id} value={horse.id} disabled={fatigue.isTired}>
                                        {horse.name} {fatigue.isTired ? <span className="text-red-500 font-bold ml-2">(⚠️ Đang hồi thể lực)</span> : <span className="text-green-600 ml-2">(Sẵn sàng)</span>}
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
                                        <Text type="secondary">⚖️ {jockey.weight} | 🏆 Win: {jockey.winRate}</Text>
                                    </div>
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Button type="primary" htmlType="submit" size="large" block icon={<SendOutlined />} className="bg-blue-600 hover:bg-blue-700">CHỐT DANH SÁCH & GỬI LỜI MỜI</Button>
                </Form>
            </Modal>
        </div>
    );
};

export default OwnerRaceRegistrationPage;