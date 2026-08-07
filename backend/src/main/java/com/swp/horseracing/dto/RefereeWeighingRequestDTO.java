package com.swp.horseracing.dto;

import lombok.Data;

@Data
public class RefereeWeighingRequestDTO {
    private Integer registrationId;
    private Double actualWeight;
}
