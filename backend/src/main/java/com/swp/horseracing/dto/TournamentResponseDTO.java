package com.swp.horseracing.dto;

import com.swp.horseracing.model.TournamentStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
    // [Chức năng rõ ràng]: Lớp DTO trả về Thông tin Giải đấu
    // [Tác dụng]: Trả về danh sách các giải đấu kèm tổng số chặng đua, để hiển thị ở Trang chủ.
    // [Hướng dẫn sửa đổi]:
    // - Data: Thêm tổng số tiền thưởng giải đấu (Prize Pool).
public class TournamentResponseDTO {
    private Integer id;
    private String name;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private TournamentStatus status;
    private String reason;
}