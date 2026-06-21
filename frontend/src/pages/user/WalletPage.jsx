// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Typography, Card, Button, InputNumber, message, Alert, Modal, Tabs, Table, Tag } from 'antd';
import { WalletOutlined, BankOutlined, HistoryOutlined } from '@ant-design/icons';
import api from '../../config/api'; // Giữ nguyên đường dẫn cấu hình axios của nhóm bạn
import { useAuth } from '../../context/AuthContext';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const WalletPage = () => {
    const { user } = useAuth();
    const userId = user?.id;

    // --- CÁC TRẠNG THÁI HIỆN TẠI ---
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [depositAmount, setDepositAmount] = useState(50000);
    const [withdrawAmount, setWithdrawAmount] = useState(100000);
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);

    // --- 🌟 THÊM STATE QUẢN LÝ QR CODE ĐỘNG ---
    const [isQrModalVisible, setIsQrModalVisible] = useState(false);
    const [generatedTxCode, setGeneratedTxCode] = useState('');

    // Hàm lấy thông tin ví và lịch sử dòng tiền từ Backend
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

    // --- 🌟 SỬA HÀM TẠO MÃ QR NẠP TIỀN (Không cộng tiền luôn) ---
    const handleDeposit = () => {
        if (depositAmount <= 0) return message.warning("Số tiền nạp phải lớn hơn 0!");
        if (depositAmount < 10000) return message.warning("Số tiền nạp tối thiểu là 10,000 VNĐ!");

        // Tạo nội dung chuyển khoản động duy nhất, ví dụ: NAP119842
        const txCode = `NAP${userId}${Date.now().toString().slice(-5)}`;
        setGeneratedTxCode(txCode);

        // Bật Modal QR Code lên để người dùng quét
        setIsQrModalVisible(true);
    };

    // --- 🌟 BIẾN THẦN THÁNH GIẢ LẬP WEBHOOK NGÂN HÀNG ---
    const handleConfirmMockPayment = async () => {
        console.log("Dữ liệu gửi đi:", user?.id, depositAmount);
        setLoading(true);

        try {
            // Hãy đảm bảo các key userId, amount khớp từng chữ hoa/thường với DepositRequestDTO
            const response = await api.post('/wallets/deposit', {
                userId: user?.id || user?.userId, // Phòng trường hợp backend lưu là userId thay vì id
                amount: depositAmount
            });

            message.success(`Giả lập thành công: Hệ thống đã cộng tiền!`);
            setIsQrModalVisible(false); // Đóng Modal QR

            fetchWalletData();
            window.dispatchEvent(new Event('update_balance'));
            setDepositAmount(50000);
        } catch (error) {
            // 🎯 ĐOẠN LOG THẦN THÁNH: In thẳng thông báo từ catch (RuntimeException e) của Backend ra màn hình
            console.error("Lỗi API chi tiết:", error);

            if (error.response && error.response.data) {
                // Hiển thị trực tiếp e.getMessage() do Backend trả về dưới dạng string công khai
                message.error(`Lỗi từ Server: ${error.response.data}`);
            } else {
                message.error("Lỗi kết nối hoặc lỗi nạp tiền giả lập!");
            }
        } finally {
            setLoading(false);
        }
    };

    // Cột cấu hình hiển thị lịch sử giao dịch
    const transColumns = [
        {
            title: 'Mã Giao Dịch',
            dataIndex: 'transactionCode',
            key: 'transactionCode',
            render: (text) => <Text copyable className="font-mono font-bold text-blue-600">{text}</Text>
        },
        {
            title: 'Loại hình',
            dataIndex: 'type',
            key: 'type',
            render: (type) => {
                let color = 'blue';
                if (type === 'DEPOSIT') return <Tag color="green">NẠP TIỀN</Tag>;
                if (type === 'WITHDRAW') return <Tag color="volcano">RÚT TIỀN</Tag>;
                return <Tag color={color}>{type}</Tag>;
            }
        },
        {
            title: 'Số Tiền',
            dataIndex: 'amount',
            key: 'amount',
            render: (val, record) => (
                <span className={record.direction === 'IN' ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>
                    {record.direction === 'IN' ? '+' : '-'} {val?.toLocaleString()} đ
                </span>
            )
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                if (status === 'COMPLETED') return <Tag color="success" className="font-bold px-2 py-0.5">THÀNH CÔNG</Tag>;
                if (status === 'PENDING') return <Tag color="warning" className="font-bold px-2 py-0.5">ĐANG CHỜ</Tag>;
                return <Tag color="error">{status}</Tag>;
            }
        },
        {
            title: 'Thời Gian',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (val) => dayjs(val).format('HH:mm - DD/MM/YYYY')
        },
    ];

    const tabItems = [];

    // --- 🌟 SỬA ĐIỀU KIỆN: CHO PHÉP CẢ SPECTATOR VÀ OWNER ĐƯỢC PHÉP NẠP TIỀN ---
    if (user?.role === 'SPECTATOR' || user?.role === 'OWNER') {
        tabItems.push({
            key: 'deposit',
            label: <span className="text-base font-bold"><BankOutlined /> Nạp Tiền </span>,
            children: (
                <div className="max-w-2xl bg-white p-6 border rounded-xl shadow-sm mx-auto my-4">
                    <Alert message="Hướng dẫn nạp tiền động" description="Nhập số tiền bạn muốn thử nghiệm nạp hệ thống. Mã QR động và nội dung chuyển khoản tự động sẽ được tạo ra." type="info" showIcon className="mb-4" />
                    <div className="mb-4">
                        <Text className="font-medium block mb-2">Nhập số tiền muốn nạp (VNĐ):</Text>
                        <InputNumber className="w-full text-lg" size="large" min={10000} value={depositAmount} onChange={(val) => setDepositAmount(val || 0)} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\$\s?|(,*)/g, '')} />
                    </div>
                    <Button type="primary" size="large" block onClick={handleDeposit} loading={loading} className="bg-blue-600 font-semibold h-12 text-base rounded-lg"> Tạo Mã VietQR Nạp Tiền </Button>
                </div>
            )
        });
    }

    // Cấu hình tên tab lịch sử
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

    // Định nghĩa cấu hình thông tin ngân hàng thụ hưởng giả lập của dự án
    const BANK_ID = "MB";          // Bạn có thể đổi thành Vietcombank, Techcombank...
    const ACCOUNT_NO = "999988889999"; // Số tài khoản admin giả định nhận tiền
    const qrImageUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-qr_only.png?amount=${depositAmount}&addInfo=${generatedTxCode}`;

    return (
        <div className="max-w-5xl mx-auto p-6">
            <Title level={3} className="mb-6 border-b pb-2">
                <WalletOutlined className="text-blue-500 mr-2" /> Quản Lý Tài Chính
            </Title>

            <Card className="shadow-md rounded-xl bg-gradient-to-r from-[#001529] to-blue-800 text-white mb-8">
                <Text className="text-gray-300 text-lg"> Số dư khả dụng hiện tại </Text>
                <div className="text-5xl font-bold mt-2 text-yellow-400">
                    {balance?.toLocaleString()} <span className="text-xl text-white">VNĐ</span>
                </div>
                <div className="mt-4 text-xs text-gray-300">
                    Tài khoản: <strong className="text-white">{user?.username}</strong> | Vai trò: <Tag color="blue">{user?.role}</Tag>
                </div>
            </Card>

            <Card className="shadow-sm rounded-xl">
                <Tabs defaultActiveKey={defaultActiveKey} items={tabItems} />
            </Card>

            {/* 🌟 MODAL QUÉT MÃ QR THANH TOÁN ĐỘNG CHUẨN VIETQR 🌟 */}
            <Modal
                title={<span className="text-xl font-bold text-blue-600">QUÉT MÃ QR ĐỂ NẠP TIỀN VÀO VÍ</span>}
                open={isQrModalVisible}
                onCancel={() => setIsQrModalVisible(false)}
                footer={null}
                centered
                width={420}
            >
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                    <Alert
                        message="Lưu ý quan trọng khi nạp tiền"
                        description={
                            <span>
                                Hệ thống sẽ tự động quét dòng tiền dựa vào mã ghi chú. Vui lòng giữ nguyên nội dung chuyển khoản được sinh ra:
                                <strong className="text-red-600 text-xl block mt-1 tracking-wider font-mono bg-red-50 p-2 rounded border border-red-200">{generatedTxCode}</strong>
                            </span>
                        }
                        type="warning"
                        showIcon
                        className="mb-4 text-left"
                    />

                    {/* Render ảnh mã QR tự động từ API mở VietQR */}
                    <div className="inline-block p-3 bg-white border rounded-xl shadow-inner mb-4">
                        <img src={qrImageUrl} alt="VietQR Payment Code" style={{ width: 260, height: 260, display: 'block' }} />
                    </div>

                    <div className="text-gray-400 text-xs mb-5 italic">
                        *Số tiền cần chuyển: <strong className="text-gray-700">{depositAmount?.toLocaleString()} đ</strong>
                    </div>

                    {/* NÚT THẦN THÁNH GIẢ LẬP KẾT QUẢ WEBHOOK TỪ NGÂN HÀNG ĐỂ TIẾN HÀNH TEST SỐ DƯ */}
                    <Button
                        type="primary"
                        block
                        size="large"
                        style={{ backgroundColor: '#28a745', borderColor: '#28a745', height: '48px' }}
                        className="font-bold rounded-lg hover:opacity-90"
                        onClick={handleConfirmMockPayment}
                        loading={loading}
                    >
                        GIẢ LẬP: ĐÃ QUÉT & CHUYỂN TIỀN THÀNH CÔNG
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default WalletPage;