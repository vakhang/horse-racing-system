// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Typography, Card, Button, InputNumber, message, Alert, Modal, Tabs, Table, Tag, Upload, Space, Divider } from 'antd';
import { WalletOutlined, BankOutlined, HistoryOutlined, CopyOutlined, UploadOutlined, CheckCircleOutlined } from '@ant-design/icons';
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
    const [paymentData, setPaymentData] = useState(null); // Lưu data Backend trả về
    const [fileList, setFileList] = useState([]); // Lưu ảnh Upload
    const [submittingProof, setSubmittingProof] = useState(false);

    const fetchWalletData = async () => {
        if (!userId) return;
        setDataLoading(true);
        try {
            const walletRes = await api.get(`/wallets/my-wallet?userId=${userId}`);
            setBalance(walletRes.data.balance);

            const transRes = await api.get(`/users/my-transactions?userId=${userId}`);
            setTransactions(transRes.data || []);
        } catch (error) {
            console.error(error);
            message.error('Không thể tải dữ liệu ví tiền!');
        } finally {
            setDataLoading(false);
        }
    };

    useEffect(() => {
        fetchWalletData();
    }, [userId]);

    // BƯỚC 1: Gọi API khởi tạo lệnh nạp & lấy QR Code
    const handleGenerateQR = async () => {
        if (depositAmount <= 0) return message.warning("Số tiền nạp phải lớn hơn 0!");
        if (depositAmount < 10000) return message.warning("Số tiền nạp tối thiểu là 10,000 VNĐ!");

        setLoading(true);
        try {
            const response = await api.post('/payments/create-qr', {
                userId: user?.id,
                amount: depositAmount
            });
            setPaymentData(response.data); // Chứa qrUrl, transactionCode,...
            setIsQrModalVisible(true);
        } catch (error) {
            message.error(error.response?.data || "Lỗi tạo mã QR!");
        } finally {
            setLoading(false);
        }
    };

    // BƯỚC 3: Upload hình ảnh biên lai
    const handleConfirmTransfer = async () => {
        if (fileList.length === 0) {
            message.warning("Vui lòng tải lên ảnh chụp màn hình chuyển khoản thành công!");
            return;
        }

        setSubmittingProof(true);
        try {
            const formData = new FormData();
            formData.append('transactionCode', paymentData.transactionCode);
            formData.append('file', fileList[0].originFileObj);

            // Lấy token trực tiếp từ LocalStorage (dựa theo cấu trúc của sếp)
            const token = localStorage.getItem('accessToken') || user?.token;

            // 🎯 ĐI ĐƯỜNG QUYỀN: Dùng trực tiếp axios gốc để bypass toàn bộ config cứng của api.js
            await axios.post('http://localhost:8080/api/payments/confirm', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                    // BỎ TRỐNG CONTENT-TYPE ĐỂ AXIOS TỰ SINH BOUNDARY CHO FILE
                }
            });

            message.success("Đã gửi minh chứng thành công! Vui lòng đợi Admin xét duyệt để nhận tiền.");
            setIsQrModalVisible(false);
            setPaymentData(null);
            setFileList([]);
            fetchWalletData();
        } catch (error) {
            // 🎯 FIX LỖI SẬP REACT: Chỉ lấy String ra để hiển thị, không ném cả cục Object vào message.error
            const errorData = error.response?.data;
            const errorMsg = errorData?.error || errorData?.message || (typeof errorData === 'string' ? errorData : "Có lỗi xảy ra khi tải ảnh lên!");
            message.error(errorMsg);
        } finally {
            setSubmittingProof(false);
        }
    };

    const handleCopyText = (text) => {
        navigator.clipboard.writeText(text);
        message.success('Đã copy nội dung!');
    };

    const uploadProps = {
        onRemove: (file) => {
            setFileList([]);
        },
        beforeUpload: (file) => {
            setFileList([file]);
            return false; // Tắt tự động upload của AntD
        },
        fileList,
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
                    <WalletOutlined className="text-5xl text-blue-600 mb-4" />
                    <Title level={4}>Nhập Số Tiền Muốn Nạp</Title>
                    <div className="my-6">
                        <InputNumber className="w-full text-lg rounded-lg font-bold" size="large" min={10000} step={10000} value={depositAmount} onChange={(val) => setDepositAmount(val || 0)} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\$\s?|(,*)/g, '')} />
                    </div>
                    <Button type="primary" size="large" block onClick={handleGenerateQR} loading={loading} className="bg-gradient-to-r from-gray-900 to-blue-900 border-none font-bold h-12 text-lg rounded-xl shadow-md"> TIẾP TỤC & QUÉT MÃ </Button>
                </div>
            )
        });
    }

    tabItems.push({
        key: 'history',
        label: <span className="text-base font-bold"><HistoryOutlined /> {user?.role === 'OWNER' ? 'Lịch Sử Tài Chính' : 'Lịch Sử Giao Dịch'} </span>,
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

            {/* MODAL QUÉT QR & UPLOAD ẢNH MINH CHỨNG */}
            <Modal title={<span className="text-xl font-bold text-blue-800">Thông Tin Thanh Toán</span>} open={isQrModalVisible} onCancel={() => { setIsQrModalVisible(false); setPaymentData(null); setFileList([]); }} footer={null} centered width={700}>
                {paymentData && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <div className="text-center bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <Text strong className="block mb-2">Quét Mã QR Bằng App Ngân Hàng</Text>
                            <img src={paymentData.qrUrl} alt="QR Code" className="w-full max-w-[220px] mx-auto shadow-md rounded-lg border" />
                            <Alert message="Lưu ý quan trọng" description={`Ghi đúng mã chuyển khoản: ${paymentData.note} để hệ thống nhận diện.`} type="warning" showIcon className="mt-4 text-left" />
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

                            <Card className="bg-gray-50 border-dashed border-gray-300">
                                <Text strong className="block mb-2 text-sm text-gray-700">Tải Lên Ảnh Biên Lai Chuyển Khoản</Text>
                                <Upload {...uploadProps} accept="image/*" maxCount={1}>
                                    <Button icon={<UploadOutlined />} className="w-full">Chọn ảnh chụp màn hình</Button>
                                </Upload>
                                <Button type="primary" onClick={handleConfirmTransfer} block size="large" loading={submittingProof} icon={<CheckCircleOutlined />} className="mt-4 bg-green-600 font-bold border-none"> TÔI ĐÃ CHUYỂN TIỀN </Button>
                            </Card>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default WalletPage;