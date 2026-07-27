import React, { useState, useEffect } from 'react';
import { Typography, Card, Empty, Button, Tag, Modal, Table, InputNumber, message, Spin } from 'antd';
import { RocketOutlined, DollarOutlined, LineChartOutlined } from '@ant-design/icons';
import axios from 'axios';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

const BettingPage = () => {
    const { user } = useAuth();
    const token = user?.token || localStorage.getItem('token');

    const [races, setRaces] = useState([]);
    const [loadingRaces, setLoadingRaces] = useState(true);

    // State cho Modal Đặt Cược
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedRace, setSelectedRace] = useState(null);
                                type="primary"
                                size="large"
                                className="bg-yellow-500 text-black font-bold w-40 border-none hover:bg-yellow-400 hover:scale-105 transition-all"
                                onClick={handlePlaceBet}
                                loading={submittingBet}
                                icon={<DollarOutlined />}
                            >
                                CHỐT KÈO
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default BettingPage;