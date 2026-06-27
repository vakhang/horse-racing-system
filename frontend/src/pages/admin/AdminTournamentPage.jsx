// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, message, Card, Typography, Row, Col, Modal, Form, Input, DatePicker, Select, InputNumber, Popconfirm, Divider, Badge } from 'antd';
import { TrophyOutlined, PlusOutlined, EditOutlined, FlagOutlined, StopOutlined, UserOutlined } from '@ant-design/icons';
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

    const fetchTournaments = async () => {
        setLoading(true);
        try {
            const response = await api.get('/tournaments');
            setTournaments(response.data.map(tour => ({ ...tour, races: [] })));
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
                status: values.status
            };
            if (editingTourId) await api.put(`/tournaments/${editingTourId}`, payload);
            else await api.post('/tournaments', payload);
            message.success('Thành công!');
            setIsTourModalVisible(false);
            fetchTournaments();
        } catch (e) { message.error(e.response?.data?.message || 'Lỗi!'); }
    };

    const handleSaveRace = async (values) => {
        try {
            // Đã tích hợp gửi thẳng dữ liệu thật lên Backend
            const payload = {
                tournamentId: selectedTourId,
                name: values.name,
                raceTime: values.raceTime.format('YYYY-MM-DDTHH:mm:ss'),
                status: values.status || 'PENDING',
                refereeId: values.refereeId,
                prize1: values.prize1 || 0,
                prize2: values.prize2 || 0,
                prize3: values.prize3 || 0
            };

            if (editingRaceId) {
                await api.put(`/races/${editingRaceId}`, payload);
            } else {
                await api.post('/races', payload);
            }

            message.success('Thiết lập chặng đua thành công!');
            setIsRaceModalVisible(false);
            await fetchRacesForTournament(selectedTourId);
        } catch (e) { message.error(e.response?.data?.message || 'Lỗi!'); }
    };

    const handleCancelRace = async (race) => {
        try {
            const payload = { ...race, status: 'CANCELED' };
            await api.put(`/races/${race.id}`, payload);
            message.success('Đã hủy chặng đua! Hệ thống đang tiến hành hoàn tiền cho toàn bộ khán giả.');
            await fetchRacesForTournament(race.tournamentId);
        } catch (e) {
            message.error('Lỗi khi hủy chặng đua!');
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
            prize1: record.prize1 || 0,
            prize2: record.prize2 || 0,
            prize3: record.prize3 || 0,
        });
        setIsRaceModalVisible(true);
    };

    const expandedRowRender = (tournament) => {
        const columns = [
            { title: 'Tên Chặng', dataIndex: 'name', key: 'name', render: t => <Text strong>{t}</Text> },
            { title: 'Giờ Xuất Phát', dataIndex: 'raceTime', render: v => v ? dayjs(v).format('DD/MM/YYYY HH:mm') : 'Chưa định' },
            {
                title: 'Trọng Tài Phụ Trách',
                key: 'referee',
                render: (_, r) => {
                    return r.refereeUsername ? <Tag color="blue" className="font-bold"><UserOutlined/> {r.refereeUsername}</Tag> : <Text type="secondary" italic>Chưa phân công</Text>;
                }
            },
            {
                title: 'Trạng Thái',
                dataIndex: 'status',
                render: s => {
                    if (s === 'PENDING') return <Tag color="orange">Chờ diễn ra</Tag>;
                    if (s === 'RUNNING') return <Tag color="red">Đang đua (Live)</Tag>;
                    if (s === 'FINISHED') return <Tag color="green">Đã kết thúc</Tag>;
                    if (s === 'CANCELED') return <Tag color="default">Đã hủy</Tag>;
                    return <Tag>{s}</Tag>;
                }
            },
            {
                title: 'Quản Lý',
                align: 'right',
                render: (_, record) => (
                    <Space>
                        <Button size="small" type="primary" ghost icon={<EditOutlined />} onClick={() => openEditRaceModal(record)}>Thiết Lập</Button>
                        {record.status === 'PENDING' && (
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
                        <Title level={2}><TrophyOutlined className="text-yellow-500"/> Quản Lý Giải Đấu & Chặng Đua</Title>
                        <Text type="secondary">Tạo giải, lên lịch chặng, phân công trọng tài và treo thưởng.</Text>
                    </Col>
                    <Col><Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => { setEditingTourId(null); tourForm.resetFields(); setIsTourModalVisible(true); }}>Tạo Giải Đấu Mới</Button></Col>
                </Row>
                <Table columns={[
                    { title: 'ID', dataIndex: 'id' },
                    { title: 'Tên Giải Đấu', dataIndex: 'name', render: t => <Text strong className="text-blue-700 text-lg">{t}</Text> },
                    { title: 'Thời Gian Tổ Chức', render: (_, r) => `${dayjs(r.startDate).format('DD/MM/YYYY')} - ${dayjs(r.endDate).format('DD/MM/YYYY')}` },
                    {
                        title: 'Thao Tác',
                        align: 'right',
                        render: (_, r) => <Space>
                            <Button type="dashed" className="font-bold" icon={<FlagOutlined />} onClick={() => { setSelectedTourId(r.id); setEditingRaceId(null); raceForm.resetFields(); setIsRaceModalVisible(true); }}>Thêm Chặng Đua</Button>
                            <Button type="primary" ghost icon={<EditOutlined />} onClick={() => { setEditingTourId(r.id); tourForm.setFieldsValue({name: r.name, dates: [dayjs(r.startDate), dayjs(r.endDate)], status: r.status}); setIsTourModalVisible(true); }} />
                        </Space>
                    }
                ]} dataSource={tournaments} rowKey="id" loading={loading} expandable={{ expandedRowRender, onExpand: (exp, rec) => exp && fetchRacesForTournament(rec.id) }} className="border rounded-xl" />
            </Card>

            <Modal title={<span className="text-xl">{editingTourId ? 'Chỉnh Sửa Giải Đấu' : 'Tạo Giải Đấu Mới'}</span>} open={isTourModalVisible} onCancel={() => setIsTourModalVisible(false)} footer={null} centered>
                <Form form={tourForm} layout="vertical" onFinish={handleSaveTournament} className="mt-4">
                    <Form.Item name="name" label={<Text strong>Tên Giải Đấu</Text>} rules={[{ required: true }]}><Input size="large" placeholder="VD: Siêu Cúp Mùa Hè..."/></Form.Item>
                    <Form.Item name="dates" label={<Text strong>Thời Gian Tổ Chức</Text>} rules={[{ required: true }]}><DatePicker.RangePicker size="large" className="w-full" /></Form.Item>
                    <Form.Item name="status" label={<Text strong>Trạng Thái</Text>}><Select size="large"><Option value="UPCOMING">Sắp diễn ra</Option><Option value="ONGOING">Đang thi đấu</Option></Select></Form.Item>
                    <Button type="primary" htmlType="submit" size="large" block className="bg-blue-600 font-bold mt-2">LƯU GIẢI ĐẤU</Button>
                </Form>
            </Modal>

            <Modal title={<span className="text-xl font-bold">{editingRaceId ? '⚙️ Thiết Lập Chặng Đua' : '➕ Thêm Chặng Đua Mới'}</span>} open={isRaceModalVisible} onCancel={() => setIsRaceModalVisible(false)} footer={null} width={800} centered>
                <Form form={raceForm} layout="vertical" onFinish={handleSaveRace}>
                    <Divider orientation="left" className="border-blue-500"><Text className="text-blue-600 font-bold">1. Thông Tin Cơ Bản</Text></Divider>
                    <Row gutter={16}>
                        <Col span={12}><Form.Item name="name" label={<Text strong>Tên Chặng Đua</Text>} rules={[{ required: true }]}><Input size="large" placeholder="VD: Chặng 1 - Khởi động"/></Form.Item></Col>
                        <Col span={12}><Form.Item name="raceTime" label={<Text strong>Giờ Xuất Phát</Text>} rules={[{ required: true }]}><DatePicker showTime size="large" className="w-full" /></Form.Item></Col>
                    </Row>

                    <Divider orientation="left" className="border-blue-500"><Text className="text-blue-600 font-bold">2. Vận Hành & Nhân Sự</Text></Divider>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="status" label={<Text strong>Trạng Thái</Text>} initialValue="PENDING">
                                <Select size="large">
                                    <Option value="PENDING"><Badge status="warning" /> Chờ diễn ra (PENDING)</Option>
                                    <Option value="RUNNING"><Badge status="processing" /> Đang đua (RUNNING)</Option>
                                    <Option value="FINISHED"><Badge status="success" /> Đã kết thúc (FINISHED)</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="refereeId" label={<Text strong>Phân Công Trọng Tài</Text>} rules={[{required: true, message: 'Bắt buộc chọn Trọng tài giám sát!'}]}>
                                <Select placeholder="-- Chọn Trọng tài --" size="large" showSearch optionFilterProp="children">
                                    {referees.map(r => <Option key={r.id} value={r.id}>👨‍⚖️ {r.username}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation="left" className="border-yellow-500"><Text className="text-yellow-600 font-bold">3. Bảng Giải Thưởng (VNĐ)</Text></Divider>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="prize1" label={<Text strong className="text-yellow-600">🥇 Tiền thưởng Hạng 1</Text>}>
                                <InputNumber size="large" className="w-full font-bold text-lg" min={0} step={1000000} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={v => v.replace(/\$\s?|(,*)/g, '')} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="prize2" label={<Text strong className="text-gray-500">🥈 Tiền thưởng Hạng 2</Text>}>
                                <InputNumber size="large" className="w-full font-bold text-lg" min={0} step={1000000} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={v => v.replace(/\$\s?|(,*)/g, '')} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="prize3" label={<Text strong className="text-orange-700">🥉 Tiền thưởng Hạng 3</Text>}>
                                <InputNumber size="large" className="w-full font-bold text-lg" min={0} step={1000000} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={v => v.replace(/\$\s?|(,*)/g, '')} />
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