package com.swp.horseracing.dto;

import com.swp.horseracing.model.RaceStatus;
import lombok.Data;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Data
public class RaceRequestDTO {
    private Integer tournamentId;
    private String name;
    private LocalDateTime raceTime;
    private RaceStatus status;
    private Integer refereeId;
    private BigDecimal prize1;
    private BigDecimal prize2;
    private BigDecimal prize3;
}