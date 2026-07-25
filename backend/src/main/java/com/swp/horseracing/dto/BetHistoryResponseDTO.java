package com.swp.horseracing.dto;

import com.swp.horseracing.model.BetStatus;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class BetHistoryResponseDTO {
    private Integer id;
    private String raceName;
    private String horseName;
    private BigDecimal amount;
    private BigDecimal expectedOdds;
    private BigDecimal rewardAmount;
    private BetStatus status;
    private LocalDateTime createdAt;
}
