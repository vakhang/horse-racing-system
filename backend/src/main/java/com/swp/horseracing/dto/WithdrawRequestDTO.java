package com.swp.horseracing.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
    // [Chức năng rõ ràng]: Lớp DTO nhận Request Rút tiền
    // [Tác dụng]: Hứng yêu cầu rút tiền của User (kèm theo số tiền, tên ngân hàng, số tài khoản).
    // [Hướng dẫn sửa đổi]:
    // - Data: Thêm mã PIN bảo mật cấp 2 để xác thực giao dịch rút tiền nếu cần thiết.
public class WithdrawRequestDTO {
    private Integer userId;
    private BigDecimal amount;
    private String bankName;
    private String accountNumber;
    private String accountName;
}