import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, message, Card, Typography, Modal, Form, Select, Row, Col } from 'antd';
import { FlagOutlined, UserAddOutlined, SendOutlined } from '@ant-design/icons';
import api from "../../config/api.js";
import dayjs from 'dayjs';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;
const { Option } = Select;

const OwnerRaceRegistrationPage = () => {
    const { user } = useAuth();
    const currentOwnerId = user?.id; // Đã lấy được ID ngon lành

    const [races, setRaces] = useState([]);
    const [myHorses, setMyHorses] = useState([]);
    const [jockeys, setJockeys] = useState([]);
    const [loading, setLoading] = useState(false);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedRace, setSelectedRace] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchAvailableRaces();
        if (currentOwnerId) {
            fetchMyApprovedHorses(currentOwnerId);
        } else {
            message.error("Không tìm thấy thông tin Chủ ngựa, vui lòng đăng nhập lại!");
        }
        fetchJockeys();
    }, [currentOwnerId]);

    // 1. Kéo danh sách chặng đua PENDING
    const fetchAvailableRaces = async () => {
        setLoading(true);
        try {
            const response = await api.get('/races');
            setRaces(response.data.filter(race => race.status === 'PENDING'));
        } catch (error) {
            message.error('Không thể tải danh sách chặng đua!');
        } finally {
            setLoading(false);
        }
    };

    // 2. Kéo danh sách Ngựa của Chủ (ĐÃ SỬA URL THÀNH DẠNG PARAMS)
    const fetchMyApprovedHorses = async (ownerId) => {
        try {
            // Đổi từ /horses/owner/${ownerId} thành truyền params
            const response = await api.get('/horses', {
                params: { ownerId: ownerId }
            });
            const approvedHorses = response.data.filter(horse => horse.status === 'APPROVED');
            setMyHorses(approvedHorses);
        } catch (error) {
            console.error('Lỗi tải ngựa:', error);
            message.error('Không thể tải danh sách chiến mã!');
        }
    };

    // 3. Kéo danh sách Jockey
    const fetchJockeys = async () => {
        try {
            const response = await api.get('/users', {
                params: { role: 'JOCKEY' }
            });
            setJockeys(response.data);
        } catch (error) {
            console.error('Lỗi tải nài ngựa:', error);
        }
    };

    // =====================================
    // XỬ LÝ SUBMIT ĐĂNG KÝ VÀ MỜI NÀI NGỰA
    // =====================================
    const handleRegisterAndInvite = async (values) => {
        try {
            // BƯỚC 1: Tạo Đơn đăng ký (Registration)
            const regPayload = {
                raceId: selectedRace.id,
                horseId: values.horseId
            };
            const regResponse = await api.post('/registrations', regPayload);
            const registrationId = regResponse.data.id;

            // BƯỚC 2: Gửi Lời mời cho Jockey
            const invitePayload = {
                registrationId: registrationId,
                jockeyId: values.jockeyId
            };
            await api.post('/invitations', invitePayload);

            message.success('Đã gửi đơn đăng ký và lời mời cho Nài ngựa thành công! 🏇');
            setIsModalVisible(false);
            form.resetFields();

        } catch (error) {
            console.error("Lỗi Server:", error.response?.data);
            message.error(error.response?.data?.message || error.response?.data || 'Có lỗi xảy ra khi xử lý!');
        }
    };

    const openInviteModal = (race) => {
        setSelectedRace(race);
        form.resetFields();
        setIsModalVisible(true);
    };

    const columns = [
        { title: 'Tên Giải Đấu', dataIndex: 'tournamentName', key: 'tournamentName', render: text => <Text strong className="text-blue-700">{text}</Text> },
        { title: 'Tên Chặng', dataIndex: 'name', key: 'name' },
        { title: 'Giờ Xuất Phát', dataIndex: 'raceTime', render: v => <Text strong>{dayjs(v).format('DD/MM/YYYY HH:mm')}</Text> },
        { title: 'Trạng Thái', dataIndex: 'status', render: s => <Tag color="orange">{s}</Tag> },
        {
            title: 'Thao Tác',
            key: 'action',
            align: 'right',
            render: (_, record) => (
                <Button type="primary" icon={<UserAddOutlined />} onClick={() => openInviteModal(record)}>
                    Đăng ký & Gửi Lời Mời
                </Button>
            )
        }
    ];

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <Card className="shadow-xl rounded-2xl border-none">
                <Row justify="space-between" align="middle" className="mb-6">
                    <Col>
                        <Title level={2} className="m-0 flex items-center gap-3">
                            <FlagOutlined className="text-red-500"/> Chặng Đua Sắp Diễn Ra
                        </Title>
                        <Text type="secondary">Đăng ký chiến mã của bạn vào các chặng đua đang mở</Text>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={races}
                    rowKey="id"
                    loading={loading}
                    className="overflow-hidden rounded-xl border border-gray-200"
                />
            </Card>

            <Modal
                title={<span className="text-xl">Đăng ký tham gia: <span className="text-blue-600">{selectedRace?.name}</span></span>}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                centered
            >
                <Form form={form} layout="vertical" onFinish={handleRegisterAndInvite} className="mt-4">
                    <Form.Item
                        name="horseId"
                        label={<Text strong>Chọn Chiến Mã Của Bạn</Text>}
                        rules={[{ required: true, message: 'Vui lòng chọn ngựa!' }]}
                        extra={myHorses.length === 0 ? <Text type="danger">Bạn chưa có ngựa nào được duyệt!</Text> : ''}
                    >
                        <Select placeholder="-- Chọn ngựa đã được kiểm duyệt --" size="large" disabled={myHorses.length === 0}>
                            {myHorses.map(horse => (
                                <Option key={horse.id} value={horse.id}>
                                    {horse.name} (Giống: {horse.breed} - Màu: {horse.color})
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="jockeyId"
                        label={<Text strong>Mời Nài Ngựa (Jockey)</Text>}
                        rules={[{ required: true, message: 'Vui lòng chọn nài ngựa!' }]}
                    >
                        <Select
                            placeholder="-- Tìm và chọn nài ngựa --"
                            size="large"
                            showSearch
                            optionFilterProp="children"
                        >
                            {jockeys.map(jockey => (
                                <Option key={jockey.id} value={jockey.id}>{jockey.username}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Button type="primary" htmlType="submit" size="large" block icon={<SendOutlined />} className="mt-6 bg-blue-600 hover:bg-blue-700">
                        XÁC NHẬN GỬI LỜI MỜI
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};

export default OwnerRaceRegistrationPage;