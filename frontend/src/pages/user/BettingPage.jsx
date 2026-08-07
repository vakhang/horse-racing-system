import api from '../../config/api.js';
import React, { useState, useEffect } from 'react';
import { Typography, Card, Empty, Button, Tag, Modal, Table, InputNumber, message, Spin, Alert, Segmented, Select, Divider, Image, Avatar } from 'antd';
import { RocketOutlined, DollarOutlined, LineChartOutlined, InfoCircleOutlined, TrophyOutlined, SwapOutlined, AimOutlined } from '@ant-design/icons';

import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

// [Chức năng rõ ràng]: Trang Đặt Cược Trực Tuyến 4 Thể Loại dành cho Khán Giả (WIN, PLACE, QUINELLA, EXACTA)
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

    // State cho Modal Đặt Cược 4 Thể Loại
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedRace, setSelectedRace] = useState(null);
    const [liveOdds, setLiveOdds] = useState([]);
    const [loadingOdds, setLoadingOdds] = useState(false);

    // State cho việc chọn Thể Loại Cược & Ngựa
    const [selectedBetType, setSelectedBetType] = useState('WIN'); // 'WIN', 'PLACE', 'QUINELLA', 'EXACTA'
    const [bettingHorseRegId, setBettingHorseRegId] = useState(null); // Ngựa 1 / Ngựa Nhất
    const [bettingHorseRegId2, setBettingHorseRegId2] = useState(null); // Ngựa 2 / Ngựa Nhì (Cược Cặp)
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
            const racesData = Array.isArray(response.data) ? response.data : [];
            const availableRaces = racesData.filter(race => race && race.status === 'BETTING');
            setRaces(availableRaces);
        } catch (error) {
            console.error('Lỗi lấy danh sách chặng đua:', error);
            message.error(error.response?.data?.error || error.response?.data?.message || 'Không thể tải danh sách chặng đua!');
        } finally {
            setLoadingRaces(false);
        }
    };

    const handleOpenBetModal = async (race) => {
        setSelectedRace(race);
        setIsModalVisible(true);
        setLoadingOdds(true);
        setSelectedBetType('WIN');
        setBettingHorseRegId(null);
        setBettingHorseRegId2(null);
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
        if (selectedBetType === 'WIN' || selectedBetType === 'PLACE') {
            if (!bettingHorseRegId) {
                message.warning('Vui lòng chọn một chiến mã để đặt cược!');
                return;
            }
        } else {
            // QUINELLA & EXACTA cần 2 ngựa
            if (!bettingHorseRegId || !bettingHorseRegId2) {
                message.warning('Vui lòng chọn đủ 2 chiến mã cho loại cược cặp này!');
                return;
            }
            if (bettingHorseRegId === bettingHorseRegId2) {
                message.warning('Không thể chọn cùng một chiến mã cho cả 2 vị trí!');
                return;
            }
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
                registrationId2: (selectedBetType === 'QUINELLA' || selectedBetType === 'EXACTA') ? bettingHorseRegId2 : null,
                betType: selectedBetType,
                amount: betAmount
            };

            await api.post('/bets', betRequest);
            message.success('Đặt cược thành công! Chúc bạn may mắn! 🏇');

            fetchUserWallet();

            // Cập nhật lại Live Odds sau khi cược xong
            const oddsRes = await api.get(`/races/${selectedRace.id}/live-odds`);
            setLiveOdds(oddsRes.data);

            setBettingHorseRegId(null);
            setBettingHorseRegId2(null);
        } catch (error) {
            message.error(error.response?.data?.error || 'Đặt cược thất bại!');
        } finally {
            setSubmittingBet(false);
        }
    };

    const oddsColumns = [
        {
            title: <div className="text-center font-bold">Cổng & Tên Chiến Mã</div>,
            dataIndex: 'horseName',
            key: 'horseName',
            align: 'left',
            render: (text, record) => (
                <div className="flex items-center gap-3">
                    <Tag color="gold" className="font-bold text-sm px-2 py-0.5 whitespace-nowrap">Cổng {record.gateNumber || '?'}</Tag>
                    {record.horseAvatarUrl ? (
                        <Image src={record.horseAvatarUrl} width={50} height={50} className="rounded-full aspect-square object-cover border border-[#007355]" />
                    ) : (
                        <div className="w-[50px] h-[50px] bg-black/40 rounded-full border border-[#007355] flex items-center justify-center text-xs text-gray-500">No Img</div>
                    )}
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-yellow-400 text-lg">{text}</span>
                            <Tag color="green" className="font-bold text-xs m-0">Class {record.classLevel || 4}</Tag>
                            <Tag color="cyan" className="font-bold text-xs m-0">⚡ {record.rating || 40} pts</Tag>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs text-gray-400">Nài ngựa:</span>
                            {record.jockeyAvatarUrl ? (
                                <Image src={record.jockeyAvatarUrl} width={20} height={20} className="rounded-full aspect-square object-cover" />
                            ) : (
                                <Avatar size={20} className="bg-gray-600" />
                            )}
                            <span className="text-xs font-semibold text-gray-300">{record.jockeyName || 'Chưa rõ'}</span>
                        </div>
                        {record.status === 'DISQUALIFIED' && (
                            <Tag color="red" className="mt-1 max-w-xs whitespace-normal">
                                [BỊ TRUẤT QUYỀN] - {record.note || 'Vi phạm luật'}
                            </Tag>
                        )}
                        {record.status === 'WITHDRAWN' && (
                            <Tag color="orange" className="mt-1 max-w-xs whitespace-normal">
                                [ĐÃ RÚT LUI] - {record.note || 'Sự cố thú y'}
                            </Tag>
                        )}
                    </div>
                </div>
            )
        },
        {
            title: <div className="text-center font-bold">Tỷ Lệ Thắng</div>,
            key: 'winRate',
            align: 'center',
            render: (_, record) => {
                const rate = record.winRate || 0;
                return (
                    <div className="flex flex-col items-center">
                        <Text strong className="text-green-300">{rate.toFixed(1)}%</Text>
                        <Text type="secondary" className="text-xs mt-1">{(record.winRaces || 0)}/{(record.totalRaces || 0)} trận</Text>
                    </div>
                );
            }
        },
        {
            title: <div className="text-center font-bold">Tải Trọng Gánh</div>,
            key: 'handicap',
            align: 'center',
            render: (_, record) => {
                const assigned = record.assignedWeight || 52.1;
                const lead = record.leadWeight;
                const isWeighed = record.isWeighedIn;
                return (
                    <div className="flex flex-col items-center">
                        <Tag color="blue" className="font-bold text-xs">Assigned: {assigned} kg</Tag>
                        {isWeighed ? (
                            lead && lead > 0 ? (
                                <Tag color="orange" className="font-bold text-xs mt-1">+ {lead} kg chì lá</Tag>
                            ) : (
                                <Tag color="green" className="text-xs mt-1">✓ Đã cân đủ tải</Tag>
                            )
                        ) : (
                            <Text type="secondary" className="text-xs italic mt-1">Chờ trọng tài cân</Text>
                        )}
                    </div>
                );
            }
        },
        {
            title: <div className="text-center font-bold">Tỷ lệ cược</div>,
            key: 'calculatedOdds',
            align: 'center',
            render: (_, record) => {
                if (record.status === 'DISQUALIFIED' || record.status === 'WITHDRAWN') {
                    return <Tag color="default" className="text-base px-3 py-1">Đã đóng</Tag>;
                }
                const val = selectedBetType === 'PLACE' ? record.placeOdds : record.calculatedOdds;
                const poolBet = selectedBetType === 'PLACE' ? record.totalPlaceBetOnHorse : record.totalBetOnHorse;
                return (
                    <div className="flex flex-col items-center">
                        <Tag color={val > 0 ? "green" : "default"} className="text-base font-bold px-3 py-1 bg-[#162a22] text-[#00ffb3] border-[#007355]">
                            <LineChartOutlined /> {val > 0 ? `x${val}` : 'Chưa có cược'}
                        </Tag>
                        {poolBet > 0 && (
                            <Text type="secondary" className="text-xs mt-0.5">
                                Bể cược: {Number(poolBet).toLocaleString()}đ
                            </Text>
                        )}
                    </div>
                );
            }
        },
        {
            title: <div className="text-center font-bold">Thao Tác Chọn</div>,
            key: 'action',
            align: 'center',
            render: (_, record) => {
                const isDisabled = record.status === 'DISQUALIFIED' || record.status === 'WITHDRAWN';
                const isSelectedAs1 = bettingHorseRegId === record.registrationId;
                const isSelectedAs2 = bettingHorseRegId2 === record.registrationId;

                if (selectedBetType === 'WIN' || selectedBetType === 'PLACE') {
                    return (
                        <Button
                            type={isSelectedAs1 ? "primary" : "default"}
                            onClick={() => setBettingHorseRegId(record.registrationId)}
                            disabled={isDisabled}
                            className={isSelectedAs1 ? "b989-odds-btn selected" : "b989-odds-btn"}
                        >
                            {isDisabled ? "Bị Cấm" : isSelectedAs1 ? "✓ ĐÃ CHỌN" : "CƯỢC NGỰA NÀY"}
                        </Button>
                    );
                }

                // Cược Cặp QUINELLA hoặc EXACTA
                return (
                    <div className="flex gap-2 justify-center">
                        <Button
                            size="small"
                            type={isSelectedAs1 ? "primary" : "dashed"}
                            disabled={isDisabled || isSelectedAs2}
                            onClick={() => setBettingHorseRegId(record.registrationId)}
                            className={isSelectedAs1 ? "bg-yellow-500 font-bold text-black border-none" : "text-yellow-400 border-yellow-500"}
                        >
                            {selectedBetType === 'EXACTA' ? '🥇 Nhất' : 'Ngựa A'}
                        </Button>
                        <Button
                            size="small"
                            type={isSelectedAs2 ? "primary" : "dashed"}
                            disabled={isDisabled || isSelectedAs1}
                            onClick={() => setBettingHorseRegId2(record.registrationId)}
                            className={isSelectedAs2 ? "bg-blue-600 font-bold text-white border-none" : "text-blue-400 border-blue-500"}
                        >
                            {selectedBetType === 'EXACTA' ? '🥈 Nhì' : 'Ngựa B'}
                        </Button>
                    </div>
                );
            }
        }
    ];

    return (
        <div className="max-w-6xl mx-auto p-4">
            <Title level={3} className="mb-6 border-b border-gray-800 pb-2 flex justify-between items-center text-white">
                <span><RocketOutlined className="text-yellow-400 mr-2" /> Cá Cược Trực Tuyến (Parimutuel Pool bet989)</span>
                <span className="text-sm font-normal bg-[#1e1e1e] text-yellow-400 px-4 py-2 rounded-xl border border-yellow-500/30">
                    💰 Số dư ví: <b>{Number(walletBalance).toLocaleString()} VNĐ</b>
                </span>
            </Title>

            <Alert
                message="Quy tắc tính tỷ lệ cược Parimutuel bet989"
                description="Tỷ lệ cược thay đổi liên tục theo tổng tiền cược chung (Pool). Ban tổ chức lấy % phế cố định (35% GGR), 65% còn lại chia đều cho những người cược trúng cửa theo tỷ lệ số tiền đặt. Tỷ lệ cược được chốt chính thức khi chặng đua bắt đầu."
                type="info"
                showIcon
                icon={<InfoCircleOutlined />}
                className="mb-6 rounded-xl bg-[#162a22] border-[#007355] text-gray-200"
            />

            <Card className="shadow-lg border border-gray-800 bg-[#1e1e1e] mb-6 rounded-xl">
                <Alert
                    message={
                        <span className="font-bold text-yellow-400 text-lg flex items-center gap-2">
                            <InfoCircleOutlined /> QUY TẮC PHÂN BỔ DÒNG TIỀN (100% TOTAL POOL) & 4 THỂ LOẠI CƯỢC
                        </span>
                    }
                    description={
                        <div className="text-gray-300 text-sm mt-2 space-y-2">
                            <div className="p-3 bg-[#14261d] rounded-lg border border-[#007355]">
                                <Text className="font-bold text-green-400 block mb-1">💰 Công Thức Phân Bổ Dòng Tiền Tuyệt Đối 100%:</Text>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li><span className="text-yellow-300 font-bold">Quỹ Trả Thưởng Khán Giả (65% Payout Pool):</span> Dành riêng 100% để trả thưởng cho người chơi đoán trúng vé cược. Không bị trích cho bất kỳ bên nào khác.</li>
                                    <li><span className="text-blue-300 font-bold">Doanh Thu Nhà Cái (35% GGR):</span> Trích <b>5%</b> thưởng cho Chủ Ngựa Nhất, <b>2%</b> thưởng cho Nài Ngựa Nhất. Nhà cái nhận <b>28% Doanh Thu Ròng (Net GGR)</b>.</li>
                                    <li className="italic text-gray-400">Kiểm toán tuyệt đối: 100% Total Pool = 65% Trả Thưởng Khách + 5% Thưởng Chủ + 2% Thưởng Nài + 28% Doanh Thu Ròng Nhà Cái.</li>
                                </ul>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                                <div className="p-2.5 bg-gray-900 rounded-lg border border-gray-800">
                                    <Text className="font-bold text-yellow-400 block">🥇 1. Cược Win (Đơn Thắng):</Text>
                                    <Text className="text-xs text-gray-400">Đoán con ngựa về vị trí <b>thứ 1 (Vô Địch)</b>.<br/>Odds = (Doanh thu Win × 65%) / Tổng cược vào ngựa thắng.</Text>
                                </div>
                                <div className="p-2.5 bg-gray-900 rounded-lg border border-gray-800">
                                    <Text className="font-bold text-green-400 block">🥈 2. Cược Place (Nhất Nhì):</Text>
                                    <Text className="text-xs text-gray-400">Đoán con ngựa về vị trí <b>thứ 1 hoặc thứ 2</b>.<br/>Bể 65% chia đôi (32.5% cho Nhất & 32.5% cho Nhì).</Text>
                                </div>
                                <div className="p-2.5 bg-gray-900 rounded-lg border border-gray-800">
                                    <Text className="font-bold text-blue-400 block">👯 3. Cược Quinella (Cặp Đôi Top 2):</Text>
                                    <Text className="text-xs text-gray-400">Đoán cặp 2 con về <b>Top 2</b> (bất kể thứ tự).<br/>Odds = (Doanh thu Quinella × 65%) / Tổng cược vào cặp thắng.</Text>
                                </div>
                                <div className="p-2.5 bg-gray-900 rounded-lg border border-gray-800">
                                    <Text className="font-bold text-red-400 block">🎯 4. Cược Exacta (Cặp Chính Xác + Jackpot):</Text>
                                    <Text className="text-xs text-gray-400">Đoán chính xác <b>Con A Nhất & Con B Nhì</b>.<br/>Nếu không ai trúng, 65% bể Exacta tích lũy (Carryover) chuyển sang chặng cùng Class tiếp theo!</Text>
                                </div>
                            </div>
                        </div>
                    }
                    type="info"
                    className="border-none bg-transparent p-0"
                />
            </Card>

            <Spin spinning={loadingRaces}>
                {races.length === 0 ? (
                    <Card className="shadow-sm rounded-xl py-10 bg-[#1e1e1e] border-gray-800">
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                <span className="text-gray-400 text-lg">
                                    Hiện chưa có cuộc đua nào sắp diễn ra.<br/> Mời bạn quay lại sau nhé!
                                </span>
                            }
                        />
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {races.map(race => (
                            <Card key={race.id} className="shadow-md hover:shadow-lg transition-shadow border-t-4 border-[#007355] bg-[#1e1e1e] rounded-xl border-gray-800">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider">{race.tournamentName}</Text>
                                        <Title level={4} className="mt-1 mb-0 text-yellow-400">{race.name}</Title>
                                    </div>
                                    <Tag color="orange" className="font-bold border-orange-300 px-3 py-1">SẮP DIỄN RA</Tag>
                                </div>
                                {(() => {
                                    const raceDate = race.raceTime ? new Date(race.raceTime) : null;
                                    const isValidDate = raceDate && !isNaN(raceDate.getTime()) && raceDate.getFullYear() > 1970;
                                    const isLocked = race.status === 'LOCK_SESSION' || (isValidDate && (raceDate.getTime() - currentTime <= 60000));
                                    return (
                                        <>
                                            <div className="text-gray-400 mb-6 font-medium">
                                                Thời gian chạy: <span className="text-white font-bold">{isValidDate ? raceDate.toLocaleString('vi-VN') : 'Chờ chốt lịch'}</span>
                                            </div>
                                            {isLocked ? (
                                                <Button
                                                    type="default"
                                                    size="large"
                                                    block
                                                    disabled
                                                    className="bg-gray-800 font-bold tracking-wide text-gray-500 border-none"
                                                >
                                                    ĐÃ KHÓA NHẬN CƯỢC
                                                </Button>
                                            ) : (
                                                <Button
                                                    type="primary"
                                                    size="large"
                                                    block
                                                    className="bg-[#007355] hover:bg-[#005740] text-white font-bold tracking-wide border-none shadow-md"
                                                    onClick={() => handleOpenBetModal(race)}
                                                >
                                                    XEM TỶ LỆ & VÀO TIỀN
                                                </Button>
                                            )}
                                        </>
                                    );
                                })()}
                            </Card>
                        ))}
                    </div>
                )}
            </Spin>

            {/* MODAL ĐẶT CƯỢC 4 THỂ LOẠI */}
            <Modal
                title={<span className="text-xl font-bold text-yellow-400">🏇 Bảng Kèo Cá Cược bet989: {selectedRace?.name}</span>}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={1050}
                centered
                className="b989-bet-modal"
            >
                <div className="mb-4 bg-[#162a22] p-3 rounded-lg flex justify-between items-center border border-[#007355]">
                    <Text className="text-gray-300">Số dư ví khả dụng:</Text>
                    <Text className="font-bold text-yellow-400 text-lg">{Number(walletBalance).toLocaleString()} VNĐ</Text>
                </div>

                {/* THÔNG TIN CHẶNG ĐUA & CƠ CẤU GIẢI THƯỞNG */}
                {selectedRace && (
                    <div className="mb-4 bg-[#14261d] p-3 rounded-lg border border-[#007355] text-xs">
                        <div className="grid grid-cols-3 gap-2 text-center mb-2">
                            <div className="bg-yellow-500/10 p-1.5 rounded border border-yellow-500/30">
                                <Text className="text-[10px] text-yellow-400 font-bold block">🥇 GIẢI NHẤT</Text>
                                <Text className="font-bold text-yellow-300">{Number(selectedRace.prize1 || 10000000).toLocaleString()}đ</Text>
                            </div>
                            <div className="bg-gray-400/10 p-1.5 rounded border border-gray-400/30">
                                <Text className="text-[10px] text-gray-300 font-bold block">🥈 GIẢI NHÌ</Text>
                                <Text className="font-bold text-gray-200">{Number(selectedRace.prize2 || 5000000).toLocaleString()}đ</Text>
                            </div>
                            <div className="bg-amber-700/10 p-1.5 rounded border border-amber-700/30">
                                <Text className="text-[10px] text-amber-500 font-bold block">🥉 GIẢI BA</Text>
                                <Text className="font-bold text-amber-400">{Number(selectedRace.prize3 || 2000000).toLocaleString()}đ</Text>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-gray-300 pt-1 border-t border-gray-700/50">
                            <span>🏆 Quy Định: <strong className="text-yellow-400">Class {selectedRace.raceClass || selectedRace.requiredClass || 4}</strong></span>
                            <span>💰 Tổng Bể Live: <strong className="text-green-400">{Number(selectedRace.totalPool || 0).toLocaleString()}đ</strong></span>
                            <span>👨‍⚖️ Trọng Tài: <strong className="text-blue-400">{selectedRace.refereeUsername || 'Ban Trọng Tài'}</strong></span>
                        </div>
                    </div>
                )}

                {/* THIẾT LẬP 4 LOẠI CƯỢC */}
                <div className="mb-4">
                    <Text strong className="text-gray-300 block mb-2">Chọn Thể Loại Đặt Cược:</Text>
                    <Segmented
                        block
                        size="large"
                        options={[
                            { label: <span className="font-bold"><TrophyOutlined className="text-yellow-400" /> Cược Win (Đơn Thắng)</span>, value: 'WIN' },
                            { label: <span className="font-bold"><RocketOutlined className="text-green-400" /> Cược Place (Top 2)</span>, value: 'PLACE' },
                            { label: <span className="font-bold"><SwapOutlined className="text-blue-400" /> Cược Quinella (Cặp Đôi)</span>, value: 'QUINELLA' },
                            { label: <span className="font-bold"><AimOutlined className="text-red-400" /> Cược Exacta (Cặp Chính Xác)</span>, value: 'EXACTA' },
                        ]}
                        value={selectedBetType}
                        onChange={(val) => {
                            setSelectedBetType(val);
                            setBettingHorseRegId(null);
                            setBettingHorseRegId2(null);
                        }}
                        className="bg-[#1a1a1a] text-white"
                    />
                </div>

                {/* THÔNG TIN HƯỚNG DẪN LOẠI CƯỢC */}
                <div className="mb-4 p-3 bg-[#1e1e1e] border border-gray-700 rounded-lg text-xs text-gray-300">
                    {selectedBetType === 'WIN' && <span className="text-yellow-400 font-bold">🥇 Cược Win: Chọn 1 chiến mã duy nhất về Nhất (Vô địch).</span>}
                    {selectedBetType === 'PLACE' && <span className="text-green-400 font-bold">🥈 Cược Place: Chọn 1 chiến mã về ở vị trí số 1 hoặc số 2.</span>}
                    {selectedBetType === 'QUINELLA' && <span className="text-blue-400 font-bold">👯 Cược Quinella: Chọn cặp 2 chiến mã về Top 2 (Không phân biệt con nào Nhất, con nào Nhì).</span>}
                    {selectedBetType === 'EXACTA' && <span className="text-red-400 font-bold">🎯 Cược Exacta: Chọn 2 chiến mã đoán chính xác tuyệt đối: Con A về Nhất & Con B về Nhì.</span>}
                </div>

                {/* BẢNG CHỌN NGỰA / CỰC CẶP */}
                <Table
                    dataSource={liveOdds}
                    columns={oddsColumns}
                    rowKey="registrationId"
                    pagination={false}
                    loading={loadingOdds}
                    size="small"
                    scroll={{ y: '35vh' }}
                    className="mt-2 border border-gray-800 rounded-lg"
                />

                {/* BẢNG CHỌN NGỰA RIÊNG CHO EXACTA / QUINELLA */}
                {(selectedBetType === 'QUINELLA' || selectedBetType === 'EXACTA') && (
                    <div className="mt-4 p-4 bg-[#1e1e1e] border border-gray-700 rounded-xl grid grid-cols-2 gap-4">
                        <div>
                            <Text strong className="text-yellow-400 block mb-1">
                                {selectedBetType === 'EXACTA' ? '🥇 Chọn Ngựa Về Nhất (Ngựa 1):' : '🏇 Chọn Chiến Mã A:'}
                            </Text>
                            <Select
                                className="w-full"
                                placeholder="Chọn chiến mã 1"
                                value={bettingHorseRegId}
                                onChange={setBettingHorseRegId}
                                options={liveOdds.map(o => ({
                                    label: `Cổng ${o.gateNumber || '?'}: ${o.horseName}`,
                                    value: o.registrationId,
                                    disabled: o.registrationId === bettingHorseRegId2 || o.status === 'DISQUALIFIED' || o.status === 'WITHDRAWN'
                                }))}
                            />
                        </div>
                        <div>
                            <Text strong className="text-blue-400 block mb-1">
                                {selectedBetType === 'EXACTA' ? '🥈 Chọn Ngựa Về Nhì (Ngựa 2):' : '🏇 Chọn Chiến Mã B:'}
                            </Text>
                            <Select
                                className="w-full"
                                placeholder="Chọn chiến mã 2"
                                value={bettingHorseRegId2}
                                onChange={setBettingHorseRegId2}
                                options={liveOdds.map(o => ({
                                    label: `Cổng ${o.gateNumber || '?'}: ${o.horseName}`,
                                    value: o.registrationId,
                                    disabled: o.registrationId === bettingHorseRegId || o.status === 'DISQUALIFIED' || o.status === 'WITHDRAWN'
                                }))}
                            />
                        </div>
                    </div>
                )}

                <div className="mt-4 p-4 bg-[#162a22] border border-[#007355] rounded-xl">
                    <Title level={5} className="mb-2 text-white">Nhập số tiền đặt cược (VNĐ):</Title>
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
                            className="bg-yellow-500 text-black font-bold w-48 border-none hover:bg-yellow-400 hover:scale-105 transition-all"
                            onClick={handlePlaceBet}
                            loading={submittingBet}
                            icon={<DollarOutlined />}
                        >
                            CHỐT VÉ CƯỢC
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default BettingPage;