import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, message, Card, Typography, Tabs, Input, Row, Col, Modal, Form, Alert, Space, Image } from 'antd';
import { SearchOutlined, CheckCircleOutlined, RiseOutlined, CloseCircleOutlined } from '@ant-design/icons';
import api from "../../config/api.js";

const { Title, Text } = Typography;

const AdminFinancePage = () => {
    const [transactions, setTransactions] = useState([]);
    const [ggr, setGgr] = useState(0);
    const [ngr, setNgr] = useState(0);
    const [loading, setLoading] = useState(false);

    // Rút tiền
    const [searchCodeWithdraw, setSearchCodeWithdraw] = useState('');
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
    const [selectedTrans, setSelectedTrans] = useState(null);
    const [form] = Form.useForm();

    // Nạp tiền
    const [searchCodeDeposit, setSearchCodeDeposit] = useState('');
    const [previewImage, setPreviewImage] = useState('');
    const [previewVisible, setPreviewVisible] = useState(false);

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

    // ----------------------------------------------------
    // NGHIỆP VỤ RÚT TIỀN
    // ----------------------------------------------------
    const handleConfirmWithdraw = async (values) => {
        try {
            await api.put(`/admin/withdrawals/${selectedTrans.id}/complete`, { proofUrl: values.proofUrl });
            message.success('Đã xác nhận chi trả tiền mặt cho khách thành công!');
            setIsConfirmModalVisible(false);
            fetchTransactions();
        } catch (error) {
            message.error('Lỗi xử lý!');
        }
    };

    const pendingWithdrawals = transactions.filter(t =>
        t?.type === 'WITHDRAW' && t?.status === 'PENDING' && (t?.transactionCode || '').includes(searchCodeWithdraw)
    );

    const withdrawColumns = [
        { title: 'Mã Rút Tiền', dataIndex: 'transactionCode', render: t => <Text className="text-xl font-bold tracking-widest text-blue-600">{t}</Text> },
        { title: 'Số Tiền Rút', dataIndex: 'amount', render: v => <Text className="text-red-600 font-bold text-lg">{v ? v.toLocaleString() : 0} VNĐ</Text> },
        { title: 'Thời Gian Bấm Rút', dataIndex: 'createdAt', render: d => d ? new Date(d).toLocaleString() : '' },
        { title: 'Thao Tác BTC', render: (_, r) => (
                <Button type="primary" className="bg-green-600" icon={<CheckCircleOutlined />} onClick={() => { setSelectedTrans(r); form.resetFields(); setIsConfirmModalVisible(true); }}>
                    Xác Nhận Đã Chi Tiền
                </Button>
            )}
    ];

    // ----------------------------------------------------
    // NGHIỆP VỤ DUYỆT NẠP TIỀN
    // ----------------------------------------------------
    const handleApproveDeposit = async (id) => {
        try {
            await api.put(`/admin/deposits/${id}/approve`);
            message.success("Đã duyệt nạp tiền! Ví của người dùng đã được cộng số dư.");
            fetchTransactions();
        } catch (error) {
            message.error(error.response?.data || "Lỗi xử lý nạp tiền!");
        }
    };

    const handleRejectDeposit = async (id) => {
        try {
            await api.put(`/admin/deposits/${id}/reject`);
            message.warning("Đã TỪ CHỐI hóa đơn nạp tiền này!");
            fetchTransactions();
        } catch (error) {
            message.error("Lỗi xử lý từ chối!");
        }
    };

    const pendingDeposits = transactions.filter(t =>
        t?.type === 'DEPOSIT' && t?.status === 'PENDING' && t?.proofUrl != null && (t?.transactionCode || '').includes(searchCodeDeposit)
    );

    const depositColumns = [
        { title: 'Mã GD (Nội dung CK)', dataIndex: 'transactionCode', render: t => <Text className="font-mono font-bold">{t}</Text> },
        { title: 'Số Tiền Khách Nạp', dataIndex: 'amount', render: v => <Text className="text-green-600 font-bold text-lg">+{v ? v.toLocaleString() : 0} VNĐ</Text> },
        { title: 'Ảnh Ủy Nhiệm Chi', render: (_, r) => (
                <Button type="dashed" onClick={() => { setPreviewImage(r.proofUrl); setPreviewVisible(true); }}> Xem Biên Lai </Button>
            )},
        { title: 'Thời Gian Gửi', dataIndex: 'createdAt', render: d => d ? new Date(d).toLocaleString() : '' },
        { title: 'Xét Duyệt', render: (_, r) => (
                <Space>
                    <Button type="primary" className="bg-green-600 font-bold border-none" icon={<CheckCircleOutlined />} onClick={() => handleApproveDeposit(r.id)}> Cộng Tiền </Button>
                    <Button danger icon={<CloseCircleOutlined />} onClick={() => handleRejectDeposit(r.id)}> Từ Chối </Button>
                </Space>
            )}
    ];

    // ----------------------------------------------------
    // SỔ CÁI
    // ----------------------------------------------------
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
                        <Text className="text-gray-400">Số Lượng Yêu Cầu Chờ Xử Lý</Text>
                        <div className="flex gap-4 items-center">
                            <Title level={3} className="text-green-400 m-0">{pendingDeposits.length} Nạp</Title>
                            <span className="text-gray-400 text-2xl">|</span>
                            <Title level={3} className="text-red-400 m-0">{pendingWithdrawals.length} Rút</Title>
                        </div>
                    </Col>
                </Row>
            </Card>

            <Card className="shadow-xl rounded-2xl border-none">
                <Tabs size="large" items={[
                    {
                        key: 'DEPOSIT',
                        label: `Duyệt Nạp Tiền (${pendingDeposits.length})`,
                        children: (
                            <>
                                <Alert message="Lưu ý Kế Toán" description="Hãy mở App Ngân Hàng của Công ty (ACB) để kiểm tra dòng tiền vào. CHỈ BẤM CỘNG TIỀN NẾU TÀI KHOẢN ĐÃ THỰC SỰ NHẬN ĐƯỢC TIỀN với đúng Mã Nội Dung CK." type="warning" showIcon className="mb-4" />
                                <Input size="large" placeholder="Tìm kiếm theo mã giao dịch khách điền..." prefix={<SearchOutlined />} className="mb-6 w-1/2" onChange={e => setSearchCodeDeposit(e.target.value)} allowClear/>
                                <Table columns={depositColumns} dataSource={pendingDeposits} rowKey="id" loading={loading}/>
                            </>
                        )
                    },
                    {
                        key: 'WITHDRAW',
                        label: `Duyệt Rút Tiền Quầy (${pendingWithdrawals.length})`,
                        children: (
                            <>
                                <Input size="large" placeholder="Nhập mã giao dịch khách đọc tại quầy..." prefix={<SearchOutlined />} className="mb-6 w-1/2" onChange={e => setSearchCodeWithdraw(e.target.value)} allowClear/>
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

            {/* Modal Xác nhận chi tiền (RÚT TIỀN) */}
            <Modal title="Xác nhận chi trả tiền mặt" open={isConfirmModalVisible} onCancel={() => setIsConfirmModalVisible(false)} footer={null} centered>
                <Alert message="Lưu ý" description={`Bạn đang chi trả tiền mặt số tiền ${selectedTrans?.amount?.toLocaleString() || 0} VNĐ cho mã ${selectedTrans?.transactionCode}.`} type="warning" showIcon className="mb-4" />
                <Form form={form} layout="vertical" onFinish={handleConfirmWithdraw}>
                    <Form.Item name="proofUrl" label="Link ảnh UNC / Hóa đơn ký nhận" rules={[{ required: true }]}>
                        <Input placeholder="https://..." />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block size="large" className="bg-green-600">ĐÃ GIAO TIỀN MẶT CHO KHÁCH</Button>
                </Form>
            </Modal>

            {/* Modal Xem Ảnh Biên Lai (NẠP TIỀN) */}
            <Modal open={previewVisible} footer={null} onCancel={() => setPreviewVisible(false)} centered width={600} title="Biên Lai Chuyển Khoản">
                <Image alt="Biên lai" style={{ width: '100%' }} src={previewImage} />
            </Modal>
        </div>
    );
};

export default AdminFinancePage;