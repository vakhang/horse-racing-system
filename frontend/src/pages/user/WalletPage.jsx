import React, { useState, useEffect } from 'react';
import { Typography, Card, Button, InputNumber, message, Alert, Modal } from 'antd';
import { WalletOutlined, BankOutlined, UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

const WalletPage = () => {
    const { user } = useAuth();
    const token = user?.token || localStorage.getItem('token');

    const [balance, setBalance] = useState(0);
    const [depositAmount, setDepositAmount] = useState(50000);
    const [withdrawAmount, setWithdrawAmount] = useState(100000); // State mới cho số tiền rút
    const [loading, setLoading] = useState(false);
    const [withdrawLoading, setWithdrawLoading] = useState(false);

    // Quản lý Modal thông báo rút tiền thành công
    const [isWithdrawModalVisible, setIsWithdrawModalVisible] = useState(false);
    const [withdrawBill, setWithdrawBill] = useState(null);

    const api = axios.create({
        baseURL: 'http://localhost:8080/api',
        headers: { Authorization: `Bearer ${token}` }
    });

    useEffect(() => {
        if (user?.id) fetchWalletBalance();
    }, [user]);

    const fetchWalletBalance = async () => {
        try {
            const res = await api.get(`/wallets/my-wallet?userId=${user.id}`);
            setBalance(res.data.balance);
        } catch (error) {
            console.error("Lỗi tải ví:", error);
        }
    };

    const handleDeposit = async () => {
        if (depositAmount <= 0) {
            message.warning("Số tiền nạp phải lớn hơn 0!");
            return;
        }
        setLoading(true);
        try {
            await api.post('/wallets/deposit', { userId: user.id, amount: depositAmount });
            message.success(`Nạp thành công ${depositAmount.toLocaleString()} đ vào ví ảo!`);
            fetchWalletBalance();
            window.dispatchEvent(new Event('update_balance'));
            setDepositAmount(50000);
        } catch (error) {
            message.error(error.response?.data?.error || "Lỗi nạp tiền!");
        } finally {
            setLoading(false);
        }
    };

    // ĐÃ NÂNG CẤP XỬ LÝ RÚT TIỀN TÙY CHỌN SỐ TIỀN
    // 1. Hàm Thực thi lệnh rút tiền (Gọi API)
    const executeWithdraw = async () => {
        setWithdrawLoading(true);
        try {
            const response = await api.post('/wallets/withdraw', {
                userId: user.id,
                amount: withdrawAmount
            });

            const transCode = response.data?.transactionCode || `WDR${Date.now().toString().slice(-7)}`;

            setWithdrawBill({ code: transCode, amount: withdrawAmount });
            setIsWithdrawModalVisible(true);

            fetchWalletBalance();
            window.dispatchEvent(new Event('update_balance'));

            // 🔥 THÊM DÒNG NÀY ĐỂ RESET Ô NHẬP VỀ 100.000 Đ SAU KHI RÚT XONG
            setWithdrawAmount(100000);

        } catch (error) {
            message.error(error.response?.data?.error || "Lỗi rút tiền!");
        } finally {
            setWithdrawLoading(false);
        }
    };

    // 2. Hàm Mở hộp thoại Xác nhận (Gắn vào nút bấm)
    const showConfirmWithdraw = () => {
        if (withdrawAmount < 100000 || withdrawAmount > 100000000) {
            message.warning("Số tiền rút phải nằm trong khoảng 100k đến 100 triệu!");
            return;
        }
        if (withdrawAmount > balance) {
            message.warning("Số dư không đủ để thực hiện lệnh rút!");
            return;
        }

        // Hiện bảng hỏi lại cho chắc chắn
        Modal.confirm({
            title: <span className="text-xl font-bold">Xác Nhận Lệnh Rút Tiền</span>,
            content: (
                <div className="text-base mt-2">
                    Bạn có chắc chắn muốn rút <strong className="text-red-600 text-lg">{withdrawAmount.toLocaleString()} VNĐ</strong> từ ví không?
                </div>
            ),
            okText: 'Xác Nhận Rút',
            okType: 'danger', // Đổi màu nút thành đỏ cảnh báo
            cancelText: 'Hủy Bỏ',
            centered: true,
            onOk: () => {
                executeWithdraw(); // Nếu bấm OK thì mới chạy hàm rút tiền ở trên
            }
        });
    };

    return (
        <div className="max-w-4xl mx-auto">
            <Title level={3} className="mb-6 border-b pb-2">
                <WalletOutlined className="text-blue-500 mr-2" /> Quản Lý Giao Dịch
            </Title>

            <Card className="shadow-md rounded-xl bg-gradient-to-r from-[#001529] to-blue-800 text-white mb-8">
                <Text className="text-gray-300 text-lg">Số dư khả dụng</Text>
                <div className="text-5xl font-bold mt-2 text-yellow-400">
                    {balance.toLocaleString()} <span className="text-2xl">VNĐ</span>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* NẠP TIỀN */}
                <Card className="shadow-sm rounded-xl border-t-4 border-green-500" title={<span className="text-green-600 font-bold text-lg"><BankOutlined /> NẠP TIỀN VÀO VÍ</span>}>
                    <Alert message="Hướng dẫn nạp tiền" description="Hệ thống demo đang tự động duyệt tiền nạp. Chọn số tiền và xác nhận." type="info" showIcon className="mb-4" />
                    <div className="mb-4">
                        <Text className="font-medium block mb-2">Nhập số tiền muốn nạp (VNĐ):</Text>
                        <InputNumber
                            className="w-full text-lg" size="large" min={10000} step={50000}
                            value={depositAmount} onChange={setDepositAmount}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        />
                    </div>
                    <Button type="primary" size="large" block className="bg-green-600 hover:bg-green-500 font-bold h-12" onClick={handleDeposit} loading={loading}>
                        XÁC NHẬN NẠP TIỀN
                    </Button>
                </Card>

                {/* RÚT TIỀN - GIAO DIỆN MỚI */}
                <Card className="shadow-sm rounded-xl border-t-4 border-orange-500" title={<span className="text-orange-600 font-bold text-lg"><UploadOutlined /> YÊU CẦU RÚT TIỀN</span>}>
                    <Alert message="Lưu ý rút tiền" description="Giữ lại mã giao dịch để đối chiếu. Liên hệ quầy BTC để nhận tiền mặt." type="warning" showIcon className="mb-4" />
                    <div className="mb-4">
                        <Text className="font-medium block mb-2">Nhập số tiền muốn rút (VNĐ):</Text>
                        <div className="flex items-center gap-2">
                            <InputNumber
                                className="w-full text-lg flex-1" size="large"
                                min={100000} max={100000000} step={50000}
                                value={withdrawAmount} onChange={setWithdrawAmount}
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            />
                            {/* NÚT RÚT TOÀN BỘ MỚI THÊM VÀO ĐÂY */}
                            <Button
                                onClick={() => setWithdrawAmount(balance)}
                                size="large"
                                className="bg-blue-50 text-blue-600 font-bold border-blue-200 hover:bg-blue-100"
                            >
                                Rút Tất Cả
                            </Button>
                        </div>
                        <Text className="text-gray-500 text-sm mt-1 block">Tối thiểu: 100k - Tối đa: 100 triệu</Text>
                    </div>
                    <Button
                        type="primary" size="large" block
                        className="bg-orange-500 hover:bg-orange-400 font-bold h-12 border-none"
                        onClick={showConfirmWithdraw} // 🔥 ĐỔI SANG HÀM HIỆN BẢNG XÁC NHẬN NÀY
                        loading={withdrawLoading}
                        disabled={balance < 100000}
                    >
                        TẠO LỆNH RÚT TIỀN
                    </Button>
                </Card>
            </div>

            {/* BẢNG THÔNG BÁO RÚT TIỀN THÀNH CÔNG */}
            <Modal
                title={<span className="text-xl font-bold text-green-600">✅ Lệnh Rút Tiền Đã Được Tạo</span>}
                open={isWithdrawModalVisible}
                onCancel={() => setIsWithdrawModalVisible(false)} // Có dấu X để tắt
                footer={[
                    <Button key="close" type="primary" size="large" className="bg-blue-600 font-bold px-8" onClick={() => setIsWithdrawModalVisible(false)}>
                        Đã Hiểu & Đóng
                    </Button>
                ]}
                centered
            >
                <div className="text-center py-6">
                    <p className="text-gray-500 text-lg mb-1">Mã Giao Dịch:</p>
                    <p className="text-3xl font-black text-blue-700 mb-4 bg-gray-100 p-2 rounded tracking-widest border border-dashed border-gray-400">
                        {withdrawBill?.code}
                    </p>

                    <p className="text-gray-500 text-lg mb-1">Số Tiền Rút:</p>
                    <p className="text-3xl font-bold text-red-600 mb-8">
                        {withdrawBill?.amount.toLocaleString()} VNĐ
                    </p>

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