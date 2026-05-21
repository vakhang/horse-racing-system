package com.swp.horseracing.dto;

import com.swp.horseracing.model.TournamentStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class TournamentResponseDTO {
    private Integer id;
    private String name;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private TournamentStatus status;
}