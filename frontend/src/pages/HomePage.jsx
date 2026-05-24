import React from 'react';
import { Row, Col, Card, Statistic, Typography, Timeline, Tag, Alert } from 'antd';
import { TrophyOutlined, TeamOutlined, HeartOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

const HomePage = () => {
    const { user } = useAuth();

    return (
        <div>
            <Row gutter={[16, 16]} className="mb-6">
                <Col span={24}>
                    <Title level={2}>Chào mừng trở lại, {user?.username}!</Title>

                    {/* Luồng KYC: Cảnh báo nếu tài khoản chưa được duyệt */}
                    {user?.status === 'PENDING' && (
                        <Alert
                            message="Tài khoản đang chờ duyệt KYC"
                            description="Vui lòng đợi Admin kiểm tra hình ảnh CCCD của bạn. Bạn chưa thể đặt cược lúc này."
                            type="warning"
                            showIcon
                            className="mb-4"
                        />
                    )}
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                {/* 1. Thống kê chung */}
                <Col span={6}>
                    <Card bordered={false} hoverable>
                        <Statistic title="Số dư ví" value={user?.balance || 0} precision={2} prefix={<Text className="text-2xl text-blue-600">Đ</Text>} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} hoverable>
                        <Statistic title="Giải đấu đang diễn ra" value={3} prefix={<TrophyOutlined className="text-yellow-500" />} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} hoverable>
                        <Statistic title="Tổng số ngựa" value={120} prefix={<TeamOutlined className="text-green-600" />} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} hoverable>
                        <Statistic title="Tỷ lệ thắng cược" value={65.5} suffix="%" prefix={<HeartOutlined className="text-red-500" />} />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} className="mt-6">
                {/* 2. Lịch giải đấu sắp tới */}
                <Col span={16}>
                    <Card title="Lịch Giải Đua Sắp Tới" bordered={false}>
                        <Timeline
                            mode="alternate"
                            items={[
                                { children: 'Giải Đua Xuân 2026 - Vòng 1', color: 'green', dot: <ClockCircleOutlined /> },
                                { children: 'Giải vô địch Quốc gia - Vòng loại', color: 'blue' },
                                { children: 'Đua Ngựa Vòng Tròn Châu Á (Sắp diễn ra)', color: 'gray' },
                            ]}
                        />
                    </Card>
                </Col>

                {/* 3. Hoạt động gần đây */}
                <Col span={8}>
                    <Card title="Hoạt Động Gần Đây" bordered={false}>
                        <div className="space-y-3">
                            <Text>Đặt cược <Tag color="green">+500 điểm</Tag> vào Ngựa Xích Thố.</Text><br/>
                            <Text>Nạp tiền <Tag color="blue">+1000 điểm</Tag> qua ví Mock.</Text><br/>
                            <Text>Hồ sơ KYC được <Tag color="orange">Admin tiếp nhận</Tag>.</Text>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default HomePage;