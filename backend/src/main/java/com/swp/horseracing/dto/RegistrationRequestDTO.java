package com.swp.horseracing.dto;

import com.swp.horseracing.model.RegistrationStatus;
import lombok.Data;

@Data
public class RegistrationRequestDTO {
    private Integer raceId;
    private Integer horseId;
    private Integer ownerId;
    private Integer jockeyId; // Có thể null lúc mới tạ
    private RegistrationStatus status;
    private String note;
}