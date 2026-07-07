package com.swp.horseracing.service;

import com.swp.horseracing.dto.DepositRequestDTO;
import com.swp.horseracing.dto.PaymentResponseDTO;

public interface PaymentService {
    PaymentResponseDTO createDepositQR(DepositRequestDTO request);
}