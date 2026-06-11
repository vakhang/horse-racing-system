import React, { useState, useEffect } from 'react';
import { Card, Statistic, Table, Tabs, Tag, message } from 'antd';
import { WalletOutlined, HistoryOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const HomePage = () => {
    const [balance, setBalance] = useState(0);
    const [bets, setBets] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const { user } = useAuth();
    const userId = user?.id; // Lấy ID từ Context
    const token = user?.token; // Lấy Token từ Context

    // Setup Axios đính kèm Token
    const api = axios.create({
        baseURL: 'http://localhost:8080/api',
        headers: { Authorization: `Bearer ${token}` }
    });

    useEffect(() => {
        if (userId && token) {
            fetchDashboardData();
        }
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [walletRes, betsRes, transRes] = await Promise.all([
                api.get(`/wallets/my-wallet?userId=${userId}`),
                api.get(`/users/my-bets?userId=${userId}`),
                api.get(`/users/my-transactions?userId=${userId}`)
            ]);
            setBalance(walletRes.data.balance);
            setBets(betsRes.data);
            setTransactions(transRes.data);
        } catch (error) {
            console.error(error);
            message.error('Không thể tải dữ liệu tổng quan!');
        } finally {
            setLoading(false);
        }
    };

    // --- Cột bảng Cược ---
    const betColumns = [
        { title: 'Chặng Đua', dataIndex: 'raceName', key: 'raceName' },
        { title: 'Ngựa Đặt', dataIndex: 'horseName', key: 'horseName', render: (val) => <span className="font-semibold text-blue-600">{val}</span> },
        { title: 'Tiền Cược', dataIndex: 'amount', key: 'amount', render: (val) => `${val.toLocaleString()} đ` },
        { title: 'Tỷ lệ', dataIndex: 'odds', key: 'odds', render: (val) => val ? val : 'Đang tính...' },
        {
            title: 'Trạng Thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = status === 'WON' ? 'green' : status === 'LOST' ? 'red' : 'orange';
                return <Tag color={color}>{status}</Tag>;
            }
        },
        { title: 'Thưởng', dataIndex: 'rewardAmount', key: 'rewardAmount', render: (val) => <span className="text-green-600 font-bold">+{val.toLocaleString()} đ</span> },
    ];

    // --- Cột bảng Giao dịch ---
    const transColumns = [
        { title: 'Mã GD', dataIndex: 'transactionCode', key: 'transactionCode' },
        { title: 'Loại', dataIndex: 'type', key: 'type', render: (val) => <Tag color="blue">{val}</Tag> },
        {
            title: 'Số Tiền',
            key: 'amount',
            render: (record) => {
                const isIncome = record.direction === 'IN';
                return (
                    <span className={isIncome ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                        {isIncome ? '+' : '-'}{record.amount.toLocaleString()} đ
                    </span>
                );
            }
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => <Tag color={status === 'COMPLETED' ? 'green' : 'gold'}>{status}</Tag>
        },
        { title: 'Thời Gian', dataIndex: 'createdAt', key: 'createdAt', render: (val) => new Date(val).toLocaleString() },
    ];

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold text-gray-800">THÔNG TIN VÍ CỦA TÔI</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="shadow-md rounded-xl border-l-4 border-blue-500 hover:-translate-y-1 transition duration-300">
                    <Statistic
                        title={<span className="text-gray-500 font-medium">Số dư ví hiện tại</span>}
                        value={balance}
                        precision={0}
                        suffix="VNĐ"
                        prefix={<WalletOutlined className="text-blue-500 mr-2" />}
                        valueStyle={{ color: '#1d4ed8', fontWeight: 'bold', fontSize: '28px' }}
                    />
                </Card>
            </div>

            <Card className="shadow-sm rounded-lg mt-4">
                <Tabs defaultActiveKey="1" items={[
                    { key: '1', label: <span><HistoryOutlined /> Lịch sử Đặt Cược</span>, children: <Table dataSource={bets} columns={betColumns} rowKey="id" loading={loading} /> },
                    { key: '2', label: <span><WalletOutlined /> Lịch sử Giao Dịch</span>, children: <Table dataSource={transactions} columns={transColumns} rowKey="transactionCode" loading={loading} /> }
                ]} />
            </Card>
        </div>
    );
};

export default HomePage;