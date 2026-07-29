import React, { useState, useEffect } from 'react';
import { Form, Input, Button, DatePicker, Select, Typography, message, Row, Col, ConfigProvider, theme, Upload, Checkbox, Modal, Space } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, CalendarOutlined, InboxOutlined, TrophyOutlined, FireOutlined, SafetyCertificateOutlined, PhoneOutlined, IdcardOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import api from '../config/api.js';
import horseBg from '../assets/horseracing2.png';

const { Title, Text } = Typography;

const RegisterPage = () => {
    const [loading, setLoading] = useState(false);
    const [checkAll, setCheckAll] = useState(false);
    const [modalConfig, setModalConfig] = useState({ visible: false, type: '' });
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const selectedRole = Form.useWatch('role', form);
    const minAge = (selectedRole || 'SPECTATOR') === 'SPECTATOR' ? 21 : 18;

    // Reset lại checkbox khi đổi role
    useEffect(() => {
        form.setFieldsValue({ agreedRule1: false, agreedRule2: false, agreedRule3: false, agreedRule4: false });
        setCheckAll(false);
    }, [selectedRole, form]);

    const disabledDate = (current) => {
        return current && current > dayjs().endOf('day');
    };

    const normFile = (e) => {
        if (Array.isArray(e)) return e;
        return e?.fileList;
    };

    const onCheckAllChange = (e) => {
        const val = e.target.checked;
        setCheckAll(val);
        form.setFieldsValue({ agreedRule1: val, agreedRule2: val, agreedRule3: val, agreedRule4: val });
    };

    const openModal = (type) => setModalConfig({ visible: true, type });
    const closeModal = () => setModalConfig({ visible: false, type: '' });

    const handleRegister = async (values) => {
        setLoading(true);
        const formData = new FormData();

        formData.append('username', values.username);
        formData.append('password', values.password);
        formData.append('email', values.email);
        formData.append('role', values.role);
        formData.append('dob', values.dob.format('YYYY-MM-DD')); // Backend vẫn nhận YYYY-MM-DD

        formData.append('phoneNumber', values.phoneNumber);
        formData.append('idNumber', values.idNumber);
        formData.append('idIssueDate', values.idIssueDate.format('YYYY-MM-DD'));
        formData.append('idIssuePlace', values.idIssuePlace);
        formData.append('pinCode', values.pinCode);

        // Gửi trạng thái đồng ý
        formData.append('agreedRule1', values.agreedRule1);
        formData.append('agreedRule2', values.agreedRule2);
        formData.append('agreedRule3', values.agreedRule3);
        if (selectedRole === 'SPECTATOR') formData.append('agreedRule4', values.agreedRule4);

        if (values.kycFiles && values.kycFiles.length > 0) {
            values.kycFiles.forEach(file => {
                formData.append('kycFiles', file.originFileObj || file);
            });
        }

        try {
            const response = await api.post('/auth/register', formData);
            message.success(`Đăng ký thành công! ID tài khoản: ${response.data.id}`);
            message.info("Vui lòng đợi Admin duyệt KYC mới có thể đăng nhập.");
            navigate('/login');
        } catch (error) {
            const errorMsg = error.response?.data?.error || 'Có lỗi xảy ra!';
            if (errorMsg.toLowerCase().includes('tuổi') || errorMsg.toLowerCase().includes('ngày sinh')) {
                message.error('Thông tin đăng ký không hợp lệ!');
                form.setFields([{ name: 'dob', errors: [errorMsg] }]);
            } else {
                message.error(errorMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    // Nội dung động của các Checkbox dựa trên Role
    const roleCheckboxes = {
        SPECTATOR: [
            "Tôi cam kết từ đủ 21 tuổi trở lên và có đầy đủ năng lực hành vi dân sự.",
            "Tôi cam kết KHÔNG thuộc các đối tượng bị cấm tham gia đặt cược (Không phải là nhân viên công ty cá cược, nài ngựa, trọng tài, người thân của họ; Không đang trong thời gian bị truy cứu hình sự hoặc cai nghiện).",
            <span>Tôi đã đọc, hiểu rõ và đồng ý tuân thủ toàn bộ <a href="#" onClick={(e) => { e.preventDefault(); openModal('TERMS'); }} className="text-blue-400 hover:text-blue-300 underline font-bold">"Thể lệ đặt cược"</a> cùng các <a href="#" onClick={(e) => { e.preventDefault(); openModal('PRIVACY'); }} className="text-blue-400 hover:text-blue-300 underline font-bold">"Chính sách bảo mật"</a> của doanh nghiệp.</span>,
            "Tôi tự chịu trách nhiệm trước pháp luật về tính chính xác của các thông tin cá nhân và tài khoản ngân hàng đã khai báo."
        ],
        OWNER: [
            <span>Tôi cam kết các ngựa đua đăng ký tham gia thi đấu đều đáp ứng đầy đủ điều kiện, tiêu chuẩn sức khỏe và kỹ thuật theo quy định của <a href="#" onClick={(e) => { e.preventDefault(); openModal('RULES'); }} className="text-blue-400 hover:text-blue-300 underline font-bold">"Điều lệ đua"</a>.</span>,
            <span>Tôi đồng ý với phương thức phân chia tiền thưởng thi đấu giữa doanh nghiệp và chủ ngựa theo <a href="#" onClick={(e) => { e.preventDefault(); openModal('RULES'); }} className="text-blue-400 hover:text-blue-300 underline font-bold">"Điều lệ đua"</a> đã được phê duyệt.</span>,
            "Tôi cam kết chấp hành việc kiểm tra đột xuất đối với ngựa đua của mình khi có yêu cầu từ Ban Trọng tài hoặc Hội đồng giám sát."
        ],
        JOCKEY: [
            "Tôi cam kết TUYỆT ĐỐI KHÔNG tham gia đặt cược vào các cuộc đua mà tôi điều khiển ngựa.",
            "Tôi cam kết KHÔNG có quan hệ gia đình (vợ, chồng, cha, mẹ, con, anh, chị, em ruột) với bất kỳ Chủ ngựa nào khác có ngựa tham gia trong cùng cuộc đua mà tôi điều khiển.",
            <span>Tôi cam kết tuân thủ nghiêm ngặt <a href="#" onClick={(e) => { e.preventDefault(); openModal('RULES'); }} className="text-blue-400 hover:text-blue-300 underline font-bold">"Điều lệ đua"</a>, không dàn xếp làm sai lệch kết quả cuộc đua và tuân thủ các quyết định của Ban Trọng tài.</span>
        ],
        REFEREE: [
            "Tôi và người thân trong gia đình (vợ/chồng, cha/mẹ, con ruột) cam kết TUYỆT ĐỐI KHÔNG tham gia đặt cược vào các cuộc đua, trận đấu mà tôi thực hiện nhiệm vụ điều khiển, giám sát.",
            "Tôi cam kết chịu trách nhiệm về tính chính xác, trung thực của các quyết định và thông tin công bố kết quả sự kiện.",
            "Tôi cam kết không cung cấp thông tin nội bộ, không tiết lộ tỷ lệ cược khi chưa được doanh nghiệp đồng ý hoặc ủy quyền."
        ]
    };

    // Render nội dung Modal
    const renderModalContent = () => {
        if (modalConfig.type === 'TERMS') {
            return (
                <div className="text-gray-300 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-3">
                    <h4 className="text-white font-bold text-lg mt-2 mb-2 border-b border-gray-600 pb-1">Điều 1. Tên và Mô tả sản phẩm đặt cược</h4>
                    <ul className="list-disc pl-5 space-y-1">
                        <li><span className="text-white font-medium">Sản phẩm:</span> Đặt cược đua ngựa dựa trên thứ hạng của ngựa đua khi về đích.</li>
                        <li><span className="text-white font-medium">Loại hình cược:</span> Cược Thắng/Win, Cược Chỗ/Place, Cược Đôi/Quinella, v.v.</li>
                    </ul>
                    <h4 className="text-white font-bold text-lg mt-4 mb-2 border-b border-gray-600 pb-1">Điều 2. Đối tượng và Điều kiện tham gia</h4>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Người chơi phải từ đủ 21 tuổi trở lên và có đầy đủ năng lực hành vi dân sự.</li>
                        <li>Không thuộc các đối tượng bị cấm: Nài ngựa, Trọng tài, thành viên Ban tổ chức, người thân của các đối tượng trên, người đang bị truy cứu hình sự hoặc cai nghiện.</li>
                    </ul>
                    <h4 className="text-white font-bold text-lg mt-4 mb-2 border-b border-gray-600 pb-1">Điều 3. Hạn mức đặt cược</h4>
                    <ul className="list-disc pl-5 space-y-1">
                        <li><span className="text-white font-medium">Mức cược tối thiểu:</span> 10.000 VNĐ / lần cược.</li>
                        <li><span className="text-white font-medium">Mức cược tối đa:</span> 1.000.000 VNĐ / người / ngày.</li>
                    </ul>
                    <h4 className="text-white font-bold text-lg mt-4 mb-2 border-b border-gray-600 pb-1">Điều 4. Thời gian nhận cược và Khóa cược</h4>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Hệ thống mở nhận cược không vượt quá 12 giờ trước khi cuộc đua bắt đầu.</li>
                        <li>Hệ thống tự động khóa cổng cược tối thiểu 01 phút trước khi ngựa bắt đầu xuất phát.</li>
                    </ul>
                    <h4 className="text-white font-bold text-lg mt-4 mb-2 border-b border-gray-600 pb-1">Điều 5. Xác định kết quả và Tỷ lệ trả thưởng</h4>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Kết quả trả thưởng được căn cứ vào công bố chính thức của Hội đồng giám sát và Ban Trọng tài.</li>
                        <li>Doanh nghiệp cam kết dành tối thiểu 65% doanh thu bán vé của từng loại hình sản phẩm để cấu thành Quỹ trả thưởng cho người chơi. Thời gian thanh toán tiền thắng cược chậm nhất là 05 ngày làm việc. Vé cược trúng thưởng chỉ có giá trị lĩnh thưởng trong vòng 30 ngày.</li>
                    </ul>
                    <h4 className="text-white font-bold text-lg mt-4 mb-2 border-b border-gray-600 pb-1">Điều 6. Các trường hợp hoàn trả vé cược</h4>
                    <p>Hệ thống sẽ tự động hoàn trả 100% tiền vé cược vào ví người chơi khi:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Cuộc đua bị hủy bỏ, hoặc hoãn chậm hơn 36 giờ so với lịch ban đầu.</li>
                        <li>Ngựa đua mà người chơi đặt cược bị Hội đồng trọng tài loại (Rút lui/Scratching) trước khi cuộc đua bắt đầu.</li>
                        <li>Hội đồng giám sát từ chối xác nhận kết quả cuộc đua.</li>
                    </ul>
                </div>
            );
        } else if (modalConfig.type === 'PRIVACY') {
            return (
                <div className="text-gray-300 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-3">
                    <h4 className="text-white font-bold text-lg mt-2 mb-2 border-b border-gray-600 pb-1">Điều 1. Mục đích thu thập dữ liệu (eKYC)</h4>
                    <p>Để tuân thủ pháp luật, hệ thống bắt buộc thu thập thông tin của bạn (Họ tên, Ngày sinh, CCCD/Hộ chiếu, Số điện thoại, Email, Số tài khoản ngân hàng chính chủ) nhằm mục đích: Định danh khách hàng (KYC), xác minh độ tuổi (&gt;21 tuổi) và thực hiện các giao dịch trả thưởng.</p>

                    <h4 className="text-white font-bold text-lg mt-4 mb-2 border-b border-gray-600 pb-1">Điều 2. Cam kết bảo mật thông tin trúng thưởng</h4>
                    <p>Doanh nghiệp cam kết giữ bí mật tuyệt đối về danh tính và số tiền trúng thưởng của khách hàng. Thông tin này chỉ được cung cấp cho cơ quan quản lý Nhà nước có thẩm quyền khi có yêu cầu phục vụ công tác thanh tra, điều tra theo quy định của pháp luật.</p>

                    <h4 className="text-white font-bold text-lg mt-4 mb-2 border-b border-gray-600 pb-1">Điều 3. Lưu trữ và Mã hóa dữ liệu</h4>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Mọi dữ liệu đặt cược, lịch sử giao dịch nạp/rút tiền, IP đăng nhập được mã hóa và lưu trữ an toàn tối thiểu 05 năm để phục vụ kiểm toán.</li>
                        <li>Hệ thống áp dụng chuẩn mã hóa dữ liệu truyền tải (SSL/TLS), bảo mật chống xâm nhập (IDS/IPS) và mã PIN nhiều lớp để bảo vệ tài khoản ví của bạn khỏi các truy cập trái phép.</li>
                    </ul>

                    <h4 className="text-white font-bold text-lg mt-4 mb-2 border-b border-gray-600 pb-1">Điều 4. Phòng chống rửa tiền và Gian lận</h4>
                    <p>Tài khoản sẽ bị hệ thống tự động gắn cờ cảnh báo (Red Flag) và có thể bị khóa tạm thời nếu phát hiện:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Các giao dịch nạp/rút tiền liên tục mà không phát sinh cược.</li>
                        <li>Sử dụng tài khoản ngân hàng không chính chủ (tên ngân hàng không khớp với tên trên CCCD).</li>
                        <li>Có dấu hiệu can thiệp công nghệ, gian lận làm sai lệch dữ liệu vé cược điện tử.</li>
                    </ul>
                </div>
            );
        } else if (modalConfig.type === 'RULES') {
            return (
                <div className="text-gray-300 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-3">
                    <h4 className="text-white font-bold text-lg mt-2 mb-2 border-b border-gray-600 pb-1">Điều 1. Điều kiện và Tiêu chuẩn Ngựa đua</h4>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Ngựa tham gia đua phải được doanh nghiệp kiểm tra y tế, đã được thuần dưỡng, huấn luyện chạy đua và được cấp mã số nhận dạng (Microchip/ID).</li>
                        <li>Quy trình kiểm tra doping và sức khỏe ngựa trước và sau khi đua.</li>
                    </ul>

                    <h4 className="text-white font-bold text-lg mt-4 mb-2 border-b border-gray-600 pb-1">Điều 2. Điều kiện và Trách nhiệm của Nài ngựa</h4>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Nài ngựa phải có chứng chỉ hành nghề hợp lệ.</li>
                        <li>Nài ngựa tuyệt đối không được cá cược dưới mọi hình thức, không được có quan hệ gia đình với chủ ngựa khác trong cùng chặng đua.</li>
                        <li>Cam kết tuân thủ lệnh của Ban Trọng tài, không thực hiện các hành vi kéo ngựa, nhường đường hay dàn xếp tỷ số.</li>
                    </ul>

                    <h4 className="text-white font-bold text-lg mt-4 mb-2 border-b border-gray-600 pb-1">Điều 3. Quyền hạn của Ban Trọng tài và Hội đồng Giám sát</h4>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Quy định cách xác định ngựa về đích (sử dụng camera vạch đích quang học).</li>
                        <li>Ban Trọng tài có quyền cao nhất trong việc loại bất kỳ ngựa đua/nài ngựa nào vi phạm trước giờ xuất phát.</li>
                        <li>Kết quả do Trọng tài chính phán quyết và được Hội đồng giám sát xác nhận là kết quả chính thức duy nhất để hệ thống phần mềm quyết toán tiền cược.</li>
                    </ul>

                    <h4 className="text-white font-bold text-lg mt-4 mb-2 border-b border-gray-600 pb-1">Điều 4. Phân chia giải thưởng cho Chủ ngựa và Nài ngựa</h4>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Quy định rõ cơ cấu "Quỹ tiền thưởng cuộc đua" (Prize Purse).</li>
                        <li>Tỷ lệ % chia thưởng cụ thể cho Chủ ngựa có ngựa về Nhất, Nhì, Ba và % trích lại cho Nài ngựa theo hợp đồng thi đấu. Tiền thưởng sẽ được hệ thống đối soát và chuyển vào ví quản lý tài chính của Chủ ngựa/Nài ngựa sau khi có kết quả chính thức.</li>
                    </ul>

                    <h4 className="text-white font-bold text-lg mt-4 mb-2 border-b border-gray-600 pb-1">Điều 5. Xử lý vi phạm và Kỷ luật</h4>
                    <p>Liệt kê các chế tài xử phạt đối với Chủ ngựa khai gian lận hồ sơ hoặc Nài ngựa thi đấu không trung thực (phạt tiền, cấm thi đấu có thời hạn hoặc vĩnh viễn).</p>
                </div>
            );
        }
        return null;
    };

    return (
        <ConfigProvider theme={{ algorithm: theme.darkAlgorithm, token: { colorPrimary: '#facc15' } }}>
            <div
                className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
                style={{
                    backgroundImage: `url(${horseBg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                <div className="absolute inset-0 bg-gray-950/75 z-0"></div>

                <div className="z-10 w-full max-w-6xl bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-[0_0_50px_rgba(250,204,21,0.15)] flex overflow-hidden transition-all duration-500 hover:shadow-[0_0_60px_rgba(250,204,21,0.3)]">
                    <Row className="w-full m-0">
                        {/* CỘT TRÁI - DECORATION */}
                        <Col xs={0} lg={8} className="bg-black/40 p-10 flex flex-col items-center justify-center text-center border-r border-white/10">
                            <div className="animate-pulse">
                                <TrophyOutlined className="text-8xl text-yellow-400 mb-6 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]" />
                            </div>
                            <Title level={2} style={{ color: 'white', margin: 0, textTransform: 'uppercase', letterSpacing: '3px' }}>
                                HORSE RACE
                            </Title>
                            <Text className="text-yellow-400 font-medium tracking-widest text-xs uppercase flex items-center justify-center gap-1 mt-2 mb-8">
                                <FireOutlined /> Đẳng Cấp Thượng Lưu <FireOutlined />
                            </Text>
                            <Text className="text-gray-300 text-base mb-8 px-4">
                                Hệ thống cá cược và quản lý giải đua ngựa chuyên nghiệp hàng đầu. Vui lòng điền thông tin chính xác để tuân thủ pháp luật về cá cược.<br /><br />
                            </Text>
                            <div className="w-full px-6">
                                <Text className="text-gray-400">Đã có tài khoản?</Text><br />
                                <Link to="/login">
                                    <Button type="button" className="w-full mt-6 bg-transparent border-2 border-yellow-500 text-yellow-500 font-bold text-base h-12 rounded-xl hover:bg-yellow-500 hover:text-black transition-all duration-300">
                                        ĐĂNG NHẬP NGAY
                                    </Button>
                                </Link>
                            </div>
                        </Col>

                        {/* CỘT PHẢI - FORM */}
                        <Col xs={24} lg={16} className="p-8 h-[85vh] overflow-y-auto custom-scrollbar" id="register-scroll-area">
                            <Title level={3} className="text-center mb-8 text-white uppercase tracking-wider">Mở Tài Khoản Thành Viên</Title>

                            <Form
                                form={form}
                                name="register"
                                layout="vertical"
                                onFinish={handleRegister}
                                scrollToFirstError
                                size="large"
                                initialValues={{ role: 'SPECTATOR' }}
                            >
                                <Row gutter={24}>
                                    {/* THÔNG TIN TÀI KHOẢN & LIÊN HỆ */}
                                    <Col span={12}>
                                        <div className="text-yellow-500 mb-4 font-bold border-b border-gray-600 pb-2">1. THÔNG TIN TÀI KHOẢN</div>

                                        <Form.Item name="username" label={<span className="text-gray-300">Họ và Tên</span>} rules={[{ required: true, message: 'Vui lòng nhập họ và tên thật!' }]}>
                                            <Input autoComplete="name" prefix={<UserOutlined className="text-gray-400" />} placeholder="Nhập tên hiển thị của bạn..." className="bg-black/50 border-gray-600 text-white rounded-xl" />
                                        </Form.Item>

                                        {/* ĐÃ FIX: Xóa cụm nút OTP, giữ lại Input gọn gàng */}
                                        <Form.Item name="email" label={<span className="text-gray-300">Email</span>} rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email!' }]}>
                                            <Input autoComplete="email" prefix={<MailOutlined className="text-gray-400" />} placeholder="khang@gmail.com" className="bg-black/50 border-gray-600 text-white rounded-xl" />
                                        </Form.Item>

                                        <Form.Item name="phoneNumber" label={<span className="text-gray-300">Số điện thoại liên hệ</span>} rules={[{ required: true, message: 'Vui lòng nhập SDT!' }]}>
                                            <Input prefix={<PhoneOutlined className="text-gray-400" />} placeholder="0987654321" className="bg-black/50 border-gray-600 text-white rounded-xl" />
                                        </Form.Item>

                                        <Form.Item name="password" label={<span className="text-gray-300">Mật khẩu</span>} hasFeedback rules={[
                                            { required: true, message: 'Vui lòng nhập mật khẩu!' },
                                            { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' }
                                        ]}>
                                            <Input.Password autoComplete="new-password" prefix={<LockOutlined className="text-gray-400" />} placeholder="••••••••" className="bg-black/50 border-gray-600 text-white rounded-xl" />
                                        </Form.Item>

                                        <Form.Item name="confirmPassword" label={<span className="text-gray-300">Xác nhận mật khẩu</span>} dependencies={['password']} hasFeedback rules={[
                                            { required: true, message: 'Vui lòng xác nhận lại mật khẩu!' },
                                            ({ getFieldValue }) => ({
                                                validator(_, value) {
                                                    if (!value || getFieldValue('password') === value) return Promise.resolve();
                                                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                                },
                                            }),
                                        ]}>
                                            <Input.Password prefix={<SafetyCertificateOutlined className="text-gray-400" />} placeholder="Nhập lại mật khẩu..." className="bg-black/50 border-gray-600 text-white rounded-xl" />
                                        </Form.Item>

                                        <Form.Item name="pinCode" label={<span className="text-gray-300">Thiết lập Mã PIN rút tiền (6 số)</span>} rules={[{ required: true, message: 'Bắt buộc tạo mã PIN để rút tiền!' }, { pattern: /^\d{6}$/, message: 'Mã PIN phải bao gồm đúng 6 chữ số!' }]}>
                                            <Input.Password maxLength={6} placeholder="Ví dụ: 123456" className="bg-black/50 border-gray-600 text-white rounded-xl tracking-widest text-lg" />
                                        </Form.Item>
                                    </Col>

                                    {/* THÔNG TIN PHÁP LÝ & E-KYC */}
                                    <Col span={12}>
                                        <div className="text-yellow-500 mb-4 font-bold border-b border-gray-600 pb-2">2. THÔNG TIN ĐỊNH DANH (eKYC)</div>

                                        <Form.Item name="role" label={<span className="text-gray-300">Tham gia với tư cách</span>} rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}>
                                            <Select popupClassName="bg-gray-800" className="[&>div]:bg-black/50 [&>div]:border-gray-600 [&>div]:rounded-xl [&>div]:text-white">
                                                <Select.Option value="SPECTATOR">Khán giả (Cá cược)</Select.Option>
                                                <Select.Option value="OWNER">Chủ ngựa</Select.Option>
                                                <Select.Option value="JOCKEY">Nài ngựa</Select.Option>
                                                <Select.Option value="REFEREE">Trọng tài</Select.Option>
                                            </Select>
                                        </Form.Item>

                                        <Form.Item name="dob" label={<div className="leading-tight"><span className="text-gray-300">Ngày sinh</span><span className="text-yellow-500 text-xs ml-2 italic">(Tối thiểu {minAge} tuổi)</span></div>} rules={[{ required: true, message: 'Vui lòng chọn ngày sinh!' }]}>
                                            <DatePicker format="DD/MM/YYYY" getPopupContainer={() => document.getElementById('register-scroll-area')} className="w-full bg-black/50 border-gray-600 text-white rounded-xl" disabledDate={disabledDate} prefix={<CalendarOutlined className="text-gray-400" />} />
                                        </Form.Item>

                                        <Form.Item name="idNumber" label={<span className="text-gray-300">Số CCCD / Hộ chiếu</span>} rules={[{ required: true, message: 'Vui lòng nhập số CCCD!' }]}>
                                            <Input prefix={<IdcardOutlined className="text-gray-400" />} placeholder="Nhập số CCCD (12 số)..." className="bg-black/50 border-gray-600 text-white rounded-xl" />
                                        </Form.Item>

                                        <Row gutter={12}>
                                            <Col span={12}>
                                                <Form.Item name="idIssueDate" label={<span className="text-gray-300">Ngày cấp</span>} rules={[{ required: true, message: 'Chọn ngày cấp!' }]}>
                                                    <DatePicker format="DD/MM/YYYY" getPopupContainer={() => document.getElementById('register-scroll-area')} className="w-full bg-black/50 border-gray-600 text-white rounded-xl" disabledDate={disabledDate} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item name="idIssuePlace" label={<span className="text-gray-300">Nơi cấp</span>} rules={[{ required: true, message: 'Nhập nơi cấp!' }]}>
                                                    <Input prefix={<EnvironmentOutlined className="text-gray-400" />} placeholder="Cục CS QLHC..." className="bg-black/50 border-gray-600 text-white rounded-xl" />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Form.Item name="kycFiles" label={<span className="text-gray-300">Tải lên mặt trước và mặt sau CCCD</span>} valuePropName="fileList" getValueFromEvent={normFile} rules={[{ required: true, message: 'Bắt buộc tải lên tài liệu xác minh KYC!' }]}>
                                            <Upload.Dragger 
                                                multiple 
                                                beforeUpload={(file) => {
                                                    const isJpgOrPngOrPdf = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'application/pdf';
                                                    if (!isJpgOrPngOrPdf) {
                                                        message.error('Chỉ hỗ trợ file định dạng JPG/PNG/PDF!');
                                                        return Upload.LIST_IGNORE;
                                                    }
                                                    const isLt5M = file.size / 1024 / 1024 < 5;
                                                    if (!isLt5M) {
                                                        message.error('Dung lượng file tải lên phải nhỏ hơn 5MB!');
                                                        return Upload.LIST_IGNORE;
                                                    }
                                                    return false; // Prevent auto upload
                                                }} 
                                                className="bg-black/50 border-gray-600 text-white rounded-xl"
                                                accept=".jpg,.jpeg,.png,.pdf"
                                            >
                                                <p className="ant-upload-drag-icon"><InboxOutlined className="text-yellow-400" /></p>
                                                <p className="ant-upload-text text-gray-300 text-sm">Kéo thả hoặc Click để tải lên</p>
                                                <p className="ant-upload-hint text-gray-400 text-xs mt-2">Hỗ trợ JPG, PNG, PDF (Tối đa 5MB)</p>
                                            </Upload.Dragger>
                                        </Form.Item>
                                    </Col>
                                </Row>

                                {/* CAM KẾT PHÁP LÝ TỰ ĐỘNG THAY ĐỔI THEO ROLE */}
                                <div className="bg-black/40 p-4 rounded-xl border border-gray-600 mt-2 mb-4">
                                    {/* ĐÃ FIX: Thu hẹp khoảng cách, đưa checkbox lên trước */}
                                    <div className="flex flex-col gap-0">
                                        {(roleCheckboxes[selectedRole || 'SPECTATOR'] || []).map((text, idx) => (
                                            <Form.Item key={idx} name={`agreedRule${idx + 1}`} valuePropName="checked" rules={[{ validator: (_, value) => value ? Promise.resolve() : Promise.reject(new Error('Vui lòng đọc và đánh dấu đồng ý điều khoản này!')) }]} style={{ marginBottom: '12px' }}>
                                                <Checkbox className="text-gray-300 text-[13.5px] leading-snug flex items-start">
                                                    <span className="mt-[-2px]">{text}</span>
                                                </Checkbox>
                                            </Form.Item>
                                        ))}
                                    </div>

                                    {/* ĐÃ FIX: Bọc Checkbox vào thẻ div để margin/padding border hoạt động chuẩn xác */}
                                    <div className="mt-2 border-t border-gray-600 pt-4">
                                        <Checkbox checked={checkAll} onChange={onCheckAllChange} className="text-yellow-400 font-bold w-full">
                                            TÔI ĐÃ ĐỌC HIỂU VÀ ĐỒNG Ý VỚI TẤT CẢ ĐIỀU KHOẢN TRÊN
                                        </Checkbox>
                                    </div>
                                </div>

                                <Form.Item className="mt-6 mb-0">
                                    <Button type="primary" htmlType="submit" loading={loading} block className="h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 border-none text-black font-bold text-lg rounded-xl shadow-[0_4px_15px_rgba(250,204,21,0.5)] hover:scale-105 transition-transform duration-300 mt-2">
                                        {loading ? 'ĐANG XỬ LÝ DỮ LIỆU...' : 'GỬI YÊU CẦU MỞ TÀI KHOẢN'}
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Col>
                    </Row>
                </div>

                {/* MODAL HIỂN THỊ CÁC CHÍNH SÁCH VÀ THỂ LỆ */}
                <Modal
                    title={<span className="text-xl font-bold text-yellow-500 uppercase">
                        {modalConfig.type === 'TERMS' ? '1. THỂ LỆ ĐẶT CƯỢC' :
                            modalConfig.type === 'PRIVACY' ? '2. CHÍNH SÁCH BẢO MẬT' :
                                '3. ĐIỀU LỆ ĐUA'}
                    </span>}
                    open={modalConfig.visible}
                    onCancel={closeModal}
                    footer={null}
                    width={800}
                    centered
                >
                    {renderModalContent()}
                    <div className="mt-6 border-t border-gray-600 pt-4">
                        <p className="text-yellow-500 font-bold text-sm text-center">Các quy định trên được ban hành tuân thủ chặt chẽ theo Nghị định 06/2017/NĐ-CP của Chính phủ về kinh doanh đặt cược đua ngựa, đua chó và bóng đá quốc tế.</p>
                    </div>
                </Modal>

                {/* Style tùy biến Scrollbar trong form cho gọn gàng */}
                <style jsx="true">{`
                    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 10px; }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #facc15; }
                    
                    /* Custom Modal cho giao diện Darkmode */
                    .ant-modal-content {
                        background-color: #1f2937 !important;
                        border: 1px solid #4b5563 !important;
                    }
                    .ant-modal-header {
                        background-color: transparent !important;
                        border-bottom: 1px solid #374151 !important;
                        padding-bottom: 15px !important;
                    }
                    .ant-modal-close-x {
                        color: #9ca3af !important;
                    }
                    .ant-modal-close:hover .ant-modal-close-x {
                        color: #facc15 !important;
                    }
                `}</style>
            </div>
        </ConfigProvider>
    );
};

export default RegisterPage;
