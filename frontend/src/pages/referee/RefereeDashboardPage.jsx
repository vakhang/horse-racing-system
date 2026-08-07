// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Tag, Space, message, Card, Typography, Modal, Form, Select, Row, Col, Input, Tabs, Alert, Popconfirm, InputNumber } from 'antd';
import { FileProtectOutlined, SafetyCertificateOutlined, WarningOutlined, PlayCircleOutlined, PauseCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import api from "../../config/api.js";
import dayjs from 'dayjs';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;
const { Option, OptGroup } = Select;

// [Chức năng rõ ràng]: Trang Dashboard Trọng Tài
// [Tác dụng]: Cho phép trọng tài xem lịch đua trong ngày, báo cáo sự cố (Report) và nhập kết quả về đích (Rank) cho từng con ngựa.
// [Hướng dẫn sửa đổi]:
// - Logic: API gọi tới `/referees/...`. UI: Thêm tính năng kéo-thả (Drag & Drop) để sắp xếp thứ hạng ngựa thay vì nhập số.
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

    // State Cân Nài & Bù Chì
    const [isWeighingModalVisible, setIsWeighingModalVisible] = useState(false);
    const [weighingRace, setWeighingRace] = useState(null);
    const [weighingList, setWeighingList] = useState([]);
    const [actualWeights, setActualWeights] = useState({});

    const openWeighingModal = async (race) => {
        setWeighingRace(race);
        setIsWeighingModalVisible(true);
        try {
            const res = await api.get(`/registrations?raceId=${race.id}`);
            setWeighingList(res.data);
            const initialMap = {};
            res.data.forEach(r => {
                initialMap[r.id] = r.actualWeight || r.jockeyWeight || 52;
            });
            setActualWeights(initialMap);
        } catch (err) {
            message.error('Không thể tải danh sách thi đấu!');
        }
    };

    const handleSaveWeighing = async (reg) => {
        const val = actualWeights[reg.id];
        if (!val || val <= 0) {
            return message.warning('Vui lòng nhập khối lượng thực tế hợp lệ (kg)!');
        }
        try {
            await api.post('/referees/weighing', {
                registrationId: reg.id,
                actualWeight: parseFloat(val)
            });
            message.success(`Đã xác nhận cân thực tế cho ${reg.horseName}! ⚖️`);
            const res = await api.get(`/registrations?raceId=${weighingRace.id}`);
            setWeighingList(res.data);
        } catch (err) {
            message.error(err.response?.data?.error || 'Lỗi khi lưu thông tin cân nài!');
        }
    };

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

    const handleAssignGate = async (regId, gateNumber) => {
        try {
            await api.put(`/registrations/${regId}/gate`, { gateNumber });
            message.success(`Đã gán Cổng xuất phát #${gateNumber}! 🎲`);
            if (weighingRace) {
                const res = await api.get(`/registrations?raceId=${weighingRace.id}`);
                setWeighingList(res.data);
            }
        } catch (err) {
            message.error(err.response?.data?.error || 'Không thể gán cổng xuất phát!');
        }
    };

    const handleRandomDrawGates = async () => {
        if (!weighingList || weighingList.length === 0) return;
        const gates = Array.from({ length: weighingList.length }, (_, i) => i + 1);
        for (let i = gates.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [gates[i], gates[j]] = [gates[j], gates[i]];
        }

        try {
            for (let i = 0; i < weighingList.length; i++) {
                await api.put(`/registrations/${weighingList[i].id}/gate`, { gateNumber: gates[i] });
            }
            message.success('Đã bốc thăm ngẫu nhiên Cổng xuất phát cho tất cả chiến mã! 🎲');
            const res = await api.get(`/registrations?raceId=${weighingRace.id}`);
            setWeighingList(res.data);
        } catch (err) {
            message.error('Lỗi khi bốc thăm cổng!');
        }
    };

    // --- TRỌNG TÀI ẤN NÚT BẮT ĐẦU ĐUA ---
    const handleStartRace = async (race) => {
        try {
            const res = await api.get(`/registrations?raceId=${race.id}`);
            const activeRegs = res.data.filter(r => r.status !== 'WITHDRAWN' && r.status !== 'DISQUALIFIED');
            const unassignedGateCount = activeRegs.filter(r => !r.gateNumber).length;

            if (unassignedGateCount > 0) {
                Modal.confirm({
                    title: '⚠️ Chưa Xóa Bốc Thăm / Gán Cổng Xuất Phát!',
                    content: `Hiện có ${unassignedGateCount} chiến mã chưa được gán Cổng xuất phát (Gate #). Trọng tài cần xác nhận bốc thăm cổng trước khi bấm Bắt Đầu.`,
                    okText: 'Mở Bảng Bốc Thăm & Cân Nài',
                    cancelText: 'Hủy Bỏ',
                    onOk: () => openWeighingModal(race)
                });
                return;
            }

            await api.put(`/races/${race.id}`, {
                tournamentId: race.tournamentId,
                name: race.name,
                status: 'RUNNING'
            });
            message.success('Đã phát lệnh bắt đầu đua! 🏁 Tỷ lệ cược đã được chốt sổ tự động.');
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

    const handleConfirmResult = (raceId) => {
        const race = races.find(r => r.id === raceId);
        setSelectedRace(race);
        fetchRegistrations(raceId);
        setIsResultModalVisible(true);
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
                    <Space wrap>
                        <Button size="small" type="primary" className="bg-amber-600 border-none font-bold" onClick={() => openWeighingModal(record)}>
                            🎲 Bốc Thăm Cổng & ⚖️ Cân Nài
                        </Button>
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

            <Modal
                title={<span className="text-xl font-bold text-amber-600">🎲 Bốc Thăm Cổng Xuất Phát & ⚖️ Cân Nài Bù Chì: {weighingRace?.name}</span>}
                open={isWeighingModalVisible}
                onCancel={() => setIsWeighingModalVisible(false)}
                footer={[
                    <Button key="random" type="primary" className="bg-purple-600 border-none font-bold mr-2" onClick={handleRandomDrawGates}>
                        🎲 BỐC THĂM CỔNG TỰ ĐỘNG
                    </Button>,
                    <Button key="close" onClick={() => setIsWeighingModalVisible(false)}>
                        Đóng
                    </Button>
                ]}
                width={950}
                centered
            >
                <div className="py-2">
                    <Alert
                        message="Xác Nhận Cổng Xuất Phát & Quy Trình Cân Nài Thực Địa"
                        description="Trọng tài thực hiện Bốc thăm Cổng xuất phát (Gate #) cho từng chiến mã, sau đó đưa kỵ sĩ và yên cương lên bàn cân để xác nhận Khối lượng thực tế và phát chì lá bù tải trọng trước khi phát lệnh Bắt Đầu Đua."
                        type="info"
                        showIcon
                        className="mb-4"
                    />

                    <Table
                        dataSource={weighingList}
                        rowKey="id"
                        pagination={false}
                        columns={[
                            {
                                title: 'Cổng Xuất Phát 🎲',
                                key: 'gateNumber',
                                width: 130,
                                render: (_, r) => (
                                    <Select
                                        size="small"
                                        className="w-28 font-bold"
                                        value={r.gateNumber || undefined}
                                        placeholder="-- Gán Cổng --"
                                        onChange={(g) => handleAssignGate(r.id, g)}
                                    >
                                        {Array.from({ length: Math.max(8, weighingList.length) }, (_, i) => i + 1).map(num => (
                                            <Option key={num} value={num}>Cổng #{num}</Option>
                                        ))}
                                    </Select>
                                )
                            },
                            { title: 'Chiến Mã', dataIndex: 'horseName', render: (t, r) => <Text strong className="text-blue-700">{t}</Text> },
                            { title: 'Nài Ngựa', dataIndex: 'jockeyUsername', render: (t, r) => (
                                <div>
                                    <Text strong>{t || 'Chưa rõ'}</Text>
                                    <br/>
                                    <Text type="secondary" className="text-xs">Khai báo: {r.jockeyWeight ? `${r.jockeyWeight} kg` : 'Chưa có'}</Text>
                                </div>
                            ) },
                            { title: 'Tải Chỉ Định', dataIndex: 'assignedWeight', render: w => <Tag color="blue" className="font-bold">{w ? `${w} kg` : '52.1 kg'}</Tag> },
                            {
                                title: 'Khối Lượng Thực Tế (kg)',
                                key: 'actualWeight',
                                render: (_, r) => (
                                    <InputNumber
                                        min={30}
                                        max={120}
                                        step={0.1}
                                        size="small"
                                        className="w-28"
                                        value={actualWeights[r.id] ?? r.actualWeight ?? r.jockeyWeight ?? 50}
                                        onChange={(val) => setActualWeights(prev => ({ ...prev, [r.id]: val }))}
                                    />
                                )
                            },
                            {
                                title: 'Bù Chì Thêm',
                                key: 'leadWeight',
                                render: (_, r) => {
                                    const assigned = r.assignedWeight || 52.1;
                                    const actual = actualWeights[r.id] ?? r.actualWeight ?? r.jockeyWeight ?? 50;
                                    const lead = Math.max(0, Math.round((assigned - actual) * 10) / 10);
                                    return lead > 0 ? (
                                        <Tag color="orange" className="font-bold">+{lead} kg chì</Tag>
                                    ) : (
                                        <Tag color="green">Đủ tải trọng</Tag>
                                    );
                                }
                            },
                            {
                                title: 'Xác Nhận',
                                key: 'action',
                                align: 'center',
                                render: (_, r) => (
                                    <Button
                                        size="small"
                                        type={r.isWeighedIn ? "default" : "primary"}
                                        className={r.isWeighedIn ? "text-green-600 border-green-600 font-bold" : "bg-amber-600 font-bold"}
                                        onClick={() => handleSaveWeighing(r)}
                                    >
                                        {r.isWeighedIn ? "✅ ĐÃ KIỂM TRA & ĐEO CHÌ" : "⚖️ XÁC NHẬN CÂN"}
                                    </Button>
                                )
                            }
                        ]}
                    />
                </div>
            </Modal>
        </div>
    );
};

export default RefereeDashboardPage;