// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Typography, Card, Button, InputNumber, message, Alert, Modal, Tabs, Table, Tag, Space, Divider } from 'antd';
import { WalletOutlined, BankOutlined, HistoryOutlined, CopyOutlined } from '@ant-design/icons';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import dayjs from 'dayjs';
import axios from 'axios';

const { Title, Text } = Typography;

const WalletPage = () => {
    const { user } = useAuth();
    const userId = user?.id;

    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [depositAmount, setDepositAmount] = useState(50000);

    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);

    // Luồng quét mã nạp tiền
    const [isQrModalVisible, setIsQrModalVisible] = useState(false);
    const [paymentData, setPaymentData] = useState(null);

    const fetchWalletData = async () => {
        if (!userId) return;
        setDataLoading(true);
        try {
            const walletRes = await api.get(`/wallets/my-wallet?userId=${userId}`);
            setBalance(walletRes.data.balance);

            const transRes = await api.get(`/users/my-transactions?userId=${userId}`);
            setTransactions(transRes.data || []);
        } catch (error) {
            message.error('Không thể tải dữ liệu ví tiền!');
        } finally {
            setDataLoading(false);
        }
    };

    useEffect(() => {
        fetchWalletData();
    }, [userId]);

    const handleGenerateQR = async () => {
        if (depositAmount <= 0) return message.warning("Số tiền nạp phải lớn hơn 0!");
        if (depositAmount < 10000) return message.warning("Số tiền nạp tối thiểu là 10,000 VNĐ!");

        setLoading(true);
        try {
            const response = await api.post('/payments/create-qr', {
                userId: user?.id,
                amount: depositAmount
            });
            setPaymentData(response.data);
            setIsQrModalVisible(true);
        } catch (error) {
            message.error(error.response?.data || "Lỗi tạo mã QR!");
        } finally {
            setLoading(false);
        }
    };

    const handleCopyText = (text) => {
        navigator.clipboard.writeText(text);
        message.success('Đã copy nội dung!');
    };

    // GIỮ LẠI NÚT NÀY ĐỂ TEAM BẠN TEST CHAY NẾU CHƯA ĐẤU NỐI SEPAY XONG TRONG HÔM NAY
    const handleConfirmMockPayment = async () => {
        setLoading(true);
        try {
            await api.post('/wallets/deposit', {
                userId: user?.id || user?.userId,
                amount: depositAmount
            });
            message.success(`Giả lập thành công: Hệ thống đã cộng tiền!`);
            setIsQrModalVisible(false);
            fetchWalletData();
            window.dispatchEvent(new Event('update_balance'));
            setDepositAmount(50000);
        } catch (error) {
            message.error("Lỗi kết nối hoặc lỗi nạp tiền giả lập!");
        } finally {
            setLoading(false);
        }
    };

    const transColumns = [
        { title: 'Mã Giao Dịch', dataIndex: 'transactionCode', render: (t) => <Text copyable className="font-mono font-bold text-blue-600">{t}</Text> },
        { title: 'Loại hình', dataIndex: 'type', render: (type) => type === 'DEPOSIT' ? <Tag color="green">NẠP TIỀN</Tag> : (type === 'WITHDRAW' ? <Tag color="volcano">RÚT TIỀN</Tag> : <Tag color="blue">{type}</Tag>) },
        { title: 'Số Tiền', dataIndex: 'amount', render: (val, r) => <span className={r.direction === 'IN' ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>{r.direction === 'IN' ? '+' : '-'} {val?.toLocaleString()} đ</span> },
        { title: 'Trạng Thái', dataIndex: 'status', render: (s) => s === 'COMPLETED' ? <Tag color="success">THÀNH CÔNG</Tag> : (s === 'PENDING' ? <Tag color="warning">ĐANG CHỜ DUYỆT</Tag> : <Tag color="error">{s}</Tag>) },
        { title: 'Thời Gian', dataIndex: 'createdAt', render: (val) => dayjs(val).format('HH:mm - DD/MM/YYYY') },
    ];

    const tabItems = [];

    if (user?.role === 'SPECTATOR' || user?.role === 'OWNER') {
        tabItems.push({
            key: 'deposit',
            label: <span className="text-base font-bold"><BankOutlined /> Nạp Tiền Qua VietQR </span>,
            children: (
                <div className="max-w-2xl bg-white p-6 border rounded-xl shadow-sm mx-auto my-4 text-center">
                    <Alert message="Nạp tiền Auto 100%" description="Quét mã QR và giữ nguyên nội dung. Hệ thống sẽ tự động cộng tiền trong 10 giây sau khi chuyển khoản." type="info" showIcon className="mb-4" />
                    <div className="mb-4">
                        <Text className="font-medium block mb-2">Nhập số tiền muốn nạp (VNĐ):</Text>
                        <InputNumber className="w-full text-lg rounded-lg font-bold" size="large" min={10000} value={depositAmount} onChange={(val) => setDepositAmount(val || 0)} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\$\s?|(,*)/g, '')} />
                    </div>
                    <Button type="primary" size="large" block onClick={handleGenerateQR} loading={loading} className="bg-blue-600 font-semibold h-12 text-base rounded-lg"> Tạo Mã VietQR Nạp Tiền </Button>
                </div>
            )
        });
    }

    let historyTabLabel = <span className="text-base font-bold"><HistoryOutlined /> Lịch Sử Giao Dịch </span>;
    if (user?.role === 'OWNER') {
        historyTabLabel = <span className="text-base font-bold"><HistoryOutlined /> Lịch Sử Tài Chính & Giải Thưởng </span>;
    }

    tabItems.push({
        key: 'history',
        label: historyTabLabel,
        children: <Table dataSource={transactions} columns={transColumns} rowKey="transactionCode" loading={dataLoading} className="border rounded-xl" pagination={{ pageSize: 5 }} />
    });

    const defaultActiveKey = (user?.role === 'SPECTATOR' || user?.role === 'OWNER') ? 'deposit' : 'history';

    return (
        <div className="max-w-5xl mx-auto p-6">
            <Title level={3} className="mb-6 border-b pb-2"><WalletOutlined className="text-blue-500 mr-2" /> Quản Lý Tài Chính</Title>
            <Card className="shadow-md rounded-xl bg-gradient-to-r from-[#001529] to-blue-800 text-white mb-8">
                <Text className="text-gray-300 text-lg"> Số dư khả dụng hiện tại </Text>
                <div className="text-5xl font-bold mt-2 text-yellow-400"> {balance?.toLocaleString()} <span className="text-xl text-white">VNĐ</span> </div>
                <div className="mt-4 text-xs text-gray-300"> Tài khoản: <strong className="text-white">{user?.username}</strong> </div>
            </Card>

            <Card className="shadow-sm rounded-xl">
                <Tabs defaultActiveKey={defaultActiveKey} items={tabItems} />
            </Card>

            <Modal title={<span className="text-xl font-bold text-blue-800">Thanh Toán Quét Mã</span>} open={isQrModalVisible} onCancel={() => { setIsQrModalVisible(false); setPaymentData(null); fetchWalletData(); }} footer={null} centered width={700}>
                {paymentData && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <div className="text-center bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <Text strong className="block mb-2">Quét Mã Bằng App Ngân Hàng</Text>
                            <img src={paymentData.qrUrl} alt="QR Code" className="w-full max-w-[220px] mx-auto shadow-md rounded-lg border" />
                            <Alert message="Auto Check" description={`Hệ thống tự động duyệt. BẮT BUỘC ghi nội dung chuyển khoản là: ${paymentData.note}`} type="warning" showIcon className="mt-4 text-left" />
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-2">
                                <div><Text type="secondary" className="text-xs">NGÂN HÀNG</Text><div className="font-bold">{paymentData.bankId}</div></div>
                                <div><Text type="secondary" className="text-xs">SỐ TÀI KHOẢN</Text><div className="font-bold text-blue-600">{paymentData.accountNo}</div></div>
                                <div><Text type="secondary" className="text-xs">CHỦ TÀI KHOẢN</Text><div className="font-bold">{paymentData.accountName}</div></div>
                                <div><Text type="secondary" className="text-xs">SỐ TIỀN</Text><div className="font-bold text-red-600 text-lg">{paymentData.amount.toLocaleString()} đ</div></div>
                                <Divider className="my-2" />
                                <div>
                                    <Text type="secondary" className="text-xs mb-1 block">NỘI DUNG CHUYỂN KHOẢN</Text>
                                    <Space>
                                        <Tag color="volcano" className="font-mono font-bold text-base px-3 py-1">{paymentData.note}</Tag>
                                        <Button size="small" icon={<CopyOutlined />} onClick={() => handleCopyText(paymentData.note)}>Copy</Button>
                                    </Space>
                                </div>
                            </div>

                            <Card className="bg-gray-50 border-none">
                                <Text strong className="block mb-2 text-sm text-gray-700 text-center">Giao dịch sẽ được cập nhật số dư trong ít phút.</Text>
                                <Button type="default" onClick={() => { setIsQrModalVisible(false); fetchWalletData(); }} block size="large" className="mt-4 font-bold border border-blue-600 text-blue-600"> TÔI ĐÃ HIỂU VÀ ĐANG CHỜ TIỀN VÀO </Button>

                                {/* NÚT GIẢ LẬP ĐỂ TEST */}
                                <Button type="primary" onClick={handleConfirmMockPayment} block size="large" loading={loading} className="mt-3 bg-green-600 font-bold border-none"> [DEV] GIẢ LẬP CHUYỂN THÀNH CÔNG </Button>
                            </Card>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default WalletPage;