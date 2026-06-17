import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, Card, Typography, Row, Col, Avatar, message } from 'antd';
import { TeamOutlined, UserOutlined, MessageOutlined } from '@ant-design/icons';
import api from "../../config/api.js";

const { Title, Text } = Typography;

const OwnerJockeyDirectoryPage = () => {
    const [jockeys, setJockeys] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchJockeys = async () => {
            setLoading(true);
            try {
                const response = await api.get('/users');
                const onlyJockeys = response.data.filter(u => u.role === 'JOCKEY');

                // Thuật toán giả lập chỉ số Pro cho Jockey
                const jockeysWithStats = onlyJockeys.map(j => {
                    // KÉO CV CỦA JOCKEY TỪ MÁY LÊN
                    const savedCV = JSON.parse(localStorage.getItem(`jockey_cv_${j.id}`) || '{}');
                    const winRate = savedCV.winRate || Math.floor(Math.random() * (90 - 40 + 1) + 40);

                    return {
                        ...j,
                        weight: savedCV.weight ? `${savedCV.weight} kg` : 'Chưa khai báo',
                        height: savedCV.height ? `${savedCV.height} cm` : 'Chưa khai báo',
                        winRate: winRate,
                        rank: winRate > 75 ? 'S' : (winRate > 60 ? 'A' : 'B'),
                        fee: winRate > 75 ? '15%' : '10%'
                    };
                });
                // Sắp xếp người giỏi nhất lên đầu
                setJockeys(jockeysWithStats.sort((a, b) => b.winRate - a.winRate));
            } catch (error) { message.error('Lỗi tải thị trường nài ngựa!'); }
            finally { setLoading(false); }
        };
        fetchJockeys();
    }, []);

    const rankColor = { 'S': 'gold', 'A': 'purple', 'B': 'blue' };

    const columns = [
        {
            title: 'Hồ Sơ Nài Ngựa',
            render: (_, r) => (
                <div className="flex items-center gap-4">
                    <Avatar size={48} icon={<UserOutlined />} className={r.rank === 'S' ? "bg-yellow-500" : "bg-gray-400"} />
                    <div>
                        <Text strong className="text-lg block">{r.username}</Text>
                        <Tag color={rankColor[r.rank]} className="font-bold border-none">Hạng {r.rank}</Tag>
                    </div>
                </div>
            )
        },
        { title: 'Cân Nặng', dataIndex: 'weight', render: w => <Text strong>{w}</Text> },
        { title: 'Chiều Cao', dataIndex: 'height' },
        { title: 'Tỷ Lệ Thắng (Win Rate)', dataIndex: 'winRate', render: w => <Text type="success" strong>{w}%</Text> },
        { title: 'Phí Ký Hợp Đồng', dataIndex: 'fee', render: f => <Text type="danger" strong>{f} Tiền Thưởng</Text> },
        { title: 'Liên Hệ', align: 'right', render: () => <Button type="dashed" icon={<MessageOutlined />}>Gửi Tin Nhắn</Button> }
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