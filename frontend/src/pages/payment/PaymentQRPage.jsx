import React, { useState } from 'react';
import { Card, Typography, InputNumber, Button, Row, Col, Space, Alert, Form, Input, message, Result, Divider, Tag } from 'antd';
import { QrcodeOutlined, CopyOutlined, CheckCircleOutlined, WalletOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import api from "../../config/api.js"; // Import axios instance cấu hình sẵn của dự án

const { Title, Text } = Typography;

const PaymentQRPage = () => {
    const { user } = useAuth(); // Lấy thông tin user hiện tại đang đăng nhập
    const [loading, setLoading] = useState(false);
    const [submittingProof, setSubmittingProof] = useState(false);
    const [amount, setAmount] = useState(50000); // Mặc định gợi ý nạp 50k
    const [paymentData, setPaymentData] = useState(null); // Lưu thông tin QR trả về từ backend
    const [isSuccess, setIsSuccess] = useState(false);
    const [form] = Form.useForm();

    // 1. Xử lý gọi Backend sinh mã QR thanh toán
    const handleGenerateQR = async () => {
        if (!amount || amount < 10000) {
            message.warning('Số tiền nạp tối thiểu là 10,000 VNĐ!');
            return;
        }
        setLoading(true);
        try {
            const response = await api.post('/payments/create-qr', {
                userId: user?.id,
                amount: amount
            });
            setPaymentData(response.data);
            message.success('Đã khởi tạo hóa đơn và mã chuyển khoản VietQR thành công!');
        } catch (error) {
            message.error(error.response?.data || 'Không thể tạo mã QR lúc này. Vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    // 2. Tiện ích Copy mã giao dịch vào bộ nhớ tạm (Clipboard)
    const handleCopyText = (text) => {
        navigator.clipboard.writeText(text);
        message.success('Đã sao chép nội dung chuyển khoản vào bộ nhớ tạm!');
    };

    // 3. Khách hàng gửi bằng chứng ảnh hóa đơn chuyển tiền thành công
    const handleConfirmTransfer = async (values) => {
        setSubmittingProof(true);
        try {
            await api.post('/payments/confirm', {
                transactionCode: paymentData?.transactionCode,
                proofUrl: values.proofUrl
            });
            setIsSuccess(true);
            message.success('Hệ thống đã ghi nhận hóa đơn nạp tiền thành công!');
        } catch (error) {
            message.error(error.response?.data || 'Có lỗi xảy ra khi xác nhận hóa đơn!');
        } finally {
            setSubmittingProof(false);
        }
    };

    // Giao diện khi nạp tiền hoàn tất thành công
    if (isSuccess) {
        return (
            <div className="p-8 bg-gray-100 min-h-screen flex justify-center items-center">
                <Card className="shadow-2xl rounded-2xl border-none max-w-lg text-center p-4">
                    <Result
                        status="success"
                        title={<Title level={3} className="text-green-600">NẠP TIỀN HOÀN TẤT!</Title>}
                        subTitle={`Giao dịch chuyển khoản ${amount.toLocaleString()} VNĐ đã được xử lý tự động thành công. Số dư ví của bạn đã được cập nhật.`}
                        extra={[
                            <Button type="primary" size="large" icon={<WalletOutlined />} onClick={() => {
                                setPaymentData(null);
                                setIsSuccess(false);
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

    return (
        <div className="p-8 bg-gray-100 min-h-screen flex justify-center items-center">
            <Card className="shadow-xl rounded-2xl border-none max-w-4xl w-full bg-white p-4">

                {/* Trạng thái 1: Nhập số tiền cần nạp */}
                {!paymentData ? (
                    <div className="text-center max-w-md mx-auto py-6">
                        <WalletOutlined className="text-5xl text-blue-600 mb-4" />
                        <Title level={2}>Nạp Tiền Vào Tài Khoản</Title>
                        <Text type="secondary">Nhập số tiền bạn muốn nạp vào hệ thống để tham gia cá cược cuộc đua</Text>

                        <div className="my-8">
                            <Text strong className="block text-left mb-2 text-base text-gray-700">Số tiền muốn nạp (VNĐ):</Text>
                            <InputNumber
                                size="large"
                                className="w-full text-xl rounded-xl font-bold text-blue-700"
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                min={10000}
                                max={100000000}
                                value={amount}
                                onChange={value => setAmount(value)}
                            />
                        </div>

                        {/* Mấy cái nút click nhanh số tiền mượt mà */}
                        <Row gutter={[8, 8]} className="mb-6">
                            {[50000, 100000, 200000, 500000, 1000000].map(val => (
                                <Col span={8} key={val}>
                                    <Button block onClick={() => setAmount(val)} type={amount === val ? 'primary' : 'default'} className="rounded-lg font-semibold">
                                        {val.toLocaleString()} đ
                                    </Button>
                                </Col>
                            ))}
                        </Row>

                        <Button
                            type="primary"
                            size="large"
                            block
                            icon={<QrcodeOutlined />}
                            loading={loading}
                            onClick={handleGenerateQR}
                            className="h-12 bg-gradient-to-r from-gray-900 to-blue-900 border-none text-lg font-bold rounded-xl shadow-md"
                        >
                            TẠO MÃ THANH TOÁN QR
                        </Button>
                    </div>
                ) : (

                    /* Trạng thái 2: Hiển thị mã QR VietQR và Nhập minh chứng */
                    <div>
                        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => setPaymentData(null)} className="mb-4 font-bold text-gray-500">
                            Quay lại nhập số tiền
                        </Button>

                        <Row gutter={32} align="middle">
                            {/* Cột trái: Hiển thị ảnh QR của VietQR */}
                            <Col xs={24} md={11} className="text-center bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-300">
                                <Title level={4} className="m-0 mb-4 text-blue-800">Quét Mã QR Để Thanh Toán</Title>
                                <img
                                    src={paymentData.qrUrl}
                                    alt="VietQR Code"
                                    className="w-full max-w-[280px] mx-auto shadow-lg rounded-xl mb-4 border border-gray-200"
                                />
                                <Alert
                                    message="Sử dụng ứng dụng ngân hàng di động (Mobile Banking) quét mã QR để tự động điền số tiền và nội dung."
                                    type="info"
                                    showIcon
                                    className="text-left"
                                />
                            </Col>

                            {/* Cột phải: Thông tin chuyển khoản bằng chữ và form confirm */}
                            <Col xs={24} md={13} className="mt-6 md:mt-0">
                                <Title level={3} className="text-gray-800 mb-4">Thông Tin Chuyển Khoản</Title>

                                <div className="space-y-3 bg-blue-50 p-4 rounded-xl border border-blue-100">
                                    <div>
                                        <Text type="secondary" className="text-xs">NGÂN HÀNG THỤ HƯỞNG</Text>
                                        <div className="text-base font-bold text-gray-900">{paymentData.bankId} (Ngân hàng Quân Đội)</div>
                                    </div>
                                    <div>
                                        <Text type="secondary" className="text-xs">SỐ TÀI KHOẢN</Text>
                                        <div className="text-base font-bold text-blue-700 tracking-wider">{paymentData.accountNo}</div>
                                    </div>
                                    <div>
                                        <Text type="secondary" className="text-xs">TÊN TÀI KHOẢN THỤ HƯỞNG</Text>
                                        <div className="text-base font-bold text-gray-900">{paymentData.accountName}</div>
                                    </div>
                                    <div>
                                        <Text type="secondary" className="text-xs">SỐ TIỀN CHUYỂN KHOẢN</Text>
                                        <div className="text-lg font-extrabold text-red-600">{paymentData.amount.toLocaleString()} VNĐ</div>
                                    </div>
                                    <Divider className="my-2 border-blue-200" />
                                    <div>
                                        <Text type="secondary" className="text-xs block mb-1">NỘI DUNG CHUYỂN KHOẢN BẮT BUỘC</Text>
                                        <Space size="middle">
                                            <Tag color="volcano" className="text-xl font-mono px-4 py-1 font-bold tracking-widest uppercase">
                                                {paymentData.note}
                                            </Tag>
                                            <Button
                                                size="small"
                                                type="dashed"
                                                icon={<CopyOutlined />}
                                                onClick={() => handleCopyText(paymentData.note)}
                                                className="border-blue-400 text-blue-600"
                                            >
                                                Sao chép
                                            </Button>
                                        </Space>
                                    </div>
                                </div>

                                {/* Form xác thực điền link hóa đơn / chứng từ giống Admin page */}
                                <Card className="mt-4 bg-gray-50 border-none rounded-xl shadow-inner">
                                    <Form form={form} layout="vertical" onFinish={handleConfirmTransfer}>
                                        <Form.Item
                                            name="proofUrl"
                                            label={<Text strong className="text-gray-700">Link ảnh Hóa đơn / Ủy nhiệm chi thành công</Text>}
                                            rules={[{ required: true, message: 'Vui lòng cung cấp link hình ảnh minh chứng chuyển khoản!' }]}
                                        >
                                            <Input placeholder="https://drive.google.com/link-anh-hoa-don.jpg" className="h-10 rounded-lg" />
                                        </Form.Item>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            block
                                            size="large"
                                            loading={submittingProof}
                                            icon={<CheckCircleOutlined />}
                                            className="h-11 bg-green-600 border-none text-base font-bold rounded-xl"
                                        >
                                            TÔI ĐÃ CHUYỂN TIỀN THÀNH CÔNG
                                        </Button>
                                    </Form>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default PaymentQRPage;