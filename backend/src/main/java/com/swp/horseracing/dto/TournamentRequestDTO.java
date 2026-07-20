package com.swp.horseracing.dto;

import com.swp.horseracing.model.TournamentStatus;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TournamentRequestDTO {
    private String name;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private TournamentStatus status;
    private String reason; // Phục vụ lưu Nhật ký khi Hủy/Hoãn
}