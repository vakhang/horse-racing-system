package com.swp.horseracing.dto;

import com.swp.horseracing.model.BetStatus;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
    // [Chức năng rõ ràng]: Lớp DTO trả về Lịch sử cược
    // [Tác dụng]: Đóng gói thông tin vé cược của người dùng (tên ngựa, số tiền, trạng thái thắng/thua) để gửi về Frontend hiển thị ở trang Lịch sử.
    // [Hướng dẫn sửa đổi]:
    // - Data: Thêm thuộc tính vào class này nếu muốn Frontend hiển thị thêm dữ liệu (ví dụ: ngày giờ cược).
public class BetHistoryResponseDTO {
    private Integer id;
    private String raceName;
    private String horseName;
    private BigDecimal amount;
    private BigDecimal expectedOdds;
    private BigDecimal rewardAmount;
    private BetStatus status;
    private LocalDateTime createdAt;
}
