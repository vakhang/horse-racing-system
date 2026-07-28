import React from 'react';
import { Typography, Row, Col, Button, Card } from 'antd';
import { 
    SafetyCertificateOutlined, 
    GlobalOutlined, 
    BankOutlined,
    LoginOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/layout/Footer';
import horseRacingImg from '../assets/horseracing.png';
import PublicHeader from '../components/layout/PublicHeader';

const { Title, Text } = Typography;

const CorporateLandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#001529] font-sans flex flex-col">
            {/* HEADER / NAVIGATION BAR */}
            <PublicHeader />

            {/* PHáº¦N 1: HERO BANNER */}
            <div className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden pt-20">
                <div 
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-30"
                    style={{ backgroundImage: 'url(https://vinhomesvuyenhaiphong.com/uploads/024267aa-4d55-4979-8254-99201ce68083.jpeg)' }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-b from-[#001529]/95 via-[#001529]/60 to-[#001529] z-10"></div>
                
                <div className="z-20 text-center px-4 max-w-5xl mx-auto">
                    <Title level={1} className="text-5xl md:text-7xl font-black tracking-widest uppercase mb-4" style={{ color: '#facc15', WebkitTextStroke: '2px #facc15', textShadow: '0 0 15px rgba(250,204,21,0.6), 0 0 30px rgba(250,204,21,0.4), 0 4px 10px rgba(0,0,0,0.8)' }}>
                        ÄUA NGá»°A VIá»†T NAM
                    </Title>
                    <Title level={3} className="text-2xl md:text-3xl text-white uppercase tracking-widest font-black mb-6" style={{ color: 'white', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                        Äá»‰nh Cao Tá»‘c Äá»™ - Minh Báº¡ch Giao Dá»‹ch - TuĂ¢n Thá»§ PhĂ¡p Luáº­t
                    </Title>
                    <Text className="text-white text-xl md:text-2xl block mb-12 max-w-3xl mx-auto leading-relaxed font-semibold" style={{ color: 'white', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                        Ná»n táº£ng quáº£n trá»‹ vĂ  váº­n hĂ nh giáº£i trĂ­ cĂ³ thÆ°á»Ÿng uy tĂ­n hĂ ng Ä‘áº§u, Ä‘Æ°á»£c cáº¥p phĂ©p vĂ  chá»‹u sá»± giĂ¡m sĂ¡t cháº·t cháº½ cá»§a cĂ¡c cÆ¡ quan quáº£n lĂ½ NhĂ  nÆ°á»›c.
                    </Text>
                    
                    <Button 
                        type="primary"
                        size="large"
                        style={{ background: 'linear-gradient(to right, #eab308, #facc15)', color: 'black', border: 'none' }}
                        className="h-16 px-12 text-xl hover:scale-105 transition-transform shadow-[0_0_30px_rgba(234,179,8,0.5)] rounded-full mt-4"
                        onClick={() => navigate('/login')}
                    >
                        <span style={{ fontWeight: 900 }}>ÄÄ‚NG NHáº¬P NGAY</span>
                    </Button>
                </div>
            </div>

            {/* PHáº¦N 2: GIá»I THIá»†U DOANH NGHIá»†P & TĂNH PHĂP LĂ */}
            <div className="py-24 px-6 lg:px-20 bg-[#001529]">
                <div className="max-w-6xl mx-auto">
                    <Row gutter={[48, 48]} align="middle">
                        <Col xs={24} lg={12}>
                            <Title level={2} className="text-4xl font-black border-l-4 border-yellow-500 pl-4 mb-6 text-white" style={{ color: 'white' }}>
                                Vá» ChĂºng TĂ´i
                            </Title>
                            <Text className="text-white text-lg font-medium leading-relaxed block mb-4 text-justify" style={{ color: 'white' }}>
                                Tá»• chá»©c Äua ngá»±a KKAN lĂ  má»™t dá»± Ă¡n nghiĂªn cá»©u vĂ  phĂ¡t triá»ƒn cĂ´ng nghá»‡ (R&D) do nhĂ³m sinh viĂªn Äáº¡i há»c FPT phĂ¡t triá»ƒn. Há»‡ thá»‘ng cá»§a chĂºng tĂ´i hoáº¡t Ä‘á»™ng dÆ°á»›i dáº¡ng MĂ´i trÆ°á»ng thá»­ nghiá»‡m khĂ©p kĂ­n, mĂ´ phá»ng "Pháº§n má»m dĂ nh cho doanh nghiá»‡p kinh doanh Ä‘áº·t cÆ°á»£c Ä‘ua ngá»±a".
                            </Text>
                            <Text className="text-white text-lg font-medium leading-relaxed block text-justify" style={{ color: 'white' }}>
                                ToĂ n bá»™ hoáº¡t Ä‘á»™ng Ä‘áº·t cÆ°á»£c vĂ  dĂ²ng tiá»n trĂªn há»‡ thá»‘ng Ä‘á»u sá»­ dá»¥ng dá»¯ liá»‡u giáº£ Ä‘á»‹nh (Virtual Currency) nháº±m má»¥c Ä‘Ă­ch há»c thuáº­t. Dá»± Ă¡n Ä‘Æ°á»£c thiáº¿t káº¿ Ä‘á»ƒ chá»©ng minh nÄƒng lá»±c xá»­ lĂ½ há»‡ thá»‘ng tĂ i chĂ­nh phá»©c táº¡p, Ä‘á»“ng thá»i tuĂ¢n thá»§ nghiĂªm ngáº·t cĂ¡c tiĂªu chuáº©n ká»¹ thuáº­t theo Nghá»‹ Ä‘á»‹nh 06/2017/NÄ-CP.
                            </Text>
                        </Col>
                        <Col xs={24} lg={12}>
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-700 h-[400px]">
                                <img src={horseRacingImg} alt="TrÆ°á»ng Ä‘ua" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/30"></div>
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>

            {/* PHáº¦N 3: Ná»€N Táº¢NG CĂ”NG NGHá»† & Sá»° MINH Báº CH */}
            <div className="py-24 px-6 lg:px-20 bg-gradient-to-b from-[#001529] to-[#000a14]">
                <div className="max-w-6xl mx-auto">
                    <Title level={2} className="text-3xl font-bold text-center mb-16 text-white uppercase tracking-wider" style={{ color: 'white' }}>
                        Ná»n Táº£ng CĂ´ng Nghá»‡ Hiá»‡n Äáº¡i
                    </Title>
                    
                    <Row gutter={[32, 32]}>
                        <Col xs={24} md={8}>
                            <Card className="h-full bg-white border border-gray-200 rounded-2xl hover:shadow-xl transition-shadow shadow-md">
                                <div className="text-center mb-6">
                                    <SafetyCertificateOutlined className="text-6xl text-[#001529]" />
                                </div>
                                <Title level={4} className="text-center font-black mb-4" style={{ color: '#001529' }}>Báº£o Máº­t Tuyá»‡t Äá»‘i</Title>
                                <Text className="text-gray-700 text-base text-justify block font-medium">
                                    Há»‡ thá»‘ng cĂ´ng nghá»‡, thiáº¿t bá»‹ ká»¹ thuáº­t vĂ  pháº§n má»m kinh doanh Ä‘Æ°á»£c Ä‘áº§u tÆ° Ä‘á»“ng bá»™. Dá»¯ liá»‡u tham gia Ä‘áº·t cÆ°á»£c Ä‘Æ°á»£c mĂ£ hĂ³a vĂ  sao lÆ°u trĂªn mĂ¡y chá»§ dá»± phĂ²ng, nghiĂªm cáº¥m má»i can thiá»‡p.
                                </Text>
                            </Card>
                        </Col>
                        <Col xs={24} md={8}>
                            <Card className="h-full bg-white border border-gray-200 rounded-2xl hover:shadow-xl transition-shadow shadow-md">
                                <div className="text-center mb-6">
                                    <GlobalOutlined className="text-6xl text-[#001529]" />
                                </div>
                                <Title level={4} className="text-center font-black mb-4" style={{ color: '#001529' }}>Káº¿t Quáº£ Minh Báº¡ch</Title>
                                <Text className="text-gray-700 text-base text-justify block font-medium">
                                    Má»i káº¿t quáº£ sá»± kiá»‡n Ä‘ua ngá»±a Ä‘á»u Ä‘Æ°á»£c quyáº¿t Ä‘á»‹nh bá»Ÿi Ban Trá»ng tĂ i chuyĂªn nghiá»‡p vĂ  xĂ¡c nháº­n Ä‘á»™c láº­p bá»Ÿi Há»™i Ä‘á»“ng giĂ¡m sĂ¡t cuá»™c Ä‘ua, loáº¡i bá» hoĂ n toĂ n yáº¿u tá»‘ gian láº­n.
                                </Text>
                            </Card>
                        </Col>
                        <Col xs={24} md={8}>
                            <Card className="h-full bg-white border border-gray-200 rounded-2xl hover:shadow-xl transition-shadow shadow-md">
                                <div className="text-center mb-6">
                                    <BankOutlined className="text-6xl text-[#001529]" />
                                </div>
                                <Title level={4} className="text-center font-black mb-4" style={{ color: '#001529' }}>Giao Dá»‹ch Há»£p PhĂ¡p</Title>
                                <Text className="text-gray-700 text-base text-justify block font-medium">
                                    Má»i giao dá»‹ch náº¡p, tráº£ thÆ°á»Ÿng Ä‘á»u Ä‘Æ°á»£c thá»±c hiá»‡n minh báº¡ch báº±ng Viá»‡t Nam Äá»“ng (VNÄ) thĂ´ng qua há»‡ thá»‘ng tĂ i khoáº£n táº¡i cĂ¡c tá»• chá»©c tĂ­n dá»¥ng há»£p phĂ¡p á»Ÿ Viá»‡t Nam.
                                </Text>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>

            {/* PHáº¦N 5: TIN Tá»¨C & THĂ”NG BĂO */}
            <div className="py-24 px-6 lg:px-20 bg-[#000a14]">
                <div className="max-w-4xl mx-auto">
                    <Title level={2} className="text-3xl font-bold border-l-4 border-blue-500 pl-4 mb-10 text-white" style={{ color: 'white' }}>
                        Tin Tá»©c & ThĂ´ng BĂ¡o PhĂ¡p LĂ½
                    </Title>
                    <div className="space-y-6">
                        <div onClick={() => navigate('/news')} className="bg-white/5 p-8 rounded-xl border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-white/10 transition-colors cursor-pointer">
                            <div>
                                <span className="border border-red-400 text-red-400 bg-transparent text-xs font-bold px-3 py-1 rounded-full mr-3">THĂ”NG BĂO</span>
                                <Text className="text-white text-lg hover:text-yellow-400 font-semibold" style={{ color: 'white' }}>Cáº­p nháº­t Thá»ƒ lá»‡ Ä‘áº·t cÆ°á»£c vĂ  Äiá»u lá»‡ Ä‘ua mĂ¹a giáº£i MĂ¹a HĂ¨ 2026</Text>
                            </div>
                            <Text className="text-white font-bold mt-2 md:mt-0 whitespace-nowrap" style={{ color: 'white' }}>27/07/2026</Text>
                        </div>
                        <div onClick={() => navigate('/news')} className="bg-white/5 p-8 rounded-xl border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-white/10 transition-colors cursor-pointer">
                            <div>
                                <span className="border border-blue-400 text-blue-400 bg-transparent text-xs font-bold px-3 py-1 rounded-full mr-3">Há»† THá»NG</span>
                                <Text className="text-white text-lg hover:text-yellow-400 font-semibold" style={{ color: 'white' }}>Lá»‹ch báº£o trĂ¬ há»‡ thá»‘ng mĂ¡y chá»§ Ä‘á»‹nh ká»³ thĂ¡ng 8</Text>
                            </div>
                            <Text className="text-white font-bold mt-2 md:mt-0 whitespace-nowrap" style={{ color: 'white' }}>25/07/2026</Text>
                        </div>
                        <div onClick={() => navigate('/news')} className="bg-white/5 p-8 rounded-xl border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-white/10 transition-colors cursor-pointer">
                            <div>
                                <span className="border border-green-400 text-green-400 bg-transparent text-xs font-bold px-3 py-1 rounded-full mr-3">TIN Tá»¨C</span>
                                <Text className="text-white text-lg hover:text-yellow-400 font-semibold" style={{ color: 'white' }}>CĂ´ng bá»‘ danh sĂ¡ch Chiáº¿n mĂ£ vĂ  NĂ i ngá»±a xuáº¥t sáº¯c nháº¥t thĂ¡ng qua</Text>
                            </div>
                            <Text className="text-white font-bold mt-2 md:mt-0 whitespace-nowrap" style={{ color: 'white' }}>20/07/2026</Text>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default CorporateLandingPage;

