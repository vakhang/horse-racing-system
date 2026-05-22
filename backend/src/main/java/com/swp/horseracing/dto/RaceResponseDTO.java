package com.swp.horseracing.dto;

import com.swp.horseracing.model.RaceStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class RaceResponseDTO {
    private Integer id;
    private Integer tournamentId;
    private String tournamentName; // Tiện cho Frontend in ra màn hình
    private String name;
    private LocalDateTime raceTime;
    private RaceStatus status;
}