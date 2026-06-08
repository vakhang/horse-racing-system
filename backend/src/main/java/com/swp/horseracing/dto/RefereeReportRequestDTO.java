package com.swp.horseracing.dto;

import lombok.Data;

@Data
public class RefereeReportRequestDTO {
    private Integer raceId;
    private Integer refereeId;
    private Integer registrationId; // Đổi từ violatorId
    private String violationDetails; // Đổi từ description
}