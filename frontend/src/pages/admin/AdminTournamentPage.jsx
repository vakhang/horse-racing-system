import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, message, Card, Typography, Row, Col, Modal, Form, Input, DatePicker, Select, InputNumber, Popconfirm, Divider, Badge, Alert } from 'antd';
import { TrophyOutlined, PlusOutlined, EditOutlined, FlagOutlined, StopOutlined, UserOutlined, DeleteOutlined, CloseCircleOutlined } from '@ant-design/icons';
import api from "../../config/api.js";
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const AdminTournamentPage = () => {
    const [tournaments, setTournaments] = useState([]);
    const [referees, setReferees] = useState([]);
    const [loading, setLoading] = useState(false);

    const [isTourModalVisible, setIsTourModalVisible] = useState(false);
    const [tourForm] = Form.useForm();
    const [editingTourId, setEditingTourId] = useState(null);

    const [isRaceModalVisible, setIsRaceModalVisible] = useState(false);
    const [raceForm] = Form.useForm();
    const [selectedTourId, setSelectedTourId] = useState(null);
    const [editingRaceId, setEditingRaceId] = useState(null);

    // Modal quản lý trạng thái ngựa rút lui
    const [isWithdrawModalVisible, setIsWithdrawModalVisible] = useState(false);
    const [isReasonModalVisible, setIsReasonModalVisible] = useState(false);
    const [withdrawReason, setWithdrawReason] = useState('');
    const [selectedRegIdForWithdraw, setSelectedRegIdForWithdraw] = useState(null);
    const [raceRegistrations, setRaceRegistrations] = useState([]);
    const [selectedRaceForWithdraw, setSelectedRaceForWithdraw] = useState(null);

    const fetchTournaments = async () => {
        setLoading(true);
        try {
            const response = await api.get('/tournaments');
            const sortedTournaments = response.data.map(tour => ({ ...tour, races: [] })).sort((a, b) => {
                const statusOrder = { ONGOING: 1, UPCOMING: 2, COMPLETED: 3, POSTPONED: 4, CANCELED: 5 };
                const orderA = statusOrder[a.status] || 99;
                const orderB = statusOrder[b.status] || 99;
                return orderA - orderB;
            });
            setTournaments(sortedTournaments);
        } catch (error) {
            message.error('Không thể tải danh sách Giải đấu!');
        } finally {
            setLoading(false);
        }
    };

    const fetchReferees = async () => {
        try {
            const response = await api.get('/users');
            setReferees(response.data.filter(u => u.role === 'REFEREE'));
        } catch (error) {
            console.error("Lỗi lấy danh sách trọng tài", error);
        }
    };

    useEffect(() => {
        fetchTournaments();
        fetchReferees();
    }, []);

    const fetchRacesForTournament = async (tournamentId) => {
        try {
            const response = await api.get('/races', { params: { tournamentId } });
            setTournaments(prev => prev.map(t => t.id === tournamentId ? { ...t, races: response.data } : t));
        } catch (error) {
            message.error('Không thể tải chặng đua!');
        }
    };

    const handleSaveTournament = async (values) => {
        try {
            const payload = {
                name: values.name,
                startDate: values.dates[0].format('YYYY-MM-DDTHH:mm:ss'),
                endDate: values.dates[1].format('YYYY-MM-DDTHH:mm:ss'),
                status: values.status,
                reason: values.reason // Nhật ký khi Hủy / Hoãn
            };
            if (editingTourId) await api.put(`/tournaments/${editingTourId}`, payload);
            else await api.post('/tournaments', payload);

            message.success('Thiết lập giải đấu thành công!');
            setIsTourModalVisible(false);
            fetchTournaments();
        } catch (e) {
            message.error(extractError(e));
        }
    };

    const handleDeleteTournament = async (id) => {
        try {
            await api.delete(`/tournaments/${id}`);
            message.success("Đã xóa hoàn toàn giải đấu khỏi hệ thống!");
            fetchTournaments();
        } catch (e) {
            message.error("Không thể xóa do giải đấu này đã phát sinh dữ liệu (Chặng đua/Vé cược)!");
        }
    };

    const extractError = (e) => {
        if (e.response?.data) {
            if (e.response.data.error) return e.response.data.error;
            if (e.response.data.message) return e.response.data.message;
            if (typeof e.response.data === 'string') return e.response.data;
        }
        return e.message || 'Có lỗi xảy ra!';
    };

    const handleSaveRace = async (values) => {
        try {
            const payload = {
                tournamentId: selectedTourId,
                name: values.name,
                raceTime: values.raceTime.format('YYYY-MM-DDTHH:mm:ss'),
                status: values.status,
                refereeId: values.refereeId,
                prize1: values.prize1,
                prize2: values.prize2,
                prize3: values.prize3,
                rakePercentage: 35 // Mặc định hệ thống
            };

            if (editingRaceId) {
                await api.put(`/races/${editingRaceId}`, payload);
            } else {
                await api.post('/races', payload);
            }

            message.success('Thiết lập chặng đua thành công!');
            setIsRaceModalVisible(false);
            await fetchRacesForTournament(selectedTourId);
        } catch (e) {
            message.error(extractError(e));
        }
    };

    const handleCancelRace = async (race) => {
        try {
            const payload = { ...race, status: 'CANCELED' };
            await api.put(`/races/${race.id}`, payload);
            message.success('Đã hủy chặng đua! Hệ thống đang tiến hành hoàn trả tiền cho khán giả.');
            await fetchRacesForTournament(race.tournamentId);
        } catch (e) {
            message.error(extractError(e));
        }
    };

    const handleForceTransition = async (race, targetStatus) => {
        try {
            await api.post(`/races/${race.id}/transition`, { status: targetStatus });
            message.success('Đã ép chuyển trạng thái thành công!');
            await fetchRacesForTournament(race.tournamentId);
        } catch (e) {
            message.error(extractError(e));
        }
    };

    const openEditRaceModal = (record) => {
        setEditingRaceId(record.id);
        setSelectedTourId(record.tournamentId);

        raceForm.setFieldsValue({
            name: record.name,
            raceTime: record.raceTime ? dayjs(record.raceTime) : null,
            status: record.status,
            refereeId: record.refereeId || null,
            prize1: record.prize1,
            prize2: record.prize2,
            prize3: record.prize3,
        });
        setIsRaceModalVisible(true);
    };

    const handlePayout = async (raceId) => {
        try {
            await api.post(`/races/${raceId}/payout`);
            message.success('Đã trả thưởng thành công cho khán giả!');
        } catch (e) {
            message.error(extractError(e));
        }
    };

    // QUẢN LÝ NGỰA TRONG CHẶNG (RÚT LUI)
    const openWithdrawModal = async (race) => {
        setSelectedRaceForWithdraw(race);
        try {
            const response = await api.get(`/registrations`, { params: { raceId: race.id } });
            setRaceRegistrations(response.data);
            setIsWithdrawModalVisible(true);
        } catch (e) {
            message.error("Lỗi lấy danh sách ngựa!");
        }
    };

    const handleWithdrawHorse = (regId) => {
        setSelectedRegIdForWithdraw(regId);
        setWithdrawReason('');
        setIsReasonModalVisible(true);
    };

    const confirmWithdrawHorse = async () => {
        if (!withdrawReason || withdrawReason.trim() === '') {
            return message.warning("Bắt buộc nhập lý do mới được loại ngựa!");
        }

        try {
            await api.put(`/registrations/${selectedRegIdForWithdraw}`, {
                status: 'WITHDRAWN',
                reason: withdrawReason
            });
            message.success("Đã loại ngựa và tự động hoàn trả (Refund) tiền cược cho khán giả!");
            setIsReasonModalVisible(false);
            const response = await api.get(`/registrations`, { params: { raceId: selectedRaceForWithdraw.id } });
            setRaceRegistrations(response.data);
        } catch (e) {
            message.error(extractError(e));
        }
    };

    const disabledDate = (current) => {
        return current && current < dayjs().startOf('day');
    };

    const expandedRowRender = (tournament) => {
        const columns = [
            { title: 'Tên Chặng', dataIndex: 'name', key: 'name', render: t => <Text strong>{t}</Text> },
            { title: 'Giờ Xuất Phát', dataIndex: 'raceTime', render: v => v ? dayjs(v).format('DD/MM/YYYY HH:mm') : 'Chưa định' },
            { title: 'Live Pool', dataIndex: 'totalPool', render: v => <Text strong className="text-green-600">{v ? v.toLocaleString() + ' đ' : '0 đ'}</Text> },
            { title: 'Takeout Rate', dataIndex: 'rakePercentage', render: v => <Text strong className="text-yellow-600">{v || 20}%</Text> },
            {
                title: 'Trọng Tài Phụ Trách',
                key: 'referee',
                render: (_, r) => {
                    return r.refereeUsername ? <Tag color="blue" className="font-bold"><UserOutlined /> {r.refereeUsername}</Tag> : <Text type="secondary" italic>Chưa phân công</Text>;
                }
            },
            {
                title: 'Trạng Thái',
                dataIndex: 'status',
                render: s => {
                    if (s === 'REGISTRATION') return <Tag color="orange">ĐĂNG KÝ THI ĐẤU</Tag>;
                    if (s === 'BETTING') return <Tag color="blue">NHẬN ĐẶT CƯỢC</Tag>;
                    if (s === 'LOCK_SESSION') return <Tag color="gray">KHÓA NHẬN CƯỢC</Tag>;
                    if (s === 'RUNNING') return <Tag color="red">ĐANG THI ĐẤU</Tag>;
                    if (s === 'RESULT_CONFIRMED') return <Tag color="purple">ĐÃ CÓ KẾT QUẢ</Tag>;
                    if (s === 'COMPLETED') return <Tag color="green">ĐÃ HOÀN TẤT</Tag>;
                    if (s === 'CANCELED') return <Tag color="default">ĐÃ HỦY CHẶNG</Tag>;
                    return <Tag>{s}</Tag>;
                }
            },
            {
                title: 'Quản Lý',
                align: 'right',
                render: (_, record) => (
                    <Space>
                        {record.status === 'REGISTRATION' && (
                            <Popconfirm title="Chốt danh sách ngựa thi đấu và mở cổng nhận cược?" onConfirm={() => handleForceTransition(record, 'BETTING')}>
                                <Button size="small" type="primary" style={{ backgroundColor: '#1890ff', fontWeight: 'bold' }}>🔓 CHỐT DANH SÁCH & MỞ CƯỢC</Button>
                            </Popconfirm>
                        )}
                        {record.status === 'BETTING' && (
                            <Popconfirm title="Khóa cổng cược ngay lập tức?" onConfirm={() => handleForceTransition(record, 'LOCK_SESSION')}>
                                <Button size="small" type="primary" style={{ backgroundColor: '#595959', fontWeight: 'bold' }}>🔒 KHÓA CỔNG NHẬN CƯỢC</Button>
                            </Popconfirm>
                        )}
                        <Button size="small" type="primary" className="bg-purple-600 border-none font-bold" onClick={() => openWithdrawModal(record)}>Loại Ngựa</Button>
                        <Button size="small" type="primary" ghost icon={<EditOutlined />} onClick={() => openEditRaceModal(record)}>Thiết Lập</Button>
                        {record.status === 'RESULT_CONFIRMED' && (
                            <Popconfirm title="Thực hiện trả thưởng cho khán giả và kết thúc chặng?" onConfirm={() => { handlePayout(record.id); handleForceTransition(record, 'COMPLETED'); }}>
                                <Button size="small" type="primary" className="bg-green-600 border-none font-bold">💸 XÁC NHẬN TRẢ THƯỞNG</Button>
                            </Popconfirm>
                        )}
                        {(record.status === 'REGISTRATION' || record.status === 'BETTING' || record.status === 'LOCK_SESSION') && (
                            <Popconfirm
                                title={<span className="font-bold text-red-600">Xác nhận hủy chặng đua?</span>}
                                description="Tiền cược sẽ tự động được hoàn lại toàn bộ cho khán giả."
                                onConfirm={() => handleCancelRace(record)}
                                okText="Xác nhận Hủy" cancelText="Đóng" okButtonProps={{ danger: true }}
                            >
                                <Button size="small" danger icon={<StopOutlined />}>Hủy Chặng</Button>
                            </Popconfirm>
                        )}
                    </Space>
                )
            }
        ];

        return (
            <Card key={`card-${tournament.id}`} className="bg-blue-50 border-dashed border-blue-300 m-2">
                <Table
                    key={`race-table-${tournament.id}`}
                    columns={columns}
                    dataSource={tournament.races || []} rowKey="id" pagination={false} size="small"
                />
            </Card>
        );
    };

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <Card className="shadow-xl rounded-2xl border-none">
                <Row justify="space-between" className="mb-6">
                    <Col>
                        <Title level={2}><TrophyOutlined className="text-yellow-500" /> Quản Lý Giải Đấu & Chặng Đua</Title>
                        <Text type="secondary">Tạo giải, lên lịch chặng, phân công trọng tài và treo thưởng.</Text>
                    </Col>
                    <Col><Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => { setEditingTourId(null); tourForm.resetFields(); setIsTourModalVisible(true); }}>Tạo Giải Đấu Mới</Button></Col>
                </Row>
                <Table columns={[
                    { title: 'Tên Giải Đấu', dataIndex: 'name', render: t => <Text strong className="text-blue-700 text-lg">{t}</Text> },
                    { title: 'Thời Gian Tổ Chức', render: (_, r) => `${dayjs(r.startDate).format('DD/MM/YYYY')} - ${dayjs(r.endDate).format('DD/MM/YYYY')}` },
                    {
                        title: 'Trạng Thái', dataIndex: 'status', render: s => {
                            if (s === 'POSTPONED') return <Tag color="warning" className="font-bold">ĐÃ DỜI LỊCH</Tag>;
                            if (s === 'CANCELED') return <Tag color="error" className="font-bold">ĐÃ HỦY</Tag>;
                            if (s === 'ONGOING') return <Tag color="success" className="font-bold">ĐANG DIỄN RA</Tag>;
                            if (s === 'UPCOMING') return <Tag color="blue" className="font-bold">SẮP DIỄN RA</Tag>;
                            if (s === 'COMPLETED') return <Tag color="default" className="font-bold">ĐÃ KẾT THÚC</Tag>;
                            return <Tag color="blue" className="font-bold">{s}</Tag>;
                        }
                    },
                    {
                        title: 'Thao Tác',
                        align: 'right',
                        render: (_, r) => <Space>
                            <Button type="dashed" className="font-bold" icon={<FlagOutlined />} onClick={() => { setSelectedTourId(r.id); setEditingRaceId(null); raceForm.resetFields(); setIsRaceModalVisible(true); }}>Thêm Chặng Đua</Button>
                            <Button type="primary" ghost icon={<EditOutlined />} onClick={() => { setEditingTourId(r.id); tourForm.setFieldsValue({ name: r.name, dates: [dayjs(r.startDate), dayjs(r.endDate)], status: r.status, reason: '' }); setIsTourModalVisible(true); }} />
                            <Popconfirm title="Xác nhận xóa hoàn toàn giải đấu này?" onConfirm={() => handleDeleteTournament(r.id)} okText="Xóa" okButtonProps={{ danger: true }} cancelText="Hủy">
                                <Button danger icon={<DeleteOutlined />} />
                            </Popconfirm>
                        </Space>
                    }
                ]} dataSource={tournaments} rowKey="id" loading={loading} expandable={{ expandedRowRender, onExpand: (exp, rec) => exp && fetchRacesForTournament(rec.id) }} className="border rounded-xl" />
            </Card>

            {/* MODAL QUẢN LÝ GIẢI ĐẤU */}
            <Modal title={<span className="text-xl">{editingTourId ? 'Chỉnh Sửa Giải Đấu' : 'Tạo Giải Đấu Mới'}</span>} open={isTourModalVisible} onCancel={() => setIsTourModalVisible(false)} footer={null} centered>
                <Form form={tourForm} layout="vertical" onFinish={handleSaveTournament} className="mt-4">
                    <Form.Item name="name" label={<Text strong>Tên Giải Đấu</Text>} rules={[{ required: true, message: 'Vui lòng nhập tên giải đấu' }]}>
                        <Input size="large" placeholder="VD: Siêu Cúp Mùa Hè..." />
                    </Form.Item>

                    <Form.Item
                        name="dates"
                        label={<Text strong>Thời Gian Tổ Chức</Text>}
                        rules={[
                            { required: true, message: 'Vui lòng chọn thời gian tổ chức!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || value.length < 2) return Promise.resolve();
                                    return Promise.resolve();
                                },
                            }),
                        ]}
                    >
                        <DatePicker.RangePicker showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm" disabledDate={disabledDate} size="large" className="w-full" />
                    </Form.Item>

                    {/* HIỂN THỊ CÁC TRẠNG THÁI NGOẠI LỆ CHO PHÉP ADMIN CAN THIỆP */}
                    {editingTourId && (
                        <>
                            <Form.Item name="status" label={<Text strong>Trạng Thái Nhanh (Ngoại Lệ Can Thiệp)</Text>}>
                                <Select size="large" onChange={(val) => {
                                    if (val === 'CANCELED' || val === 'POSTPONED') tourForm.setFieldsValue({ reason: '' });
                                }}>
                                    <Option value="UPCOMING"><span className="text-gray-400">Tự động (Sắp diễn ra)</span></Option>
                                    <Option value="CANCELED"><span className="text-red-600 font-bold">🚫 Hủy Bỏ Toàn Bộ (Auto Refund 100%)</span></Option>
                                    <Option value="POSTPONED"><span className="text-orange-500 font-bold">⏳ Dời Lịch / Hoãn (Auto Refund nếu quá 36h)</span></Option>
                                </Select>
                            </Form.Item>

                            <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.status !== currentValues.status}>
                                {({ getFieldValue }) =>
                                    (getFieldValue('status') === 'CANCELED' || getFieldValue('status') === 'POSTPONED') ? (
                                        <Form.Item name="reason" label={<Text strong className="text-red-500">Lý do (Bắt buộc để lưu Sổ Nhật ký Hệ thống)</Text>} rules={[{ required: true, message: 'Ban kiểm soát bắt buộc bạn phải nhập lý do!' }]}>
                                            <Input.TextArea rows={3} placeholder="Ví dụ: Bão lớn, đình công, sự cố kỹ thuật..." />
                                        </Form.Item>
                                    ) : null
                                }
                            </Form.Item>
                        </>
                    )}

                    <Button type="primary" htmlType="submit" size="large" block className="bg-blue-600 font-bold mt-2">LƯU GIẢI ĐẤU</Button>
                </Form>
            </Modal>

            {/* MODAL QUẢN LÝ NGỰA BỊ LOẠI */}
            <Modal title={<span className="text-xl text-red-600 font-bold"><CloseCircleOutlined /> Đình Chỉ / Rút Lui Chiến Mã</span>} open={isWithdrawModalVisible} onCancel={() => setIsWithdrawModalVisible(false)} footer={null} centered>
                <Alert message="Hoàn tiền tự động (Refund)" description="Việc đánh dấu một con ngựa 'Rút lui' sẽ lập tức hủy toàn bộ các vé cược liên quan đến riêng con ngựa đó và hoàn tiền 100% về ví khán giả." type="warning" showIcon className="mb-4" />
                <ul className="space-y-3">
                    {raceRegistrations.length === 0 && <Text className="text-gray-500">Chưa có ngựa nào đăng ký chặng này.</Text>}
                    {raceRegistrations.map(r => (
                        <li key={r.id} className="flex justify-between items-center bg-white p-3 rounded-lg border shadow-sm">
                            <div>
                                <Text strong className="text-lg block">{r.horseName}</Text>
                                <Text type="secondary">Nài: {r.jockeyUsername || 'Trống'}</Text>
                            </div>
                            {r.status !== 'WITHDRAWN' ? (
                                <Button type="primary" danger onClick={() => handleWithdrawHorse(r.id)}>Loại Ngựa</Button>
                            ) : (
                                <Tag color="error" className="font-bold text-sm px-3 py-1">ĐÃ RÚT LUI (REFUNDED)</Tag>
                            )}
                        </li>
                    ))}
                </ul>
            </Modal>

            {/* MODAL NHẬP LÝ DO RÚT LUI */}
            <Modal title={<span className="text-xl text-red-600 font-bold"><CloseCircleOutlined /> Xác Nhận Rút Lui Ngựa</span>} open={isReasonModalVisible} onOk={confirmWithdrawHorse} onCancel={() => setIsReasonModalVisible(false)} okText="Xác Nhận Loại Ngựa" okButtonProps={{ danger: true, size: 'large' }} cancelText="Hủy Bỏ" centered>
                <div className="mb-4">
                    <Text strong className="text-red-500">Pháp lý bắt buộc:</Text> Nhập lý do ngựa rút lui để lưu Nhật ký sự kiện (Audit Log) và thông báo cho Chủ ngựa.
                </div>
                <Input.TextArea rows={4} placeholder="Ví dụ: Sự cố kỹ thuật, vi phạm nội quy, chấn thương..." value={withdrawReason} onChange={(e) => setWithdrawReason(e.target.value)} />
            </Modal>

            <Modal title={<span className="text-xl font-bold">{editingRaceId ? '⚙️ Thiết Lập Chặng Đua' : '➕ Thêm Chặng Đua Mới'}</span>} open={isRaceModalVisible} onCancel={() => setIsRaceModalVisible(false)} footer={null} width={800} centered>
                <Form form={raceForm} layout="vertical" onFinish={handleSaveRace}>
                    <Divider orientation="left" className="border-blue-500"><Text className="text-blue-600 font-bold">1. Thông Tin Cơ Bản</Text></Divider>
                    <Row gutter={16}>
                        <Col span={12}><Form.Item name="name" label={<Text strong>Tên Chặng Đua</Text>} rules={[{ required: true, message: 'Nhập tên chặng đua' }]}><Input size="large" placeholder="VD: Chặng 1 - Khởi động" /></Form.Item></Col>
                        <Col span={12}>
                            <Form.Item
                                name="raceTime"
                                label={<Text strong>Giờ Xuất Phát</Text>}
                                rules={[
                                    { required: true, message: 'Vui lòng chọn giờ xuất phát!' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value) return Promise.resolve();
                                            if (value.isBefore(dayjs(), 'minute')) {
                                                return Promise.reject(new Error('Giờ xuất phát phải lớn hơn thời gian hiện tại!'));
                                            }
                                            return Promise.resolve();
                                        },
                                    }),
                                ]}
                            >
                                <DatePicker showTime format="YYYY-MM-DD HH:mm" disabledDate={disabledDate} size="large" className="w-full" />
                            </Form.Item>
                            <Text type="secondary" className="text-xs text-blue-500 italic block mt-1">
                                💡 Gợi ý: Mỗi chặng đua nên cách chặng đua trước đó ít nhất 30 phút tính từ lúc chặng trước kết thúc (tương đương 60 phút từ giờ xuất phát của chặng trước) để đảm bảo thời gian dọn dẹp mặt sân và chuẩn bị ngựa.
                            </Text>
                        </Col>
                    </Row>

                    <Divider orientation="left" className="border-blue-500"><Text className="text-blue-600 font-bold">2. Vận Hành & Nhân Sự</Text></Divider>
                    <Row gutter={16}>
                        <Col span={12}>
                            {editingRaceId && (
                                <Form.Item name="status" label={<Text strong>Trạng Thái</Text>} initialValue="REGISTRATION">
                                    <Select size="large">
                                        <Option value="REGISTRATION"><Badge status="warning" /> ĐĂNG KÝ THI ĐẤU</Option>
                                        <Option value="BETTING"><Badge status="processing" /> NHẬN ĐẶT CƯỢC</Option>
                                        <Option value="LOCK_SESSION"><Badge status="default" /> KHÓA NHẬN CƯỢC</Option>
                                        <Option value="RUNNING"><Badge status="error" /> ĐANG THI ĐẤU</Option>
                                        <Option value="FINISHED"><Badge status="success" /> CHỜ KẾT QUẢ</Option>
                                        <Option value="RESULT_CONFIRMED"><Badge status="success" /> ĐÃ CÓ KẾT QUẢ</Option>
                                        <Option value="COMPLETED"><Badge status="success" /> ĐÃ HOÀN TẤT</Option>
                                        <Option value="CANCELED"><Badge status="default" /> ĐÃ HỦY CHẶNG</Option>
                                    </Select>
                                </Form.Item>
                            )}
                        </Col>
                        <Col span={editingRaceId ? 12 : 24}>
                            <Form.Item name="refereeId" label={<Text strong>Phân Công Trọng Tài</Text>} rules={[{ required: true, message: 'Bắt buộc chọn Trọng tài giám sát!' }]}>
                                <Select placeholder="-- Chọn Trọng tài --" size="large" showSearch optionFilterProp="children">
                                    {referees.map(r => <Option key={r.id} value={r.id}>👨‍⚖️ {r.username}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation="left" className="border-yellow-500"><Text className="text-yellow-600 font-bold">3. Bảng Giải Thưởng (VNĐ)</Text></Divider>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="prize1" rules={[{ required: true, message: 'Bắt buộc nhập!' }]} label={<Text strong className="text-yellow-600">🥇 Tiền thưởng Hạng 1</Text>}>
                                <InputNumber style={{ width: '100%' }} size="large" className="font-bold text-lg" min={0} step={50000} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={v => v.replace(/\$\s?|(,*)/g, '')} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="prize2" rules={[{ required: true, message: 'Bắt buộc nhập!' }]} label={<Text strong className="text-gray-500">🥈 Tiền thưởng Hạng 2</Text>}>
                                <InputNumber style={{ width: '100%' }} size="large" className="font-bold text-lg" min={0} step={50000} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={v => v.replace(/\$\s?|(,*)/g, '')} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="prize3" rules={[{ required: true, message: 'Bắt buộc nhập!' }]} label={<Text strong className="text-orange-700">🥉 Tiền thưởng Hạng 3</Text>}>
                                <InputNumber style={{ width: '100%' }} size="large" className="font-bold text-lg" min={0} step={50000} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={v => v.replace(/\$\s?|(,*)/g, '')} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Button type="primary" htmlType="submit" size="large" block className="bg-blue-600 font-bold mt-6 h-12 text-lg">
                        LƯU CẤU HÌNH CHẶNG ĐUA
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminTournamentPage;