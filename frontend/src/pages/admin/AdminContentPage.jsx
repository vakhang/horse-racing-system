import React, { useState, useEffect } from 'react';
import { Card, Select, Button, Typography, message, Spin } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api from '../../config/api';

const { Title } = Typography;
const { Option } = Select;

const AdminContentPage = () => {
    const [pageId, setPageId] = useState('TERMS');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchContent(pageId);
    }, [pageId]);

    const fetchContent = async (id) => {
        try {
            setLoading(true);
            const res = await api.get(`/public/content/${id}`);
            setContent(res.data.content || '');
        } catch (error) {
            console.error('Failed to load content', error);
            message.error('Không thể tải nội dung');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const title = pageId === 'TERMS' ? 'Điều Khoản Sử Dụng' : 'Thể Lệ Đặt Cược';
            await api.put(`/admin/content/${pageId}`, {
                title: title,
                content: content
            });
            message.success('Cập nhật nội dung thành công!');
        } catch (error) {
            console.error('Failed to save content', error);
            message.error('Không thể lưu nội dung');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6">
            <Card className="shadow-md rounded-xl">
                <Title level={3} className="mb-6">Quản Lý Nội Dung CMS</Title>
                <div className="mb-4 flex items-center gap-4">
                    <span className="font-semibold">Chọn trang cần cập nhật:</span>
                    <Select value={pageId} onChange={setPageId} className="w-64">
                        <Option value="TERMS">Điều Khoản Sử Dụng</Option>
                        <Option value="RULES">Thể Lệ Đặt Cược</Option>
                    </Select>
                </div>
                <div className="bg-white">
                    {loading ? (
                        <div className="flex justify-center p-12"><Spin size="large" /></div>
                    ) : (
                        <ReactQuill 
                            theme="snow" 
                            value={content} 
                            onChange={setContent} 
                            style={{ height: '400px', marginBottom: '50px' }} 
                        />
                    )}
                </div>
                <Button 
                    type="primary" 
                    icon={<SaveOutlined />} 
                    size="large" 
                    onClick={handleSave}
                    loading={saving}
                >
                    Lưu Thay Đổi
                </Button>
            </Card>
        </div>
    );
};

export default AdminContentPage;
