import React, { useState, useEffect } from 'react';
import { Table, Tag, Card, Typography, Row, Col, Avatar, message } from 'antd';
import { TeamOutlined, UserOutlined } from '@ant-design/icons';
import api from "../../config/api.js";

const { Title, Text } = Typography;

// [Chức năng rõ ràng]: Trang Danh bạ Nài Ngựa
// [Tác dụng]: Hiển thị danh sách tất cả các Nài ngựa trong hệ thống để Chủ ngựa xem thông tin (kinh nghiệm, cân nặng) và gửi lời mời thuê.
// [Hướng dẫn sửa đổi]:
// - UI: Sửa giao diện dạng Card thay vì Table nếu muốn hiển thị hình ảnh Nài ngựa to hơn.
const OwnerJockeyDirectoryPage = () => {
    const [jockeys, setJockeys] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchJockeys = async () => {
            setLoading(true);
            try {
                const response = await api.get('/users/jockeys/market');
                setJockeys(response.data);
            } catch (error) { message.error('Lỗi tải thị trường nài ngựa!'); }
            finally { setLoading(false); }
        };
        fetchJockeys();
    }, []);

    const columns = [
        {
            title: 'Tên Nài Ngựa',
            render: (_, r) => (
                <div className="flex items-center gap-4">
                    <Avatar size={48} icon={<UserOutlined />} className="bg-purple-500" />
                    <div>
                        <Text strong className="text-lg block">{r.username}</Text>
                        <Tag color={
                            r.status === 'SẴN SÀNG' ? 'green' :
                            r.status === 'ĐANG CÓ LỊCH' ? 'red' : 'orange'
                        } className="font-bold border-none mt-1">
                            {r.status}
                        </Tag>
                    </div>
                </div>
            )
        },
        { title: 'Cân Nặng', dataIndex: 'weight', render: w => <Text strong>{w} kg</Text> },
        { title: 'Chiều Cao', dataIndex: 'height', render: h => <Text>{h} cm</Text> },
        { title: 'Liên Hệ', render: (_, r) => (
            <div>
                <div className="text-gray-500">📞 {r.phone}</div>
                <div className="text-gray-500">✉️ {r.email}</div>
            </div>
        ) }
    ];

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <Card className="shadow-xl rounded-2xl border-none">
                <Row justify="space-between" align="middle" className="mb-6">
                    <Col>
                        <Title level={2} className="m-0 flex items-center gap-3"><TeamOutlined className="text-purple-600"/> Sàn Giao Dịch Nài Ngựa</Title>
                        <Text type="secondary">Tìm kiếm, thương lượng và ký hợp đồng với các nài ngựa phong độ cao nhất hệ thống.</Text>
                    </Col>
                </Row>
                <Table columns={columns} dataSource={jockeys} rowKey="id" loading={loading} pagination={{ pageSize: 6 }} className="border rounded-xl" />
            </Card>
        </div>
    );
};

export default OwnerJockeyDirectoryPage;