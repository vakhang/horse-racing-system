package com.swp.horseracing.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class BetRequestDTO {
    private Integer userId;
    private Integer raceId;
    private Integer registrationId;
    private BigDecimal amount;
}