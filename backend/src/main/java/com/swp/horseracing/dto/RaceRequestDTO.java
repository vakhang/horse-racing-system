package com.swp.horseracing.dto;

import com.swp.horseracing.model.RaceStatus;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class RaceRequestDTO {
    private Integer tournamentId; // Bắt buộc phải có
    private String name;
    private LocalDateTime raceTime;
    private RaceStatus status;
}