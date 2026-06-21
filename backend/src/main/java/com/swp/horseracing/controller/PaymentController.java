package com.swp.horseracing.controller;

import com.swp.horseracing.dto.DepositRequestDTO;
import com.swp.horseracing.dto.PaymentResponseDTO;
import com.swp.horseracing.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    // API khởi tạo mã QR nhận tiền thanh toán
    @PostMapping("/create-qr")
    public ResponseEntity<?> createPaymentQR(@RequestBody DepositRequestDTO request) {
        try {
            PaymentResponseDTO response = paymentService.createDepositQR(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API dành cho Khách hàng bấm "Xác nhận đã chuyển" để đẩy minh chứng hóa đơn lên hệ thống
    @PostMapping("/confirm")
    public ResponseEntity<?> confirmPayment(@RequestBody Map<String, String> requestBody) {
        try {
            String txCode = requestBody.get("transactionCode");
            String proofUrl = requestBody.get("proofUrl");
            String result = paymentService.confirmPayment(txCode, proofUrl);
            return ResponseEntity.ok(Map.of("message", result));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}