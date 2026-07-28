import React, { useState, useEffect } from 'react';
import { Typography, Table, Tag, Spin, message, Modal, List, Avatar } from 'antd';
import Footer from '../../components/layout/Footer';
import PublicHeader from '../../components/layout/PublicHeader';
import api from '../../config/api';
import dayjs from 'dayjs';
import { TrophyOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const ResultsPage = () => {
    const [races, setRaces] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal state for results
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [participants, setParticipants] = useState([]);
    const [modalLoading, setModalLoading] = useState(false);
    const [selectedRaceName, setSelectedRaceName] = useState('');

    useEffect(() => {
        fetchCompletedRaces();
    }, []);

    const fetchCompletedRaces = async () => {
        try {
            const res = await api.get('/api/races');
            // Filter completed or confirmed races
            const pastRaces = res.data.filter(race => 
                race.status === 'COMPLETED' || race.status === 'RESULT_CONFIRMED'
            );
            
            // Sort by raceTime descending
            pastRaces.sort((a, b) => new Date(b.raceTime) - new Date(a.raceTime));
            
            setRaces(pastRaces);
        } catch (error) {
            console.error("Failed to fetch past races", error);
            message.error("Không thể tải kết quả");
        } finally {
            setLoading(false);
        }
    };

    const fetchRaceResults = async (raceId, raceName) => {
        setSelectedRaceName(raceName);
        setIsModalOpen(true);
        setModalLoading(true);
        try {
            const res = await api.get(`/api/registrations?raceId=${raceId}`);
            // Get participants and sort by finish position
            const finished = res.data.filter(r => r.finishPosition != null);
            finished.sort((a, b) => a.finishPosition - b.finishPosition);
            setParticipants(finished);
        } catch (error) {
            console.error("Failed to fetch participants", error);
            message.error("Không thể tải kết quả chi tiết");
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
            title: 'Thời gian thi đấu',
            dataIndex: 'raceTime',
            key: 'raceTime',
            render: time => <Text className="text-gray-300">{dayjs(time).format('DD/MM/YYYY HH:mm')}</Text>
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: status => <Tag color="green">HOÀN THÀNH</Tag>
        },
        {
            title: 'Kết quả',
            key: 'action',
            render: (_, record) => (
                <a 
                    className="text-yellow-500 hover:text-yellow-400 flex items-center gap-1 font-bold"
                    onClick={() => fetchRaceResults(record.id, record.name)}
                >
                    <TrophyOutlined /> Xem Top 3
                </a>
            )
        }
    ];

    const getMedalColor = (position) => {
        if (position === 1) return '#FFD700'; // Vàng
        if (position === 2) return '#C0C0C0'; // Bạc
        if (position === 3) return '#CD7F32'; // Đồng
        return '#000';
    };

    return (
        <div className="min-h-screen bg-[#001529] font-sans flex flex-col">
            <PublicHeader />

            <div className="flex-grow max-w-7xl mx-auto w-full px-6 py-12 pt-32">
                <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
                    <div className="text-center mb-12">
                        <Title level={1} className="text-4xl md:text-5xl font-black tracking-widest uppercase mb-4 inline-block" style={{ color: '#facc15', WebkitTextStroke: '2px #facc15', textShadow: '0 0 15px rgba(250,204,21,0.6)' }}>
                            KẾT QUẢ THI ĐẤU
                        </Title>
                    </div>
                    
                    {loading ? (
                        <div className="flex justify-center p-12"><Spin size="large" /></div>
                    ) : (
                        <Table 
                            columns={columns} 
                            dataSource={races} 
                            rowKey="id"
                            pagination={{ pageSize: 10 }}
                            className="bg-transparent"
                            rowClassName="hover:bg-white/5 transition-colors"
                        />
                    )}
                </div>
            </div>

            <Modal
                title={`Kết quả: ${selectedRaceName}`}
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
                        dataSource={participants.slice(0, 3)} // Chỉ lấy top 3
                        renderItem={item => (
                            <List.Item>
                                <List.Item.Meta
                                    avatar={
                                        <div className="relative">
                                            <Avatar size="large" src={item.horseImageUrl || 'https://joeschmoe.io/api/v1/random'} />
                                            <div 
                                                className="absolute -bottom-2 -right-2 rounded-full w-6 h-6 flex items-center justify-center text-white font-bold shadow-md"
                                                style={{ backgroundColor: getMedalColor(item.finishPosition) }}
                                            >
                                                {item.finishPosition}
                                            </div>
                                        </div>
                                    }
                                    title={<Text strong className="text-lg">Chiến mã: {item.horseName}</Text>}
                                    description={<Text type="secondary">Được điều khiển bởi: {item.jockeyUsername || 'Không rõ'}</Text>}
                                />
                            </List.Item>
                        )}
                        locale={{ emptyText: 'Chưa có kết quả' }}
                    />
                )}
            </Modal>

            <Footer />
        </div>
    );
};

export default ResultsPage;
