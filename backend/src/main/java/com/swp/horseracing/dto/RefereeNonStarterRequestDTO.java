package com.swp.horseracing.dto;

import lombok.Data;

@Data
public class RefereeNonStarterRequestDTO {
    private Integer raceId;
    private Integer registrationId;
    private Integer refereeId;
}
