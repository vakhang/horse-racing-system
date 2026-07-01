package com.swp.horseracing.controller;

import com.swp.horseracing.dto.DepositRequestDTO;
import com.swp.horseracing.dto.PaymentResponseDTO;
import com.swp.horseracing.dto.SePayWebhookRequestDTO;
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

    // API ĐÓN WEBHOOK TỪ SEPAY (TỰ ĐỘNG)
    @PostMapping("/webhook")
    public ResponseEntity<?> handleSePayWebhook(@RequestBody SePayWebhookRequestDTO request) {
        try {
            paymentService.processWebhook(request);
            // SePay yêu cầu trả về chuẩn JSON này để xác nhận đã nhận data thành công
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            // Vẫn trả về 200 OK để SePay không spam gửi lại liên tục nếu đây là lỗi logic nghiệp vụ của ta
            System.err.println("Webhook Processing Error: " + e.getMessage());
            return ResponseEntity.ok(Map.of("success", false, "message", e.getMessage()));
        }
    }
}