package com.swp.horseracing.dto;

import lombok.Data;

@Data
public class RefereeReportRequestDTO {
    private Integer raceId;
    private Integer refereeId;
    private Integer violatorId;
    private String description;
}
