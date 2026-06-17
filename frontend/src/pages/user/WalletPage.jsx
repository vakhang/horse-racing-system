// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Typography, Card, Button, InputNumber, message, Alert, Modal, Tabs, Table, Tag } from 'antd';
import { WalletOutlined, BankOutlined, UploadOutlined, HistoryOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const WalletPage = () => {
    const { user } = useAuth();
    const token = user?.token || localStorage.getItem('token');

    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [depositAmount, setDepositAmount] = useState(50000);
    const [withdrawAmount, setWithdrawAmount] = useState(100000);
    const [loading, setLoading] = useState(false);
    const [withdrawLoading, setWithdrawLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);

    const [isWithdrawModalVisible, setIsWithdrawModalVisible] = useState(false);
    const [withdrawBill, setWithdrawBill] = useState(null);

    const api = axios.create({
        baseURL: 'http://localhost:8080/api',
        headers: { Authorization: `Bearer ${token}` }
    });

    useEffect(() => {
        if (user?.id) fetchWalletData();
    }, [user]);

    const fetchWalletData = async () => {
        setDataLoading(true);
        try {
            const [walletRes, transRes] = await Promise.all([
                api.get(`/wallets/my-wallet?userId=${user.id}`),
                api.get(`/users/my-transactions?userId=${user.id}`)
            ]);
            setBalance(walletRes.data.balance);

            let txData = transRes.data || [];

            // GIẢ LẬP DỮ LIỆU "REVENUE SHARE" & "PRIZE MONEY" CHO CHỦ NGỰA
            if (user?.role === 'OWNER' && txData.length < 2) {
                txData = [
                    { transactionCode: 'REV-' + Math.random().toString(36).substr(2, 6).toUpperCase(), type: 'REVENUE_SHARE', direction: 'IN', amount: 1500000, status: 'COMPLETED', createdAt: dayjs().subtract(1, 'day').toISOString() },
                    { transactionCode: 'PRZ-' + Math.random().toString(36).substr(2, 6).toUpperCase(), type: 'REWARD', direction: 'IN', amount: 50000000, status: 'COMPLETED', createdAt: dayjs().subtract(2, 'day').toISOString() },
                    ...txData
                ];
            }

            // GIẢ LẬP DỮ LIỆU "SALARY" & "REWARD" DÀNH RIÊNG CHO NÀI NGỰA
            if (user?.role === 'JOCKEY' && txData.length < 2) {
                txData = [
                    { transactionCode: 'SAL-' + Math.random().toString(36).substr(2, 6).toUpperCase(), type: 'SALARY', direction: 'IN', amount: 5000000, status: 'COMPLETED', createdAt: dayjs().subtract(1, 'day').toISOString() },
                    { transactionCode: 'PRZ-' + Math.random().toString(36).substr(2, 6).toUpperCase(), type: 'REWARD', direction: 'IN', amount: 15000000, status: 'COMPLETED', createdAt: dayjs().subtract(3, 'day').toISOString() },
                    ...txData
                ];
            }

            setTransactions(txData);
        } catch (error) {
            console.error("Lỗi tải ví/giao dịch:", error);
        } finally {
            setDataLoading(false);
        }
    };

    const handleDeposit = async () => {
        if (depositAmount <= 0) return message.warning("Số tiền nạp phải lớn hơn 0!");
        setLoading(true);
        try {
            await api.post('/wallets/deposit', { userId: user.id, amount: depositAmount });
            message.success(`Nạp thành công ${depositAmount.toLocaleString()} đ vào ví ảo!`);
            fetchWalletData();
            window.dispatchEvent(new Event('update_balance'));
            setDepositAmount(50000);
        } catch (error) { message.error(error.response?.data?.error || "Lỗi nạp tiền!"); }
        finally { setLoading(false); }
    };

    const executeWithdraw = async () => {
        setWithdrawLoading(true);
        try {
            const response = await api.post('/wallets/withdraw', { userId: user.id, amount: withdrawAmount });
            const transCode = response.data?.transactionCode || `WDR${Date.now().toString().slice(-7)}`;

            setWithdrawBill({ code: transCode, amount: withdrawAmount });
            setIsWithdrawModalVisible(true);

            fetchWalletData();
            window.dispatchEvent(new Event('update_balance'));
            setWithdrawAmount(100000);
        } catch (error) { message.error(error.response?.data?.error || "Lỗi rút tiền!"); }
        finally { setWithdrawLoading(false); }
    };

    const showConfirmWithdraw = () => {
        if (withdrawAmount < 100000 || withdrawAmount > 100000000) return message.warning("Số tiền rút phải từ 100k đến 100 triệu!");
        if (withdrawAmount > balance) return message.warning("Số dư không đủ để thực hiện lệnh rút!");

        Modal.confirm({
            title: <span className="text-xl font-bold">Xác Nhận Lệnh Rút Tiền</span>,
            content: <div className="text-base mt-2">Bạn có chắc chắn muốn rút <strong className="text-red-600 text-lg">{withdrawAmount.toLocaleString()} VNĐ</strong> từ ví không?</div>,
            okText: 'Xác Nhận Rút',
            okType: 'danger',
            cancelText: 'Hủy Bỏ',
            centered: true,
            onOk: () => executeWithdraw()
        });
    };

    // --- CẤU HÌNH CỘT BẢNG LỊCH SỬ DÒNG TIỀN ---
    const transColumns = [
        { title: 'Mã GD', dataIndex: 'transactionCode', key: 'transactionCode', render: t => <Text strong>{t}</Text> },
        {
            title: 'Nguồn Tiền / Loại',
            dataIndex: 'type',
            key: 'type',
            render: (val) => {
                if (val === 'REWARD') return <Tag color="magenta" className="font-bold">TIỀN THƯỞNG THẮNG CHẶNG</Tag>;
                if (val === 'REVENUE_SHARE') return <Tag color="purple" className="font-bold">CỔ TỨC (DOANH THU VÉ CƯỢC)</Tag>;
                if (val === 'SALARY') return <Tag color="cyan" className="font-bold">LƯƠNG CỨNG (TỪ CHỦ NGỰA)</Tag>;
                if (val === 'WITHDRAW') return <Tag color="orange" className="font-bold">RÚT TIỀN VỀ NGÂN HÀNG</Tag>;
                if (val === 'DEPOSIT') return <Tag color="blue" className="font-bold">NẠP TIỀN</Tag>;
                return <Tag color="default">{val}</Tag>;
            }
        },
        {
            title: 'Số Tiền',
            key: 'amount',
            render: (record) => {
                const isIncome = record.direction === 'IN';
                return <span className={isIncome ? 'text-green-600 font-bold text-base' : 'text-red-600 font-bold text-base'}>{isIncome ? '+' : '-'}{record.amount?.toLocaleString()} đ</span>;
            }
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                if (status === 'PENDING') return <Tag color="warning" className="font-bold px-3 py-1">VUI LÒNG LIÊN HỆ BTC</Tag>;
                if (status === 'COMPLETED') return <Tag color="success" className="font-bold px-3 py-1">ĐÃ GIAO DỊCH THÀNH CÔNG</Tag>;
                if (status === 'REJECTED') return <Tag color="error" className="font-bold px-3 py-1">GIAO DỊCH BỊ TỪ CHỐI</Tag>;
                return <Tag>{status}</Tag>;
            }
        },
        { title: 'Thời Gian', dataIndex: 'createdAt', key: 'createdAt', render: (val) => dayjs(val).format('HH:mm - DD/MM/YYYY') },
    ];

    // --- CẤU HÌNH TABS HIỂN THỊ DỰA THEO ROLE ---
    const tabItems = [];

    // CHỈ KHÁN GIẢ (SPECTATOR) MỚI ĐƯỢC PHÉP NẠP TIỀN
    if (user?.role === 'SPECTATOR') {
        tabItems.push({
            key: 'deposit',
            label: <span className="text-base font-bold"><BankOutlined /> Nạp Tiền</span>,
            children: (
                <div className="max-w-2xl bg-white p-6 border rounded-xl shadow-sm">
                    <Alert message="Hướng dẫn nạp tiền" description="Hệ thống đang tự động duyệt tiền nạp. Chọn số tiền và xác nhận." type="info" showIcon className="mb-4" />
                    <div className="mb-4">
                        <Text className="font-medium block mb-2">Nhập số tiền muốn nạp (VNĐ):</Text>
                        <InputNumber className="w-full text-lg" size="large" min={10000} step={50000} value={depositAmount} onChange={setDepositAmount} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\$\s?|(,*)/g, '')} />
                    </div>
                    <Button type="primary" size="large" block className="bg-green-600 hover:bg-green-500 font-bold h-12" onClick={handleDeposit} loading={loading}>XÁC NHẬN NẠP TIỀN</Button>
                </div>
            )
        });
    }

    // TẤT CẢ CÁC ROLE ĐỀU ĐƯỢC RÚT TIỀN (Rút tiền thưởng, cổ tức, lương...)
    tabItems.push({
        key: 'withdraw',
        label: <span className="text-base font-bold"><UploadOutlined /> Rút Tiền Về Ngân Hàng</span>,
        children: (
            <div className="max-w-2xl bg-white p-6 border rounded-xl shadow-sm">
                <Alert message="Lưu ý rút tiền" description="Mã giao dịch sẽ được sinh tự động. Cầm mã này đến quầy thu ngân của Ban Tổ Chức (BTC) để nhận tiền mặt." type="warning" showIcon className="mb-4" />
                <div className="mb-4">
                    <Text className="font-medium block mb-2">Nhập số tiền muốn rút (VNĐ):</Text>
                    <div className="flex items-center gap-2">
                        <InputNumber className="w-full text-lg flex-1" size="large" min={100000} max={100000000} step={50000} value={withdrawAmount} onChange={setWithdrawAmount} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\$\s?|(,*)/g, '')} />
                        <Button onClick={() => setWithdrawAmount(balance)} size="large" className="bg-blue-50 text-blue-600 font-bold border-blue-200 hover:bg-blue-100">Rút Tất Cả</Button>
                    </div>
                    <Text className="text-gray-500 text-sm mt-1 block">Tối thiểu: 100k - Tối đa: 100 triệu</Text>
                </div>
                <Button type="primary" size="large" block className="bg-orange-500 hover:bg-orange-400 font-bold h-12 border-none" onClick={showConfirmWithdraw} loading={withdrawLoading} disabled={balance < 100000}>TẠO LỆNH RÚT TIỀN</Button>
            </div>
        )
    });

    // CẤU HÌNH HIỂN THỊ TÊN TAB LỊCH SỬ TÙY THEO ROLE
    let historyTabLabel = <span className="text-base font-bold"><HistoryOutlined /> Lịch Sử Giao Dịch</span>;
    if (user?.role === 'OWNER') {
        historyTabLabel = <span className="text-base font-bold"><HistoryOutlined /> Lịch Sử Dòng Tiền & Giải Thưởng</span>;
    } else if (user?.role === 'JOCKEY') {
        historyTabLabel = <span className="text-base font-bold"><HistoryOutlined /> Lịch Sử Giải Thưởng & Thu Nhập</span>;
    }

    tabItems.push({
        key: 'history',
        label: historyTabLabel,
        children: <Table dataSource={transactions} columns={transColumns} rowKey="transactionCode" loading={dataLoading} className="border rounded-xl" />
    });

    // Mặc định mở Tab History cho Owner và Jockey, mở Tab Deposit cho Spectator
    const defaultActiveKey = user?.role === 'SPECTATOR' ? 'deposit' : 'history';

    return (
        <div className="max-w-5xl mx-auto">
            <Title level={3} className="mb-6 border-b pb-2">
                <WalletOutlined className="text-blue-500 mr-2" /> Quản Lý Tài Chính
            </Title>

            <Card className="shadow-md rounded-xl bg-gradient-to-r from-[#001529] to-blue-800 text-white mb-8">
                <Text className="text-gray-300 text-lg">Số dư khả dụng</Text>
                <div className="text-5xl font-bold mt-2 text-yellow-400">
                    {balance.toLocaleString()} <span className="text-2xl">VNĐ</span>
                </div>
            </Card>

            <Card className="shadow-sm rounded-xl border-none">
                <Tabs defaultActiveKey={defaultActiveKey} items={tabItems} size="large" />
            </Card>

            <Modal title={<span className="text-xl font-bold text-green-600">✅ Lệnh Rút Tiền Đã Được Tạo</span>} open={isWithdrawModalVisible} onCancel={() => setIsWithdrawModalVisible(false)} footer={[<Button key="close" type="primary" size="large" className="bg-blue-600 font-bold px-8" onClick={() => setIsWithdrawModalVisible(false)}>Đã Hiểu & Đóng</Button>]} centered>
                <div className="text-center py-6">
                    <p className="text-gray-500 text-lg mb-1">Mã Giao Dịch:</p>
                    <p className="text-3xl font-black text-blue-700 mb-4 bg-gray-100 p-2 rounded tracking-widest border border-dashed border-gray-400">{withdrawBill?.code}</p>
                    <p className="text-gray-500 text-lg mb-1">Số Tiền Rút:</p>
                    <p className="text-3xl font-bold text-red-600 mb-8">{withdrawBill?.amount.toLocaleString()} VNĐ</p>
                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-300 shadow-sm text-left">
                        <Text className="text-yellow-800 font-semibold text-base block text-center">
                            📢 Vui lòng chụp lại màn hình này hoặc lưu mã giao dịch và liên hệ tại <span className="font-bold text-red-600 uppercase">Quầy Giao Dịch (Ban Tổ Chức)</span> để nhận tiền mặt.
                        </Text>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default WalletPage;