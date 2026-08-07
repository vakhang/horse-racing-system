package com.swp.horseracing.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class LiveOddsResponseDTO {
    private Integer registrationId;
    private String horseName;
    private BigDecimal totalBetOnHorse; // Total WIN bet on this horse
    private BigDecimal calculatedOdds;   // WIN Odds

    private BigDecimal totalPlaceBetOnHorse; // Total PLACE bet on this horse
    private BigDecimal placeOdds;             // PLACE Odds (32.5% pool)

    private String status;
    private String note;
    private Integer gateNumber;
    private Integer classLevel;
    private Integer rating;

    private Double assignedWeight;
    private Double actualWeight;
    private Double leadWeight;
    private Boolean isWeighedIn;
}