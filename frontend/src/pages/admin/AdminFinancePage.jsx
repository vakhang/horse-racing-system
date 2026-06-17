import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, message, Card, Typography, Tabs, Input, Row, Col, Modal, Form, Alert } from 'antd';
import { SearchOutlined, CheckCircleOutlined, RiseOutlined } from '@ant-design/icons';
import api from "../../config/api.js";

const { Title, Text } = Typography;

const AdminFinancePage = () => {
    const [transactions, setTransactions] = useState([]);
    const [ggr, setGgr] = useState(0);
    const [ngr, setNgr] = useState(0);
    const [loading, setLoading] = useState(false);
    const [searchCode, setSearchCode] = useState('');

    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
    const [selectedTrans, setSelectedTrans] = useState(null);
    const [form] = Form.useForm();

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
        const loadData = async () => { await fetchTransactions(); };
        loadData();
    }, []);

    const handleConfirmWithdraw = async (values) => {
        try {
            await api.put(`/admin/withdrawals/${selectedTrans.id}/complete`, { proofUrl: values.proofUrl });
            message.success('Đã xác nhận thanh toán thành công!');
            setIsConfirmModalVisible(false);
            await fetchTransactions();
        } catch (error) {
            message.error('Lỗi xử lý!');
        }
    };

    const pendingWithdrawals = (transactions || []).filter(t =>
        t?.type === 'WITHDRAW' &&
        t?.status === 'PENDING' &&
        (t?.transactionCode || '').includes(searchCode)
    );

    const withdrawColumns = [
        { title: 'Mã Giao Dịch', dataIndex: 'transactionCode', render: t => <Text className="text-xl font-bold tracking-widest text-blue-600">{t}</Text> },
        { title: 'Số Tiền Rút', dataIndex: 'amount', render: v => <Text className="text-red-600 font-bold text-lg">{v ? v.toLocaleString() : 0} VNĐ</Text> },
        { title: 'Thời Gian Bấm Rút', dataIndex: 'createdAt', render: d => d ? new Date(d).toLocaleString() : '' },
        { title: 'Thao Tác BTC', render: (_, r) => (
                <Button type="primary" className="bg-green-600" icon={<CheckCircleOutlined />} onClick={() => { setSelectedTrans(r); form.resetFields(); setIsConfirmModalVisible(true); }}>
                    Xác Nhận Đã Chi Tiền
                </Button>
            )}
    ];

    const historyColumns = [
        { title: 'Mã GD', dataIndex: 'transactionCode', render: t => <Text strong>{t}</Text> },
        { title: 'Loại', dataIndex: 'type', render: t => <Tag color="blue">{t}</Tag> },
        { title: 'In/Out', dataIndex: 'direction', render: d => <Tag color={d === 'IN' ? 'green' : 'red'}>{d}</Tag> },
        { title: 'Số tiền', dataIndex: 'amount', render: v => <Text strong>{v ? v.toLocaleString() : 0} đ</Text> },
        { title: 'Trạng thái', dataIndex: 'status', render: s => <Tag color={s === 'COMPLETED' ? 'green' : 'gold'}>{s}</Tag> },
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
                        <Text className="text-gray-400">Tổng GD Chờ Rút Tiền</Text>
                        <Title level={2} className="text-red-400 m-0">{pendingWithdrawals.length} Giao dịch</Title>
                    </Col>
                </Row>
            </Card>

            <Card className="shadow-xl rounded-2xl border-none">
                <Tabs size="large" items={[
                    {
                        key: 'WITHDRAW',
                        label: 'Tại Quầy (Xử lý rút tiền)',
                        children: (
                            <>
                                <Input size="large" placeholder="Nhập mã giao dịch khách đọc tại quầy..." prefix={<SearchOutlined />} className="mb-6 w-1/2" onChange={e => setSearchCode(e.target.value)} allowClear/>
                                <Table columns={withdrawColumns} dataSource={pendingWithdrawals} rowKey="id" loading={loading}/>
                            </>
                        )
                    },
                    {
                        key: 'HISTORY',
                        label: 'Sổ Cái Dòng Tiền Toàn Hệ Thống',
                        children: <Table columns={historyColumns} dataSource={transactions} rowKey="id" loading={loading}/>
                    }
                ]} />
            </Card>

            <Modal title="Xác nhận thanh toán tại quầy" open={isConfirmModalVisible} onCancel={() => setIsConfirmModalVisible(false)} footer={null} centered>
                <Alert message="Lưu ý" description={`Bạn đang chi trả tiền mặt số tiền ${selectedTrans?.amount?.toLocaleString() || 0} VNĐ cho mã ${selectedTrans?.transactionCode}.`} type="warning" showIcon className="mb-4" />
                <Form form={form} layout="vertical" onFinish={handleConfirmWithdraw}>
                    <Form.Item name="proofUrl" label="Link ảnh UNC / Hóa đơn ký nhận" rules={[{ required: true }]}>
                        <Input placeholder="https://..." />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block size="large" className="bg-green-600">ĐÃ GIAO TIỀN MẶT CHO KHÁCH</Button>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminFinancePage;