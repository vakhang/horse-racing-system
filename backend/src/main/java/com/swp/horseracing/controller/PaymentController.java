package com.swp.horseracing.controller;

import com.swp.horseracing.dto.DepositRequestDTO;
import com.swp.horseracing.dto.PaymentResponseDTO;
import com.swp.horseracing.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    // API khởi tạo mã QR nhận tiền thanh toán và chốt mã GD
    @PostMapping("/create-qr")
    public ResponseEntity<?> createPaymentQR(@RequestBody DepositRequestDTO request) {
        try {
            PaymentResponseDTO response = paymentService.createDepositQR(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API dành cho Khách hàng tải ảnh minh chứng lên (Sử dụng form-data)
    @PostMapping("/confirm")
    public ResponseEntity<?> confirmPayment(
            @RequestParam("transactionCode") String txCode,
            @RequestParam("file") MultipartFile file) {
        try {
            String result = paymentService.confirmPayment(txCode, file);
            return ResponseEntity.ok(Map.of("message", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}