import React, { useState } from 'react';
import { Card, Typography, Input, Button, List, message } from 'antd';
import { NotificationOutlined, SendOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const AdminNewsPage = () => {
    const [content, setContent] = useState('');
    const [newsList, setNewsList] = useState(JSON.parse(localStorage.getItem('admin_announcements') || '[]'));

    const handlePost = () => {
        if (!content.trim()) return message.warning('Vui lòng nhập nội dung!');

        const newPost = { id: Date.now(), content, date: dayjs().toISOString() };
        const updatedList = [newPost, ...newsList];

        localStorage.setItem('admin_announcements', JSON.stringify(updatedList));
        setNewsList(updatedList);
        setContent('');
        message.success('Đã gửi thông báo đến toàn bộ người dùng!');
    };

    const handleDelete = (id) => {
        const filtered = newsList.filter(n => n.id !== id);
        localStorage.setItem('admin_announcements', JSON.stringify(filtered));
        setNewsList(filtered);
    };

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <Card className="shadow-xl rounded-2xl border-none mb-6">
                    <Title level={3} className="mb-4"><NotificationOutlined className="text-blue-500 mr-2"/> Đăng Thông Báo Hệ Thống</Title>
                    <Input.TextArea rows={4} value={content} onChange={e => setContent(e.target.value)} placeholder="Nhập nội dung cần thông báo cho toàn bộ máy chủ (Ví dụ: Sự kiện đua lúc 20:00)..." className="text-lg p-4 rounded-xl mb-4" />
                    <Button type="primary" size="large" icon={<SendOutlined />} onClick={handlePost} className="bg-blue-600 font-bold px-8">PHÁT SÓNG TOÀN SERVER</Button>
                </Card>

                <Card className="shadow-sm rounded-xl">
                    <Title level={4} className="mb-4">Lịch Sử Thông Báo</Title>
                    <List
                        dataSource={newsList}
                        renderItem={item => (
                            <List.Item actions={[<Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(item.id)} />]} className="bg-white border mb-3 rounded-lg p-4 shadow-sm">
                                <List.Item.Meta
                                    title={<Text className="text-lg">{item.content}</Text>}
                                    description={<Text type="secondary">Đăng lúc: {dayjs(item.date).format('HH:mm - DD/MM/YYYY')}</Text>}
                                />
                            </List.Item>
                        )}
                        locale={{ emptyText: 'Chưa có thông báo nào được phát đi.' }}
                    />
                </Card>
            </div>
        </div>
    );
};

export default AdminNewsPage;