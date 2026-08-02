package com.swp.horseracing.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
    // [Chức năng rõ ràng]: Lớp DTO nhận Request Nạp Tiền
    // [Tác dụng]: Hứng dữ liệu từ Frontend khi người dùng yêu cầu tạo mã QR nạp tiền hoặc nạp tiền ảo (chứa số tiền cần nạp).
    // [Hướng dẫn sửa đổi]:
    // - Data: Cần sửa ở đây nếu Frontend gửi thêm thông tin cổng thanh toán.
public class DepositRequestDTO {
    private Integer userId; // Để Demo giả định lấy tài khoản người dùng
    private BigDecimal amount;
}