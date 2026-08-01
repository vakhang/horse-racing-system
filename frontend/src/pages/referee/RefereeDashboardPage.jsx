// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Tag, Space, message, Card, Typography, Modal, Form, Select, Row, Col, Input, Tabs, Alert, Popconfirm } from 'antd';
import { FileProtectOutlined, SafetyCertificateOutlined, WarningOutlined, PlayCircleOutlined, PauseCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import api from "../../config/api.js";
import dayjs from 'dayjs';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;
const { Option, OptGroup } = Select;

const RefereeDashboardPage = () => {
    const { user } = useAuth();
    const [races, setRaces] = useState([]);
    const [loading, setLoading] = useState(false);

    const [isResultModalVisible, setIsResultModalVisible] = useState(false);
    const [isReportModalVisible, setIsReportModalVisible] = useState(false);
    const [selectedRace, setSelectedRace] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [formResult] = Form.useForm();
    const [formReport] = Form.useForm();

    const [reportsHistory, setReportsHistory] = useState([]);

    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        fetchRaces();
        fetchReports();
    }, []);

    const fetchRaces = async () => {
        setLoading(true);
        try {
            const response = await api.get('/races');
            const sorted = response.data.sort((a, b) => (a.status === 'FINISHED' ? 1 : -1));
            setRaces(sorted);
        } catch (error) { message.error('Lỗi tải danh sách chặng đua!'); }
        finally { setLoading(false); }
    };

    const fetchReports = async () => {
        try {
            const response = await api.get('/referees/reports');
            setReportsHistory(response.data);
        } catch (error) {
            console.error('Failed to fetch reports', error);
        }
    };

    const fetchRegistrations = async (raceId) => {
        try {
            const res = await api.get('/registrations', { params: { raceId } });
            setRegistrations(res.data.filter(r => r.status === 'APPROVED_BY_ADMIN' || r.status === 'PENDING_APPROVAL'));
        } catch (error) { message.error('Lỗi tải danh sách thi đấu!'); }
    };

    // --- TRỌNG TÀI ẤN NÚT BẮT ĐẦU ĐUA ---
    const handleStartRace = async (race) => {
        try {
            await api.put(`/races/${race.id}`, {
                tournamentId: race.tournamentId,
                name: race.name,
                status: 'RUNNING'
            });
            message.success('Đã phát lệnh bắt đầu! Tỷ lệ cược đã được chốt sổ tự động.');
            fetchRaces();
        } catch (error) {
            const errorMsg = error.response?.data?.error || error.response?.data?.message || error.response?.data || 'Có lỗi xảy ra khi bắt đầu chặng đua!';
            message.error(typeof errorMsg === 'string' ? errorMsg : 'Có lỗi xảy ra khi bắt đầu chặng đua!');
        }
    };

    const openResultModal = async (race) => {
        setSelectedRace(race);
        await fetchRegistrations(race.id);
        formResult.resetFields();
        setTime(0);
        setIsRunning(false);
        if (timerRef.current) clearInterval(timerRef.current);
        setIsResultModalVisible(true);
    };

    const openReportModal = async (race) => {
        setSelectedRace(race);
        await fetchRegistrations(race.id);
        formReport.resetFields();
        setIsReportModalVisible(true);
    };

    const startTimer = () => {
        if (!isRunning) {
            setIsRunning(true);
            timerRef.current = setInterval(() => setTime(prev => prev + 10), 10);
        }
    };
    const pauseTimer = () => {
        setIsRunning(false);
        if (timerRef.current) clearInterval(timerRef.current);
    };
    const resetTimer = () => {
        setIsRunning(false);
        if (timerRef.current) clearInterval(timerRef.current);
        setTime(0);
    };
    const formatTime = (ms) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const centiseconds = Math.floor((ms % 1000) / 10);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
    };

    const handleSubmitResult = async (values) => {
        try {
            await api.post('/referees/results', {
                raceId: selectedRace.id,
                refereeId: user.id,
                top1RegistrationId: values.top1,
                top2RegistrationId: values.top2,
                top3RegistrationId: values.top3
            });
            message.success('Đã Ký Xác Nhận! Hệ thống đang tự động cộng tiền cho người thắng cược. 💸');
            setIsResultModalVisible(false);
            fetchRaces();
        } catch (error) { message.error(error.response?.data?.message || 'Có lỗi khi chốt kết quả!'); }
    };

    const handleSubmitReport = async (values) => {
        try {
            const fullDetails = `[${values.penaltyType}] ${values.reason}`;
            await api.post('/referees/reports', {
                raceId: selectedRace.id,
                refereeId: user.id,
                registrationId: values.registrationId,
                violationDetails: fullDetails
            });

            await fetchReports();

            message.success('Lập biên bản vi phạm thành công! 📝');
            setIsReportModalVisible(false);
        } catch (error) { message.error(error.response?.data?.message || 'Có lỗi khi lập biên bản!'); }
    };

    const statusMap = { 
        REGISTRATION: 'orange', 
        BETTING: 'blue', 
        LOCK_SESSION: 'gray', 
        RUNNING: 'red', 
        FINISHED: 'cyan',
        RESULT_CONFIRMED: 'purple',
        COMPLETED: 'green',
        CANCELED: 'default' 
    };

    const expandedRowRender = (race) => {
        return (
            <Card size="small" className="bg-blue-50 border-dashed border-blue-200 ml-10">
                <Text strong className="block mb-2">Danh Sách Cặp Thi Đấu:</Text>
                <Button size="small" type="dashed" onClick={() => fetchRegistrations(race.id)}>Tải danh sách chi tiết</Button>
                {registrations.length > 0 && (
                    <ul className="mt-2 pl-5 list-disc text-gray-700">
                        {registrations.map(r => (
                            <li key={r.id}>Ngựa: <Text strong className="text-black">{r.horseName}</Text> - Điều khiển: <Text type="secondary">{r.jockeyUsername || 'Không có nài'}</Text></li>
                        ))}
                    </ul>
                )}
            </Card>
        )
    };

    const columns = [
        { title: 'Tên Giải', dataIndex: 'tournamentName', key: 'tournamentName' },
        { title: 'Chặng Đua', dataIndex: 'name', key: 'name', render: t => <Text strong className="text-blue-700">{t}</Text> },
        { title: 'Giờ Lên Lịch', dataIndex: 'raceTime', render: v => dayjs(v).format('HH:mm DD/MM/YYYY') },
        { 
            title: 'Trạng Thái', 
            dataIndex: 'status', 
            render: s => { 
                const text = s === 'REGISTRATION' ? 'ĐĂNG KÝ THI ĐẤU' : 
                             s === 'BETTING' ? 'NHẬN ĐẶT CƯỢC' : 
                             s === 'LOCK_SESSION' ? 'KHÓA NHẬN CƯỢC' : 
                             s === 'RUNNING' ? 'ĐANG THI ĐẤU' : 
                             s === 'FINISHED' ? 'CHỜ KẾT QUẢ' : 
                             s === 'RESULT_CONFIRMED' ? 'ĐÃ CÓ KẾT QUẢ' :
                             s === 'COMPLETED' ? 'ĐÃ HOÀN TẤT' :
                             s === 'CANCELED' ? 'ĐÃ HỦY CHẶNG' : s; 
                return <Tag color={statusMap[s]} className="font-bold">{text}</Tag>; 
            } 
        },
        {
            title: 'Nghiệp Vụ',
            key: 'action',
            align: 'right',
            render: (_, record) => {
                if (record.refereeId !== user?.id) {
                    return <Text type="secondary" italic>Chỉ xem (Không được phân công)</Text>;
                }
                if (record.status === 'COMPLETED') return <Text type="success" className="font-bold"><SafetyCertificateOutlined /> Đã Phát Thưởng</Text>;
                if (record.status === 'CANCELED') return <Text type="secondary">Chặng Bị Hủy</Text>;

                const isReadyToStart = record.status === 'LOCK_SESSION';
                const isRunning = record.status === 'RUNNING';
                const isFinished = record.status === 'FINISHED';

                return (
                    <Space>
                        {isReadyToStart && (
                            <Button size="small" type="primary" className="bg-red-600 border-none font-bold shadow-lg" onClick={() => handleStartRace(record)}>BẮT ĐẦU ĐUA</Button>
                        )}
                        {isFinished && (
                            <Popconfirm title="Xác nhận kết quả cuối cùng?" onConfirm={() => handleConfirmResult(record.id)}>
                                <Button size="small" type="primary" className="bg-purple-600 border-none font-bold">KÝ XÁC NHẬN KẾT QUẢ</Button>
                            </Popconfirm>
                        )}
                        <Button danger icon={<WarningOutlined />} onClick={() => openReportModal(record)} disabled={!isRunning}>
                            Phạt Vi Phạm
                        </Button>
                        <Button type="primary" className={isRunning ? "bg-blue-600" : ""} onClick={() => openResultModal(record)} disabled={!isRunning}>
                            Giám Sát & Chốt KQ
                        </Button>
                    </Space>
                );
            }
        }
    ];

    const historyColumns = [
        { title: 'Ngày Lập', dataIndex: 'date', render: d => dayjs(d).format('HH:mm DD/MM/YYYY') },
        { title: 'Người Lập', dataIndex: 'refereeName', render: n => <Text strong className="text-blue-600">{n}</Text> },
        { title: 'Chặng Đua', dataIndex: 'raceName', render: t => <Text strong>{t}</Text> },
        { title: 'Nội Dung', dataIndex: 'target', render: (t, record) => record.penalty === 'KẾT QUẢ THI ĐẤU' ? <Text type="success">Xác nhận kết quả chung cuộc</Text> : t },
        { title: 'Loại/Mức Phạt', dataIndex: 'penalty', render: p => p === 'KẾT QUẢ THI ĐẤU' ? <Tag color="green">KẾT QUẢ</Tag> : <Tag color="red">{p}</Tag> },
        { title: 'Chi Tiết', dataIndex: 'reason' }
    ];

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <Card className="shadow-xl rounded-2xl border-none">
                <Row justify="space-between" align="middle" className="mb-6">
                    <Col>
                        <Title level={2} className="m-0 flex items-center gap-3"><FileProtectOutlined className="text-blue-600" /> Hệ Thống Giám Sát Trọng Tài</Title>
                    </Col>
                </Row>

                <Tabs size="large" items={[
                    {
                        key: '1',
                        label: 'Phân Công Của Tôi (Thao Tác)',
                        children: <Table columns={columns} dataSource={races.filter(r => r.refereeId === user?.id)} rowKey="id" loading={loading} className="border rounded-xl" expandable={{ expandedRowRender, onExpand: (exp, rec) => { if(exp) fetchRegistrations(rec.id) } }} locale={{ emptyText: 'Bạn chưa được phân công giám sát chặng đua nào.' }} />
                    },
                    {
                        key: '2',
                        label: 'Lịch Thi Đấu Chung (Chỉ Xem)',
                        children: <Table columns={columns} dataSource={races} rowKey="id" loading={loading} className="border rounded-xl" expandable={{ expandedRowRender, onExpand: (exp, rec) => { if(exp) fetchRegistrations(rec.id) } }} />
                    },
                    {
                        key: '3',
                        label: 'Lịch Sử Biên Bản',
                        children: <Table columns={historyColumns} dataSource={reportsHistory} rowKey="id" className="border rounded-xl" locale={{ emptyText: 'Chưa có biên bản nào được lập.' }} />
                    }
                ]} />
            </Card>

            <Modal title={<span className="text-xl">Bảng Điều Khiển Live: <span className="text-blue-600 uppercase">{selectedRace?.name}</span></span>} open={isResultModalVisible} onCancel={() => setIsResultModalVisible(false)} footer={null} width={800} centered>

                <div className="bg-gray-900 rounded-2xl p-6 text-center mb-6 shadow-inner border-4 border-gray-700">
                    <Text className="text-gray-400 block mb-2 uppercase tracking-widest text-xs font-bold">Đồng Hồ Bấm Giờ (Timer)</Text>
                    <div className="text-6xl font-black text-green-400 tracking-wider mb-6" style={{ fontFamily: 'monospace' }}>
                        {formatTime(time)}
                    </div>
                    <Space size="large">
                        <Button type="primary" size="large" icon={<PlayCircleOutlined />} className="bg-green-600 w-32 font-bold" onClick={startTimer}>BẮT ĐẦU</Button>
                        <Button size="large" icon={<PauseCircleOutlined />} className="w-32 bg-gray-600 text-white font-bold border-none hover:bg-gray-500" onClick={pauseTimer}>TẠM DỪNG</Button>
                        <Button size="large" icon={<ReloadOutlined />} className="w-32 font-bold" onClick={resetTimer}>ĐẶT LẠI</Button>
                    </Space>
                </div>

                <Form form={formResult} layout="vertical" onFinish={handleSubmitResult}>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="top1" label={<Text strong className="text-yellow-600">🥇 Hạng 1 (Ngựa Về Nhất)</Text>} rules={[{ required: true, message: 'Bắt buộc chọn Hạng 1' }]}>
                                <Select placeholder="Chọn chiến mã">
                                    {registrations.map(r => <Option key={r.id} value={r.id}>{r.horseName}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="top2" label={<Text strong className="text-gray-500">🥈 Hạng 2</Text>}>
                                <Select placeholder="Chọn chiến mã">
                                    {registrations.map(r => <Option key={r.id} value={r.id}>{r.horseName}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="top3" label={<Text strong className="text-orange-700">🥉 Hạng 3</Text>}>
                                <Select placeholder="Chọn chiến mã">
                                    {registrations.map(r => <Option key={r.id} value={r.id}>{r.horseName}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Alert message="Lưu ý Trọng Tài" description="Sau khi nhấn Ký Xác Nhận, hệ thống sẽ đóng sổ chặng đua và tự động giải ngân hàng tỷ đồng tiền cược vào ví khán giả. Chữ ký này mang tính quyết định cuối cùng." type="error" showIcon className="mb-4" />
                    <Button type="primary" htmlType="submit" size="large" block className="h-14 bg-red-600 hover:bg-red-700 text-lg font-bold border-none shadow-lg">
                        ✍️ KÝ XÁC NHẬN KẾT QUẢ & PHÁT THƯỞNG
                    </Button>
                </Form>
            </Modal>

            <Modal title={<span className="text-xl text-red-600"><WarningOutlined/> Lập Biên Bản Vi Phạm Trực Tiếp</span>} open={isReportModalVisible} onCancel={() => setIsReportModalVisible(false)} footer={null} centered>
                <Form form={formReport} layout="vertical" onFinish={handleSubmitReport} className="mt-4">
                    <Form.Item name="registrationId" label={<Text strong>Chọn Đối Tượng Vi Phạm</Text>} rules={[{ required: true, message: 'Vui lòng chọn đối tượng' }]}>
                        <Select placeholder="-- Chọn Ngựa hoặc Nài ngựa vi phạm --" size="large">
                            <OptGroup label="🐴 Lỗi do Chiến Mã (Ép ép, cắn, bỏ đường đua)">
                                {registrations.map(r => <Option key={'h_'+r.id} value={r.id}>Ngựa: {r.horseName}</Option>)}
                            </OptGroup>
                            <OptGroup label="🏇 Lỗi do Nài Ngựa (Sử dụng roi sai quy định, cản trở)">
                                {registrations.map(r => <Option key={'j_'+r.id} value={r.id}>Nài: {r.jockeyUsername || 'Không rõ'} (Cưỡi ngựa {r.horseName})</Option>)}
                            </OptGroup>
                        </Select>
                    </Form.Item>

                    <Form.Item name="penaltyType" label={<Text strong>Hình Thức Xử Lý</Text>} rules={[{ required: true, message: 'Vui lòng chọn mức phạt' }]}>
                        <Select placeholder="-- Chọn mức phạt --" size="large">
                            <Option value="Cảnh cáo">⚠️ Cảnh cáo (Thẻ vàng)</Option>
                            <Option value="Trừ vị trí xếp hạng">⬇️ Trừ vị trí xếp hạng khi về đích (Penalty Rank)</Option>
                            <Option value="Truất quyền thi đấu">❌ Truất quyền thi đấu (Disqualified - DQ)</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="reason" label={<Text strong>Lý Do Phạt (Mô tả tình huống)</Text>} rules={[{ required: true, message: 'Vui lòng điền lý do' }]}>
                        <Input.TextArea rows={4} placeholder="Ghi rõ tình huống phạm luật lúc bao nhiêu phút, khúc cua số mấy..." size="large" />
                    </Form.Item>
                    <Button type="primary" danger htmlType="submit" size="large" block className="mt-4 font-bold">LƯU BIÊN BẢN VÀO HỆ THỐNG</Button>
                </Form>
            </Modal>
        </div>
    );
};

export default RefereeDashboardPage;