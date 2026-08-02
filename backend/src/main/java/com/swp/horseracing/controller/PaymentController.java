package com.swp.horseracing.controller;

import com.swp.horseracing.dto.DepositRequestDTO;
import com.swp.horseracing.dto.PaymentResponseDTO;
import com.swp.horseracing.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    // [Chức năng rõ ràng]: API Tạo mã QR Nạp tiền
    // [Tác dụng]: Nhận request từ User muốn nạp tiền, gọi sang VietQR để tạo link ảnh QR Code hiển thị lên màn hình.
    // [Hướng dẫn sửa đổi]:
    // - Logic/Data: Nếu đổi nhà cung cấp (VD: Momo thay vì VietQR), thì không sửa ở đây mà sửa logic bên trong hàm `paymentService.createDepositQR()`.
    @PostMapping("/create-qr")
    public ResponseEntity<?> createPaymentQR(@RequestBody DepositRequestDTO request) {
        try {
            PaymentResponseDTO response = paymentService.createDepositQR(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }
}