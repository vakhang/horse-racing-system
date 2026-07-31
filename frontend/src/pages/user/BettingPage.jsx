import React, { useState, useEffect } from 'react';
import { Typography, Card, Empty, Button, Tag, Modal, Table, InputNumber, message, Spin } from 'antd';
import { RocketOutlined, DollarOutlined, LineChartOutlined } from '@ant-design/icons';
import axios from 'axios';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

const BettingPage = () => {
    const { user } = useAuth();
    const token = user?.token || localStorage.getItem('token');

    const [races, setRaces] = useState([]);
    const [loadingRaces, setLoadingRaces] = useState(true);

    if (user?.role === 'OWNER' || user?.role === 'JOCKEY' || user?.role === 'REFEREE') {
        return (
            <div className="p-10 max-w-4xl mx-auto">
                <Card className="text-center shadow-xl border-red-200">
                    <Title level={2} className="text-red-600">Truy Cập Bị Từ Chối</Title>
                    <Text className="text-lg">Tài khoản của bạn ({user.role}) KHÔNG được phép truy cập vào khu vực cá cược để đảm bảo tính minh bạch của giải đấu!</Text>
                </Card>
            </div>
        );
    }

    // State cho Modal Đặt Cược
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedRace, setSelectedRace] = useState(null);
    const [liveOdds, setLiveOdds] = useState([]);
    const [loadingOdds, setLoadingOdds] = useState(false);

    // State cho việc submit Cược
    const [bettingHorseRegId, setBettingHorseRegId] = useState(null);
    const [betAmount, setBetAmount] = useState(100000); // Mặc định cược 100k
    const [submittingBet, setSubmittingBet] = useState(false);

    // Thời gian hiện tại để so sánh khóa cược
    const [currentTime, setCurrentTime] = useState(new Date().getTime());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date().getTime()), 1000);
        return () => clearInterval(timer);
    }, []);

    // 1. Lấy danh sách Chặng đua khi vào trang
    useEffect(() => {
        fetchPendingRaces();
    }, []);

    const fetchPendingRaces = async () => {
        setLoadingRaces(true);
        try {
            const response = await api.get('/races');
            // Chỉ hiển thị các chặng đua CHƯA BẮT ĐẦU (PENDING) cho Spectator cược
            const availableRaces = response.data.filter(race => race.status === 'PENDING');
            setRaces(availableRaces);
        } catch (error) {
            message.error('Không thể tải danh sách chặng đua!');
        } finally {
            setLoadingRaces(false);
        }
    };

    // 2. Mở Modal và lấy Tỷ lệ cược Live khi chọn 1 chặng đua
    const handleOpenBetModal = async (race) => {
        setSelectedRace(race);
        setIsModalVisible(true);
        setLoadingOdds(true);
        setBettingHorseRegId(null); // Reset lựa chọn ngựa

        try {
            const response = await api.get(`/races/${race.id}/live-odds`);
            setLiveOdds(response.data);
        } catch (error) {
            message.error('Không thể tải tỷ lệ cược!');
        } finally {
            setLoadingOdds(false);
        }
    };

    // 3. Xử lý Gửi lệnh đặt cược xuống Spring Boot
    const handlePlaceBet = async () => {
        if (!bettingHorseRegId) {
            message.warning('Vui lòng chọn một chiến mã để đặt cược!');
            return;
        }
        if (betAmount <= 0) {
            message.warning('Số tiền cược phải lớn hơn 0!');
            return;
        }

        setSubmittingBet(true);
        try {
            const betRequest = {
                spectatorId: user.id,
                raceId: selectedRace.id,
                registrationId: bettingHorseRegId,
                amount: betAmount
            };

            await api.post('/bets', betRequest);
            message.success('Đặt cược thành công! Chúc bạn may mắn!');

            // Cập nhật lại Live Odds sau khi cược xong để thấy tỷ lệ thay đổi
            const oddsRes = await api.get(`/races/${selectedRace.id}/live-odds`);
            setLiveOdds(oddsRes.data);

            setBettingHorseRegId(null); // Reset lại form
        } catch (error) {
            message.error(error.response?.data?.error || 'Đặt cược thất bại!');
        } finally {
            setSubmittingBet(false);
        }
    };

    // Cấu hình Cột cho bảng Live Odds
    const oddsColumns = [
        {
            title: <div className="text-center">Tên Chiến Mã</div>,
            dataIndex: 'horseName',
            key: 'horseName',
            align: 'left', // Nội dung căn trái
            render: (text) => <span className="font-bold text-blue-700 text-lg">{text}</span>
        },
        {
            title: <div className="text-center">Tỷ Lệ Cược (Live)</div>,
            dataIndex: 'calculatedOdds',
            key: 'calculatedOdds',
            align: 'center', // Tiêu đề và nội dung căn giữa
            render: (val) => (
                <Tag color={val > 0 ? "green" : "default"} className="text-base px-3 py-1">
                    <LineChartOutlined /> {val > 0 ? `x${val}` : 'Chưa có cược'}
                </Tag>
            )
        },
        {
            title: <div className="text-center">Thao Tác</div>,
            key: 'action',
            align: 'center', // Căn giữa toàn bộ cột thao tác
            render: (_, record) => (
                <Button
                    type={bettingHorseRegId === record.registrationId ? "primary" : "default"}
                    onClick={() => setBettingHorseRegId(record.registrationId)}
                    className={bettingHorseRegId === record.registrationId ? "bg-yellow-500 border-none text-black font-bold" : ""}
                >
                    {bettingHorseRegId === record.registrationId ? "Đã Chọn" : "Chọn Ngựa Này"}
                </Button>
            )
        }
    ];

    return (
        <div className="max-w-5xl mx-auto">
            {/* Tiêu đề in đập to, đồng bộ với các trang khác */}
            <Title level={3} className="mb-6 border-b pb-2">
                <RocketOutlined className="text-blue-500 mr-2" /> Cá Cược Trực Tuyến
            </Title>

            <Spin spinning={loadingRaces}>
                {races.length === 0 ? (
                    // Hiển thị trạng thái "Trống" chuẩn Ant Design
                    <Card className="shadow-sm rounded-xl py-10">
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                <span className="text-gray-500 text-lg">
                                    Hiện chưa có cuộc đua nào sắp diễn ra.<br/> Mời bạn quay lại sau nhé!
                                </span>
                            }
                        />
                    </Card>
                ) : (
                    // Hiển thị danh sách các chặng đua
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {races.map(race => (
                            <Card key={race.id} className="shadow-md hover:shadow-lg transition-shadow border-t-4 border-blue-600 rounded-xl">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <Text className="text-gray-400 text-xs font-bold uppercase">{race.tournamentName}</Text>
                                        <Title level={4} className="mt-1 mb-0">{race.name}</Title>
                                    </div>
                                    <Tag color="orange" className="font-bold border-orange-300 px-3 py-1">SẮP DIỄN RA</Tag>
                                </div>
                                <div className="text-gray-600 mb-6 font-medium">
                                    Thời gian chạy: <span className="text-black">{new Date(race.raceTime).toLocaleString()}</span>
                                </div>
                                {(() => {
                                    const timeDiff = new Date(race.raceTime).getTime() - currentTime;
                                    const isLocked = timeDiff <= 60000;
                                    return isLocked ? (
                                        <Button
                                            type="default"
                                            size="large"
                                            block
                                            disabled
                                            className="bg-gray-300 font-bold tracking-wide text-gray-500"
                                        >
                                            ĐÃ KHÓA NHẬN CƯỢC
                                        </Button>
                                    ) : (
                                        <Button
                                            type="primary"
                                            size="large"
                                            block
                                            className="bg-blue-600 font-bold tracking-wide"
                                            onClick={() => handleOpenBetModal(race)}
                                        >
                                            XEM TỶ LỆ & VÀO TIỀN
                                        </Button>
                                    );
                                })()}
                            </Card>
                        ))}
                    </div>
                )}
            </Spin>

            {/* Modal hiển thị bảng cược cho 1 chặng đua */}
            <Modal
                title={<span className="text-xl font-bold">Bảng Kèo: {selectedRace?.name}</span>}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={700}
                centered
            >
                <Table
                    dataSource={liveOdds}
                    columns={oddsColumns}
                    rowKey="registrationId"
                    pagination={false}
                    loading={loadingOdds}
                    size="middle"
                    scroll={{ y: '50vh' }}
                    rowClassName={(record, index) => index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    className="mt-4 border rounded-lg"
                />

                {/* Khu vực nhập tiền cược hiện ra khi đã chọn 1 con ngựa */}
                {bettingHorseRegId && (
                    <div className="mt-6 p-5 bg-blue-50 border border-blue-200 rounded-xl">
                        <Title level={5} className="mb-4">Số tiền muốn cược (VNĐ):</Title>
                        <div className="flex gap-4">
                            <InputNumber
                                style={{ width: '100%' }}
                                className="text-lg"
                                size="large"
                                min={10000}
                                step={10000}
                                value={betAmount}
                                onChange={setBetAmount}
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            />
                            <Button
                                type="primary"
                                size="large"
                                className="bg-yellow-500 text-black font-bold w-40 border-none hover:bg-yellow-400 hover:scale-105 transition-all"
                                onClick={handlePlaceBet}
                                loading={submittingBet}
                                icon={<DollarOutlined />}
                            >
                                CHỐT KÈO
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default BettingPage;