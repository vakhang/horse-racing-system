import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, message, Card, Typography, Modal, Form, Select, Row, Col, Alert, Tabs, Input } from 'antd';
import { FlagOutlined, UserAddOutlined, SendOutlined, HistoryOutlined, FileExclamationOutlined } from '@ant-design/icons';
import api from "../../config/api.js";
import dayjs from 'dayjs';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

// [Chức năng rõ ràng]: Trang Đăng ký Thi đấu & Kháng cáo (Chủ Ngựa)
// [Tác dụng]:
// 1. Chọn Ngựa và Mời Jockey ghép vào Chặng đua mở đăng ký.
// 2. Theo dõi trạng thái các lời mời nài ngựa và gửi lại lời mời khác nếu bị từ chối.
// 3. Gửi Kháng cáo kết quả chặng đua nếu không đồng ý với kết quả do Trọng tài công bố.
const OwnerRaceRegistrationPage = () => {
    const { user } = useAuth();
    const currentOwnerId = user?.id;

    const [races, setRaces] = useState([]);
    const [allRaces, setAllRaces] = useState([]);
    const [myHorses, setMyHorses] = useState([]);
    const [jockeys, setJockeys] = useState([]);
    const [loading, setLoading] = useState(false);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedRace, setSelectedRace] = useState(null);
    const [form] = Form.useForm();

    const [currentRaceRegistrations, setCurrentRaceRegistrations] = useState([]);
    const [invitations, setInvitations] = useState([]);

    // States cho Kháng cáo
    const [appeals, setAppeals] = useState([]);
    const [isAppealModalOpen, setIsAppealModalOpen] = useState(false);
    const [appealForm] = Form.useForm();
    const [submittingAppeal, setSubmittingAppeal] = useState(false);

    const fetchAvailableRaces = async () => {
        setLoading(true);
        try {
            const response = await api.get('/races');
            setAllRaces(response.data || []);
            setRaces(response.data.filter(race => race.status === 'REGISTRATION' && race.tournamentStatus !== 'COMPLETED' && race.tournamentStatus !== 'CANCELED'));
        } catch (error) { message.error('Không thể tải danh sách chặng đua!'); }
        finally { setLoading(false); }
    };

    const fetchInvitations = async () => {
        if (!currentOwnerId) return;
        try {
            const response = await api.get(`/invitations?ownerId=${currentOwnerId}`);
            setInvitations(response.data || []);
        } catch (error) {
            console.error('Lỗi tải danh sách lời mời:', error);
        }
    };

    const fetchMyAppeals = async () => {
        try {
            const savedAppeals = JSON.parse(localStorage.getItem(`owner_appeals_${currentOwnerId}`) || '[]');
            setAppeals(savedAppeals);
        } catch (error) {
            console.error('Lỗi tải danh sách kháng cáo:', error);
        }
    };

    useEffect(() => {
        fetchAvailableRaces();
        if (currentOwnerId) {
            fetchMyApprovedHorses(currentOwnerId);
            fetchInvitations();
            fetchMyAppeals();
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
            fetchInvitations();
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

    const handleCreateAppeal = async (values) => {
        setSubmittingAppeal(true);
        try {
            const selectedR = allRaces.find(r => r.id === values.raceId);
            const selectedH = myHorses.find(h => h.id === values.horseId);
            const newAppeal = {
                id: Date.now(),
                ownerId: currentOwnerId,
                ownerName: user.username,
                raceName: selectedR?.name || 'Chặng đua',
                horseName: selectedH?.name || 'Chiến mã',
                reason: values.reason,
                evidence: values.evidence || 'Không có',
                status: 'PENDING',
                createdAt: new Date().toISOString()
            };

            const existing = JSON.parse(localStorage.getItem('all_system_appeals') || '[]');
            existing.push(newAppeal);
            localStorage.setItem('all_system_appeals', JSON.stringify(existing));

            const mySaved = JSON.parse(localStorage.getItem(`owner_appeals_${currentOwnerId}`) || '[]');
            mySaved.push(newAppeal);
            localStorage.setItem(`owner_appeals_${currentOwnerId}`, JSON.stringify(mySaved));

            setAppeals(mySaved);
            message.success('Đã nộp đơn kháng cáo! Ban tổ chức sẽ tiến hành đối soát và phản hồi.');
            setIsAppealModalOpen(false);
            appealForm.resetFields();
        } catch (error) {
            message.error('Có lỗi xảy ra khi nộp đơn kháng cáo!');
        } finally {
            setSubmittingAppeal(false);
        }
    };

    const historyColumns = [
        { title: 'Tên Chiến Mã', dataIndex: 'horseName', render: text => <Text strong>{text}</Text> },
        { title: 'Giải Đấu', dataIndex: 'tournamentName', render: text => <Text strong className="text-yellow-500">{text}</Text> },
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

    const appealColumns = [
        { title: 'Mã Đơn', dataIndex: 'id', render: id => <Text type="secondary">#{id}</Text> },
        { title: 'Chặng Đua Kháng Cáo', dataIndex: 'raceName', render: t => <Text strong className="text-blue-700">{t}</Text> },
        { title: 'Chiến Mã', dataIndex: 'horseName', render: t => <Text strong>{t}</Text> },
        { title: 'Nội Dung Kháng Cáo', dataIndex: 'reason' },
        {
            title: 'Trạng Thái',
            dataIndex: 'status',
            render: s => s === 'APPROVED' ? <Tag color="green">ĐÃ CHẤP NHẬN (ĐIỀU CHỈNH KQ)</Tag> : s === 'REJECTED' ? <Tag color="red">ĐÃ BÁC BỎ</Tag> : <Tag color="orange">ĐANG XEM XÉT</Tag>
        },
        { title: 'Thời Gian Nộp', dataIndex: 'createdAt', render: d => dayjs(d).format('DD/MM/YYYY HH:mm') }
    ];

    const columns = [
        { title: 'Tên Giải Đấu', dataIndex: 'tournamentName', render: text => <Text strong className="text-blue-700">{text}</Text> },
        { title: 'Tên Chặng', dataIndex: 'name' },
        { 
            title: 'Cấp Chạy Yêu Cầu 🏆', 
            render: (_, r) => {
                const reqClass = r.requiredClass || r.raceClass || 4;
                const classColor = reqClass === 1 ? 'gold' : reqClass === 2 ? 'purple' : reqClass === 3 ? 'green' : reqClass === 4 ? 'blue' : 'default';
                return (
                    <Tag color={classColor} className="font-bold text-sm px-2.5 py-0.5 border">
                        Class {reqClass}
                    </Tag>
                );
            }
        },
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
                <Row justify="space-between" align="middle" className="mb-4">
                    <Col>
                        <Title level={2} className="m-0 flex items-center gap-3"><FlagOutlined className="text-blue-600"/> Đăng Ký Thi Đấu & Quản Lý Lịch Đua</Title>
                        <Text type="secondary">Đăng ký chiến mã, mời nài ngựa và gửi đơn kháng cáo kết quả giải đấu</Text>
                    </Col>
                    <Col>
                        <Button type="primary" danger icon={<FileExclamationOutlined />} onClick={() => setIsAppealModalOpen(true)} className="font-bold">
                            NỘP ĐƠN KHÁNG CÁO
                        </Button>
                    </Col>
                </Row>

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
                    <TabPane tab={<span className="font-bold text-lg"><FileExclamationOutlined /> Nhật Ký Kháng Cáo</span>} key="3">
                        <Row justify="space-between" align="middle" className="mb-4 mt-2">
                            <Col>
                                <Title level={3} className="m-0 text-orange-600">Đơn Kháng Cáo Đã Nộp</Title>
                                <Text type="secondary">Theo dõi quá trình Ban tổ chức và Admin xem xét đơn kháng cáo</Text>
                            </Col>
                        </Row>
                        <Table columns={appealColumns} dataSource={appeals} rowKey="id" className="border border-gray-200" locale={{ emptyText: 'Bạn chưa gửi đơn kháng cáo nào.' }} />
                    </TabPane>
                </Tabs>
            </Card>

            <Modal title={<span className="text-xl">Đăng ký: <span className="text-blue-600">{selectedRace?.name}</span></span>} open={isModalVisible} onCancel={() => setIsModalVisible(false)} footer={null} centered>
                <Form form={form} layout="vertical" onFinish={handleRegisterAndInvite}>
                    <Form.Item name="horseId" label={<Text strong>Chọn Chiến Mã</Text>} rules={[{ required: true }]}>
                        <Select placeholder="-- Chọn ngựa --" size="large">
                            {myHorses.map(horse => {
                                const isAlreadyRegistered = currentRaceRegistrations.some(reg => reg.horseId === horse.id && reg.status !== 'WAITING_JOCKEY');
                                const raceRequiredClass = selectedRace?.raceClass || 4;
                                const isClassMismatch = horse.classLevel && horse.classLevel !== raceRequiredClass;
                                const isDisabled = isAlreadyRegistered || isClassMismatch;
                                return (
                                    <Option key={horse.id} value={horse.id} disabled={isDisabled}>
                                        <div className="flex justify-between items-center w-full">
                                            <span>
                                                <strong className="mr-2">{horse.name}</strong>
                                                <span className="text-xs bg-[#007355] text-[#fcc200] px-1.5 py-0.5 rounded mr-1 font-bold">Class {horse.classLevel || 4}</span>
                                                <span className="text-xs bg-gray-700 text-gray-200 px-1.5 py-0.5 rounded">⭐ {horse.rating || 40} pts</span>
                                            </span>
                                            {isAlreadyRegistered ? (
                                                <span className="text-red-500 font-bold text-xs ml-2">(Đã đăng ký)</span>
                                            ) : isClassMismatch ? (
                                                <span className="text-orange-400 font-bold text-xs ml-2">(Không hợp Class {raceRequiredClass})</span>
                                            ) : (
                                                <span className="text-green-500 font-bold text-xs ml-2">✓ Sẵn sàng</span>
                                            )}
                                        </div>
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

            {/* MODAL NỘP KHÁNG CÁO DÀNH CHO CHỦ NGỰA */}
            <Modal
                title={<span className="text-xl text-red-600 font-bold"><FileExclamationOutlined /> Gửi Đơn Kháng Cáo Kết Quả Thi Đấu</span>}
                open={isAppealModalOpen}
                onCancel={() => setIsAppealModalOpen(false)}
                footer={null}
                centered
            >
                <Alert message="Kháng cáo dành cho Chủ Ngựa" description="Nếu bạn phát hiện sai sót trong kết quả công bố hoặc có khiếu nại về hành vi vi phạm trên đường đua, hãy gửi đơn tại đây." type="warning" showIcon className="mb-4" />
                <Form form={appealForm} layout="vertical" onFinish={handleCreateAppeal}>
                    <Form.Item name="raceId" label={<Text strong>Chọn Chặng Đua Kháng Cáo</Text>} rules={[{ required: true, message: 'Vui lòng chọn chặng đua!' }]}>
                        <Select placeholder="-- Chọn chặng đua --" size="large">
                            {allRaces.map(r => (
                                <Option key={r.id} value={r.id}>{r.name} (Giải: {r.tournamentName})</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="horseId" label={<Text strong>Chọn Chiến Mã Của Bạn Tham Gia Chặng Đó</Text>} rules={[{ required: true, message: 'Vui lòng chọn chiến mã!' }]}>
                        <Select placeholder="-- Chọn chiến mã --" size="large">
                            {myHorses.map(h => (
                                <Option key={h.id} value={h.id}>{h.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="reason" label={<Text strong>Lý Do Kháng Cáo Chi Tiết</Text>} rules={[{ required: true, message: 'Vui lòng điền lý do!' }]}>
                        <Input.TextArea rows={4} placeholder="Mô tả lý do không đồng ý với kết quả được công bố..." />
                    </Form.Item>

                    <Form.Item name="evidence" label={<Text strong>Bằng Chứng (Link hình ảnh / video)</Text>}>
                        <Input placeholder="Nhập đường dẫn minh chứng nếu có..." />
                    </Form.Item>

                    <Button type="primary" danger htmlType="submit" size="large" block loading={submittingAppeal} icon={<SendOutlined />} className="font-bold h-12">
                        GỬI ĐƠN KHÁNG CÁO LÊN BTC
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};

export default OwnerRaceRegistrationPage;