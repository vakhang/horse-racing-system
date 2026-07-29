import React, { useState, useEffect } from 'react';
import { Card, Statistic, Table, Tabs, Tag, message } from 'antd';
import { WalletOutlined, HistoryOutlined, FallOutlined, RiseOutlined } from '@ant-design/icons';
import axios from 'axios';
import api from '../../config/api';

const UserDashboard = () => {
    const [balance, setBalance] = useState(0);
    const [bets, setBets] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    const axiosInstance = axios.create({
        baseURL: 'https://horse-racing-system-production-492c.up.railway.app/api',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    useEffect(() => {
        if (!userId || !token) {
            message.error('Vui lòng đăng nhập lại!');
            return;
        }
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [walletRes, betsRes, transRes] = await Promise.all([
                axiosInstance.get(`/wallets/my-wallet?userId=${userId}`),
                axiosInstance.get(`/users/my-bets?userId=${userId}`),
                axiosInstance.get(`/users/my-transactions?userId=${userId}`)
            ]);

            // BỌC KHIÊN THÉP
            setBalance(walletRes.data?.balance || 0);
            setBets(betsRes.data || []);
            setTransactions(transRes.data || []);
        } catch (error) {
            console.error(error);
            message.error('Không thể tải dữ liệu. Bạn đã gắn đúng Token chưa?');
        } finally {
            setLoading(false);
        }
    };

    const betColumns = [
        { title: 'Chặng Đua', dataIndex: 'raceName', key: 'raceName' },
        { title: 'Ngựa Đặt', dataIndex: 'horseName', key: 'horseName' },
        {
            title: 'Tiền Cược',
            dataIndex: 'amount',
            key: 'amount',
            render: (val) => <span className="font-semibold">{Number(val || 0).toLocaleString()} đ</span>
        },
        { title: 'Tỷ lệ', dataIndex: 'odds', key: 'odds' },
        {
            title: 'Trạng Thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = status === 'WON' ? 'green' : status === 'LOST' ? 'red' : 'orange';
                const text = status === 'WON' ? 'THẮNG' : status === 'LOST' ? 'THUA' : 'CHỜ XỬ LÝ';
                return <Tag color={color}>{text}</Tag>;
            }
        },
        {
            title: 'Tiền Thưởng',
            dataIndex: 'rewardAmount',
            key: 'rewardAmount',
            render: (val) => <span className="text-green-600 font-bold">+{Number(val || 0).toLocaleString()} đ</span>
        },
    ];

    const transColumns = [
        { title: 'Mã GD', dataIndex: 'transactionCode', key: 'transactionCode' },
        { title: 'Loại', dataIndex: 'type', key: 'type', render: (val) => {
            const text = val === 'DEPOSIT' ? 'NẠP TIỀN' : val === 'WITHDRAW' ? 'RÚT TIỀN' : val === 'BET' ? 'ĐẶT CƯỢC' : val === 'REWARD' ? 'NHẬN THƯỞNG' : val;
            return <Tag color="blue">{text}</Tag>;
        } },
        {
            title: 'Số Tiền',
            key: 'amount',
            render: (record) => {
                const isIncome = record.direction === 'IN';
                return (
                    <span className={isIncome ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                        {isIncome ? '+' : '-'}{Number(record.amount || 0).toLocaleString()} đ
                    </span>
                );
            }
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = status === 'COMPLETED' ? 'green' : status === 'REJECTED' ? 'red' : 'gold';
                const text = status === 'COMPLETED' ? 'ĐÃ HOÀN TẤT' : status === 'REJECTED' ? 'TỪ CHỐI' : 'CHỜ XỬ LÝ';
                return <Tag color={color}>{text}</Tag>;
            }
        },
        { title: 'Thời Gian', dataIndex: 'createdAt', key: 'createdAt', render: (val) => new Date(val).toLocaleString() },
    ];

    const tabItems = [
        {
            key: '1',
            label: <span><HistoryOutlined /> Lịch sử Đặt Cược</span>,
            children: <Table dataSource={bets} columns={betColumns} rowKey="id" loading={loading} />
        },
        {
            key: '2',
            label: <span><WalletOutlined /> Lịch sử Giao Dịch</span>,
            children: <Table dataSource={transactions} columns={transColumns} rowKey="transactionCode" loading={loading} />
        }
    ];

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold text-gray-800">Tổng Quan Tài Khoản</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="shadow-sm border-l-4 border-blue-500 rounded-lg">
                    <Statistic
                        title={<span className="text-gray-500 font-medium text-base">Số dư ví hiện tại</span>}
                        value={Number(balance || 0)}
                        precision={0}
                        suffix="VNĐ"
                        prefix={<WalletOutlined className="text-blue-500 mr-2" />}
                        valueStyle={{ color: '#1d4ed8', fontWeight: 'bold' }}
                    />
                </Card>
            </div>
            <Card className="shadow-sm rounded-lg">
                <Tabs defaultActiveKey="1" items={tabItems} />
            </Card>
        </div>
    );
};

export default UserDashboard;