package com.swp.horseracing.dto;

import com.swp.horseracing.model.RegistrationStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RegistrationResponseDTO {
    private Integer id;
    private Integer raceId;
    private String raceName;
    private Integer horseId;
    private String horseName;
    private Integer ownerId;
    private String ownerUsername;
    private Integer jockeyId;
    private String jockeyUsername;
    private RegistrationStatus status;
    private String note;
    private Integer finishPosition;
    private Integer gateNumber;

    private Double assignedWeight;
    private Double actualWeight;
    private Double leadWeight;
    private Boolean isWeighedIn;
    private Double jockeyWeight;
}