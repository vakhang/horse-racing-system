package com.swp.horseracing.dto;

import lombok.Data;

@Data
public class RefereeResultRequestDTO {
    private Integer raceId;
    private Integer top1RegistrationId; // ID của ngựa/nài đạt top 1
    private Integer top2RegistrationId; // ID của ngựa/nài đạt top 2
    private Integer top3RegistrationId; // ID của ngựa/nài đạt top 3
    private Integer refereeId;
}
