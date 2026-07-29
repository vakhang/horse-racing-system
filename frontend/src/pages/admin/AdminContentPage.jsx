import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Card, Select, Button, Typography, message, Spin, Input, Space } from 'antd';
import { SaveOutlined, PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import api from '../../config/api';
import 'react-quill-new/dist/quill.snow.css';

// Lazy load ReactQuill to improve initial load time and prevent freezing
const ReactQuill = lazy(() => import('react-quill-new'));

const { Title } = Typography;
const { Option } = Select;

const FaqEditor = ({ value, onChange }) => {
    const [faqs, setFaqs] = useState([]);
    
    useEffect(() => {
        if (!value) {
            setFaqs([]);
            return;
        }
        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
                setFaqs(parsed);
            } else {
                setFaqs([]);
            }
        } catch (e) {
            setFaqs([]);
        }
    }, [value]);

    const handleChange = (newFaqs) => {
        setFaqs(newFaqs);
        onChange(JSON.stringify(newFaqs));
    };

    const addFaq = () => {
        handleChange([...faqs, { question: '', answer: '' }]);
    };

    const removeFaq = (index) => {
        const newFaqs = [...faqs];
        newFaqs.splice(index, 1);
        handleChange(newFaqs);
    };

    const updateFaq = (index, field, val) => {
        const newFaqs = [...faqs];
        newFaqs[index][field] = val;
        handleChange(newFaqs);
    };
    
    const moveFaq = (index, direction) => {
        if (direction === -1 && index === 0) return;
        if (direction === 1 && index === faqs.length - 1) return;
        
        const newFaqs = [...faqs];
        const temp = newFaqs[index];
        newFaqs[index] = newFaqs[index + direction];
        newFaqs[index + direction] = temp;
        handleChange(newFaqs);
    };

    return (
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            {faqs.map((faq, index) => (
                <Card key={index} className="mb-4 shadow-sm border border-blue-100" styles={{ body: { padding: '16px' } }}>
                    <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-blue-700 uppercase tracking-wide text-xs">Câu hỏi {index + 1}</span>
                        <Space>
                            <Button icon={<ArrowUpOutlined />} size="small" onClick={() => moveFaq(index, -1)} disabled={index === 0} />
                            <Button icon={<ArrowDownOutlined />} size="small" onClick={() => moveFaq(index, 1)} disabled={index === faqs.length - 1} />
                            <Button danger icon={<DeleteOutlined />} size="small" onClick={() => removeFaq(index)} />
                        </Space>
                    </div>
                    <Input 
                        placeholder="Nhập câu hỏi (Ví dụ: Thời gian xử lý nạp tiền là bao lâu?)" 
                        value={faq.question} 
                        onChange={(e) => updateFaq(index, 'question', e.target.value)} 
                        className="mb-3 font-semibold text-lg"
                        style={{ marginBottom: '12px' }}
                        size="large"
                    />
                    <Input.TextArea 
                        placeholder="Nhập câu trả lời chi tiết..." 
                        value={faq.answer} 
                        onChange={(e) => updateFaq(index, 'answer', e.target.value)} 
                        rows={4}
                        className="text-gray-700"
                    />
                </Card>
            ))}
            <Button type="dashed" block icon={<PlusOutlined />} onClick={addFaq} size="large" className="mt-2 h-14 border-blue-300 text-blue-600 font-semibold hover:bg-blue-50">
                THÊM CÂU HỎI MỚI
            </Button>
        </div>
    );
};

const AdminContentPage = () => {
    const [pageId, setPageId] = useState('RACE_RULES');
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
            const titleMap = {
                'RACE_RULES': 'Điều lệ Đua ngựa',
                'RULES': 'Thể lệ Đặt cược',
                'PRIVACY': 'Chính sách Bảo mật & eKYC',
                'TERMS': 'Điều khoản Sử dụng & Miễn trừ',
                'GUIDE': 'Hướng dẫn Tân thủ & Nạp/Rút',
                'FAQ': 'Câu hỏi thường gặp (FAQ)'
            };
            const title = titleMap[pageId];
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
                <div className="mb-6 flex items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <span className="font-bold text-gray-700">Chọn trang cần cập nhật:</span>
                    <Select value={pageId} onChange={setPageId} className="w-72" size="large">
                        <Option value="RACE_RULES">Điều lệ Đua ngựa</Option>
                        <Option value="RULES">Thể lệ Đặt cược</Option>
                        <Option value="PRIVACY">Chính sách Bảo mật & eKYC</Option>
                        <Option value="TERMS">Điều khoản Sử dụng & Miễn trừ</Option>
                        <Option value="GUIDE">Hướng dẫn Tân thủ & Nạp/Rút</Option>
                        <Option value="FAQ">Câu hỏi thường gặp (FAQ)</Option>
                    </Select>
                </div>
                
                <div className="bg-white mb-6">
                    {loading ? (
                        <div className="flex justify-center p-12"><Spin size="large" /></div>
                    ) : (
                        pageId === 'FAQ' ? (
                            <FaqEditor value={content} onChange={setContent} />
                        ) : (
                            <Suspense fallback={<div className="flex justify-center p-12"><Spin tip="Đang tải trình soạn thảo..." size="large" /></div>}>
                                <ReactQuill 
                                    theme="snow" 
                                    value={content} 
                                    onChange={setContent} 
                                    modules={{
                                        toolbar: [
                                            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                                            ['bold', 'italic', 'underline', 'strike'],
                                            [{ 'color': [] }, { 'background': [] }],
                                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                            [{ 'indent': '-1'}, { 'indent': '+1' }],
                                            [{ 'align': [] }],
                                            ['link', 'image'],
                                            ['clean']
                                        ]
                                    }}
                                    style={{ height: '400px', marginBottom: '50px' }} 
                                />
                            </Suspense>
                        )
                    )}
                </div>
                
                <Button 
                    type="primary" 
                    icon={<SaveOutlined />} 
                    size="large" 
                    onClick={handleSave}
                    loading={saving}
                    className="w-full h-12 text-lg font-bold mt-2"
                >
                    LƯU THAY ĐỔI DỮ LIỆU
                </Button>
            </Card>
        </div>
    );
};

export default AdminContentPage;
