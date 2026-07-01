package com.swp.horseracing.service;

import com.swp.horseracing.dto.DepositRequestDTO;
import com.swp.horseracing.dto.PaymentResponseDTO;
import com.swp.horseracing.dto.SePayWebhookRequestDTO;

public interface PaymentService {
    PaymentResponseDTO createDepositQR(DepositRequestDTO request);

    // Đã thay thế hàm confirmPayment thủ công bằng hàm xử lý tự động
    String processWebhook(SePayWebhookRequestDTO request);
}