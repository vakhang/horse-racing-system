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

    const fetchParticipants = async (raceId, raceName) => {
        setSelectedRaceName(raceName);
        setIsModalOpen(true);
        setModalLoading(true);
        try {
            const res = await api.get(`/registrations?raceId=${raceId}`);
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
            title: 'Thời gian',
            dataIndex: 'raceTime',
            key: 'raceTime',
            render: time => <Text className="text-gray-300">{dayjs(time).format('DD/MM/YYYY HH:mm')}</Text>
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
            title: 'Danh sách tham gia',
            key: 'action',
            render: (_, record) => (
                <a 
                    className="text-yellow-500 hover:text-yellow-400 flex items-center gap-1"
                    onClick={() => fetchParticipants(record.id, record.name)}
                >
                    <TeamOutlined /> Danh sách
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
                            LỊCH ĐUA
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

            <ConfigProvider theme={{ algorithm: theme.darkAlgorithm, token: { colorBgElevated: '#001529' } }}>
                <Modal
                    title={`Danh sách tham gia: ${selectedRaceName}`}
                    open={isModalOpen}
                    onCancel={() => setIsModalOpen(false)}
                    footer={null}
                    bodyStyle={{ maxHeight: '60vh', overflowY: 'auto' }}
                >
                    {modalLoading ? (
                        <div className="flex justify-center p-8"><Spin /></div>
                    ) : (
                        <List
                            itemLayout="horizontal"
                            dataSource={participants}
                            renderItem={item => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={<Avatar src={item.horseImageUrl || 'https://joeschmoe.io/api/v1/random'} />}
                                        title={
                                            <Space>
                                                <Text strong className="text-yellow-400">Ngựa: {item.horseName}</Text>
                                                {item.status === 'DISQUALIFIED' && (
                                                    <Tooltip title={`Lý do: ${item.note || 'Vi phạm nội quy'}`}>
                                                        <Badge color="red" text="TRUẤT QUYỀN" className="font-bold text-red-600" />
                                                    </Tooltip>
                                                )}
                                            </Space>
                                        }
                                        description={<Text className="text-gray-300">Nài ngựa: {item.jockeyUsername || 'Chưa có'}</Text>}
                                    />
                                </List.Item>
                            )}
                            locale={{ emptyText: <span className="text-gray-400">Chưa có danh sách thi đấu</span> }}
                        />
                    )}
                </Modal>
            </ConfigProvider>

            <Footer />
        </div>
    );
};

export default SchedulePage;
