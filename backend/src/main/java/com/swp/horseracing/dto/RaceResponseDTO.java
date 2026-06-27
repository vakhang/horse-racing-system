package com.swp.horseracing.dto;

import com.swp.horseracing.model.RaceStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Data
@Builder
public class RaceResponseDTO {
    private Integer id;
    private Integer tournamentId;
    private String tournamentName;
    private String name;
    private LocalDateTime raceTime;
    private RaceStatus status;
    private Integer refereeId;
    private String refereeUsername;
    private BigDecimal prize1;
    private BigDecimal prize2;
    private BigDecimal prize3;
}