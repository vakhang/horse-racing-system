package com.swp.horseracing.dto;

import com.swp.horseracing.model.RaceStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Data
@Builder
    // [Chức năng rõ ràng]: Lớp DTO trả về Thông tin Chặng đua
    // [Tác dụng]: Đóng gói dữ liệu của một chặng đua để hiển thị lịch thi đấu trên Frontend.
    // [Hướng dẫn sửa đổi]:
    // - Data: Thêm trường nếu cần trả về số lượng ngựa đã đăng ký vào chặng này.
public class RaceResponseDTO {
    private Integer id;
    private Integer tournamentId;
    private String tournamentName;
    private com.swp.horseracing.model.TournamentStatus tournamentStatus;
    private String name;
    private LocalDateTime raceTime;
    private RaceStatus status;
    private Integer refereeId;
    private String refereeUsername;
    private BigDecimal prize1;
    private BigDecimal prize2;
    private BigDecimal prize3;
    private BigDecimal rakePercentage;
    private BigDecimal totalPool;
    private Integer raceClass;
    private Integer requiredClass;
}