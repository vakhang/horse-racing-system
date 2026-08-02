package com.swp.horseracing.dto;

import com.swp.horseracing.model.TransactionDirection;
import com.swp.horseracing.model.TransactionStatus;
import com.swp.horseracing.model.TransactionType;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
    // [Chức năng rõ ràng]: Lớp DTO trả về Lịch sử Giao dịch
    // [Tác dụng]: Chứa chi tiết biến động số dư (nạp, rút, cược, trúng thưởng) để hiển thị trong Ví người dùng.
    // [Hướng dẫn sửa đổi]:
    // - Data: Thêm màu sắc hoặc icon tương ứng theo `type` ở Frontend, backend có thể hỗ trợ trả thêm thuộc tính `color`.
public class TransactionHistoryResponseDTO {
    private Integer id;
    private String transactionCode;
    private BigDecimal amount;
    private TransactionType type;
    private TransactionDirection direction;
    private TransactionStatus status;
    private String proofUrl;
    private String bankName;
    private String accountNumber;
    private String accountName;
    private LocalDateTime createdAt;
}