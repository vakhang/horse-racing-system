import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, message, Card, Typography, Row, Col, Modal, Form, Input, DatePicker, Select } from 'antd';
import { TrophyOutlined, PlusOutlined, EditOutlined, FlagOutlined } from '@ant-design/icons';
import api from "../../config/api.js";
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const AdminTournamentPage = () => {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(false);

    // State cho Giải đấu
    const [isTourModalVisible, setIsTourModalVisible] = useState(false);
    const [tourForm] = Form.useForm();
    const [editingTourId, setEditingTourId] = useState(null);

    // State cho Chặng đua
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

    useEffect(() => { fetchTournaments(); }, []);

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
            const payload = {
                tournamentId: selectedTourId,
                name: values.name,
                raceTime: values.raceTime.format('YYYY-MM-DDTHH:mm:ss'),
                status: values.status || 'PENDING'
            };
            if (editingRaceId) await api.put(`/races/${editingRaceId}`, payload);
            else await api.post('/races', payload);
            message.success('Thành công!');
            setIsRaceModalVisible(false);
            await fetchRacesForTournament(selectedTourId);
        } catch (e) { message.error(e.response?.data?.message || 'Lỗi!'); }
    };

    const openEditRaceModal = (record) => {
        setEditingRaceId(record.id);
        setSelectedTourId(record.tournamentId);
        raceForm.setFieldsValue({
            name: record.name,
            raceTime: record.raceTime ? dayjs(record.raceTime) : null,
            status: record.status
        });
        setIsRaceModalVisible(true);
    };

    const expandedRowRender = (tournament) => (
        <Card key={`card-${tournament.id}`} className="bg-gray-50 border-dashed m-2">
            <Table
                key={`race-table-${tournament.id}`}
                columns={[
                    { title: 'Mã', dataIndex: 'id', key: 'id' },
                    { title: 'Tên Chặng', dataIndex: 'name', key: 'name' },
                    { title: 'Giờ Xuất Phát', dataIndex: 'raceTime', render: v => v ? dayjs(v).format('DD/MM/YYYY HH:mm') : 'Chưa định' },
                    { title: 'Trạng Thái', dataIndex: 'status', render: s => <Tag color="blue">{s}</Tag> },
                    { title: 'Quản Lý', render: (_, record) => <Button size="small" icon={<EditOutlined />} onClick={() => openEditRaceModal(record)}>Sửa</Button> }
                ]}
                dataSource={tournament.races || []} rowKey="id" pagination={false} size="small"
            />
        </Card>
    );

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <Card className="shadow-xl rounded-2xl">
                <Row justify="space-between" className="mb-6">
                    <Title level={2}><TrophyOutlined /> Quản Lý Giải Đấu</Title>
                    <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => { setEditingTourId(null); tourForm.resetFields(); setIsTourModalVisible(true); }}>Tạo Giải Đấu</Button>
                </Row>
                <Table columns={[
                    { title: 'ID', dataIndex: 'id' },
                    { title: 'Tên', dataIndex: 'name' },
                    { title: 'Thời Gian', render: (_, r) => `${dayjs(r.startDate).format('DD/MM/YYYY')} - ${dayjs(r.endDate).format('DD/MM/YYYY')}` },
                    { title: 'Thao Tác', render: (_, r) => <Space>
                            <Button type="dashed" icon={<FlagOutlined />} onClick={() => { setSelectedTourId(r.id); setEditingRaceId(null); raceForm.resetFields(); setIsRaceModalVisible(true); }}>Thêm Chặng</Button>
                            <Button type="primary" ghost icon={<EditOutlined />} onClick={() => { setEditingTourId(r.id); tourForm.setFieldsValue({name: r.name, dates: [dayjs(r.startDate), dayjs(r.endDate)], status: r.status}); setIsTourModalVisible(true); }} />
                        </Space> }
                ]} dataSource={tournaments} rowKey="id" loading={loading} expandable={{ expandedRowRender, onExpand: (exp, rec) => exp && fetchRacesForTournament(rec.id) }} />
            </Card>

            <Modal title={editingTourId ? 'Sửa Giải Đấu' : 'Tạo Giải Đấu'} open={isTourModalVisible} onCancel={() => setIsTourModalVisible(false)} footer={null}>
                <Form form={tourForm} layout="vertical" onFinish={handleSaveTournament}>
                    <Form.Item name="name" label="Tên" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="dates" label="Thời Gian" rules={[{ required: true }]}><DatePicker.RangePicker className="w-full" /></Form.Item>
                    <Form.Item name="status" label="Trạng Thái"><Select><Option value="UPCOMING">Sắp diễn ra</Option><Option value="ONGOING">Đang thi đấu</Option></Select></Form.Item>
                    <Button type="primary" htmlType="submit" block>LƯU GIẢI ĐẤU</Button>
                </Form>
            </Modal>

            <Modal title={editingRaceId ? 'Sửa Chặng Đua' : 'Thêm Chặng Đua'} open={isRaceModalVisible} onCancel={() => setIsRaceModalVisible(false)} footer={null}>
                <Form form={raceForm} layout="vertical" onFinish={handleSaveRace}>
                    <Form.Item name="name" label="Tên Chặng" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="raceTime" label="Giờ Xuất Phát" rules={[{ required: true }]}><DatePicker showTime className="w-full" /></Form.Item>
                    <Form.Item name="status" label="Trạng Thái" initialValue="PENDING"><Select><Option value="PENDING">Chờ</Option><Option value="RUNNING">Đang đua</Option><Option value="FINISHED">Kết thúc</Option></Select></Form.Item>
                    <Button type="primary" htmlType="submit" block>LƯU CHẶNG ĐUA</Button>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminTournamentPage;