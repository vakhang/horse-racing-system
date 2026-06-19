// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, Statistic, Table, Tabs, Tag, message, Typography } from 'antd';
import { WalletOutlined, HistoryOutlined, TrophyOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title } = Typography;

const HomePage = () => {
    const [balance, setBalance] = useState(0);
    const [bets, setBets] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [jockeyRewards, setJockeyRewards] = useState([]);
    const [loading, setLoading] = useState(true);

    const { user } = useAuth();
    const userId = user?.id;
    const token = user?.token || localStorage.getItem('token');

    const api = axios.create({
        baseURL: 'http://localhost:8080/api',
        headers: { Authorization: `Bearer ${token}` }
    });

    useEffect(() => {
        if (userId && token) {
            fetchDashboardData();
        }
    }, [userId, token]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Lấy số dư ví
            const walletRes = await api.get(`/wallets/my-wallet?userId=${userId}`);
            setBalance(walletRes.data.balance);

            // Chỉ lấy lịch sử cược nếu là Khán giả
            if (user?.role === 'SPECTATOR') {
                const betsRes = await api.get(`/users/my-bets?userId=${userId}`);
                setBets(betsRes.data || []);
            }

            // Lấy lịch sử giao dịch chung
            const transRes = await api.get(`/users/my-transactions?userId=${userId}`);
            let txData = transRes.data || [];

            // GIẢ LẬP DỮ LIỆU "THƯỞNG CHẶNG" CHUYÊN BIỆT CHO NÀI NGỰA
            if (user?.role === 'JOCKEY') {
                setJockeyRewards([
                    { id: 1, raceName: 'Siêu giải đấu XUKA', horseName: 'Xích Thố', rank: 1, reward: 15000000, date: dayjs().subtract(1, 'day').toISOString() },
                    { id: 2, raceName: 'Cúp FPT Mùa Hè 2026', horseName: 'Ngựa Lạc Hồng', rank: 2, reward: 5000000, date: dayjs().subtract(3, 'day').toISOString() }
                ]);

                // Đồng bộ lịch sử giao dịch tương ứng
                if (txData.length < 2) {
                    txData = [
                        { transactionCode: 'PRZ-A1B2C3', type: 'REWARD', direction: 'IN', amount: 15000000, status: 'COMPLETED', createdAt: dayjs().subtract(1, 'day').toISOString() },
                        { transactionCode: 'SAL-X9Y8Z7', type: 'SALARY', direction: 'IN', amount: 5000000, status: 'COMPLETED', createdAt: dayjs().subtract(3, 'day').toISOString() },
                        ...txData
                    ];
                }
            }

            setTransactions(txData);
        } catch (error) {
            console.error(error);
            message.error('Không thể tải dữ liệu tổng quan!');
        } finally {
            setLoading(false);
        }
    };

    // --- CỘT DÀNH CHO KHÁN GIẢ (CÁ CƯỢC) ---
    const betColumns = [
        { title: 'Chặng Đua', dataIndex: 'raceName', key: 'raceName' },
        { title: 'Ngựa Đặt', dataIndex: 'horseName', key: 'horseName', render: (val) => <span className="font-semibold text-blue-600">{val}</span> },
        { title: 'Tiền Cược', dataIndex: 'amount', key: 'amount', render: (val) => `${val ? val.toLocaleString() : 0} đ` },
        { title: 'Tỷ lệ', dataIndex: 'odds', key: 'odds', render: (val) => val ? val : 'Đang tính...' },
        {
            title: 'Trạng Thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'orange';
                if (status === 'WON') color = 'green';
                if (status === 'LOST') color = 'red';
                return <Tag color={color} className="font-bold">{status}</Tag>;
            }
        },
        { title: 'Thưởng', dataIndex: 'rewardAmount', key: 'rewardAmount', render: (val) => <span className="text-green-600 font-bold">+{val ? val.toLocaleString() : 0} đ</span> }
    ];

    // --- CỘT DÀNH CHO NÀI NGỰA (THƯỞNG CHẶNG) ---
    const rewardColumns = [
        { title: 'Tên Chặng Đua', dataIndex: 'raceName', key: 'raceName', render: (val) => <span className="font-bold text-blue-700 text-base">{val}</span> },
        { title: 'Chiến Mã Điều Khiển', dataIndex: 'horseName', key: 'horseName', render: (val) => <Tag color="geekblue" className="font-medium text-sm px-3 py-1">{val}</Tag> },
        {
            title: 'Thứ Hạng Về Đích',
            dataIndex: 'rank',
            key: 'rank',
            align: 'center',
            render: (val) => val === 1 ? <Tag color="gold" className="font-bold text-sm px-3 py-1">TOP 1 🏆</Tag> : <Tag color="silver" className="font-bold px-3 py-1">TOP {val}</Tag>
        },
        { title: 'Tiền Công / Thưởng', dataIndex: 'reward', key: 'reward', render: (val) => <span className="text-green-600 font-bold text-lg">+{val ? val.toLocaleString() : 0} VNĐ</span> },
        { title: 'Thời Gian Ghi Nhận', dataIndex: 'date', key: 'date', render: (val) => dayjs(val).format('HH:mm - DD/MM/YYYY') },
    ];

    // --- CỘT CHUNG (LỊCH SỬ GIAO DỊCH) ---
    const transColumns = [
        { title: 'Mã GD', dataIndex: 'transactionCode', key: 'transactionCode', render: t => <span className="font-bold text-gray-600 tracking-widest">{t}</span> },
        {
            title: 'Loại Giao Dịch',
            dataIndex: 'type',
            key: 'type',
            render: (val) => {
                if (val === 'REWARD') return <Tag color="magenta" className="font-bold">THƯỞNG THẮNG CHẶNG</Tag>;
                if (val === 'SALARY') return <Tag color="cyan" className="font-bold">LƯƠNG CỨNG (TỪ CHỦ NGỰA)</Tag>;
                if (val === 'WITHDRAW') return <Tag color="orange" className="font-bold">RÚT TIỀN VỀ NGÂN HÀNG</Tag>;
                if (val === 'DEPOSIT') return <Tag color="blue" className="font-bold">NẠP TIỀN</Tag>;
                return <Tag color="default">{val}</Tag>;
            }
        },
        {
            title: 'Số Tiền',
            key: 'amount',
            render: (_, record) => {
                const isIncome = record.direction === 'IN';
                return (
                    <span className={isIncome ? 'text-green-600 font-bold text-base' : 'text-red-600 font-bold text-base'}>
                        {isIncome ? '+' : '-'}{record.amount ? record.amount.toLocaleString() : 0} đ
                    </span>
                );
            }
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                if (status === 'PENDING') return <Tag color="warning" className="font-bold px-3 py-1">VUI LÒNG LIÊN HỆ BTC</Tag>;
                if (status === 'COMPLETED') return <Tag color="success" className="font-bold px-3 py-1">ĐÃ GIAO DỊCH THÀNH CÔNG</Tag>;
                if (status === 'REJECTED') return <Tag color="error" className="font-bold px-3 py-1">BỊ TỪ CHỐI</Tag>;
                return <Tag>{status}</Tag>;
            }
        },
        { title: 'Thời Gian', dataIndex: 'createdAt', key: 'createdAt', render: (val) => dayjs(val).format('HH:mm - DD/MM/YYYY') },
    ];

    // --- CẤU HÌNH TABS DỰA THEO ROLE CỦA NGƯỜI ĐĂNG NHẬP ---
    const tabItems = [];

    if (user?.role === 'SPECTATOR') {
        tabItems.push({
            key: 'bets',
            label: <span className="text-base font-bold"><HistoryOutlined /> Lịch sử Đặt Cược</span>,
            children: <Table dataSource={bets} columns={betColumns} rowKey="id" loading={loading} className="border rounded-xl" />
        });
    }

    if (user?.role === 'JOCKEY') {
        tabItems.push({
            key: 'rewards',
            label: <span className="text-base font-bold text-blue-600"><TrophyOutlined /> Lịch Sử Thưởng Chặng</span>,
            children: <Table dataSource={jockeyRewards} columns={rewardColumns} rowKey="id" loading={loading} className="border rounded-xl" />
        });
    }

    tabItems.push({
        key: 'transactions',
        label: <span className="text-base font-bold"><WalletOutlined /> Lịch Sử Giao Dịch</span>,
        children: <Table dataSource={transactions} columns={transColumns} rowKey="transactionCode" loading={loading} className="border rounded-xl" />
    });

    return (
        <div className="flex flex-col gap-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 uppercase tracking-wide border-b pb-2">
                {user?.role === 'JOCKEY' ? 'THU NHẬP CỦA TÔI' : 'THÔNG TIN VÍ CỦA TÔI'}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="shadow-md rounded-xl hover:-translate-y-1 transition duration-300 bg-gradient-to-r from-[#001529] to-blue-900 text-white border-none">
                    <Statistic
                        title={<span className="text-gray-300 font-medium text-lg">Số dư khả dụng</span>}
                        value={balance}
                        precision={0}
                        suffix="VNĐ"
                        prefix={<WalletOutlined className="text-yellow-400 mr-2" />}
                        valueStyle={{ color: '#facc15', fontWeight: 'bold', fontSize: '36px' }}
                    />
                </Card>
            </div>

            <Card className="shadow-sm rounded-lg mt-4 border-none">
                <Tabs defaultActiveKey={user?.role === 'JOCKEY' ? 'rewards' : 'bets'} items={tabItems} size="large" />
            </Card>
        </div>
    );
};

export default HomePage;