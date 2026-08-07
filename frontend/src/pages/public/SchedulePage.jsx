import React, { useState, useEffect } from 'react';
import { Typography, Table, Tag, Spin, message, Modal, List, Avatar, ConfigProvider, theme, Space, Tooltip, Badge } from 'antd';
import Footer from '../../components/layout/Footer';
import PublicHeader from '../../components/layout/PublicHeader';
import api from '../../config/api';
import dayjs from 'dayjs';
import { TeamOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

// [Chức năng rõ ràng]: Trang Lịch Thi Đấu
// [Tác dụng]: Hiển thị danh sách các giải đấu và chặng đua sắp diễn ra (SCHEDULED, REGISTRATION).
// [Hướng dẫn sửa đổi]:
// - UI: Cấu hình lại bộ lọc Calendar để chọn ngày hiển thị lịch đua dễ dàng hơn.
const SchedulePage = () => {
    const [races, setRaces] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal state for participants
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [participants, setParticipants] = useState([]);
    const [modalLoading, setModalLoading] = useState(false);
    const [selectedRaceName, setSelectedRaceName] = useState('');

    useEffect(() => {
        fetchScheduledRaces();
    }, []);

    const fetchScheduledRaces = async () => {
        try {
            const res = await api.get('/races');
            const now = new Date();
            const futureRaces = res.data.filter(race => {
                const raceDate = new Date(race.raceTime);
                return (
                    race.status === 'REGISTRATION' || 
                    race.status === 'BETTING' || 
                    race.status === 'LOCK_SESSION' || 
                    race.status === 'RUNNING'
                );
            });
            setRaces(futureRaces);
        } catch (error) {
            console.error("Failed to fetch races", error);
            message.error("Không thể tải lịch đua");
        } finally {
            setLoading(false);
        }
    };

    const [selectedRace, setSelectedRace] = useState(null);

    const fetchParticipants = async (race) => {
        setSelectedRace(race);
        setSelectedRaceName(race.name);
        setIsModalOpen(true);
        setModalLoading(true);
        try {
            const res = await api.get(`/registrations?raceId=${race.id}`);
            const activeParticipants = res.data.filter(r => r.status !== 'WITHDRAWN' && r.status !== 'DISQUALIFIED');
            setParticipants(activeParticipants);
        } catch (error) {
            console.error("Failed to fetch participants", error);
            message.error("Không thể tải danh sách đăng ký");
        } finally {
            setModalLoading(false);
        }
    };

    const columns = [
        {
            title: 'Giải đấu',
            dataIndex: 'tournamentName',
            key: 'tournamentName',
            render: text => <Text className="text-white font-semibold">{text}</Text>
        },
        {
            title: 'Tên chặng đua',
            dataIndex: 'name',
            key: 'name',
            render: text => <Text className="text-yellow-400 font-bold">{text}</Text>
        },
        {
            title: 'Thời gian xuất phát',
            dataIndex: 'raceTime',
            key: 'raceTime',
            render: time => <Text className="text-gray-300">{dayjs(time).format('DD/MM/YYYY HH:mm')}</Text>
        },
        {
            title: 'Quy Định Class',
            dataIndex: 'raceClass',
            key: 'raceClass',
            render: (v, record) => <Tag color="magenta" className="font-bold">CLASS {v || record.requiredClass || 4}</Tag>
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: status => {
                if (status === 'REGISTRATION') return <Tag color="orange">ĐĂNG KÝ THI ĐẤU</Tag>;
                if (status === 'BETTING') return <Tag color="blue">NHẬN ĐẶT CƯỢC</Tag>;
                if (status === 'LOCK_SESSION') return <Tag color="gray">KHÓA NHẬN CƯỢC</Tag>;
                if (status === 'RUNNING') return <Tag color="red" className="animate-pulse">ĐANG THI ĐẤU</Tag>;
                return <Tag>{status}</Tag>;
            }
        },
        {
            title: 'Chi tiết chặng',
            key: 'action',
            render: (_, record) => (
                <a 
                    className="text-yellow-400 hover:text-yellow-300 font-bold flex items-center gap-1 bg-yellow-500/10 px-3 py-1 rounded-lg border border-yellow-500/30"
                    onClick={() => fetchParticipants(record)}
                >
                    <TeamOutlined /> Chi Tiết Chặng & Danh Sách
                </a>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-[#001529] font-sans flex flex-col">
            <PublicHeader />

            <div className="flex-grow max-w-7xl mx-auto w-full px-6 py-12 pt-32">
                <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
                    <div className="text-center mb-12">
                        <Title level={1} className="text-4xl md:text-5xl font-black tracking-widest uppercase mb-4 inline-block" style={{ color: '#facc15', WebkitTextStroke: '2px #facc15', textShadow: '0 0 15px rgba(250,204,21,0.6)' }}>
                            LỊCH THI ĐẤU & KẾT QUẢ
                        </Title>
                    </div>
                    
                    {loading ? (
                        <div className="flex justify-center p-12"><Spin size="large" /></div>
                    ) : (
                        <ConfigProvider theme={{ algorithm: theme.darkAlgorithm, token: { colorBgContainer: '#001529' } }}>
                            <div className="[&_.ant-table]:bg-transparent [&_.ant-table-thead>tr>th]:bg-white/10 [&_.ant-table-thead>tr>th]:text-white [&_.ant-table-thead>tr>th]:border-b-white/10 [&_.ant-table-tbody>tr>td]:border-b-white/10 [&_.ant-table-tbody>tr.ant-table-row:hover>td]:bg-white/5 [&_.ant-pagination-item]:bg-transparent [&_.ant-pagination-item>a]:text-white [&_.ant-pagination-item-active]:border-yellow-500 [&_.ant-pagination-item-active>a]:text-yellow-500 [&_.ant-table-placeholder]:bg-transparent [&_.ant-table-placeholder:hover>td]:bg-transparent [&_.ant-empty-description]:text-gray-400 [&_.ant-table-cell]:text-gray-200">
                                <Table 
                                    columns={columns} 
                                    dataSource={races} 
                                    rowKey="id"
                                    pagination={{ pageSize: 10 }}
                                    className="bg-transparent"
                                    rowClassName="transition-colors"
                                    locale={{ emptyText: 'Chưa có lịch thi đấu' }}
                                />
                            </div>
                        </ConfigProvider>
                    )}
                </div>
            </div>

            <ConfigProvider theme={{ algorithm: theme.darkAlgorithm, token: { colorBgElevated: '#14221b' } }}>
                <Modal
                    title={<span className="text-xl text-yellow-400 font-black uppercase">🏇 CHI TIẾT CHẶNG ĐUA: {selectedRaceName}</span>}
                    open={isModalOpen}
                    onCancel={() => setIsModalOpen(false)}
                    footer={null}
                    width={800}
                    centered
                >
                    {modalLoading ? (
                        <div className="flex justify-center p-8"><Spin size="large" /></div>
                    ) : (
                        <div className="space-y-4">
                            {/* CƠ CẤU GIẢI THƯỞNG & THÔNG TIN CHẶNG */}
                            {selectedRace && (
                                <div className="bg-[#1a2f24] p-4 rounded-xl border border-[#007355] shadow-md">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                        <div className="bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/30 text-center flex flex-col justify-center">
                                            <Text className="text-xs text-yellow-400 font-bold uppercase block">🥇 GIẢI NHẤT (PRIZE 1)</Text>
                                            <Text className="text-xl font-black text-yellow-300">{Number(selectedRace.prize1 || 10000000).toLocaleString()} VNĐ</Text>
                                        </div>
                                        <div className="bg-gray-400/10 p-3 rounded-lg border border-gray-400/30 text-center">
                                            <Text className="text-xs text-gray-300 font-bold uppercase block">🥈 GIẢI NHÌ (PRIZE 2)</Text>
                                            <Text className="text-xl font-black text-gray-200">{Number(selectedRace.prize2 || 5000000).toLocaleString()} VNĐ</Text>
                                        </div>
                                        <div className="bg-amber-700/10 p-3 rounded-lg border border-amber-700/30 text-center">
                                            <Text className="text-xs text-amber-500 font-bold uppercase block">🥉 GIẢI BA (PRIZE 3)</Text>
                                            <Text className="text-xl font-black text-amber-400">{Number(selectedRace.prize3 || 2000000).toLocaleString()} VNĐ</Text>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap justify-between items-center text-xs text-gray-300 pt-2 border-t border-gray-700/50">
                                        <span>🏆 Class Quy Định: <strong className="text-yellow-400 font-bold">Class {selectedRace.raceClass || selectedRace.requiredClass || 4}</strong></span>
                                        <span>💰 Live Total Pool: <strong className="text-green-400 font-bold">{Number(selectedRace.totalPool || 0).toLocaleString()} VNĐ</strong></span>
                                        <span>👨‍⚖️ Trọng Tài: <strong className="text-blue-400 font-bold">{selectedRace.refereeUsername || 'Chưa phân công'}</strong></span>
                                    </div>
                                </div>
                            )}

                            {/* DANH SÁCH ĐĂNG KÝ THI ĐẤU */}
                            <div className="bg-[#1e1e1e] p-4 rounded-xl border border-gray-800">
                                <Text strong className="text-yellow-400 text-sm uppercase block mb-3">📋 DANH SÁCH CHIẾN MÃ & CẬP NHẬT CÂN NÀI (HANDICAP):</Text>
                                <List
                                    itemLayout="horizontal"
                                    dataSource={participants}
                                    renderItem={item => (
                                        <List.Item className="bg-[#141414] p-3 rounded-lg border border-gray-800 mb-2">
                                            <List.Item.Meta
                                                avatar={<Avatar size={48} src={item.horseImageUrl || 'https://joeschmoe.io/api/v1/random'} className="border border-yellow-500/50" />}
                                                title={
                                                    <div className="flex justify-between items-center">
                                                        <Space>
                                                            <Text strong className="text-lg text-yellow-400">{item.horseName}</Text>
                                                            {item.gateNumber ? (
                                                                <Tag color="gold" className="font-bold">Cổng xuất phát #{item.gateNumber}</Tag>
                                                            ) : (
                                                                <Tag color="default" className="text-xs">Chưa bốc cổng</Tag>
                                                            )}
                                                        </Space>
                                                        {item.status === 'DISQUALIFIED' && (
                                                            <Tag color="red" className="font-bold">TRUẤT QUYỀN</Tag>
                                                        )}
                                                    </div>
                                                }
                                                description={
                                                    <div className="text-xs text-gray-300 space-y-1 mt-1">
                                                        <div>🏇 Nài ngựa: <strong className="text-white">{item.jockeyUsername || 'Chưa phân công'}</strong> | 🐎 Chủ sở hữu: <strong className="text-white">{item.ownerUsername || 'Không rõ'}</strong></div>
                                                        <div className="text-amber-300">
                                                            ⚖️ Tải trọng chỉ định: <strong>{item.assignedWeight || 52.1} kg</strong> | Cân nặng nài: <strong>{item.jockeyWeight || item.actualWeight || 'Chờ cân'} kg</strong> {item.leadWeight > 0 ? <span className="text-red-400 font-bold">(Đeo thêm +{item.leadWeight} kg chì bù)</span> : <span className="text-green-400 font-bold">(Đủ tải trọng)</span>}
                                                        </div>
                                                    </div>
                                                }
                                            />
                                        </List.Item>
                                    )}
                                    locale={{ emptyText: <span className="text-gray-400 italic block text-center py-4">Chưa có ngựa nào đăng ký chặng thi đấu này.</span> }}
                                />
                            </div>
                        </div>
                    )}
                </Modal>
            </ConfigProvider>

            <Footer />
        </div>
    );
};

export default SchedulePage;
