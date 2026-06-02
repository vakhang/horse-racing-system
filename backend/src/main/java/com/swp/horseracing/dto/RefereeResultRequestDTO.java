package com.swp.horseracing.dto;

import lombok.Data;

@Data
public class RefereeResultRequestDTO {
    private Integer raceId;
    private Integer top1RegistrationId; // ID của ngựa/nài đạt top 1
}
