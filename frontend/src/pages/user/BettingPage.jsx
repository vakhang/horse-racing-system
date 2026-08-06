import api from '../../config/api.js';
import React, { useState, useEffect } from 'react';
import { Typography, Card, Empty, Button, Tag, Modal, Table, InputNumber, message, Spin, Alert } from 'antd';
import { RocketOutlined, DollarOutlined, LineChartOutlined, InfoCircleOutlined } from '@ant-design/icons';

import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

// [Chức năng rõ ràng]: Trang Đặt Cược Trực Tuyến dành cho Khán Giả
// [Tác dụng]:
// 1. Xem danh sách chặng đua đang mở cược (BETTING).
// 2. Hiển thị tỷ lệ cược biến động thời gian thực (Parimutuel Pool).
// 3. Đặt cược và kiểm tra số dư ví tự động trước khi xác nhận.
const BettingPage = () => {
    const { user } = useAuth();
    const [races, setRaces] = useState([]);
    const [loadingRaces, setLoadingRaces] = useState(true);

    // Wallet balance
    const [walletBalance, setWalletBalance] = useState(0);

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
    const [betAmount, setBetAmount] = useState(100000);
    const [submittingBet, setSubmittingBet] = useState(false);

    // Thời gian hiện tại để so sánh khóa cược
    const [currentTime, setCurrentTime] = useState(new Date().getTime());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date().getTime()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        fetchPendingRaces();
        if (user?.id) fetchUserWallet();
    }, [user?.id]);

    const fetchUserWallet = async () => {
        try {
            const res = await api.get(`/wallets/my-wallet?userId=${user.id}`);
            setWalletBalance(res.data?.balance || 0);
        } catch (e) {
            console.error('Lỗi lấy số dư ví:', e);
        }
    };

    const fetchPendingRaces = async () => {
        setLoadingRaces(true);
        try {
            const response = await api.get('/races');
            const availableRaces = response.data.filter(race => race.status === 'BETTING');
            setRaces(availableRaces);
        } catch (error) {
            message.error('Không thể tải danh sách chặng đua!');
        } finally {
            setLoadingRaces(false);
        }
    };

    const handleOpenBetModal = async (race) => {
        setSelectedRace(race);
        setIsModalVisible(true);
        setLoadingOdds(true);
        setBettingHorseRegId(null);
        fetchUserWallet();

        try {
            const response = await api.get(`/races/${race.id}/live-odds`);
            setLiveOdds(response.data);
        } catch (error) {
            message.error('Không thể tải tỷ lệ cược!');
        } finally {
            setLoadingOdds(false);
        }
    };

    const handlePlaceBet = async () => {
        if (!bettingHorseRegId) {
            message.warning('Vui lòng chọn một chiến mã để đặt cược!');
            return;
        }
        if (betAmount <= 0) {
            message.warning('Số tiền cược phải lớn hơn 0!');
            return;
        }

        // Kiểm tra số dư ví trước khi chốt vé
        if (betAmount > walletBalance) {
            message.error(`Số dư ví (${Number(walletBalance).toLocaleString()} VNĐ) không đủ để đặt cược số tiền ${Number(betAmount).toLocaleString()} VNĐ! Vui lòng nạp thêm tiền.`);
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
            message.success('Đặt cược thành công! Chúc bạn may mắn! 🏇');

            fetchUserWallet();

            // Cập nhật lại Live Odds sau khi cược xong
            const oddsRes = await api.get(`/races/${selectedRace.id}/live-odds`);
            setLiveOdds(oddsRes.data);

            setBettingHorseRegId(null);
        } catch (error) {
            message.error(error.response?.data?.error || 'Đặt cược thất bại!');
        } finally {
            setSubmittingBet(false);
        }
    };

    const oddsColumns = [
        {
            title: <div className="text-center">Tên Chiến Mã</div>,
            dataIndex: 'horseName',
            key: 'horseName',
            align: 'left',
            render: (text, record) => (
                <div className="flex flex-col">
                    <span className="font-bold text-blue-700 text-lg">{text}</span>
                    {record.status === 'DISQUALIFIED' && (
                        <Tag color="red" className="mt-1 max-w-xs whitespace-normal">
                            [BỊ TRUẤT QUYỀN] - {record.note || 'Vi phạm luật'}
                        </Tag>
                    )}
                    {record.status === 'WITHDRAWN' && (
                        <Tag color="orange" className="mt-1 max-w-xs whitespace-normal">
                            [ĐÃ RÚT LUI] - {record.note || 'Sự cố trước giờ thi đấu'}
                        </Tag>
                    )}
                </div>
            )
        },
        {
            title: <div className="text-center">Tỷ Lệ Cược (Live)</div>,
            dataIndex: 'calculatedOdds',
            key: 'calculatedOdds',
            align: 'center',
            render: (val, record) => {
                if (record.status === 'DISQUALIFIED' || record.status === 'WITHDRAWN') {
                    return <Tag color="default" className="text-base px-3 py-1">Đã đóng</Tag>;
                }
                return (
                    <Tag color={val > 0 ? "green" : "default"} className="text-base px-3 py-1">
                        <LineChartOutlined /> {val > 0 ? `x${val}` : 'Chưa có cược'}
                    </Tag>
                );
            }
        },
        {
            title: <div className="text-center">Thao Tác</div>,
            key: 'action',
            align: 'center',
            render: (_, record) => {
                const isDisabled = record.status === 'DISQUALIFIED' || record.status === 'WITHDRAWN';
                return (
                    <Button
                        type={bettingHorseRegId === record.registrationId ? "primary" : "default"}
                        onClick={() => setBettingHorseRegId(record.registrationId)}
                        disabled={isDisabled}
                        className={bettingHorseRegId === record.registrationId ? "bg-yellow-500 border-none text-black font-bold" : ""}
                    >
                        {isDisabled ? "Bị Cấm" : bettingHorseRegId === record.registrationId ? "Đã Chọn" : "Chọn Ngựa Này"}
                    </Button>
                );
            }
        }
    ];

    return (
        <div className="max-w-5xl mx-auto p-4">
            <Title level={3} className="mb-6 border-b pb-2 flex justify-between items-center">
                <span><RocketOutlined className="text-blue-500 mr-2" /> Cá Cược Trực Tuyến (Parimutuel Pool)</span>
                <span className="text-sm font-normal bg-blue-50 text-blue-700 px-4 py-2 rounded-xl border border-blue-200">
                    💰 Số dư ví: <b>{Number(walletBalance).toLocaleString()} VNĐ</b>
                </span>
            </Title>

            <Alert
                message="Quy tắc tính tỷ lệ cược Parimutuel"
                description="Tỷ lệ cược thay đổi liên tục theo tổng tiền cược chung (Pool). Ban tổ chức lấy % phế cố định, phần còn lại chia đều cho những người cược vào chiến mã thắng theo tỷ lệ số tiền đặt. Tỷ lệ cược được chốt chính thức khi chặng đua bắt đầu."
                type="info"
                showIcon
                icon={<InfoCircleOutlined />}
                className="mb-6 rounded-xl"
            />

            <Spin spinning={loadingRaces}>
                {races.length === 0 ? (
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

            <Modal
                title={<span className="text-xl font-bold">Bảng Kèo: {selectedRace?.name}</span>}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={700}
                centered
            >
                <div className="mb-4 bg-gray-50 p-3 rounded-lg flex justify-between items-center border">
                    <Text>Số dư ví hiện tại:</Text>
                    <Text className="font-bold text-green-600 text-base">{Number(walletBalance).toLocaleString()} VNĐ</Text>
                </div>

                <Table
                    dataSource={liveOdds}
                    columns={oddsColumns}
                    rowKey="registrationId"
                    pagination={false}
                    loading={loadingOdds}
                    size="middle"
                    scroll={{ y: '50vh' }}
                    rowClassName={(record, index) => index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    className="mt-2 border rounded-lg"
                />

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
                                CHỐT VÉ CƯỢC
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default BettingPage;