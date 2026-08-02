package com.swp.horseracing.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
    // [Chức năng rõ ràng]: Lớp DTO trả về Tỷ lệ cược Trực tiếp
    // [Tác dụng]: Chứa thông tin danh sách ngựa đang chạy và tổng số tiền cược đặt vào mỗi con, giúp Frontend tính được tỷ lệ thưởng (Odds).
    // [Hướng dẫn sửa đổi]:
    // - Data: Có thể thêm thuật toán tự tính Odds ngay trên Backend thay vì để Frontend tính.
public class LiveOddsResponseDTO {
    private Integer registrationId;
    private String horseName;
    private BigDecimal totalBetOnHorse; // Tổng tiền cược riêng cho con ngựa này
    private BigDecimal calculatedOdds;   // Tỷ lệ cược dự kiến (Real-time) trả về cho FE
    private String status;
    private String note;
}