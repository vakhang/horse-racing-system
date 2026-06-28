package com.swp.horseracing.service;

import com.swp.horseracing.dto.DepositRequestDTO;
import com.swp.horseracing.dto.PaymentResponseDTO;
import org.springframework.web.multipart.MultipartFile;

public interface PaymentService {
    PaymentResponseDTO createDepositQR(DepositRequestDTO request);
    String confirmPayment(String transactionCode, MultipartFile file) throws java.io.IOException;
}