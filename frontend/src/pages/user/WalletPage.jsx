import React, { useState, useEffect, useRef } from 'react';
import { Typography, Card, Button, InputNumber, message, Alert, Modal, Tabs, Form, Input, Row, Col, Space, Divider, Result, Tag, Tooltip, Select } from 'antd';
import { WalletOutlined, BankOutlined, ExportOutlined, CopyOutlined, InfoCircleOutlined } from '@ant-design/icons';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

// [Chức năng rõ ràng]: Trang Quản lý Ví
// [Tác dụng]: Hiển thị số dư hiện tại, Lịch sử giao dịch (Nạp/Rút/Cược). Chứa Form tạo lệnh Rút Tiền (Withdraw) về tài khoản ngân hàng.
// [Hướng dẫn sửa đổi]:
// - Logic: Bắt Validation (Không cho rút tiền nếu số dư khả dụng nhỏ hơn số tiền muốn rút) trực tiếp trên Client thay vì chờ Backend báo lỗi.
const WalletPage = () => {
    const { user } = useAuth();
    const userId = user?.id;

    const [balance, setBalance] = useState(0);
    const [depositAmount, setDepositAmount] = useState(50000);
    const [loading, setLoading] = useState(false);
    const [isQrModalVisible, setIsQrModalVisible] = useState(false);
    const [paymentData, setPaymentData] = useState(null);
    const initialBalanceRef = useRef(null);

    const [withdrawForm] = Form.useForm();
    
    const [isSuccess, setIsSuccess] = useState(false);
    const [form] = Form.useForm();
    const [banks, setBanks] = useState([]);

    useEffect(() => {
        fetch('https://api.vietqr.io/v2/banks')
            .then(res => res.json())
            .then(data => {
                if (data.code === '00') setBanks(data.data);
            })
            .catch(err => console.error("Error fetching banks:", err));
    }, []);

    const fetchWalletData = async () => {
        if (!userId) return;
        try {
            const walletRes = await api.get(`/wallets/my-wallet?userId=${userId}`);
            setBalance(walletRes.data?.balance || 0);
        } catch (error) {
            // Bỏ qua popup để tránh làm phiền, Backend tự lo nếu chưa có ví
        }
    };

    useEffect(() => {
        fetchWalletData();
    }, [userId]);

    useEffect(() => {
        let interval;
        if (isQrModalVisible && userId && user?.role === 'SPECTATOR') {
            interval = setInterval(async () => {
                try {
                    const res = await api.get(`/wallets/my-wallet?userId=${userId}`);
                    const newBalance = res.data?.balance || 0;
                    if (initialBalanceRef.current !== null && newBalance > initialBalanceRef.current) {
                        message.success("Nhận tiền tự động thành công! Số dư ví đã được cộng.");
                        setBalance(newBalance);
                        setIsQrModalVisible(false);
                        setPaymentData(null);
                        window.dispatchEvent(new Event('update_balance'));
                        clearInterval(interval);
                    }
                } catch (error) {}
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [isQrModalVisible, userId, user?.role]);

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
            initialBalanceRef.current = balance;
            setIsQrModalVisible(true);
        } catch (error) {
            message.error(error.response?.data || "Lỗi tạo mã QR!");
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async (values) => {
        const amount = values.amount;
        setLoading(true);
        try {
            const response = await api.post('/wallets/withdraw', {
                userId: user?.id,
                amount: amount,
                bankName: values.bankName,
                accountNumber: values.accountNumber,
                accountName: values.accountName
            });

            message.success('Tạo lệnh rút tiền thành công!');
            Modal.success({
                title: 'Yêu Cầu Rút Tiền Đã Được Ghi Nhận',
                content: (
                    <div className="mt-4 text-base">
                        <p>Mã giao dịch đối soát của bạn là:</p>
                        <div className="text-2xl font-mono font-bold text-red-600 my-2 tracking-widest flex items-center justify-center gap-2">
                            <Text copyable={{ text: response.data.transactionCode }} className="text-red-600">
                                {response.data.transactionCode}
                            </Text>
                        </div>
                        <p className="text-gray-600 mt-3">Hệ thống đã ghi nhận yêu cầu và tạm trừ số dư. Kế toán sẽ kiểm tra hợp lệ và chuyển khoản qua ngân hàng cho bạn <b>chậm nhất sau 3 ngày làm việc.</b></p>
                        <p className="text-gray-600 mt-2">Nếu bạn cần tiền gấp, có thể đến quầy Lễ Tân (BTC) để được hỗ trợ giải ngân.</p>
                    </div>
                ),
                okText: 'Đã Hiểu',
                centered: true
            });

            withdrawForm.resetFields();
            fetchWalletData();
            window.dispatchEvent(new Event('update_balance'));
        } catch (error) {
            message.error(error.response?.data?.error || "Lỗi tạo lệnh rút tiền!");
        } finally {
            setLoading(false);
        }
    };

    const handleCopyText = (text) => {
        navigator.clipboard.writeText(text);
        message.success('Đã copy nội dung!');
    };

    const WithdrawFormView = () => (
        <div className="max-w-3xl bg-white p-8 border rounded-2xl shadow-sm mx-auto my-4">
            <Alert
                message="Quy trình thanh toán & Rút tiền"
                description="Bạn hãy điền thông tin tài khoản ngân hàng thụ hưởng. Kế toán công ty sẽ kiểm duyệt và chuyển khoản trong vòng chậm nhất 3 ngày làm việc. Nếu bạn cần tiền gấp, có thể đến quầy Lễ Tân (BTC) để được hỗ trợ giải ngân."
                type="warning"
                showIcon
                className="mb-6 text-left"
            />
            <div className="mb-6 text-center bg-gray-50 py-4 rounded-xl border border-gray-200">
                <Space align="center">
                    <Text type="secondary" className="text-lg">Số dư khả dụng hiện tại:</Text>
                    <Tooltip title={
                        <div className="text-xs">
                            <p><b>Quy định khấu trừ tự động:</b></p>
                            <ul className="pl-3 list-disc">
                                <li><b>Thuế TNCN:</b> Khấu trừ 10% đối với phần thưởng cược &gt; 10.000.000 VNĐ.</li>
                                <li><b>Hoa hồng sàn (Giải đua):</b> Chủ ngựa (5%), Nài ngựa (2%) trừ thẳng vào giải thưởng.</li>
                            </ul>
                        </div>
                    }>
                        <InfoCircleOutlined className="text-blue-400 cursor-pointer text-lg" />
                    </Tooltip>
                </Space>
                <div className="text-4xl font-black text-blue-700 mt-2">{Number(balance || 0).toLocaleString()} VNĐ</div>
            </div>

            <Form form={withdrawForm} layout="vertical" onFinish={handleWithdraw} size="large">
                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item name="bankName" label={<Text strong>Tên Ngân Hàng</Text>} rules={[{ required: true, message: 'Vui lòng chọn ngân hàng!' }]}>
                            <Select
                                showSearch
                                placeholder="🔍 Tìm ngân hàng (VD: Vietcombank, MB...)"
                                optionFilterProp="searchKey"
                                filterOption={(input, option) => (option?.searchKey ?? '').toLowerCase().includes(input.toLowerCase())}
                                options={banks.map(bank => ({
                                    value: bank.shortName,
                                    searchKey: `${bank.shortName} ${bank.name} ${bank.code}`,
                                    label: (
                                        <div className="flex items-center gap-2">
                                            <img src={bank.logo} alt={bank.shortName} className="w-6 h-6 object-contain" />
                                            <span><span className="font-bold">{bank.shortName}</span> - {bank.name}</span>
                                        </div>
                                    )
                                }))}
                                className="text-left"
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item name="accountNumber" label={<Text strong>Số Tài Khoản</Text>} rules={[{ required: true, message: 'Nhập số tài khoản!' }]}>
                            <Input placeholder="Nhập số tài khoản" />
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item name="accountName" label={<Text strong>Tên Người Thụ Hưởng (In hoa, không dấu)</Text>} rules={[{ required: true, message: 'Nhập tên chủ tài khoản!' }]}>
                    <Input placeholder="NGUYỄN VĂN A" className="uppercase" />
                </Form.Item>

                <Form.Item
                    name="amount"
                    label={<Text strong>Số Tiền Muốn Rút</Text>}
                    rules={[
                        { required: true, message: 'Vui lòng nhập số tiền!' },
                        () => ({
                            validator(_, value) {
                                if (value && value < 100000) {
                                    return Promise.reject(new Error('Số tiền rút tối thiểu là 100,000 VNĐ!'));
                                }
                                if (value && value > balance) {
                                    return Promise.reject(new Error('Số dư khả dụng không đủ để rút!'));
                                }
                                return Promise.resolve();
                            },
                        }),
                    ]}
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        className="text-xl rounded-lg font-bold text-red-600 h-12 flex items-center"
                        step={50000}
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        placeholder="Nhập số tiền cần rút..."
                    />
                </Form.Item>
                <Button type="primary" htmlType="submit" danger block loading={loading} className="font-bold h-14 text-lg rounded-xl mt-2 shadow-lg"> GỬI YÊU CẦU RÚT TIỀN VỀ NGÂN HÀNG </Button>
            </Form>
        </div>
    );

    if (isSuccess) {
        return (
            <div className="p-8 bg-gray-100 min-h-screen flex justify-center items-center">
                <Card className="shadow-2xl rounded-2xl border-none max-w-lg text-center p-4">
                    <Result
                        status="success"
                        title={<Title level={3} className="text-green-600">NẠP TIỀN HOÀN TẤT!</Title>}
                        subTitle={`Giao dịch nạp tiền đã được xử lý. Số dư ví của bạn sẽ sớm được cập nhật.`}
                        extra={[
                            <Button type="primary" size="large" key="continue" icon={<WalletOutlined />} onClick={() => {
                                setPaymentData(null);
                                setIsSuccess(false);
                                setIsQrModalVisible(false);
                                form.resetFields();
                            }} className="bg-gradient-to-r from-gray-900 to-blue-900 border-none rounded-xl">
                                Tiếp Tục Giao Dịch Khác
                            </Button>
                        ]}
                    />
                </Card>
            </div>
        );
    }

    if (user?.role !== 'SPECTATOR') {
        return (
            <div className="max-w-5xl mx-auto p-6">
                <Title level={3} className="mb-6 border-b pb-2"><ExportOutlined className="text-red-500 mr-2" /> Yêu Cầu Rút Tiền</Title>
                <WithdrawFormView />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-6">
            <Title level={3} className="mb-6 border-b pb-2"><WalletOutlined className="text-blue-500 mr-2" /> Giao Dịch Nạp / Rút Tài Khoản</Title>

            <Tabs size="large" type="card" items={[
                {
                    key: 'deposit',
                    label: <span className="font-bold"><BankOutlined /> Nạp Tiền (VietQR Auto)</span>,
                    children: (
                        <div className="max-w-2xl bg-white p-8 border rounded-2xl shadow-sm mx-auto my-4 text-center">
                            <Alert message="Cộng tiền tự động 100%" description="Quét mã QR và giữ nguyên nội dung chuyển khoản. Hệ thống sẽ tự động cộng tiền trong khoảng 3-10 giây sau khi chuyển khoản thành công." type="info" showIcon className="mb-6 text-left" />
                            <div className="mb-8">
                                <Text className="font-medium block mb-3 text-left text-lg text-gray-700">Nhập số tiền muốn nạp (VNĐ):</Text>
                                <InputNumber style={{ width: '100%' }} className="text-2xl rounded-xl font-bold text-blue-700 h-14 flex items-center" min={10000} step={50000} value={depositAmount} onChange={(val) => setDepositAmount(val || 0)} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\$\s?|(,*)/g, '')} />
                            </div>
                            <Button type="primary" size="large" block onClick={handleGenerateQR} loading={loading} className="bg-gradient-to-r from-blue-700 to-blue-500 font-bold h-14 text-lg rounded-xl shadow-lg hover:scale-105 transition-all"> TIẾP TỤC ĐỂ QUÉT MÃ QR </Button>
                        </div>
                    )
                },
                {
                    key: 'withdraw',
                    label: <span className="font-bold"><ExportOutlined /> Yêu Cầu Rút Tiền</span>,
                    children: <WithdrawFormView />
                }
            ]} />

            <Modal title={<span className="text-xl font-bold text-blue-800">Quét Mã Thanh Toán</span>} open={isQrModalVisible} onCancel={() => { setIsQrModalVisible(false); setPaymentData(null); fetchWalletData(); }} footer={null} centered width={700}>
                {paymentData && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <div className="text-center bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <Text strong className="block mb-2 text-base">Quét Mã Bằng App Ngân Hàng</Text>
                            <img src={paymentData.qrUrl} alt="QR Code" className="w-full max-w-[240px] mx-auto shadow-md rounded-lg border border-gray-300" />
                            <Alert message="Lưu ý quan trọng" description={`BẮT BUỘC ghi đúng nội dung chuyển khoản là: ${paymentData.note} để hệ thống cộng tiền tự động.`} type="error" showIcon className="mt-4 text-left" />
                        </div>
                        <div className="flex flex-col justify-center gap-3">
                            <div className="bg-blue-50 p-5 rounded-xl border border-blue-200 space-y-3">
                                <div><Text type="secondary" className="text-xs font-bold">NGÂN HÀNG THỤ HƯỞNG</Text><div className="font-bold text-base">{paymentData.bankId}</div></div>
                                <div><Text type="secondary" className="text-xs font-bold">SỐ TÀI KHOẢN</Text><div className="font-black text-lg text-blue-700">{paymentData.accountNo}</div></div>
                                <div><Text type="secondary" className="text-xs font-bold">CHỦ TÀI KHOẢN</Text><div className="font-bold text-base">{paymentData.accountName}</div></div>
                                <div><Text type="secondary" className="text-xs font-bold">SỐ TIỀN THANH TOÁN</Text><div className="font-black text-red-600 text-xl">{Number(paymentData.amount || 0).toLocaleString()} VNĐ</div></div>
                                <Divider className="my-3 border-blue-300" />
                                <div>
                                    <Text type="secondary" className="text-xs font-bold mb-1 block">NỘI DUNG CHUYỂN KHOẢN</Text>
                                    <Space>
                                        <Tag color="volcano" className="font-mono font-bold text-lg px-3 py-1">{paymentData.note}</Tag>
                                        <Button size="small" type="primary" icon={<CopyOutlined />} onClick={() => handleCopyText(paymentData.note)}>Sao chép</Button>
                                    </Space>
                                </div>
                            </div>
                            <Card className="bg-gray-100 border-none mt-2 rounded-xl">
                                <Text strong className="block text-sm text-blue-700 text-center animate-pulse">⏳ Vui lòng chờ tiền vào, cửa sổ sẽ tự động đóng...</Text>
                            </Card>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default WalletPage;