import React, { useState, useEffect } from 'react';
import { Card, Statistic, Table, Tabs, Tag, Typography } from 'antd';
import { WalletOutlined, HistoryOutlined, TrophyOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import api from '../config/api';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const HomePage = () => {
    const [balance, setBalance] = useState(0);
    const [bets, setBets] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [jockeyRewards, setJockeyRewards] = useState([]);
    const [loading, setLoading] = useState(true);

    const { user } = useAuth();
    const userId = user?.id;
    const token = user?.token || localStorage.getItem('token');

    

    useEffect(() => {
        if (userId && token) {
            fetchDashboardData();
        }
    }, [userId, token]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const walletRes = await api.get(`/wallets/my-wallet?userId=${userId}`);
            setBalance(walletRes.data?.balance || 0);
        } catch (error) {
            setBalance(0); // Lỗi ngầm nếu chưa có ví thì gán = 0, Backend tự fix
        }

        try {
            if (user?.role === 'SPECTATOR') {
                const betsRes = await api.get(`/users/my-bets?userId=${userId}`);
                setBets(betsRes.data || []);
            }

            const transRes = await api.get(`/users/my-transactions?userId=${userId}`);
            setTransactions(transRes.data || []);

            if (user?.role === 'JOCKEY') {
                setJockeyRewards([
                    { id: 1, raceName: 'Siêu giải đấu XUKA', horseName: 'Xích Thố', rank: 1, reward: 15000000, date: dayjs().subtract(1, 'day').toISOString() },
                    { id: 2, raceName: 'Cúp FPT Mùa Hè 2026', horseName: 'Ngựa Lạc Hồng', rank: 2, reward: 5000000, date: dayjs().subtract(3, 'day').toISOString() }
                ]);
            }
        } catch (error) {
            // Chỉ im lặng thôi
        } finally {
            setLoading(false);
        }
    };

    const betColumns = [
        { title: 'Chặng Đua', dataIndex: 'raceName', key: 'raceName' },
        { title: 'Ngựa Đặt', dataIndex: 'horseName', key: 'horseName', render: (val) => <span className="font-semibold text-blue-600">{val}</span> },
        { title: 'Tiền Cược', dataIndex: 'amount', key: 'amount', render: (val) => `${Number(val || 0).toLocaleString()} đ` },
        { title: 'Tỷ lệ', dataIndex: 'odds', key: 'odds', render: (val) => val ? val : 'Đang tính...' },
        {
            title: 'Trạng Thái', dataIndex: 'status', key: 'status',
            render: (status) => {
                let color = status === 'WON' ? 'green' : status === 'LOST' ? 'red' : 'orange';
                const text = status === 'WON' ? 'THẮNG' : status === 'LOST' ? 'Đã thua' : 'CHỜ XỬ LÝ';
                return <Tag color={color} className="font-bold">{text}</Tag>;
            }
        },
        { title: 'Thưởng', dataIndex: 'rewardAmount', key: 'rewardAmount', render: (val) => <span className="text-green-600 font-bold">+{Number(val || 0).toLocaleString()} đ</span> }
    ];

    const rewardColumns = [
        { title: 'Tên Chặng Đua', dataIndex: 'raceName', key: 'raceName', render: (val) => <span className="font-bold text-blue-700 text-base">{val}</span> },
        { title: 'Chiến Mã Điều Khiển', dataIndex: 'horseName', key: 'horseName', render: (val) => <Tag color="geekblue" className="font-medium text-sm px-3 py-1">{val}</Tag> },
        { title: 'Thứ Hạng Về Đích', dataIndex: 'rank', key: 'rank', align: 'center', render: (val) => val === 1 ? <Tag color="gold" className="font-bold text-sm px-3 py-1">TOP 1 🏆</Tag> : <Tag color="silver" className="font-bold px-3 py-1">TOP {val}</Tag> },
        { title: 'Tiền Công / Thưởng', dataIndex: 'reward', key: 'reward', render: (val) => <span className="text-green-600 font-bold text-lg">+{Number(val || 0).toLocaleString()} VNĐ</span> },
        { title: 'Thời Gian Ghi Nhận', dataIndex: 'date', key: 'date', render: (val) => dayjs(val).format('HH:mm - DD/MM/YYYY') },
    ];

    const transColumns = [
        { title: 'Mã GD', dataIndex: 'transactionCode', key: 'transactionCode', render: t => <span className="font-bold text-gray-600 tracking-widest">{t}</span> },
        {
            title: 'Loại Giao Dịch', dataIndex: 'type', key: 'type',
            render: (val) => {
                if (val === 'REWARD') return <Tag color="magenta" className="font-bold">THƯỞNG THẮNG CHẶNG</Tag>;
                if (val === 'SALARY') return <Tag color="cyan" className="font-bold">LƯƠNG CỨNG</Tag>;
                if (val === 'WITHDRAW') return <Tag color="orange" className="font-bold">RÚT TIỀN VỀ NGÂN HÀNG</Tag>;
                if (val === 'DEPOSIT') return <Tag color="blue" className="font-bold">NẠP TIỀN</Tag>;
                const text = val === 'BET' ? 'ĐẶT CƯỢC' : val;
                return <Tag color="default">{text}</Tag>;
            }
        },
        {
            title: 'Số Tiền', key: 'amount',
            render: (_, record) => {
                const isIncome = record.direction === 'IN';
                return (
                    <span className={isIncome ? 'text-green-600 font-bold text-base' : 'text-red-600 font-bold text-base'}>
                        {isIncome ? '+' : '-'}{Number(record.amount || 0).toLocaleString()} đ
                    </span>
                );
            }
        },
        {
            title: 'Trạng Thái', dataIndex: 'status', key: 'status',
            render: (status) => {
                if (status === 'PENDING') return <Tag color="warning" className="font-bold px-3 py-1">CHỜ XỬ LÝ</Tag>;
                if (status === 'COMPLETED') return <Tag color="success" className="font-bold px-3 py-1">ĐÃ HOÀN TẤT</Tag>;
                if (status === 'REJECTED') return <Tag color="error" className="font-bold px-3 py-1">TỪ CHỐI</Tag>;
                return <Tag>{status}</Tag>;
            }
        },
        { title: 'Thời Gian', dataIndex: 'createdAt', key: 'createdAt', render: (val) => dayjs(val).format('HH:mm - DD/MM/YYYY') },
    ];

    const tabItems = [];

    if (user?.role === 'SPECTATOR') {
        tabItems.push({
            key: 'bets', label: <span className="text-base font-bold"><HistoryOutlined /> Lịch sử Đặt Cược</span>,
            children: <Table dataSource={bets} columns={betColumns} rowKey="id" loading={loading} className="border rounded-xl" />
        });
    }

    if (user?.role === 'JOCKEY') {
        tabItems.push({
            key: 'rewards', label: <span className="text-base font-bold text-blue-600"><TrophyOutlined /> Lịch Sử Thưởng Chặng</span>,
            children: <Table dataSource={jockeyRewards} columns={rewardColumns} rowKey="id" loading={loading} className="border rounded-xl" />
        });
    }

    tabItems.push({
        key: 'transactions', label: <span className="text-base font-bold"><WalletOutlined /> Sổ Nhật Ký Dòng Tiền</span>,
        children: <Table dataSource={transactions} columns={transColumns} rowKey="transactionCode" loading={loading} className="border rounded-xl" />
    });

    return (
        <div className="flex flex-col gap-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 uppercase tracking-wide border-b pb-2">
                {user?.role === 'SPECTATOR' ? 'LỊCH SỬ GIAO DỊCH' : 'LỊCH SỬ THU NHẬP'}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                <Card className="shadow-md rounded-xl bg-gradient-to-br from-[#001529] to-blue-900 text-white border-none h-full flex flex-col justify-center">
                    <Statistic
                        title={<span className="text-gray-300 font-medium text-base">Tổng số dư khả dụng (Đã trừ Thuế)</span>}
                        value={Number(balance || 0)}
                        precision={0}
                        suffix="VNĐ"
                        prefix={<WalletOutlined className="text-yellow-400 mr-2" />}
                        valueStyle={{ color: '#facc15', fontWeight: 'bold', fontSize: '32px' }}
                    />
                </Card>

                {user?.role !== 'SPECTATOR' && (
                    <Card className="md:col-span-2 shadow-md rounded-xl border-l-4 border-red-500 bg-red-50 h-full">
                        <Title level={5} className="text-red-700 m-0 flex items-center mb-2">
                            <InfoCircleOutlined className="mr-2" /> Quy Định Khấu Trừ Thuế TNCN Tại Nguồn
                        </Title>
                        <Paragraph className="text-sm m-0 text-gray-700">
                            Theo quy định pháp luật hiện hành, mọi khoản thu nhập từ tiền thưởng, thù lao thi đấu của Người lao động (Chủ ngựa, Nài ngựa, Trọng tài) sẽ bị khấu trừ Thuế TNCN theo <strong>biểu thuế lũy tiến từng phần</strong> trước khi cộng vào số dư.
                            <ul className="list-disc pl-5 mt-2 font-medium space-y-1">
                                <li>Bậc 1: Đến 10 triệu đồng/tháng - Thuế suất <Text type="danger" strong>5%</Text>.</li>
                                <li>Bậc 2: Trên 10 đến 30 triệu đồng/tháng - Thuế suất <Text type="danger" strong>10%</Text>.</li>
                                <li>Bậc 3: Trên 30 đến 60 triệu đồng/tháng - Thuế suất <Text type="danger" strong>20%</Text>.</li>
                                <li>Bậc 4: Trên 60 đến 100 triệu đồng/tháng - Thuế suất <Text type="danger" strong>30%</Text>.</li>
                                <li>Bậc 5: Trên 100 triệu đồng/tháng - Thuế suất <Text type="danger" strong>35%</Text>.</li>
                            </ul>
                        </Paragraph>
                    </Card>
                )}
            </div>

            <Card className="shadow-sm rounded-lg mt-2 border-none">
                <Tabs defaultActiveKey={user?.role === 'JOCKEY' ? 'rewards' : 'transactions'} items={tabItems} size="large" />
            </Card>
        </div>
    );
};

export default HomePage;