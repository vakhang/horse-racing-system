import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, message, Card, Typography, Row, Col, Modal, Form, Input, DatePicker, Select, InputNumber, Popconfirm, Divider, Badge, Alert, List, Avatar, Tabs } from 'antd';
import { TrophyOutlined, PlusOutlined, EditOutlined, FlagOutlined, StopOutlined, UserOutlined, DeleteOutlined, CloseCircleOutlined, CrownOutlined, FileExclamationOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import api from "../../config/api.js";
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

// [Chức năng rõ ràng]: Trang Quản Lý Giải Đấu, Chặng Đua & Kháng Cáo dành cho Admin
// [Tác dụng]:
// 1. Tạo mới và quản lý Giải đấu, Chặng đua, Bảng giải thưởng (Hạng 1, 2, 3...).
// 2. Phân công Trọng tài phụ trách từng chặng đua. Hủy chặng đua (hoàn tiền 100%).
// 3. Phê duyệt hoặc Bác bỏ các đơn Kháng cáo từ Chủ Ngựa và Nài Ngựa.
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
    const [selectedRaceForWithdraw, setSelectedRaceForWithdraw] = useState(null);
    const [raceRegistrations, setRaceRegistrations] = useState([]);
    const [isResultModalVisible, setIsResultModalVisible] = useState(false);
    const [selectedRaceForResults, setSelectedRaceForResults] = useState(null);
    const [raceResults, setRaceResults] = useState([]);

    // State Kháng cáo
    const [systemAppeals, setSystemAppeals] = useState([]);

    // State Đổi trọng tài
    const [isChangeRefereeModalVisible, setIsChangeRefereeModalVisible] = useState(false);
    const [selectedRaceForChangeReferee, setSelectedRaceForChangeReferee] = useState(null);
    const [selectedRefereeId, setSelectedRefereeId] = useState(null);

    const openChangeRefereeModal = (race) => {
        fetchReferees();
        setSelectedRaceForChangeReferee(race);
        setSelectedRefereeId(race.refereeId || null);
        setIsChangeRefereeModalVisible(true);
    };

    const handleChangeRefereeSubmit = async () => {
        if (!selectedRefereeId) {
            return message.warning('Vui lòng chọn trọng tài mới!');
        }
        try {
            try {
                await api.put(`/races/${selectedRaceForChangeReferee.id}/referee`, { refereeId: selectedRefereeId });
            } catch (err) {
                if (err.response && err.response.status === 404) {
                    await api.put(`/races/${selectedRaceForChangeReferee.id}`, { refereeId: selectedRefereeId });
                } else {
                    throw err;
                }
            }
            message.success('Cập nhật trọng tài cho chặng đua thành công! 👔');
            setIsChangeRefereeModalVisible(false);
            fetchTournaments();
        } catch (error) {
            message.error(error.response?.data?.error || error.response?.data?.message || 'Có lỗi khi cập nhật trọng tài!');
        }
    };

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

    const fetchSystemAppeals = () => {
        try {
            const saved = JSON.parse(localStorage.getItem('all_system_appeals') || '[]');
            setSystemAppeals(saved);
        } catch (error) {
            console.error('Lỗi lấy danh sách kháng cáo hệ thống:', error);
        }
    };

    useEffect(() => {
        fetchTournaments();
        fetchReferees();
        fetchSystemAppeals();
    }, []);

    const handleResolveAppeal = (appealId, newStatus) => {
        try {
            const updated = systemAppeals.map(app => app.id === appealId ? { ...app, status: newStatus } : app);
            setSystemAppeals(updated);
            localStorage.setItem('all_system_appeals', JSON.stringify(updated));
            message.success(newStatus === 'APPROVED' ? 'Đã CHẤP NHẬN đơn kháng cáo (Hội đồng sẽ rà soát kết quả)!' : 'Đã BÁC BỎ đơn kháng cáo!');
        } catch (e) {
            message.error('Có lỗi xảy ra!');
        }
    };

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
                reason: values.reason,
                requiredClass: values.requiredClass || 4
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
                raceClass: values.raceClass || 4,
                rakePercentage: 35
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
            raceClass: record.raceClass || 4,
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

    const handleViewResult = async (race) => {
        try {
            setSelectedRaceForResults(race);
            const response = await api.get('/registrations', { params: { raceId: race.id } });
            const finished = response.data.filter(r => r.finishPosition != null);
            finished.sort((a, b) => a.finishPosition - b.finishPosition);
            setRaceResults(finished);
            setIsResultModalVisible(true);
        } catch (e) {
            message.error("Lỗi lấy dữ liệu kết quả!");
        }
    };

    const disabledDate = (current) => {
        return current && current < dayjs().startOf('day');
    };

    const appealColumns = [
        { title: 'Mã Đơn', dataIndex: 'id', render: id => <Text type="secondary">#{id}</Text> },
        { title: 'Người Kháng Cáo', render: (_, r) => <Text strong className="text-blue-700">{r.jockeyName || r.ownerName || 'Người dùng'} ({r.jockeyName ? 'Nài Ngựa' : 'Chủ Ngựa'})</Text> },
        { title: 'Chặng Đua', dataIndex: 'raceName', render: t => <Text strong>{t}</Text> },
        { title: 'Chiến Mã', dataIndex: 'horseName' },
        { title: 'Nội Dung Kháng Cáo', dataIndex: 'reason' },
        { title: 'Minh Chứng', dataIndex: 'evidence', render: e => <Text type="secondary" italic>{e}</Text> },
        {
            title: 'Trạng Thái',
            dataIndex: 'status',
            render: s => s === 'APPROVED' ? <Tag color="green">ĐÃ DUYỆT (ĐIỀU CHỈNH KQ)</Tag> : s === 'REJECTED' ? <Tag color="red">ĐÃ BÁC BỎ</Tag> : <Tag color="orange">CHỜ KẾT QUẢ RÀ SOÁT</Tag>
        },
        {
            title: 'Hành Động Admin',
            align: 'right',
            render: (_, record) => {
                if (record.status !== 'PENDING') return <Text type="secondary">Đã xử lý</Text>;
                return (
                    <Space>
                        <Popconfirm title="Chấp nhận đơn và điều chỉnh kết quả?" onConfirm={() => handleResolveAppeal(record.id, 'APPROVED')}>
                            <Button type="primary" size="small" className="bg-green-600 border-none" icon={<CheckOutlined />}>Chấp Nhận</Button>
                        </Popconfirm>
                        <Popconfirm title="Bác bỏ đơn kháng cáo này?" onConfirm={() => handleResolveAppeal(record.id, 'REJECTED')}>
                            <Button danger size="small" icon={<CloseOutlined />}>Bác Bỏ</Button>
                        </Popconfirm>
                    </Space>
                );
            }
        }
    ];

    const expandedRowRender = (tournament) => {
        const columns = [
            { title: 'Tên Chặng', dataIndex: 'name', key: 'name', render: t => <Text strong>{t}</Text> },
            { title: 'Class Quy Định', dataIndex: 'raceClass', render: v => <Tag color="magenta" className="font-bold">CLASS {v || 4}</Tag> },
            { title: 'Giờ Xuất Phát', dataIndex: 'raceTime', render: v => v ? dayjs(v).format('DD/MM/YYYY HH:mm') : 'Chưa định' },
            { title: 'Live Pool', dataIndex: 'totalPool', render: v => <Text strong className="text-green-600">{v ? v.toLocaleString() + ' đ' : '0 đ'}</Text> },
            { title: 'Takeout Rate', dataIndex: 'rakePercentage', render: v => <Text strong className="text-yellow-600">{v || 20}%</Text> },
            {
                title: 'Trọng Tài Phụ Trách',
                key: 'referee',
                render: (_, r) => {
                    const canChange = r.status === 'REGISTRATION' || r.status === 'BETTING' || r.status === 'LOCK_SESSION';
                    return (
                        <Space>
                            {r.refereeUsername ? <Tag color="blue" className="font-bold"><UserOutlined /> {r.refereeUsername}</Tag> : <Text type="secondary" italic>Chưa phân công</Text>}
                            {canChange && (
                                <Button size="small" type="dashed" className="text-yellow-400 border-yellow-500 font-bold" onClick={() => openChangeRefereeModal(r)}>
                                    ✏️ Đổi
                                </Button>
                            )}
                        </Space>
                    );
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
                title: 'Thao Tác Quản Lý',
                align: 'right',
                render: (_, record) => (
                    <Space wrap>
                        {record.status === 'REGISTRATION' && (
                            <Popconfirm title="Chốt danh sách ngựa thi đấu (Chuyển sang bước Cân Nài & Gán Cổng)?" onConfirm={() => handleForceTransition(record, 'LOCK_SESSION')}>
                                <Button size="small" type="primary" className="bg-amber-600 border-none font-bold">📋 CHỐT DANH SÁCH THI ĐẤU</Button>
                            </Popconfirm>
                        )}
                        {record.status === 'LOCK_SESSION' && (
                            <Popconfirm title="Mở cổng cho Khán giả đặt cược Pari-mutuel?" onConfirm={() => handleForceTransition(record, 'BETTING')}>
                                <Button size="small" type="primary" className="bg-green-600 border-none font-bold shadow-md">🔓 MỞ ĐẶT CƯỢC (BETTING)</Button>
                            </Popconfirm>
                        )}
                        {record.status === 'BETTING' && (
                            <Popconfirm title="Khóa cổng cược ngay lập tức để chuẩn bị chạy?" onConfirm={() => handleForceTransition(record, 'LOCK_SESSION')}>
                                <Button size="small" type="primary" style={{ backgroundColor: '#595959', fontWeight: 'bold' }}>🔒 KHÓA CỔNG NHẬN CƯỢC</Button>
                            </Popconfirm>
                        )}
                        <Button size="small" type="primary" className="bg-purple-600 border-none font-bold" onClick={() => openWithdrawModal(record)}>📋 Danh Sách Ngựa</Button>
                        <Button size="small" type="primary" ghost icon={<EditOutlined />} onClick={() => openEditRaceModal(record)}>Thiết Lập</Button>
                        {(record.status === 'RESULT_CONFIRMED' || record.status === 'COMPLETED') && (
                            <Button size="small" type="dashed" className="text-blue-600 font-bold" onClick={() => handleViewResult(record)}>🏆 XEM KẾT QUẢ</Button>
                        )}
                        {record.status === 'RESULT_CONFIRMED' && (
                            <Popconfirm title="Thực hiện trả thưởng cho khán giả và kết thúc chặng?" onConfirm={async () => { await handlePayout(record.id); await handleForceTransition(record, 'COMPLETED'); }}>
                                <Button size="small" type="primary" className="font-bold bg-blue-600">💸 XÁC NHẬN TRẢ THƯỢC</Button>
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
            <Card key={`card-${tournament.id}`} className="bg-[#162a22] border-dashed border-[#007355] m-2 overflow-x-auto">
                <Table
                    key={`race-table-${tournament.id}`}
                    columns={columns}
                    dataSource={tournament.races || []} 
                    rowKey="id" 
                    pagination={false} 
                    size="small"
                    scroll={{ x: 'max-content' }}
                />
            </Card>
        );
    };

    return (
        <div className="p-4 md:p-8 bg-[#121212] min-h-screen max-w-full overflow-x-auto">
            <Card className="shadow-xl rounded-2xl border-none bg-[#1e1e1e]">
                <Row justify="space-between" className="mb-6">
                    <Col>
                        <Title level={2}><TrophyOutlined className="text-yellow-500" /> Quản Lý Giải Đấu & Chặng Đua</Title>
                        <Text type="secondary">Tạo giải, lên lịch chặng, phân công trọng tài, treo thưởng và giải quyết kháng cáo.</Text>
                    </Col>
                    <Col><Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => { setEditingTourId(null); tourForm.resetFields(); setIsTourModalVisible(true); }}>Tạo Giải Đấu Mới</Button></Col>
                </Row>

                <Tabs size="large" items={[
                    {
                        key: 'tournaments',
                        label: <span className="font-bold"><TrophyOutlined /> Danh Sách Giải Đấu & Chặng Đua</span>,
                        children: (
                            <Table columns={[
                                { title: 'Tên Giải Đấu', dataIndex: 'name', render: t => <Text strong className="text-blue-700 text-lg">{t}</Text> },
                                { title: 'Class Quy Định', dataIndex: 'requiredClass', render: c => <Tag color="gold" className="font-bold">Class {c || 4}</Tag> },
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
                                        <Button type="primary" ghost icon={<EditOutlined />} onClick={() => { setEditingTourId(r.id); tourForm.setFieldsValue({ name: r.name, dates: [dayjs(r.startDate), dayjs(r.endDate)], status: r.status, requiredClass: r.requiredClass || 4, reason: '' }); setIsTourModalVisible(true); }} />
                                        <Popconfirm title="Xác nhận xóa hoàn toàn giải đấu này?" onConfirm={() => handleDeleteTournament(r.id)} okText="Xóa" okButtonProps={{ danger: true }} cancelText="Hủy">
                                            <Button danger icon={<DeleteOutlined />} />
                                        </Popconfirm>
                                    </Space>
                                }
                            ]} dataSource={tournaments} rowKey="id" loading={loading} expandable={{ expandedRowRender, onExpand: (exp, rec) => exp && fetchRacesForTournament(rec.id) }} className="border rounded-xl" scroll={{ x: 'max-content' }} />
                        )
                    },
                    {
                        key: 'appeals',
                        label: <span className="font-bold"><FileExclamationOutlined /> Xử Lý Kháng Cáo ({systemAppeals.filter(a => a.status === 'PENDING').length})</span>,
                        children: (
                            <Table columns={appealColumns} dataSource={systemAppeals} rowKey="id" className="border rounded-xl" locale={{ emptyText: 'Hiện chưa có đơn kháng cáo nào.' }} />
                        )
                    }
                ]} />
            </Card>

            {/* MODAL QUẢN LÝ GIẢI ĐẤU */}
            <Modal title={<span className="text-xl">{editingTourId ? 'Chỉnh Sửa Giải Đấu' : 'Tạo Giải Đấu Mới'}</span>} open={isTourModalVisible} onCancel={() => setIsTourModalVisible(false)} footer={null} centered>
                <Form form={tourForm} layout="vertical" onFinish={handleSaveTournament} className="mt-4">
                    <Form.Item name="name" label={<Text strong>Tên Giải Đấu</Text>} rules={[{ required: true, message: 'Vui lòng nhập tên giải đấu' }]}>
                        <Input size="large" placeholder="VD: Siêu Cúp Mùa Hè..." />
                    </Form.Item>

                    <Form.Item name="requiredClass" label={<Text strong>Class Quy Định (Hạng Chiến Mã Phù Hợp)</Text>} initialValue={4}>
                        <Select size="large">
                            <Option value={1}>Class 1 (Hạng Cao Nhất - Siêu Cúp Top 1)</Option>
                            <Option value={2}>Class 2 (Hạng 2)</Option>
                            <Option value={3}>Class 3 (Hạng 3)</Option>
                            <Option value={4}>Class 4 (Tiêu Chuẩn / Phổ Thông)</Option>
                            <Option value={5}>Class 5 (Tân Binh / Nhập Môn)</Option>
                        </Select>
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

            {/* MODAL XEM DANH SÁCH THI ĐẤU & QUẢN LÝ LOẠI NGỰA */}
            <Modal
                title={<span className="text-xl text-amber-600 font-bold">📋 Danh Sách Đăng Ký Thi Đấu: {selectedRaceForWithdraw?.name}</span>}
                open={isWithdrawModalVisible}
                onCancel={() => setIsWithdrawModalVisible(false)}
                footer={[
                    <Button key="close" type="primary" onClick={() => setIsWithdrawModalVisible(false)}>
                        Đóng
                    </Button>
                ]}
                width={700}
                centered
            >
                <Alert
                    message="Kiểm Tra Danh Sách Trước Khi Chốt Thi Đấu"
                    description="Admin kiểm tra số lượng chiến mã và Kỵ sĩ đã chấp nhận lời mời. Các đơn chưa có Kỵ sĩ chấp nhận sẽ bị tự động dọn dẹp khi Admin bấm 'Chốt Danh Sách Thi Đấu'."
                    type="info"
                    showIcon
                    className="mb-4"
                />
                <ul className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {raceRegistrations.length === 0 && <Text className="text-gray-500 italic block text-center py-4">Chưa có ngựa nào đăng ký chặng đua này.</Text>}
                    {raceRegistrations.map(r => (
                        <li key={r.id} className="flex justify-between items-center bg-white p-3 rounded-lg border shadow-sm">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <Text strong className="text-lg text-amber-700">{r.horseName}</Text>
                                    {r.gateNumber && <Tag color="gold" className="font-bold">Cổng #{r.gateNumber}</Tag>}
                                </div>
                                <Text type="secondary" className="text-xs mt-0.5">
                                    🏇 Nài ngựa: <span className="font-bold text-gray-800">{r.jockeyUsername || '⚠️ Chưa có Nài'}</span> | 🐎 Chủ sở hữu: <span className="font-bold text-gray-800">{r.ownerUsername || 'Chủ ngựa'}</span>
                                </Text>
                            </div>
                            <div>
                                {r.status !== 'WITHDRAWN' ? (
                                    <Button type="primary" danger size="small" onClick={() => handleWithdrawHorse(r.id)}>Loại Ngựa này</Button>
                                ) : (
                                    <Tag color="error" className="font-bold text-xs px-2 py-1">ĐÃ RÚT LUI (REFUNDED)</Tag>
                                )}
                            </div>
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
                        <Col span={8}><Form.Item name="name" label={<Text strong>Tên Chặng Đua</Text>} rules={[{ required: true, message: 'Nhập tên chặng đua' }]}><Input size="large" placeholder="VD: Chặng 1 - Khởi động" /></Form.Item></Col>
                        <Col span={8}>
                            <Form.Item name="raceClass" label={<Text strong>Class Quy Định</Text>} initialValue={4} rules={[{ required: true, message: 'Chọn Class!' }]}>
                                <Select size="large">
                                    <Option value={1}><Tag color="gold">Class 1 (Hạng Đỉnh Cao)</Tag></Option>
                                    <Option value={2}><Tag color="purple">Class 2 (Hạng Cao Cấp)</Tag></Option>
                                    <Option value={3}><Tag color="blue">Class 3 (Hạng Trung Cấp)</Tag></Option>
                                    <Option value={4}><Tag color="green">Class 4 (Hạng Tiêu Chuẩn)</Tag></Option>
                                    <Option value={5}><Tag color="orange">Class 5 (Hạng Khởi Đầu)</Tag></Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
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

            <Modal
                title={<span className="text-xl text-yellow-600 font-black tracking-wider"><TrophyOutlined /> KẾT QUẢ CHẶNG ĐUA: {selectedRaceForResults?.name}</span>}
                open={isResultModalVisible}
                onCancel={() => setIsResultModalVisible(false)}
                footer={[<Button key="close" onClick={() => setIsResultModalVisible(false)}>Đóng</Button>]}
                centered
            >
                {raceResults.length === 0 ? (
                    <div className="p-8 text-center"><Text type="secondary">Chưa có kết quả hoặc lỗi hiển thị.</Text></div>
                ) : (
                    <List
                        itemLayout="horizontal"
                        dataSource={raceResults}
                        renderItem={(item) => (
                            <List.Item className="bg-gray-50 rounded-lg mb-2 px-4 shadow-sm border border-gray-100">
                                <List.Item.Meta
                                    avatar={
                                        <div className="relative">
                                            <Avatar size="large" src={item.horseImageUrl || 'https://joeschmoe.io/api/v1/random'} className="shadow-md" />
                                            <div className="absolute -bottom-2 -right-2 rounded-full w-7 h-7 flex items-center justify-center text-white font-black shadow-md border-2 border-white"
                                                style={{ backgroundColor: item.finishPosition === 1 ? '#FBBF24' : item.finishPosition === 2 ? '#9CA3AF' : item.finishPosition === 3 ? '#B45309' : '#374151' }}>
                                                {item.finishPosition}
                                            </div>
                                        </div>
                                    }
                                    title={<Text strong className="text-lg">{item.horseName}</Text>}
                                    description={
                                        <div>
                                            <Text type="secondary"><UserOutlined/> Nài: {item.jockeyUsername || 'Không rõ'}</Text>
                                            <br/>
                                            <Text type="secondary"><CrownOutlined/> Chủ: {item.ownerUsername}</Text>
                                        </div>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                )}
            </Modal>

            <Modal
                title={<span className="text-xl font-bold">👔 Đổi Trọng Tài Phụ Trách: <Text type="danger">{selectedRaceForChangeReferee?.name}</Text></span>}
                open={isChangeRefereeModalVisible}
                onCancel={() => setIsChangeRefereeModalVisible(false)}
                onOk={handleChangeRefereeSubmit}
                okText="Xác Nhận Đổi"
                cancelText="Hủy"
                centered
            >
                <div className="py-4">
                    <Text className="block mb-2 text-gray-300 font-semibold">Chọn Trọng Tài Phụ Trách Mới:</Text>
                    <Select
                        className="w-full"
                        size="large"
                        value={selectedRefereeId}
                        onChange={setSelectedRefereeId}
                        placeholder="-- Chọn Trọng Tài --"
                        options={referees.map(r => ({
                            value: r.id,
                            label: `👨‍⚖️ ${r.username} (${r.email})`
                        }))}
                    />
                </div>
            </Modal>
        </div>
    );
};

export default AdminTournamentPage;