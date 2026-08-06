package com.swp.horseracing.dto;

import com.swp.horseracing.model.RaceStatus;
import lombok.Data;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Data
    // [Chức năng rõ ràng]: Lớp DTO nhận Request Tạo/Sửa Chặng đua
    // [Tác dụng]: Hứng dữ liệu từ Admin khi tạo chặng đua mới (khoảng cách, thời gian bắt đầu, tên chặng).
    // [Hướng dẫn sửa đổi]:
    // - Data: Thêm các điều kiện về thời tiết, loại đường chạy nếu có.
public class RaceRequestDTO {
    private Integer tournamentId;
    private String name;
    private LocalDateTime raceTime;
    private RaceStatus status;
    private Integer refereeId;
    private BigDecimal prize1;
    private BigDecimal prize2;
    private BigDecimal prize3;
    private BigDecimal rakePercentage;
    private Integer raceClass;
}