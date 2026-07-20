import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, message, Card, Typography, Tabs, Input, Row, Col, Modal, Form, Alert, Popover, Upload } from 'antd';
import { SearchOutlined, CheckCircleOutlined, RiseOutlined, UploadOutlined, QrcodeOutlined } from '@ant-design/icons';
import api from "../../config/api.js";

const { Title, Text } = Typography;

const AdminFinancePage = () => {
    const [transactions, setTransactions] = useState([]);
    const [ggr, setGgr] = useState(0);
    const [ngr, setNgr] = useState(0);
    const [loading, setLoading] = useState(false);

    const [searchCodeWithdraw, setSearchCodeWithdraw] = useState('');
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
    const [selectedTrans, setSelectedTrans] = useState(null);
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/finance/dashboard');
            setTransactions(res.data?.transactions || []);
            setGgr(res.data?.ggr || 0);
            setNgr(res.data?.ngr || 0);
        } catch (error) {
            message.error('Lỗi tải dữ liệu sổ cái!');
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const normFile = (e) => {
        if (Array.isArray(e)) return e;
        return e?.fileList;
    };

    const handleConfirmWithdraw = async (values) => {
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('file', values.file[0].originFileObj);

            await api.put(`/admin/withdrawals/${selectedTrans.id}/complete`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' } // Cho phép đính kèm tệp gửi lên
            });

            message.success('Đã xác nhận chi trả thành công và lưu Ủy Nhiệm Chi vào hệ thống!');
            setIsConfirmModalVisible(false);
            fetchTransactions();
        } catch (error) {
            message.error(error.response?.data?.error || 'Lỗi xử lý!');
        } finally {
            setSubmitting(false);
        }
    };

    const pendingWithdrawals = transactions.filter(t =>
        t?.type === 'WITHDRAW' && t?.status === 'PENDING' && (t?.transactionCode || '').includes(searchCodeWithdraw)
    );

    const withdrawColumns = [
        { title: 'Mã Lệnh', dataIndex: 'transactionCode', render: t => <Text className="text-xl font-bold tracking-widest text-blue-600">{t}</Text> },
        { title: 'Số Tiền Rút', dataIndex: 'amount', render: v => <Text className="text-red-600 font-bold text-lg">{v ? v.toLocaleString() : 0} VNĐ</Text> },
        {
            title: 'Thông Tin Nhận Tiền',
            render: (_, r) => (
                <div className="flex flex-col gap-1">
                    <Text strong>{r.bankName || 'Nhận trực tiếp'}</Text>
                    <Text copyable className="text-blue-600">{r.accountNumber}</Text>
                    <Text>{r.accountName}</Text>
                    {r.bankName && r.accountNumber && (
                        <Popover
                            content={<img src={`https://img.vietqr.io/image/${r.bankName}-${r.accountNumber}-compact.png?amount=${r.amount}&accountName=${r.accountName}`} alt="QR Code" className="w-56" />}
                            trigger="click"
                            placement="right"
                        >
                            <Button size="small" type="dashed" className="mt-1 w-max" icon={<QrcodeOutlined/>}>Quét QR Chuyển Khoản</Button>
                        </Popover>
                    )}
                </div>
            )
        },
        { title: 'Thời Gian Yêu Cầu', dataIndex: 'createdAt', render: d => d ? new Date(d).toLocaleString() : '' },
        {
            title: 'Thao Tác BTC',
            align: 'right',
            render: (_, r) => (
                <Button type="primary" className="bg-green-600 border-none font-bold" icon={<CheckCircleOutlined />} onClick={() => { setSelectedTrans(r); form.resetFields(); setIsConfirmModalVisible(true); }}>
                    XÁC NHẬN ĐÃ CHI TRẢ
                </Button>
            )
        }
    ];

    const historyColumns = [
        { title: 'Mã GD', dataIndex: 'transactionCode', render: t => <Text strong>{t}</Text> },
        { title: 'Loại', dataIndex: 'type', render: t => <Tag color="blue">{t}</Tag> },
        { title: 'In/Out', dataIndex: 'direction', render: d => <Tag color={d === 'IN' ? 'green' : 'red'}>{d}</Tag> },
        { title: 'Số tiền', dataIndex: 'amount', render: v => <Text strong>{v ? v.toLocaleString() : 0} đ</Text> },
        { title: 'Trạng thái', dataIndex: 'status', render: s => <Tag color={s === 'COMPLETED' ? 'green' : (s === 'REJECTED' ? 'red' : 'gold')}>{s}</Tag> },
        { title: 'Ngày giờ', dataIndex: 'createdAt', render: d => d ? new Date(d).toLocaleString() : '' },
    ];

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <Card className="shadow-xl rounded-2xl border-none mb-6 bg-gradient-to-r from-gray-900 to-blue-900">
                <Row gutter={24}>
                    <Col span={8}>
                        <Text className="text-gray-400">Tổng GGR (Tiền cược vào)</Text>
                        <Title level={2} className="text-white m-0"><RiseOutlined className="text-green-400"/> {ggr.toLocaleString()} VNĐ</Title>
                    </Col>
                    <Col span={8}>
                        <Text className="text-gray-400">NGR Sàn Thực Nhận (20% Phế)</Text>
                        <Title level={2} className="text-yellow-400 m-0">{ngr.toLocaleString()} VNĐ</Title>
                    </Col>
                    <Col span={8}>
                        <Text className="text-gray-400">Số Lượng Yêu Cầu Rút</Text>
                        <Title level={2} className="text-red-400 m-0">{pendingWithdrawals.length} Lệnh</Title>
                    </Col>
                </Row>
            </Card>

            <Card className="shadow-xl rounded-2xl border-none">
                <Tabs size="large" items={[
                    {
                        key: 'WITHDRAW',
                        label: `Duyệt Rút Tiền Quầy (${pendingWithdrawals.length})`,
                        children: (
                            <>
                                <Input size="large" placeholder="Nhập mã lệnh rút..." prefix={<SearchOutlined />} className="mb-6 w-1/2" onChange={e => setSearchCodeWithdraw(e.target.value)} allowClear/>
                                <Table columns={withdrawColumns} dataSource={pendingWithdrawals} rowKey="id" loading={loading}/>
                            </>
                        )
                    },
                    {
                        key: 'HISTORY',
                        label: 'Sổ Cái Dòng Tiền',
                        children: <Table columns={historyColumns} dataSource={transactions} rowKey="id" loading={loading}/>
                    }
                ]} />
            </Card>

            <Modal title={<span className="text-xl font-bold text-green-700">✅ Xác Nhận Chi Trả</span>} open={isConfirmModalVisible} onCancel={() => setIsConfirmModalVisible(false)} footer={null} centered>
                <Alert message="Lưu ý" description={`Bạn đang chi trả số tiền ${selectedTrans?.amount?.toLocaleString() || 0} VNĐ cho mã ${selectedTrans?.transactionCode}. Vui lòng đính kèm hóa đơn hoặc UNC chuyển khoản làm bằng chứng lưu trữ cho kế toán.`} type="warning" showIcon className="mb-6" />
                <Form form={form} layout="vertical" onFinish={handleConfirmWithdraw}>
                    <Form.Item name="file" label={<Text strong>Biên Lai / Ủy Nhiệm Chi / Hình Ảnh Chuyển Khoản</Text>} valuePropName="fileList" getValueFromEvent={normFile} rules={[{ required: true, message: 'Bắt buộc tải lên file minh chứng!' }]}>
                        <Upload maxCount={1} beforeUpload={() => false} listType="picture">
                            <Button icon={<UploadOutlined />} size="large" className="w-full">Tải Lên Tệp Bằng Chứng</Button>
                        </Upload>
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block size="large" loading={submitting} className="bg-green-600 h-12 font-bold text-lg mt-4">XÁC NHẬN ĐÃ CHI TRẢ THÀNH CÔNG</Button>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminFinancePage;