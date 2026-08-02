package com.swp.horseracing.service;

import com.swp.horseracing.dto.DepositRequestDTO;
import com.swp.horseracing.dto.PaymentResponseDTO;

    // [Chức năng rõ ràng]: Interface Service Thanh toán
    // [Tác dụng]: Định nghĩa hàm tạo mã QR nạp tiền (VietQR).
    // [Hướng dẫn sửa đổi]:
    // - Logic: Thêm hàm tạo Request gửi sang VNPay/Momo.
public interface PaymentService {
    PaymentResponseDTO createDepositQR(DepositRequestDTO request);
}