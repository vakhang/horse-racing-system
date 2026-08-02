package com.swp.horseracing.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
    // [Chức năng rõ ràng]: Lớp DTO trả về Thông tin Thanh toán
    // [Tác dụng]: Trả về URL ảnh mã QR và mã giao dịch để Frontend hiển thị màn hình quét QR nạp tiền.
    // [Hướng dẫn sửa đổi]:
    // - Data: Nếu đổi nhà cung cấp QR, có thể cần đổi thuộc tính `qrUrl`.
public class PaymentResponseDTO {
    private String transactionCode;
    private BigDecimal amount;
    private String bankId;
    private String accountNo;
    private String accountName;
    private String qrUrl;
    private String note; // Nội dung chuyển khoản bắt buộc
}